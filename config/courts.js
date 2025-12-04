/**
 * Brazilian court endpoints configuration
 */

const COURTS = {
  // Superior Courts
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
  stm: {
    name: 'Superior Tribunal Militar',
    type: 'military',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_stm/_search'
  },

  // Federal Courts
  trf1: {
    name: 'Tribunal Regional Federal da 1ª Região',
    type: 'federal',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_trf1/_search'
  },
  trf2: {
    name: 'Tribunal Regional Federal da 2ª Região',
    type: 'federal',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_trf2/_search'
  },
  trf3: {
    name: 'Tribunal Regional Federal da 3ª Região',
    type: 'federal',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_trf3/_search'
  },
  trf4: {
    name: 'Tribunal Regional Federal da 4ª Região',
    type: 'federal',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_trf4/_search'
  },
  trf5: {
    name: 'Tribunal Regional Federal da 5ª Região',
    type: 'federal',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_trf5/_search'
  },
  trf6: {
    name: 'Tribunal Regional Federal da 6ª Região',
    type: 'federal',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_trf6/_search'
  },

  // State Courts (Major ones)
  tjsp: {
    name: 'Tribunal de Justiça de São Paulo',
    type: 'civil',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search'
  },
  tjrj: {
    name: 'Tribunal de Justiça do Rio de Janeiro',
    type: 'civil',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_tjrj/_search'
  },
  tjmg: {
    name: 'Tribunal de Justiça de Minas Gerais',
    type: 'civil',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_tjmg/_search'
  },
  tjrs: {
    name: 'Tribunal de Justiça do Rio Grande do Sul',
    type: 'civil',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_tjrs/_search'
  },
  tjpr: {
    name: 'Tribunal de Justiça do Paraná',
    type: 'civil',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_tjpr/_search'
  },

  // Labor Courts (Regional)
  trt1: {
    name: 'Tribunal Regional do Trabalho da 1ª Região',
    type: 'labor',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_trt1/_search'
  },
  trt2: {
    name: 'Tribunal Regional do Trabalho da 2ª Região',
    type: 'labor',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_trt2/_search'
  },
  trt3: {
    name: 'Tribunal Regional do Trabalho da 3ª Região',
    type: 'labor',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_trt3/_search'
  },
  trt4: {
    name: 'Tribunal Regional do Trabalho da 4ª Região',
    type: 'labor',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_trt4/_search'
  },
  trt9: {
    name: 'Tribunal Regional do Trabalho da 9ª Região',
    type: 'labor',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_trt9/_search'
  },
  trt15: {
    name: 'Tribunal Regional do Trabalho da 15ª Região',
    type: 'labor',
    endpoint: 'https://api-publica.datajud.cnj.jus.br/api_publica_trt15/_search'
  }
};

// CNJ DataJud API Configuration
const API_CONFIG = {
  baseUrl: 'https://api-publica.datajud.cnj.jus.br',
  apiKey: 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==',
  headers: {
    'Authorization': 'APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==',
    'Content-Type': 'application/json'
  },
  maxResults: 10000,
  timeout: 30000
};

module.exports = {
  COURTS,
  API_CONFIG
};