import type { AiModel, ModelVariant } from "../catalog/types";
import type { HardwareProfile } from "../onboarding/types";
import type { BenchmarkRecord } from "./data";
import { estimateMemory } from "../estimation/memory";
import { sampleStatistics, type SampleStatistics } from "./statistics";

export const ESTIMATOR_VERSION = "2.0.0";

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
  evidenceCount: number;
  sampleAgeDays: number | null;
  matchingFields: string[];
  differingFields: string[];
  confidenceReason: string;
  dispersion?: Pick<SampleStatistics, "p25" | "p75" | "mad">;
  estimatorVersion: typeof ESTIMATOR_VERSION;
  note: string;
};

export type EstimatorTarget = { runtime?: string; backend?: string; now?: Date };

export function gpuFamily(profile: HardwareProfile) {
  const gpu = profile.gpu.toLowerCase();
  const suffix = Math.max(4, Math.round(profile.vramGb / 4) * 4);
  if (/nvidia|rtx|gtx/.test(gpu)) return `nvidia-${suffix}`;
  if (/radeon|amd|rx /.test(gpu)) return `radeon-${suffix}`;
  if (profile.os === "macos") return `apple-${suffix}`;
  if (/intel|arc/.test(gpu)) return `intel-${suffix}`;
  return `generic-${suffix}`;
}

const normalize = (name?: string) => name?.trim().toLowerCase();
const same = (a?: string, b?: string) => Boolean(a && b && normalize(a) === normalize(b));

export function evidenceDistance(record: BenchmarkRecord, profile: HardwareProfile, contextK: number, target: EstimatorTarget = {}) {
  let distance = 0;
  if (!same(record.gpu, profile.gpu)) distance += record.gpuFamily === gpuFamily(profile) ? 1.5 : 4;
  if (!same(record.cpu, profile.cpu)) distance += 1;
  if (record.os !== profile.os) distance += 2;
  distance += Math.min(3, Math.abs(record.vramGb - profile.vramGb) / 4);
  distance += record.ramGb === undefined ? 0.5 : Math.min(2, Math.abs(record.ramGb - profile.ramGb) / 16);
  distance += Math.min(3, Math.abs(record.contextK - contextK) / Math.max(1, contextK));
  if (target.runtime && !same(record.runtime, target.runtime)) distance += 2;
  if (target.backend && !same(record.backend, target.backend)) distance += 2;
  return +distance.toFixed(3);
}

function comparisonFields(record: BenchmarkRecord, profile: HardwareProfile, contextK: number, target: EstimatorTarget) {
  const checks: Array<[string, boolean]> = [
    ["GPU", same(record.gpu, profile.gpu)],
    ["CPU", same(record.cpu, profile.cpu)],
    ["sistema", record.os === profile.os],
    ["VRAM", record.vramGb === profile.vramGb],
    ["RAM", record.ramGb === profile.ramGb],
    ["contexto", record.contextK === contextK],
  ];
  if (target.runtime) checks.push(["runtime", same(record.runtime, target.runtime)]);
  if (target.backend) checks.push(["backend", same(record.backend, target.backend)]);
  return {
    matchingFields: checks.filter(([, match]) => match).map(([field]) => field),
    differingFields: checks.filter(([, match]) => !match).map(([field]) => field),
  };
}

function sampleAgeDays(records: BenchmarkRecord[], now: Date) {
  const timestamps = records.map((record) => Date.parse(record.measuredAt ?? "")).filter(Number.isFinite);
  if (!timestamps.length) return null;
  return Math.max(0, Math.floor((now.getTime() - Math.max(...timestamps)) / 86_400_000));
}

export function estimatePerformance(
  profile: HardwareProfile,
  model: AiModel,
  variant: ModelVariant,
  contextK: number,
  records: BenchmarkRecord[],
  target: EstimatorTarget = {},
): PerformanceEstimate {
  const context = Math.max(1, Math.min(Number.isFinite(contextK) ? contextK : 8, model.contextK));
  const candidates = records.filter((record) => record.modelId === model.id && record.quantization === variant.quantization && Number.isFinite(record.generationTps) && record.generationTps > 0);
  const measured = candidates.filter((record) => record.measured && record.verified !== false && !/seed|demo/i.test(record.source));
  if (measured.length) {
    const ranked = measured.map((record) => ({ record, distance: evidenceDistance(record, profile, context, target) })).sort((a, b) => a.distance - b.distance);
    const minimum = ranked[0].distance;
    const selected = ranked.filter((item) => item.distance <= minimum + 0.5).slice(0, 20).map((item) => item.record);
    const fields = comparisonFields(selected[0], profile, context, target);
    const age = sampleAgeDays(selected, target.now ?? new Date());
    const generationStats = sampleStatistics(selected.map((record) => record.generationTps))!;
    const relativeIqr = (generationStats.p75 - generationStats.p25) / generationStats.median;
    const exact = minimum === 0;
    const recent = age !== null && age <= 180;
    const confidence = exact && selected.length >= 5 && recent && relativeIqr <= 0.15 ? "high" : exact || (minimum <= 2 && selected.length >= 3) ? "medium" : "low";
    const reason = confidence === "high"
      ? "Cinco ou mais medições recentes e próximas, com baixa dispersão."
      : confidence === "medium"
        ? "A evidência é próxima, mas ainda não cumpre todos os requisitos de confiança alta."
        : "Poucas amostras ou diferenças relevantes de hardware, contexto, runtime ou idade.";
    return fromRecords(selected, confidence, exact ? "exact" : "neighbor", exact ? "measured" : "estimated", fields, age, reason);
  }

  const memory = estimateMemory(profile, model, variant, context);
  const offloadFactor = memory.gpuLayersPercent === 100 ? 1 : Math.max(0.12, memory.gpuLayersPercent / 100 * 0.65);
  const contextFactor = 1 / (1 + Math.max(0, context - 8) * 0.004);
  const seeds = candidates.filter((record) => !record.measured || /seed|demo/i.test(record.source));
  if (seeds.length) {
    const familySeeds = seeds.filter((record) => record.gpuFamily === gpuFamily(profile));
    const selected = familySeeds.length ? familySeeds : seeds;
    const center = average(selected.map((record) => record.generationTps)) * offloadFactor * contextFactor;
    return fixedRange(center, "low", "seed", "seed", "Seeds demonstrativos não contam como evidência medida.", "Seed demonstrativo ajustado por heurística de contexto e offload. Nenhum benchmark real sustenta esta faixa.");
  }
  const active = model.activeParamsB ?? model.paramsB;
  const base = Math.max(2, 140 / Math.pow(active, 0.72));
  const quantBoost = variant.quantization === "Q4_K_M" ? 1.08 : variant.quantization === "Q3_K_M" ? 1.14 : variant.quantization === "Q8_0" ? 0.82 : 1;
  return fixedRange(base * offloadFactor * quantBoost * contextFactor, "low", "heuristic", "heuristic", "Não há benchmark medido ou seed próximo.", "Heurística sem benchmark suficientemente próximo; não tratar como medição.");
}

function average(values: number[]) { return values.reduce((sum, value) => sum + value, 0) / values.length; }

function fromRecords(
  records: BenchmarkRecord[],
  confidence: PerformanceEstimate["confidence"],
  method: PerformanceEstimate["method"],
  dataState: PerformanceEstimate["dataState"],
  fields: Pick<PerformanceEstimate, "matchingFields" | "differingFields">,
  age: number | null,
  reason: string,
): PerformanceEstimate {
  const stats = sampleStatistics(records.map((record) => record.generationTps))!;
  const promptStats = sampleStatistics(records.map((record) => record.promptTps ?? 0));
  const minimumSpread = confidence === "high" ? 0.05 : confidence === "medium" ? 0.1 : 0.2;
  const low = Math.min(stats.p25, stats.median * (1 - minimumSpread));
  const high = Math.max(stats.p75, stats.median * (1 + minimumSpread));
  return {
    center: +stats.median.toFixed(1), low: Math.max(0.1, +low.toFixed(1)), high: +high.toFixed(1),
    promptLow: promptStats ? +Math.min(promptStats.p25, promptStats.median * (1 - minimumSpread)).toFixed(1) : undefined,
    promptHigh: promptStats ? +Math.max(promptStats.p75, promptStats.median * (1 + minimumSpread)).toFixed(1) : undefined,
    confidence, method, dataState, evidence: records.length, evidenceCount: records.length, sampleAgeDays: age,
    ...fields, confidenceReason: reason, dispersion: { p25: stats.p25, p75: stats.p75, mad: stats.mad }, estimatorVersion: ESTIMATOR_VERSION,
    note: method === "exact" ? "Faixa derivada de medições no hardware e contexto correspondentes." : "Faixa estimada pelas medições mais próximas; diferenças listadas reduzem a confiança.",
  };
}

function fixedRange(
  center: number,
  confidence: PerformanceEstimate["confidence"],
  method: PerformanceEstimate["method"],
  dataState: PerformanceEstimate["dataState"],
  confidenceReason: string,
  note: string,
): PerformanceEstimate {
  const spread = 0.28;
  return {
    center: +center.toFixed(1), low: Math.max(0.1, +(center * (1 - spread)).toFixed(1)), high: +(center * (1 + spread)).toFixed(1),
    confidence, method, dataState, evidence: 0, evidenceCount: 0, sampleAgeDays: null, matchingFields: [], differingFields: [],
    confidenceReason, estimatorVersion: ESTIMATOR_VERSION, note,
  };
}
