/**
 * Enhanced Brazilian court endpoints with OAB and certificate-based APIs
 */

const ENHANCED_COURTS = {
  // CNJ DataJud API (Public)
  datajud: {
    name: 'CNJ DataJud',
    type: 'public',
    requiresAuth: false,
    endpoints: {
      // Previous endpoints from courts.js
    }
  },

  // OAB-required APIs
  oab_apis: {
    name: 'OAB Restricted APIs',
    type: 'oab-restricted',
    requiresAuth: true,
    authType: 'oab',
    endpoints: {
      // PJe Advanced Search (requires OAB)
      pje_advanced: {
        name: 'PJe Advanced Search',
        url: 'https://pje.tjsp.jus.br/pje/advogado/processo/consulta',
        description: 'Advanced process search with OAB authentication',
        features: ['detailed_process_info', 'document_access', 'real_time_updates']
      },
      
      // PROJUDI with OAB access
      projudi_oab: {
        name: 'PROJUDI OAB Access',
        url: 'https://projudi.tjsp.jus.br/projudi/advogado',
        description: 'Full PROJUDI access for registered lawyers',
        features: ['complete_case_files', 'document_downloads', 'petition_history']
      },

      // e-SAJ Advanced
      esaj_advanced: {
        name: 'e-SAJ Advanced Access',
        url: 'https://esaj.tjsp.jus.br/esaj/advogado',
        description: 'Enhanced e-SAJ features for OAB holders',
        features: ['confidential_processes', 'sealed_documents', 'advanced_search']
      }
    }
  },

  // Digital Certificate Required APIs
  certificate_apis: {
    name: 'Digital Certificate APIs',
    type: 'certificate-required',
    requiresAuth: true,
    authType: 'digital_certificate',
    endpoints: {
      // PJe Certificate Access
      pje_certificate: {
        name: 'PJe Digital Certificate API',
        url: 'https://pje-consulta.tst.jus.br/certificado',
        description: 'Full PJe access with digital certificate',
        features: ['all_process_data', 'sensitive_information', 'complete_case_history', 'document_downloads']
      },

      // Federal Court Certificate API
      jf_certificate: {
        name: 'Federal Court Certificate API',
        url: 'https://eproc.jfpr.jus.br/eproc/certificado',
        description: 'Federal court access with certificate authentication',
        features: ['federal_processes', 'tax_cases', 'administrative_proceedings']
      },

      // Labor Court Advanced Certificate API
      tst_certificate: {
        name: 'TST Certificate API',
        url: 'https://pje.tst.jus.br/certificado/api',
        description: 'Complete labor court data with certificate',
        features: ['labor_disputes', 'employment_cases', 'union_proceedings', 'wage_claims']
      },

      // Superior Courts Certificate Access
      stj_certificate: {
        name: 'STJ Certificate API',
        url: 'https://ww2.stj.jus.br/certificado/api',
        description: 'Superior Court of Justice certificate access',
        features: ['appeals', 'constitutional_cases', 'precedent_setting_cases']
      },

      // CNJ Advanced Certificate API
      cnj_advanced: {
        name: 'CNJ Advanced Certificate API',
        url: 'https://painel.cnj.jus.br/api/certificado',
        description: 'Complete CNJ database access with certificate',
        features: ['all_court_data', 'statistical_data', 'administrative_data', 'judge_performance']
      }
    }
  },

  // Commercial Legal APIs (that work with OAB/Certificate)
  commercial_apis: {
    name: 'Commercial Legal Data APIs',
    type: 'commercial',
    requiresAuth: true,
    authType: 'api_key_with_oab',
    endpoints: {
      // JusBrasil Professional
      jusbrasil_pro: {
        name: 'JusBrasil Professional API',
        url: 'https://api.jusbrasil.com.br/professional',
        description: 'Enhanced JusBrasil with OAB verification',
        features: ['jurisprudence', 'legislation', 'professional_network', 'case_analytics']
      },

      // Escavador Professional
      escavador_pro: {
        name: 'Escavador Professional API',
        url: 'https://api.escavador.com/professional',
        description: 'Professional legal intelligence with OAB',
        features: ['people_search', 'company_analysis', 'litigation_history', 'asset_investigation']
      },

      // Judit.io Professional
      judit_pro: {
        name: 'Judit.io Professional API',
        url: 'https://api.judit.io/professional',
        description: 'Advanced process monitoring with authentication',
        features: ['real_time_monitoring', 'alert_system', 'comprehensive_search', 'document_analysis']
      },

      // Legal Labs API
      legal_labs: {
        name: 'Legal Labs API',
        url: 'https://api.legallabs.com.br',
        description: 'AI-powered legal intelligence platform',
        features: ['ai_analysis', 'case_prediction', 'judge_profiling', 'outcome_probability']
      }
    }
  }
};

// Authentication configurations
const AUTH_CONFIG = {
  oab: {
    required_fields: ['oab_number', 'oab_state', 'oab_password'],
    session_duration: 3600, // 1 hour
    rate_limits: {
      requests_per_minute: 100,
      daily_limit: 10000
    }
  },

  digital_certificate: {
    required_files: ['certificate_p12', 'certificate_password'],
    certificate_validation: true,
    supported_formats: ['PKCS#12', 'A3', 'A1'],
    rate_limits: {
      requests_per_minute: 200,
      daily_limit: 50000
    }
  },

  api_key_with_oab: {
    required_fields: ['api_key', 'oab_number', 'oab_state'],
    verification_required: true,
    rate_limits: {
      requests_per_minute: 500,
      daily_limit: 100000
    }
  }
};

// Enhanced search capabilities with authentication
const ENHANCED_SEARCH_FEATURES = {
  public_search: {
    data_points: ['basic_process_info', 'parties', 'movements', 'court_info'],
    limitations: ['no_confidential_data', 'limited_detail', 'no_documents']
  },

  oab_search: {
    data_points: [
      'complete_process_info', 
      'confidential_movements', 
      'sealed_information', 
      'party_details',
      'lawyer_information',
      'procedural_history'
    ],
    additional_features: ['document_preview', 'advanced_filters', 'real_time_updates']
  },

  certificate_search: {
    data_points: [
      'all_process_data',
      'sensitive_information',
      'complete_documentation',
      'judicial_decisions',
      'administrative_data',
      'financial_information',
      'enforcement_proceedings'
    ],
    additional_features: [
      'full_document_download',
      'encrypted_data_access',
      'audit_trail',
      'compliance_reporting',
      'bulk_operations'
    ]
  }
};

// Search strategies based on authentication level
const SEARCH_STRATEGIES = {
  basic: {
    name: 'Basic Public Search',
    apis: ['datajud'],
    expected_coverage: '60-70%',
    data_quality: 'basic'
  },

  enhanced: {
    name: 'OAB Enhanced Search',
    apis: ['datajud', 'oab_apis'],
    expected_coverage: '85-90%',
    data_quality: 'detailed'
  },

  comprehensive: {
    name: 'Full Certificate Search',
    apis: ['datajud', 'oab_apis', 'certificate_apis', 'commercial_apis'],
    expected_coverage: '95-99%',
    data_quality: 'complete'
  }
};

module.exports = {
  ENHANCED_COURTS,
  AUTH_CONFIG,
  ENHANCED_SEARCH_FEATURES,
  SEARCH_STRATEGIES
};