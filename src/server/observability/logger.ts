export type OperationalLog = {
  level: "info" | "error";
  event: "http_request" | "dependency_failure";
  requestId: string;
  route: string;
  status: number;
  durationMs: number;
  provider?: string;
  errorType?: string;
  cacheStatus?: "bypass" | "fallback" | "miss";
  estimatorVersion?: string;
};

const knownErrorTypes = new Set([
  "AbortError",
  "AggregateError",
  "Error",
  "EvalError",
  "PrismaClientInitializationError",
  "PrismaClientKnownRequestError",
  "PrismaClientUnknownRequestError",
  "PrismaClientValidationError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TimeoutError",
  "TypeError",
  "UnknownError",
  "URIError",
]);

function safeLabel(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  return /^[a-zA-Z0-9._:/-]{1,80}$/.test(value) ? value : fallback;
}

function safeRequestId(value: unknown) {
  if (typeof value !== "string") return "invalid";
  return /^[a-zA-Z0-9._:/-]{8,128}$/.test(value) ? value : "invalid";
}

export function operationalLog(entry: OperationalLog) {
  const output = {
    timestamp: new Date().toISOString(),
    level: entry.level === "error" ? "error" : "info",
    event: entry.event === "dependency_failure" ? "dependency_failure" : "http_request",
    requestId: safeRequestId(entry.requestId),
    route: safeLabel(entry.route, "unknown"),
    status: Number.isInteger(entry.status) && entry.status >= 100 && entry.status <= 599 ? entry.status : 500,
    durationMs: Number.isFinite(entry.durationMs) ? Math.max(0, Math.round(entry.durationMs)) : 0,
    provider: entry.provider ? safeLabel(entry.provider, "unknown") : undefined,
    errorType: entry.errorType && knownErrorTypes.has(entry.errorType) ? entry.errorType : entry.errorType ? "Error" : undefined,
    cacheStatus: entry.cacheStatus === "fallback" || entry.cacheStatus === "miss" ? entry.cacheStatus : entry.cacheStatus ? "bypass" : undefined,
    estimatorVersion: entry.estimatorVersion ? safeLabel(entry.estimatorVersion, "unknown") : undefined,
  };
  const line = JSON.stringify(output);
  if (entry.level === "error") console.error(line);
  else console.info(line);
}

export function safeErrorType(error: unknown) {
  if (!error || typeof error !== "object") return "UnknownError";
  const name = "name" in error && typeof error.name === "string" ? error.name : error.constructor?.name;
  return name && knownErrorTypes.has(name) ? name : "Error";
}
