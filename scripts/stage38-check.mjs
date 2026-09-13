import { readFileSync } from "node:fs";

const workflow = readFileSync(".github/workflows/agent-build.yml", "utf8");
const checksumScript = readFileSync("scripts/write-artifact-checksums.mjs", "utf8");
const roadmap = readFileSync("planning/05-AGENTE-LOCAL.txt", "utf8");
const failures = [];

for (const platform of ["ubuntu-22.04", "windows-2025", "macos-14"]) if (!workflow.includes(platform)) failures.push(`runner ausente: ${platform}`);
for (const bundle of ["deb,appimage", "nsis,msi", "app,dmg"]) if (!workflow.includes(bundle)) failures.push(`bundles ausentes: ${bundle}`);
for (const guard of ["rustup toolchain install 1.95.0", "projectPath: apps/hardware-agent", "-- --locked", "unsigned", "uploadWorkflowArtifacts", "ARTIFACT_PATHS_JSON", "ARTIFACT_DIRECTORY: native-artifacts", "path: native-artifacts/", 'RUSTUP_TOOLCHAIN: "1.95.0"']) if (!workflow.includes(guard)) failures.push(`controle ausente: ${guard}`);
if (!workflow.includes("tauri-apps/tauri-action@1deb371b0cd8bd54025b384f1cd735e725c4060f")) failures.push("tauri-action não está fixada por SHA");
if (!checksumScript.includes('flag: "wx"') || !checksumScript.includes('path.basename')) failures.push("checksum não protege sobrescrita/nome de arquivo");

if (!roadmap.includes("builds de validação não assinados")) failures.push("limitação de assinatura não documentada");

if (failures.length) { failures.forEach((failure) => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log("PASS agente nativo: matriz de três sistemas, bundles não assinados, Rust fixado e integração de checksums.");
