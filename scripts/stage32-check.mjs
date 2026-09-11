import { readFileSync } from "node:fs";

const roadmap = readFileSync("planning/08-NOVOS-OBJETIVOS-E-OTIMIZACOES.txt", "utf8");
const audit = readFileSync("reports/AUDITORIA-TECNICA-2026-09-11.md", "utf8");
const index = readFileSync("planning/00-INDICE-E-PRIORIDADES.txt", "utf8");
const failures = [];

for (let number = 1; number <= 12; number += 1) {
  const id = `OBJETIVO 08.${number}`;
  if (!roadmap.includes(id)) failures.push(`ausente: ${id}`);
}
for (const section of ["Aplicar:", "Testar:", "Aceite:"]) {
  const count = roadmap.split(section).length - 1;
  if (count !== 12) failures.push(`${section} esperado 12, encontrado ${count}`);
}
for (const repository of ["axe-core-npm", "tauri-action", "osv-scanner", "cargo-deny", "lighthouse-ci", "opentelemetry-js"]) {
  if (!audit.includes(repository)) failures.push(`repositório não avaliado: ${repository}`);
}
if (!roadmap.includes("Progresso da etapa: 0% [ ]")) failures.push("progresso inicial ausente");
if (!index.includes("08-NOVOS-OBJETIVOS-E-OTIMIZACOES.txt")) failures.push("índice não referencia etapa 08");

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log("PASS roadmap: 12 objetivos com aplicação, testes, aceite, status e avaliação de repositórios externos.");
