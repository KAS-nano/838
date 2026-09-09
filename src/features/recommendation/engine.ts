import type { AiModel, ModelVariant } from "../catalog/types";
import type { HardwareProfile, Objective } from "../onboarding/types";
import { estimateMemory } from "../estimation/memory";

export type FitState = "gpu" | "offload" | "incompatible";
export type CompatibilityResult = {
  score:number; fit:FitState; vramEstimatedGb:number; ramEstimatedGb:number; diskGb:number;
  backend:string; flags:string[]; reasons:string[]; confidence:"high"|"medium"|"low";
};

export function inferBackend(profile: HardwareProfile){
  const gpu=profile.gpu.toLowerCase();
  if(profile.os==="macos") return "Metal";
  if(/nvidia|rtx|gtx|quadro/.test(gpu)) return "CUDA";
  if(/amd|radeon|rx /.test(gpu)) return profile.os==="linux" ? "ROCm/Vulkan" : "Vulkan/DirectML";
  if(/intel|arc/.test(gpu)) return "Vulkan/oneAPI";
  return "CPU/Vulkan";
}

export function calculateCompatibility(profile:HardwareProfile, model:AiModel, variant:ModelVariant, objective?:Objective, contextK=8):CompatibilityResult{
  const memory=estimateMemory(profile,model,variant,contextK);
  const vramEstimatedGb=memory.vramGb;
  const ramEstimatedGb=memory.ramGb;
  const flags:string[]=[]; const reasons:string[]=[];
  let fit:FitState="gpu";
  if(memory.gpuLayersPercent<100){fit=ramEstimatedGb<=profile.ramGb*.82?"offload":"incompatible";flags.push("VRAM insuficiente para carga total, incluindo KV cache e reserva do sistema");}
  if(memory.diskGb>profile.storageFreeGb){fit="incompatible";flags.push("Espaço em disco insuficiente para modelo, runtime e cache");}
  if(ramEstimatedGb>profile.ramGb*.9){fit="incompatible";flags.push("RAM insuficiente");}
  const memoryScore=fit==="gpu"?30:fit==="offload"?18:2;
  const backendScore=profile.vramGb>0?20:8;
  const relevance=!objective||model.objectives.includes(objective)?15:5;
  const performance=model.benchmarkClass==="small"?20:model.benchmarkClass==="medium"?17:model.benchmarkClass==="moe"?16:13;
  const diskScore=memory.diskGb<=profile.storageFreeGb?10:0;
  const easeScore=5;
  let score=Math.round(memoryScore+backendScore+performance+relevance+diskScore+easeScore);
  if(fit==="incompatible") score=Math.min(score,49);
  reasons.push(fit==="gpu"?"Modelo cabe integralmente na GPU.":fit==="offload"?"Modelo pode funcionar com offload para RAM/CPU.":"A configuração atual não atende aos requisitos estimados.");
  if(objective&&model.objectives.includes(objective)) reasons.push(`Adequado para ${objective}.`);
  if(objective&&!model.objectives.includes(objective)) reasons.push(`Modelo não priorizado para ${objective}.`);
  reasons.push(...flags);
  reasons.push(`Backend provável: ${inferBackend(profile)}; suporte e drivers ainda precisam ser verificados.`);
  reasons.push(`Heurística para ${Math.min(Math.max(1,contextK),model.contextK)}K de contexto; não é um teste de execução.`);
  return {score,fit,vramEstimatedGb,ramEstimatedGb,diskGb:memory.diskGb,backend:inferBackend(profile),flags,reasons,confidence:"low"};
}

export function rankModels(profile:HardwareProfile, models:AiModel[], objective:Objective, quantization="Q4_K_M", contextK=8){
 return models.map(model=>{const variant=model.variants.find(v=>v.quantization===quantization)??model.variants[0];return {model,variant,result:calculateCompatibility(profile,model,variant,objective,contextK)}}).sort((a,b)=>b.result.score-a.result.score);
}
