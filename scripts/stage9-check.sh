#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage9
./node_modules/.bin/tsc scripts/stage9-test.ts src/features/estimation/memory.ts src/data/seed-models.ts src/features/catalog/types.ts src/features/onboarding/types.ts --outDir .test-stage9 --module commonjs --target es2022 --moduleResolution node --skipLibCheck --rootDir .
node .test-stage9/scripts/stage9-test.js
