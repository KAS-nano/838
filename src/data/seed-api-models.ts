export type ApiBenchmark={outputTokensPerSecond?:number;timeToFirstTokenMs?:number;latencyMs?:number;source:string;date:string;region?:string;confidence:"high"|"medium"|"low"};
export type SeedApiModel={id:string;name:string;provider:string;inputUsdPerM:number;outputUsdPerM:number;contextK:number;strengths:string[];source:"demo-seed";availabilityType:"api"|"both";benchmark?:ApiBenchmark};
export const seedApiModels:SeedApiModel[]=[
 {id:"api-fast",name:"API econômica (exemplo)",provider:"Catálogo demonstrativo",inputUsdPerM:.2,outputUsdPerM:.8,contextK:128,strengths:["Programação","Escrita","Produtividade"],source:"demo-seed",availabilityType:"api"},
 {id:"api-quality",name:"API qualidade (exemplo)",provider:"Catálogo demonstrativo",inputUsdPerM:2,outputUsdPerM:8,contextK:256,strengths:["Programação","Documentos","Criação de ideias"],source:"demo-seed",availabilityType:"api"},
 {id:"openrouter-qwen",name:"Qwen3 14B",provider:"OpenRouter",inputUsdPerM:.3,outputUsdPerM:.9,contextK:128,strengths:["Programação","Documentos","Assistente geral"],source:"demo-seed",availabilityType:"both"},
 {id:"groq-llama",name:"Llama 3.3 70B",provider:"Groq",inputUsdPerM:.6,outputUsdPerM:.9,contextK:128,strengths:["Programação","Escrita","Assistente geral"],source:"demo-seed",availabilityType:"api"},
 {id:"together-qwen",name:"Qwen2.5 72B",provider:"Together AI",inputUsdPerM:.8,outputUsdPerM:1.2,contextK:128,strengths:["Programação","Documentos","Criação de ideias"],source:"demo-seed",availabilityType:"api"},
 {id:"fireworks-llama",name:"Llama 3.3 70B",provider:"Fireworks AI",inputUsdPerM:.9,outputUsdPerM:.9,contextK:128,strengths:["Programação","Escrita","Assistente geral"],source:"demo-seed",availabilityType:"api"},
 {id:"cerebras-llama",name:"Llama 3.3 70B",provider:"Cerebras",inputUsdPerM:.6,outputUsdPerM:.8,contextK:128,strengths:["Programação","Escrita","Assistente geral"],source:"demo-seed",availabilityType:"api"},
 {id:"deepinfra-qwen",name:"Qwen2.5 72B",provider:"DeepInfra",inputUsdPerM:.2,outputUsdPerM:.3,contextK:128,strengths:["Programação","Documentos"],source:"demo-seed",availabilityType:"api"},
 {id:"mistral-api",name:"Mistral Large",provider:"Mistral API",inputUsdPerM:2,outputUsdPerM:6,contextK:128,strengths:["Escrita","Documentos","Criação de ideias"],source:"demo-seed",availabilityType:"api"},
 {id:"gemini-api",name:"Gemini 2.5 Pro",provider:"Google Gemini",inputUsdPerM:1.25,outputUsdPerM:10,contextK:256,strengths:["Documentos","Criação de ideias","Assistente geral"],source:"demo-seed",availabilityType:"api"},
 {id:"openai-api",name:"GPT-4.1",provider:"OpenAI API",inputUsdPerM:2,outputUsdPerM:8,contextK:128,strengths:["Programação","Documentos","Assistente geral"],source:"demo-seed",availabilityType:"api"},
 {id:"anthropic-api",name:"Claude Sonnet",provider:"Anthropic",inputUsdPerM:3,outputUsdPerM:15,contextK:200,strengths:["Programação","Escrita","Documentos"],source:"demo-seed",availabilityType:"api"},
];
