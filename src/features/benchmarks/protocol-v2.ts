import { createHash } from "node:crypto";
import { sampleStatistics } from "./statistics";

export const BENCHMARK_PROTOCOL_VERSION = 2 as const;
export const BENCHMARK_FIXTURE_ID = "838-text-generation-v1";
export const BENCHMARK_FIXTURE_PROMPT = "Explique em poucas frases por que medir desempenho local ajuda a escolher um modelo de IA.";
export const BENCHMARK_FIXTURE_SHA256 = createHash("sha256").update(BENCHMARK_FIXTURE_PROMPT).digest("hex");

export type BenchmarkSampleV2 = {
  generationTps: number;
  promptTps?: number;
  generatedTokens: number;
  promptTokens: number;
  generationDurationMs: number;
  promptDurationMs?: number;
};

export type BenchmarkProtocolV2 = {
  protocolVersion: 2;
  agentVersion: string;
  installationId: string;
  measuredAt: string;
  fixtureId: string;
  fixtureSha256: string;
  modelId: string;
  modelFile: string;
  modelSha256?: string;
  modelBytes?: number;
  quantization: string;
  runtime: string;
  runtimeVersion: string;
  backend: string;
  driverVersion?: string;
  gpu: string;
  vramGb: number;
  cpu: string;
  ramGb: number;
  os: "windows" | "linux" | "macos";
  osVersion: string;
  contextK: number;
  batch: number;
  threads: number;
  gpuLayers: number;
  warmupRuns: number;
  samples: BenchmarkSampleV2[];
  peakRamGb?: number;
  peakVramGb?: number;
};

export type ValidatedBenchmarkV2 = BenchmarkProtocolV2 & {
  summary: { generation: NonNullable<ReturnType<typeof sampleStatistics>>; prompt?: NonNullable<ReturnType<typeof sampleStatistics>> };
};

const cleanText = (value: unknown, max: number) => typeof value === "string" ? value.trim().replace(/[\u0000-\u001f]/g, "").slice(0, max) : "";
const finite = (value: unknown, min: number, max: number) => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;

export function canonicalBenchmark(value: BenchmarkProtocolV2) {
  const sort = (item: unknown): unknown => Array.isArray(item) ? item.map(sort) : item && typeof item === "object"
    ? Object.fromEntries(Object.entries(item as Record<string, unknown>).filter(([, child]) => child !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, sort(child)]))
    : item;
  return JSON.stringify(sort(value));
}

export function benchmarkFingerprint(value: BenchmarkProtocolV2) {
  return createHash("sha256").update(canonicalBenchmark(value)).digest("hex");
}

export function validateBenchmarkProtocolV2(input: unknown): { ok: true; value: ValidatedBenchmarkV2 } | { ok: false; errors: string[] } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, errors: ["Benchmark v2 inválido."] };
  const value = input as Record<string, unknown>;
  const errors: string[] = [];
  if (value.protocolVersion !== BENCHMARK_PROTOCOL_VERSION) errors.push("Versão de protocolo incompatível.");
  for (const [key, max] of [["agentVersion", 40], ["installationId", 128], ["modelId", 160], ["modelFile", 240], ["quantization", 40], ["runtime", 80], ["runtimeVersion", 40], ["backend", 40], ["gpu", 160], ["cpu", 160], ["osVersion", 80]] as const) {
    if (!cleanText(value[key], max)) errors.push(`${key} é obrigatório.`);
  }
  if (value.fixtureId !== BENCHMARK_FIXTURE_ID || value.fixtureSha256 !== BENCHMARK_FIXTURE_SHA256) errors.push("Fixture de benchmark desconhecida.");
  if (!["windows", "linux", "macos"].includes(String(value.os))) errors.push("Sistema operacional inválido.");
  for (const [key, min, max] of [["vramGb", 0, 1024], ["ramGb", 1, 4096], ["contextK", 1, 2048], ["batch", 1, 4096], ["threads", 1, 1024], ["gpuLayers", 0, 1000], ["warmupRuns", 1, 20]] as const) {
    if (!finite(value[key], min, max)) errors.push(`${key} fora da faixa permitida.`);
  }
  if (typeof value.modelSha256 === "string" && !/^[a-f0-9]{64}$/i.test(value.modelSha256)) errors.push("Hash do modelo inválido.");
  if (value.modelBytes !== undefined && !finite(value.modelBytes, 1, Number.MAX_SAFE_INTEGER)) errors.push("Tamanho do modelo inválido.");
  if (!Number.isFinite(Date.parse(String(value.measuredAt)))) errors.push("Data da medição inválida.");
  const samples = Array.isArray(value.samples) ? value.samples as Array<Record<string, unknown>> : [];
  if (samples.length < 3 || samples.length > 20) errors.push("São necessárias de 3 a 20 amostras.");
  for (const [index, sample] of samples.entries()) {
    for (const [key, min, max] of [["generationTps", 0.01, 10000], ["generatedTokens", 1, 100000], ["promptTokens", 1, 100000], ["generationDurationMs", 1, 86_400_000]] as const) {
      if (!finite(sample[key], min, max)) errors.push(`Amostra ${index + 1}: ${key} inválido.`);
    }
    if (finite(sample.generatedTokens, 1, 100000) && finite(sample.generationDurationMs, 1, 86_400_000) && finite(sample.generationTps, 0.01, 10000)) {
      const calculated = Number(sample.generatedTokens) / (Number(sample.generationDurationMs) / 1000);
      if (Math.abs(calculated - Number(sample.generationTps)) / calculated > 0.05) errors.push(`Amostra ${index + 1}: taxa de geração incoerente.`);
    }
  }
  const generation = sampleStatistics(samples.map((sample) => Number(sample.generationTps)));
  const prompts = samples.map((sample) => Number(sample.promptTps)).filter((item) => Number.isFinite(item) && item > 0);
  const prompt = sampleStatistics(prompts);
  if (!generation) errors.push("Amostras de geração ausentes.");
  if (errors.length || !generation) return { ok: false, errors };
  return { ok: true, value: { ...(input as BenchmarkProtocolV2), summary: { generation, prompt: prompt ?? undefined } } };
}
