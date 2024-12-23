use {crate::hashers::Hasher, serde::Serialize, sha3::Digest, slow_primes::is_prime_miller_rabin};

#[derive(Clone, Default, Debug, Eq, PartialEq, Serialize)]
pub struct PrimeHasher {}

impl Hasher for PrimeHasher {
    // u128 in big endian bytes
    type Hash = [u8; 16];

    fn hashv(data: &[impl AsRef<[u8]>]) -> [u8; 16] {
        // Scan for primes generated by hashing the bytes starting from 0. We use a number like
        // this so once the prime is found we can directly compute the hash instead of scanning
        // the range again.
        let mut search = 0usize;

        loop {
            // Increment Search Counter.
            search += 1;

            // Hash Input.
            let mut hasher = sha3::Sha3_256::new();
            for d in data {
                hasher.update(d);
            }
            hasher.update(search.to_be_bytes());
            let hash_bytes: [u8; 32] = hasher.finalize().into();

            // Take only a u32 from the end, return if its prime.
            let prime = u32::from_be_bytes(hash_bytes[28..].try_into().unwrap()) | 1;
            if is_prime_miller_rabin(prime as u64) {
                return (prime as u128).to_be_bytes();
            }
        }
    }
}
