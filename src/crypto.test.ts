import { describe, it, expect } from "vitest";
import { encrypt, decrypt, toBase64Url, fromBase64Url } from "./crypto.js";

describe("encrypt", () => {
  it("returns ciphertext, iv, and key as Buffers", () => {
    const result = encrypt(Buffer.from("hello"));
    expect(Buffer.isBuffer(result.ciphertext)).toBe(true);
    expect(Buffer.isBuffer(result.iv)).toBe(true);
    expect(Buffer.isBuffer(result.key)).toBe(true);
  });

  it("generates a 32-byte key (AES-256)", () => {
    const { key } = encrypt(Buffer.from("hello"));
    expect(key.length).toBe(32);
  });

  it("generates a 12-byte IV (GCM standard)", () => {
    const { iv } = encrypt(Buffer.from("hello"));
    expect(iv.length).toBe(12);
  });

  it("ciphertext includes 16-byte auth tag", () => {
    const plaintext = Buffer.from("hello");
    const { ciphertext } = encrypt(plaintext);
    // ciphertext = encrypted data + 16-byte auth tag
    expect(ciphertext.length).toBe(plaintext.length + 16);
  });

  it("produces unique outputs per call (non-deterministic)", () => {
    const plaintext = Buffer.from("same input");
    const a = encrypt(plaintext);
    const b = encrypt(plaintext);
    expect(a.key).not.toEqual(b.key);
    expect(a.iv).not.toEqual(b.iv);
    expect(a.ciphertext).not.toEqual(b.ciphertext);
  });
});

describe("encrypt/decrypt round-trip", () => {
  it("round-trips correctly", () => {
    const original = Buffer.from("Hello, World!");
    const { ciphertext, iv, key } = encrypt(original);
    const decrypted = decrypt(ciphertext, iv, key);
    expect(decrypted).toEqual(original);
  });

  it("round-trips with empty buffer", () => {
    const original = Buffer.alloc(0);
    const { ciphertext, iv, key } = encrypt(original);
    const decrypted = decrypt(ciphertext, iv, key);
    expect(decrypted).toEqual(original);
  });

  it("round-trips with large content (~2MB)", () => {
    const original = Buffer.alloc(2 * 1024 * 1024, "x");
    const { ciphertext, iv, key } = encrypt(original);
    const decrypted = decrypt(ciphertext, iv, key);
    expect(decrypted).toEqual(original);
  });

  it("round-trips with unicode and emoji", () => {
    const original = Buffer.from("日本語テスト 🎉🚀 مرحبا");
    const { ciphertext, iv, key } = encrypt(original);
    const decrypted = decrypt(ciphertext, iv, key);
    expect(decrypted.toString("utf-8")).toBe("日本語テスト 🎉🚀 مرحبا");
  });
});

describe("decrypt failures", () => {
  it("fails with wrong key", () => {
    const { ciphertext, iv } = encrypt(Buffer.from("secret"));
    const wrongKey = Buffer.alloc(32, 0);
    expect(() => decrypt(ciphertext, iv, wrongKey)).toThrow();
  });

  it("fails with wrong IV", () => {
    const { ciphertext, key } = encrypt(Buffer.from("secret"));
    const wrongIv = Buffer.alloc(12, 0);
    expect(() => decrypt(ciphertext, wrongIv, key)).toThrow();
  });

  it("fails with tampered ciphertext", () => {
    const { ciphertext, iv, key } = encrypt(Buffer.from("secret"));
    ciphertext[0] ^= 0xff; // flip bits
    expect(() => decrypt(ciphertext, iv, key)).toThrow();
  });
});

describe("toBase64Url", () => {
  it("produces no +, /, or = characters", () => {
    // Use a key that would produce these chars in standard base64
    const buffer = Buffer.from([0xff, 0xfe, 0xfd, 0xfc, 0xfb, 0xfa]);
    const encoded = toBase64Url(buffer);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it("round-trips with fromBase64Url", () => {
    const original = Buffer.from("test data for base64url encoding!");
    const encoded = toBase64Url(original);
    const decoded = fromBase64Url(encoded);
    expect(decoded).toEqual(original);
  });
});

describe("fromBase64Url", () => {
  it("restores padding correctly", () => {
    // 1 byte → 2 base64 chars → needs 2 padding chars
    const buf = Buffer.from([0xab]);
    const encoded = toBase64Url(buf); // "qw" (no padding)
    expect(encoded).not.toContain("=");
    const decoded = fromBase64Url(encoded);
    expect(decoded).toEqual(buf);
  });

  it("handles already-padded input", () => {
    const original = Buffer.from("hello");
    const standard = original.toString("base64"); // "aGVsbG8="
    // fromBase64Url should handle standard base64 after replacement
    const decoded = fromBase64Url(
      standard.replace(/\+/g, "-").replace(/\//g, "_"),
    );
    expect(decoded).toEqual(original);
  });
});
