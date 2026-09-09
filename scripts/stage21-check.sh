#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage21
./node_modules/.bin/tsc scripts/stage21-test.ts src/features/benchmarks/community.ts --outDir .test-stage21 --module commonjs --target es2022 --lib es2022,dom --skipLibCheck --rootDir .
node .test-stage21/scripts/stage21-test.js
