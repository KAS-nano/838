#!/usr/bin/env bash
set -euo pipefail

for file in scripts/db-backup.sh scripts/db-restore-drill.sh BACKUP_RECOVERY.md; do
  test -f "$file" || { echo "FAIL arquivo ausente: $file"; exit 1; }
done
bash -n scripts/db-backup.sh scripts/db-restore-drill.sh
grep -q 'BACKUP_DIR deve ficar fora do repositório' scripts/db-backup.sh
grep -q 'ALLOW_RESTORE_DRILL=true' scripts/db-restore-drill.sh
grep -q 'RESTORE_DATABASE_URL.*DATABASE_URL' scripts/db-restore-drill.sh
grep -q 'actual_checksum.*sha256sum' scripts/db-restore-drill.sh
grep -q 'a-fA-F0-9.*64' scripts/db-restore-drill.sh
grep -q 'age --decrypt' scripts/db-restore-drill.sh
grep -q 'identidade age não pode ficar junto do backup' scripts/db-restore-drill.sh
grep -q 'RPO: 24 horas' BACKUP_RECOVERY.md
grep -q 'RTO: 4 horas' BACKUP_RECOVERY.md
echo "PASS backup: criptografia, checksum, destino externo, restauração isolada e RPO/RTO."
