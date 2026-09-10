export type SampleStatistics = {
  count: number;
  median: number;
  p25: number;
  p75: number;
  mad: number;
  min: number;
  max: number;
};

export function percentile(values: number[], probability: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const position = Math.max(0, Math.min(1, probability)) * (sorted.length - 1);
  const lower = Math.floor(position);
  const fraction = position - lower;
  return sorted[lower + 1] === undefined ? sorted[lower] : sorted[lower] + fraction * (sorted[lower + 1] - sorted[lower]);
}

export function sampleStatistics(values: number[]): SampleStatistics | null {
  const valid = values.filter((value) => Number.isFinite(value) && value > 0);
  if (!valid.length) return null;
  const median = percentile(valid, 0.5)!;
  const mad = percentile(valid.map((value) => Math.abs(value - median)), 0.5)!;
  return {
    count: valid.length,
    median: +median.toFixed(3),
    p25: +percentile(valid, 0.25)!.toFixed(3),
    p75: +percentile(valid, 0.75)!.toFixed(3),
    mad: +mad.toFixed(3),
    min: Math.min(...valid),
    max: Math.max(...valid),
  };
}
