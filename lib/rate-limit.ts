/**
 * In-memory rate limiter for public endpoints (e.g. /api/leads, login).
 * Production: replace with Redis or similar for multi-instance.
 */
const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

export function rateLimit(key: string, max: number = MAX_REQUESTS, windowMs: number = WINDOW_MS): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

export function getRateLimitKey(identifier: string, prefix: string): string {
  return `${prefix}:${identifier}`;
}
