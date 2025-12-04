const fs = require('fs').promises;
const path = require('path');

class DataAggregatorService {
  constructor() {
    this.summaryData = {
      totalProcesses: 0,
      courtTypeSummary: {},
      courtSummary: {},
      processTypes: {},
      statusSummary: {},
      dateRange: { earliest: null, latest: null }
    };
  }

  /**
   * Aggregates and analyzes search results
   */
  aggregateResults(searchResults) {
    this.summaryData = {
      totalProcesses: 0,
      courtTypeSummary: {},
      courtSummary: {},
      processTypes: {},
      statusSummary: {},
      dateRange: { earliest: null, latest: null },
      processDetails: []
    };

    searchResults.results.forEach(courtResult => {
      // Court type summary
      if (!this.summaryData.courtTypeSummary[courtResult.courtType]) {
        this.summaryData.courtTypeSummary[courtResult.courtType] = {
          count: 0,
          courts: []
        };
      }
      this.summaryData.courtTypeSummary[courtResult.courtType].count += courtResult.processCount;
      this.summaryData.courtTypeSummary[courtResult.courtType].courts.push({
        code: courtResult.court,
        name: courtResult.courtName,
        processCount: courtResult.processCount
      });

      // Court summary
      this.summaryData.courtSummary[courtResult.court] = {
        name: courtResult.courtName,
        type: courtResult.courtType,
        processCount: courtResult.processCount
      };

      // Process details analysis
      courtResult.processes.forEach(process => {
        this.summaryData.totalProcesses++;
        
        // Extract process details
        const processDetails = this.extractProcessDetails(process, courtResult);
        this.summaryData.processDetails.push(processDetails);

        // Process types
        const processType = this.getProcessType(process);
        this.summaryData.processTypes[processType] = 
          (this.summaryData.processTypes[processType] || 0) + 1;

        // Status summary
        const status = this.getProcessStatus(process);
        this.summaryData.statusSummary[status] = 
          (this.summaryData.statusSummary[status] || 0) + 1;

        // Date range
        const date = this.getProcessDate(process);
        if (date) {
          if (!this.summaryData.dateRange.earliest || date < this.summaryData.dateRange.earliest) {
            this.summaryData.dateRange.earliest = date;
          }
          if (!this.summaryData.dateRange.latest || date > this.summaryData.dateRange.latest) {
            this.summaryData.dateRange.latest = date;
          }
        }
      });
    });

    return this.summaryData;
  }

  /**
   * Extracts detailed information from a process
   */
  extractProcessDetails(process, courtResult) {
    const dados = process.dadosBasicos || {};
    
    return {
      processNumber: dados.numeroProcesso || 'N/A',
      court: courtResult.courtName,
      courtType: courtResult.courtType,
      distributionDate: dados.dataDistribuicao || 'N/A',
      processType: this.getProcessType(process),
      status: this.getProcessStatus(process),
      subject: this.getProcessSubject(process),
      parties: this.getProcessParties(process),
      movements: this.getLatestMovements(process),
      score: process.score || 0
    };
  }

  /**
   * Determines process type from the data
   */
  getProcessType(process) {
    const dados = process.dadosBasicos || {};
    const assunto = dados.assunto || [];
    
    if (assunto.length > 0) {
      return assunto[0].nome || 'Não especificado';
    }
    
    const classe = dados.classe || {};
    return classe.nome || 'Não especificado';
  }

  /**
   * Determines process status
   */
  getProcessStatus(process) {
    const movimentos = process.movimentosNacionais || [];
    if (movimentos.length > 0) {
      const lastMovement = movimentos[movimentos.length - 1];
      return lastMovement.nome || 'Em andamento';
    }
    return 'Status não disponível';
  }

  /**
   * Gets process subject/topic
   */
  getProcessSubject(process) {
    const dados = process.dadosBasicos || {};
    const assunto = dados.assunto || [];
    
    return assunto.map(a => a.nome).join('; ') || 'Assunto não especificado';
  }

  /**
   * Extracts process parties information
   */
  getProcessParties(process) {
    const dados = process.dadosBasicos || {};
    const polo = dados.polo || [];
    
    return polo.map(p => ({
      type: p.polo || 'N/A',
      name: p.pessoa?.nome || 'N/A',
      document: p.pessoa?.documento || 'N/A'
    }));
  }

  /**
   * Gets latest process movements
   */
  getLatestMovements(process) {
    const movimentos = process.movimentosNacionais || [];
    return movimentos.slice(-3).map(m => ({
      date: m.dataHora || 'N/A',
      description: m.nome || 'N/A'
    }));
  }

  /**
   * Extracts process date
   */
  getProcessDate(process) {
    const dados = process.dadosBasicos || {};
    const dateStr = dados.dataDistribuicao;
    return dateStr ? new Date(dateStr) : null;
  }

  /**
   * Generates summary report
   */
  generateSummaryReport() {
    const report = {
      overview: {
        totalProcesses: this.summaryData.totalProcesses,
        courtsWithProcesses: Object.keys(this.summaryData.courtSummary).length,
        dateRange: this.summaryData.dateRange
      },
      
      byCourtType: Object.entries(this.summaryData.courtTypeSummary).map(([type, data]) => ({
        type,
        totalProcesses: data.count,
        courts: data.courts.filter(c => c.processCount > 0)
      })),
      
      byCourt: Object.entries(this.summaryData.courtSummary)
        .filter(([code, data]) => data.processCount > 0)
        .map(([code, data]) => ({ code, ...data })),
      
      processTypes: Object.entries(this.summaryData.processTypes)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => ({ type, count })),
      
      statusDistribution: Object.entries(this.summaryData.statusSummary)
        .sort((a, b) => b[1] - a[1])
        .map(([status, count]) => ({ status, count }))
    };

    return report;
  }

  /**
   * Exports data to different formats
   */
  async exportToJSON(data, filename) {
    const filepath = path.join(process.cwd(), 'exports', filename);
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    return filepath;
  }

  /**
   * Exports data to CSV format
   */
  async exportToCSV(data, filename) {
    const processes = data.processDetails || [];
    
    if (processes.length === 0) {
      throw new Error('No process data to export');
    }

    const headers = [
      'Número do Processo',
      'Tribunal',
      'Tipo de Tribunal',
      'Data de Distribuição',
      'Tipo de Processo',
      'Status',
      'Assunto',
      'Partes',
      'Último Movimento'
    ];

    const csvRows = [headers.join(',')];
    
    processes.forEach(process => {
      const row = [
        `"${process.processNumber}"`,
        `"${process.court}"`,
        `"${process.courtType}"`,
        `"${process.distributionDate}"`,
        `"${process.processType}"`,
        `"${process.status}"`,
        `"${process.subject}"`,
        `"${process.parties.map(p => `${p.type}: ${p.name}`).join('; ')}"`,
        `"${process.movements.length > 0 ? process.movements[0].description : 'N/A'}"`
      ];
      csvRows.push(row.join(','));
    });

    const filepath = path.join(process.cwd(), 'exports', filename);
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, csvRows.join('\n'));
    return filepath;
  }
}

module.exports = DataAggregatorService;