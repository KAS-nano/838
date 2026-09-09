#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage17
./node_modules/.bin/tsc scripts/stage17-test.ts src/features/installation/recipes.ts src/features/onboarding/types.ts --outDir .test-stage17 --module commonjs --target es2022 --moduleResolution node --skipLibCheck --rootDir .
node .test-stage17/scripts/stage17-test.js
