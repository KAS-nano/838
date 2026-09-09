import { seedModels as models, COMPARISON_METRICS, CONFIDENCE_LABELS, DEFAULT_SELECTIONS, FIT_LABELS, ORIGIN_LABELS, createComparisonRows, filterCatalog, filterComparisonRows, formatMetric, metricScale, metricValue, sortComparisonRows } from './engine.mjs';
import { escapeHtml as html } from './shared.mjs';

const $ = selector => document.querySelector(selector);
const numberFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const gb = value => `${numberFormat.format(value)} GB`;

export function initializeComparison(profile, initialContext = 8, isDemo = false) {
  let selections = DEFAULT_SELECTIONS.map(selection => ({ ...selection }));
  const filters = { query: '', family: 'all' };
  $('#compareProfile').innerHTML = `${isDemo ? 'Perfil de demonstração' : 'Seu perfil'} · ${html(profile.gpu)} · ${profile.vramGb} GB VRAM · ${profile.ramGb} GB RAM · ${profile.storageFreeGb} GB livres. <a href="onboarding.html">Editar hardware</a>`;
  $('#compareFamily').innerHTML = '<option value="all">Todas as famílias</option>' + [...new Set(models.map(model => model.family))].sort().map(family => `<option>${html(family)}</option>`).join('');
  $('#compareFit').innerHTML = '<option value="all">Todos os encaixes</option>' + Object.entries(FIT_LABELS).map(([key, value]) => `<option value="${key}">${value}</option>`).join('');
  $('#compareSort').innerHTML = '<option value="selection">Ordem escolhida</option>' + COMPARISON_METRICS.map(metric => `<option value="${metric.key}">${metric.label} · ${metric.direction === 'higher' ? 'maior' : 'menor'} primeiro</option>`).join('');
  $('#compareMetric').innerHTML = COMPARISON_METRICS.map(metric => `<option value="${metric.key}">${metric.label}</option>`).join('');
  $('#compareContext').value = String(initialContext);

  function renderControls() {
    const candidates = filterCatalog(models, filters);
    $('#compareCatalogCount').textContent = `${candidates.length} modelos disponíveis nos filtros. As escolhas atuais são preservadas.`;
    $('#compareControls').innerHTML = selections.map((selection, index) => {
      const model = models.find(candidate => candidate.id === selection.modelId);
      const options = candidates.some(candidate => candidate.id === model.id) ? candidates : [model, ...candidates];
      return `<fieldset class="compare-slot"><legend>Modelo ${index + 1}</legend><label>Modelo<select class="compare-select" data-slot="${html(selection.slotId)}" aria-label="Modelo ${index + 1}">${options.map(candidate => `<option value="${html(candidate.id)}" ${candidate.id === model.id ? 'selected' : ''}>${html(candidate.name)}${!candidates.includes(candidate) ? ' · seleção atual' : ''}</option>`).join('')}</select></label><label>Quantização simulada<select class="compare-quant" data-slot="${html(selection.slotId)}" aria-label="Quantização ${index + 1}">${model.variants.map(variant => `<option ${variant.quantization === selection.quantization ? 'selected' : ''}>${html(variant.quantization)}</option>`).join('')}</select></label></fieldset>`;
    }).join('');
  }

  function requestedContext() {
    const input = $('#compareContext').value;
    const parsed = Number(input);
    return Math.max(1, Math.min(256, input.trim() === '' || !Number.isFinite(parsed) ? 8 : parsed));
  }

  function renderResults() {
    const contextK = requestedContext();
    const allRows = createComparisonRows(profile, models, selections, contextK);
    const rows = sortComparisonRows(filterComparisonRows(allRows, $('#compareFit').value), $('#compareSort').value);
    $('#compareResultCount').textContent = `${rows.length} de ${allRows.length} modelos na comparação · contexto solicitado ${contextK}K`;
    $('#compareEmpty').hidden = rows.length !== 0;
    $('#compareResults').hidden = rows.length === 0;
    if (!rows.length) return;
    const metric = $('#compareMetric').value;
    const spec = COMPARISON_METRICS.find(item => item.key === metric);
    const scale = metricScale(rows, metric);
    $('#compareChartTitle').textContent = spec.label;
    $('#compareChartCaption').textContent = `${spec.description} Barras proporcionais, com escala a partir de zero.`;
    $('#compareChart').innerHTML = rows.map(row => `<div class="compare-chart-row" data-model="${html(row.model.id)}" data-value="${metricValue(row, metric)}"><div class="compare-chart-label"><strong>${html(row.model.name)}</strong><span>${html(row.variant.quantization)} · ${row.contextK}K</span><span>${FIT_LABELS[row.compat.fit]}</span></div><div class="compare-chart-track" aria-hidden="true"><i style="width:${Math.max(0, Math.min(100, metricValue(row, metric) / scale * 100))}%"></i></div><b>${formatMetric(row, metric)}</b></div>`).join('');
    $('#compareCards').innerHTML = rows.map(row => `<article class="compare-card" data-model="${html(row.model.id)}"><p class="compare-kicker">${html(row.model.family)}</p><h2>${html(row.model.name)}</h2><p class="compare-version">${html(row.variant.quantization)} · ${row.contextK}K${row.contextK < contextK ? ' (limite do modelo)' : ''}</p><span class="compare-fit" data-fit="${row.compat.fit}">${FIT_LABELS[row.compat.fit]}</span><dl class="compare-metrics">${COMPARISON_METRICS.map(item => `<div><dt>${item.label}</dt><dd>${formatMetric(row, item.key)}</dd></div>`).join('')}</dl><p class="compare-evidence">${ORIGIN_LABELS[row.perf.dataState]} · confiança ${CONFIDENCE_LABELS[row.perf.confidence].toLowerCase()}</p><p class="compare-reason">${html(row.compat.reasons[0] || '')}</p></article>`).join('');
    const tableMetrics = [
      ['Quantização simulada', row => row.variant.quantization],
      ['Contexto efetivo', row => `${row.contextK}K${row.contextK < contextK ? ' · limite do modelo' : ''}`],
      ['Compatibilidade', row => `${row.compat.score}/100 · ${FIT_LABELS[row.compat.fit]}`],
      ['VRAM para carga total', row => gb(row.memory.totalGpuTargetGb)],
      ['VRAM alocada no seu perfil', row => gb(row.memory.vramGb)],
      ['Pesos na GPU', row => `${row.memory.gpuLayersPercent}%`],
      ['RAM estimada', row => gb(row.memory.ramGb)],
      ['Disco estimado', row => gb(row.memory.diskGb)],
      ['Geração estimada', row => formatMetric(row, 'speed')],
      ['Origem do desempenho', row => ORIGIN_LABELS[row.perf.dataState]],
      ['Confiança no desempenho', row => CONFIDENCE_LABELS[row.perf.confidence]],
      ['Base da estimativa', row => row.perf.note],
      ['Razões de compatibilidade', row => row.compat.reasons.join(' ')],
    ];
    $('#compareTable').innerHTML = `<caption>Comparação detalhada no seu perfil de hardware</caption><thead><tr><th scope="col">Métrica</th>${rows.map(row => `<th scope="col">${html(row.model.name)}<small>${html(row.variant.quantization)} · ${row.contextK}K</small></th>`).join('')}</tr></thead><tbody>${tableMetrics.map(([label, value]) => `<tr><th scope="row">${label}</th>${rows.map(row => `<td>${html(value(row))}</td>`).join('')}</tr>`).join('')}</tbody>`;
  }

  $('#compareControls').addEventListener('change', event => {
    const input = event.target;
    selections = selections.map(selection => {
      if (selection.slotId !== input.dataset.slot) return selection;
      if (input.matches('.compare-quant')) return { ...selection, quantization: input.value };
      const model = models.find(candidate => candidate.id === input.value);
      if (!model) return selection;
      return { ...selection, modelId: model.id, quantization: model.variants.some(variant => variant.quantization === selection.quantization) ? selection.quantization : model.variants[0].quantization };
    });
    if (input.matches('.compare-select')) { renderControls(); $(`.compare-select[data-slot="${input.dataset.slot}"]`).focus(); }
    renderResults();
  });
  $('#compareSearch').addEventListener('input', event => { filters.query = event.target.value; renderControls(); });
  $('#compareFamily').addEventListener('change', event => { filters.family = event.target.value; renderControls(); });
  for (const selector of ['#compareFit', '#compareSort', '#compareMetric']) $(selector).addEventListener('change', renderResults);
  $('#compareContext').addEventListener('input', renderResults);
  $('#compareContext').addEventListener('blur', event => { event.target.value = String(requestedContext()); renderResults(); });
  $('#compareShowAll').addEventListener('click', () => { $('#compareFit').value = 'all'; renderResults(); });
  $('#compareReset').addEventListener('click', () => {
    filters.query = ''; filters.family = 'all';
    $('#compareSearch').value = ''; $('#compareFamily').value = 'all'; $('#compareFit').value = 'all'; $('#compareSort').value = 'selection';
    renderControls(); renderResults();
  });
  renderControls(); renderResults();
  return renderResults;
}
