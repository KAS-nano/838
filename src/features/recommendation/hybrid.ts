import type { HardwareProfile, Objective } from "../onboarding/types";
import type { AiModel } from "../catalog/types";
import type { SeedApiModel } from "../../data/seed-api-models";
import type { RecommendationScenario } from "./scenario";
import { validateScenario } from "./scenario";
import { rankModels } from "./engine";

export type HybridRecommendation = { mode: "local" | "api"; name: string; score: number; reason: string; costNote: string; scenarioReasons: string[] };

const bounded = (score: number) => Math.min(100, Math.max(0, Math.round(score)));

export function recommendHybrid(profile: HardwareProfile, objective: Objective, models: AiModel[], apis: SeedApiModel[], scenario?: RecommendationScenario): HybridRecommendation[] {
  const active = scenario ? validateScenario(scenario) : undefined;
  const target = active?.objective ?? objective;
  const contextK = active?.contextK ?? 8;
  const priority = active?.priority ?? profile.priority;
  const local = rankModels(profile, models, target, "Q4_K_M", contextK).slice(0, 3).map((item) => {
    let score = item.result.score - (profile.preference === "api" ? 15 : 0) + (priority === "privacy" ? 10 : 0);
    const reasons: string[] = [];
    if (active) {
      if (item.model.contextK < active.contextK) { score -= 18; reasons.push(`O modelo limita o contexto a ${item.model.contextK}K.`); }
      else reasons.push(`Atende aos ${active.contextK}K solicitados.`);
      if (active.concurrency > 1) { score -= Math.min(16, active.concurrency * 2); reasons.push(`${active.concurrency} execuções simultâneas aumentam o uso local de recursos.`); }
      if (active.responseTokens > 2048) { score -= item.model.benchmarkClass === "small" ? 6 : 2; reasons.push("Respostas longas aumentam o tempo e a memória da execução local."); }
      if (active.latency === "responsive") { score += item.model.benchmarkClass === "small" ? 8 : item.model.benchmarkClass === "large" ? -8 : 0; reasons.push("A preferência por resposta rápida favorece modelos menores."); }
      if (priority === "quality" && item.model.benchmarkClass === "large") score += 5;
      if (priority === "efficiency" && item.model.benchmarkClass === "small") score += 6;
    }
    return { mode: "local" as const, name: item.model.name, score: bounded(score), reason: item.result.reasons[0], costNote: "Sem custo por token após instalação; energia e hardware continuam contando.", scenarioReasons: reasons };
  });
  const remote = apis.map((api) => {
    let score = 68 + (api.strengths.includes(target) ? 12 : 0);
    const reasons: string[] = [];
    if (profile.preference === "local") score -= 15;
    if (priority === "quality") score += 8;
    if (priority === "privacy") score -= 18;
    if (priority === "cost") score -= Math.min(15, api.outputUsdPerM);
    if (active) {
      if (api.contextK < active.contextK) { score -= 20; reasons.push(`O limite demonstrativo de ${api.contextK}K não atende ao contexto solicitado.`); }
      else reasons.push(`Atende aos ${active.contextK}K solicitados.`);
      if (active.concurrency > 1) { score += 8; reasons.push("A API evita concentrar as execuções simultâneas nesta máquina."); }
      if (active.responseTokens > 2048) { score += 3; reasons.push("Respostas longas não consomem a memória local, mas aumentam o custo por saída."); }
      if (active.latency === "responsive") { score += 6; reasons.push("API favorecida pela preferência por resposta rápida; latência de rede não foi medida."); }
    }
    return { mode: "api" as const, name: api.name, score: bounded(score), reason: `API com ${api.contextK}K de contexto no catálogo demonstrativo.`, costNote: `Demo: US$ ${api.inputUsdPerM}/M entrada · US$ ${api.outputUsdPerM}/M saída.`, scenarioReasons: reasons };
  });
  return [...local, ...remote].sort((a, b) => b.score - a.score);
}
