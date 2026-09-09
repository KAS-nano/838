#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage10
./node_modules/.bin/tsc scripts/stage10-test.ts src/features/benchmarks/estimator.ts src/features/benchmarks/data.ts src/data/seed-models.ts src/features/catalog/types.ts src/features/onboarding/types.ts --outDir .test-stage10 --module commonjs --target es2022 --moduleResolution node --skipLibCheck --rootDir .
node .test-stage10/scripts/stage10-test.js
