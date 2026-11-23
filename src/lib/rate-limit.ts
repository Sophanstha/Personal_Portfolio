/**
 * Simple in-memory rate limiter, keyed by the visitor's IP.
 *
 * Each rule is "at most `max` requests per `windowMs`". A request is allowed
 * only if every rule allows it.
 *
 * Memory is per server instance: on serverless hosts (Vercel) each instance
 * keeps its own count, so treat this as a speed bump against spam and
 * accidental resubmits, not a hard guarantee. For a strict shared limit,
 * swap the Map for Redis (e.g. Upstash).
 */

type Rule = { max: number; windowMs: number };

const hits = new Map<string, number[]>();
let lastSweep = 0;

/** Best-effort client IP. Hosts like Vercel set x-forwarded-for themselves. */
export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function checkRateLimit(key: string, rules: Rule[]) {
  const now = Date.now();
  const longest = Math.max(...rules.map((r) => r.windowMs));

  // Drop stale entries now and then so the Map can't grow forever
  if (now - lastSweep > 60_000) {
    lastSweep = now;
    for (const [k, times] of hits) if (now - times[times.length - 1] > longest) hits.delete(k);
  }

  const times = (hits.get(key) ?? []).filter((t) => now - t < longest);

  let retryAfterMs = 0;
  for (const { max, windowMs } of rules) {
    const inWindow = times.filter((t) => now - t < windowMs);
    if (inWindow.length >= max) retryAfterMs = Math.max(retryAfterMs, inWindow[0] + windowMs - now);
  }

  if (retryAfterMs > 0) {
    hits.set(key, times);
    return { rateLimited: true, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  times.push(now);
  hits.set(key, times);
  return { rateLimited: false, retryAfterSeconds: 0 };
}
