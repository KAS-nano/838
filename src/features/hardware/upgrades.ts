import type { HardwareProfile } from "../onboarding/types";
import { hardwareStrength } from "./strength";

export type UpgradeSuggestion = {
  kind: "RAM" | "VRAM/GPU" | "Armazenamento" | "CPU";
  priority: number;
  title: string;
  target: string;
  benefit: string;
};

export function suggestUpgrades(profile: HardwareProfile): UpgradeSuggestion[] {
  const out: UpgradeSuggestion[] = [];
  if (profile.ramGb < 32) out.push({ kind: "RAM", priority: 90, title: "Aumentar memória RAM", target: "32 GB ou mais", benefit: "Mais margem para offload, contexto e multitarefa." });
  else if (profile.ramGb < 64 && profile.vramGb >= 16) out.push({ kind: "RAM", priority: 58, title: "RAM adicional opcional", target: "64 GB", benefit: "Ajuda em modelos maiores com offload e fluxos multimodais pesados." });
  if (profile.vramGb < 8) out.push({ kind: "VRAM/GPU", priority: 95, title: "GPU com mais VRAM", target: "12–16 GB de VRAM", benefit: "Permite carregar quantizações maiores integralmente na GPU." });
  else if (profile.vramGb < 16) out.push({ kind: "VRAM/GPU", priority: 72, title: "Mais VRAM para IA local", target: "16 GB ou mais", benefit: "Amplia o conjunto de modelos que cabem sem offload." });
  if (profile.storageFreeGb < 80) out.push({ kind: "Armazenamento", priority: 82, title: "Liberar ou adicionar armazenamento", target: "150 GB+ livres", benefit: "Modelos, caches e runtimes podem ocupar dezenas de GB." });
  if (/core i3|ryzen 3|pentium|celeron/i.test(profile.cpu)) out.push({ kind: "CPU", priority: 55, title: "CPU mais forte", target: "6+ núcleos modernos", benefit: "Melhora offload, pré/pós-processamento e tarefas de vídeo/áudio." });
  return out.sort((a, b) => b.priority - a.priority);
}

export function simulateUpgrade(profile: HardwareProfile, patch: Partial<HardwareProfile>) {
  const next = { ...profile, ...patch };
  const before = hardwareStrength(profile);
  const after = hardwareStrength(next);
  const delta = after.map((item, i) => ({ category: item.category, before: before[i].score, after: item.score, gain: +(item.score - before[i].score).toFixed(1) }));
  return { profile: next, delta };
}
