import type { AiModel, ModelVariant } from "../catalog/types";
import type { HardwareProfile } from "../onboarding/types";
export type MemoryEstimate={vramGb:number;ramGb:number;diskGb:number;gpuLayersPercent:number;kvCacheGb:number;overheadGb:number;totalGpuTargetGb:number;confidence:"medium"|"low";notes:string[]};
export function estimateMemory(profile:HardwareProfile,model:AiModel,variant:ModelVariant,contextK:number):MemoryEstimate{
 const context=Math.max(1,Math.min(Number.isFinite(contextK)?contextK:8,model.contextK));
 const architectureFactor=model.activeParamsB && model.activeParamsB < model.paramsB * 0.8 ? 0.55 : 1;
 const kvCacheGb=+(Math.max(.15,(model.paramsB*(context/8)*0.014)*architectureFactor).toFixed(2));
 const overheadGb=+(Math.max(.45,variant.weightVramGb*.045).toFixed(2));
 const totalGpuTarget=variant.weightVramGb+kvCacheGb+overheadGb;
 const reserve=Math.min(1.5,Math.max(.5,profile.vramGb*.06));
 const usable=Math.max(0,profile.vramGb-reserve);
 const gpuLayersPercent=Math.max(0,Math.min(100,Math.floor((usable/Math.max(.1,totalGpuTarget))*100)));
 const vramGb=+(Math.min(totalGpuTarget,usable>0?Math.max(.3,usable):0).toFixed(2));
 const offloadedWeights=variant.weightVramGb*(1-gpuLayersPercent/100);
 const ramGb=+(Math.max(3.5,3.5+offloadedWeights*1.08+kvCacheGb*(1-gpuLayersPercent/100)+(gpuLayersPercent<100?1.2:.35)).toFixed(2));
 const diskGb=+(variant.diskGb*1.08+.6).toFixed(2);
 const notes=[] as string[]; if(context!==contextK)notes.push("Contexto limitado ao máximo do modelo.");if(gpuLayersPercent<100)notes.push("Offload estimado para RAM/CPU.");
 notes.push("Memória e armazenamento calculados por heurística; pesos do catálogo seed não são medições.");
 return {vramGb,ramGb,diskGb,gpuLayersPercent,kvCacheGb,overheadGb,totalGpuTargetGb:+totalGpuTarget.toFixed(2),confidence:"low",notes};
}
