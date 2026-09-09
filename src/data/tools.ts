export type ToolEntry={slug:string;name:string;category:"runtime"|"ide"|"video"|"image"|"audio"|"api";description:string;systems:string[];homepage:string;integration?:"ollama"|"lmstudio"|"openrouter"|"github"};
export const tools:ToolEntry[]=[
 {slug:"ollama",name:"Ollama",category:"runtime",description:"Runtime simples para baixar e executar modelos locais.",systems:["Windows","Linux","macOS"],homepage:"https://ollama.com",integration:"ollama"},
 {slug:"lm-studio",name:"LM Studio",category:"runtime",description:"Gerenciador local com interface gráfica e servidor compatível com APIs comuns.",systems:["Windows","Linux","macOS"],homepage:"https://lmstudio.ai",integration:"lmstudio"},
 {slug:"llama-cpp",name:"llama.cpp",category:"runtime",description:"Runtime de alto desempenho e base importante do ecossistema GGUF.",systems:["Windows","Linux","macOS"],homepage:"https://github.com/ggml-org/llama.cpp",integration:"github"},
 {slug:"vscode",name:"Visual Studio Code",category:"ide",description:"Editor extensível para programação e fluxos com IA.",systems:["Windows","Linux","macOS"],homepage:"https://code.visualstudio.com"},
 {slug:"zed",name:"Zed",category:"ide",description:"Editor moderno focado em desempenho e colaboração.",systems:["Linux","macOS","Windows"],homepage:"https://zed.dev"},
 {slug:"obs",name:"OBS Studio",category:"video",description:"Captura, gravação e streaming; útil em pipelines de criação.",systems:["Windows","Linux","macOS"],homepage:"https://obsproject.com"},
 {slug:"kdenlive",name:"Kdenlive",category:"video",description:"Editor de vídeo livre com bom suporte a Linux.",systems:["Windows","Linux","macOS"],homepage:"https://kdenlive.org"},
 {slug:"krita",name:"Krita",category:"image",description:"Pintura e edição de imagem, útil com pipelines generativos.",systems:["Windows","Linux","macOS"],homepage:"https://krita.org"},
 {slug:"audacity",name:"Audacity",category:"audio",description:"Editor de áudio multiplataforma.",systems:["Windows","Linux","macOS"],homepage:"https://www.audacityteam.org"},
 {slug:"openrouter",name:"OpenRouter",category:"api",description:"Catálogo unificado de modelos hospedados e preços dinâmicos.",systems:["Web"],homepage:"https://openrouter.ai",integration:"openrouter"},
];
