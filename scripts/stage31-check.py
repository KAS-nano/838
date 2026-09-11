from pathlib import Path

source = Path("apps/hardware-agent/src-tauri/src/lib.rs").read_text()
workflow = Path(".github/workflows/ci.yml").read_text()
tests = {
    "schema v2": "schema_version: 2" in source,
    "hostname removido": "hostname:" not in source and "host_name" not in source,
    "avisos parciais": "field_warnings" in source and "gpu-not-detected" in source,
    "limite de GPUs": "MAX_GPUS" in source,
    "limite de rótulo": "MAX_LABEL_CHARS" in source,
    "leitura sysfs limitada": ".take(4096)" in source,
    "processo nativo limitado": "Duration::from_secs(5)" in source,
    "saída nativa limitada": "MAX_OUTPUT: u64 = 64 * 1024" in source,
    "JSON nativo parseado": "parse_native_gpus" in source,
    "memória classificada": "memory_kind" in source,
    "testes Rust": "#[cfg(test)]" in source,
    "lockfile Rust": Path("apps/hardware-agent/src-tauri/Cargo.lock").is_file(),
    "ícone RGBA": Path("apps/hardware-agent/src-tauri/icons/icon.png").is_file(),
    "CI nativa Linux": "hardware-agent:" in workflow and "cargo +1.95.0 test --locked" in workflow,
    "Clippy bloqueante": "clippy --locked --all-targets -- -D warnings" in workflow,
}

failed = False
for name, passed in tests.items():
    print(f"{'PASS' if passed else 'FAIL'} {name}")
    failed |= not passed
if failed:
    raise SystemExit("stage31 failed")
