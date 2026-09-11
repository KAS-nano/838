import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const test = readFileSync("tests/browser/accessibility.spec.ts", "utf8");
const frame = readFileSync("src/components/navigation/site-frame.tsx", "utf8");
const gauge = readFileSync("src/components/gauges/speed-gauge.tsx", "utf8");
const roadmap = readFileSync("planning/08-NOVOS-OBJETIVOS-E-OTIMIZACOES.txt", "utf8");
const failures = [];

if (pkg.devDependencies?.["@axe-core/playwright"] !== "4.13.0") failures.push("@axe-core/playwright não está fixado em 4.13.0");
if (pkg.scripts?.["test:a11y"] !== "playwright test tests/browser/accessibility.spec.ts") failures.push("script test:a11y ausente");
for (const evidence of ["serious", "critical", "320", "menu móvel", "Apoie o projeto"]) {
  if (!test.includes(evidence)) failures.push(`teste sem cobertura: ${evidence}`);
}
if (!frame.includes('className="skip-link"') || !frame.includes('id="main-content"') || !frame.includes("tabIndex={-1}")) failures.push("link de salto Next incompleto");
if (!gauge.includes('role="img"')) failures.push("medidor sem papel semântico");
if (!roadmap.includes("OBJETIVO 08.2 — ACESSIBILIDADE CONTÍNUA [P1] [~ 80%]")) failures.push("progresso de acessibilidade não registrado");

if (failures.length) {
  failures.forEach(failure => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log("PASS acessibilidade: axe fixado, rotas/estados cobertos, link de salto e medidores semânticos.");
