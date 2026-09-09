import { createHash } from "node:crypto";
import { HttpError } from "./errors";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitPolicy = { limit: number; windowMs: number; name: string };

export function clientKey(request: Request) {
  const trusted = process.env.TRUST_PROXY_HEADERS === "true";
  const candidate = trusted
    ? request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]
    : null;
  const normalized = candidate?.trim() || "anonymous";
  return createHash("sha256").update(normalized).digest("hex").slice(0, 24);
}

export function rateLimit(request: Request, policy: RateLimitPolicy) {
  const now = Date.now();
  const key = `${policy.name}:${clientKey(request)}`;
  const current = buckets.get(key);
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
