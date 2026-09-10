import { estimatePerformance, evidenceDistance, ESTIMATOR_VERSION } from "../src/features/benchmarks/estimator";
import { evaluateByCategory, evaluatePredictions } from "../src/features/benchmarks/evaluation";
import type { BenchmarkRecord } from "../src/features/benchmarks/data";
import { seedModels } from "../src/data/seed-models";
import { demoHardwareProfile } from "../src/features/profile/local-store";
import { estimateMemory } from "../src/features/estimation/memory";
import { calculateCompatibility } from "../src/features/recommendation/engine";

const profile = { ...demoHardwareProfile, cpu: "CPU Exact", gpu: "RTX Exact", vramGb: 16, ramGb: 32, os: "linux" as const };
const model = seedModels[0];
const variant = model.variants.find((item) => item.quantization === "Q4_K_M")!;
const values = [38, 39, 40, 41, 42];
const records: BenchmarkRecord[] = values.map((generationTps, index) => ({
  id: `measured-${index}`, gpuFamily: "nvidia-16", gpu: profile.gpu, cpu: profile.cpu, vramGb: 16, ramGb: 32,
  os: "linux", modelId: model.id, quantization: variant.quantization, contextK: 8, generationTps,
  runtime: "Ollama", backend: "CUDA", measured: true, verified: true, measuredAt: "2026-09-01T00:00:00.000Z", source: "community-v2",
}));
const high = estimatePerformance(profile, model, variant, 8, records, { runtime: "Ollama", backend: "CUDA", now: new Date("2026-09-09T00:00:00.000Z") });
const old = estimatePerformance(profile, model, variant, 8, records.map((record) => ({ ...record, measuredAt: "2025-01-01T00:00:00.000Z" })), { now: new Date("2026-09-09T00:00:00.000Z") });
const neighborRecord = { ...records[0], gpu: "RTX Other", cpu: "CPU Other", generationTps: 20 };
const neighbor = estimatePerformance(profile, model, variant, 8, [neighborRecord], { now: new Date("2026-09-09T00:00:00.000Z") });
const metrics = evaluatePredictions([{ category: "small", actual: 10, predicted: 12, low: 9, high: 13 }, { category: "small", actual: 20, predicted: 18, low: 17, high: 19 }]);
const categories = evaluateByCategory([{ category: "a", actual: 10, predicted: 10, low: 9, high: 11 }, { category: "b", actual: 20, predicted: 20, low: 19, high: 21 }]);
const unifiedProfile = { ...profile, vramGb: 0, ramGb: 32, memoryArchitecture: "unified" as const, cpuArchitecture: "arm64" as const };
const unifiedMemory = estimateMemory(unifiedProfile, model, variant, 8);
const unifiedCompatibility = calculateCompatibility(unifiedProfile, model, variant, undefined, 8);
const legacyMemory = estimateMemory({ ...profile, vramGb: 0, memoryArchitecture: undefined }, model, variant, 8);
const tests: [string, boolean][] = [
  ["high confidence threshold", high.confidence === "high" && high.evidenceCount === 5],
  ["empirical median", high.center === 40 && high.dispersion?.p25 === 39 && high.dispersion.p75 === 41],
  ["evidence metadata", high.sampleAgeDays === 8 && high.matchingFields.includes("runtime") && high.differingFields.length === 0],
  ["old evidence lowers confidence", old.confidence !== "high" && (old.sampleAgeDays ?? 0) > 180],
  ["neighbor differences", neighbor.method === "neighbor" && neighbor.differingFields.includes("GPU")],
  ["distance ordering", evidenceDistance(records[0], profile, 8) < evidenceDistance(neighborRecord, profile, 8)],
  ["algorithm version", high.estimatorVersion === ESTIMATOR_VERSION],
  ["offline metrics", metrics.mae === 2 && metrics.mape === 15 && metrics.intervalCoverage === 50],
  ["category metrics", categories.a.count === 1 && categories.b.count === 1],
  ["unified memory is one budget", unifiedMemory.gpuLayersPercent === 100 && unifiedMemory.unifiedMemoryGb === unifiedMemory.ramGb && unifiedMemory.notes.some((note) => note.includes("não devem ser somados"))],
  ["unified memory enables accelerator fit", unifiedCompatibility.fit === "gpu"],
  ["legacy profile remains dedicated", legacyMemory.gpuLayersPercent === 0 && legacyMemory.unifiedMemoryGb === undefined],
];
let failed = false;
for (const [name, passed] of tests) { console.log(`${passed ? "PASS" : "FAIL"} ${name}`); if (!passed) failed = true; }
if (failed) process.exitCode = 1;
