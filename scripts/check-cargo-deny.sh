#!/usr/bin/env bash
set -euo pipefail

readonly VERSION="0.20.2"
readonly ARCHIVE="cargo-deny-${VERSION}-x86_64-unknown-linux-musl.tar.gz"
readonly EXPECTED_SHA256="9f12ed4c49936e09b48bf862b595cde2fe64fcbd9d74dfacac6131ca824c8d5f"
readonly DOWNLOAD_URL="https://github.com/EmbarkStudios/cargo-deny/releases/download/${VERSION}/${ARCHIVE}"
readonly REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ "$(uname -s)" != "Linux" || "$(uname -m)" != "x86_64" ]]; then
  echo "ERRO: este verificador fixado suporta somente Linux x86_64." >&2
  exit 1
fi
command -v cargo >/dev/null || { echo "ERRO: cargo não encontrado no PATH." >&2; exit 1; }

work_dir="$(mktemp -d "${TMPDIR:-/tmp}/838-cargo-deny.XXXXXX")"
trap 'rm -rf "$work_dir"' EXIT
curl --proto '=https' --tlsv1.2 --fail --silent --show-error --location "$DOWNLOAD_URL" --output "$work_dir/$ARCHIVE"
actual_sha256="$(sha256sum "$work_dir/$ARCHIVE" | cut -d' ' -f1)"
if [[ "$actual_sha256" != "$EXPECTED_SHA256" ]]; then
  echo "ERRO: checksum do cargo-deny não confere." >&2
  exit 1
fi
tar -xzf "$work_dir/$ARCHIVE" -C "$work_dir"
"$work_dir/cargo-deny-${VERSION}-x86_64-unknown-linux-musl/cargo-deny" \
  --manifest-path "$REPO_ROOT/apps/hardware-agent/src-tauri/Cargo.toml" check --hide-inclusion-graph
