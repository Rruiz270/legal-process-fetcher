// CNPJ validation utilities (inline)
function cleanCNPJ(cnpj) {
  return cnpj.replace(/\D/g, '');
}

function formatCNPJ(cnpj) {
  const clean = cleanCNPJ(cnpj);
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function validateCNPJ(cnpj) {
  const clean = cleanCNPJ(cnpj);
  
  if (clean.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(clean)) return false;
  
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(clean[12]) !== firstDigit) return false;
  
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(clean[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return parseInt(clean[13]) === secondDigit;
}

// Court configuration (inline)
const COURTS = {
  tst: {
    name: 'Tribunal Superior do Trabalho',
    type: 'labor',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_tst/_search'
  },
  tse: {
    name: 'Tribunal Superior Eleitoral',
    type: 'electoral',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_tse/_search'
  },
  stj: {
    name: 'Superior Tribunal de Justiça',
    type: 'civil',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_stj/_search'
  },
  tjsp: {
    name: 'Tribunal de Justiça de São Paulo',
    type: 'civil',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search'
  },
  tjrj: {
    name: 'Tribunal de Justiça do Rio de Janeiro',
    type: 'civil',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_tjrj/_search'
  }
};

const API_CONFIG = {
  apiKey: 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==',
  headers: {
    'Authorization': 'APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==',
    'Content-Type': 'application/json'
  },
  timeout: 30000
};

// Simple search function
async function searchCNPJInCourt(cnpj, courtCode) {
  const court = COURTS[courtCode];
  if (!court) return null;

  const query = {
    query: {
      bool: {
        should: [
          { match: { "dadosBasicos.polo.pessoa.documento": cleanCNPJ(cnpj) } },
          { match: { "dadosBasicos.polo.pessoa.documento": formatCNPJ(cnpj) } }
        ],
        minimum_should_match: 1
      }
    },
    size: 10,
    from: 0
  };

  try {
    const response = await fetch(court.endpoint, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const processes = data?.hits?.hits || [];
    
    return {
      court: courtCode,
      courtName: court.name,
      courtType: court.type,
      processCount: data?.hits?.total?.value || 0,
      processes: processes.map(hit => ({
        id: hit._id,
        score: hit._score,
        ...hit._source
      }))
    };
  } catch (error) {
    console.error(`Error searching ${court.name}:`, error.message);
    return {
      court: courtCode,
      courtName: court.name,
      courtType: court.type,
      processCount: 0,
      processes: [],
      error: error.message
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cnpj, courtType } = req.body;
    
    if (!cnpj) {
      return res.status(400).json({ error: 'CNPJ is required' });
    }

    if (!validateCNPJ(cnpj)) {
      return res.status(400).json({ error: 'Invalid CNPJ format' });
    }

    console.log(`Searching for CNPJ: ${formatCNPJ(cnpj)}, Court Type: ${courtType || 'all'}`);

    // Search in a subset of courts for demo
    const courtCodes = courtType === 'labor' ? ['tst'] : 
                      courtType === 'civil' ? ['stj', 'tjsp', 'tjrj'] :
                      ['tst', 'stj', 'tjsp']; // Basic search

    const searchPromises = courtCodes.map(code => searchCNPJInCourt(cnpj, code));
    const results = await Promise.all(searchPromises);

    const totalProcesses = results.reduce((sum, result) => sum + (result?.processCount || 0), 0);
    
    const response = {
      cnpj: formatCNPJ(cnpj),
      searchDate: new Date().toISOString(),
      totalCourtsSearched: courtCodes.length,
      totalProcesses,
      searchResults: {
        results: results.filter(r => r !== null)
      },
      summaryReport: {
        overview: {
          totalProcesses,
          courtsWithProcesses: results.filter(r => r && r.processCount > 0).length
        }
      }
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed', 
      message: error.message 
    });
  }
}