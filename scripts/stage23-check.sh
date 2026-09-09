#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage23
./node_modules/.bin/tsc scripts/stage23-test.ts src/server/http/errors.ts src/server/http/request.ts src/server/http/rate-limit.ts --outDir .test-stage23 --module nodenext --target es2022 --lib es2022,dom --skipLibCheck --rootDir .
node .test-stage23/scripts/stage23-test.js
