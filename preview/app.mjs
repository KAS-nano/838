import { validateHardware, validateGoals, objectiveNames } from './validation.mjs';
import { initialProfile, readProfile, PROFILE_KEY, escapeHtml, profileSummary } from './shared.mjs';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
let step = 1;
const state = { ...initialProfile, ...(readProfile() || {}) };
// Keep the established specialized video/audio objectives available for existing profiles.
$('#objectiveGrid').innerHTML = objectiveNames.map(name => `<label><input type="checkbox" name="objective" value="${name}">${name}</label>`).join('');
const fields = { cpu: 'cpu', gpu: 'gpu', vramGb: 'vram', ramGb: 'ram', storageTotalGb: 'storageTotal', storageFreeGb: 'storageFree', os: 'os', distro: 'distro' };
for (const [key, id] of Object.entries(fields)) $(`#${id}`).value = state[key];
for (const group of ['deviceType', 'preference', 'priority']) $$(`[name=${group}]`).forEach(input => { input.checked = state[group] === input.value; });
$$('[name=objective]').forEach(input => { input.checked = state.objectives.includes(input.value); });

function sync() {
  for (const [key, id] of Object.entries(fields)) state[key] = ['vramGb', 'ramGb', 'storageTotalGb', 'storageFreeGb'].includes(key) ? ($(`#${id}`).value.trim() ? Number($(`#${id}`).value) : NaN) : $(`#${id}`).value.trim();
  for (const group of ['deviceType', 'preference', 'priority']) state[group] = $(`[name=${group}]:checked`)?.value;
  state.objectives = $$('[name=objective]:checked').map(input => input.value);
}
function errors(value) {
  $('#errors').innerHTML = Object.values(value).map(message => `<p>${escapeHtml(message)}</p>`).join('');
  $$('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
  for (const key of Object.keys(value)) if (fields[key]) $(`#${fields[key]}`).setAttribute('aria-invalid', 'true');
  if (Object.keys(value).length) $('#errors').focus();
}
function render(focus = false) {
  $$('[data-step]').forEach(section => { section.hidden = Number(section.dataset.step) !== step; });
  $$('[data-step-label]').forEach(label => { if (Number(label.dataset.stepLabel) === step) label.setAttribute('aria-current', 'step'); else label.removeAttribute('aria-current'); });
  const progress = Math.round(step / 3 * 100);
  $('#stepText').textContent = `Etapa ${step} de 3`;
  $('#progressText').textContent = `${progress}%`;
  $('#progress').style.width = `${progress}%`;
  $('#progressTrack').setAttribute('aria-valuenow', String(progress));
  $('#back').textContent = step === 1 ? 'Voltar ao início' : 'Voltar';
  $('#next').textContent = step === 3 ? 'Salvar perfil' : 'Continuar';
  $('#distroWrap').hidden = $('#os').value !== 'linux';
  if (step === 3) $('#summary').innerHTML = profileSummary(state);
  if (focus) $(`[data-step="${step}"] h2`).focus();
}
$('#os').addEventListener('change', () => { $('#distroWrap').hidden = $('#os').value !== 'linux'; });
$('#onboardingForm').addEventListener('submit', event => {
  event.preventDefault(); sync();
  const invalid = step === 1 ? validateHardware(state) : step === 2 ? validateGoals(state) : { ...validateHardware(state), ...validateGoals(state) };
  errors(invalid);
  if (Object.keys(invalid).length) return;
  if (step < 3) { step++; render(true); return; }
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(state)); location.href = 'index.html#dashboard'; }
  catch { errors({ storage: 'Não foi possível salvar no navegador. Libere o armazenamento local e tente novamente.' }); }
});
$('#back').addEventListener('click', () => { if (step === 1) location.href = 'home.html'; else { sync(); step--; errors({}); render(true); } });
render();
