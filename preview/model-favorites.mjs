export const FAVORITES_KEY = '838.model-favorites.v1';
const empty = Object.freeze({ ids: [], error: '' });

export function createFavoritesStore(allowedIds) {
  const allowed = new Set(allowedIds);
  let snapshot = empty;
  let sessionOnly = false;
  const listeners = new Set();
  function publish(next) {
    if (JSON.stringify(next) === JSON.stringify(snapshot)) return;
    snapshot = next;
    listeners.forEach(listener => listener());
  }
  function refresh() {
    if (sessionOnly) return;
    try {
      const raw = window.localStorage.getItem(FAVORITES_KEY);
      if (raw !== null && raw.length > 100_000) throw new Error('Favorites too large');
      const value = raw === null ? { version: 1, ids: [] } : JSON.parse(raw);
      if (value?.version !== 1 || !Array.isArray(value.ids) || value.ids.length > 1000) throw new Error('Invalid favorites');
      publish({ ids: [...new Set(value.ids.filter(id => typeof id === 'string' && allowed.has(id)))], error: '' });
    } catch {
      publish({ ids: snapshot.ids, error: 'Não foi possível ler seus favoritos. Você ainda pode usá-los nesta sessão.' });
    }
  }
  const onStorage = event => { if (event.key === FAVORITES_KEY || event.key === null) refresh(); };
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => empty,
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1 && typeof window !== 'undefined') {
        window.addEventListener('storage', onStorage);
        refresh();
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size && typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
      };
    },
    toggle(id) {
      if (!allowed.has(id)) return;
      const ids = snapshot.ids.includes(id) ? snapshot.ids.filter(item => item !== id) : [...snapshot.ids, id];
      let error = '';
      try { window.localStorage.setItem(FAVORITES_KEY, JSON.stringify({ version: 1, ids })); sessionOnly = false; }
      catch { sessionOnly = true; error = 'Favoritos atualizados apenas nesta sessão: o navegador não permitiu salvar.'; }
      publish({ ids, error });
    },
  };
}
