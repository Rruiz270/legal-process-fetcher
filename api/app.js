export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Legal Process Fetcher</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; }
        .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        h1 { color: #333; text-align: center; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: 600; }
        input, select, button { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
        button { background: #007bff; color: white; border: none; cursor: pointer; font-weight: 600; }
        button:hover { background: #0056b3; }
        .results { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>⚖️ Legal Process Fetcher</h1>
            <form id="searchForm">
                <div class="form-group">
                    <label>CNPJ:</label>
                    <input type="text" id="cnpj" placeholder="08.049.394/0001-84" required>
                </div>
                <div class="form-group">
                    <label>Court Type:</label>
                    <select id="courtType">
                        <option value="">All Courts</option>
                        <option value="labor">Labor Courts</option>
                        <option value="civil">Civil Courts</option>
                    </select>
                </div>
                <button type="submit">🔍 Search Processes</button>
            </form>
        </div>
        <div id="results" class="results"></div>
    </div>

    <script>
        document.getElementById('searchForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const cnpj = document.getElementById('cnpj').value;
            const courtType = document.getElementById('courtType').value;
            const resultsDiv = document.getElementById('results');
            
            resultsDiv.innerHTML = '<div class="card">🔄 Searching...</div>';
            
            try {
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cnpj, courtType })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    let html = '<div class="card">✅ Search completed for CNPJ: ' + result.data.cnpj + '<br>Total processes: ' + result.data.totalProcesses + '</div>';
                    if (result.data.searchResults && result.data.searchResults.results) {
                        result.data.searchResults.results.forEach(court => {
                            html += '<div class="card"><h3>' + court.courtName + '</h3><p>Processes: ' + court.processCount + '</p></div>';
                        });
                    }
                    resultsDiv.innerHTML = html;
                } else {
                    resultsDiv.innerHTML = '<div class="card" style="color: red;">❌ Error: ' + result.error + '</div>';
                }
            } catch (error) {
                resultsDiv.innerHTML = '<div class="card" style="color: red;">❌ Network Error: ' + error.message + '</div>';
            }
        });
    </script>
</body>
</html>
`);
}