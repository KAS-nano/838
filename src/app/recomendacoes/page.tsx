"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { seedModels } from "@/data/seed-models";
import { seedApiModels } from "@/data/seed-api-models";
import { useHardwareProfile } from "@/features/profile/use-hardware-profile";
import { recommendHybrid } from "@/features/recommendation/hybrid";
import { scenarioExplanations, scenarioPresets, validateScenario, type RecommendationScenario } from "@/features/recommendation/scenario";
import { createScenarioShareUrl, listSavedScenarios, loadSavedScenario, readScenarioShareUrl, removeSavedScenario, saveScenario, type SavedScenario } from "../../../preview/scenario-storage.mjs";
import "../../../preview/scenario.css";

export default function Recommendations() {
  const { profile } = useHardwareProfile();
  const [scenario, setScenario] = useState<RecommendationScenario>(scenarioPresets[0]);
  const [scenarioName, setScenarioName] = useState("");
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [selectedSaved, setSelectedSaved] = useState("");
  const [scenarioMessage, setScenarioMessage] = useState("");
  const [scenarioToolsOpen, setScenarioToolsOpen] = useState(false);
  const list = useMemo(() => recommendHybrid(profile, scenario.objective, seedModels, seedApiModels, scenario)
    .filter((item) => profile.preference === "both" || item.mode === profile.preference), [profile, scenario]);
  const explanations = scenarioExplanations(scenario);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const items = listSavedScenarios(validateScenario);
        setSavedScenarios(items);
        const shared = readScenarioShareUrl(window.location.href, validateScenario);
        if (shared) {
          setScenario(shared);
          setScenarioToolsOpen(true);
          setScenarioMessage("Cenário carregado do link. Ele ainda não foi salvo neste navegador.");
        }
      } catch (error) {
        setScenarioToolsOpen(true);
        setScenarioMessage(error instanceof Error ? error.message : "Não foi possível carregar os cenários.");
      }
    });
    return () => { active = false; };
  }, []);

  function runScenarioAction(action: () => void) {
    try { action(); }
    catch (error) { setScenarioMessage(error instanceof Error ? error.message : "Não foi possível concluir a ação."); }
  }

  function saveCurrentScenario() {
    runScenarioAction(() => {
      const saved = saveScenario(scenarioName, scenario, validateScenario);
      const items = listSavedScenarios(validateScenario);
      setScenario(saved);
      setSavedScenarios(items);
      setSelectedSaved(saved.label);
      setScenarioName("");
      setScenarioMessage("Cenário salvo somente neste navegador.");
    });
  }

  function openSavedScenario() {
    runScenarioAction(() => {
      const saved = loadSavedScenario(selectedSaved, validateScenario);
      setScenario(saved);
      setScenarioMessage(`Cenário “${saved.label}” aberto.`);
    });
  }

  function deleteSavedScenario() {
    runScenarioAction(() => {
      const items = removeSavedScenario(selectedSaved, validateScenario);
      setSavedScenarios(items);
      setSelectedSaved("");
      setScenarioMessage("Cenário excluído. A configuração aberta foi mantida.");
    });
  }

  async function copyShareLink() {
    runScenarioAction(() => {
      const url = createScenarioShareUrl(scenario, validateScenario, window.location.href);
      void navigator.clipboard.writeText(url).then(
        () => setScenarioMessage("Link copiado. Ele contém somente os parâmetros técnicos do cenário."),
        () => setScenarioMessage("Não foi possível copiar. Verifique a permissão da área de transferência."),
      );
    });
  }

  function updateNumber(field: "contextK" | "responseTokens" | "concurrency", value: string) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) return;
    const limits = { contextK: [1, 256], responseTokens: [64, 32768], concurrency: [1, 64] } as const;
    const [minimum, maximum] = limits[field];
    setScenario((current) => ({ ...current, [field]: Math.max(minimum, Math.min(maximum, parsed)) }));
  }

  return <main><div className="page-container recommendation-page"><section>
    <div className="page-heading"><div><p className="eyebrow">Local + API</p><h1 className="page-title">Recomendações por cenário</h1><p className="page-description">Escolha como você pretende usar a IA. Contexto, resposta, concorrência e latência alteram o ranking e aparecem nas explicações.</p></div><Link href="/dashboard" className="text-sm text-accent">Dashboard</Link></div>
    <section className="scenario-panel" aria-labelledby="scenario-title">
      <div className="scenario-heading"><div><p className="eyebrow">Cenário de uso</p><h2 id="scenario-title">O que você precisa fazer?</h2></div><span className="badge">Configuração local</span></div>
      <div className="scenario-presets" role="group" aria-label="Presets de cenário">{scenarioPresets.map((preset) => <button type="button" key={preset.id} aria-pressed={scenario.id === preset.id} onClick={() => setScenario(preset)}>{preset.label}</button>)}</div>
      <div className="scenario-fields">
        <label>Contexto (K)<input aria-label="Contexto do cenário" type="number" min="1" max="256" value={scenario.contextK} onChange={(event) => updateNumber("contextK", event.target.value)} onBlur={() => setScenario((current) => ({ ...current, contextK: Math.max(1, Math.min(256, current.contextK)) }))}/></label>
        <label>Resposta máxima (tokens)<input aria-label="Resposta máxima" type="number" min="64" max="32768" step="64" value={scenario.responseTokens} onChange={(event) => updateNumber("responseTokens", event.target.value)} onBlur={() => setScenario((current) => ({ ...current, responseTokens: Math.max(64, Math.min(32768, current.responseTokens)) }))}/></label>
        <label>Execuções simultâneas<input aria-label="Execuções simultâneas" type="number" min="1" max="64" value={scenario.concurrency} onChange={(event) => updateNumber("concurrency", event.target.value)} onBlur={() => setScenario((current) => ({ ...current, concurrency: Math.max(1, Math.min(64, current.concurrency)) }))}/></label>
        <label>Latência<select aria-label="Preferência de latência" value={scenario.latency} onChange={(event) => setScenario((current) => ({ ...current, latency: event.target.value as RecommendationScenario["latency"] }))}><option value="responsive">Resposta rápida</option><option value="balanced">Equilíbrio</option><option value="quality">Aceito esperar por qualidade</option></select></label>
        <label>Prioridade<select aria-label="Prioridade do cenário" value={scenario.priority} onChange={(event) => setScenario((current) => ({ ...current, priority: event.target.value as RecommendationScenario["priority"] }))}><option value="quality">Qualidade</option><option value="speed">Velocidade</option><option value="efficiency">Eficiência</option><option value="privacy">Privacidade</option><option value="ease">Facilidade</option><option value="cost">Menor custo</option></select></label>
      </div>
      <ul className="scenario-explanations">{explanations.map((text) => <li key={text}>{text}</li>)}</ul>
      <details className="scenario-saved" open={scenarioToolsOpen} onToggle={(event) => setScenarioToolsOpen(event.currentTarget.open)}>
        <summary>Meus cenários e compartilhamento</summary>
        <p>Guarde até 10 configurações neste navegador. O link compartilhável exclui nome, hardware e perfil.</p>
        <div className="scenario-save-row">
          <label>Nome do cenário<input aria-label="Nome do cenário" maxLength={60} value={scenarioName} onChange={(event) => setScenarioName(event.target.value)}/></label>
          <button type="button" onClick={saveCurrentScenario}>Salvar cenário atual</button>
        </div>
        <div className="scenario-save-row">
          <label>Cenários salvos<select aria-label="Cenários salvos" value={selectedSaved} onChange={(event) => setSelectedSaved(event.target.value)}><option value="">Selecione</option>{savedScenarios.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>
          <button type="button" disabled={!selectedSaved} onClick={openSavedScenario}>Abrir</button>
          <button type="button" disabled={!selectedSaved} onClick={deleteSavedScenario}>Excluir</button>
          <button type="button" onClick={copyShareLink}>Copiar link técnico</button>
        </div>
        <p className="scenario-storage-message" role="status">{scenarioMessage}</p>
      </details>
    </section>
    <p className="scenario-result-count" role="status">{list.length} alternativas para {scenario.label.toLocaleLowerCase("pt-BR")} · objetivo {scenario.objective.toLocaleLowerCase("pt-BR")}</p>
    <div className="recommendation-list">{list.slice(0, 6).map((item, index) => <article key={`${item.mode}-${item.name}`} className="recommendation-card panel">
      <strong className="recommendation-rank">#{index + 1}</strong><div><div className="recommendation-title"><span>{item.mode === "local" ? "IA local" : "API"}</span><h2>{item.name}</h2></div><p>{item.reason}</p>{item.scenarioReasons.map((reason) => <p className="scenario-reason" key={reason}>{reason}</p>)}<p className="recommendation-cost">{item.costNote}</p></div><div className="recommendation-score"><strong>{item.score}/100</strong><Link href={item.mode === "local" ? `/dashboard?model=${seedModels.find((model) => model.name === item.name)?.id ?? seedModels[0].id}` : "/ferramentas"}>{item.mode === "local" ? "Configurar →" : "Ver ferramentas →"}</Link></div>
    </article>)}</div>
    <p className="scenario-disclaimer">Ranking heurístico. Preços de API são demonstrativos e latência de rede não foi medida. Confirme requisitos e preços no provedor.</p>
  </section></div></main>;
}
