#!/usr/bin/env bash
set -euo pipefail
rm -rf .test-stage26
./node_modules/.bin/tsc scripts/stage26-test.ts --outDir .test-stage26 --module commonjs --target es2022 --moduleResolution node --lib es2022,dom --skipLibCheck --rootDir . --esModuleInterop
node .test-stage26/scripts/stage26-test.js
