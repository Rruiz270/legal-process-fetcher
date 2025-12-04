import React, { useState } from 'react';
import './SearchForm.css';

const SearchForm = ({ onSearch, loading }) => {
  const [cnpj, setCnpj] = useState('');
  const [courtType, setCourtType] = useState('all');
  const [searchLevel, setSearchLevel] = useState('basic');
  const [oabCredentials, setOabCredentials] = useState({
    oabNumber: '',
    oabState: '',
    oabPassword: ''
  });
  const [validationError, setValidationError] = useState('');

  const formatCNPJ = (value) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Apply CNPJ format: XX.XXX.XXX/XXXX-XX
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return cleaned.replace(/(\d{2})(\d{0,3})/, '$1.$2');
    if (cleaned.length <= 8) return cleaned.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
    if (cleaned.length <= 12) return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
  };

  const validateCNPJ = (cnpj) => {
    const clean = cnpj.replace(/\D/g, '');
    
    if (clean.length !== 14) {
      return 'CNPJ deve ter 14 dígitos';
    }
    
    // Check if all digits are the same
    if (/^(\d)\1{13}$/.test(clean)) {
      return 'CNPJ inválido';
    }
    
    // Calculate first check digit
    let sum = 0;
    let weight = 5;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(clean[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    if (parseInt(clean[12]) !== firstDigit) {
      return 'CNPJ inválido';
    }
    
    // Calculate second check digit
    sum = 0;
    weight = 6;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(clean[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    if (parseInt(clean[13]) !== secondDigit) {
      return 'CNPJ inválido';
    }
    
    return '';
  };

  const handleCNPJChange = (e) => {
    const formatted = formatCNPJ(e.target.value);
    setCnpj(formatted);
    
    if (formatted.length >= 18) { // Complete CNPJ format
      const error = validateCNPJ(formatted);
      setValidationError(error);
    } else {
      setValidationError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const error = validateCNPJ(cnpj);
    if (error) {
      setValidationError(error);
      return;
    }

    // Validate OAB credentials if enhanced search is selected
    if (searchLevel === 'enhanced') {
      if (!oabCredentials.oabNumber || !oabCredentials.oabState || !oabCredentials.oabPassword) {
        setValidationError('Complete OAB credentials are required for enhanced search');
        return;
      }
    }
    
    const searchData = { 
      cnpj, 
      courtType,
      searchLevel,
      ...oabCredentials
    };
    
    onSearch(searchData);
  };

  return (
    <div className="search-form-container">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h2>🔍 Search Legal Processes</h2>
          <p>Enter a CNPJ to search for legal processes across Brazilian courts</p>
        </div>

        <div className="form-group">
          <label htmlFor="cnpj">CNPJ</label>
          <input
            type="text"
            id="cnpj"
            value={cnpj}
            onChange={handleCNPJChange}
            placeholder="00.000.000/0000-00"
            maxLength="18"
            className={validationError ? 'error' : ''}
          />
          {validationError && (
            <span className="validation-error">{validationError}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="searchLevel">Search Level</label>
          <select
            id="searchLevel"
            value={searchLevel}
            onChange={(e) => setSearchLevel(e.target.value)}
            className="search-level-select"
          >
            <option value="basic">🔓 Basic Search (60-70% coverage)</option>
            <option value="enhanced">🔐 Enhanced Search - OAB Required (85-90% coverage)</option>
            <option value="comprehensive">🏛️ Comprehensive Search - Digital Certificate (95-99% coverage)</option>
          </select>
          <div className="search-level-info">
            {searchLevel === 'basic' && (
              <p>Free public search using CNJ DataJud API</p>
            )}
            {searchLevel === 'enhanced' && (
              <p>Enhanced search with OAB authentication for confidential processes</p>
            )}
            {searchLevel === 'comprehensive' && (
              <p>Complete search with digital certificate for all sensitive data</p>
            )}
          </div>
        </div>

        {searchLevel === 'enhanced' && (
          <>
            <div className="form-section-title">
              <h3>🔐 OAB Credentials</h3>
              <p>Required for enhanced search with confidential process access</p>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="oabNumber">OAB Number</label>
                <input
                  type="text"
                  id="oabNumber"
                  value={oabCredentials.oabNumber}
                  onChange={(e) => setOabCredentials({
                    ...oabCredentials,
                    oabNumber: e.target.value.replace(/\D/g, '')
                  })}
                  placeholder="123456"
                  maxLength="6"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="oabState">OAB State</label>
                <select
                  id="oabState"
                  value={oabCredentials.oabState}
                  onChange={(e) => setOabCredentials({
                    ...oabCredentials,
                    oabState: e.target.value
                  })}
                >
                  <option value="">Select State</option>
                  <option value="SP">São Paulo (SP)</option>
                  <option value="RJ">Rio de Janeiro (RJ)</option>
                  <option value="MG">Minas Gerais (MG)</option>
                  <option value="RS">Rio Grande do Sul (RS)</option>
                  <option value="PR">Paraná (PR)</option>
                  <option value="SC">Santa Catarina (SC)</option>
                  <option value="GO">Goiás (GO)</option>
                  <option value="MT">Mato Grosso (MT)</option>
                  <option value="MS">Mato Grosso do Sul (MS)</option>
                  <option value="DF">Distrito Federal (DF)</option>
                  <option value="BA">Bahia (BA)</option>
                  <option value="PE">Pernambuco (PE)</option>
                  <option value="CE">Ceará (CE)</option>
                  <option value="PA">Pará (PA)</option>
                  <option value="MA">Maranhão (MA)</option>
                  <option value="PB">Paraíba (PB)</option>
                  <option value="ES">Espírito Santo (ES)</option>
                  <option value="PI">Piauí (PI)</option>
                  <option value="AL">Alagoas (AL)</option>
                  <option value="RN">Rio Grande do Norte (RN)</option>
                  <option value="RO">Rondônia (RO)</option>
                  <option value="AC">Acre (AC)</option>
                  <option value="AM">Amazonas (AM)</option>
                  <option value="RR">Roraima (RR)</option>
                  <option value="AP">Amapá (AP)</option>
                  <option value="TO">Tocantins (TO)</option>
                  <option value="SE">Sergipe (SE)</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="oabPassword">OAB Password</label>
              <input
                type="password"
                id="oabPassword"
                value={oabCredentials.oabPassword}
                onChange={(e) => setOabCredentials({
                  ...oabCredentials,
                  oabPassword: e.target.value
                })}
                placeholder="Your OAB password"
              />
            </div>
          </>
        )}

        {searchLevel === 'comprehensive' && (
          <div className="form-section-title">
            <h3>🏛️ Digital Certificate Authentication</h3>
            <p>Contact support to configure your legal digital certificate for comprehensive search</p>
            <div className="certificate-notice">
              <strong>Note:</strong> Digital certificate configuration requires server-side setup. 
              Please contact support with your certificate details.
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="courtType">Court Type Filter</label>
          <select
            id="courtType"
            value={courtType}
            onChange={(e) => setCourtType(e.target.value)}
          >
            <option value="all">All Courts</option>
            <option value="civil">Civil Courts (TJSP, TJRJ, etc.)</option>
            <option value="labor">Labor Courts (TRT)</option>
            <option value="federal">Federal Courts (TRF)</option>
            <option value="electoral">Electoral Courts (TSE, TRE)</option>
            <option value="military">Military Courts (STM, TJM)</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading || !!validationError || !cnpj}
          className="search-button"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Searching...
            </>
          ) : (
            <>
              🔍 Search Processes
            </>
          )}
        </button>

        <div className="form-info">
          <p><strong>Example CNPJ:</strong> 08.049.394/0001-84</p>
          <p><strong>Note:</strong> This tool searches official Brazilian court databases for legitimate legal research purposes only.</p>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;