import { execFileSync } from "node:child_process";
import path from "node:path";

const forbiddenNames = [/^\.env(?:\..+)?$/, /\.(?:key|pem|p12|pfx)$/i, /^id_(?:rsa|ed25519)$/];
const allowed = new Set([".env.example"]);
const trackedFiles = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
const findings = trackedFiles.filter(file => !allowed.has(file) && forbiddenNames.some(pattern => pattern.test(path.basename(file))));
if (findings.length) {
  console.error("FAIL arquivos sensíveis versionados:");
  findings.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}
console.log("PASS nenhum .env, certificado ou chave privada está versionado");
