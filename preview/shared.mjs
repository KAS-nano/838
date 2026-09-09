import { initialHardwareProfile, demoHardwareProfile, isHardwareProfile } from './engine.mjs';

export const PROFILE_KEY = '838.hardwareProfile';
export const initialProfile = initialHardwareProfile;
export const demoProfile = demoHardwareProfile;
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const priorityNames = { quality: 'Qualidade', speed: 'Velocidade', efficiency: 'Baixo consumo', privacy: 'Privacidade', ease: 'Facilidade', cost: 'Menor custo' };
export const preferenceNames = { local: 'IA Local', api: 'API', both: 'Ambos' };

export function readProfile() {
  try {
    const current = localStorage.getItem(PROFILE_KEY);
    const raw = current || localStorage.getItem('838.preview.profile');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const candidate = current ? parsed : { ...initialProfile, ...parsed, objectives: parsed.objectives || (parsed.objective ? [parsed.objective] : []) };
    if (!current && !parsed.storageTotalGb) candidate.storageTotalGb = Math.max(512, candidate.storageFreeGb);
    if (!isHardwareProfile(candidate)) return null;
    if (!localStorage.getItem(PROFILE_KEY)) localStorage.setItem(PROFILE_KEY, JSON.stringify(candidate));
    return candidate;
  } catch { return null; }
}

export function profileSummary(profile) {
  return [
    ['Máquina', profile.deviceType === 'notebook' ? 'Notebook' : 'Desktop'],
    ['CPU', profile.cpu], ['GPU', profile.gpu],
    ['Memória', `${profile.vramGb} GB VRAM · ${profile.ramGb} GB RAM`],
    ['Armazenamento', `${profile.storageFreeGb} GB livres / ${profile.storageTotalGb} GB totais`],
    ['Sistema', `${profile.os}${profile.os === 'linux' ? ` · ${profile.distro}` : ''}`],
    ['Objetivos', profile.objectives.join(' · ')],
    ['Preferência', preferenceNames[profile.preference]], ['Prioridade', priorityNames[profile.priority]],
  ].map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
}

const rainNames = ['Qwen3', 'Qwen3 1.7B', 'Qwen3 4B', 'Qwen3 8B', 'Qwen3 14B', 'Qwen3 32B', 'Qwen3 Coder', 'Gemma 3', 'Gemma 3 4B', 'Gemma 3 12B', 'Gemma 3 27B', 'Mistral', 'Mistral Small', 'Ministral', 'Phi-4', 'DeepSeek R1', 'Llama 3', 'Granite', 'Command-R', 'Nemotron', 'Ollama', 'LM Studio', 'llama.cpp', 'OpenRouter'];
const rain = document.querySelector('.llm-rain');
if (rain) {
  let seed = 838;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let i = 0; i < 72; i++) {
    const name = document.createElement('span');
    name.textContent = rainNames[i % rainNames.length];
    name.style.setProperty('--rain-x', `${random() * 96}%`);
    name.style.setProperty('--rain-y', `${-15 + random() * 105}%`);
    name.style.setProperty('--rain-delay', `${-random() * 38}s`);
    name.style.setProperty('--rain-duration', `${30 + random() * 38}s`);
    name.style.setProperty('--rain-opacity', `${0.08 + random() * 0.09}`);
    name.style.setProperty('--rain-size', `${10 + random() * 5}px`);
    rain.append(name);
  }
}
