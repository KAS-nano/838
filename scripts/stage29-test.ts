import assert from "node:assert/strict";
import { operationalLog, safeErrorType } from "../src/server/observability/logger";
import { requiredDependencies } from "../src/server/observability/readiness";

const originalError = console.error;
const lines: string[] = [];
console.error = (line?: unknown) => lines.push(String(line));
const sensitive = new Error("DATABASE_URL=postgresql://user:secret@example.test/db token=private");
operationalLog({ level: "error", event: "dependency_failure", requestId: "request-12345678", route: "/api/ready", status: 503, durationMs: 12.7, provider: "postgresql", errorType: safeErrorType(sensitive) });
console.error = originalError;

const parsed = JSON.parse(lines[0]);
assert.equal(parsed.errorType, "Error");
assert.equal(parsed.durationMs, 13);
assert.equal(parsed.requestId, "request-12345678");
assert.ok(!lines[0].includes("secret"));
assert.ok(!lines[0].includes("DATABASE_URL"));
assert.deepEqual(requiredDependencies({ CATALOG_SOURCE: "seed", AUTH_ENABLED: "false", COMMUNITY_BENCHMARKS_ENABLED: "false" }), { databaseRequired: false });
assert.equal(requiredDependencies({ CATALOG_SOURCE: "database" }).databaseRequired, true);
assert.equal(requiredDependencies({ AUTH_ENABLED: "true" }).databaseRequired, true);
assert.equal(requiredDependencies({ COMMUNITY_BENCHMARKS_ENABLED: "true" }).databaseRequired, true);
console.log("PASS observability: structured log, closed fields, secret-free errors and readiness dependency flags.");
