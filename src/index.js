// Hybrid WASM/JavaScript implementation
let wasmFunctions = null;
let wasmAvailable = false;

// JavaScript fallback implementations
const jsFallback = {
  add: (a, b) => a + b,
  factorial: (n) => {
    if (n === 0) return 1n;
    let result = 1n;
    for (let i = 2n; i <= BigInt(n); i++) {
      result *= i;
    }
    return result;
  },
  is_prime: (n) => {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  },
  fibonacci: (n) => {
    if (n === 0) return 0n;
    if (n === 1) return 1n;
    let a = 0n, b = 1n;
    for (let i = 2; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  },
  reverse_string: (str) => str.split('').reverse().join(''),
  simple_hash: (str) => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
    }
    return hash;
  }
};

async function initWasm() {
  if (wasmAvailable) return;
  
  try {
    // Try to load WASM module
    const wasmModule = await import('./wasm-pkg/cf_wasm_lib_bg.wasm');
    const wasmInit = await import('./wasm-pkg/cf_wasm_lib.js');
    
    await wasmInit.default(wasmModule.default);
    
    wasmFunctions = {
      add: wasmInit.add,
      factorial: wasmInit.factorial,
      is_prime: wasmInit.is_prime,
      fibonacci: wasmInit.fibonacci,
      reverse_string: wasmInit.reverse_string,
      simple_hash: wasmInit.simple_hash
    };
    
    wasmAvailable = true;
    console.log('WASM modules loaded successfully');
  } catch (error) {
    console.warn('WASM loading failed, using JavaScript fallback:', error.message);
    wasmFunctions = jsFallback;
    wasmAvailable = false;
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

      case '/status':
        return new Response(JSON.stringify({ 
          status: 'ok',
          wasm_available: wasmAvailable,
          implementation: wasmAvailable ? 'WebAssembly (Rust)' : 'JavaScript Fallback',
          timestamp: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case '/add':
        const a = parseInt(url.searchParams.get('a') || '0');
        const b = parseInt(url.searchParams.get('b') || '0');
        const sum = wasmFunctions.add(a, b);
        return new Response(JSON.stringify({ 
          operation: 'add', 
          inputs: { a, b }, 
          result: sum,
          implementation: wasmAvailable ? 'WebAssembly (Rust)' : 'JavaScript Fallback' 
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
        const fact = wasmFunctions.factorial(n);
        return new Response(JSON.stringify({ 
          operation: 'factorial', 
          input: n, 
          result: fact.toString(),
          implementation: wasmAvailable ? 'WebAssembly (Rust)' : 'JavaScript Fallback' 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case '/prime':
        const num = parseInt(url.searchParams.get('n') || '17');
        const isPrime = wasmFunctions.is_prime(num);
        return new Response(JSON.stringify({ 
          operation: 'is_prime', 
          input: num, 
          result: isPrime,
          implementation: wasmAvailable ? 'WebAssembly (Rust)' : 'JavaScript Fallback' 
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
        const fibResult = wasmFunctions.fibonacci(fibN);
        return new Response(JSON.stringify({ 
          operation: 'fibonacci', 
          input: fibN, 
          result: fibResult.toString(),
          implementation: wasmAvailable ? 'WebAssembly (Rust)' : 'JavaScript Fallback' 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case '/reverse':
        const text = url.searchParams.get('text') || 'Hello World';
        const reversed = wasmFunctions.reverse_string(text);
        return new Response(JSON.stringify({ 
          operation: 'reverse_string', 
          input: text, 
          result: reversed,
          implementation: wasmAvailable ? 'WebAssembly (Rust)' : 'JavaScript Fallback' 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      case '/hash':
        const input = url.searchParams.get('input') || 'cloudflare';
        const hash = wasmFunctions.simple_hash(input);
        return new Response(JSON.stringify({ 
          operation: 'simple_hash', 
          input: input, 
          result: hash,
          implementation: wasmAvailable ? 'WebAssembly (Rust)' : 'JavaScript Fallback' 
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
    <h1>🚀 Cloudflare Hybrid WASM/JS Worker Demo</h1>
    <p>This worker attempts to use WebAssembly (Rust) for high-performance computations, with JavaScript fallback for maximum compatibility.</p>
    
    <div class="endpoint">
        <h3>📊 Available Endpoints:</h3>
        <ul>
            <li><code>/status</code> - Check WASM/JS implementation status</li>
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
        <button class="demo-button" onclick="testEndpoint('/status')">Check Status</button>
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