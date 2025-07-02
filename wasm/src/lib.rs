// Basic WebAssembly exports for Cloudflare Workers
// Using raw exports instead of wasm-bindgen for better static import compatibility

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