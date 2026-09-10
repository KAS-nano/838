import { projectSupport, supportPayment } from "./engine.mjs";

const heart = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
const chevron = '<svg class="project-support-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

export function initProjectSupport() {
  const container = document.getElementById("project-support");
  if (!container || container.dataset.initialized) return;
  container.dataset.initialized = "true";
  // Only fixed markup is inserted. Public configuration is assigned as text/value.
  container.innerHTML = `<details class="project-support">
    <summary class="project-support-summary">${heart}<span data-support-title></span>${chevron}</summary>
    <div class="project-support-content">
      <p class="project-support-message"></p>
      <figure class="project-support-qr"><img width="424" height="424" /><figcaption>Pix · você escolhe o valor</figcaption></figure>
      <p class="project-support-recipient"><span>Recebedor</span><strong></strong><span>São Paulo · SP</span></p>
      <label class="project-support-label">Chave Pix · aleatória<input class="project-support-key" aria-label="Chave Pix" readonly spellcheck="false" /></label>
      <div class="project-support-actions"><button type="button" data-copy="key">Copiar chave Pix</button><button type="button" data-copy="code">Copiar Pix Copia e Cola</button></div>
      <details class="project-support-code"><summary>Ver Pix Copia e Cola</summary><label class="project-support-label">Pix Copia e Cola<textarea aria-label="Pix Copia e Cola" readonly rows="4" spellcheck="false"></textarea></label></details>
      <p class="project-support-status" role="status" aria-live="polite"></p>
    </div>
  </details>`;
  container.querySelector("[data-support-title]").textContent = projectSupport.title;
  container.querySelector(".project-support-message").textContent = projectSupport.message;
  container.querySelector(".project-support-recipient strong").textContent = supportPayment.recipientName;
  const qr = container.querySelector("img");
  qr.src = supportPayment.qrDataUrl;
  qr.alt = `QR Code Pix para ${supportPayment.recipientName}, com valor livre`;
  const key = container.querySelector("input");
  const code = container.querySelector("textarea");
  key.value = supportPayment.key;
  code.value = supportPayment.payload;
  [key, code].forEach(input => input.addEventListener("focus", () => input.select()));
  container.querySelectorAll("[data-copy]").forEach(button => button.addEventListener("click", async () => {
    const isKey = button.dataset.copy === "key";
    const status = container.querySelector(".project-support-status");
    try {
      await navigator.clipboard.writeText(isKey ? supportPayment.key : supportPayment.payload);
      status.textContent = isKey ? "Chave Pix copiada." : "Código Pix copiado.";
    } catch {
      if (!isKey) container.querySelector(".project-support-code").open = true;
      const input = isKey ? key : code;
      input.focus();
      input.select();
      status.textContent = "Não foi possível copiar automaticamente. Copie manualmente o texto selecionado.";
    }
  }));
}
