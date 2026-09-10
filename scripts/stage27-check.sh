#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage27
./node_modules/.bin/tsc scripts/stage27-test.ts src/features/benchmarks/protocol-v2.ts src/features/benchmarks/statistics.ts src/features/benchmarks/verifier.ts --outDir .test-stage27 --module commonjs --target es2022 --moduleResolution node --lib es2022,dom --skipLibCheck --rootDir . --esModuleInterop
node .test-stage27/scripts/stage27-test.js
