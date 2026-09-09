import { HttpError } from "../src/server/http/errors";
import { parseJsonWithLimit } from "../src/server/http/request";
import { rateLimit } from "../src/server/http/rate-limit";

function expectHttpError(error: unknown, status: number) {
  return error instanceof HttpError && error.status === status;
}

async function main() {
  const tests: [string, boolean][] = [];
  const valid = await parseJsonWithLimit(new Request("http://localhost/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok: true }),
  }), 100) as { ok?: boolean };
  tests.push(["JSON dentro do limite", valid.ok === true]);

  for (const [name, request, status] of [
    ["MIME obrigatório", new Request("http://localhost/api", { method: "POST", body: "{}" }), 415],
    ["corpo limitado", new Request("http://localhost/api", { method: "POST", headers: { "content-type": "application/json" }, body: "{\"long\":\"123456789\"}" }), 413],
    ["JSON válido", new Request("http://localhost/api", { method: "POST", headers: { "content-type": "application/json" }, body: "{" }), 400],
  ] as const) {
    try {
      await parseJsonWithLimit(request, name === "corpo limitado" ? 8 : 100);
      tests.push([name, false]);
    } catch (error) {
      tests.push([name, expectHttpError(error, status)]);
    }
  }

  const limitedRequest = new Request("http://localhost/api");
  rateLimit(limitedRequest, { name: "stage23", limit: 1, windowMs: 60_000 });
  try {
    rateLimit(limitedRequest, { name: "stage23", limit: 1, windowMs: 60_000 });
    tests.push(["rate limit", false]);
  } catch (error) {
    tests.push(["rate limit", expectHttpError(error, 429)]);
  }

  let failed = false;
  for (const [name, passed] of tests) {
    console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
    if (!passed) failed = true;
  }
  if (failed) throw new Error("stage23 failed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
