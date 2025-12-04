import React, { useState } from 'react';
import './ResultsDisplay.css';

const ResultsDisplay = ({ results, onExport }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedProcess, setExpandedProcess] = useState(null);

  if (!results || !results.summaryReport) {
    return null;
  }

  const { summaryReport, aggregatedData } = results;

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const handleExportClick = (format) => {
    onExport(format);
  };

  const toggleProcessExpansion = (index) => {
    setExpandedProcess(expandedProcess === index ? null : index);
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>📊 Search Results</h2>
        <div className="export-buttons">
          <button onClick={() => handleExportClick('json')} className="export-btn">
            📄 Export JSON
          </button>
          <button onClick={() => handleExportClick('csv')} className="export-btn">
            📊 Export CSV
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="card">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <h3>{summaryReport.overview.totalProcesses}</h3>
            <p>Total Processes</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">⚖️</div>
          <div className="card-content">
            <h3>{summaryReport.overview.courtsWithProcesses}</h3>
            <p>Courts with Processes</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <h3>
              {summaryReport.overview.dateRange.earliest 
                ? formatDate(summaryReport.overview.dateRange.earliest)
                : 'N/A'
              }
            </h3>
            <p>Earliest Process</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">🕐</div>
          <div className="card-content">
            <h3>
              {summaryReport.overview.dateRange.latest
                ? formatDate(summaryReport.overview.dateRange.latest)
                : 'N/A'
              }
            </h3>
            <p>Latest Process</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={activeTab === 'overview' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={activeTab === 'courts' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('courts')}
        >
          ⚖️ By Court
        </button>
        <button 
          className={activeTab === 'types' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('types')}
        >
          📑 Process Types
        </button>
        <button 
          className={activeTab === 'processes' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('processes')}
        >
          📋 All Processes
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="section">
              <h3>Court Type Distribution</h3>
              <div className="chart-container">
                {summaryReport.byCourtType.map((courtType, index) => (
                  <div key={index} className="chart-bar">
                    <div className="bar-label">{courtType.type.toUpperCase()}</div>
                    <div className="bar">
                      <div 
                        className="bar-fill"
                        style={{
                          width: `${(courtType.totalProcesses / summaryReport.overview.totalProcesses) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="bar-value">{courtType.totalProcesses}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section">
              <h3>Status Distribution</h3>
              <div className="status-grid">
                {summaryReport.statusDistribution.slice(0, 6).map((status, index) => (
                  <div key={index} className="status-item">
                    <div className="status-count">{status.count}</div>
                    <div className="status-name">{status.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courts' && (
          <div className="courts-tab">
            {summaryReport.byCourtType.map((courtType, index) => (
              <div key={index} className="court-type-section">
                <h3>
                  {courtType.type.toUpperCase()} Courts 
                  <span className="count-badge">{courtType.totalProcesses} processes</span>
                </h3>
                <div className="court-grid">
                  {courtType.courts.map((court, courtIndex) => (
                    <div key={courtIndex} className="court-card">
                      <div className="court-name">{court.name}</div>
                      <div className="court-count">{court.processCount} processes</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'types' && (
          <div className="types-tab">
            <h3>Process Types</h3>
            <div className="types-list">
              {summaryReport.processTypes.map((type, index) => (
                <div key={index} className="type-item">
                  <div className="type-name">{type.type}</div>
                  <div className="type-count">{type.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'processes' && (
          <div className="processes-tab">
            <h3>All Processes ({aggregatedData.processDetails?.length || 0})</h3>
            {aggregatedData.processDetails && aggregatedData.processDetails.length > 0 ? (
              <div className="processes-list">
                {aggregatedData.processDetails.map((process, index) => (
                  <div key={index} className="process-card">
                    <div 
                      className="process-header"
                      onClick={() => toggleProcessExpansion(index)}
                    >
                      <div className="process-main-info">
                        <div className="process-number">{process.processNumber}</div>
                        <div className="process-court">{process.court}</div>
                      </div>
                      <div className="process-summary">
                        <div className="process-date">{formatDate(process.distributionDate)}</div>
                        <div className="expand-icon">
                          {expandedProcess === index ? '▼' : '▶'}
                        </div>
                      </div>
                    </div>
                    
                    {expandedProcess === index && (
                      <div className="process-details">
                        <div className="detail-grid">
                          <div className="detail-item">
                            <strong>Type:</strong> {process.processType}
                          </div>
                          <div className="detail-item">
                            <strong>Status:</strong> {process.status}
                          </div>
                          <div className="detail-item">
                            <strong>Subject:</strong> {process.subject}
                          </div>
                          <div className="detail-item">
                            <strong>Court Type:</strong> {process.courtType}
                          </div>
                        </div>
                        
                        {process.parties && process.parties.length > 0 && (
                          <div className="parties-section">
                            <strong>Parties:</strong>
                            <div className="parties-list">
                              {process.parties.map((party, partyIndex) => (
                                <div key={partyIndex} className="party-item">
                                  <span className="party-type">{party.type}:</span>
                                  <span className="party-name">{party.name}</span>
                                  {party.document && (
                                    <span className="party-document">({party.document})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {process.movements && process.movements.length > 0 && (
                          <div className="movements-section">
                            <strong>Recent Movements:</strong>
                            <div className="movements-list">
                              {process.movements.map((movement, moveIndex) => (
                                <div key={moveIndex} className="movement-item">
                                  <span className="movement-date">{formatDate(movement.date)}</span>
                                  <span className="movement-desc">{movement.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-processes">
                <div className="no-processes-icon">📭</div>
                <h3>No Processes Found</h3>
                <p>No legal processes were found for this CNPJ in the searched courts.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;