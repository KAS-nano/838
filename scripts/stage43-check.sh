#!/usr/bin/env bash
set -euo pipefail
./node_modules/.bin/tsc scripts/stage43-test.ts src/features/recommendation/scenario.ts src/features/recommendation/hybrid.ts src/features/recommendation/engine.ts src/features/profile/local-store.ts src/data/seed-models.ts src/data/seed-api-models.ts src/features/catalog/types.ts src/features/onboarding/types.ts --outDir .test-stage43 --module commonjs --target es2022 --moduleResolution node --skipLibCheck --rootDir . --esModuleInterop
node .test-stage43/scripts/stage43-test.js
