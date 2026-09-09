import type { AiModel, ModelVariant } from "../catalog/types";
import type { HardwareProfile } from "../onboarding/types";
import type { BenchmarkRecord } from "./data";
import { estimateMemory } from "../estimation/memory";

export type PerformanceEstimate = {
  low: number;
  high: number;
  center: number;
  promptLow?: number;
  promptHigh?: number;
  confidence: "high" | "medium" | "low";
  method: "exact" | "neighbor" | "seed" | "heuristic";
  dataState: "measured" | "estimated" | "seed" | "heuristic";
  evidence: number;
  note: string;
};

export function gpuFamily(profile: HardwareProfile) {
  const gpu = profile.gpu.toLowerCase();
  const suffix = Math.max(4, Math.round(profile.vramGb / 4) * 4);
  if (/nvidia|rtx|gtx/.test(gpu)) return `nvidia-${suffix}`;
  if (/radeon|amd|rx /.test(gpu)) return `radeon-${suffix}`;
  if (profile.os === "macos") return `apple-${suffix}`;
  if (/intel|arc/.test(gpu)) return `intel-${suffix}`;
  return `generic-${suffix}`;
}

export function estimatePerformance(profile: HardwareProfile, model: AiModel, variant: ModelVariant, contextK: number, records: BenchmarkRecord[]): PerformanceEstimate {
  const context = Math.max(1, Math.min(Number.isFinite(contextK) ? contextK : 8, model.contextK));
  const family = gpuFamily(profile);
  const candidates = records.filter((record) => record.modelId === model.id && record.quantization === variant.quantization && Number.isFinite(record.generationTps) && record.generationTps > 0);
  // A VRAM bucket alone cannot establish an exact hardware match. Seed records
  // never enter the measured branch, even if their hardware bucket matches.
  const measured = candidates.filter((record) => record.measured && !/seed|demo/i.test(record.source));
  const normalize = (name?: string) => name?.trim().toLowerCase();
  const exact = measured.filter((record) => record.gpu && record.cpu && normalize(record.gpu) === normalize(profile.gpu) && normalize(record.cpu) === normalize(profile.cpu) && record.os === profile.os && record.ramGb === profile.ramGb && record.vramGb === profile.vramGb && record.contextK === context);
  if (exact.length) {
    return fromRecords(exact, "medium", "exact", "measured", "Medido em hardware, modelo, quantização e contexto correspondentes. Runtime e drivers podem alterar o resultado local.");
  }
  if (measured.length) {
    const peers = measured.filter((record) => record.gpuFamily === family);
    return fromRecords(peers.length ? peers : measured, "low", "neighbor", "estimated", "Estimado a partir de medições do mesmo modelo; hardware, contexto ou runtime diferem. Não é uma medição desta máquina.");
  }

  const memory = estimateMemory(profile, model, variant, context);
  const offloadFactor = memory.gpuLayersPercent === 100 ? 1 : Math.max(0.12, memory.gpuLayersPercent / 100 * 0.65);
  const contextFactor = 1 / (1 + Math.max(0, context - 8) * 0.004);
  const seeds = candidates.filter((record) => !record.measured || /seed|demo/i.test(record.source));
  if (seeds.length) {
    const familySeeds = seeds.filter((record) => record.gpuFamily === family);
    const selected = familySeeds.length ? familySeeds : seeds;
    const center = average(selected.map((record) => record.generationTps)) * offloadFactor * contextFactor;
    return range(center, "low", "seed", "seed", 0, "Seed demonstrativo ajustado por heurística de contexto e offload. Nenhum benchmark real sustenta esta faixa.");
  }
  const active = model.activeParamsB ?? model.paramsB;
  const base = Math.max(2, 140 / Math.pow(active, 0.72));
  const quantBoost = variant.quantization === "Q4_K_M" ? 1.08 : variant.quantization === "Q3_K_M" ? 1.14 : variant.quantization === "Q8_0" ? 0.82 : 1;
  return range(base * offloadFactor * quantBoost * contextFactor, "low", "heuristic", "heuristic", 0, "Heurística sem benchmark suficientemente próximo; não tratar como medição.");
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function fromRecords(records: BenchmarkRecord[], confidence: PerformanceEstimate["confidence"], method: PerformanceEstimate["method"], dataState: PerformanceEstimate["dataState"], note: string): PerformanceEstimate {
  const prompts = records.map((record) => record.promptTps).filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0);
  return range(average(records.map((record) => record.generationTps)), confidence, method, dataState, records.length, note, prompts.length ? average(prompts) : undefined);
}

function range(center: number, confidence: PerformanceEstimate["confidence"], method: PerformanceEstimate["method"], dataState: PerformanceEstimate["dataState"], evidence: number, note: string, prompt?: number): PerformanceEstimate {
  const spread = confidence === "high" ? 0.08 : confidence === "medium" ? 0.14 : 0.28;
  return {
    center: +center.toFixed(1),
    low: Math.max(0.1, +(center * (1 - spread)).toFixed(1)),
    high: +(center * (1 + spread)).toFixed(1),
    promptLow: prompt ? +(prompt * (1 - spread)).toFixed(1) : undefined,
    promptHigh: prompt ? +(prompt * (1 + spread)).toFixed(1) : undefined,
    confidence, method, dataState, evidence, note,
  };
}
