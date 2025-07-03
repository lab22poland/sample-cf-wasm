// Minimal JavaScript Worker - Most logic handled by WASM
import wasmModule from './wasm-pkg/cf_wasm_lib_bg.wasm';

let wasmInstance = null;

async function initWasm() {
  if (!wasmInstance) {
    wasmInstance = await WebAssembly.instantiate(wasmModule);
  }
  return wasmInstance;
}

// Helper functions to work with WASM memory and strings
function writeStringToWasm(instance, str, offset) {
  const bytes = new TextEncoder().encode(str + '\0');
  const mem = new Uint8Array(instance.exports.memory.buffer);
  mem.set(bytes, offset);
  return offset; // Return the offset as the pointer
}

function readStringFromWasm(instance, ptr) {
  const mem = new Uint8Array(instance.exports.memory.buffer);
  let len = 0;
  while (mem[ptr + len] !== 0) len++; // Find null terminator
  return new TextDecoder().decode(mem.slice(ptr, ptr + len));
}

export default {
  async fetch(request, env, ctx) {
    try {
      const instance = await initWasm();
      const url = new URL(request.url);
      
      // Use fixed memory offsets for string passing - ensure they don't overlap
      const METHOD_OFFSET = 1000;   // Start at 1000 to avoid low memory
      const URL_OFFSET = 1100;      // Give 100 bytes for method
      const QUERY_OFFSET = 1200;    // Give 100 bytes for URL path
      
      // Pass request data to WASM for processing
      const methodPtr = writeStringToWasm(instance, request.method, METHOD_OFFSET);
      const urlPtr = writeStringToWasm(instance, url.pathname, URL_OFFSET);
      const queryPtr = writeStringToWasm(instance, url.search.slice(1), QUERY_OFFSET);
      
      // Call WASM handler
      const responsePtr = instance.exports.handle_request(methodPtr, urlPtr, queryPtr);
      
      if (!responsePtr) {
        throw new Error('WASM handle_request returned null');
      }
      
      const responseStr = readStringFromWasm(instance, responsePtr);
      
      // Parse WASM response format: "status|content-type|body"
      const [status, contentType, ...bodyParts] = responseStr.split('|');
      const body = bodyParts.join('|'); // In case body contains pipes
      
      // Clean up WASM memory
      instance.exports.free_string(responsePtr);
      
      return new Response(body, {
        status: parseInt(status),
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
        }
      });
      
    } catch (error) {
      console.error('WASM Worker Error:', error);
      return new Response(JSON.stringify({ 
        error: 'WASM execution failed', 
        message: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}; 