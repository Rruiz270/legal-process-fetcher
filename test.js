const LegalProcessFetcher = require('./main');
const { validateCNPJ, formatCNPJ } = require('./utils/cnpj');

async function runTests() {
  console.log('🧪 Running Legal Process Fetcher Tests\n');
  
  // Test CNPJ validation
  console.log('1. Testing CNPJ validation...');
  const testCNPJ = '08049394000184';
  console.log(`   CNPJ: ${testCNPJ}`);
  console.log(`   Valid: ${validateCNPJ(testCNPJ)}`);
  console.log(`   Formatted: ${formatCNPJ(testCNPJ)}\n`);
  
  // Test search functionality
  console.log('2. Testing search functionality...');
  const fetcher = new LegalProcessFetcher();
  
  try {
    // Test labor court search only (faster)
    console.log('   Testing labor court search...');
    const results = await fetcher.fetchByCourtType(testCNPJ, 'labor', { 
      export: true, 
      exportFormat: 'json' 
    });
    
    console.log(`   ✅ Search completed successfully`);
    console.log(`   📊 Found ${results.summaryReport.overview.totalProcesses} processes`);
    
  } catch (error) {
    console.log(`   ❌ Search failed: ${error.message}`);
  }
  
  console.log('\n🎉 Tests completed!');
}

// Run tests
if (require.main === module) {
  runTests().catch(console.error);
}