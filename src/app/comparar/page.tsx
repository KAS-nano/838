"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { seedModels } from "@/data/seed-models";
import { useHardwareProfile } from "@/features/profile/use-hardware-profile";
import type { Quantization } from "@/features/catalog/types";
import {
  COMPARISON_METRICS, CONFIDENCE_LABELS, DEFAULT_SELECTIONS, FIT_LABELS, ORIGIN_LABELS,
  createComparisonRows, filterCatalog, filterComparisonRows, formatMetric, metricScale,
  metricValue, sortComparisonRows, type ComparisonFit, type ComparisonMetric,
  type ComparisonRow, type ComparisonSelection, type ComparisonSort,
} from "@/features/comparison/engine";
import "../../../preview/comparison.css";

const families = [...new Set(seedModels.map((model) => model.family))].sort();
const numberFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const gb = (value: number) => `${numberFormat.format(value)} GB`;

export default function ComparePage() {
  const [selections, setSelections] = useState<ComparisonSelection[]>(DEFAULT_SELECTIONS);
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const [contextInput, setContextInput] = useState("8");
  const [fit, setFit] = useState<ComparisonFit>("all");
  const [sort, setSort] = useState<ComparisonSort>("selection");
  const [metric, setMetric] = useState<ComparisonMetric>("compatibility");
  const { profile, isDemo } = useHardwareProfile();
  const parsedContext = Number(contextInput);
  const contextK = Math.max(1, Math.min(256, contextInput.trim() === "" || !Number.isFinite(parsedContext) ? 8 : parsedContext));
  const candidates = useMemo(() => filterCatalog(seedModels, { query, family }), [query, family]);
  const rows = useMemo(() => createComparisonRows(profile, seedModels, selections, contextK), [profile, selections, contextK]);
  const visibleRows = useMemo(() => sortComparisonRows(filterComparisonRows(rows, fit), sort), [rows, fit, sort]);
  const metricSpec = COMPARISON_METRICS.find((item) => item.key === metric)!;
  const scale = metricScale(visibleRows, metric);

  function selectModel(slotId: string, modelId: string) {
    const model = seedModels.find((item) => item.id === modelId);
    if (!model) return;
    setSelections((current) => current.map((item) => item.slotId === slotId ? {
      ...item, modelId,
      quantization: model.variants.some((variant) => variant.quantization === item.quantization) ? item.quantization : model.variants[0].quantization,
    } : item));
  }
  function resetFilters() { setQuery(""); setFamily("all"); setFit("all"); setSort("selection"); }
  const tableRows: { label: string; value: (row: ComparisonRow) => string }[] = [
    { label: "Quantização simulada", value: (row) => row.variant.quantization },
    { label: "Contexto efetivo", value: (row) => `${row.contextK}K${row.contextK < contextK ? " · limite do modelo" : ""}` },
    { label: "Compatibilidade", value: (row) => `${row.compat.score}/100 · ${FIT_LABELS[row.compat.fit]}` },
    { label: "VRAM para carga total", value: (row) => gb(row.memory.totalGpuTargetGb) },
    { label: "VRAM alocada no seu perfil", value: (row) => gb(row.memory.vramGb) },
    { label: "Pesos na GPU", value: (row) => `${row.memory.gpuLayersPercent}%` },
    { label: "RAM estimada", value: (row) => gb(row.memory.ramGb) },
    { label: "Disco estimado", value: (row) => gb(row.memory.diskGb) },
    { label: "Geração estimada", value: (row) => formatMetric(row, "speed") },
    { label: "Origem do desempenho", value: (row) => ORIGIN_LABELS[row.perf.dataState] },
    { label: "Confiança no desempenho", value: (row) => CONFIDENCE_LABELS[row.perf.confidence] },
    { label: "Base da estimativa", value: (row) => row.perf.note },
    { label: "Razões de compatibilidade", value: (row) => row.compat.reasons.join(" ") },
  ];

  return <main><div className="page-container compare-page">
    <div className="page-heading"><div><p className="eyebrow">Comparador</p><h1 className="page-title">Leia as opções lado a lado</h1><p className="page-description">Compare versões, consumo e velocidade para a sua máquina. Você também pode selecionar duas quantizações do mesmo modelo.</p></div><Link href="/modelos" className="text-sm text-accent">Ver catálogo</Link></div>
    <p className="compare-profile">{isDemo ? "Perfil de demonstração" : "Seu perfil"} · {profile.gpu} · {profile.vramGb} GB VRAM · {profile.ramGb} GB RAM · {profile.storageFreeGb} GB livres. <Link href="/onboarding">Editar hardware</Link></p>

    <div className="compare-slots" id="compareControls">{selections.map((selection, index) => {
      const selected = seedModels.find((model) => model.id === selection.modelId)!;
      const options = candidates.some((model) => model.id === selected.id) ? candidates : [selected, ...candidates];
      return <fieldset className="compare-slot" key={selection.slotId}><legend>Modelo {index + 1}</legend>
        <label>Modelo<select aria-label={`Modelo ${index + 1}`} value={selection.modelId} onChange={(event) => selectModel(selection.slotId, event.target.value)}>{options.map((model) => <option key={model.id} value={model.id}>{model.name}{candidates.includes(model) ? "" : " · seleção atual"}</option>)}</select></label>
        <label>Quantização simulada<select aria-label={`Quantização ${index + 1}`} value={selection.quantization} onChange={(event) => setSelections((current) => current.map((item) => item.slotId === selection.slotId ? { ...item, quantization: event.target.value as Quantization } : item))}>{selected.variants.map((variant) => <option key={variant.quantization}>{variant.quantization}</option>)}</select></label>
      </fieldset>;
    })}</div>

    <section className="compare-filters" aria-label="Filtros da comparação">
      <div className="compare-filter-row"><label>Buscar no catálogo<input id="compareSearch" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome, família ou objetivo"/></label><label>Família<select id="compareFamily" value={family} onChange={(event) => setFamily(event.target.value)}><option value="all">Todas as famílias</option>{families.map((name) => <option key={name}>{name}</option>)}</select></label><label>Contexto solicitado (K)<input id="compareContext" type="number" min="1" max="256" step="1" value={contextInput} onChange={(event) => setContextInput(event.target.value)} onBlur={() => setContextInput(String(contextK))} aria-describedby="compareContextHelp"/></label></div>
      <p className="compare-help" id="compareCatalogCount" role="status">{candidates.length} modelos disponíveis nos filtros. As escolhas atuais são preservadas.</p><p className="compare-help" id="compareContextHelp">Contexto de 1K a 256K tokens, limitado ao máximo de cada modelo. As quantizações acima são estimativas do catálogo; consulte os arquivos disponíveis na página de modelos.</p>
      <div className="compare-filter-row"><label>Compatibilidade<select id="compareFit" aria-label="Filtro de compatibilidade" value={fit} onChange={(event) => setFit(event.target.value as ComparisonFit)}><option value="all">Todos os encaixes</option>{Object.entries(FIT_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>Ordenar por<select id="compareSort" aria-label="Ordenar comparação" value={sort} onChange={(event) => setSort(event.target.value as ComparisonSort)}><option value="selection">Ordem escolhida</option>{COMPARISON_METRICS.map((item) => <option key={item.key} value={item.key}>{item.label} · {item.direction === "higher" ? "maior" : "menor"} primeiro</option>)}</select></label><label>Métrica do gráfico<select id="compareMetric" value={metric} onChange={(event) => setMetric(event.target.value as ComparisonMetric)}>{COMPARISON_METRICS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label></div>
      <div className="compare-filter-footer"><p className="compare-help" id="compareResultCount" role="status">{visibleRows.length} de {rows.length} modelos na comparação · contexto solicitado {contextK}K</p><button id="compareReset" type="button" onClick={resetFilters}>Limpar filtros e ordenação</button></div>
    </section>

    {visibleRows.length === 0 ? <div className="compare-empty" id="compareEmpty"><h2>Nenhum modelo com esse encaixe</h2><p>Escolha outro filtro de compatibilidade ou ajuste as versões selecionadas.</p><button type="button" onClick={() => setFit("all")}>Mostrar todos os encaixes</button></div> : <div id="compareResults">
      <figure className="compare-chart-panel" aria-labelledby="compareChartTitle" aria-describedby="compareChartCaption"><h2 id="compareChartTitle">{metricSpec.label}</h2><figcaption id="compareChartCaption">{metricSpec.description} Barras proporcionais, com escala a partir de zero.</figcaption><div id="compareChart">{visibleRows.map((row) => <div className="compare-chart-row" data-model={row.model.id} data-value={metricValue(row, metric)} key={row.slotId}><div className="compare-chart-label"><strong>{row.model.name}</strong><span>{row.variant.quantization} · {row.contextK}K</span><span>{FIT_LABELS[row.compat.fit]}</span></div><div className="compare-chart-track" aria-hidden="true"><i style={{ width: `${Math.max(0, Math.min(100, metricValue(row, metric) / scale * 100))}%` }}/></div><b>{formatMetric(row, metric)}</b></div>)}</div></figure>
      <div className="compare-cards" id="compareCards">{visibleRows.map((row) => <article className="compare-card" data-model={row.model.id} key={row.slotId}><p className="compare-kicker">{row.model.family}</p><h2>{row.model.name}</h2><p className="compare-version">{row.variant.quantization} · {row.contextK}K{row.contextK < contextK ? " (limite do modelo)" : ""}</p><span className="compare-fit" data-fit={row.compat.fit}>{FIT_LABELS[row.compat.fit]}</span><dl className="compare-metrics">{COMPARISON_METRICS.map((item) => <div key={item.key}><dt>{item.label}</dt><dd>{formatMetric(row, item.key)}</dd></div>)}</dl><p className="compare-evidence">{ORIGIN_LABELS[row.perf.dataState]} · confiança {CONFIDENCE_LABELS[row.perf.confidence].toLowerCase()}</p><p className="compare-reason">{row.compat.reasons[0]}</p></article>)}</div>
      <div className="compare-table-wrap" tabIndex={0} role="region" aria-label="Tabela de comparação com rolagem horizontal"><table id="compareTable" className="compare-table"><caption>Comparação detalhada no seu perfil de hardware</caption><thead><tr><th scope="col">Métrica</th>{visibleRows.map((row) => <th scope="col" key={row.slotId}>{row.model.name}<small>{row.variant.quantization} · {row.contextK}K</small></th>)}</tr></thead><tbody>{tableRows.map((item) => <tr key={item.label}><th scope="row">{item.label}</th>{visibleRows.map((row) => <td key={row.slotId}>{item.value(row)}</td>)}</tr>)}</tbody></table></div>
      <p className="compare-help compare-footnote">VRAM para carga total indica a memória necessária para colocar o modelo inteiro na GPU. A VRAM alocada respeita a reserva do seu perfil; o restante pode exigir RAM/CPU. Memória e disco usam heurísticas de baixa confiança. Compatibilidade não mede a qualidade das respostas.</p>
    </div>}
  </div></main>;
}
