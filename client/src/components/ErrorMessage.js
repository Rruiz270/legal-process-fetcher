import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onClose }) => {
  return (
    <div className="error-container">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <div className="error-text">
          <h3>Search Error</h3>
          <p>{message}</p>
        </div>
        <button className="error-close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="error-suggestions">
        <h4>Troubleshooting Tips:</h4>
        <ul>
          <li>Verify that the CNPJ is correctly formatted (XX.XXX.XXX/XXXX-XX)</li>
          <li>Check your internet connection</li>
          <li>The CNJ API may be temporarily unavailable</li>
          <li>Some courts may not have processes for this CNPJ</li>
          <li>Try searching a specific court type instead of all courts</li>
        </ul>
      </div>
    </div>
  );
};

export default ErrorMessage;