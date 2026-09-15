import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Cpu, Layers3, ShieldCheck } from "lucide-react";
import "../../preview/home.css";

export const metadata: Metadata = {
  title: "A IA certa para sua máquina",
  description: "Compare modelos de IA pelo seu hardware, entenda memória e compatibilidade e prepare sua configuração com o 838.",
};

const capabilities = [
  { icon: Cpu, label: "Comece pela sua máquina", text: "CPU, GPU, VRAM, RAM e sistema operacional entram na análise." },
  { icon: Layers3, label: "Encontre sua configuração", text: "Compare modelos locais, APIs, runtimes e ferramentas para seu objetivo." },
  { icon: ShieldCheck, label: "Entenda antes de instalar", text: "Veja consumo, compatibilidade e desempenho com razões e confiança." },
];

export default function Home() {
  return <main><div className="page-container product-home">
    <section className="product-hero" aria-label="Escolha sua configuração de IA">
      <div className="product-intro">
        <span className="product-kicker"><span aria-hidden="true" /> HARDWARE + OBJETIVO + IA</span>
        <h1>A IA certa.<br />Para a <span>sua máquina.</span></h1>
        <p>Descubra o que roda no seu computador.<br className="product-desktop-break" /> Compare modelos e encontre uma configuração que faz sentido.</p>
        <div className="product-hero-actions">
          <Link className="product-cta" href="/onboarding">Analisar meu sistema <ArrowRight size={17} aria-hidden="true" /></Link>
          <Link className="product-cta-secondary" href="/dashboard">Ver demonstração <span aria-hidden="true">↗</span></Link>
        </div>
        <p className="product-assurance">Sem conta para começar <span aria-hidden="true">·</span> Seu perfil fica no navegador</p>
      </div>
      <div className="product-console">
        <div className="product-console-bar"><span><span className="product-console-dot" aria-hidden="true" /> PRÉVIA DA ANÁLISE</span><span className="product-demo-label">Exemplo seed</span></div>
        <div className="product-console-body">
          <div className="product-machine">
            <span className="product-small-label">01 / COMPUTADOR DE EXEMPLO</span>
            <h2>O ponto de partida<br />é o seu hardware.</h2>
            <div className="product-hardware-specs"><span><strong>16 GB</strong> VRAM</span><span><strong>32 GB</strong> RAM</span></div>
            <p>O contexto e a quantização alteram o consumo. A análise ajuda você a entender essa diferença.</p>
          </div>
          <div className="product-model-preview">
            <div className="product-model-heading"><div><span className="product-small-label">02 / MODELO × COMPUTADOR</span><h3>Qwen3 14B</h3></div><span className="product-quant">Q4_K_M · contexto 8K</span></div>
            <div className="product-metric-grid">
              <div className="product-metric"><span>VRAM estimada</span><strong>10,2 <small>GB</small></strong><progress max="100" value="64" aria-label="VRAM estimada" /><span>10,2 / 16 GB</span></div>
              <div className="product-metric"><span>RAM estimada</span><strong>7,4 <small>GB</small></strong><progress max="100" value="23" aria-label="RAM estimada" /><span>7,4 / 32 GB</span></div>
              <div className="product-metric"><span>Armazenamento</span><strong>11,3 <small>GB</small></strong><progress max="100" value="5" aria-label="Armazenamento" /><span>11,3 / 256 GB livres</span></div>
            </div>
            <div className="product-speed"><div><span>Faixa de geração ilustrativa</span><strong>32–41 <small>t/s</small></strong></div><span className="product-confidence">Confiança baixa</span></div>
          </div>
        </div>
        <p className="product-console-note">Exemplo ilustrativo, não uma medição. Seu perfil recalcula memória, compatibilidade e desempenho estimado.</p>
      </div>
      <Link href="/explorar" className="product-explore">Explorar ferramentas sem analisar <span aria-hidden="true">→</span></Link>
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
