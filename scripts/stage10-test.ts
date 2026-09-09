import { estimatePerformance } from "../src/features/benchmarks/estimator";
import { seedBenchmarks, type BenchmarkRecord } from "../src/features/benchmarks/data";
import { seedModels } from "../src/data/seed-models";
import { demoHardwareProfile } from "../src/features/profile/local-store";

const profile = { ...demoHardwareProfile, cpu: "Ryzen 7 5700X", gpu: "Radeon RX 9070 XT" };
const model = seedModels.find((item) => item.id === "qwen3-8b")!;
const variant = model.variants.find((item) => item.quantization === "Q4_K_M")!;
const seed = estimatePerformance(profile, model, variant, 8, seedBenchmarks);
const measured: BenchmarkRecord = { ...seedBenchmarks[0], id: "local-measured", measured: true, source: "local-user", generationTps: 21, gpu: profile.gpu, cpu: profile.cpu, ramGb: profile.ramGb, os: profile.os };
const exact = estimatePerformance(profile, model, variant, 8, [...seedBenchmarks, measured]);
const neighbor = estimatePerformance({ ...profile, gpu: "Different GPU" }, model, variant, 8, [measured]);
const other = seedModels.find((item) => item.id === "phi4-14b")!;
const heuristic = estimatePerformance(profile, other, other.variants[0], 16, seedBenchmarks);
const tests: [string, boolean][] = [
  ["seed explicitly identified", seed.method === "seed" && seed.dataState === "seed"],
  ["seed has no measured evidence", seed.confidence === "low" && seed.evidence === 0],
  ["range valid", seed.low < seed.center && seed.center < seed.high],
  ["measured outranks seed", exact.method === "exact" && exact.dataState === "measured" && exact.center === 21],
  ["VRAM bucket is not exact hardware", neighbor.method === "neighbor" && neighbor.dataState === "estimated"],
  ["heuristic path", heuristic.method === "heuristic" && heuristic.confidence === "low"],
];
let failed = false;
for (const [name, passed] of tests) { console.log(`${passed ? "PASS" : "FAIL"} ${name}`); if (!passed) failed = true; }
if (failed) throw new Error("stage10 failed");
