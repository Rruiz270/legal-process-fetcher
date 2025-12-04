export default function handler(req, res) {
  const html = `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <meta name="theme-color" content="#667eea"/>
    <meta name="description" content="Comprehensive Brazilian legal process fetcher using CNPJ across all court systems with OAB authentication and digital certificate support"/>
    <title>⚖️ Legal Process Fetcher - Brazilian Court System Search</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; color: white; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .card { background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); padding: 30px; margin-bottom: 30px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #555; }
        .form-control { width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 16px; transition: border-color 0.3s; }
        .form-control:focus { outline: none; border-color: #667eea; }
        .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 30px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
        .btn:hover { transform: translateY(-2px); }
        .search-level { display: flex; gap: 15px; margin-bottom: 20px; }
        .search-level input { margin-right: 8px; }
        .results { margin-top: 30px; }
        .result-card { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 15px; border-radius: 8px; }
        .loading { text-align: center; padding: 20px; }
        .error { color: #dc3545; background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .success { color: #155724; background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .oab-fields { margin-top: 15px; padding: 15px; background: #f0f4ff; border-radius: 8px; border: 1px solid #c7d2fe; }
        .certificate-fields { margin-top: 15px; padding: 15px; background: #fff7ed; border-radius: 8px; border: 1px solid #fed7aa; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚖️ Legal Process Fetcher</h1>
            <p>Brazilian Court System Search</p>
        </div>

        <div class="card">
            <form id="searchForm">
                <div class="form-group">
                    <label for="cnpj">CNPJ:</label>
                    <input type="text" id="cnpj" name="cnpj" class="form-control" placeholder="08.049.394/0001-84" required>
                </div>

                <div class="form-group">
                    <label>Search Level:</label>
                    <div class="search-level">
                        <div>
                            <input type="radio" id="basic" name="searchLevel" value="basic" checked>
                            <label for="basic">Basic (Public CNJ DataJud)</label>
                        </div>
                        <div>
                            <input type="radio" id="enhanced" name="searchLevel" value="enhanced">
                            <label for="enhanced">Enhanced (OAB Access)</label>
                        </div>
                        <div>
                            <input type="radio" id="comprehensive" name="searchLevel" value="comprehensive">
                            <label for="comprehensive">Comprehensive (Digital Certificate)</label>
                        </div>
                    </div>
                </div>

                <div id="oabFields" class="oab-fields" style="display: none;">
                    <div class="form-group">
                        <label for="oab">OAB Number:</label>
                        <input type="text" id="oab" name="oab" class="form-control" placeholder="123456/SP">
                    </div>
                    <div class="form-group">
                        <label for="oabPassword">OAB Password:</label>
                        <input type="password" id="oabPassword" name="oabPassword" class="form-control">
                    </div>
                </div>

                <div id="certificateFields" class="certificate-fields" style="display: none;">
                    <div class="form-group">
                        <label for="certificate">Digital Certificate:</label>
                        <input type="file" id="certificate" name="certificate" class="form-control" accept=".p12,.pfx">
                    </div>
                    <div class="form-group">
                        <label for="certificatePassword">Certificate Password:</label>
                        <input type="password" id="certificatePassword" name="certificatePassword" class="form-control">
                    </div>
                </div>

                <div class="form-group">
                    <label for="courtType">Court Type:</label>
                    <select id="courtType" name="courtType" class="form-control">
                        <option value="">All Courts</option>
                        <option value="labor">Labor Courts</option>
                        <option value="civil">Civil Courts</option>
                        <option value="federal">Federal Courts</option>
                        <option value="electoral">Electoral Courts</option>
                    </select>
                </div>

                <button type="submit" class="btn">🔍 Search Legal Processes</button>
            </form>
        </div>

        <div id="results" class="results"></div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('searchForm');
            const resultsDiv = document.getElementById('results');
            const searchLevelRadios = document.querySelectorAll('input[name="searchLevel"]');
            const oabFields = document.getElementById('oabFields');
            const certificateFields = document.getElementById('certificateFields');
            const cnpjInput = document.getElementById('cnpj');

            // Show/hide credential fields based on search level
            searchLevelRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    if (this.value === 'enhanced') {
                        oabFields.style.display = 'block';
                        certificateFields.style.display = 'none';
                    } else if (this.value === 'comprehensive') {
                        oabFields.style.display = 'none';
                        certificateFields.style.display = 'block';
                    } else {
                        oabFields.style.display = 'none';
                        certificateFields.style.display = 'none';
                    }
                });
            });

            // Format CNPJ input
            cnpjInput.addEventListener('input', function() {
                let value = this.value.replace(/\\D/g, '');
                if (value.length <= 14) {
                    value = value.replace(/^(\\d{2})(\\d{3})(\\d{3})(\\d{4})(\\d{2})$/, '$1.$2.$3/$4-$5');
                    this.value = value;
                }
            });

            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(form);
                const data = {
                    cnpj: formData.get('cnpj'),
                    searchLevel: formData.get('searchLevel'),
                    courtType: formData.get('courtType'),
                    oab: formData.get('oab'),
                    oabPassword: formData.get('oabPassword'),
                    certificatePassword: formData.get('certificatePassword')
                };

                resultsDiv.innerHTML = '<div class="loading">🔄 Searching legal processes...</div>';

                try {
                    const response = await fetch('/api/search', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();

                    if (result.success) {
                        displayResults(result.data);
                    } else {
                        resultsDiv.innerHTML = \`<div class="error">❌ Error: \${result.error}</div>\`;
                    }
                } catch (error) {
                    resultsDiv.innerHTML = \`<div class="error">❌ Network Error: \${error.message}</div>\`;
                }
            });

            function displayResults(data) {
                let html = \`
                    <div class="success">
                        ✅ Search completed for CNPJ: \${data.cnpj}<br>
                        🏛️ Courts searched: \${data.totalCourtsSearched}<br>
                        📊 Total processes found: \${data.totalProcesses}
                    </div>
                \`;

                if (data.searchResults && data.searchResults.results) {
                    data.searchResults.results.forEach(court => {
                        html += \`
                            <div class="result-card">
                                <h3>\${court.courtName} (\${court.courtType.toUpperCase()})</h3>
                                <p><strong>Processes found:</strong> \${court.processCount}</p>
                                \${court.error ? \`<p style="color: #dc3545;"><strong>Error:</strong> \${court.error}</p>\` : ''}
                                \${court.processes && court.processes.length > 0 ? 
                                    \`<details>
                                        <summary>View Processes</summary>
                                        <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-top: 10px;">\${JSON.stringify(court.processes, null, 2)}</pre>
                                    </details>\` : ''
                                }
                            </div>
                        \`;
                    });
                }

                resultsDiv.innerHTML = html;
            }
        });
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}