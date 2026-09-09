#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage20
./node_modules/.bin/tsc scripts/stage20-test.ts src/features/benchmarks/local-runner.ts --outDir .test-stage20 --module nodenext --target es2022 --lib es2022,dom --skipLibCheck --rootDir .
node .test-stage20/scripts/stage20-test.js
