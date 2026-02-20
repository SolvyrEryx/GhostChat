// crypto.js – All cryptographic operations using Web Crypto API
// Exports functions: encryptMessage, decryptMessage (global scope)

// Fixed salt for PBKDF2 (demo only – in production use a per-user random salt)
const SALT = new TextEncoder().encode('secure-chat-demo-salt');
const ITERATIONS = 100000;
const KEY_LENGTH = 256; // bits
const IV_LENGTH = 12;    // 96 bits for GCM recommended

/**
 * Derive an AES-GCM key from a passphrase using PBKDF2.
 * @param {string} passphrase
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey(passphrase) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false, // key not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a message using AES-GCM.
 * Output format: [ENC]base64(iv + ciphertext)
 * @param {string} plaintext
 * @param {string} passphrase
 * @returns {Promise<string>}
 */
async function encryptMessage(plaintext, passphrase) {
  const key = await deriveKey(passphrase);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    enc.encode(plaintext)
  );
  // Combine IV and ciphertext into a single buffer
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  // Convert to base64
  const base64 = btoa(String.fromCharCode(...combined));
  return '[ENC]' + base64;
}

/**
 * Decrypt a message that was encrypted with encryptMessage.
 * Expects format: [ENC]base64(iv + ciphertext)
 * @param {string} encryptedText
 * @param {string} passphrase
 * @returns {Promise<string>}
 */
async function decryptMessage(encryptedText, passphrase) {
  if (!encryptedText.startsWith('[ENC]')) {
    throw new Error('Not an encrypted message');
  }
  const base64 = encryptedText.slice(5);
  const binary = atob(base64);
  const combined = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    combined[i] = binary.charCodeAt(i);
  }
  // Extract IV (first 12 bytes) and ciphertext (the rest)
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);
  const key = await deriveKey(passphrase);
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    ciphertext
  );
  const dec = new TextDecoder();
  return dec.decode(decrypted);
}