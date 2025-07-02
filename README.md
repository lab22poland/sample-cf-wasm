# Cloudflare WebAssembly Worker Demo

This project demonstrates how to create a Cloudflare Worker that uses WebAssembly (WASM) for high-performance computations. The WebAssembly module is written in Rust and provides various mathematical and string operations.

## 🚀 Features

- **WebAssembly Integration**: Rust-compiled WASM module for high-performance operations
- **Mathematical Functions**: Addition, factorial, prime checking, Fibonacci sequences
- **String Operations**: String reversal and simple hashing
- **Interactive Demo**: Built-in web interface to test all functions
- **REST API**: JSON endpoints for all WASM functions

## 📋 Prerequisites

Before you start, make sure you have the following installed:

1. **Node.js** (v16 or later)
2. **Rust** and **Cargo**
3. **wasm-pack** - Install with: `brew install wasm-pack` (macOS) or `curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh`
4. **Wrangler CLI** - Cloudflare's CLI tool

## 🛠️ Setup

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Install wasm-pack** (if not already installed):
   \`\`\`bash
   # On macOS with Homebrew (recommended)
   brew install wasm-pack
   
   # Alternative: Direct installation
   curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
   \`\`\`

3. **Install Wrangler** (if not already installed):
   \`\`\`bash
   npm install -g wrangler
   \`\`\`

4. **Login to Cloudflare:**
   \`\`\`bash
   wrangler login
   \`\`\`

## 🔨 Building

Build the WebAssembly module and the worker:

\`\`\`bash
npm run build
\`\`\`

This command:
1. Compiles the Rust code to WebAssembly using wasm-pack
2. Generates JavaScript bindings
3. Prepares the worker for deployment

## 🧪 Development

Run the worker locally for testing:

\`\`\`bash
npm run dev
\`\`\`

This will start a local development server. You can then test the worker at `http://localhost:8787`

## 🌐 Available Endpoints

| Endpoint | Description | Example |
|----------|-------------|---------|
| `/` | Interactive demo page | `GET /` |
| `/add` | Add two numbers | `GET /add?a=5&b=3` |
| `/factorial` | Calculate factorial | `GET /factorial?n=5` |
| `/prime` | Check if number is prime | `GET /prime?n=17` |
| `/fibonacci` | Get Fibonacci number | `GET /fibonacci?n=10` |
| `/reverse` | Reverse a string | `GET /reverse?text=hello` |
| `/hash` | Calculate simple hash | `GET /hash?input=cloudflare` |

## 📡 Deployment

Deploy to Cloudflare Workers:

\`\`\`bash
npm run deploy
\`\`\`

## 🧩 Project Structure

\`\`\`
sample-cf-wasm/
├── src/
│   └── index.js          # Main Cloudflare Worker script
├── wasm/
│   ├── src/
│   │   └── lib.rs        # Rust WebAssembly source code
│   └── Cargo.toml        # Rust dependencies and configuration
├── package.json          # Node.js dependencies and scripts
├── wrangler.toml         # Cloudflare Worker configuration
└── README.md            # This file
\`\`\`

## 🔧 How It Works

1. **Rust Code**: The `wasm/src/lib.rs` file contains Rust functions annotated with `#[wasm_bindgen]`
2. **Compilation**: `wasm-pack` compiles the Rust code to WebAssembly and generates JavaScript bindings
3. **Worker Integration**: The Cloudflare Worker loads the WASM module and calls its functions
4. **HTTP API**: The worker exposes the WASM functions through HTTP endpoints

## 🎯 Example Usage

### Test the API endpoints:

\`\`\`bash
# Add two numbers
curl "https://your-worker.your-subdomain.workers.dev/add?a=15&b=27"

# Calculate factorial
curl "https://your-worker.your-subdomain.workers.dev/factorial?n=7"

# Check if number is prime
curl "https://your-worker.your-subdomain.workers.dev/prime?n=97"

# Get Fibonacci number
curl "https://your-worker.your-subdomain.workers.dev/fibonacci?n=15"

# Reverse string
curl "https://your-worker.your-subdomain.workers.dev/reverse?text=WebAssembly"

# Calculate hash
curl "https://your-worker.your-subdomain.workers.dev/hash?input=CloudflareWorker"
\`\`\`

## 🎨 Customization

### Adding New WASM Functions

1. Add your function to `wasm/src/lib.rs` with the `#[wasm_bindgen]` annotation
2. Rebuild the WASM module: `npm run build:wasm`
3. Import and use the function in `src/index.js`
4. Add a new endpoint to handle HTTP requests

### Example:

\`\`\`rust
// In wasm/src/lib.rs
#[wasm_bindgen]
pub fn multiply(a: i32, b: i32) -> i32 {
    a * b
}
\`\`\`

\`\`\`javascript
// In src/index.js
import { multiply } from './wasm-pkg/cf_wasm_lib.js';

// Add new case in the switch statement
case '/multiply':
  const x = parseInt(url.searchParams.get('x') || '1');
  const y = parseInt(url.searchParams.get('y') || '1');
  const product = multiply(x, y);
  return new Response(JSON.stringify({ 
    operation: 'multiply', 
    inputs: { x, y }, 
    result: product 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
\`\`\`

## 📝 Notes

- The WASM module is optimized for size (`opt-level = "s"`)
- Functions include input validation and error handling
- The interactive demo page provides an easy way to test all functions
- WebAssembly provides near-native performance for computationally intensive tasks

## 🤝 Contributing

Feel free to add more mathematical functions, string operations, or other computationally intensive tasks to demonstrate the power of WebAssembly in Cloudflare Workers!

## 📄 License

This project is licensed under the MIT License. 