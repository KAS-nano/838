import { getAuthConfiguration } from "../src/lib/auth-config";

const original = { ...process.env };
const tests: [string, boolean][] = [];

function configure() {
  process.env.BETTER_AUTH_URL = "https://838.example";
  process.env.BETTER_AUTH_SECRET = "a".repeat(48);
  process.env.DATABASE_URL = "postgresql://local/test";
  process.env.AUTH_EMAIL_WEBHOOK_URL = "https://mail.example/send";
  process.env.AUTH_EMAIL_WEBHOOK_SECRET = "webhook-secret";
  process.env.AUTH_TRUSTED_ORIGINS = "https://838.example,https://preview.838.example";
}

try {
  configure();
  const config = getAuthConfiguration();
  tests.push(["configuração explícita", config.trustedOrigins.length === 2 && config.baseURL === "https://838.example"]);
  process.env.BETTER_AUTH_SECRET = "short";
  try { getAuthConfiguration(); tests.push(["segredo fraco rejeitado", false]); }
  catch { tests.push(["segredo fraco rejeitado", true]); }
  configure();
  (process.env as Record<string, string | undefined>).NODE_ENV = "production";
  process.env.BETTER_AUTH_URL = "http://838.example";
  try { getAuthConfiguration(); tests.push(["HTTP rejeitado em produção", false]); }
  catch { tests.push(["HTTP rejeitado em produção", true]); }
} finally {
  process.env = original;
}

let failed = false;
for (const [name, passed] of tests) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  if (!passed) failed = true;
}
if (failed) process.exitCode = 1;
