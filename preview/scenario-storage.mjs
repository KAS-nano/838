export const SAVED_SCENARIOS_KEY = '838.saved-scenarios.v1';
export const SAVED_SCENARIOS_LIMIT = 10;
const MAX_BYTES = 100_000;

function storage() {
  if (typeof window === 'undefined' || !window.localStorage) throw new Error('O armazenamento local não está disponível.');
  return window.localStorage;
}

function normalizedName(name) {
  if (typeof name !== 'string') throw new Error('Informe um nome de 1 a 60 caracteres.');
  const value = name.trim();
  if (!value || value.length > 60) throw new Error('Informe um nome de 1 a 60 caracteres.');
  return value;
}

function customId() {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `custom-${random.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 72)}`;
}

function write(items) {
  const serialized = JSON.stringify({ version: 1, items });
  if (serialized.length > MAX_BYTES) throw new Error('Os cenários salvos excederam o limite local.');
  try { storage().setItem(SAVED_SCENARIOS_KEY, serialized); }
  catch { throw new Error('O navegador não permitiu salvar. A lista anterior foi preservada.'); }
  return items;
}

export function listSavedScenarios(validateScenario) {
  let raw;
  try { raw = storage().getItem(SAVED_SCENARIOS_KEY); }
  catch { throw new Error('O navegador não permitiu acessar os cenários salvos.'); }
  if (raw === null) return [];
  try {
    if (raw.length > MAX_BYTES) throw new Error();
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !Array.isArray(value.items) || value.items.length > SAVED_SCENARIOS_LIMIT) throw new Error();
    const names = new Set();
    return value.items.map(item => {
      const name = normalizedName(item?.name);
      const folded = name.toLocaleLowerCase('pt-BR');
      if (names.has(folded)) throw new Error();
      names.add(folded);
      return { name, scenario: validateScenario(item?.scenario) };
    });
  } catch { throw new Error('Não foi possível ler os cenários salvos. Os dados existentes foram preservados.'); }
}

export function saveScenario(name, scenario, validateScenario) {
  name = normalizedName(name);
  const items = listSavedScenarios(validateScenario);
  if (items.some(item => item.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'))) throw new Error('Esse nome já existe. Use outro nome para preservar o cenário anterior.');
  if (items.length >= SAVED_SCENARIOS_LIMIT) throw new Error('Limite de 10 cenários. Exclua um para guardar outro.');
  const validated = validateScenario({ ...scenario, version: 1, id: customId(), label: name });
  write([...items, { name, scenario: validated }]);
  return validated;
}

export function loadSavedScenario(name, validateScenario) {
  const item = listSavedScenarios(validateScenario).find(entry => entry.name === name);
  if (!item) throw new Error('Escolha um cenário disponível na lista.');
  return validateScenario(item.scenario);
}

export function removeSavedScenario(name, validateScenario) {
  const items = listSavedScenarios(validateScenario);
  if (!items.some(item => item.name === name)) throw new Error('Escolha um cenário disponível na lista.');
  return write(items.filter(item => item.name !== name));
}

export function createScenarioShareUrl(scenario, validateScenario, baseUrl) {
  const value = validateScenario(scenario);
  const url = new URL(baseUrl);
  url.search = '';
  url.searchParams.set('sv', '1');
  url.searchParams.set('objective', value.objective);
  url.searchParams.set('context', String(value.contextK));
  url.searchParams.set('response', String(value.responseTokens));
  url.searchParams.set('concurrency', String(value.concurrency));
  url.searchParams.set('latency', value.latency);
  url.searchParams.set('priority', value.priority);
  return url.toString();
}

export function readScenarioShareUrl(urlValue, validateScenario) {
  const url = new URL(urlValue);
  if (!url.searchParams.has('sv')) return null;
  if (url.searchParams.get('sv') !== '1') throw new Error('O link usa uma versão de cenário incompatível.');
  const allowed = new Set(['sv', 'objective', 'context', 'response', 'concurrency', 'latency', 'priority']);
  for (const key of url.searchParams.keys()) if (!allowed.has(key)) throw new Error('O link contém campos não reconhecidos.');
  return validateScenario({
    version: 1,
    id: 'custom-shared',
    label: 'Cenário compartilhado',
    objective: url.searchParams.get('objective'),
    contextK: Number(url.searchParams.get('context')),
    responseTokens: Number(url.searchParams.get('response')),
    concurrency: Number(url.searchParams.get('concurrency')),
    latency: url.searchParams.get('latency'),
    priority: url.searchParams.get('priority'),
  });
}
