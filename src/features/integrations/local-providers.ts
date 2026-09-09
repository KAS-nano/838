export type LocalModel = { id: string; name: string; sizeBytes?: number; family?: string; quantization?: string; provider: "ollama" | "lmstudio" };

export function ollamaModelsUrl(baseUrl = "http://127.0.0.1:11434") { return `${baseUrl.replace(/\/$/, "")}/api/tags`; }
export function lmStudioModelsUrl(baseUrl = "http://127.0.0.1:1234") { return `${baseUrl.replace(/\/$/, "")}/v1/models`; }

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function normalizeOllamaModels(input: unknown): LocalModel[] {
  const models = record(input).models;
  if (!Array.isArray(models)) return [];
  return models.map((entry) => {
    const model = record(entry), details = record(model.details);
    return {
      id: String(model.model ?? model.name ?? ""),
      name: String(model.name ?? model.model ?? ""),
      sizeBytes: typeof model.size === "number" ? model.size : undefined,
      family: typeof details.family === "string" ? details.family : undefined,
      quantization: typeof details.quantization_level === "string" ? details.quantization_level : undefined,
      provider: "ollama" as const,
    };
  }).filter((model) => model.id);
}

export function normalizeLmStudioModels(input: unknown): LocalModel[] {
  const models = record(input).data;
  if (!Array.isArray(models)) return [];
  return models.map((entry) => {
    const model = record(entry);
    return { id: String(model.id ?? ""), name: String(model.id ?? ""), provider: "lmstudio" as const };
  }).filter((model) => model.id);
}

export const LOCAL_PROVIDER_NOTE = "A aplicação web hospedada não deve fazer fetch server-side para localhost do usuário. A conexão local precisa ocorrer no navegador com CORS autorizado ou, preferencialmente, via 838 Agent.";
