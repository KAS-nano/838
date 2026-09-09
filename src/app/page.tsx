import Link from "next/link";
import { ArrowRight, Cpu, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const capabilities = [
  { icon: Cpu, label: "Comece pela sua máquina", text: "CPU, GPU, VRAM, RAM e sistema operacional entram na análise." },
  { icon: Layers3, label: "Encontre sua configuração", text: "Compare modelos locais, APIs, runtimes e ferramentas para seu objetivo." },
  { icon: ShieldCheck, label: "Entenda antes de instalar", text: "Veja consumo, compatibilidade e desempenho com razões e confiança." },
];

export default function Home() {
  return <main><div className="page-container">
    <section className="hero-grid">
      <div><span className="badge badge-accent"><Sparkles size={13} aria-hidden="true" /> Sua central de inteligência artificial</span><h1 className="hero-title mt-6">A IA certa.<br />Para a <span className="text-accent">sua máquina.</span></h1><p className="mt-6 max-w-xl text-base leading-7 text-muted">Seu hardware, seus objetivos, uma configuração que faz sentido. Descubra o que roda no seu computador, compare alternativas e saiba como começar.</p><div className="mt-8 flex flex-wrap gap-3"><Button size="lg" asChild><Link href="/onboarding">Analisar meu sistema <ArrowRight size={17} /></Link></Button><Button variant="secondary" size="lg" asChild><Link href="/dashboard">Ver demonstração</Link></Button></div><Link href="/explorar" className="mt-5 inline-block text-sm text-muted underline underline-offset-4">Explorar ferramentas sem analisar</Link><p className="mt-7 text-xs text-muted">Perfil local no navegador · Nenhuma instalação automática</p></div>
      <div className="panel p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5"><div><p className="eyebrow">Prévia da análise</p><h2 className="mt-2 font-medium">Modelo × computador</h2></div><span className="badge">Exemplo seed</span></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-lg font-semibold">Qwen3 14B</p><p className="mt-1 text-xs text-muted">Q4_K_M · contexto 8K</p></div><span className="text-xs text-muted">16 GB VRAM · 32 GB RAM</span></div><div className="mt-6 space-y-5">{[["VRAM estimada", "10,2 / 16 GB", 64], ["RAM estimada", "7,4 / 32 GB", 23], ["Armazenamento", "11,3 / 256 GB livres", 5]].map(([label, value, percent]) => <div key={label}><div className="mb-2 flex justify-between gap-2 text-xs"><span className="text-muted">{label}</span><span>{value}</span></div><progress className="meter" max={100} value={Number(percent)} aria-label={String(label)} /></div>)}</div><div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-5"><div><p className="text-xs text-muted">Faixa de geração ilustrativa</p><p className="mt-2 text-3xl font-semibold text-accent">32–41 <span className="text-sm font-normal">t/s</span></p></div><span className="badge">Confiança baixa</span></div><p className="mt-5 text-xs leading-5 text-muted">Valores seed para demonstrar a interface. A análise do seu hardware recalcula memória, compatibilidade e desempenho estimado.</p></div>
    </section>
    <section className="grid gap-5 border-t border-white/10 pt-8 md:grid-cols-3">{capabilities.map(({ icon: Icon, label, text }, i) => <article key={label} className="panel p-6"><div className="flex items-center justify-between"><Icon size={20} className="text-accent" aria-hidden="true" /><span className="text-xs text-muted">0{i + 1}</span></div><h2 className="mt-5 font-medium">{label}</h2><p className="mt-3 text-sm leading-6 text-muted">{text}</p></article>)}</section>
  </div></main>;
}
