#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage14
./node_modules/.bin/tsc scripts/stage14-test.ts src/features/hardware/strength.ts src/features/onboarding/types.ts --outDir .test-stage14 --module commonjs --target es2022 --moduleResolution node --skipLibCheck --rootDir .
node .test-stage14/scripts/stage14-test.js
