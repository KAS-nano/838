import { getModelExternalLinks } from './engine.mjs';
import { escapeHtml as html } from './shared.mjs';

const arrow = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6"/></svg>';

export function renderModelLinks(modelId, precision = 'all') {
  const links = getModelExternalLinks(modelId);
  if (!links) return '';
  const verified = links.variants[0]?.verifiedAt || '';
  return `<section class="model-source-section" aria-label="Links externos de ${html(links.modelName)}">
    <a class="model-official-link" href="${html(links.official.url)}" target="_blank" rel="noopener noreferrer" aria-label="Página oficial de ${html(links.modelName)} no Hugging Face (nova aba)"><span><strong>Página oficial <span class="model-platform">Hugging Face</span></strong><small>${html(links.official.publisher)} · ${html(links.official.label)}</small></span>${arrow}</a>
    <p class="model-artifact-heading">Arquivos por quantização / precisão</p>
    <div class="model-artifact-grid">${links.variants.map(variant => `<a class="model-artifact-link${precision === variant.quantization ? ' is-selected' : ''}" href="${html(variant.url)}" target="_blank" rel="noopener noreferrer" aria-label="${html(links.modelName)}: ${html(variant.quantization)} em ${html(variant.format)}, ${variant.community ? 'comunidade' : 'publicação oficial'}, ${html(variant.publisher)}${variant.split ? ', arquivo em partes' : ''} (nova aba)"><span class="model-artifact-title"><strong>${html(variant.quantization)}</strong>${arrow}</span><span>${html(variant.format)}${variant.split ? ' · em partes' : ''}</span><small>${variant.community ? 'Comunidade' : 'Oficial'} · ${html(variant.publisher)}</small></a>`).join('')}</div>
    ${links.note ? `<p class="model-source-note">${html(links.note)}</p>` : ''}
    <p class="model-source-verified">Links conferidos em <time datetime="${html(verified)}">${html(verified.split('-').reverse().join('/'))}</time>. Acesso sujeito aos termos do publicador.</p>
  </section>`;
}
