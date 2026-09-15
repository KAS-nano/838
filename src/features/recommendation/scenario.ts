import { objectives, type Objective, type Priority } from "../onboarding/types";

export type ScenarioLatency = "responsive" | "balanced" | "quality";
export type RecommendationScenario = {
  version: 1;
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
  { version: 1, id: "short-chat", label: "Chat curto", objective: "Assistente geral", contextK: 8, responseTokens: 512, concurrency: 1, latency: "responsive", priority: "speed" },
  { version: 1, id: "long-document", label: "Documento longo", objective: "Documentos", contextK: 64, responseTokens: 2048, concurrency: 1, latency: "balanced", priority: "quality" },
  { version: 1, id: "programming", label: "Programação", objective: "Programação", contextK: 32, responseTokens: 1024, concurrency: 1, latency: "responsive", priority: "quality" },
  { version: 1, id: "vision", label: "Análise de imagem", objective: "Imagem", contextK: 16, responseTokens: 768, concurrency: 1, latency: "balanced", priority: "quality" },
  { version: 1, id: "transcription", label: "Transcrição", objective: "Transcrição", contextK: 16, responseTokens: 2048, concurrency: 1, latency: "balanced", priority: "speed" },
  { version: 1, id: "batch", label: "Processamento em lote", objective: "Produtividade", contextK: 8, responseTokens: 512, concurrency: 8, latency: "balanced", priority: "efficiency" },
];

const priorities: Priority[] = ["quality", "speed", "efficiency", "privacy", "ease", "cost"];
const latencies: ScenarioLatency[] = ["responsive", "balanced", "quality"];
const customIdPattern = /^custom-[a-z0-9-]{1,72}$/;

export function validateScenario(input: unknown): RecommendationScenario {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("O cenário é inválido.");
  const value = input as Partial<RecommendationScenario>;
  if (value.version !== 1) throw new Error("O cenário usa uma versão incompatível.");
  const presetId = scenarioPresets.some((preset) => preset.id === value.id);
  if (typeof value.id !== "string" || (!presetId && !customIdPattern.test(value.id))) throw new Error("O identificador do cenário é inválido.");
  if (typeof value.label !== "string" || value.label.trim().length < 1 || value.label.trim().length > 60) throw new Error("O nome do cenário deve ter entre 1 e 60 caracteres.");
  if (!objectives.includes(value.objective as Objective)) throw new Error("O objetivo do cenário é inválido.");
  if (typeof value.contextK !== "number" || !Number.isInteger(value.contextK) || value.contextK < 1 || value.contextK > 256) throw new Error("O contexto deve ficar entre 1K e 256K.");
  if (typeof value.responseTokens !== "number" || !Number.isInteger(value.responseTokens) || value.responseTokens < 64 || value.responseTokens > 32768) throw new Error("A resposta deve ter entre 64 e 32768 tokens.");
  if (typeof value.concurrency !== "number" || !Number.isInteger(value.concurrency) || value.concurrency < 1 || value.concurrency > 64) throw new Error("A concorrência deve ficar entre 1 e 64.");
  if (!latencies.includes(value.latency as ScenarioLatency)) throw new Error("A preferência de latência é inválida.");
  if (!priorities.includes(value.priority as Priority)) throw new Error("A prioridade do cenário é inválida.");
  return { ...value, label: value.label.trim() } as RecommendationScenario;
}

export function scenarioExplanations(scenario: RecommendationScenario) {
  const validated = validateScenario(scenario);
  const priorityLabels: Record<Priority, string> = { quality: "qualidade", speed: "velocidade", efficiency: "eficiência", privacy: "privacidade", ease: "facilidade", cost: "menor custo" };
  const latencyLabels: Record<ScenarioLatency, string> = { responsive: "resposta rápida", balanced: "equilibrada", quality: "foco em qualidade" };
  return [
    `${validated.contextK}K de contexto para ${validated.label.toLocaleLowerCase("pt-BR")}.`,
    `Resposta de até ${validated.responseTokens} tokens e ${validated.concurrency} ${validated.concurrency === 1 ? "execução simultânea" : "execuções simultâneas"}.`,
    `Prioridade em ${priorityLabels[validated.priority]}; latência ${latencyLabels[validated.latency]}.`,
  ];
}
