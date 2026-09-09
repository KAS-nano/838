#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage16
./node_modules/.bin/tsc scripts/stage16-test.ts src/features/systems/recommender.ts src/features/onboarding/types.ts --outDir .test-stage16 --module commonjs --target es2022 --moduleResolution node --skipLibCheck --rootDir .
node .test-stage16/scripts/stage16-test.js
