import assert from "node:assert/strict";
import { seedModels } from "../src/data/seed-models";
import { estimateMemory } from "../src/features/estimation/memory";
import { calculateCompatibility } from "../src/features/recommendation/engine";
import { estimatePerformance } from "../src/features/benchmarks/estimator";
import { seedBenchmarks } from "../src/features/benchmarks/data";
import { demoHardwareProfile, exportProfile, isHardwareProfile, parseHardwareProfile, validateImport } from "../src/features/profile/local-store";

const profile = demoHardwareProfile;
const model = seedModels.find((item) => item.id === "gemma3-27b")!;
const variant = model.variants.find((item) => item.quantization === "Q4_K_M")!;
for (const context of [8, 32, 128]) {
  const memory = estimateMemory(profile, model, variant, context);
  const compatibility = calculateCompatibility(profile, model, variant, "Documentos", context);
  assert.equal(compatibility.vramEstimatedGb, memory.vramGb);
  assert.equal(compatibility.ramEstimatedGb, memory.ramGb);
  assert.equal(compatibility.diskGb, memory.diskGb);
}
const small = seedModels.find((item) => item.id === "qwen3-8b")!;
const q4 = small.variants.find((item) => item.quantization === "Q4_K_M")!;
const constrained = { ...profile, vramGb: 6.8 };
assert.equal(calculateCompatibility(constrained, small, q4, "Programação", 1).fit, "gpu");
assert.equal(calculateCompatibility(constrained, small, q4, "Programação", 40).fit, "offload");
assert.equal(calculateCompatibility({ ...profile, storageFreeGb: q4.diskGb }, small, q4).fit, "incompatible");
assert.equal(estimateMemory({ ...profile, vramGb: 0 }, small, q4, 8).vramGb, 0);
assert(estimateMemory({ ...profile, vramGb: 0 }, small, q4, 32).ramGb > estimateMemory({ ...profile, vramGb: 0 }, small, q4, 8).ramGb);
assert(estimatePerformance(constrained, small, q4, 40, seedBenchmarks).center < estimatePerformance(constrained, small, q4, 1, seedBenchmarks).center);
assert.equal(seedModels.length, 17);
assert(seedModels.every((item) => item.source === "seed" && item.variants.length >= 5));
assert(isHardwareProfile(profile));
assert.deepEqual(parseHardwareProfile(JSON.stringify(profile)), profile);
assert.equal(parseHardwareProfile('{broken'), null);
for (const invalid of [null, [], { cpu: "CPU", ramGb: 16 }, { ...profile, os: "unknown" }, { ...profile, ramGb: "32" }, { ...profile, vramGb: -1 }, { ...profile, objectives: ["unknown"] }, { ...profile, storageFreeGb: 2000 }]) assert.equal(isHardwareProfile(invalid), false);
assert(validateImport(exportProfile(JSON.stringify(profile))));
assert.equal(validateImport({ version: 1, exportedAt: new Date().toISOString(), hardware: { cpu: "CPU", ramGb: 16 } }), false);
assert.equal(exportProfile('{broken').hardware, null);
console.log("PASS shared memory/compatibility/context, seed catalog, performance, profile persistence and invalid imports");
