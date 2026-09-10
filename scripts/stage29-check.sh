#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage29
./node_modules/.bin/tsc scripts/stage29-test.ts src/server/observability/logger.ts src/server/observability/readiness.ts --outDir .test-stage29 --module nodenext --target es2022 --moduleResolution nodenext --lib es2022,dom --skipLibCheck --rootDir .
node .test-stage29/scripts/stage29-test.js
