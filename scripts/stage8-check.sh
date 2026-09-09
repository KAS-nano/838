#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage8
./node_modules/.bin/tsc scripts/stage8-test.ts src/features/integrations/huggingface.ts --outDir .test-stage8 --module commonjs --target es2022 --lib es2022,dom --skipLibCheck --rootDir .
node .test-stage8/scripts/stage8-test.js
