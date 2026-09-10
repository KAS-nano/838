"use client";
import { useState } from "react";

export default function CommunityBenchmarksPage() {
  const [consent, setConsent] = useState(false);
  return <main>
    <div className="page-container space-y-8">
      <div><p className="text-xs uppercase tracking-[.25em] text-accent">838 / Benchmarks</p><h1 className="page-title">Benchmarks comunitários</h1><p className="mt-3 text-muted">Contribuições são opcionais e entram em revisão antes de influenciar estimativas.</p></div>
      <section className="panel p-6 space-y-4">
        <h2 className="text-xl font-medium">O que pode ser enviado</h2>
        <ul className="grid gap-2 text-ink sm:grid-cols-2"><li>GPU, CPU e memória</li><li>Sistema e versão do driver</li><li>Modelo, arquivo e quantização</li><li>Runtime, versão e backend</li><li>Contexto, tokens e três ou mais amostras</li><li>Mediana, quartis e picos de memória</li></ul>
        <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 text-sm text-accent">O 838 não inclui hostname, usuário, e-mail, arquivos, prompts pessoais ou endereço IP no payload de benchmark.</div>
        <p className="text-sm leading-6 text-muted">O protocolo v2 usa uma frase pública padronizada e assinatura Ed25519 do agente. A assinatura confirma a integridade e a continuidade da instalação; o resultado ainda passa por revisão e análise de anomalias antes de influenciar estimativas.</p>
        <label className="flex items-start gap-3 rounded-2xl border border-white/10 p-4"><input type="checkbox" className="mt-1" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span><strong>Consentimento</strong><br/><span className="text-sm text-muted">Autorizo o envio voluntário dos dados técnicos descritos acima.</span></span></label>
        <button disabled aria-describedby="community-status" className="rounded-xl bg-accent px-5 py-3 font-semibold text-noir disabled:opacity-40">Envio pelo agente — disponível quando conectado</button>
        <p id="community-status" role="status" className="text-xs text-muted">{consent ? "Consentimento registrado nesta tela. O envio aguarda conexão com o agente." : "Conecte um agente compatível para disponibilizar o envio."}</p>
      </section>
    </div>
  </main>
}
