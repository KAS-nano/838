#!/usr/bin/env bash
set -euo pipefail
for s in \
 scripts/static-check.mjs scripts/stage2-check.mjs scripts/stage3-check.mjs \
 scripts/stage4-check.mjs scripts/stage5-check.mjs scripts/stage6-check.sh scripts/stage7-check.mjs \
 scripts/stage8-check.sh scripts/stage9-check.sh scripts/stage10-check.sh scripts/stage11-check.mjs \
 scripts/stage12-check.sh scripts/stage13-check.sh scripts/stage14-check.sh scripts/stage15-check.sh \
 scripts/stage16-check.sh scripts/stage17-check.sh scripts/stage18-check.mjs scripts/stage19-check.py \
 scripts/stage20-check.sh scripts/stage21-check.sh scripts/stage22-check.mjs scripts/stage23-check.sh scripts/stage24-check.sh scripts/stage25-check.mjs scripts/stage26-check.sh scripts/stage27-check.sh scripts/stage28-check.sh scripts/stage29-check.sh scripts/stage30-check.sh scripts/stage31-check.py scripts/stage32-check.mjs scripts/stage33-check.mjs scripts/stage34-check.mjs scripts/stage35-check.mjs scripts/stage36-check.mjs scripts/stage37-check.mjs scripts/comparison-engine-check.sh scripts/support-test.mjs scripts/frontend-engine-check.sh; do
  echo "===== $s ====="
  case "$s" in *.sh) bash "$s";; *.py) python3 "$s";; *) node "$s";; esac
done
