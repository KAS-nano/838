import type{HardwareProfile}from"../onboarding/types";
export type StrengthCategory="IA local"|"Programação"|"Imagem"|"Vídeo"|"Áudio"|"Multimodal";
export type StrengthScore={category:StrengthCategory;score:number;label:string};
const clamp=(n:number)=>Math.max(0,Math.min(10,+n.toFixed(1)));
export function hardwareStrength(p:HardwareProfile):StrengthScore[]{const v=Math.min(1,p.vramGb/24),r=Math.min(1,p.ramGb/64),d=Math.min(1,p.storageFreeGb/300);const cpu=cpuTier(p.cpu);const mk=(category:StrengthCategory,n:number):StrengthScore=>{const score=clamp(n*10);return{category,score,label:score>=8.5?"Excelente":score>=7?"Muito boa":score>=5?"Moderada":score>=3?"Limitada":"Básica"}};return[
 mk("IA local",v*.55+r*.22+cpu*.16+d*.07),mk("Programação",v*.38+r*.23+cpu*.31+d*.08),mk("Imagem",v*.62+r*.16+cpu*.15+d*.07),mk("Vídeo",v*.45+r*.17+cpu*.28+d*.10),mk("Áudio",v*.22+r*.21+cpu*.47+d*.10),mk("Multimodal",v*.58+r*.20+cpu*.15+d*.07)
]}
export function cpuTier(name:string){const s=name.toLowerCase();if(/ryzen 9|core i9|ultra 9|threadripper/.test(s))return 1;if(/ryzen 7|core i7|ultra 7|xeon/.test(s))return .82;if(/ryzen 5|core i5|ultra 5/.test(s))return .67;if(/ryzen 3|core i3/.test(s))return .5;return .58}
export function primaryBottleneck(p:HardwareProfile){const candidates=[{name:"VRAM",value:p.vramGb/16},{name:"RAM",value:p.ramGb/32},{name:"Armazenamento",value:p.storageFreeGb/150},{name:"CPU",value:cpuTier(p.cpu)/.75}];return candidates.sort((a,b)=>a.value-b.value)[0].name}
