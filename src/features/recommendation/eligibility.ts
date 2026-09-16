import type { ModelModality } from "../catalog/types";
import type { Objective } from "../onboarding/types";

export function supportsObjective(modalities: readonly ModelModality[], objective: Objective) {
  if (objective === "Imagem") return modalities.includes("vision");
  if (["Áudio", "Áudio e voz", "Transcrição"].includes(objective)) return modalities.includes("audio");
  if (["Vídeo", "Edição de vídeo", "Cortes automáticos", "Geração de vídeo"].includes(objective)) return modalities.includes("video");
  return modalities.includes("text");
}
