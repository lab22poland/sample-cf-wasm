# Cloudflare WebAssembly Worker Demo

A pure WebAssembly implementation of a Cloudflare Worker with mathematical operations compiled from Rust. This project demonstrates the **successful integration of WebAssembly with Cloudflare Workers** using static imports and raw WASM exports.

**🌐 Live Demo:** https://sample-cf-wasm.hcc07-org.workers.dev  
**Implementation:** Pure WebAssembly (Rust → WASM)  
**Status:** ✅ Production Ready

## 🚀 Features

- **Pure WebAssembly**: All computational logic runs in WASM compiled from Rust
- **Zero JavaScript Logic**: Minimal JavaScript glue code for HTTP routing only
- **Mathematical Functions**: Addition, factorial, prime checking, Fibonacci sequences  
- **Hashing Operations**: Simple hash function for strings
- **Interactive Demo**: Built-in web interface to test all functions
- **REST API**: JSON endpoints for all mathematical operations
- **Production Deployed**: Live and tested on Cloudflare Workers

## ✅ **WebAssembly SUCCESS!**

**This project demonstrates the working solution for WebAssembly in Cloudflare Workers:**

### 🔑 **The Working Approach**
- **Static imports**: `import wasmModule from './file.wasm'`
- **Raw WASM exports**: Using `#[no_mangle]` instead of `wasm-bindgen`
- **Direct instantiation**: `WebAssembly.instantiate(wasmModule)`
- **CompiledWasm rules** in `wrangler.toml`

### 🎯 **Implementation Details**
- **Language**: Rust compiled to WebAssembly
- **Build System**: Cargo with `wasm32-unknown-unknown` target
- **Bundle Size**: ~9KB total (WASM + minimal JS wrapper)
- **Performance**: Native WebAssembly speed for all computations

## 🌐 Current Deployment

The worker is **live and running pure WebAssembly** at: https://sample-cf-wasm.hcc07-org.workers.dev

**Implementation:** Pure WebAssembly (Rust)  
**JavaScript Code**: Minimal HTTP routing wrapper only  
**Status**: ✅ All endpoints working with WASM  
**Performance**: Native WebAssembly execution speed

## 📋 Prerequisites

1. **Node.js** (v16 or later)
2. **Rust** and **Cargo** 
3. **Wrangler CLI** - Cloudflare's CLI tool

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Wrangler** (if not already installed):
   ```bash
   npm install -g wrangler
   ```

3. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

## 🔨 Building

Build the WebAssembly module:

```bash
npm run build
```

This command:
1. Compiles the Rust code to WebAssembly using Cargo
2. Copies the WASM module to the correct location
3. Prepares the worker for deployment

## 🧪 Development

Run the worker locally for testing:

```bash
npm run dev
```

This will start a local development server at `http://localhost:8787`

## 🌐 Available Endpoints

| Endpoint | Description | Example |
|----------|-------------|---------|
| `/` | Interactive demo page | `GET /` |
| `/status` | Check WASM implementation status | `GET /status` |
| `/add` | Add two numbers | `GET /add?a=5&b=3` |
| `/factorial` | Calculate factorial (0-20) | `GET /factorial?n=5` |
| `/prime` | Check if number is prime | `GET /prime?n=17` |
| `/fibonacci` | Get Fibonacci number (0-40) | `GET /fibonacci?n=10` |
| `/hash` | Calculate simple hash | `GET /hash?input=cloudflare` |

## 📡 Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## 🧩 Project Structure

```
sample-cf-wasm/
├── src/
│   ├── index-wasm.js     # Pure WebAssembly worker (main entry)
│   └── wasm-pkg/         # Generated WASM module and bindings
│       └── cf_wasm_lib_bg.wasm
├── wasm/
│   ├── src/
│   │   └── lib.rs        # Rust WebAssembly source code
│   ├── Cargo.toml        # Rust dependencies and configuration
│   └── target/           # Rust build output
├── package.json          # Node.js dependencies and scripts
├── wrangler.toml         # Cloudflare Worker configuration
└── README.md            # This file
```

## 🔧 How It Works

1. **Rust Code**: The `wasm/src/lib.rs` file contains Rust functions with `#[no_mangle]` exports
2. **Compilation**: Cargo compiles the Rust code directly to WebAssembly
3. **Static Import**: The worker imports the WASM module at build time
4. **Direct Calls**: JavaScript calls WASM functions directly via `instance.exports.functionName()`
5. **HTTP API**: The worker exposes WASM functions through HTTP endpoints

## 🎯 Example Usage

### Test the live WebAssembly API:

```bash
# Check WASM implementation status
curl "https://sample-cf-wasm.hcc07-org.workers.dev/status"

# Mathematical operations (all computed in WASM)
curl "https://sample-cf-wasm.hcc07-org.workers.dev/add?a=15&b=27"
curl "https://sample-cf-wasm.hcc07-org.workers.dev/factorial?n=7"
curl "https://sample-cf-wasm.hcc07-org.workers.dev/prime?n=97"
curl "https://sample-cf-wasm.hcc07-org.workers.dev/fibonacci?n=15"

# Hash operations (computed in WASM)
curl "https://sample-cf-wasm.hcc07-org.workers.dev/hash?input=WebAssembly"

# Interactive demo (open in browser)
open "https://sample-cf-wasm.hcc07-org.workers.dev/"
```

## 🎨 Customization

### Adding New WASM Functions

1. Add your function to `wasm/src/lib.rs` with the `#[no_mangle]` annotation:

```rust
// In wasm/src/lib.rs
#[no_mangle]
pub extern "C" fn multiply(a: i32, b: i32) -> i32 {
    a * b
}
```

2. Rebuild the WASM module:
```bash
npm run build:wasm
```

3. Add the endpoint to `src/index-wasm.js`:
```javascript
case '/multiply':
  const a = parseInt(url.searchParams.get('a') || '1');
  const b = parseInt(url.searchParams.get('b') || '1');
  const product = instance.exports.multiply(a, b);
  return new Response(JSON.stringify({ 
    operation: 'multiply', 
    inputs: { a, b }, 
    result: product 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
```

## 📝 Implementation Notes

### Pure WebAssembly Architecture
- **Design**: Direct WebAssembly execution with minimal JavaScript wrapper
- **Performance**: Native WASM speed for all computational operations
- **Bundle Size**: Optimized for edge deployment (~9KB total)
- **Reliability**: 100% WebAssembly execution, no fallbacks needed

### Technical Achievements
- ✅ Successfully resolved Cloudflare Workers WASM integration challenges
- ✅ Zero JavaScript computational logic - pure WASM execution
- ✅ Static imports working correctly in production
- ✅ Raw WASM exports providing optimal performance
- ✅ Comprehensive error handling and input validation
- ✅ Interactive demo with real-time WASM function testing

### Build Process
- Uses Rust's native WASM target (`wasm32-unknown-unknown`)
- Direct Cargo compilation without `wasm-bindgen` complexity
- Optimized WASM output with minimal JavaScript wrapper
- Static analysis friendly for Cloudflare Workers bundling

## 🤝 Contributing

This project demonstrates a working pattern for WebAssembly in Cloudflare Workers. Feel free to:
- Add more mathematical functions to `wasm/src/lib.rs`
- Implement additional WASM-accelerated operations
- Optimize the build process or bundle size
- Enhance the interactive demo interface

## 🏆 Success Metrics

- **✅ Working WebAssembly**: Successfully running WASM in production
- **✅ Zero Fallbacks**: No JavaScript computational code needed
- **✅ Fast Performance**: Native WASM execution speed
- **✅ Small Bundle**: ~9KB total deployment size
- **✅ Production Ready**: Live deployment with full testing

## 📄 License

This project is licensed under the MIT License. 