import { initialHardwareProfile, type HardwareProfile } from "../onboarding/types";
import { isHardwareProfile } from "../onboarding/validation";

export { isHardwareProfile };
export const PROFILE_KEY = "838.hardwareProfile";
export const PROFILE_CHANGED_EVENT = "838:profile-changed";

// The UI identifies this fallback as a demo whenever no valid profile is saved.
export const demoHardwareProfile: HardwareProfile = {
  ...initialHardwareProfile,
  cpu: "Ryzen 7 / equivalente",
  gpu: "Radeon RX 16 GB",
  vramGb: 16,
  ramGb: 32,
  storageTotalGb: 1000,
  storageFreeGb: 256,
  os: "linux",
  distro: "CachyOS",
  objectives: ["Programação"],
};

export function parseHardwareProfile(raw: string | null): HardwareProfile | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isHardwareProfile(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readHardwareProfile(): HardwareProfile | null {
  if (typeof window === "undefined") return null;
  try {
    return parseHardwareProfile(window.localStorage.getItem(PROFILE_KEY));
  } catch {
    return null;
  }
}

export function saveHardwareProfile(profile: HardwareProfile): void {
  if (!isHardwareProfile(profile)) throw new Error("Perfil de hardware inválido.");
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT));
}

export type ExportBundle = { version: 1; exportedAt: string; hardware: HardwareProfile | null };

export function exportProfile(raw: string | null): ExportBundle {
  return { version: 1, exportedAt: new Date().toISOString(), hardware: parseHardwareProfile(raw) };
}

export function validateImport(input: unknown): input is ExportBundle {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const value = input as Record<string, unknown>;
  return value.version === 1 && typeof value.exportedAt === "string" && Number.isFinite(Date.parse(value.exportedAt)) && (value.hardware === null || isHardwareProfile(value.hardware));
}
