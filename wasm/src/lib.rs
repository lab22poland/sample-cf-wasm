// Basic WebAssembly exports for Cloudflare Workers
// Using raw exports instead of wasm-bindgen for better static import compatibility

use std::ffi::{CStr, CString};
use std::os::raw::c_char;

// Main request handler that processes HTTP requests
#[no_mangle]
pub extern "C" fn handle_request(
    method_ptr: *const c_char,
    url_ptr: *const c_char,
    query_ptr: *const c_char,
) -> *mut c_char {
    unsafe {
        // Debug: Add some validation
        if method_ptr.is_null() || url_ptr.is_null() || query_ptr.is_null() {
            let error_response = create_error_response(500, "Null pointer received");
            return CString::new(error_response).unwrap().into_raw();
        }
        
        let method = CStr::from_ptr(method_ptr).to_string_lossy();
        let url = CStr::from_ptr(url_ptr).to_string_lossy();
        let query = CStr::from_ptr(query_ptr).to_string_lossy();
        
        let response = match method.as_ref() {
            "GET" => handle_get_request(&url, &query),
            _ => create_error_response(405, "Method Not Allowed"),
        };
        
        CString::new(response).unwrap().into_raw()
    }
}

fn handle_get_request(url: &str, query: &str) -> String {
    let path = url.split('?').next().unwrap_or(url);
    
    match path {
        "/" => create_html_response(get_home_page()),
        "/status" => create_json_response(&get_status_json()),
        "/add" => handle_add_request(query),
        "/factorial" => handle_factorial_request(query),
        "/prime" => handle_prime_request(query),
        "/fibonacci" => handle_fibonacci_request(query),
        "/hash" => handle_hash_request(query),
        _ => create_error_response(404, "Not Found"),
    }
}

fn handle_add_request(query: &str) -> String {
    let (a, b) = parse_two_numbers(query, "a", "b");
    let result = add(a, b);
    create_json_response(&format!(
        r#"{{"operation":"add","inputs":{{"a":{},"b":{}}},"result":{}}}"#,
        a, b, result
    ))
}

fn handle_factorial_request(query: &str) -> String {
    let n = parse_number(query, "n").unwrap_or(5);
    if n > 20 {
        return create_error_response(400, "Number must be between 0 and 20");
    }
    let result = factorial(n as u32);
    create_json_response(&format!(
        r#"{{"operation":"factorial","input":{},"result":"{}"}}"#,
        n, result
    ))
}

fn handle_prime_request(query: &str) -> String {
    let n = parse_number(query, "n").unwrap_or(17);
    let result = is_prime(n as u32) != 0;
    create_json_response(&format!(
        r#"{{"operation":"is_prime","input":{},"result":{}}}"#,
        n, result
    ))
}

fn handle_fibonacci_request(query: &str) -> String {
    let n = parse_number(query, "n").unwrap_or(10);
    if n > 40 {
        return create_error_response(400, "Number must be between 0 and 40");
    }
    let result = fibonacci(n as u32);
    create_json_response(&format!(
        r#"{{"operation":"fibonacci","input":{},"result":"{}"}}"#,
        n, result
    ))
}

fn handle_hash_request(query: &str) -> String {
    let input = parse_string(query, "input").unwrap_or("cloudflare".to_string());
    let hash = simple_hash_string(&input);
    create_json_response(&format!(
        r#"{{"operation":"simple_hash","input":"{}","result":{}}}"#,
        input, hash
    ))
}

fn create_json_response(body: &str) -> String {
    format!("200|application/json|{}", body)
}

fn create_html_response(body: String) -> String {
    format!("200|text/html|{}", body)
}

fn create_error_response(status: u16, message: &str) -> String {
    format!("{}|application/json|{{\"error\":\"{}\"}}", status, message)
}

fn get_status_json() -> String {
    format!(
        r#"{{"status":"ok","implementation":"Pure WebAssembly","timestamp":"{}","message":"Handled by WASM"}}"#,
        "2024-01-01T00:00:00.000Z" // Would need JS to provide real timestamp
    )
}

fn parse_number(query: &str, param: &str) -> Option<i32> {
    query.split('&')
        .find(|part| part.starts_with(&format!("{}=", param)))
        .and_then(|part| part.split('=').nth(1))
        .and_then(|value| value.parse().ok())
}

fn parse_two_numbers(query: &str, param1: &str, param2: &str) -> (i32, i32) {
    let a = parse_number(query, param1).unwrap_or(0);
    let b = parse_number(query, param2).unwrap_or(0);
    (a, b)
}

fn parse_string(query: &str, param: &str) -> Option<String> {
    query.split('&')
        .find(|part| part.starts_with(&format!("{}=", param)))
        .and_then(|part| part.split('=').nth(1))
        .map(|value| urlencoding::decode(value).unwrap_or_default().to_string())
}

// Free the string allocated by handle_request
#[no_mangle]
pub extern "C" fn free_string(ptr: *mut c_char) {
    unsafe {
        if !ptr.is_null() {
            let _ = CString::from_raw(ptr);
        }
    }
}

fn simple_hash_string(input: &str) -> u32 {
    let bytes = input.as_bytes();
    let mut hash: u32 = 5381;
    for &byte in bytes {
        hash = hash.wrapping_mul(33).wrapping_add(byte as u32);
    }
    hash
}

fn get_home_page() -> String {
    r#"<!DOCTYPE html>
<html>
<head>
    <title>WASM-Handled Worker</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🦀 WASM-Handled Worker</h1>
    <p>This request was processed entirely in WebAssembly!</p>
    <div class="endpoint">
        <h3>📊 Available Endpoints:</h3>
        <ul>
            <li><code>/status</code> - Check WASM status</li>
            <li><code>/add?a=5&b=3</code> - Add two numbers</li>
            <li><code>/factorial?n=5</code> - Calculate factorial</li>
            <li><code>/prime?n=17</code> - Check if number is prime</li>
            <li><code>/fibonacci?n=10</code> - Get Fibonacci number</li>
            <li><code>/hash?input=test</code> - Simple hash function</li>
        </ul>
    </div>
</body>
</html>"#.to_string()
}

// A simple function that adds two numbers
#[no_mangle]
pub extern "C" fn add(a: i32, b: i32) -> i32 {
    a + b
}

// A function that calculates the factorial of a number
#[no_mangle]
pub extern "C" fn factorial(n: u32) -> u64 {
    if n == 0 {
        1
    } else {
        (1..=n as u64).product()
    }
}

// A function that checks if a number is prime (returns 1 for true, 0 for false)
#[no_mangle]
pub extern "C" fn is_prime(n: u32) -> i32 {
    let result = if n < 2 {
        false
    } else if n == 2 {
        true
    } else if n % 2 == 0 {
        false
    } else {
        let sqrt_n = (n as f64).sqrt() as u32;
        !(3..=sqrt_n).step_by(2).any(|i| n % i == 0)
    };
    
    if result { 1 } else { 0 }
}

// A function that returns the Fibonacci number at position n
#[no_mangle]
pub extern "C" fn fibonacci(n: u32) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => {
            let mut a = 0;
            let mut b = 1;
            for _ in 2..=n {
                let temp = a + b;
                a = b;
                b = temp;
            }
            b
        }
    }
}

// Simple hash function that works with raw memory
#[no_mangle]
pub extern "C" fn simple_hash_bytes(ptr: *const u8, len: usize) -> u32 {
    let input = unsafe { std::slice::from_raw_parts(ptr, len) };
    let mut hash: u32 = 5381;
    for &byte in input {
        hash = hash.wrapping_mul(33).wrapping_add(byte as u32);
    }
    hash
} 