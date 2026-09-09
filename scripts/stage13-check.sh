#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage13
./node_modules/.bin/tsc scripts/stage13-test.ts src/features/recommendation/hybrid.ts src/features/recommendation/engine.ts src/data/seed-models.ts src/data/seed-api-models.ts src/features/catalog/types.ts src/features/onboarding/types.ts --outDir .test-stage13 --module commonjs --target es2022 --moduleResolution node --skipLibCheck --rootDir .
node .test-stage13/scripts/stage13-test.js
