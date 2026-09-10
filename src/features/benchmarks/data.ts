export type BenchmarkRecord={
 id:string;gpuFamily:string;vramGb:number;gpu?:string;cpu?:string;ramGb?:number;os?:"windows"|"linux"|"macos";modelId:string;quantization:string;contextK:number;generationTps:number;promptTps?:number;runtime:string;runtimeVersion?:string;backend:string;driverVersion?:string;measured:boolean;verified?:boolean;measuredAt?:string;source:string;
};
export const seedBenchmarks:BenchmarkRecord[]=[
 {id:"demo-rx16-qwen8",gpuFamily:"radeon-16",vramGb:16,modelId:"qwen3-8b",quantization:"Q4_K_M",contextK:8,generationTps:42,promptTps:116,runtime:"llama.cpp",backend:"Vulkan",measured:false,source:"demo-seed"},
 {id:"demo-rtx16-qwen8",gpuFamily:"nvidia-16",vramGb:16,modelId:"qwen3-8b",quantization:"Q4_K_M",contextK:8,generationTps:52,promptTps:145,runtime:"llama.cpp",backend:"CUDA",measured:false,source:"demo-seed"},
 {id:"demo-rx16-qwen14",gpuFamily:"radeon-16",vramGb:16,modelId:"qwen3-14b",quantization:"Q4_K_M",contextK:8,generationTps:25,promptTps:73,runtime:"llama.cpp",backend:"Vulkan",measured:false,source:"demo-seed"},
 {id:"demo-rtx24-qwen14",gpuFamily:"nvidia-24",vramGb:24,modelId:"qwen3-14b",quantization:"Q4_K_M",contextK:8,generationTps:39,promptTps:110,runtime:"llama.cpp",backend:"CUDA",measured:false,source:"demo-seed"},
 {id:"demo-apple24-gemma12",gpuFamily:"apple-24",vramGb:24,modelId:"gemma3-12b",quantization:"Q4_K_M",contextK:8,generationTps:30,promptTps:88,runtime:"llama.cpp",backend:"Metal",measured:false,source:"demo-seed"},
];
