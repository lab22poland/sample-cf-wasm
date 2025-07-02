// Pure WebAssembly Worker - Minimal JavaScript wrapper
import wasmModule from './wasm-pkg/cf_wasm_lib_bg.wasm';

let wasmInstance = null;

async function initWasm() {
  if (!wasmInstance) {
    wasmInstance = await WebAssembly.instantiate(wasmModule);
  }
  return wasmInstance;
}

export default {
  async fetch(request, env, ctx) {
    try {
      const instance = await initWasm();
      const url = new URL(request.url);
      const path = url.pathname;

      switch (path) {
        case '/':
          return new Response(getHomePage(), {
            headers: { 'Content-Type': 'text/html' }
          });

        case '/status':
          return new Response(JSON.stringify({ 
            status: 'ok',
            implementation: 'Pure WebAssembly',
            timestamp: new Date().toISOString(),
            wasm_functions: Object.keys(instance.exports).filter(key => typeof instance.exports[key] === 'function')
          }), {
            headers: { 'Content-Type': 'application/json' }
          });

        case '/add':
          const a = parseInt(url.searchParams.get('a') || '0');
          const b = parseInt(url.searchParams.get('b') || '0');
          const sum = instance.exports.add(a, b);
          return new Response(JSON.stringify({ 
            operation: 'add', 
            inputs: { a, b }, 
            result: sum
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
          const fact = instance.exports.factorial(n);
          return new Response(JSON.stringify({ 
            operation: 'factorial', 
            input: n, 
            result: fact.toString()
          }), {
            headers: { 'Content-Type': 'application/json' }
          });

        case '/prime':
          const num = parseInt(url.searchParams.get('n') || '17');
          const isPrime = instance.exports.is_prime(num);
          return new Response(JSON.stringify({ 
            operation: 'is_prime', 
            input: num, 
            result: !!isPrime
          }), {
            headers: { 'Content-Type': 'application/json' }
          });

        case '/fibonacci':
          const fibN = parseInt(url.searchParams.get('n') || '10');
          if (fibN < 0 || fibN > 40) {
            return new Response(JSON.stringify({ 
              error: 'Number must be between 0 and 40' 
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          const fibResult = instance.exports.fibonacci(fibN);
          return new Response(JSON.stringify({ 
            operation: 'fibonacci', 
            input: fibN, 
            result: fibResult.toString()
          }), {
            headers: { 'Content-Type': 'application/json' }
          });

        case '/hash':
          const input = url.searchParams.get('input') || 'cloudflare';
          const encoder = new TextEncoder();
          const textBytes = encoder.encode(input);
          
          // Allocate memory and copy string data
          const memory = instance.exports.memory;
          const ptr = textBytes.length;
          const memoryArray = new Uint8Array(memory.buffer);
          memoryArray.set(textBytes, 0);
          
          const hash = instance.exports.simple_hash_bytes(0, textBytes.length);
          return new Response(JSON.stringify({ 
            operation: 'simple_hash', 
            input: input, 
            result: hash
          }), {
            headers: { 'Content-Type': 'application/json' }
          });

        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('WASM Worker Error:', error);
      return new Response(JSON.stringify({ 
        error: 'WASM execution failed', 
        message: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

function getHomePage() {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Pure WebAssembly Worker</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .endpoint h3 { margin-top: 0; color: #333; }
        .endpoint code { background: #e0e0e0; padding: 2px 4px; border-radius: 3px; }
        .demo-button { background: #0066cc; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
        .demo-button:hover { background: #0052a3; }
        #result { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; min-height: 50px; }
        .success { color: #006600; font-weight: bold; }
        .error { color: #cc0000; font-weight: bold; }
    </style>
</head>
<body>
    <h1>🦀 Pure WebAssembly Worker</h1>
    <p>This worker uses only WebAssembly functions with minimal JavaScript glue code.</p>
    
    <div class="endpoint">
        <h3>📊 Available Endpoints:</h3>
        <ul>
            <li><code>/status</code> - Check WASM status and available functions</li>
            <li><code>/add?a=5&b=3</code> - Add two numbers</li>
            <li><code>/factorial?n=5</code> - Calculate factorial</li>
            <li><code>/prime?n=17</code> - Check if number is prime</li>
            <li><code>/fibonacci?n=10</code> - Get Fibonacci number</li>
            <li><code>/hash?input=test</code> - Simple hash function</li>
        </ul>
    </div>
    
    <div class="endpoint">
        <h3>🧪 Try the demos:</h3>
        <button class="demo-button" onclick="testEndpoint('/status')">Check Status</button>
        <button class="demo-button" onclick="testEndpoint('/add?a=15&b=27')">Add 15 + 27</button>
        <button class="demo-button" onclick="testEndpoint('/factorial?n=7')">Factorial of 7</button>
        <button class="demo-button" onclick="testEndpoint('/prime?n=97')">Is 97 prime?</button>
        <button class="demo-button" onclick="testEndpoint('/fibonacci?n=15')">15th Fibonacci</button>
        <button class="demo-button" onclick="testEndpoint('/hash?input=WebAssembly')">Hash "WebAssembly"</button>
    </div>
    
    <div id="result"></div>
    
    <script>
        async function testEndpoint(endpoint) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = 'Loading...';
            
            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                
                if (response.ok) {
                    resultDiv.innerHTML = '<div class="success">✅ Success!</div><strong>Result:</strong><br><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                } else {
                    resultDiv.innerHTML = '<div class="error">❌ Error!</div><strong>Error:</strong><br><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                }
            } catch (error) {
                resultDiv.innerHTML = '<div class="error">❌ Network Error!</div><strong>Error:</strong> ' + error.message;
            }
        }
        
        window.addEventListener('load', () => testEndpoint('/status'));
    </script>
</body>
</html>
  `;
} 