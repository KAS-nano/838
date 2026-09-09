"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { seedModels } from "@/data/seed-models";
import { getModelExternalLinks, modelExternalLinks } from "@/data/model-links";
import "../../../preview/model-links.css";

const precisions = [...new Set(Object.values(modelExternalLinks).flatMap((model) => model.variants.map((variant) => variant.quantization)))].sort();

export default function ModelsPage() {
  const [query, setQuery] = useState("");
  const [modality, setModality] = useState("all");
  const [precision, setPrecision] = useState("all");
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const models = useMemo(() => seedModels.filter((model) => {
    const links = getModelExternalLinks(model.id);
    return (modality === "all" || model.modalities.some((item) => item === modality)) &&
      (precision === "all" || links?.variants.some((variant) => variant.quantization === precision)) &&
      `${model.name} ${model.family} ${model.description} ${links?.modelName ?? ""}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery);
  }), [normalizedQuery, modality, precision]);

  return <main><div className="page-container"><section>
    <div className="page-heading">
      <div><p className="eyebrow">Catálogo curado</p><h1 className="page-title">Modelos locais</h1>
        <p className="page-description">Encontre a página oficial e os arquivos de cada versão no Hugging Face. Cada link identifica a quantização ou precisão, o formato e quem publicou o arquivo.</p>
      </div><Link href="/dashboard" className="text-sm text-accent">Dashboard</Link>
    </div>
    <div className="model-catalog-filters">
      <label className="model-search"><Search size={17} aria-hidden="true"/><input aria-label="Buscar modelo" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar modelo, família ou versão..."/></label>
      <label className="field-label">Modalidade<select aria-label="Modalidade" value={modality} onChange={(event) => setModality(event.target.value)} className="control"><option value="all">Todas as modalidades</option><option value="text">Texto</option><option value="vision">Visão</option></select></label>
      <label className="field-label">Quantização / precisão<select aria-label="Quantização dos links" value={precision} onChange={(event) => setPrecision(event.target.value)} className="control"><option value="all">Todas as versões</option>{precisions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
    </div>
    <p className="model-catalog-caption">GGUF: versões para runtimes compatíveis. BF16 e FP16: precisões dos pesos originais, em Safetensors. Os requisitos no analisador continuam sendo dados seeds estimados.</p>
    <p className="mt-4 text-xs text-muted" role="status">{models.length} modelos encontrados{precision !== "all" ? ` com link ${precision}` : ""}</p>
    {models.length === 0 && <div className="panel mt-4 p-6"><p className="text-sm text-muted">Nenhum modelo encontrado com estes filtros.</p><button className="mt-3 text-sm text-accent" onClick={() => { setQuery(""); setModality("all"); setPrecision("all"); }}>Limpar filtros</button></div>}
    <div className="model-catalog-grid">{models.map((model) => {
      const links = getModelExternalLinks(model.id);
      return <article key={model.id} className="panel model-catalog-card">
        <div className="model-card-heading"><div><p className="text-xs text-accent">{model.family}</p><h2 className="mt-1 text-xl font-semibold">{model.name}</h2></div><span className="badge">{model.paramsB}B{model.activeParamsB ? ` · ${model.activeParamsB}B ativos` : ""}</span></div>
        <p className="model-card-description">{model.description}</p>
        <div className="model-card-tags">{model.modalities.map((item) => <span key={item}>{item === "vision" ? "Visão" : item === "text" ? "Texto" : item}</span>)}<span>{model.contextK}K contexto · seed</span></div>
        {links && <section className="model-source-section" aria-label={`Links externos de ${model.name}`}>
          <a href={links.official.url} target="_blank" rel="noopener noreferrer" className="model-official-link" aria-label={`Página oficial de ${links.modelName} no Hugging Face (nova aba)`}>
            <span><strong>Página oficial <span className="model-platform">Hugging Face</span></strong><small>{links.official.publisher} · {links.official.label}</small></span><ExternalLink size={16} aria-hidden="true"/>
          </a>
          <p className="model-artifact-heading">Arquivos por quantização / precisão</p>
          <div className="model-artifact-grid">{links.variants.map((variant) => <a key={variant.url} href={variant.url} target="_blank" rel="noopener noreferrer" className={`model-artifact-link${precision === variant.quantization ? " is-selected" : ""}`} aria-label={`${model.name}: ${variant.quantization} em ${variant.format}, ${variant.community ? "comunidade" : "publicação oficial"}, ${variant.publisher}${variant.split ? ", arquivo em partes" : ""} (nova aba)`}>
            <span className="model-artifact-title"><strong>{variant.quantization}</strong><ExternalLink size={12} aria-hidden="true"/></span>
            <span>{variant.format}{variant.split ? " · em partes" : ""}</span><small>{variant.community ? "Comunidade" : "Oficial"} · {variant.publisher}</small>
          </a>)}</div>
          {links.note && <p className="model-source-note">{links.note}</p>}
          <p className="model-source-verified">Links conferidos em <time dateTime={links.variants[0]?.verifiedAt}>{links.variants[0]?.verifiedAt.split("-").reverse().join("/")}</time>. Acesso sujeito aos termos do publicador.</p>
        </section>}
        <div className="model-card-footer"><span>Requisitos e desempenho estimados</span><Link href={`/dashboard?model=${model.id}`}>Analisar no meu PC →</Link></div>
      </article>;
    })}</div>
  </section></div></main>;
}
