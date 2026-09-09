import type { Objective } from "../onboarding/types";
export type Quantization = "Q8_0" | "Q6_K" | "Q5_K_M" | "Q4_K_M" | "Q3_K_M";
export type ModelModality = "text" | "vision" | "audio" | "video";
export type ModelVariant = { quantization: Quantization; diskGb: number; weightVramGb: number; qualityFactor: number };
export type AiModel = {
  id: string; name: string; family: string; paramsB: number; activeParamsB?: number; contextK: number;
  modalities: ModelModality[]; objectives: Objective[]; license: string; source: string; sourceUrl?: string; description: string;
  variants: ModelVariant[]; benchmarkClass: "small" | "medium" | "large" | "moe";
};
