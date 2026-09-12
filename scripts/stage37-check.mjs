import { readFileSync } from "node:fs";

const sbomScript = readFileSync("scripts/generate-rust-sbom.sh", "utf8");
const provenanceScript = readFileSync("scripts/generate-release-provenance.mjs", "utf8");
const workflow = readFileSync(".github/workflows/release-metadata.yml", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const gitignore = readFileSync(".gitignore", "utf8");
const failures = [];

if (!sbomScript.includes('version="0.5.9"')) failures.push("cargo-cyclonedx não está fixado em 0.5.9");
if (!sbomScript.includes("fb8dbee9f182173e062a64a387b21a0badc6fab8b2abf9294973f012972bf6d8")) failures.push("checksum oficial do cargo-cyclonedx ausente");
for (const guard of ["--proto '=https'", "--tlsv1.2", "sha256sum", "--spec-version 1.5", "SOURCE_DATE_EPOCH", "RUSTUP_TOOLCHAIN"]) if (!sbomScript.includes(guard)) failures.push(`proteção ausente no SBOM Rust: ${guard}`);
for (const field of ["GITHUB_SHA", "package-lock.json", "Cargo.lock", "sbom-web.cdx.json", "sbom-rust.cdx.json"]) if (!provenanceScript.includes(field)) failures.push(`campo ausente na proveniência: ${field}`);
for (const command of ["npm run sbom:rust", "npm run release:provenance"]) if (!workflow.includes(command)) failures.push(`comando ausente da release: ${command}`);
for (const artifact of ["sbom-web.cdx.json", "sbom-rust.cdx.json", "release-provenance.json", "SHA256SUMS"]) {
  if (!workflow.includes(artifact)) failures.push(`artefato ausente da release: ${artifact}`);
  if (!gitignore.includes(`/${artifact}`)) failures.push(`artefato local não ignorado: ${artifact}`);
}
if (packageJson.scripts["sbom:rust"] !== "bash scripts/generate-rust-sbom.sh") failures.push("script npm sbom:rust inválido");
if (packageJson.scripts["release:provenance"] !== "node scripts/generate-release-provenance.mjs") failures.push("script npm de proveniência inválido");
if (failures.length) { failures.forEach((failure) => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log("PASS release: SBOMs web/Rust, checksums e proveniência vinculada ao commit.");
