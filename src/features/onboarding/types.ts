export type DeviceType = "desktop" | "notebook";
export type OsType = "windows" | "linux" | "macos";
export type AiPreference = "local" | "api" | "both";
export type Priority = "quality" | "speed" | "efficiency" | "privacy" | "ease" | "cost";
export type CpuArchitecture = "x86_64" | "arm64" | "other";
export type MemoryArchitecture = "dedicated" | "unified" | "shared";

export const objectives = [
  "Programação",
  "Criação de ideias",
  "Escrita",
  "Documentos",
  "Imagem",
  "Vídeo",
  "Áudio",
  "Edição de vídeo",
  "Cortes automáticos",
  "Geração de vídeo",
  "Áudio e voz",
  "Transcrição",
  "Produtividade",
  "Assistente geral",
] as const;

export type Objective = (typeof objectives)[number];

export type HardwareProfile = {
  deviceType: DeviceType;
  cpu: string;
  cpuArchitecture?: CpuArchitecture;
  gpu: string;
  memoryArchitecture?: MemoryArchitecture;
  vramGb: number;
  ramGb: number;
  storageTotalGb: number;
  storageFreeGb: number;
  os: OsType;
  distro: string;
  preference: AiPreference;
  objectives: Objective[];
  priority: Priority;
};

export const initialHardwareProfile: HardwareProfile = {
  deviceType: "desktop",
  cpu: "",
  cpuArchitecture: "x86_64",
  gpu: "",
  memoryArchitecture: "dedicated",
  vramGb: 0,
  ramGb: 16,
  storageTotalGb: 512,
  storageFreeGb: 128,
  os: "windows",
  distro: "",
  preference: "both",
  objectives: [],
  priority: "quality",
};
