#!/usr/bin/env bash
set -euo pipefail
./node_modules/.bin/tsc scripts/frontend-engine-test.ts --outDir .test-frontend-engine --module commonjs --target es2022 --moduleResolution node --skipLibCheck --rootDir . --esModuleInterop
node .test-frontend-engine/scripts/frontend-engine-test.js
node scripts/export-preview-catalog.mjs --check
