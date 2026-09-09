import type { AiModel, Quantization } from "../catalog/types";
import type { HardwareProfile } from "../onboarding/types";
import { estimateMemory } from "../estimation/memory";
import { estimatePerformance } from "../benchmarks/estimator";
import { seedBenchmarks, type BenchmarkRecord } from "../benchmarks/data";
import { calculateCompatibility, type FitState } from "../recommendation/engine";

export type ComparisonSelection = { slotId: string; modelId: string; quantization: Quantization };
export type ComparisonRow = {
  slotId: string;
  model: AiModel;
  variant: AiModel["variants"][number];
  contextK: number;
  memory: ReturnType<typeof estimateMemory>;
  perf: ReturnType<typeof estimatePerformance>;
  compat: ReturnType<typeof calculateCompatibility>;
};
export type ComparisonMetric = "compatibility" | "speed" | "vram" | "ram" | "disk";
export type ComparisonSort = "selection" | ComparisonMetric;
export type ComparisonFit = "all" | FitState;

export const DEFAULT_SELECTIONS: ComparisonSelection[] = [
  { slotId: "model-1", modelId: "qwen3-8b", quantization: "Q4_K_M" },
  { slotId: "model-2", modelId: "qwen3-14b", quantization: "Q4_K_M" },
  { slotId: "model-3", modelId: "gemma3-12b", quantization: "Q4_K_M" },
];
export const COMPARISON_METRICS: { key: ComparisonMetric; label: string; unit: string; direction: "higher" | "lower"; description: string }[] = [
  { key: "compatibility", label: "Compatibilidade", unit: "/100", direction: "higher", description: "Maior é melhor para o perfil e objetivo atuais; não mede a qualidade das respostas." },
  { key: "speed", label: "Geração estimada", unit: "t/s", direction: "higher", description: "Maior é mais rápido. A barra usa o centro da faixa; consulte a origem dos dados." },
  { key: "vram", label: "VRAM para carga total", unit: "GB", direction: "lower", description: "Menor exige menos GPU. Inclui pesos, KV cache e overhead; pode superar a VRAM física." },
  { key: "ram", label: "RAM estimada", unit: "GB", direction: "lower", description: "Menor exige menos RAM. Inclui o offload previsto para este perfil." },
  { key: "disk", label: "Disco estimado", unit: "GB", direction: "lower", description: "Menor ocupa menos espaço. Inclui margem para runtime e cache." },
];
export const FIT_LABELS: Record<FitState, string> = { gpu: "Cabe na GPU", offload: "Requer RAM/CPU", incompatible: "Não cabe no perfil" };
export const ORIGIN_LABELS: Record<ComparisonRow["perf"]["dataState"], string> = { measured: "Medido", estimated: "Estimado de medições", seed: "Seed demonstrativo", heuristic: "Heurística" };
export const CONFIDENCE_LABELS: Record<ComparisonRow["perf"]["confidence"], string> = { high: "Alta", medium: "Média", low: "Baixa" };

export function createComparisonRows(profile: HardwareProfile, models: AiModel[], selections: ComparisonSelection[], contextK: number, records: BenchmarkRecord[] = seedBenchmarks): ComparisonRow[] {
  return selections.flatMap((selection) => {
    const model = models.find((item) => item.id === selection.modelId);
    const variant = model?.variants.find((item) => item.quantization === selection.quantization);
    // Do not silently substitute a different model or quantization.
    if (!model || !variant) return [];
    const context = Math.max(1, Math.min(Number.isFinite(contextK) ? contextK : 8, model.contextK));
    return [{
      slotId: selection.slotId, model, variant, contextK: context,
      memory: estimateMemory(profile, model, variant, context),
      perf: estimatePerformance(profile, model, variant, context, records),
      compat: calculateCompatibility(profile, model, variant, profile.objectives[0], context),
    }];
  });
}

function normalize(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim(); }

export function filterCatalog(models: AiModel[], filters: { query?: string; family?: string }): AiModel[] {
  const terms = normalize(filters.query ?? "").split(/\s+/).filter(Boolean);
  return models.filter((model) => {
    const searchable = normalize([model.name, model.family, model.description, ...model.objectives].join(" "));
    return (!filters.family || filters.family === "all" || model.family === filters.family) && terms.every((term) => searchable.includes(term));
  });
}

export function filterComparisonRows(rows: ComparisonRow[], fit: ComparisonFit = "all"): ComparisonRow[] {
  return rows.filter((row) => fit === "all" || row.compat.fit === fit);
}

export function metricValue(row: ComparisonRow, metric: ComparisonMetric): number {
  switch (metric) {
    case "compatibility": return row.compat.score;
    case "speed": return row.perf.center;
    case "vram": return row.memory.totalGpuTargetGb;
    case "ram": return row.memory.ramGb;
    case "disk": return row.memory.diskGb;
  }
}

export function sortComparisonRows(rows: ComparisonRow[], sort: ComparisonSort = "selection"): ComparisonRow[] {
  if (sort === "selection") return [...rows];
  const direction = sort === "compatibility" || sort === "speed" ? -1 : 1;
  // Stable ties retain the user's slot order, including two variants of one model.
  return [...rows].sort((a, b) => direction * (metricValue(a, sort) - metricValue(b, sort)));
}

export function metricScale(rows: ComparisonRow[], metric: ComparisonMetric): number {
  return metric === "compatibility" ? 100 : Math.max(1, ...rows.map((row) => metricValue(row, metric)));
}

const numberFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
export function formatMetric(row: ComparisonRow, metric: ComparisonMetric): string {
  if (metric === "speed") return `${numberFormat.format(row.perf.low)}–${numberFormat.format(row.perf.high)} t/s`;
  const value = numberFormat.format(metricValue(row, metric));
  return metric === "compatibility" ? `${value}/100` : `${value} GB`;
}
