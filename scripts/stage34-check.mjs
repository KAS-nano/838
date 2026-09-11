import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const script = readFileSync("scripts/clean-local.mjs", "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const failures = [];
for (const protectedName of [".env.local", "node_modules"]) {
  if (!script.includes(protectedName)) failures.push(`proteção ausente: ${protectedName}`);
}
if (pkg.scripts?.["clean:local"] !== "node scripts/clean-local.mjs") failures.push("script clean:local ausente");
if (!script.includes("--dry-run")) failures.push("modo dry-run ausente");

const fixture = mkdtempSync(join(tmpdir(), "838-clean-"));
try {
  for (const directory of [".git", "src", "preview", ".next", "test-results", "node_modules", "apps/hardware-agent/src-tauri/target"]) mkdirSync(join(fixture, directory), { recursive: true });
  writeFileSync(join(fixture, "package.json"), '{"name":"838"}');
  writeFileSync(join(fixture, ".env.local"), "SECRET=preservar\n");
  writeFileSync(join(fixture, "node_modules", "keep"), "preservar");
  writeFileSync(join(fixture, ".next", "remove"), "artefato");
  writeFileSync(join(fixture, "test-results", "remove"), "artefato");
  copyFileSync(resolve(root, "scripts/clean-local.mjs"), join(fixture, "clean-local.mjs"));
  const result = spawnSync(process.execPath, [join(fixture, "clean-local.mjs")], { cwd: fixture, encoding: "utf8" });
  if (result.status !== 0) failures.push(`execução falhou: ${result.stderr.trim()}`);
  if (existsSync(join(fixture, ".next")) || existsSync(join(fixture, "test-results"))) failures.push("artefatos não removidos");
  if (!existsSync(join(fixture, ".env.local")) || !existsSync(join(fixture, "node_modules", "keep"))) failures.push("arquivo protegido removido");
} finally {
  rmSync(fixture, { recursive: true, force: true });
}

if (failures.length) {
  failures.forEach(failure => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log("PASS limpeza: allowlist validada; caches removidos; .env.local e node_modules preservados.");
