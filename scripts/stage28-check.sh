#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage28
./node_modules/.bin/tsc scripts/stage28-test.ts src/features/benchmarks/estimator.ts src/features/benchmarks/evaluation.ts src/features/benchmarks/statistics.ts src/features/benchmarks/data.ts src/features/estimation/memory.ts src/data/seed-models.ts src/features/catalog/types.ts src/features/onboarding/types.ts src/features/profile/local-store.ts --outDir .test-stage28 --module commonjs --target es2022 --moduleResolution node --lib es2022,dom --skipLibCheck --rootDir . --esModuleInterop
node .test-stage28/scripts/stage28-test.js
