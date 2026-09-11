import assert from "node:assert/strict";
import { operationalLog, safeErrorType } from "../src/server/observability/logger";
import { requiredDependencies } from "../src/server/observability/readiness";

const originalError = console.error;
const lines: string[] = [];
try {
  console.error = (line?: unknown) => lines.push(String(line));
  const sensitive = new Error("DATABASE_URL=postgresql://user:secret@example.test/db token=private");
  sensitive.name = "token-private";
  const oversizedRequestId = "a".repeat(128);
  const hostileEntry = {
    level: "error",
    event: "dependency_failure",
    requestId: oversizedRequestId,
    route: "/api/ready",
    status: 503,
    durationMs: 12.7,
    provider: "postgresql",
    errorType: safeErrorType(sensitive),
    secret: "DATABASE_URL=postgresql://user:secret@example.test/db",
    token: "private",
    toJSON: () => ({ secret: "toJSON-secret" }),
  };
  operationalLog(hostileEntry as Parameters<typeof operationalLog>[0]);
} finally {
  console.error = originalError;
}

const parsed = JSON.parse(lines[0]);
assert.equal(parsed.errorType, "Error");
assert.equal(parsed.durationMs, 13);
assert.equal(parsed.requestId, "a".repeat(128));
assert.equal(parsed.secret, undefined);
assert.equal(parsed.token, undefined);
assert.ok(!lines[0].includes("secret"));
assert.ok(!lines[0].includes("DATABASE_URL"));
assert.equal(safeErrorType(new TypeError("private")), "TypeError");
assert.equal(safeErrorType(null), "UnknownError");
assert.deepEqual(requiredDependencies({ CATALOG_SOURCE: "seed", AUTH_ENABLED: "false", COMMUNITY_BENCHMARKS_ENABLED: "false" }), { databaseRequired: false });
assert.equal(requiredDependencies({ CATALOG_SOURCE: "database" }).databaseRequired, true);
assert.equal(requiredDependencies({ AUTH_ENABLED: "true" }).databaseRequired, true);
assert.equal(requiredDependencies({ COMMUNITY_BENCHMARKS_ENABLED: "true" }).databaseRequired, true);
console.log("PASS observability: structured log, closed fields, secret-free errors and readiness dependency flags.");
