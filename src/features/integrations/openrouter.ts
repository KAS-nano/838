import { fetchWithTimeout, readJsonWithLimit } from "../../server/http/fetch";

export type OpenRouterModel = { id: string; name: string; contextLength?: number; inputUsdPerM?: number; outputUsdPerM?: number; inputModalities: string[]; outputModalities: string[] };

export function openRouterModelsUrl(sort = "pricing-low-to-high") {
  const url = new URL("https://openrouter.ai/api/v1/models");
  url.searchParams.set("sort", sort);
  return url.toString();
}

function perM(value: unknown) {
  if (value === null || value === undefined || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number * 1_000_000 : undefined;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function mapOpenRouterModel(input: unknown): OpenRouterModel {
  const value = record(input), pricing = record(value.pricing), architecture = record(value.architecture);
  const strings = (items: unknown) => Array.isArray(items) ? items.filter((item): item is string => typeof item === "string") : [];
  return {
    id: String(value.id ?? ""), name: String(value.name ?? value.id ?? ""),
    contextLength: typeof value.context_length === "number" ? value.context_length : undefined,
    inputUsdPerM: perM(pricing.prompt), outputUsdPerM: perM(pricing.completion),
    inputModalities: strings(architecture.input_modalities), outputModalities: strings(architecture.output_modalities),
  };
}

export async function listOpenRouterModels(apiKey: string | undefined, fetcher: typeof fetch = fetch) {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  const response = await fetchWithTimeout(openRouterModelsUrl(), { headers, next: { revalidate: 900 } } as RequestInit, 8_000, fetcher);
  if (!response.ok) throw new Error(`OpenRouter respondeu ${response.status}`);
  const json = await readJsonWithLimit(response) as { data?: unknown };
  return Array.isArray(json?.data) ? json.data.map(mapOpenRouterModel) : [];
}
