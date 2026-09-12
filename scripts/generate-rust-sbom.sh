#!/usr/bin/env bash
set -euo pipefail

version="0.5.9"
archive="cargo-cyclonedx-x86_64-unknown-linux-gnu.tar.xz"
expected_sha256="fb8dbee9f182173e062a64a387b21a0badc6fab8b2abf9294973f012972bf6d8"
url="https://github.com/CycloneDX/cyclonedx-rust-cargo/releases/download/cargo-cyclonedx-${version}/${archive}"
manifest="apps/hardware-agent/src-tauri/Cargo.toml"
output_base="sbom-rust.cdx"
output="${output_base}.json"

if [[ "$(uname -s)" != "Linux" || "$(uname -m)" != "x86_64" ]]; then
  echo "SBOM Rust: plataforma suportada neste script: Linux x86_64." >&2
  exit 1
fi

command -v cargo >/dev/null || { echo "SBOM Rust: cargo não encontrado." >&2; exit 1; }
command -v curl >/dev/null || { echo "SBOM Rust: curl não encontrado." >&2; exit 1; }

work_dir="$(mktemp -d "${TMPDIR:-/tmp}/838-cyclonedx.XXXXXX")"
trap 'rm -rf "$work_dir"' EXIT

curl --fail --silent --show-error --location --proto '=https' --tlsv1.2 \
  "$url" -o "$work_dir/$archive"
actual_sha256="$(sha256sum "$work_dir/$archive" | cut -d ' ' -f 1)"
if [[ "$actual_sha256" != "$expected_sha256" ]]; then
  echo "SBOM Rust: SHA-256 inválido para cargo-cyclonedx ${version}." >&2
  exit 1
fi

tar -xJf "$work_dir/$archive" -C "$work_dir"
tool="$work_dir/cargo-cyclonedx-x86_64-unknown-linux-gnu/cargo-cyclonedx"
RUSTUP_TOOLCHAIN="${RUSTUP_TOOLCHAIN:-1.95.0}" SOURCE_DATE_EPOCH="${SOURCE_DATE_EPOCH:-0}" "$tool" cyclonedx \
  --manifest-path "$manifest" \
  --format json \
  --spec-version 1.5 \
  --override-filename "$output_base" \
  --quiet

generated="apps/hardware-agent/src-tauri/$output"
test -s "$generated"
mv "$generated" "$output"
echo "SBOM Rust gerado em $output com cargo-cyclonedx $version."
