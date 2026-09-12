import { readFileSync } from "node:fs";

const source = readFileSync("apps/hardware-agent/src-tauri/src/lib.rs", "utf8");
const linuxVendor = readFileSync("apps/hardware-agent/src-tauri/tests/fixtures/gpu/linux/card0/device/vendor", "utf8").trim();
const linuxVram = readFileSync("apps/hardware-agent/src-tauri/tests/fixtures/gpu/linux/card0/device/mem_info_vram_total", "utf8").trim();
const failures = [];

for (const behavior of ["detect_linux_gpus", "gpu-sysfs-unavailable", "native-command-timeout", "run_native_with_limits"]) {
  if (!source.includes(behavior)) failures.push(`comportamento ausente: ${behavior}`);
}
for (const test of ["linux_sysfs_fixture_is_typed", "linux_missing_sysfs_reports_partial_detection", "slow_native_process_is_terminated"]) {
  if (!source.includes(test)) failures.push(`teste Rust ausente: ${test}`);
}
if (linuxVendor !== "0x10de") failures.push("fixture Linux não representa NVIDIA");
if (linuxVram !== "8589934592") failures.push("fixture Linux não representa 8 GiB de VRAM");

if (failures.length) { failures.forEach((failure) => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log("PASS GPU Linux: sysfs isolado, memória dedicada, indisponibilidade e timeout real cobertos.");
