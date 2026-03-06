import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits (recommended for GCM)
const AUTH_TAG_LENGTH = 16; // 128 bits

export interface EncryptResult {
  ciphertext: Buffer;
  iv: Buffer;
  key: Buffer;
}

export function encrypt(plaintext: Buffer): EncryptResult {
  const key = randomBytes(KEY_LENGTH);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Append auth tag to ciphertext (matches Web Crypto API behavior)
  const ciphertext = Buffer.concat([encrypted, authTag]);

  return { ciphertext, iv, key };
}

export function decrypt(
  ciphertext: Buffer,
  iv: Buffer,
  key: Buffer,
): Buffer {
  const encrypted = ciphertext.subarray(
    0,
    ciphertext.length - AUTH_TAG_LENGTH,
  );
  const authTag = ciphertext.subarray(ciphertext.length - AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

export function toBase64Url(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function fromBase64Url(str: string): Buffer {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64");
}
