export type EvaluationPoint = {
  category: string;
  actual: number;
  predicted: number;
  low: number;
  high: number;
};

export type EvaluationMetrics = {
  count: number;
  mae: number;
  mape: number;
  intervalCoverage: number;
};

export function evaluatePredictions(points: EvaluationPoint[]): EvaluationMetrics {
  const valid = points.filter((point) => [point.actual, point.predicted, point.low, point.high].every(Number.isFinite) && point.actual > 0 && point.low <= point.high);
  if (!valid.length) return { count: 0, mae: 0, mape: 0, intervalCoverage: 0 };
  const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
  return {
    count: valid.length,
    mae: +mean(valid.map((point) => Math.abs(point.predicted - point.actual))).toFixed(3),
    mape: +(mean(valid.map((point) => Math.abs(point.predicted - point.actual) / point.actual)) * 100).toFixed(2),
    intervalCoverage: +(mean(valid.map((point) => point.actual >= point.low && point.actual <= point.high ? 1 : 0)) * 100).toFixed(2),
  };
}

export function evaluateByCategory(points: EvaluationPoint[]) {
  return Object.fromEntries([...new Set(points.map((point) => point.category))].sort().map((category) => [category, evaluatePredictions(points.filter((point) => point.category === category))]));
}
