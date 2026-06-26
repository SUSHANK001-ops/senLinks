/**
 * Simple in-memory IP-based rate limiter using a sliding window approach.
 * Resets on server restart — suitable for development and light production use.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Check if a request from `ip` exceeds the rate limit.
 * @param ip - Requester IP address
 * @param limit - Max requests allowed in the window
 * @param windowMs - Window duration in milliseconds
 * @returns { allowed: boolean, remaining: number }
 */
export function rateLimit(
  ip: string,
  limit = 5,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}

// Cleanup old entries every 5 minutes to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > 300_000) {
      store.delete(key);
    }
  }
}, 300_000);
