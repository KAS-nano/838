#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage12
./node_modules/.bin/tsc scripts/stage12-test.ts src/features/integrations/local-providers.ts src/features/integrations/openrouter.ts --outDir .test-stage12 --module commonjs --target es2022 --lib es2022,dom --skipLibCheck --rootDir .
node .test-stage12/scripts/stage12-test.js
