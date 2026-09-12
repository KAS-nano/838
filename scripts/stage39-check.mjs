import { readFileSync } from "node:fs";

const source = readFileSync("apps/hardware-agent/src-tauri/src/lib.rs", "utf8");
const workflow = readFileSync(".github/workflows/agent-build.yml", "utf8");
const fixture = (name) => readFileSync(`apps/hardware-agent/src-tauri/tests/fixtures/gpu/${name}`, "utf8");
const failures = [];

for (const name of ["windows-single.json", "windows-empty.json", "windows-many.json", "macos-single.json", "invalid.json"]) {
  if (!fixture(name).length) failures.push(`fixture vazia: ${name}`);
  if (!source.includes(name)) failures.push(`fixture sem teste Rust: ${name}`);
}
for (const behavior of ["gpu-output-invalid-json", "native-output-too-large", "gpu-limit-reached", "gpu-not-detected", "unified", "dedicated"]) {
  if (!source.includes(behavior)) failures.push(`comportamento sem cobertura: ${behavior}`);
}
if (!source.includes('cfg(any(target_os = "windows", target_os = "macos", test))')) failures.push("parser nativo não está disponível em testes Linux");
if (!workflow.includes("Test native parsers on runner") || !workflow.includes("cargo +1.95.0 test --locked")) failures.push("fixtures não são executadas na matriz nativa");

if (failures.length) { failures.forEach((failure) => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log("PASS GPU nativa: fixtures Windows/macOS cobrem tipos, vazio, JSON inválido, tamanho e limite.");
