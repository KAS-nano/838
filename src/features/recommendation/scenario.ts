import type { Objective, Priority } from "../onboarding/types";

export type ScenarioLatency = "responsive" | "balanced" | "quality";
export type RecommendationScenario = {
  id: string;
  label: string;
  objective: Objective;
  contextK: number;
  responseTokens: number;
  concurrency: number;
  latency: ScenarioLatency;
  priority: Priority;
};

export const scenarioPresets: RecommendationScenario[] = [
  { id: "short-chat", label: "Chat curto", objective: "Assistente geral", contextK: 8, responseTokens: 512, concurrency: 1, latency: "responsive", priority: "speed" },
  { id: "long-document", label: "Documento longo", objective: "Documentos", contextK: 64, responseTokens: 2048, concurrency: 1, latency: "balanced", priority: "quality" },
  { id: "programming", label: "Programação", objective: "Programação", contextK: 32, responseTokens: 1024, concurrency: 1, latency: "responsive", priority: "quality" },
  { id: "vision", label: "Análise de imagem", objective: "Imagem", contextK: 16, responseTokens: 768, concurrency: 1, latency: "balanced", priority: "quality" },
  { id: "transcription", label: "Transcrição", objective: "Transcrição", contextK: 16, responseTokens: 2048, concurrency: 1, latency: "balanced", priority: "speed" },
  { id: "batch", label: "Processamento em lote", objective: "Produtividade", contextK: 8, responseTokens: 512, concurrency: 8, latency: "balanced", priority: "efficiency" },
];

export function validateScenario(value: RecommendationScenario): RecommendationScenario {
  if (!scenarioPresets.some((preset) => preset.id === value.id)) throw new Error("Selecione um cenário disponível.");
  if (!Number.isInteger(value.contextK) || value.contextK < 1 || value.contextK > 256) throw new Error("O contexto deve ficar entre 1K e 256K.");
  if (!Number.isInteger(value.responseTokens) || value.responseTokens < 64 || value.responseTokens > 32768) throw new Error("A resposta deve ter entre 64 e 32768 tokens.");
  if (!Number.isInteger(value.concurrency) || value.concurrency < 1 || value.concurrency > 64) throw new Error("A concorrência deve ficar entre 1 e 64.");
  return { ...value };
}

export function scenarioExplanations(scenario: RecommendationScenario) {
  const validated = validateScenario(scenario);
  return [
    `${validated.contextK}K de contexto para ${validated.label.toLocaleLowerCase("pt-BR")}.`,
    `Resposta de até ${validated.responseTokens} tokens e ${validated.concurrency} execução${validated.concurrency === 1 ? "" : "ões"} simultânea${validated.concurrency === 1 ? "" : "s"}.`,
    `Prioridade ${validated.priority}; latência ${validated.latency}.`,
  ];
}
