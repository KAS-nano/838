import fs from "node:fs";

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const tauriConfig = JSON.parse(fs.readFileSync("apps/hardware-agent/src-tauri/tauri.conf.json", "utf8"));
const cargoToml = fs.readFileSync("apps/hardware-agent/src-tauri/Cargo.toml", "utf8");
const cargoVersion = cargoToml.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
const expected = packageJson.version;
const versions = {
  "package.json": packageJson.version,
  "tauri.conf.json": tauriConfig.version,
  "Cargo.toml": cargoVersion,
};

for (const [file, version] of Object.entries(versions)) {
  if (version !== expected) fail(`${file} usa ${version ?? "versão ausente"}; esperado ${expected}`);
  else console.log(`PASS ${file}: ${version}`);
}
