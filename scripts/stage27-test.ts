import { generateKeyPairSync, sign } from "node:crypto";
import { BENCHMARK_FIXTURE_ID, BENCHMARK_FIXTURE_SHA256, benchmarkFingerprint, canonicalBenchmark, validateBenchmarkProtocolV2, type BenchmarkProtocolV2 } from "../src/features/benchmarks/protocol-v2";
import { sampleStatistics } from "../src/features/benchmarks/statistics";
import { benchmarkInstallationKeyId, verifySignedBenchmark } from "../src/features/benchmarks/verifier";

const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const publicPem = publicKey.export({ type: "spki", format: "pem" }).toString();
const measuredAt = "2026-09-09T12:00:00.000Z";
const sample = (tps: number) => ({ generationTps: tps, promptTps: 100, generatedTokens: 64, promptTokens: 32, generationDurationMs: 64 / tps * 1000, promptDurationMs: 320 });
const benchmark: BenchmarkProtocolV2 = {
  protocolVersion: 2, agentVersion: "1.0.0", installationId: benchmarkInstallationKeyId(publicPem), measuredAt,
  fixtureId: BENCHMARK_FIXTURE_ID, fixtureSha256: BENCHMARK_FIXTURE_SHA256,
  modelId: "qwen3-8b", modelFile: "qwen3-8b-q4.gguf", modelSha256: "a".repeat(64), modelBytes: 5_000_000_000,
  quantization: "Q4_K_M", runtime: "Ollama", runtimeVersion: "0.12.0", backend: "CUDA", driverVersion: "580.1",
  gpu: "RTX Test", vramGb: 16, cpu: "CPU Test", ramGb: 32, os: "linux", osVersion: "test",
  contextK: 8, batch: 512, threads: 8, gpuLayers: 36, warmupRuns: 1,
  samples: [sample(32), sample(30), sample(34)], peakRamGb: 8, peakVramGb: 7,
};
const signature = sign(null, Buffer.from(canonicalBenchmark(benchmark)), privateKey).toString("base64");
const submission = { consent: true as const, benchmark, publicKey: publicPem, signature };
const now = new Date("2026-09-09T13:00:00.000Z");
const valid = verifySignedBenchmark(submission, now);
const altered = verifySignedBenchmark({ ...submission, benchmark: { ...benchmark, gpu: "Alterada" } }, now);
const expired = verifySignedBenchmark({ ...submission, benchmark: { ...benchmark, measuredAt: "2026-08-01T00:00:00.000Z" } }, now);
const inconsistent = validateBenchmarkProtocolV2({ ...benchmark, samples: [{ ...sample(32), generationTps: 90 }, sample(30), sample(34)] });
const stats = sampleStatistics([10, 20, 30, 40]);
const tests: [string, boolean][] = [
  ["valid Ed25519 signature", valid.ok],
  ["altered payload rejected", !altered.ok],
  ["expired measurement rejected", !expired.ok],
  ["inconsistent rate rejected", "errors" in inconsistent && inconsistent.errors.some((error) => error.includes("incoerente"))],
  ["quartiles and median", stats?.median === 25 && stats.p25 === 17.5 && stats.p75 === 32.5],
  ["stable fingerprint", benchmarkFingerprint(benchmark) === benchmarkFingerprint({ ...benchmark })],
];
let failed = false;
for (const [name, passed] of tests) { console.log(`${passed ? "PASS" : "FAIL"} ${name}`); if (!passed) failed = true; }
if (failed) process.exitCode = 1;
