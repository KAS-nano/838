import { readFileSync } from "node:fs";

const policy = readFileSync("apps/hardware-agent/src-tauri/deny.toml", "utf8");
const manifest = readFileSync("apps/hardware-agent/src-tauri/Cargo.toml", "utf8");
const checker = readFileSync("scripts/check-cargo-deny.sh", "utf8");
const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
const exceptions = readFileSync("SECURITY_EXCEPTIONS.md", "utf8");
const failures = [];

for (const section of ["[advisories]", "[licenses]", "[bans]", "[sources]"]) if (!policy.includes(section)) failures.push(`seção ausente: ${section}`);
for (const rule of ['wildcards = "deny"', 'unknown-registry = "deny"', 'unknown-git = "deny"', 'crate = "openssl"']) if (!policy.includes(rule)) failures.push(`regra ausente: ${rule}`);
for (const id of ["RUSTSEC-2024-0370", "RUSTSEC-2025-0075", "RUSTSEC-2025-0080", "RUSTSEC-2025-0081", "RUSTSEC-2025-0098", "RUSTSEC-2025-0100"]) {
  if (!policy.includes(id) || !exceptions.includes(id.replace("RUSTSEC-2025-", "")) && !exceptions.includes(id)) failures.push(`advisory sem rastreabilidade: ${id}`);
}
if (!manifest.includes("publish = false")) failures.push("crate local não está marcado como privado");
if (!checker.includes('VERSION="0.20.2"') || !checker.includes("9f12ed4c49936e09b48bf862b595cde2fe64fcbd9d74dfacac6131ca824c8d5f")) failures.push("binário/checksum cargo-deny não fixado");
if (!workflow.includes("npm run agent:audit")) failures.push("cargo-deny ausente da CI");
if (failures.length) { failures.forEach(failure => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log("PASS cargo-deny: advisories, licenças, bans, fontes, binário e checksum fixados.");
