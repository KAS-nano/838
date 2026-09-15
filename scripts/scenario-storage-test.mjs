import { scenarioPresets, validateScenario } from '../preview/engine.mjs';
import { SAVED_SCENARIOS_KEY, createScenarioShareUrl, listSavedScenarios, loadSavedScenario, readScenarioShareUrl, removeSavedScenario, saveScenario } from '../preview/scenario-storage.mjs';

const values = new Map();
globalThis.window = { localStorage: {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: key => values.delete(key),
} };

const failures = [];
const check = (name, pass) => { console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); if (!pass) failures.push(name); };
const expectFailure = (name, callback) => { try { callback(); check(name, false); } catch { check(name, true); } };
const preset = scenarioPresets[0];

const saved = saveScenario('Meu trabalho', { ...preset, contextK: 24 }, validateScenario);
check('custom scenario is stored with versioned safe id', saved.label === 'Meu trabalho' && saved.contextK === 24 && saved.id.startsWith('custom-'));
check('saved scenario can be listed and loaded', listSavedScenarios(validateScenario).length === 1 && loadSavedScenario('Meu trabalho', validateScenario).contextK === 24);
expectFailure('duplicate names preserve existing list', () => saveScenario('meu trabalho', preset, validateScenario));
check('duplicate failure did not overwrite storage', listSavedScenarios(validateScenario).length === 1);

const share = createScenarioShareUrl(saved, validateScenario, 'https://838.vercel.app/recomendacoes?old=1');
const parsed = readScenarioShareUrl(share, validateScenario);
check('share round-trip preserves technical fields', parsed?.objective === saved.objective && parsed?.contextK === saved.contextK && parsed?.priority === saved.priority);
check('share excludes name, id, hardware and prior query', !share.includes(encodeURIComponent(saved.label)) && !share.includes(saved.id) && !share.includes('hardware') && !share.includes('old=1'));
expectFailure('unknown share fields are rejected', () => readScenarioShareUrl(`${share}&email=user%40example.com`, validateScenario));

removeSavedScenario('Meu trabalho', validateScenario);
check('scenario removal keeps library valid', listSavedScenarios(validateScenario).length === 0);
values.set(SAVED_SCENARIOS_KEY, '{broken');
expectFailure('corrupt storage is rejected without rewrite', () => listSavedScenarios(validateScenario));
check('corrupt storage remains available for recovery', values.get(SAVED_SCENARIOS_KEY) === '{broken');

if (failures.length) throw new Error(`scenario storage failed: ${failures.join(', ')}`);
