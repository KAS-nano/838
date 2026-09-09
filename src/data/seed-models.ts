import type { AiModel, ModelVariant } from "../features/catalog/types";
const v=(base:number):ModelVariant[]=>[
 {quantization:"Q8_0",diskGb:+(base*1.78).toFixed(1),weightVramGb:+(base*1.88).toFixed(1),qualityFactor:1},
 {quantization:"Q6_K",diskGb:+(base*1.38).toFixed(1),weightVramGb:+(base*1.47).toFixed(1),qualityFactor:.985},
 {quantization:"Q5_K_M",diskGb:+(base*1.16).toFixed(1),weightVramGb:+(base*1.25).toFixed(1),qualityFactor:.97},
 {quantization:"Q4_K_M",diskGb:+base.toFixed(1),weightVramGb:+(base*1.08).toFixed(1),qualityFactor:.945},
 {quantization:"Q3_K_M",diskGb:+(base*.82).toFixed(1),weightVramGb:+(base*.9).toFixed(1),qualityFactor:.9},
];
export const seedModels:AiModel[]=[
 {id:"qwen3-8b",name:"Qwen3 8B",family:"Qwen3",paramsB:8,contextK:40,modalities:["text"],objectives:["Programação","Criação de ideias","Escrita","Documentos","Produtividade","Assistente geral"],license:"Ver model card",source:"seed",sourceUrl:"https://huggingface.co/Qwen/Qwen3-8B",description:"Modelo geral compacto com bom equilíbrio entre qualidade e consumo.",variants:v(5.2),benchmarkClass:"small"},
 {id:"qwen3-14b",name:"Qwen3 14B",family:"Qwen3",paramsB:14,contextK:40,modalities:["text"],objectives:["Programação","Criação de ideias","Escrita","Documentos","Produtividade","Assistente geral"],license:"Ver model card",source:"seed",sourceUrl:"https://huggingface.co/Qwen/Qwen3-14B",description:"Opção intermediária para raciocínio, escrita e programação.",variants:v(9.3),benchmarkClass:"medium"},
 {id:"qwen3-coder-30b",name:"Qwen3 Coder 30B A3B",family:"Qwen3 Coder",paramsB:30,activeParamsB:3,contextK:256,modalities:["text"],objectives:["Programação","Documentos","Assistente geral"],license:"Ver model card",source:"seed",description:"MoE voltado a programação e fluxos com ferramentas.",variants:v(18.6),benchmarkClass:"moe"},
 {id:"gemma3-4b",name:"Gemma 3 4B",family:"Gemma 3",paramsB:4,contextK:128,modalities:["text","vision"],objectives:["Imagem","Documentos","Criação de ideias","Assistente geral"],license:"Gemma",source:"seed",description:"Multimodal leve para texto e imagem.",variants:v(3.3),benchmarkClass:"small"},
 {id:"gemma3-12b",name:"Gemma 3 12B",family:"Gemma 3",paramsB:12,contextK:128,modalities:["text","vision"],objectives:["Imagem","Documentos","Criação de ideias","Escrita","Assistente geral"],license:"Gemma",source:"seed",description:"Multimodal intermediário com contexto amplo.",variants:v(8.1),benchmarkClass:"medium"},
 {id:"gemma3-27b",name:"Gemma 3 27B",family:"Gemma 3",paramsB:27,contextK:128,modalities:["text","vision"],objectives:["Imagem","Documentos","Criação de ideias","Escrita","Assistente geral"],license:"Gemma",source:"seed",description:"Versão maior para qualidade multimodal.",variants:v(17),benchmarkClass:"large"},
 {id:"mistral-small-24b",name:"Mistral Small 24B",family:"Mistral",paramsB:24,contextK:32,modalities:["text"],objectives:["Programação","Escrita","Documentos","Criação de ideias","Assistente geral"],license:"Ver model card",source:"seed",description:"Modelo denso de porte médio para uso geral.",variants:v(15),benchmarkClass:"large"},
 {id:"phi4-14b",name:"Phi-4 14B",family:"Phi",paramsB:14,contextK:16,modalities:["text"],objectives:["Programação","Documentos","Criação de ideias","Assistente geral"],license:"MIT/model card",source:"seed",description:"Modelo compacto orientado a raciocínio e tarefas técnicas.",variants:v(9.1),benchmarkClass:"medium"},
 {id:"deepseek-r1-distill-14b",name:"DeepSeek R1 Distill 14B",family:"DeepSeek R1",paramsB:14,contextK:32,modalities:["text"],objectives:["Programação","Criação de ideias","Documentos","Assistente geral"],license:"Ver model card",source:"seed",description:"Destilado para raciocínio com menor exigência de hardware.",variants:v(9.4),benchmarkClass:"medium"},
 {id:"llama-3.3-8b",name:"Llama 3.1 8B Instruct",family:"Llama",paramsB:8,contextK:128,modalities:["text"],objectives:["Escrita","Criação de ideias","Documentos","Produtividade","Assistente geral"],license:"Llama Community",source:"seed",description:"Versão Instruct 3.1 da Meta para assistência local. Requisitos estimados.",variants:v(5),benchmarkClass:"small"},
 {id:"qwen3-4b",name:"Qwen3 4B",family:"Qwen3",paramsB:4,contextK:256,modalities:["text"],objectives:["Programação","Criação de ideias","Escrita","Assistente geral"],license:"Ver model card",source:"seed",description:"Modelo leve para máquinas com pouca VRAM.",variants:v(2.5),benchmarkClass:"small"},
 {id:"qwen3-32b",name:"Qwen3 32B",family:"Qwen3",paramsB:32,contextK:40,modalities:["text"],objectives:["Programação","Criação de ideias","Escrita","Documentos","Assistente geral"],license:"Ver model card",source:"seed",description:"Modelo denso maior para máquinas de alta capacidade.",variants:v(20),benchmarkClass:"large"},
 {id:"qwen3-1.7b",name:"Qwen3 1.7B",family:"Qwen3",paramsB:1.7,contextK:32,modalities:["text"],objectives:["Programação","Criação de ideias","Escrita","Produtividade","Assistente geral"],license:"Ver model card",source:"seed",description:"Opção pequena para explorar IA local com pouca memória. Requisitos estimados.",variants:v(1.2),benchmarkClass:"small"},
 {id:"ministral-8b",name:"Ministral 8B",family:"Mistral",paramsB:8,contextK:128,modalities:["text"],objectives:["Programação","Escrita","Documentos","Produtividade","Assistente geral"],license:"Ver model card",source:"seed",description:"Modelo compacto para assistência local. Metadados e memória seed, sujeitos a validação.",variants:v(5.1),benchmarkClass:"small"},
 {id:"granite-8b-code",name:"Granite 8B Code",family:"Granite",paramsB:8,contextK:8,modalities:["text"],objectives:["Programação","Documentos","Assistente geral"],license:"Ver model card",source:"seed",description:"Opção IBM voltada a código. Configurações e requisitos demonstrativos.",variants:v(5.1),benchmarkClass:"small"},
 {id:"command-r-35b",name:"Command R 35B",family:"Command R",paramsB:35,contextK:128,modalities:["text"],objectives:["Documentos","Escrita","Produtividade","Assistente geral"],license:"Ver model card",source:"seed",description:"Modelo Cohere de maior porte para documentos e assistência. Requisitos estimados.",variants:v(21.5),benchmarkClass:"large"},
 {id:"nemotron-15b",name:"Apriel-Nemotron 15B Thinker",family:"Nemotron",paramsB:15,contextK:128,modalities:["text"],objectives:["Programação","Criação de ideias","Documentos","Assistente geral"],license:"Ver model card",source:"seed",description:"Modelo de raciocínio publicado pela ServiceNow AI, com contribuição de pesquisa reconhecida à NVIDIA. Requisitos estimados.",variants:v(9.8),benchmarkClass:"medium"},
];
const sourceUrls:Record<string,string>={
 "qwen3-coder-30b":"https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct",
 "gemma3-4b":"https://huggingface.co/google/gemma-3-4b-it",
 "gemma3-12b":"https://huggingface.co/google/gemma-3-12b-it",
 "gemma3-27b":"https://huggingface.co/google/gemma-3-27b-it",
 "mistral-small-24b":"https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501",
 "phi4-14b":"https://huggingface.co/microsoft/phi-4",
 "deepseek-r1-distill-14b":"https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
 "llama-3.3-8b":"https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct",
 "qwen3-4b":"https://huggingface.co/Qwen/Qwen3-4B",
 "qwen3-32b":"https://huggingface.co/Qwen/Qwen3-32B",
 "qwen3-1.7b":"https://huggingface.co/Qwen/Qwen3-1.7B",
 "ministral-8b":"https://huggingface.co/mistralai/Ministral-8B-Instruct-2410",
 "granite-8b-code":"https://huggingface.co/ibm-granite/granite-8b-code-instruct-4k",
 "command-r-35b":"https://huggingface.co/CohereLabs/c4ai-command-r-v01",
 "nemotron-15b":"https://huggingface.co/ServiceNow-AI/Apriel-Nemotron-15b-Thinker",
};
for (const model of seedModels) model.sourceUrl ??= sourceUrls[model.id];
export const getModel=(id:string)=>seedModels.find(m=>m.id===id);
