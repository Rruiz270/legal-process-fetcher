#!/usr/bin/env node

const ProcessSearchService = require('./services/processSearch');
const DataAggregatorService = require('./services/dataAggregator');
const { formatCNPJ } = require('./utils/cnpj');

class LegalProcessFetcher {
  constructor() {
    this.searchService = new ProcessSearchService();
    this.aggregatorService = new DataAggregatorService();
  }

  /**
   * Main method to fetch all processes for a CNPJ
   */
  async fetchAllProcesses(cnpj, options = {}) {
    try {
      console.log(`\n🔍 Starting comprehensive legal process search`);
      console.log(`📋 CNPJ: ${formatCNPJ(cnpj)}`);
      console.log(`⏰ Started at: ${new Date().toLocaleString('pt-BR')}\n`);

      // Search all courts
      const searchResults = await this.searchService.searchAllCourts(cnpj);
      
      // Aggregate results
      const aggregatedData = this.aggregatorService.aggregateResults(searchResults);
      
      // Generate summary report
      const summaryReport = this.aggregatorService.generateSummaryReport();
      
      // Display results
      this.displayResults(summaryReport);
      
      // Export if requested
      if (options.export) {
        await this.exportResults(searchResults, aggregatedData, cnpj, options.exportFormat);
      }
      
      return {
        searchResults,
        aggregatedData,
        summaryReport
      };
      
    } catch (error) {
      console.error('❌ Error during search:', error.message);
      throw error;
    }
  }

  /**
   * Fetch processes by court type
   */
  async fetchByCourtType(cnpj, courtType, options = {}) {
    try {
      console.log(`\n🔍 Searching in ${courtType} courts`);
      console.log(`📋 CNPJ: ${formatCNPJ(cnpj)}\n`);

      const searchResults = await this.searchService.searchByCourtType(cnpj, courtType);
      const aggregatedData = this.aggregatorService.aggregateResults(searchResults);
      const summaryReport = this.aggregatorService.generateSummaryReport();
      
      this.displayResults(summaryReport);
      
      if (options.export) {
        await this.exportResults(searchResults, aggregatedData, cnpj, options.exportFormat, courtType);
      }
      
      return { searchResults, aggregatedData, summaryReport };
      
    } catch (error) {
      console.error('❌ Error during search:', error.message);
      throw error;
    }
  }

  /**
   * Display formatted results
   */
  displayResults(summaryReport) {
    console.log('📊 SEARCH RESULTS SUMMARY');
    console.log('=' .repeat(50));
    
    // Overview
    console.log(`\n📋 OVERVIEW:`);
    console.log(`   Total Processes Found: ${summaryReport.overview.totalProcesses}`);
    console.log(`   Courts with Processes: ${summaryReport.overview.courtsWithProcesses}`);
    
    if (summaryReport.overview.dateRange.earliest && summaryReport.overview.dateRange.latest) {
      console.log(`   Date Range: ${summaryReport.overview.dateRange.earliest.toLocaleDateString('pt-BR')} - ${summaryReport.overview.dateRange.latest.toLocaleDateString('pt-BR')}`);
    }
    
    // By Court Type
    if (summaryReport.byCourtType.length > 0) {
      console.log(`\n⚖️  BY COURT TYPE:`);
      summaryReport.byCourtType.forEach(courtType => {
        console.log(`   ${courtType.type.toUpperCase()}: ${courtType.totalProcesses} processes`);
        courtType.courts.forEach(court => {
          console.log(`     - ${court.name}: ${court.processCount}`);
        });
      });
    }
    
    // Process Types
    if (summaryReport.processTypes.length > 0) {
      console.log(`\n📑 TOP PROCESS TYPES:`);
      summaryReport.processTypes.slice(0, 10).forEach(type => {
        console.log(`   ${type.type}: ${type.count}`);
      });
    }
    
    // Status Distribution
    if (summaryReport.statusDistribution.length > 0) {
      console.log(`\n📈 STATUS DISTRIBUTION:`);
      summaryReport.statusDistribution.slice(0, 5).forEach(status => {
        console.log(`   ${status.status}: ${status.count}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
  }

  /**
   * Export results to files
   */
  async exportResults(searchResults, aggregatedData, cnpj, format = 'json', courtType = 'all') {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const cleanCNPJ = cnpj.replace(/\D/g, '');
      const baseFilename = `processes_${cleanCNPJ}_${courtType}_${timestamp}`;
      
      console.log(`\n💾 Exporting results...`);
      
      if (format === 'csv' || format === 'both') {
        const csvPath = await this.aggregatorService.exportToCSV(aggregatedData, `${baseFilename}.csv`);
        console.log(`   📄 CSV exported to: ${csvPath}`);
      }
      
      if (format === 'json' || format === 'both') {
        const jsonPath = await this.aggregatorService.exportToJSON({
          searchResults,
          aggregatedData,
          summary: this.aggregatorService.generateSummaryReport()
        }, `${baseFilename}.json`);
        console.log(`   📄 JSON exported to: ${jsonPath}`);
      }
      
    } catch (error) {
      console.error('❌ Export error:', error.message);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔍 Legal Process Fetcher for Brazilian Courts

Usage:
  node main.js <CNPJ> [options]

Options:
  --type <courtType>     Search only specific court type (civil, labor, federal, electoral, military)
  --export <format>      Export results (json, csv, both)
  
Examples:
  node main.js 08049394000184
  node main.js 08049394000184 --type labor --export csv
  node main.js 08.049.394/0001-84 --export both
`);
    return;
  }

  const cnpj = args[0];
  const typeIndex = args.indexOf('--type');
  const exportIndex = args.indexOf('--export');
  
  const options = {};
  
  if (typeIndex !== -1 && args[typeIndex + 1]) {
    options.courtType = args[typeIndex + 1];
  }
  
  if (exportIndex !== -1) {
    options.export = true;
    options.exportFormat = args[exportIndex + 1] || 'json';
  }

  const fetcher = new LegalProcessFetcher();
  
  try {
    if (options.courtType) {
      await fetcher.fetchByCourtType(cnpj, options.courtType, options);
    } else {
      await fetcher.fetchAllProcesses(cnpj, options);
    }
  } catch (error) {
    console.error('❌ Application error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = LegalProcessFetcher;