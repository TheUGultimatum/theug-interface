import crypto from "crypto";

const DEFAULT_USERNAME = "theug";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "theug-interface-secret-key-99887766";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory rate limiting tracker (per runtime instance)
interface RateLimitEntry {
  attempts: number;
  lockedUntil?: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(identifier: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry) return { allowed: true };

  if (entry.lockedUntil && entry.lockedUntil > now) {
    const waitSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  return { allowed: true };
}

export function recordFailedAttempt(identifier: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier) || { attempts: 0 };
  entry.attempts += 1;

  if (entry.attempts >= 5) {
    entry.lockedUntil = now + 15 * 60 * 1000; // Lock for 15 minutes
    entry.attempts = 0;
  }

  rateLimitMap.set(identifier, entry);
}

export function resetRateLimit(identifier: string) {
  rateLimitMap.delete(identifier);
}

function safeCompare(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function verifyCredentials(
  username?: string,
  password?: string,
  pin?: string
): boolean {
  const expectedUser = process.env.ADMIN_USERNAME || DEFAULT_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  const expectedPin = process.env.ADMIN_PIN;

  // Strict Security: Credentials MUST be set in environment variables (.env.local or Vercel)
  if (!expectedPass || !expectedPin) {
    console.error("CRITICAL: ADMIN_PASSWORD or ADMIN_PIN is not configured in server environment variables.");
    return false;
  }

  if (!username || !password || !pin) return false;

  // Constant-time comparison via fixed 32-byte SHA-256 hashes to prevent timing attacks & buffer mismatch
  const userMatch = safeCompare(username, expectedUser);
  const passMatch = safeCompare(password, expectedPass);
  const pinMatch = safeCompare(pin, expectedPin);

  return userMatch && passMatch && pinMatch;
}

export function createSessionToken(): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = `${expiresAt}:${crypto.randomBytes(32).toString("hex")}`;
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  const token = `${payload}:${hmac}`;
  return { token, expiresAt };
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token) return false;

  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [expiresAtStr, randomHex, clientHmac] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);

  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return false; // Expired
  }

  const payload = `${expiresAtStr}:${randomHex}`;
  const expectedHmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");

  return safeCompare(clientHmac, expectedHmac);
}

