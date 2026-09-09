#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
./node_modules/.bin/tsc scripts/comparison-engine-test.ts --outDir .test-comparison-engine --module commonjs --target es2022 --moduleResolution node --skipLibCheck --rootDir . --esModuleInterop
node .test-comparison-engine/scripts/comparison-engine-test.js
