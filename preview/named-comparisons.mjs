import { validateComparison } from './comparison-storage.mjs';
export const NAMED_COMPARISONS_KEY = '838.named-comparisons.v1';

export function listNamedComparisons() {
  let raw;
  try { raw = window.localStorage.getItem(NAMED_COMPARISONS_KEY); }
  catch { throw new Error('O navegador não permitiu acessar as comparações nomeadas.'); }
  if (raw === null) return [];
  try {
    if (raw.length > 100_000) throw new Error();
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !Array.isArray(value.items) || value.items.length > 10) throw new Error();
    const names = new Set();
    for (const item of value.items) {
      if (typeof item?.name !== 'string' || !item.name.trim() || item.name.length > 60 || !item.comparison || names.has(item.name.toLocaleLowerCase('pt-BR'))) throw new Error();
      names.add(item.name.toLocaleLowerCase('pt-BR'));
    }
    return value.items;
  } catch { throw new Error('Não foi possível ler as comparações nomeadas. Os dados existentes foram preservados.'); }
}
function write(items) {
  try { window.localStorage.setItem(NAMED_COMPARISONS_KEY, JSON.stringify({ version: 1, items })); }
  catch { throw new Error('O navegador não permitiu salvar a alteração. A lista anterior foi preservada.'); }
  return items;
}
export function addNamedComparison(name, models, selections, contextK) {
  name = name.trim();
  if (!name || name.length > 60) throw new Error('Informe um nome de 1 a 60 caracteres.');
  const comparison = validateComparison({ version: 1, selections, contextK }, models);
  const items = listNamedComparisons();
  if (items.some(item => item.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'))) throw new Error('Esse nome já existe. Use outro nome para preservar a comparação anterior.');
  if (items.length >= 10) throw new Error('Limite de 10 comparações. Exclua uma para guardar outra.');
  return write([...items, { name, comparison }]);
}
export function loadNamedComparison(name, models) {
  const item = listNamedComparisons().find(item => item.name === name);
  if (!item) throw new Error('Escolha uma comparação disponível na lista.');
  return validateComparison(item.comparison, models);
}
export function removeNamedComparison(name) {
  const items = listNamedComparisons();
  if (!items.some(item => item.name === name)) throw new Error('Escolha uma comparação disponível na lista.');
  return write(items.filter(item => item.name !== name));
}
