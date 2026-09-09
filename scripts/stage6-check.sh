#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage6
./node_modules/.bin/tsc scripts/stage6-test.ts src/features/recommendation/engine.ts src/data/seed-models.ts src/features/catalog/types.ts src/features/onboarding/types.ts --outDir .test-stage6 --module commonjs --target es2022 --moduleResolution node --esModuleInterop --skipLibCheck --rootDir .
node .test-stage6/scripts/stage6-test.js
