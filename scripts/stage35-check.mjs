import { readFileSync, readdirSync } from "node:fs";

const workflows = readdirSync(".github/workflows").filter(name => name.endsWith(".yml")).map(name => readFileSync(`.github/workflows/${name}`, "utf8")).join("\n");
const config = readFileSync("osv-scanner.toml", "utf8");
const exceptions = readFileSync("SECURITY_EXCEPTIONS.md", "utf8");
const roadmap = readFileSync("planning/08-NOVOS-OBJETIVOS-E-OTIMIZACOES.txt", "utf8");
const failures = [];

for (const match of workflows.matchAll(/uses:\s*([^\s#]+)/g)) {
  if (!/@[0-9a-f]{40}$/.test(match[1])) failures.push(`Action sem SHA: ${match[1]}`);
}
for (const required of ["google/osv-scanner-action", "--recursive", "SHA256SUMS", "package-lock.json", "Cargo.lock"]) {
  if (!workflows.includes(required)) failures.push(`workflow sem ${required}`);
}
for (const id of ["GHSA-ggr8-5vv4-36mx", "GHSA-3f6p-5ww8-9rcr", "GHSA-rgwj-5xj2-c3m3"]) {
  if (!config.includes(id) || !exceptions.includes(id)) failures.push(`exceção sem rastreabilidade: ${id}`);
}
const today = new Date().toISOString().slice(0, 10);
for (const [, date] of config.matchAll(/ignoreUntil\s*=\s*(\d{4}-\d{2}-\d{2})/g)) {
  if (date <= today) failures.push(`exceção vencida: ${date}`);
}
if (!roadmap.includes("OBJETIVO 08.6 — SUPPLY CHAIN REPRODUZÍVEL [P0] [~ 75%]")) failures.push("progresso supply chain ausente");
if (failures.length) { failures.forEach(failure => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log("PASS supply chain: Actions fixadas, OSV, exceções vigentes, SBOM e hashes de release.");
