use wasm_bindgen::prelude::*;

// Import the `console.log` function from the `console` object
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! console_log {
    ( $( $t:tt )* ) => {
        log(&format!( $( $t )* ))
    }
}

// A simple function that adds two numbers
#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

// A function that calculates the factorial of a number
#[wasm_bindgen]
pub fn factorial(n: u32) -> u64 {
    if n == 0 {
        1
    } else {
        (1..=n as u64).product()
    }
}

// A function that checks if a number is prime
#[wasm_bindgen]
pub fn is_prime(n: u32) -> bool {
    if n < 2 {
        return false;
    }
    
    for i in 2..=(n as f64).sqrt() as u32 {
        if n % i == 0 {
            return false;
        }
    }
    true
}

// A function that returns the Fibonacci number at position n
#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u64 {
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

// A function that processes a string (reverses it)
#[wasm_bindgen]
pub fn reverse_string(input: &str) -> String {
    input.chars().rev().collect()
}

// A function that calculates hash (simple djb2 hash)
#[wasm_bindgen]
pub fn simple_hash(input: &str) -> u32 {
    let mut hash: u32 = 5381;
    for byte in input.bytes() {
        hash = hash.wrapping_mul(33).wrapping_add(byte as u32);
    }
    hash
}

// Called when the wasm module is instantiated
#[wasm_bindgen(start)]
pub fn main() {
    console_log!("WebAssembly module loaded successfully!");
} 