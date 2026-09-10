import { objectives, type HardwareProfile } from "./types";

export type ValidationErrors = Partial<Record<keyof HardwareProfile | "form", string>>;

export function validateHardware(profile: HardwareProfile): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!["desktop", "notebook"].includes(profile.deviceType)) errors.deviceType = "Selecione Desktop ou Notebook.";
  if (!["windows", "linux", "macos"].includes(profile.os)) errors.os = "Selecione um sistema operacional válido.";
  if (profile.cpuArchitecture !== undefined && !["x86_64", "arm64", "other"].includes(profile.cpuArchitecture)) errors.cpuArchitecture = "Selecione uma arquitetura de CPU válida.";
  if (profile.memoryArchitecture !== undefined && !["dedicated", "unified", "shared"].includes(profile.memoryArchitecture)) errors.memoryArchitecture = "Selecione uma arquitetura de memória válida.";
  if (profile.cpu.trim().length < 2) errors.cpu = "Informe o modelo do processador.";
  if (profile.gpu.trim().length < 2) errors.gpu = "Informe a GPU ou use 'Integrada/sem GPU dedicada'.";
  if (!Number.isFinite(profile.vramGb) || profile.vramGb < 0 || profile.vramGb > 192) errors.vramGb = "VRAM deve estar entre 0 e 192 GB.";
  if (!Number.isFinite(profile.ramGb) || profile.ramGb < 2 || profile.ramGb > 1024) errors.ramGb = "RAM deve estar entre 2 e 1024 GB.";
  if (!Number.isFinite(profile.storageTotalGb) || profile.storageTotalGb < 16 || profile.storageTotalGb > 100000) errors.storageTotalGb = "Armazenamento total inválido.";
  if (!Number.isFinite(profile.storageFreeGb) || profile.storageFreeGb < 0) errors.storageFreeGb = "Espaço livre inválido.";
  if (profile.storageFreeGb > profile.storageTotalGb) errors.storageFreeGb = "O espaço livre não pode ser maior que o armazenamento total.";
  if (profile.os === "linux" && profile.distro.trim().length < 2) errors.distro = "Informe sua distribuição Linux.";
  return errors;
}

export function validateGoals(profile: HardwareProfile): ValidationErrors {
  const errors: ValidationErrors = {};
  if (profile.objectives.length === 0 || profile.objectives.some((objective) => !objectives.includes(objective))) errors.objectives = "Selecione pelo menos um objetivo válido.";
  if (!["quality", "speed", "efficiency", "privacy", "ease", "cost"].includes(profile.priority)) errors.priority = "Selecione uma prioridade válida.";
  if (!["local", "api", "both"].includes(profile.preference)) errors.preference = "Selecione IA local, API ou Ambos.";
  return errors;
}

export function hasErrors(errors: ValidationErrors) {
  return Object.keys(errors).length > 0;
}

export function isHardwareProfile(input: unknown): input is HardwareProfile {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const value = input as Record<string, unknown>;
  if (["cpu", "gpu", "distro", "deviceType", "os", "preference", "priority"].some((key) => typeof value[key] !== "string")) return false;
  if (["vramGb", "ramGb", "storageTotalGb", "storageFreeGb"].some((key) => typeof value[key] !== "number" || !Number.isFinite(value[key]))) return false;
  if (!Array.isArray(value.objectives) || value.objectives.some((objective) => typeof objective !== "string")) return false;
  const profile = input as HardwareProfile;
  return !hasErrors(validateHardware(profile)) && !hasErrors(validateGoals(profile));
}
