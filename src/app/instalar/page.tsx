"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useHardwareProfile } from "@/features/profile/use-hardware-profile";
import { tools } from "@/data/tools";
import { recipeFor, recipesForTool } from "@/features/installation/recipes";

const installableTools = tools.filter((tool) => recipesForTool(tool.slug).length > 0);

export default function InstallPage() {
  const { profile, isDemo } = useHardwareProfile();
  const [tool, setTool] = useState("ollama");
  const [model, setModel] = useState("");
  const [copied, setCopied] = useState("");
  const recipe = useMemo(() => recipeFor(tool, profile), [tool, profile]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const requestedTool = params.get("tool");
      const requestedModel = params.get("model");
      if (requestedTool && installableTools.some((item) => item.slug === requestedTool)) setTool(requestedTool);
      if (requestedModel) setModel(requestedModel);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const copy = async (command: string) => {
    try {
      if (!navigator.clipboard) throw new Error();
      await navigator.clipboard.writeText(command);
      setCopied(command);
      setTimeout(() => setCopied(""), 1200);
    } catch {
      setCopied("error");
    }
  };

  return <main><div className="page-container"><section>
    <div className="page-heading"><div><p className="text-xs uppercase tracking-[.2em] text-accent">Central de Instalação</p><h1 className="page-title">Instale com ou sem perfil</h1><p className="mt-3 text-sm text-muted">{isDemo ? "Nenhum perfil salvo: exibindo uma receita genérica para Windows." : `Perfil: ${profile.os}${profile.os === "linux" && profile.distro ? ` · ${profile.distro}` : ""} · ${profile.gpu}`}</p></div><Link href="/sistemas" className="text-sm text-accent">Sistemas</Link></div>
    {model && <p className="mt-4 text-sm text-muted">Modelo selecionado: <strong>{model}</strong>. A receita instala o runtime; o download do modelo deve ser confirmado pelo usuário dentro dele.</p>}
    {copied === "error" && <p role="alert" className="mt-4 text-sm text-amber-200">Não foi possível copiar. Selecione o comando e copie manualmente.</p>}
    <div className="mt-6 flex flex-wrap gap-2">{installableTools.map((item) => <button key={item.slug} type="button" onClick={() => setTool(item.slug)} className={`rounded-xl border px-4 py-2 text-sm ${tool === item.slug ? "border-accent/40 bg-accent/10" : "border-white/10"}`}>{item.name}</button>)}</div>
    {recipe ? <article className="mt-6 panel p-5 sm:p-7"><div className="flex flex-col justify-between gap-2 sm:flex-row"><div><h2 className="text-2xl font-semibold">{recipe.label}</h2><p className="mt-1 text-sm text-muted">Método: {recipe.method}</p></div><span className="text-xs text-muted">Verificado em {recipe.lastVerified}</span></div><div className="mt-6"><h3 className="font-semibold">Requisitos</h3><ul className="mt-2 space-y-1 text-sm text-muted">{recipe.requirements.map((item) => <li key={item}>• {item}</li>)}</ul></div><div className="mt-7 space-y-3"><h3 className="font-semibold">Instalação</h3>{recipe.steps.map((step, index) => <div key={`${index}-${step.title}`} className="rounded-2xl border border-white/10 bg-black/20 p-4"><strong className="text-sm">{index + 1}. {step.title}</strong>{step.note && <p className="mt-2 text-xs leading-5 text-muted">{step.note}</p>}{step.command && <div className="mt-3 flex flex-wrap items-center gap-3"><code className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-black/30 p-3 text-xs text-accent">{step.command}</code><button type="button" className="text-xs text-accent" onClick={() => { void copy(step.command!); }}>Copiar</button></div>}</div>)}</div><div className="mt-7"><h3 className="font-semibold">Verificação</h3><ul className="mt-2 space-y-2 text-sm text-muted">{recipe.verify.map((step) => <li key={step.title}><strong>{step.title}:</strong> {step.command ? <code>{step.command}</code> : step.note}</li>)}</ul></div><a className="mt-7 inline-block text-sm text-accent" href={recipe.officialSource} target="_blank" rel="noopener noreferrer">Abrir fonte oficial ↗</a></article> : <div className="mt-6 panel p-6"><p className="text-sm text-muted">Ainda não há receita para este sistema. Consulte a fonte oficial da ferramenta.</p></div>}
    <p className="mt-5 text-xs text-muted">A instalação nunca é executada automaticamente. Revise comandos, permissões e origem antes de rodar qualquer etapa.</p>
  </section></div></main>;
}
