import type { HardwareProfile, Objective } from "../onboarding/types";

export type SystemRecommendation={id:string;name:string;score:number;difficulty:"fácil"|"intermediária"|"avançada";reasons:string[];caveats:string[]};

type BaseSystem={id:string;name:string;ease:number;localAi:number;creative:number;dev:number;difficulty:SystemRecommendation["difficulty"]};
const base:BaseSystem[]=[
 {id:"windows11",name:"Windows 11",ease:9,localAi:8,creative:9,dev:8,difficulty:"fácil"},
 {id:"ubuntu",name:"Ubuntu LTS",ease:8,localAi:9,creative:7,dev:9,difficulty:"intermediária"},
 {id:"cachyos",name:"CachyOS / Arch",ease:6,localAi:9,creative:7,dev:9,difficulty:"avançada"},
 {id:"fedora",name:"Fedora Workstation",ease:7,localAi:9,creative:7,dev:9,difficulty:"intermediária"},
 {id:"macos",name:"macOS",ease:9,localAi:9,creative:9,dev:9,difficulty:"fácil"},
];
function objectiveWeight(objective:Objective){if(["Programação","Documentos","Produtividade"].includes(objective))return"dev" as const;if(["Imagem","Edição de vídeo","Geração de vídeo","Áudio e voz"].includes(objective))return"creative" as const;return"localAi" as const}
export function recommendSystems(profile:HardwareProfile,objective:Objective):SystemRecommendation[]{const apple=/apple|m1|m2|m3|m4|m5|m6/i.test(profile.cpu+" "+profile.gpu)||profile.os==="macos";const amd=/amd|radeon|rx /i.test(profile.gpu);const nvidia=/nvidia|rtx|gtx/i.test(profile.gpu);const key=objectiveWeight(objective);return base.filter(x=>x.id!=="macos"||apple).map(x=>{let score=x.ease*2+x.localAi*3+x[key]*3;const reasons:string[]=[];const caveats:string[]=[];if(x.id==="macos"&&apple){score+=12;reasons.push("Integração de hardware e Metal no ecossistema Apple.")}if(amd&&["ubuntu","cachyos","fedora"].includes(x.id)){score+=7;reasons.push("Linux costuma oferecer um caminho forte para backends AMD locais.")}if(nvidia&&["windows11","ubuntu","cachyos","fedora"].includes(x.id)){score+=6;reasons.push("Ecossistema CUDA amplamente usado por ferramentas de IA.")}if(profile.os==="linux"&&["ubuntu","cachyos","fedora"].includes(x.id)){score+=3;reasons.push("Mantém um ambiente Linux semelhante ao perfil atual.")}if(profile.os==="windows"&&x.id==="windows11"){score+=3;reasons.push("Menor mudança de ambiente para o usuário.")}if(x.id==="cachyos")caveats.push("Atualizações frequentes exigem mais atenção que uma distribuição LTS.");if(x.id==="windows11"&&amd)caveats.push("Algumas ferramentas de IA AMD podem ter suporte diferente do Linux; validar runtime específico.");reasons.push(`Boa adequação para ${objective}.`);return{id:x.id,name:x.name,score:Math.min(100,Math.round(score)),difficulty:x.difficulty,reasons,caveats}}).sort((a,b)=>b.score-a.score)}
