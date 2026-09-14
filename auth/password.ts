import { fromHex, timingSafeEqual, toHex } from "./encoding";

export const PASSWORD_ALGO = "pbkdf2-sha256";

// OWASP's current baseline for PBKDF2-HMAC-SHA-256 (2024 revision of the
// Password Storage Cheat Sheet). This has not been measured against real
// Workers CPU-time limits yet — see CLAUDE.md's Coding Rules. If login
// requests start hitting CPU limits in production, lower this and bump
// `PASSWORD_ALGO`/store the new count per-row so existing accounts keep
// working with their original iteration count.
const ITERATIONS = 600_000;
const SALT_BYTES = 16;
const HASH_BITS = 256;

export type StoredPassword = {
  hash: string;
  salt: string;
  iterations: number;
  algo: string;
};

async function deriveBits(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    HASH_BITS,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<StoredPassword> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriveBits(password, salt, ITERATIONS);
  return {
    hash: toHex(hash),
    salt: toHex(salt),
    iterations: ITERATIONS,
    algo: PASSWORD_ALGO,
  };
}

export async function verifyPassword(password: string, stored: StoredPassword): Promise<boolean> {
  if (stored.algo !== PASSWORD_ALGO) return false;
  const salt = fromHex(stored.salt);
  const computed = await deriveBits(password, salt, stored.iterations);
  return timingSafeEqual(toHex(computed), stored.hash);
}
