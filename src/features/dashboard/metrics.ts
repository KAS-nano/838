export type MetricStatus = "comfortable" | "moderate" | "limit" | "insufficient";

export function metricStatus(value: number, max: number): MetricStatus {
  if (max <= 0 || value > max) return "insufficient";
  const ratio = value / max;
  if (ratio <= 0.7) return "comfortable";
  if (ratio <= 0.88) return "moderate";
  return "limit";
}

export function clampPercent(value: number, max: number) {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

export function statusLabel(status: MetricStatus) {
  return ({ comfortable: "Confortável", moderate: "Moderado", limit: "Próximo do limite", insufficient: "Insuficiente" } as const)[status];
}
