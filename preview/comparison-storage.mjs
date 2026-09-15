import { safeReadJson, safeWriteJson } from './storage.mjs';

export const COMPARISON_KEY = '838.saved-comparison.v1';

export function validateComparison(value, models) {
  if (value?.version !== 1 || !Number.isFinite(value.contextK) || value.contextK < 1 || value.contextK > 256 || !Array.isArray(value.selections) || value.selections.length !== 3) {
    throw new Error('A comparação salva é inválida ou usa uma versão incompatível.');
  }
  const selections = value.selections.map((selection, index) => {
    const model = models.find(item => item.id === selection?.modelId);
    if (!model?.variants.some(variant => variant.quantization === selection.quantization)) {
      throw new Error('Um modelo ou uma quantização salva não está disponível no catálogo atual.');
    }
    return { slotId: `model-${index + 1}`, modelId: model.id, quantization: selection.quantization };
  });
  return { version: 1, contextK: value.contextK, selections };
}

export function saveComparison(models, selections, contextK) {
  const value = validateComparison({ version: 1, selections, contextK }, models);
  const result = safeWriteJson(window.localStorage, COMPARISON_KEY, value, { maxBytes: 20_000 });
  if (!result.ok) {
    throw new Error('O navegador não permitiu salvar. Sua comparação atual continua disponível.');
  }
}

export function loadComparison(models) {
  try {
    const value = safeReadJson(window.localStorage, COMPARISON_KEY, { fallback: null, maxBytes: 20_000 });
    if (value === null) throw new Error('Nenhuma comparação salva neste navegador.');
    return validateComparison(value, models);
  } catch {
    throw new Error('Não foi possível ler a comparação salva. Salve uma nova comparação para substituí-la.');
  }
}

export function deleteComparison() {
  try { window.localStorage.removeItem(COMPARISON_KEY); }
  catch { throw new Error('O navegador não permitiu apagar a comparação salva.'); }
}

export function serializeComparison(models, selections, contextK) {
  return JSON.stringify(validateComparison({ version: 1, selections, contextK }, models), null, 2);
}

export async function readComparisonFile(file, models) {
  if (!file || file.size > 20_000) throw new Error('Escolha um arquivo JSON de comparação com até 20 KB.');
  let value;
  try { value = JSON.parse(await file.text()); }
  catch { throw new Error('O arquivo não contém um JSON válido de comparação.'); }
  return validateComparison(value, models);
}

export function downloadComparison(models, selections, contextK) {
  const blob = new Blob([serializeComparison(models, selections, contextK)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '838-comparacao.json';
  document.body.append(link);
  try { link.click(); }
  finally { link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
