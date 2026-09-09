import assert from "node:assert/strict";
import { seedModels } from "../src/data/seed-models";
import { demoHardwareProfile } from "../src/features/profile/local-store";
import { createComparisonRows, DEFAULT_SELECTIONS, filterCatalog, filterComparisonRows, metricScale, metricValue, sortComparisonRows, type ComparisonSelection } from "../src/features/comparison/engine";

const rows = createComparisonRows(demoHardwareProfile, seedModels, DEFAULT_SELECTIONS, 8);
assert.equal(rows.length, 3);
assert(rows.every((row) => row.perf.dataState !== "measured" && row.perf.confidence === "low"));
assert(rows.every((row) => row.compat.vramEstimatedGb === row.memory.vramGb));
const originalOrder = rows.map((row) => row.slotId);
for (const metric of ["vram", "ram", "disk", "speed", "compatibility"] as const) {
  const sorted = sortComparisonRows(rows, metric);
  const values = sorted.map((row) => metricValue(row, metric));
  for (let i = 1; i < values.length; i++) {
    if (metric === "speed" || metric === "compatibility") assert(values[i - 1] >= values[i]);
    else assert(values[i - 1] <= values[i]);
  }
  assert.deepEqual(rows.map((row) => row.slotId), originalOrder, "Sorting must not overwrite the user's slot order");
}
const variants: ComparisonSelection[] = [
  { slotId: "a", modelId: "qwen3-8b", quantization: "Q4_K_M" },
  { slotId: "b", modelId: "qwen3-8b", quantization: "Q8_0" },
  { slotId: "c", modelId: "qwen3-8b", quantization: "Q4_K_M" },
];
const versions = createComparisonRows({ ...demoHardwareProfile, vramGb: 4 }, seedModels, variants, 8);
assert.equal(versions.length, 3, "Two quantizations of one model must remain independent selections");
assert(versions[1].memory.totalGpuTargetGb > versions[0].memory.totalGpuTargetGb);
assert(versions[1].memory.ramGb > versions[0].memory.ramGb);
assert(versions[0].memory.totalGpuTargetGb > versions[0].memory.vramGb, "VRAM requirement must not be capped to physical allocation");
assert.equal(metricValue(versions[0], "vram"), versions[0].memory.totalGpuTargetGb);
assert.deepEqual(sortComparisonRows(versions, "vram").map((row) => row.slotId), ["a", "c", "b"], "Ties preserve original slot order");
assert.equal(metricScale(versions, "compatibility"), 100);
assert.equal(metricScale([], "vram"), 1);
const limited = createComparisonRows(demoHardwareProfile, seedModels, [{ slotId: "limited", modelId: "phi4-14b", quantization: "Q4_K_M" }], 256)[0];
assert.equal(limited.contextK, 16);
const smallContext = createComparisonRows(demoHardwareProfile, seedModels, variants, 1)[0];
const largeContext = createComparisonRows(demoHardwareProfile, seedModels, variants, 40)[0];
assert(largeContext.memory.totalGpuTargetGb > smallContext.memory.totalGpuTargetGb);
assert(largeContext.perf.center < smallContext.perf.center);
assert.equal(createComparisonRows(demoHardwareProfile, seedModels, variants, NaN)[0].contextK, 8);
assert.deepEqual(createComparisonRows(demoHardwareProfile, seedModels, [{ slotId: "bad", modelId: "missing", quantization: "Q4_K_M" }], 8), []);
assert(filterCatalog(seedModels, { query: "PROGRAMAÇAO" }).length > 0, "Search is accent and case insensitive");
assert.deepEqual(filterCatalog(seedModels, { query: "Qwen3 14B", family: "Gemma" }), []);
assert.equal(filterCatalog(seedModels, { query: "Qwen3 14B" })[0].id, "qwen3-14b");
const noSpace = createComparisonRows({ ...demoHardwareProfile, storageFreeGb: 0 }, seedModels, DEFAULT_SELECTIONS, 8);
assert.equal(filterComparisonRows(noSpace, "gpu").length, 0);
assert.equal(filterComparisonRows(noSpace, "incompatible").length, 3);
assert.equal(filterComparisonRows(rows, "all").length, 3);
console.log("PASS comparison: quantization isolation, stable metric sorting, context limits, VRAM required vs allocated, honest evidence and filters");
