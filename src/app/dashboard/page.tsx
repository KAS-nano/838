"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Cpu, ArrowRight } from "lucide-react";
import { SpeedGauge } from "@/components/gauges/speed-gauge";
import { Button } from "@/components/ui/button";
import { seedModels } from "@/data/seed-models";
import { seedBenchmarks } from "@/features/benchmarks/data";
import { estimatePerformance } from "@/features/benchmarks/estimator";
import { estimateMemory } from "@/features/estimation/memory";
import { calculateCompatibility } from "@/features/recommendation/engine";
import { useHardwareProfile } from "@/features/profile/use-hardware-profile";

function Dashboard() {
  const { profile, isDemo } = useHardwareProfile();
  const params = useSearchParams();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [quant, setQuant] = useState("Q4_K_M");
  const [requestedContext, setContext] = useState(8);
  const modelId = selectedModel ?? params.get("model") ?? seedModels[0].id;
  const model = seedModels.find(m => m.id === modelId) ?? seedModels[0];
  const variant = model.variants.find(v => v.quantization === quant) ?? model.variants[0];
  const contextK = Math.min(requestedContext, model.contextK);
  const memory = useMemo(() => estimateMemory(profile, model, variant, contextK), [profile, model, variant, contextK]);
  const perf = useMemo(() => estimatePerformance(profile, model, variant, contextK, seedBenchmarks), [profile, model, variant, contextK]);
  const compat = useMemo(() => calculateCompatibility(profile, model, variant, profile.objectives[0], contextK), [profile, model, variant, contextK]);
  const confidenceLabel = { high: "Alta", medium: "Média", low: "Baixa" }[perf.confidence];
  const dataLabel = { measured: "Medido", estimated: "Estimado", seed: "Seed", heuristic: "Heurística" }[perf.dataState];
  return <main><div className="page-container space-y-6">
    <div className="page-heading"><div><p className="eyebrow">Visão geral / Análise de compatibilidade</p><h1 className="page-title">Modelo × sua máquina</h1><p className="page-description">Configure sua IA e entenda os limites antes de instalar.</p></div><span className="badge badge-accent">{isDemo ? "Hardware de demonstração" : "Perfil local ativo"}</span></div>
    <section className="panel hardware-summary" aria-label="Hardware atual">
      <div><div className="flex items-center gap-2"><Cpu size={17} className="text-accent" /><h2 className="panel-title">{isDemo ? "Máquina de exemplo" : "Seu hardware"}</h2></div><p className="mt-3 text-sm text-ink">{profile.cpu}</p><p className="mt-1 text-xs text-muted">{profile.gpu}</p><Link href="/onboarding" className="mt-4 inline-block text-xs text-accent">{isDemo ? "Informar meu hardware" : "Editar hardware"} →</Link></div>
      <dl><div><dt>VRAM</dt><dd>{profile.vramGb} GB</dd></div><div><dt>RAM</dt><dd>{profile.ramGb} GB</dd></div><div><dt>Armazenamento</dt><dd>{profile.storageTotalGb} GB</dd></div><div><dt>Espaço livre</dt><dd>{profile.storageFreeGb} GB</dd></div></dl>
      <dl><div><dt>Sistema</dt><dd>{profile.os === "macos" ? "macOS" : profile.os === "windows" ? "Windows" : "Linux"}{profile.os === "linux" ? ` / ${profile.distro}` : ""}</dd></div><div><dt>Máquina</dt><dd>{profile.deviceType === "desktop" ? "Desktop" : "Notebook"}</dd></div><div className="col-span-2"><dt>Objetivos</dt><dd>{profile.objectives.join(" · ")}</dd></div></dl>
    </section>
    <section className="panel dashboard-controls" aria-label="Configuração do modelo">
      <label className="field-label">Modelo<select aria-label="Modelo" value={model.id} onChange={e => { setSelectedModel(e.target.value); const next = seedModels.find(m => m.id === e.target.value); if (next) setContext(Math.min(contextK, next.contextK)); }} className="control">{seedModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
      <label className="field-label">Quantização<select aria-label="Quantização" value={variant.quantization} onChange={e => setQuant(e.target.value)} className="control">{model.variants.map(v => <option key={v.quantization}>{v.quantization}</option>)}</select></label>
      <label className="field-label"><span className="flex justify-between">Contexto<strong className="text-accent">{contextK}K</strong></span><input aria-label="Contexto" type="range" min="1" max={model.contextK} value={contextK} onChange={e => setContext(Number(e.target.value))} className="mt-6 w-full" /><span className="mt-1 block text-[10px]">Mais contexto exige mais memória.</span></label>
    </section>
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="panel-title">Consumo e desempenho</h2><span className="text-xs text-muted">{variant.quantization} · {contextK}K contexto · requisitos seed / estimados</span></div>
    <section className="gauge-grid">
      <SpeedGauge label="VRAM estimada" value={memory.vramGb} max={profile.vramGb} unit="GB" description={`${memory.gpuLayersPercent}% dos pesos na GPU · KV ${memory.kvCacheGb} GB`} />
      <SpeedGauge label="RAM estimada" value={memory.ramGb} max={profile.ramGb} unit="GB" description={memory.gpuLayersPercent < 100 ? "Inclui offload e reserva do sistema" : "Runtime, buffers e reserva do sistema"} />
      <SpeedGauge label="Armazenamento" value={memory.diskGb} max={profile.storageFreeGb} unit="GB" description="Modelo + runtime/cache · capacidade livre" />
      <SpeedGauge label="Geração" value={perf.center} max={Math.max(60, perf.high * 1.25)} unit="t/s" displayValue={`${perf.low}–${perf.high} t/s`} description={`${dataLabel} · confiança ${confidenceLabel.toLowerCase()}`} kind="performance" />
    </section>
    <section className="analysis-grid">
      <article className="panel p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Compatibilidade estimada</p><h2 className="mt-2 text-4xl font-semibold">{compat.score}<span className="text-lg text-muted">/100</span></h2></div><span className={`badge ${compat.fit === "gpu" ? "badge-accent" : compat.fit === "offload" ? "text-amber-200" : "text-rose-300"}`}>{compat.fit === "gpu" ? "Cabe na GPU" : compat.fit === "offload" ? "Offload necessário" : "Incompatível"}</span></div><progress className="meter mt-5" value={compat.score} max={100} aria-label="Compatibilidade estimada" /><ul className="mt-5 list-disc space-y-2 pl-4 text-sm leading-6 text-muted">{[...compat.reasons, ...memory.notes].map((reason, i) => <li key={i}>{reason}</li>)}</ul></article>
      <article className="panel p-6"><p className="eyebrow">Origem e confiança</p><div className="mt-3 flex items-center gap-3"><h2 className="text-xl font-medium">Confiança {confidenceLabel.toLowerCase()}</h2><span className="badge">{dataLabel}</span></div><p className="mt-4 text-sm leading-6 text-muted">{perf.note}</p><dl className="mt-5 grid grid-cols-2 gap-4 border-y border-white/10 py-4 text-sm"><div><dt className="text-xs text-muted">Evidências medidas</dt><dd className="mt-2">{perf.evidence}</dd></div><div><dt className="text-xs text-muted">Backend provável</dt><dd className="mt-2">{compat.backend}</dd></div></dl><p className="mt-4 text-xs leading-5 text-muted">Memória e compatibilidade são estimativas. As faixas seed não representam um benchmark real do seu computador.</p></article>
    </section>
    <section className="flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-6"><div><h2 className="panel-title">Da análise à instalação</h2><p className="mt-2 text-xs text-muted">Veja alternativas, compare configurações e prepare o runtime.</p></div><div className="flex flex-wrap gap-3"><Button asChild variant="secondary"><Link href="/recomendacoes">Recomendações</Link></Button><Button asChild variant="secondary"><Link href="/comparar">Comparar</Link></Button><Button asChild><Link href="/instalar">Configurar e instalar <ArrowRight size={15} /></Link></Button></div></section>
  </div></main>;
}

export default function DashboardPage() {
  return <Suspense fallback={<main className="page-container">Preparando análise…</main>}><Dashboard /></Suspense>;
}
