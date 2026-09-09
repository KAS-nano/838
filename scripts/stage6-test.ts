import { calculateCompatibility, rankModels } from "../src/features/recommendation/engine";
import { seedModels } from "../src/data/seed-models";
import type { HardwareProfile } from "../src/features/onboarding/types";
const base:HardwareProfile={deviceType:"desktop",cpu:"Ryzen",gpu:"Radeon RX 9070 XT",vramGb:16,ramGb:32,storageTotalGb:1000,storageFreeGb:400,os:"linux",distro:"CachyOS",preference:"both",objectives:["Programação"],priority:"quality"};
const small=seedModels.find(m=>m.id==="qwen3-8b")!; const q4=small.variants.find(v=>v.quantization==="Q4_K_M")!;
const full=calculateCompatibility(base,small,q4,"Programação");
const low=calculateCompatibility({...base,vramGb:2,ramGb:4},small,q4,"Programação");
const ranked=rankModels(base,seedModels,"Programação");
const tests:[string,boolean][]=[
 ["full gpu fit",full.fit==="gpu"],["backend AMD Linux",full.backend==="ROCm/Vulkan"],["low memory not gpu",low.fit!=="gpu"],["ranking returns all",ranked.length===seedModels.length],["ranking descending",ranked.every((x,i)=>i===0||ranked[i-1].result.score>=x.result.score)],["score bounded",ranked.every(x=>x.result.score>=0&&x.result.score<=100)]
];let fail=false;for(const [n,p] of tests){console.log(`${p?"PASS":"FAIL"} ${n}`);if(!p)fail=true}if(fail) throw new Error("stage6 failed");
