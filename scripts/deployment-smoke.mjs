import assert from "node:assert/strict";

const input = process.argv[2];
if (!input) throw new Error("Uso: npm run deploy:smoke -- https://seu-site.vercel.app");
const origin = new URL(input);
assert.equal(origin.protocol, "https:", "O endereço público precisa usar HTTPS.");

async function get(path) {
  const response = await fetch(new URL(path, origin), { redirect: "follow", signal: AbortSignal.timeout(15_000) });
  assert.equal(response.status, 200, `${path} respondeu HTTP ${response.status}`);
  return { response, text: await response.text() };
}

const [home, models, health, readiness] = await Promise.all([get("/"), get("/modelos"), get("/api/health"), get("/api/ready")]);
assert.match(home.text, /838/, "A página inicial não contém a identidade do produto.");
assert.doesNotMatch(home.text + models.text, /alastorlluar@gmail\.com/i, "O e-mail pessoal apareceu no site publicado.");
assert.equal(home.response.headers.get("x-content-type-options"), "nosniff");
assert.equal(home.response.headers.get("x-frame-options"), "DENY");
assert.equal(JSON.parse(health.text).status, "ok", "Health check inválido.");
assert.equal(JSON.parse(readiness.text).status, "ready", "Readiness check inválido.");

console.log(`PASS deployment smoke: ${origin.origin} respondeu por HTTPS, páginas e health estão disponíveis e headers básicos estão ativos.`);
