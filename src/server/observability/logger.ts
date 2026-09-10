export type OperationalLog = {
  level: "info" | "error";
  event: "http_request" | "dependency_failure";
  requestId: string;
  route: string;
  status: number;
  durationMs: number;
  provider?: string;
  errorType?: string;
};

function safeLabel(value: string, fallback: string) {
  return /^[a-zA-Z0-9._:/-]{1,80}$/.test(value) ? value : fallback;
}

export function operationalLog(entry: OperationalLog) {
  const output = {
    timestamp: new Date().toISOString(), ...entry,
    requestId: safeLabel(entry.requestId, "invalid"),
    route: safeLabel(entry.route, "unknown"),
    provider: entry.provider ? safeLabel(entry.provider, "unknown") : undefined,
    errorType: entry.errorType ? safeLabel(entry.errorType, "Error") : undefined,
    durationMs: Math.max(0, Math.round(entry.durationMs)),
  };
  const line = JSON.stringify(output);
  if (entry.level === "error") console.error(line);
  else console.info(line);
}

export function safeErrorType(error: unknown) {
  if (!error || typeof error !== "object") return "UnknownError";
  const name = "name" in error && typeof error.name === "string" ? error.name : error.constructor?.name;
  return safeLabel(name || "Error", "Error");
}
