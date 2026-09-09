export type CommunityBenchmarkInput = {
  consent: boolean;
  gpu: string;
  cpu?: string;
  ramGb?: number;
  os: "windows" | "linux" | "macos";
  distro?: string;
  model: string;
  quantization?: string;
  contextK: number;
  runtime: string;
  backend: string;
  generationTps: number;
  promptTps?: number;
  vramGb?: number;
  measured: true;
};

export type SanitizedCommunityBenchmark = Omit<CommunityBenchmarkInput, "consent"> & {
  schemaVersion: 1;
};

const clean = (value: string, max = 120) => value.trim().replace(/[\u0000-\u001f]/g, "").slice(0, max);

export function validateCommunityBenchmark(input: unknown): { ok: true; value: SanitizedCommunityBenchmark } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  if (!input || typeof input !== "object") return { ok: false, errors: ["Payload inválido."] };
  const x = input as Record<string, unknown>;

  if (x.consent !== true) errors.push("Consentimento explícito é obrigatório.");
  for (const key of ["gpu", "model", "runtime", "backend"] as const) {
    if (typeof x[key] !== "string" || !x[key]?.toString().trim()) errors.push(`${key} é obrigatório.`);
  }
  if (!(["windows", "linux", "macos"] as unknown[]).includes(x.os)) errors.push("Sistema operacional inválido.");

  const contextK = Number(x.contextK);
  const generationTps = Number(x.generationTps);
  if (!Number.isFinite(contextK) || contextK < 1 || contextK > 2048) errors.push("Contexto fora da faixa suportada.");
  if (!Number.isFinite(generationTps) || generationTps <= 0 || generationTps > 10000) errors.push("Tokens/s fora da faixa suportada.");

  const optionalNumber = (key: string, min: number, max: number) => {
    if (x[key] == null || x[key] === "") return undefined;
    const n = Number(x[key]);
    if (!Number.isFinite(n) || n < min || n > max) errors.push(`${key} fora da faixa suportada.`);
    return n;
  };
  const ramGb = optionalNumber("ramGb", 1, 4096);
  const promptTps = optionalNumber("promptTps", 0.01, 100000);
  const vramGb = optionalNumber("vramGb", 0, 512);

  if (x.measured !== true) errors.push("A comunidade aceita apenas resultados medidos.");
  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      schemaVersion: 1,
      gpu: clean(String(x.gpu)),
      cpu: typeof x.cpu === "string" ? clean(x.cpu) : undefined,
      ramGb,
      os: x.os as SanitizedCommunityBenchmark["os"],
      distro: typeof x.distro === "string" ? clean(x.distro, 80) : undefined,
      model: clean(String(x.model)),
      quantization: typeof x.quantization === "string" ? clean(x.quantization, 40) : undefined,
      contextK,
      runtime: clean(String(x.runtime), 80),
      backend: clean(String(x.backend), 40),
      generationTps,
      promptTps,
      vramGb,
      measured: true,
    },
  };
}

export function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function isLikelyOutlier(value: number, peerValues: number[]): boolean {
  if (peerValues.length < 5) return false;
  const m = median(peerValues)!;
  const deviations = peerValues.map((v) => Math.abs(v - m));
  const mad = median(deviations) ?? 0;
  if (mad === 0) return value > m * 2.5 || value < m / 2.5;
  const modifiedZ = 0.6745 * Math.abs(value - m) / mad;
  return modifiedZ > 4.5;
}
