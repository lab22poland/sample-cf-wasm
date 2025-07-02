export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle different API endpoints
    switch (path) {
      case '/':
        return new Response(getHomePage(), {
          headers: { 'Content-Type': 'text/html' }
        });

      case '/add':
        const a = parseInt(url.searchParams.get('a') || '0');
        const b = parseInt(url.searchParams.get('b') || '0');
        const sum = a + b; // Simple JavaScript addition
        return new Response(JSON.stringify({ 
          operation: 'add', 
          inputs: { a, b }, 
          result: sum,
          note: 'JavaScript implementation (no WASM)' 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case '/factorial':
        const n = parseInt(url.searchParams.get('n') || '5');
        if (n < 0 || n > 20) {
          return new Response(JSON.stringify({ 
            error: 'Number must be between 0 and 20' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        // Simple JavaScript factorial
        let fact = 1;
        for (let i = 2; i <= n; i++) {
          fact *= i;
        }
        return new Response(JSON.stringify({ 
          operation: 'factorial', 
          input: n, 
          result: fact.toString(),
          note: 'JavaScript implementation (no WASM)' 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case '/test':
        return new Response(JSON.stringify({ 
          status: 'ok',
          message: 'Worker is working!',
          timestamp: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      default:
        return new Response('Not Found', { status: 404 });
    }
  }
};

function getHomePage() {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Cloudflare Worker Test (No WASM)</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .endpoint h3 { margin-top: 0; color: #333; }
        .endpoint code { background: #e0e0e0; padding: 2px 4px; border-radius: 3px; }
        .demo-button { background: #0066cc; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
        .demo-button:hover { background: #0052a3; }
        #result { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; min-height: 50px; }
    </style>
</head>
<body>
    <h1>🧪 Cloudflare Worker Test (No WASM)</h1>
    <p>This is a test worker without WebAssembly to verify basic functionality.</p>
    
    <div class="endpoint">
        <h3>📊 Available Test Endpoints:</h3>
        <ul>
            <li><code>/test</code> - Basic status check</li>
            <li><code>/add?a=5&b=3</code> - Add two numbers (JavaScript)</li>
            <li><code>/factorial?n=5</code> - Calculate factorial (JavaScript)</li>
        </ul>
    </div>
    
    <div class="endpoint">
        <h3>🧪 Try the demos:</h3>
        <button class="demo-button" onclick="testEndpoint('/test')">Status Check</button>
        <button class="demo-button" onclick="testEndpoint('/add?a=15&b=27')">Add 15 + 27</button>
        <button class="demo-button" onclick="testEndpoint('/factorial?n=7')">Factorial of 7</button>
    </div>
    
    <div id="result"></div>
    
    <script>
        async function testEndpoint(endpoint) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = 'Loading...';
            
            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                resultDiv.innerHTML = '<strong>Result:</strong><br><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                resultDiv.innerHTML = '<strong>Error:</strong> ' + error.message;
            }
        }
    </script>
</body>
</html>
  `;
} 