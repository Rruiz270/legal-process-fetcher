import React, { useState } from 'react';
import './App.css';
import SearchForm from './components/SearchForm';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

function App() {
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (searchData) => {
    setLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const API_BASE = process.env.NODE_ENV === 'production' 
        ? '' 
        : 'http://localhost:3001';

      let endpoint;
      let requestBody;

      // Determine endpoint based on search level
      if (searchData.searchLevel === 'enhanced') {
        endpoint = `${API_BASE}/api/search/enhanced-oab`;
        requestBody = {
          cnpj: searchData.cnpj,
          oabNumber: searchData.oabNumber,
          oabState: searchData.oabState,
          oabPassword: searchData.oabPassword
        };
      } else if (searchData.searchLevel === 'comprehensive') {
        endpoint = `${API_BASE}/api/search/comprehensive-certificate`;
        requestBody = {
          cnpj: searchData.cnpj
        };
      } else {
        // Basic search
        endpoint = searchData.courtType === 'all' 
          ? `${API_BASE}/api/search/all`
          : `${API_BASE}/api/search/court-type`;

        requestBody = searchData.courtType === 'all'
          ? { cnpj: searchData.cnpj }
          : { cnpj: searchData.cnpj, courtType: searchData.courtType };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Search failed');
      }

      const result = await response.json();
      
      // Handle different response formats
      if (result.data) {
        setSearchResults({
          ...result.data,
          searchLevel: searchData.searchLevel,
          searchCoverage: result.coverage,
          dataQuality: result.dataQuality
        });
      } else {
        setSearchResults(result.data);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (!searchResults) return;

    try {
      const API_BASE = process.env.NODE_ENV === 'production' 
        ? '' 
        : 'http://localhost:3001';

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `legal_processes_${timestamp}.${format}`;

      const response = await fetch(`${API_BASE}/api/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: searchResults,
          format,
          filename
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError('Export failed: ' + err.message);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <h1>⚖️ Legal Process Fetcher</h1>
          <p>Search Brazilian legal processes by CNPJ across all court systems</p>
        </div>
      </header>

      <main className="container">
        <SearchForm onSearch={handleSearch} loading={loading} />
        
        {loading && <LoadingSpinner />}
        
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
        
        {searchResults && (
          <ResultsDisplay 
            results={searchResults} 
            onExport={handleExport}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>© 2024 Legal Process Fetcher - For legitimate legal research purposes only</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
