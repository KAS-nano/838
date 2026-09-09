import { initializeComparison } from './comparison.mjs';
import { seedModels as models, seedBenchmarks, estimateMemory, estimatePerformance, calculateCompatibility, recommendHybrid, seedApiModels, hardwareStrength, primaryBottleneck, suggestUpgrades, recommendSystems, recipeFor } from './engine.mjs';
import { demoProfile, readProfile, escapeHtml as html, profileSummary } from './shared.mjs';
import { getModelExternalLinks, modelExternalLinks } from './engine.mjs';
import { renderModelLinks } from './model-links.mjs';
import { initProjectSupport } from './support.mjs';

initProjectSupport();

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const savedProfile = readProfile();
const profile = savedProfile || demoProfile;
const objective = profile.objectives[0] || 'Assistente geral';
let selected = models.find(model => model.id === 'qwen3-8b') || models[0];
let quant = 'Q4_K_M';
let contextK = 8;
try {
  const saved = JSON.parse(localStorage.getItem('838.preview.selection') || 'null');
  if (saved) {
    selected = models.find(model => model.id === saved.model) || selected;
    if (selected.variants.some(variant => variant.quantization === saved.quant)) quant = saved.quant;
    if (Number.isFinite(saved.contextK)) contextK = Math.max(1, Math.min(saved.contextK, selected.contextK));
  }
} catch { /* Invalid saved selections fall back to the catalog defaults. */ }
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const confidenceLabels = { low: 'Baixa', medium: 'Média', high: 'Alta' };
const dataStateLabels = { measured: 'Medido', estimated: 'Estimado', seed: 'Seed', heuristic: 'Heurística' };
const fitLabels = { gpu: 'Cabe na GPU', offload: 'Offload necessário', incompatible: 'Incompatível' };
function estimate(model = selected, requestedQuant = quant, requestedContext = contextK) {
  const variant = model.variants.find(value => value.quantization === requestedQuant) || model.variants.find(value => value.quantization === 'Q4_K_M') || model.variants[0];
  const context = Math.min(requestedContext, model.contextK);
  return { variant, context, memory: estimateMemory(profile, model, variant, context), performance: estimatePerformance(profile, model, variant, context, seedBenchmarks), compatibility: calculateCompatibility(profile, model, variant, objective, context) };
}
function saveSelection() {
  try { localStorage.setItem('838.preview.selection', JSON.stringify({ model: selected.id, quant, contextK })); } catch { /* Selecting models still works without browser persistence. */ }
}
function gauge(label, value, max, display, description) {
  const pct = max > 0 ? clamp(value / max * 100, 0, 100) : 0;
  const color = display ? 'var(--accent)' : value > max ? 'var(--danger)' : max > 0 && value / max > .7 ? 'var(--warning)' : 'var(--accent)';
  const capacity = display ? '' : `<small>${max > 0 ? `${Math.round(value / max * 100)}% de ${max} GB` : '0 GB disponíveis'}</small>`;
  return `<article class="gauge"><div class="gauge-label">${label}</div><div class="dial" aria-hidden="true"><svg viewBox="0 0 240 145"><path d="M30 120 A90 90 0 0 1 210 120" fill="none" stroke="var(--surface-raised)" stroke-width="14" stroke-linecap="round"/><path d="M30 120 A90 90 0 0 1 210 120" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round" pathLength="100" stroke-dasharray="${pct} 100"/><g transform="rotate(${-90 + pct * 1.8} 120 120)"><line x1="120" y1="120" x2="120" y2="48" stroke="var(--foreground)" stroke-width="3" stroke-linecap="round"/></g><circle cx="120" cy="120" r="7" fill="var(--foreground)"/></svg></div><div class="gauge-value">${display || `${value.toFixed(1)} GB`}</div>${capacity}<small>${html(description || 'Modelo, buffers e margem de runtime')}</small></article>`;
}
function updateDashboard() {
  const { memory, performance, compatibility } = estimate();
  $('#demoNotice').hidden = Boolean(savedProfile);
  $('#hardwareLine').textContent = `${profile.deviceType === 'notebook' ? 'Notebook' : 'Desktop'} · ${profile.cpu} · ${profile.gpu} · ${profile.vramGb} GB VRAM · ${profile.ramGb} GB RAM · ${profile.storageFreeGb} GB livres / ${profile.storageTotalGb} GB · ${profile.os}${profile.os === 'linux' ? ` / ${profile.distro}` : ''}`;
  $('#gauges').innerHTML = gauge('VRAM estimada', memory.vramGb, profile.vramGb, null, `${memory.gpuLayersPercent}% dos pesos na GPU · KV ${memory.kvCacheGb} GB`) + gauge('RAM estimada', memory.ramGb, profile.ramGb) + gauge('Armazenamento', memory.diskGb, profile.storageFreeGb) + gauge('Geração estimada', performance.center, Math.max(60, performance.high * 1.2), `${performance.low}–${performance.high} t/s`, `${dataStateLabels[performance.dataState] || (performance.method === 'heuristic' ? 'Heurística' : 'Seed')} · confiança ${confidenceLabels[performance.confidence].toLowerCase()}`);
  $('#compatScore').textContent = `${compatibility.score}/100`;
  $('#compatBar').style.width = `${compatibility.score}%`;
  $('#fitBadge').textContent = fitLabels[compatibility.fit];
  $('#fitBadge').dataset.fit = compatibility.fit;
  $('#compatReasons').innerHTML = compatibility.reasons.map(reason => `<li>${html(reason)}</li>`).join('');
  $('#confidence').textContent = `Confiança ${confidenceLabels[performance.confidence].toLowerCase()}`;
  $('#evidence').textContent = `${performance.note} Contexto: ${contextK}K. Valores seed e heurísticas não são benchmarks medidos.`;
  saveSelection();
}
function fillControls() {
  $('#modelSelect').innerHTML = models.map(model => `<option value="${model.id}">${model.name}</option>`).join('');
  $('#modelSelect').value = selected.id;
  if (!selected.variants.some(variant => variant.quantization === quant)) quant = selected.variants.find(variant => variant.quantization === 'Q4_K_M')?.quantization || selected.variants[0].quantization;
  $('#quantSelect').innerHTML = selected.variants.map(variant => `<option>${variant.quantization}</option>`).join('');
  $('#quantSelect').value = quant;
  contextK = Math.min(contextK, selected.contextK);
  $('#contextRange').max = String(selected.contextK);
  $('#contextRange').value = String(contextK);
  $('#contextLabel').textContent = `${contextK}K`;
  $('#contextRange').setAttribute('aria-valuetext', `${contextK} mil tokens`);
}
function renderModels() {
  const filter = $('#modelSearch').value.trim().toLocaleLowerCase('pt-BR');
  const precision = $('#modelPrecision').value;
  const modality = $('#modelModality').value;
  const matched = models.filter(model => {
    const links = getModelExternalLinks(model.id);
    return `${model.name} ${model.family} ${model.description} ${model.objectives.join(' ')} ${links?.modelName || ''}`.toLocaleLowerCase('pt-BR').includes(filter)
      && (modality === 'all' || model.modalities.includes(modality))
      && (precision === 'all' || links?.variants.some(variant => variant.quantization === precision));
  });
  $('#modelCount').textContent = `${matched.length} modelos encontrados${precision === 'all' ? '' : ` com link ${precision}`}`;
  $('#modelGrid').innerHTML = matched.map(model => `<article class="panel model-catalog-card"><div class="model-card-heading"><div><p class="eyebrow">${html(model.family)}</p><h2>${html(model.name)}</h2></div><span class="badge">${model.paramsB}B${model.activeParamsB ? ` · ${model.activeParamsB}B ativos` : ''}</span></div><p class="model-card-description">${html(model.description)}</p><div class="model-card-tags">${model.modalities.map(item => `<span>${item === 'vision' ? 'Visão' : item === 'text' ? 'Texto' : html(item)}</span>`).join('')}<span>${model.contextK}K contexto · seed</span></div>${renderModelLinks(model.id, precision)}<div class="model-card-footer"><span>Requisitos e desempenho estimados</span><button class="ghost" type="button" data-select-model="${model.id}">Analisar na minha máquina →</button></div></article>`).join('') || '<p class="muted">Nenhum modelo encontrado com estes filtros. Altere a busca, modalidade ou precisão.</p>';
}
function renderRecommendations() {
  const recommendations = recommendHybrid(profile, objective, models, seedApiModels).filter(item => profile.preference === 'both' || item.mode === profile.preference);
  $('#recommendations').innerHTML = recommendations.slice(0, 8).map((item, index) => `<article class="rank"><span class="rank-num">${index + 1}</span><div><span class="eyebrow">${item.mode === 'local' ? 'IA Local' : 'API'} · estimado</span><strong>${html(item.name)}</strong><span class="muted">${html(item.reason)}</span><span class="muted">${html(item.costNote)}</span></div><div class="metric"><b>${item.score}/100</b><a class="ghost mt-16" href="${item.mode === 'local' ? '#modelos' : '#ferramentas'}">${item.mode === 'local' ? 'Configurar' : 'Ver ferramentas'}</a></div></article>`).join('') + '<p class="notice">Ranking heurístico para os objetivos e preferências do perfil. Preços de API são demonstrativos; confirme no provedor.</p>';
}
const renderCompareTable = initializeComparison(profile, 8, !savedProfile);
const tools = [['Ollama', 'Runtime', 'Gerenciador local com API para modelos.'], ['LM Studio', 'Runtime', 'Interface desktop e servidor local.'], ['llama.cpp', 'Runtime', 'Inferência local e servidor para GGUF.'], ['VS Code', 'IDE', 'Editor extensível para programação.'], ['Zed', 'IDE', 'Editor com integração de ferramentas de IA.'], ['OBS Studio', 'Vídeo', 'Captura e gravação.'], ['Kdenlive', 'Vídeo', 'Editor de vídeo livre.'], ['Krita', 'Imagem', 'Criação e edição de imagens.'], ['Audacity', 'Áudio', 'Edição e gravação de áudio.'], ['OpenRouter', 'API', 'Acesso a modelos hospedados.']];
function renderTools() { $('#toolGrid').innerHTML = tools.map(([name, category, description]) => `<article class="tool-card"><div class="eyebrow">${category}</div><h3>${name}</h3><p class="muted">${description}</p>${category === 'Runtime' && name !== 'llama.cpp' ? '<a class="ghost" href="#instalar">Ver instalação</a>' : ''}</article>`).join(''); }
function renderStrength() {
  $('#strengthList').innerHTML = hardwareStrength(profile).map(item => `<div class="strength"><span>${item.category}</span><div class="bar" role="meter" aria-label="${item.category}" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${item.score}"><i style="width:${item.score * 10}%"></i></div><b>${item.score}/10</b></div>`).join('');
  $('#bottleneck').textContent = primaryBottleneck(profile);
  $('#bottleneckText').textContent = 'Capacidade relativa estimada por heurística. A menor categoria indica onde investigar; não implica que um upgrade seja necessário.';
}
function renderUpgrades() {
  const items = suggestUpgrades(profile);
  $('#upgradeList').innerHTML = items.length ? items.map(item => `<article class="rank"><span class="rank-num">+</span><div><strong>${html(item.title)}</strong><span class="muted">${html(item.benefit)}</span></div><div class="metric"><b>${html(item.target)}</b></div></article>`).join('') : '<article class="panel"><h2>Sem upgrade óbvio</h2><p class="muted">O perfil atual não apresenta uma mudança necessária apenas por capacidade.</p></article>';
  $('#upgradeList').innerHTML += '<p class="notice">Sugestões estimadas por capacidade, sem cotação de preço nem garantia de desempenho.</p>';
}
function renderSystems() {
  $('#systemList').innerHTML = recommendSystems(profile, objective).map((system, index) => `<article class="rank"><span class="rank-num">${index + 1}</span><div><strong>${html(system.name)}</strong><span class="muted">Dificuldade: ${html(system.difficulty)}</span><ul class="clean">${system.reasons.map(reason => `<li>${html(reason)}</li>`).join('')}</ul>${system.caveats.map(caveat => `<p class="notice amber">${html(caveat)}</p>`).join('')}</div><div class="metric"><b>${system.score}/100</b><span class="muted">Heurística</span></div></article>`).join('');
}
function renderInstall() {
  const chosenOs = $('#installOs').value;
  const installProfile = chosenOs === 'auto' ? profile : { ...profile, os: chosenOs, distro: chosenOs === profile.os ? profile.distro : '' };
  const recipe = recipeFor($('#installTool').value === 'Ollama' ? 'ollama' : 'lm-studio', installProfile);
  if (!recipe) { $('#installCard').innerHTML = '<p class="notice amber">Não existe receita cadastrada para essa combinação.</p>'; return; }
  const steps = items => items.map((item, index) => `<div class="step"><strong>${index + 1}. ${html(item.title)}</strong>${item.note ? `<p class="muted">${html(item.note)}</p>` : ''}${item.command ? `<pre>${html(item.command)}</pre><button class="ghost copy-command" type="button">Copiar comando</button>` : ''}</div>`).join('');
  $('#installCard').innerHTML = `<div class="eyebrow">Receita de instalação</div><h2>${html(recipe.label)}</h2><p class="muted">${html(recipe.method)}</p><ul class="clean">${recipe.requirements.map(item => `<li>${html(item)}</li>`).join('')}</ul>${steps(recipe.steps)}<h3 class="mt-16">Verificar instalação</h3>${steps(recipe.verify)}<div class="notice">Fonte: <a href="${html(recipe.officialSource)}" target="_blank" rel="noopener noreferrer">Documentação oficial</a> · Revisão registrada: ${html(recipe.lastVerified)}. Confira a fonte antes de executar comandos.</div>`;
}
$('#installCard').addEventListener('click', async event => {
  const button = event.target.closest('.copy-command');
  if (!button) return;
  try { await navigator.clipboard.writeText(button.previousElementSibling.textContent); button.textContent = 'Copiado'; }
  catch { button.textContent = 'Selecione o comando e copie manualmente'; }
});
window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
function closeMenu() { $('#sidebar').classList.remove('open'); $('#menuBackdrop').classList.remove('visible'); $('#mobileMenu').setAttribute('aria-expanded', 'false'); $('#mobileMenu').setAttribute('aria-label', 'Abrir menu'); $('#main').inert = false; document.body.style.overflow = ''; }
function navigate() {
  let page = location.hash.slice(1) || 'dashboard';
  if (!/^[a-z]+$/.test(page) || !document.getElementById(`page-${page}`)) page = 'dashboard';
  $$('.page').forEach(section => section.classList.toggle('active', section.id === `page-${page}`));
  $$('#nav a').forEach(link => { const active = link.dataset.page === page; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
  closeMenu();
  const title = $(`#page-${page} h1`);
  document.title = `838 · ${title.textContent}`;
  if (page === 'recomendacoes') renderRecommendations();
  if (page === 'comparar') renderCompareTable();
  if (page === 'instalar') renderInstall();
  window.scrollTo(0, 0);
}
$('#modelSelect').addEventListener('change', event => { selected = models.find(model => model.id === event.target.value) || models[0]; fillControls(); updateDashboard(); });
$('#quantSelect').addEventListener('change', event => { quant = event.target.value; updateDashboard(); });
$('#contextRange').addEventListener('input', event => { contextK = Number(event.target.value); $('#contextLabel').textContent = `${contextK}K`; event.target.setAttribute('aria-valuetext', `${contextK} mil tokens`); updateDashboard(); });
$('#modelSearch').addEventListener('input', renderModels);
$('#modelModality').addEventListener('change', renderModels);
$('#modelPrecision').innerHTML += [...new Set(Object.values(modelExternalLinks).flatMap(model => model.variants.map(variant => variant.quantization)))].sort().map(precision => `<option value="${html(precision)}">${html(precision)}</option>`).join('');
$('#modelPrecision').addEventListener('change', renderModels);
$('#modelGrid').addEventListener('click', event => { const button = event.target.closest('[data-select-model]'); if (!button) return; selected = models.find(model => model.id === button.dataset.selectModel); fillControls(); updateDashboard(); location.hash = 'dashboard'; });
$('#installTool').addEventListener('change', renderInstall);
$('#installOs').addEventListener('change', renderInstall);
$('#mobileMenu').addEventListener('click', () => { const open = $('#sidebar').classList.toggle('open'); $('#menuBackdrop').classList.toggle('visible', open); $('#mobileMenu').setAttribute('aria-expanded', String(open)); $('#mobileMenu').setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); $('#main').inert = open; document.body.style.overflow = open ? 'hidden' : ''; if (open) $('#nav a').focus(); });
$('#menuBackdrop').addEventListener('click', closeMenu);
document.addEventListener('keydown', event => {
  if (!$('#sidebar').classList.contains('open')) return;
  if (event.key === 'Escape') { closeMenu(); $('#mobileMenu').focus(); }
  if (event.key === 'Tab') {
    const links = $$('#sidebar a[href], #sidebar button:not([disabled]), #sidebar summary, #sidebar input:not([disabled]), #sidebar textarea:not([disabled]), #sidebar [tabindex="0"]').filter(element => element.getClientRects().length > 0 && !element.closest('details:not([open]) > :not(summary)'));
    const first = links[0], last = links[links.length - 1];
    if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) { event.preventDefault(); $('#mobileMenu').focus(); }
    else if (document.activeElement === $('#mobileMenu')) { event.preventDefault(); (event.shiftKey ? last : first).focus(); }
  }
});
$('#fakeBenchmark').addEventListener('click', () => { $('#benchmarkOutput').textContent = 'Demonstração de interface: nenhuma medição ou chamada local foi realizada.\nAbra o 838 e conecte o Ollama para medir o desempenho local.\nEstado: não medido.'; });
window.addEventListener('hashchange', navigate);
$('#profileSummary').innerHTML = profileSummary(profile);
$('#profileMessage').textContent = savedProfile ? 'Perfil salvo neste navegador. Edite hardware e objetivos no onboarding.' : 'Perfil de demonstração. Configure sua máquina para salvar um perfil local.';
fillControls(); renderModels(); renderTools(); updateDashboard(); renderStrength(); renderUpgrades(); renderSystems(); renderInstall(); navigate();
