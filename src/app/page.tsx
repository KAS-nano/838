import Link from "next/link";
import type { Metadata } from "next";
import "../../preview/home.css";

export const metadata: Metadata = {
  title: "A IA certa para sua máquina",
  description: "Compare modelos de IA pelo seu hardware, entenda memória e compatibilidade e prepare sua configuração com o 838.",
};
import { ArrowRight, Cpu, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const capabilities = [
  { icon: Cpu, label: "Comece pela sua máquina", text: "CPU, GPU, VRAM, RAM e sistema operacional entram na análise." },
  { icon: Layers3, label: "Encontre sua configuração", text: "Compare modelos locais, APIs, runtimes e ferramentas para seu objetivo." },
  { icon: ShieldCheck, label: "Entenda antes de instalar", text: "Veja consumo, compatibilidade e desempenho com razões e confiança." },
];

export default function Home() {
  return <main><div className="page-container product-home">
    <section className="hero-grid product-hero" aria-label="Escolha sua configuração de IA">
      <div><span className="badge badge-accent"><Sparkles size={13} aria-hidden="true" /> Decida antes de baixar</span><h1 className="hero-title mt-6">A IA certa.<br />Para a <span className="text-accent">sua máquina.</span></h1><p className="mt-6 max-w-xl text-base leading-7 text-muted">Do primeiro modelo à configuração que faz sentido. Cruze seu hardware com o que você quer fazer e entenda memória, compatibilidade e limites antes de baixar.</p><div className="mt-8 flex flex-wrap gap-3"><Button size="lg" asChild><Link href="/onboarding">Analisar meu sistema <ArrowRight size={17} /></Link></Button><Button variant="secondary" size="lg" asChild><Link href="/dashboard">Ver demonstração</Link></Button></div><Link href="/explorar" className="mt-5 inline-block text-sm text-muted underline underline-offset-4">Explorar ferramentas sem analisar</Link><p className="mt-7 text-xs text-muted">Sem conta para começar · Perfil local · Você controla a instalação</p></div>
      <div className="panel p-5 sm:p-7 product-example"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5"><div><p className="eyebrow">Como você vai decidir</p><h2 className="mt-2 font-medium">Modelo × computador</h2></div><span className="badge">Exemplo seed</span></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-lg font-semibold">Qwen3 14B</p><p className="mt-1 text-xs text-muted">Q4_K_M · contexto 8K</p></div><span className="text-xs text-muted">16 GB VRAM · 32 GB RAM</span></div><div className="mt-6 space-y-5">{[["VRAM estimada", "10,2 / 16 GB", 64], ["RAM estimada", "7,4 / 32 GB", 23], ["Armazenamento", "11,3 / 256 GB livres", 5]].map(([label, value, percent]) => <div key={label}><div className="mb-2 flex justify-between gap-2 text-xs"><span className="text-muted">{label}</span><span>{value}</span></div><progress className="meter" max={100} value={Number(percent)} aria-label={String(label)} /></div>)}</div><div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-5"><div><p className="text-xs text-muted">Faixa de geração ilustrativa</p><p className="mt-2 text-3xl font-semibold text-accent">32–41 <span className="text-sm font-normal">t/s</span></p></div><span className="badge">Confiança baixa</span></div><p className="mt-5 text-xs leading-5 text-muted">Valores seed para demonstrar a interface. A análise do seu hardware recalcula memória, compatibilidade e desempenho estimado.</p></div>
    </section>
    <section className="product-steps" aria-label="Como funciona">{capabilities.map(({ icon: Icon, label, text }, i) => <article key={label} className="panel p-6"><div className="flex items-center justify-between"><Icon size={20} className="text-accent" aria-hidden="true" /><span className="text-xs text-muted">0{i + 1}</span></div><h2 className="mt-5 font-medium">{label}</h2><p className="mt-3 text-sm leading-6 text-muted">{text}</p></article>)}</section>
      <section className="product-section" aria-labelledby="start-title">
      <div className="product-section-heading"><div><p className="eyebrow">Seu próximo passo</p><h2 id="start-title">Em que ponto você está?</h2></div><p>Comece pelo que precisa resolver agora.</p></div>
      <div className="product-paths">
        <Link href="/onboarding" className="product-path product-path-primary"><span className="product-path-number">01 / DESCOBRIR</span><h3>O que roda no meu PC?</h3><p>Informe seu hardware e objetivo para obter uma análise de compatibilidade.</p><span className="product-path-action">Configurar minha máquina <span aria-hidden="true">↗</span></span></Link>
        <Link href="/modelos" className="product-path"><span className="product-path-number">02 / EXPLORAR</span><h3>Já tenho um modelo em mente</h3><p>Encontre variantes, quantizações e links para os arquivos na origem.</p><span className="product-path-action">Abrir catálogo <span aria-hidden="true">↗</span></span></Link>
        <Link href="/comparar" className="product-path"><span className="product-path-number">03 / COMPARAR</span><h3>Quero escolher entre opções</h3><p>Veja diferenças de memória, contexto e desempenho estimado lado a lado.</p><span className="product-path-action">Comparar modelos <span aria-hidden="true">↗</span></span></Link>
      </div>
    </section>
    <section className="product-trust product-section" aria-labelledby="trust-title">
      <div><p className="eyebrow">Decisões com contexto</p><h2 id="trust-title">Uma estimativa útil mostra seus limites.</h2><p>O resultado depende de quantização, contexto, runtime e hardware. O 838 apresenta a origem e a confiança dos dados para você avaliar cada recomendação.</p></div>
      <dl><div><dt>Estimativa</dt><dd>Calculada pelo motor. Ajuda a planejar; não é uma medição da sua máquina.</dd></div><div><dt>Demonstração</dt><dd>Usa um perfil de exemplo e dados seed para você conhecer a interface.</dd></div><div><dt>Medição local</dt><dd>Exige um runtime compatível e uma ação sua para iniciar o benchmark.</dd></div></dl>
    </section>
    <section className="product-section product-faq" aria-labelledby="faq-title">
      <div className="product-section-heading"><div><p className="eyebrow">Antes de começar</p><h2 id="faq-title">O essencial, sem complicar.</h2></div></div>
      <details><summary>Preciso instalar algo para usar o 838?</summary><p>Para explorar o catálogo e analisar seu perfil, basta o navegador. Executar um modelo ou medir desempenho exige um runtime instalado separadamente.</p></details>
      <details><summary>O site detecta meu computador automaticamente?</summary><p>O fluxo inicial pede que você informe o hardware. A detecção local depende do agente separado; abrir o site não dá acesso automático à sua máquina.</p></details>
      <details><summary>Uma boa estimativa garante o mesmo desempenho?</summary><p>Não. Drivers, temperatura, contexto e runtime podem mudar o resultado. Use a análise para escolher o que testar e confirme com uma medição local.</p></details>
    </section>
    <footer className="product-footer"><span>838 · Hardware, objetivo e uma escolha informada.</span><Link href="/explorar">Conhecer o ecossistema <span aria-hidden="true">→</span></Link></footer>
  </div></main>;
}
