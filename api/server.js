const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const ProcessSearchService = require('../services/processSearch');
const EnhancedProcessSearchService = require('../services/enhancedProcessSearch');
const DataAggregatorService = require('../services/dataAggregator');
const { validateCNPJ, formatCNPJ } = require('../utils/cnpj');

const app = express();

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api-publica.datajud.cnj.jus.br"]
    }
  }
}));
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://legal-process-fetcher.vercel.app', 'https://legal-process-fetcher-git-main-raphael-ruizs-projects.vercel.app']
    : ['http://localhost:3000', 'http://localhost:3001']
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many search requests, please wait before searching again.'
  }
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// CNPJ validation endpoint
app.post('/api/validate-cnpj', (req, res) => {
  try {
    const { cnpj } = req.body;
    
    if (!cnpj) {
      return res.status(400).json({ error: 'CNPJ is required' });
    }

    const isValid = validateCNPJ(cnpj);
    const formatted = isValid ? formatCNPJ(cnpj) : null;

    res.json({
      valid: isValid,
      formatted,
      original: cnpj
    });
  } catch (error) {
    res.status(500).json({ error: 'Validation error' });
  }
});

// Search all courts
app.post('/api/search/all', searchLimiter, async (req, res) => {
  try {
    const { cnpj } = req.body;
    
    if (!cnpj) {
      return res.status(400).json({ error: 'CNPJ is required' });
    }

    if (!validateCNPJ(cnpj)) {
      return res.status(400).json({ error: 'Invalid CNPJ format' });
    }

    const searchService = new ProcessSearchService();
    const aggregatorService = new DataAggregatorService();

    const searchResults = await searchService.searchAllCourts(cnpj);
    const aggregatedData = aggregatorService.aggregateResults(searchResults);
    const summaryReport = aggregatorService.generateSummaryReport();

    res.json({
      success: true,
      data: {
        searchResults,
        aggregatedData,
        summaryReport
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed', 
      message: error.message 
    });
  }
});

// Enhanced search with OAB authentication
app.post('/api/search/enhanced-oab', searchLimiter, async (req, res) => {
  try {
    const { cnpj, oabNumber, oabState, oabPassword } = req.body;
    
    if (!cnpj || !oabNumber || !oabState || !oabPassword) {
      return res.status(400).json({ 
        error: 'CNPJ and complete OAB credentials are required' 
      });
    }

    if (!validateCNPJ(cnpj)) {
      return res.status(400).json({ error: 'Invalid CNPJ format' });
    }

    const enhancedSearchService = new EnhancedProcessSearchService();
    enhancedSearchService.setOABCredentials(oabNumber, oabState, oabPassword);

    const searchResults = await enhancedSearchService.searchWithOAB(cnpj);
    
    res.json({
      success: true,
      searchLevel: 'enhanced',
      coverage: searchResults.coverage,
      dataQuality: searchResults.dataQuality,
      data: searchResults
    });

  } catch (error) {
    console.error('Enhanced OAB search error:', error);
    res.status(500).json({ 
      error: 'Enhanced search failed', 
      message: error.message 
    });
  }
});

// Export data
app.post('/api/export', async (req, res) => {
  try {
    const { data, format, filename } = req.body;
    
    if (!data || !format) {
      return res.status(400).json({ error: 'Data and format are required' });
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename || 'processes.json'}"`);
      res.send(JSON.stringify(data, null, 2));
    } else if (format === 'csv') {
      const csvContent = generateCSVContent(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename || 'processes.csv'}"`);
      res.send(csvContent);
    } else {
      res.status(400).json({ error: 'Invalid format. Use json or csv' });
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

function generateCSVContent(data) {
  const processes = data.aggregatedData?.processDetails || [];
  
  if (processes.length === 0) {
    return 'No process data available';
  }

  const headers = [
    'Número do Processo',
    'Tribunal',
    'Tipo de Tribunal',
    'Data de Distribuição',
    'Tipo de Processo',
    'Status',
    'Assunto'
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
      `"${process.subject}"`
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

module.exports = app;