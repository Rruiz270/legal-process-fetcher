import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <h3>Searching Legal Processes...</h3>
        <p>This may take a few moments as we search across multiple court systems</p>
        <div className="loading-steps">
          <div className="step active">🔍 Validating CNPJ</div>
          <div className="step active">⚖️ Searching Courts</div>
          <div className="step">📊 Aggregating Results</div>
          <div className="step">✅ Complete</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;