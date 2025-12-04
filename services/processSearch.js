const axios = require('axios');
const { COURTS, API_CONFIG } = require('../config/courts');
const { validateCNPJ, cleanCNPJ, formatCNPJ } = require('../utils/cnpj');

class ProcessSearchService {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  /**
   * Creates search query for CNPJ across different courts
   */
  createCNPJQuery(cnpj) {
    const cleanedCNPJ = cleanCNPJ(cnpj);
    const formattedCNPJ = formatCNPJ(cnpj);
    
    return {
      query: {
        bool: {
          should: [
            // Search in different party fields
            { match: { "dadosBasicos.polo.pessoa.documento": cleanedCNPJ } },
            { match: { "dadosBasicos.polo.pessoa.documento": formattedCNPJ } },
            { match: { "dadosBasicos.polo.advogado.documento": cleanedCNPJ } },
            { match: { "dadosBasicos.polo.advogado.documento": formattedCNPJ } },
            // Wildcard searches for different formatting
            { wildcard: { "dadosBasicos.polo.pessoa.documento.keyword": `*${cleanedCNPJ}*` } },
            { wildcard: { "dadosBasicos.polo.pessoa.documento.keyword": `*${formattedCNPJ}*` } },
            // Text searches in names and descriptions
            { match: { "dadosBasicos.polo.pessoa.nome": cnpj } },
            { match: { "dadosBasicos.assunto.nome": cnpj } }
          ],
          minimum_should_match: 1
        }
      },
      size: 100,
      from: 0,
      sort: [
        { "dadosBasicos.dataDistribuicao": { order: "desc" } }
      ]
    };
  }

  /**
   * Searches for processes in a specific court
   */
  async searchInCourt(courtCode, cnpj) {
    const court = COURTS[courtCode];
    if (!court) {
      throw new Error(`Court ${courtCode} not found`);
    }

    try {
      console.log(`Searching in ${court.name}...`);
      
      const query = this.createCNPJQuery(cnpj);
      
      const response = await axios.post(court.endpoint, query, {
        headers: API_CONFIG.headers,
        timeout: API_CONFIG.timeout
      });

      const processes = response.data?.hits?.hits || [];
      
      return {
        court: courtCode,
        courtName: court.name,
        courtType: court.type,
        processCount: response.data?.hits?.total?.value || 0,
        processes: processes.map(hit => ({
          id: hit._id,
          score: hit._score,
          ...hit._source
        }))
      };
    } catch (error) {
      console.error(`Error searching in ${court.name}:`, error.message);
      this.errors.push({
        court: courtCode,
        courtName: court.name,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }

  /**
   * Searches for processes across all courts
   */
  async searchAllCourts(cnpj) {
    if (!validateCNPJ(cnpj)) {
      throw new Error('Invalid CNPJ format');
    }

    console.log(`Starting search for CNPJ: ${formatCNPJ(cnpj)}`);
    
    this.results = [];
    this.errors = [];

    const courtCodes = Object.keys(COURTS);
    const searchPromises = [];

    // Create batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < courtCodes.length; i += batchSize) {
      const batch = courtCodes.slice(i, i + batchSize);
      
      for (const courtCode of batch) {
        searchPromises.push(this.searchInCourt(courtCode, cnpj));
      }

      // Wait between batches to respect rate limits
      if (i + batchSize < courtCodes.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const results = await Promise.allSettled(searchPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        this.results.push(result.value);
      }
    });

    return {
      cnpj: formatCNPJ(cnpj),
      searchDate: new Date().toISOString(),
      totalCourtsSearched: courtCodes.length,
      successfulSearches: this.results.length,
      totalProcesses: this.results.reduce((sum, court) => sum + court.processCount, 0),
      results: this.results,
      errors: this.errors
    };
  }

  /**
   * Searches specific court types
   */
  async searchByCourtType(cnpj, courtType) {
    if (!validateCNPJ(cnpj)) {
      throw new Error('Invalid CNPJ format');
    }

    const filteredCourts = Object.entries(COURTS)
      .filter(([code, court]) => court.type === courtType)
      .map(([code]) => code);

    if (filteredCourts.length === 0) {
      throw new Error(`No courts found for type: ${courtType}`);
    }

    console.log(`Searching in ${courtType} courts for CNPJ: ${formatCNPJ(cnpj)}`);
    
    this.results = [];
    this.errors = [];

    const searchPromises = filteredCourts.map(courtCode => 
      this.searchInCourt(courtCode, cnpj)
    );

    const results = await Promise.allSettled(searchPromises);
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        this.results.push(result.value);
      }
    });

    return {
      cnpj: formatCNPJ(cnpj),
      courtType,
      searchDate: new Date().toISOString(),
      totalCourtsSearched: filteredCourts.length,
      successfulSearches: this.results.length,
      totalProcesses: this.results.reduce((sum, court) => sum + court.processCount, 0),
      results: this.results,
      errors: this.errors
    };
  }
}

module.exports = ProcessSearchService;