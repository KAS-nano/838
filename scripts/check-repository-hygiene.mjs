import fs from "node:fs";
import path from "node:path";

const ignoredDirectories = new Set([".git", ".next", "node_modules", "out", "playwright-report", "target", "test-results"]);
const forbiddenNames = [/^\.env(?:\..+)?$/, /\.(?:key|pem|p12|pfx)$/i, /^id_(?:rsa|ed25519)$/];
const allowed = new Set([".env.example"]);
const findings = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && (ignoredDirectories.has(entry.name) || entry.name.startsWith(".test-"))) continue;
    const fullPath = path.join(directory, entry.name);
    const relative = path.relative(process.cwd(), fullPath);
    if (entry.isDirectory()) walk(fullPath);
    else if (!allowed.has(relative) && forbiddenNames.some((pattern) => pattern.test(entry.name))) findings.push(relative);
  }
}

walk(process.cwd());
if (findings.length) {
  console.error("FAIL arquivos sensíveis ou locais encontrados:");
  findings.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}
console.log("PASS nenhum .env, certificado ou chave privada encontrado nas fontes");
