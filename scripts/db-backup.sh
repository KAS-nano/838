#!/usr/bin/env bash
set -euo pipefail
umask 077

: "${DATABASE_URL:?Defina DATABASE_URL para o banco de origem.}"
: "${BACKUP_DIR:?Defina BACKUP_DIR fora do repositório.}"
: "${BACKUP_AGE_RECIPIENT:?Defina a chave pública age do responsável pelo backup.}"

for command_name in pg_dump age sha256sum; do
  command -v "$command_name" >/dev/null || { echo "Dependência ausente: $command_name" >&2; exit 1; }
done

project_root="$(git rev-parse --show-toplevel)"
mkdir -p "$BACKUP_DIR"
backup_dir_real="$(realpath "$BACKUP_DIR")"
case "$backup_dir_real/" in
  "$project_root/"*) echo "BACKUP_DIR deve ficar fora do repositório." >&2; exit 1 ;;
esac

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
temporary_dump="$(mktemp "${TMPDIR:-/tmp}/838-backup.XXXXXX.dump")"
encrypted_file="$backup_dir_real/838-postgresql-$stamp.dump.age"
temporary_encrypted="$encrypted_file.partial"
trap 'rm -f "$temporary_dump" "$temporary_encrypted"' EXIT

PGDATABASE="$DATABASE_URL" pg_dump --format=custom --no-owner --no-privileges --file "$temporary_dump"
age --recipient "$BACKUP_AGE_RECIPIENT" --output "$temporary_encrypted" "$temporary_dump"
mv "$temporary_encrypted" "$encrypted_file"
sha256sum "$encrypted_file" | cut -d ' ' -f 1 > "$encrypted_file.sha256"

echo "Backup criptografado criado: $encrypted_file"
echo "Checksum criado: $encrypted_file.sha256"
