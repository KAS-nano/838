#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage24
./node_modules/.bin/tsc scripts/stage24-test.ts src/lib/auth-config.ts --outDir .test-stage24 --module nodenext --target es2022 --lib es2022,dom --skipLibCheck --rootDir .
node .test-stage24/scripts/stage24-test.js
