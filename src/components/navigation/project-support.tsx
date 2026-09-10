"use client";

import Image from "next/image";
import { Heart, ChevronDown, Copy } from "lucide-react";
import { useRef, useState } from "react";
import { projectSupport } from "@/data/project-support";
import { supportPayment } from "@/data/support-payment";

export function ProjectSupport() {
  const [status, setStatus] = useState("");
  const keyInput = useRef<HTMLInputElement>(null);
  const codeInput = useRef<HTMLTextAreaElement>(null);
  const codeDetails = useRef<HTMLDetailsElement>(null);

  async function copy(kind: "key" | "code") {
    try {
      await navigator.clipboard.writeText(kind === "key" ? supportPayment.key : supportPayment.payload);
      setStatus(kind === "key" ? "Chave Pix copiada." : "Código Pix copiado.");
    } catch {
      if (kind === "code" && codeDetails.current) codeDetails.current.open = true;
      const input = kind === "key" ? keyInput.current : codeInput.current;
      input?.focus();
      input?.select();
      setStatus("Não foi possível copiar automaticamente. Copie manualmente o texto selecionado.");
    }
  }

  return <details className="project-support">
    <summary className="project-support-summary"><Heart size={15} aria-hidden="true" /><span>{projectSupport.title}</span><ChevronDown className="project-support-chevron" size={14} aria-hidden="true" /></summary>
    <div className="project-support-content">
      <p className="project-support-message">{projectSupport.message}</p>
      <figure className="project-support-qr">
        <Image unoptimized src={supportPayment.qrDataUrl} width={424} height={424} alt={`QR Code Pix para ${supportPayment.recipientName}, com valor livre`} />
        <figcaption>Pix · você escolhe o valor</figcaption>
      </figure>
      <p className="project-support-recipient"><span>Recebedor</span><strong>{supportPayment.recipientName}</strong><span>São Paulo · SP</span></p>
      <label className="project-support-label">Chave Pix · aleatória<input ref={keyInput} className="project-support-key" aria-label="Chave Pix" readOnly value={supportPayment.key} spellCheck={false} onFocus={event => event.target.select()} /></label>
      <div className="project-support-actions">
        <button type="button" onClick={() => copy("key")}><Copy size={13} aria-hidden="true" />Copiar chave Pix</button>
        <button type="button" onClick={() => copy("code")}><Copy size={13} aria-hidden="true" />Copiar Pix Copia e Cola</button>
      </div>
      <details ref={codeDetails} className="project-support-code"><summary>Ver Pix Copia e Cola</summary><label className="project-support-label">Pix Copia e Cola<textarea ref={codeInput} aria-label="Pix Copia e Cola" readOnly rows={4} value={supportPayment.payload} spellCheck={false} onFocus={event => event.target.select()} /></label></details>
      <p className="project-support-status" role="status" aria-live="polite">{status}</p>
    </div>
  </details>;
}
