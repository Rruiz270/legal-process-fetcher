const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const ProcessSearchService = require('./services/processSearch');
const EnhancedProcessSearchService = require('./services/enhancedProcessSearch');
const DataAggregatorService = require('./services/dataAggregator');
const { validateCNPJ, formatCNPJ } = require('./utils/cnpj');

const app = express();
const PORT = process.env.PORT || 3001;

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
    ? ['https://legal-process-fetcher.vercel.app', 'https://legal-process-fetcher-git-main-rruiz270.vercel.app']
    : ['http://localhost:3000', 'http://localhost:3001']
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Search-specific rate limiting
const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 searches per 5 minutes
  message: {
    error: 'Too many search requests, please wait before searching again.'
  }
});

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

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

// Search by court type
app.post('/api/search/court-type', searchLimiter, async (req, res) => {
  try {
    const { cnpj, courtType } = req.body;
    
    if (!cnpj) {
      return res.status(400).json({ error: 'CNPJ is required' });
    }

    if (!courtType) {
      return res.status(400).json({ error: 'Court type is required' });
    }

    if (!validateCNPJ(cnpj)) {
      return res.status(400).json({ error: 'Invalid CNPJ format' });
    }

    const validCourtTypes = ['civil', 'labor', 'federal', 'electoral', 'military'];
    if (!validCourtTypes.includes(courtType)) {
      return res.status(400).json({ 
        error: 'Invalid court type', 
        validTypes: validCourtTypes 
      });
    }

    const searchService = new ProcessSearchService();
    const aggregatorService = new DataAggregatorService();

    const searchResults = await searchService.searchByCourtType(cnpj, courtType);
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

// Export data
app.post('/api/export', async (req, res) => {
  try {
    const { data, format, filename } = req.body;
    
    if (!data || !format) {
      return res.status(400).json({ error: 'Data and format are required' });
    }

    const aggregatorService = new DataAggregatorService();
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename || 'processes.json'}"`);
      res.send(JSON.stringify(data, null, 2));
    } else if (format === 'csv') {
      // For CSV, we need to generate the CSV content
      const csvContent = await generateCSVContent(data);
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

// Generate CSV content from data
async function generateCSVContent(data) {
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

// Serve React app for all other routes (in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
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

// Comprehensive search with digital certificate
app.post('/api/search/comprehensive-certificate', searchLimiter, async (req, res) => {
  try {
    const { cnpj } = req.body;
    
    if (!cnpj) {
      return res.status(400).json({ error: 'CNPJ is required' });
    }

    if (!validateCNPJ(cnpj)) {
      return res.status(400).json({ error: 'Invalid CNPJ format' });
    }

    // Note: For certificate upload, we'd need multer middleware
    // For now, assume certificate is already configured server-side
    const enhancedSearchService = new EnhancedProcessSearchService();
    
    // In production, certificate would be uploaded via form-data
    // const certificateResult = enhancedSearchService.setCertificate(certificatePath, password);
    // if (!certificateResult.success) {
    //   return res.status(400).json({ error: certificateResult.message });
    // }

    const searchResults = await enhancedSearchService.searchWithCertificate(cnpj);
    
    res.json({
      success: true,
      searchLevel: 'comprehensive',
      coverage: searchResults.coverage,
      dataQuality: searchResults.dataQuality,
      data: searchResults
    });

  } catch (error) {
    console.error('Comprehensive certificate search error:', error);
    res.status(500).json({ 
      error: 'Comprehensive search failed', 
      message: error.message 
    });
  }
});

// Get search capabilities endpoint
app.get('/api/capabilities', (req, res) => {
  const enhancedSearchService = new EnhancedProcessSearchService();
  const capabilities = enhancedSearchService.getSearchCapabilities();
  
  res.json({
    success: true,
    capabilities,
    authLevels: {
      basic: {
        name: 'Basic Public Search',
        description: 'Search public CNJ DataJud API',
        requirements: 'None',
        coverage: '60-70%',
        dataQuality: 'basic'
      },
      enhanced: {
        name: 'OAB Enhanced Search',
        description: 'Enhanced search with OAB authentication',
        requirements: 'Valid OAB credentials',
        coverage: '85-90%',
        dataQuality: 'detailed'
      },
      comprehensive: {
        name: 'Digital Certificate Search',
        description: 'Complete search with digital certificate',
        requirements: 'Valid legal digital certificate',
        coverage: '95-99%',
        dataQuality: 'complete'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🌐 Frontend should be running on http://localhost:3000`);
  }
});

module.exports = app;