import { existsSync, lstatSync, readdirSync, rmSync } from "node:fs";
import { resolve, relative, sep } from "node:path";

const root = process.cwd();
const dryRun = process.argv.includes("--dry-run");
const required = ["package.json", ".git", "src", "preview"];

if (!required.every(entry => existsSync(resolve(root, entry)))) {
  console.error("ERRO: execute clean:local na raiz do repositório 838.");
  process.exit(1);
}

const fixedTargets = [
  ".next", "out", ".turbo", ".cache", ".eslintcache", "coverage", ".nyc_output",
  "test-results", "playwright-report", "blob-report", "tsconfig.tsbuildinfo",
  "apps/hardware-agent/src-tauri/target", "apps/hardware-agent/src-tauri/gen/schemas",
];
const stageTargets = readdirSync(root).filter(entry => entry.startsWith(".test-") && lstatSync(resolve(root, entry)).isDirectory());
const targets = [...fixedTargets, ...stageTargets];

function safePath(target) {
  const absolute = resolve(root, target);
  const location = relative(root, absolute);
  if (!location || location.startsWith(`..${sep}`) || location === "..") throw new Error(`caminho recusado: ${target}`);
  if (location === ".env.local" || location.startsWith(`node_modules${sep}`) || location === "node_modules") throw new Error(`alvo protegido: ${target}`);
  return absolute;
}

const present = targets.filter(target => existsSync(safePath(target)));
if (!present.length) {
  console.log("Limpeza local: nenhum artefato descartável encontrado.");
  process.exit(0);
}

for (const target of present) {
  console.log(`${dryRun ? "SIMULAR" : "REMOVER"} ${target}`);
  if (!dryRun) rmSync(safePath(target), { recursive: true, force: true });
}
console.log(`Limpeza local: ${present.length} alvo(s) ${dryRun ? "identificado(s)" : "removido(s)"}. .env.local e node_modules foram preservados.`);
