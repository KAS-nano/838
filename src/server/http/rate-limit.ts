import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { HttpError } from "./errors";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;
let nextCleanupAt = 0;

export type RateLimitPolicy = { limit: number; windowMs: number; name: string };

export function clientKey(request: Request) {
  const trusted = process.env.TRUST_PROXY_HEADERS === "true";
  const candidate = trusted ? readTrustedClientIp(request) : null;
  const normalized = candidate || "anonymous";
  return createHash("sha256").update(normalized).digest("hex").slice(0, 24);
}

function readTrustedClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const values = forwarded.split(",").map((item) => item.trim().replace(/^\[|\]$/g, "")).filter(Boolean);
    for (const value of values) {
      if (isIP(value)) return value;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim().replace(/^\[|\]$/g, "");
  if (realIp && isIP(realIp)) return realIp;

  return null;
}

export function rateLimit(request: Request, policy: RateLimitPolicy) {
  const now = Date.now();
  if (now >= nextCleanupAt || buckets.size >= MAX_BUCKETS) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
    nextCleanupAt = now + 60_000;
  }
  const key = `${policy.name}:${clientKey(request)}`;
  const current = buckets.get(key);
  if (!current && buckets.size >= MAX_BUCKETS) {
    const error = new HttpError(429, "rate_limited", "Muitas requisições. Tente novamente em instantes.");
    Object.assign(error, { retryAfter: 60 });
    throw error;
  }
  const bucket = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + policy.windowMs }
    : current;
  bucket.count += 1;
  buckets.set(key, bucket);
  if (bucket.count > policy.limit) {
    const error = new HttpError(429, "rate_limited", "Muitas requisições. Tente novamente em instantes.");
    Object.assign(error, { retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) });
    throw error;
  }
  return { remaining: policy.limit - bucket.count, resetAt: bucket.resetAt };
}

export function retryAfter(error: unknown) {
  return error instanceof HttpError && error.status === 429
    ? String((error as HttpError & { retryAfter?: number }).retryAfter ?? 60)
    : undefined;
}
