import init, {
  add,
  factorial,
  is_prime,
  fibonacci,
  reverse_string,
  simple_hash
} from './wasm-pkg/cf_wasm_lib.js';
import wasmModule from './wasm-pkg/cf_wasm_lib_bg.wasm';

// Initialize the WASM module
let wasmInitialized = false;

async function initWasm() {
  if (!wasmInitialized) {
    await init(wasmModule);
    wasmInitialized = true;
  }
}

export default {
  async fetch(request, env, ctx) {
    // Initialize WASM module if not already done
    await initWasm();

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
        const sum = add(a, b);
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
        const fact = factorial(n);
        return new Response(JSON.stringify({ 
          operation: 'factorial', 
          input: n, 
          result: fact.toString() 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case '/prime':
        const num = parseInt(url.searchParams.get('n') || '17');
        const isPrime = is_prime(num);
        return new Response(JSON.stringify({ 
          operation: 'is_prime', 
          input: num, 
          result: isPrime 
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
        const fibResult = fibonacci(fibN);
        return new Response(JSON.stringify({ 
          operation: 'fibonacci', 
          input: fibN, 
          result: fibResult.toString() 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case '/reverse':
        const text = url.searchParams.get('text') || 'Hello World';
        const reversed = reverse_string(text);
        return new Response(JSON.stringify({ 
          operation: 'reverse_string', 
          input: text, 
          result: reversed 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case '/hash':
        const input = url.searchParams.get('input') || 'cloudflare';
        const hash = simple_hash(input);
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
  }
};

function getHomePage() {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Cloudflare WebAssembly Worker Demo</title>
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
    <h1>🚀 Cloudflare WebAssembly Worker Demo</h1>
    <p>This worker demonstrates WebAssembly integration with various mathematical and string operations.</p>
    
    <div class="endpoint">
        <h3>📊 Available Endpoints:</h3>
        <ul>
            <li><code>/add?a=5&b=3</code> - Add two numbers</li>
            <li><code>/factorial?n=5</code> - Calculate factorial</li>
            <li><code>/prime?n=17</code> - Check if number is prime</li>
            <li><code>/fibonacci?n=10</code> - Get Fibonacci number</li>
            <li><code>/reverse?text=hello</code> - Reverse a string</li>
            <li><code>/hash?input=cloudflare</code> - Calculate simple hash</li>
        </ul>
    </div>
    
    <div class="endpoint">
        <h3>🧪 Try the demos:</h3>
        <button class="demo-button" onclick="testEndpoint('/add?a=15&b=27')">Add 15 + 27</button>
        <button class="demo-button" onclick="testEndpoint('/factorial?n=7')">Factorial of 7</button>
        <button class="demo-button" onclick="testEndpoint('/prime?n=97')">Is 97 prime?</button>
        <button class="demo-button" onclick="testEndpoint('/fibonacci?n=15')">15th Fibonacci</button>
        <button class="demo-button" onclick="testEndpoint('/reverse?text=WebAssembly')">Reverse "WebAssembly"</button>
        <button class="demo-button" onclick="testEndpoint('/hash?input=CloudflareWorker')">Hash "CloudflareWorker"</button>
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