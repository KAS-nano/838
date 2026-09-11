#!/usr/bin/env bash
set -euo pipefail
umask 077

: "${RESTORE_DATABASE_URL:?Defina RESTORE_DATABASE_URL para um banco isolado.}"
: "${BACKUP_FILE:?Defina BACKUP_FILE para o arquivo .dump.age.}"
: "${AGE_IDENTITY_FILE:?Defina AGE_IDENTITY_FILE para a identidade age local.}"

if [[ "${ALLOW_RESTORE_DRILL:-false}" != "true" ]]; then
  echo "Defina ALLOW_RESTORE_DRILL=true para confirmar a limpeza do banco isolado." >&2
  exit 1
fi
if [[ -n "${DATABASE_URL:-}" && "$RESTORE_DATABASE_URL" == "$DATABASE_URL" ]]; then
  echo "O banco de restauração não pode ser igual ao banco de origem." >&2
  exit 1
fi
if [[ ! -f "$BACKUP_FILE" || ! -f "$BACKUP_FILE.sha256" ]]; then
  echo "Backup ou checksum ausente." >&2
  exit 1
fi
if [[ "$(dirname "$(realpath "$AGE_IDENTITY_FILE")")" == "$(dirname "$(realpath "$BACKUP_FILE")")" ]]; then
  echo "A identidade age não pode ficar junto do backup." >&2
  exit 1
fi

for command_name in age pg_restore psql sha256sum; do
  command -v "$command_name" >/dev/null || { echo "Dependência ausente: $command_name" >&2; exit 1; }
done

expected_checksum="$(tr -d '[:space:]' < "$BACKUP_FILE.sha256")"
if [[ ! "$expected_checksum" =~ ^[a-fA-F0-9]{64}$ ]]; then
  echo "Formato de checksum inválido." >&2
  exit 1
fi
actual_checksum="$(sha256sum "$BACKUP_FILE" | cut -d ' ' -f 1)"
if [[ "$actual_checksum" != "$expected_checksum" ]]; then
  echo "Checksum do backup inválido." >&2
  exit 1
fi
temporary_dump="$(mktemp "${TMPDIR:-/tmp}/838-restore.XXXXXX.dump")"
trap 'rm -f "$temporary_dump"' EXIT
started_at="$(date +%s)"

age --decrypt --identity "$AGE_IDENTITY_FILE" --output "$temporary_dump" "$BACKUP_FILE"
pg_restore --list "$temporary_dump" >/dev/null
pg_restore --clean --if-exists --no-owner --no-privileges --exit-on-error --dbname "$RESTORE_DATABASE_URL" "$temporary_dump"
DATABASE_URL="$RESTORE_DATABASE_URL" npx prisma migrate deploy

PGDATABASE="$RESTORE_DATABASE_URL" psql --no-psqlrc --set ON_ERROR_STOP=1 --tuples-only --command \
  "SELECT CASE WHEN to_regclass('\"User\"') IS NOT NULL AND to_regclass('\"HardwareProfile\"') IS NOT NULL AND to_regclass('\"CatalogSnapshot\"') IS NOT NULL AND to_regclass('\"CommunitySubmission\"') IS NOT NULL THEN 'integrity-ok' ELSE 'integrity-failed' END;" \
  | grep -q "integrity-ok"

elapsed="$(( $(date +%s) - started_at ))"
echo "Restauração isolada validada em ${elapsed}s em $(date -u +%Y-%m-%dT%H:%M:%SZ)."
