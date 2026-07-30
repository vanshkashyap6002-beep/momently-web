/**
 * Sliding-window rate limiter.
 *
 * If UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are set, limits are
 * enforced in shared Redis — correct across multiple server instances or
 * serverless invocations. If they're not set, it falls back to an
 * in-memory counter scoped to this one process — fine for local dev or a
 * single-instance deployment, but each instance would count separately in
 * a multi-instance production deployment. Every call site uses the same
 * `checkRateLimit()` signature either way, so nothing else needs to change
 * when Redis is added.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// ---------------------------------------------------------------------------
// In-memory fallback
// ---------------------------------------------------------------------------

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let requestsSinceSweep = 0;

function sweepExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function checkInMemory(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();

  requestsSinceSweep += 1;
  if (requestsSinceSweep > 500) {
    sweepExpired(now);
    requestsSinceSweep = 0;
  }

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, retryAfterSeconds: 0 };
}

// ---------------------------------------------------------------------------
// Upstash Redis backing (shared across instances)
// ---------------------------------------------------------------------------

interface UpstashPipelineStep {
  result: number;
}

async function checkUpstash(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  // INCR the counter, and set its expiry only the first time it's created
  // (NX = only-if-not-set) — a standard fixed-window counter pattern using
  // Upstash's REST pipeline API, no extra SDK dependency required.
  const pipeline = [["INCR", key], ["EXPIRE", key, String(windowSeconds), "NX"]];

  const response = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pipeline),
  });

  if (!response.ok) {
    // Redis being unreachable shouldn't take the whole app down — fail
    // open (allow the request) and fall back to in-memory for this call.
    return checkInMemory(key, limit, windowSeconds);
  }

  const results = (await response.json()) as UpstashPipelineStep[];
  const count = results[0].result;

  if (count > limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds: windowSeconds };
  }

  return { allowed: true, remaining: limit - count, retryAfterSeconds: 0 };
}

// ---------------------------------------------------------------------------

/**
 * Allows up to `limit` calls per `windowSeconds` for a given `key`
 * (typically `"<action>:<identifier>"`, e.g. `"login:someone@example.com"`).
 */
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    return checkUpstash(key, limit, windowSeconds);
  }
  return checkInMemory(key, limit, windowSeconds);
}
