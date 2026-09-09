"use client";

import Link from "next/link";
import { ProjectSupport } from "./project-support";
import { useHardwareProfile } from "@/features/profile/use-hardware-profile";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Activity, AppWindow, Boxes, BrainCircuit, Cpu, Download, Gauge, Home, Laptop, Menu, Scale, Settings2, Wrench, X } from "lucide-react";

const groups = [
  { label: "Visão geral", items: [["Visão geral", "/dashboard", Gauge]] },
  { label: "IA", items: [["Modelos", "/modelos", BrainCircuit], ["Recomendações", "/recomendacoes", Activity], ["Comparar", "/comparar", Scale]] },
  { label: "Ecossistema", items: [["Ferramentas", "/ferramentas", Wrench]] },
  { label: "Hardware", items: [["Força do PC", "/hardware/forca", Cpu], ["Upgrades", "/hardware/upgrades", Settings2], ["Sistemas", "/sistemas", Laptop]] },
  { label: "Configuração", items: [["Instalação", "/instalar", Download], ["Benchmark", "/benchmark", AppWindow], ["Comunidade", "/benchmarks/comunidade", Boxes], ["Perfil", "/perfil", Home]] },
] as const;
const rainNames = ["Qwen3", "Qwen3 1.7B", "Qwen3 4B", "Qwen3 8B", "Qwen3 14B", "Qwen3 32B", "Qwen3 Coder", "Gemma 3", "Gemma 3 4B", "Gemma 3 12B", "Gemma 3 27B", "Mistral", "Mistral Small", "Ministral", "Phi-4", "DeepSeek R1", "Llama 3", "Granite", "Command-R", "Nemotron", "Ollama", "LM Studio", "llama.cpp", "OpenRouter"];

function ModelRain() {
  return <div className="llm-rain" aria-hidden="true">{[...rainNames, ...rainNames].map((name, i) => <span key={i} style={{
    "--rain-x": `${((i * 61.803 + 7.2) % 96).toFixed(2)}%`,
    "--rain-y": `${((i * 37.719 + 9) % 100).toFixed(2)}%`,
    "--rain-delay": `${-((i * 7.31) % 53).toFixed(2)}s`,
    "--rain-duration": `${38 + (i * 13 % 37)}s`,
    "--rain-opacity": .08 + (i % 6) * .014,
    "--rain-size": `${11 + (i * 7 % 9)}px`,
  } as CSSProperties}>{name}</span>)}</div>;
}

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {isDemo,loaded} = useHardwareProfile();
  const bare = pathname === "/" || pathname.startsWith("/onboarding");
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebar.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); }
      if (event.key === "Tab") {
        const links = [...(sidebar.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), summary, input:not([disabled]), textarea:not([disabled]), [tabindex="0"]') ?? [])].filter(element => element.getClientRects().length > 0 && !element.closest('details:not([open]) > :not(summary)'));
        const first = links?.[0], last = links?.[links.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); menuButton.current?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); menuButton.current?.focus(); }
        else if (document.activeElement === menuButton.current) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
      }
    };
    const onResize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKey); window.removeEventListener("resize", onResize); };
  }, [open]);
  return <div className="site-frame">
    <ModelRain />
    <header className="site-header">
      <div>{!bare && <button ref={menuButton} className="menu-toggle" type="button" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>{open ? <X size={19} /> : <Menu size={19} />}<span>Menu</span></button>}<span className="header-caption">IA certa. Hardware certo.</span></div>
      <Link href="/" className="site-logo" aria-label="838 — Início" onClick={() => setOpen(false)}>838</Link>
      <Link href={bare ? (pathname === "/" ? "/explorar" : "/dashboard") : "/onboarding"} className="header-action" onClick={() => setOpen(false)}>{bare ? (pathname === "/" ? "Explorar →" : "Dashboard →") : "Meu hardware →"}</Link>
    </header>
    {!bare && <>
      {open && <button className="menu-backdrop" aria-label="Fechar navegação" onClick={() => { setOpen(false); menuButton.current?.focus(); }} />}
      <aside ref={sidebar} className={`site-sidebar${open ? " is-open" : ""}`}>
        <nav id="site-navigation" aria-label="Navegação principal">{groups.map(group => <div className="nav-group" key={group.label}><p className="nav-heading">{group.label}</p>{group.items.map(([label, href, Icon]) => <Link key={href} href={href} className="nav-link" aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}><Icon size={17} aria-hidden="true" /><span>{label}</span></Link>)}</div>)}</nav>
        <p className="sidebar-note">Hardware + objetivo + IA.<br />Estimativas com origem e confiança.</p>
        <ProjectSupport />
      </aside>
    </>}
    <div className={`site-content${bare ? "" : " with-sidebar"}`} inert={open || undefined}>{!bare && loaded && isDemo && pathname !== "/dashboard" && pathname !== "/perfil" && <div className="demo-notice">Máquina de demonstração · <Link href="/onboarding">Informe seu hardware para personalizar as análises →</Link></div>}{children}</div>
  </div>;
}
