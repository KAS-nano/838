#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage15
./node_modules/.bin/tsc scripts/stage15-test.ts src/features/hardware/upgrades.ts src/features/hardware/strength.ts src/features/onboarding/types.ts --outDir .test-stage15 --module commonjs --target es2022 --moduleResolution node --skipLibCheck --rootDir .
node .test-stage15/scripts/stage15-test.js
