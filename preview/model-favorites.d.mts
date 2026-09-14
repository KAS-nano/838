export const FAVORITES_KEY: string;
export interface FavoritesSnapshot { ids: string[]; error: string }
export function createFavoritesStore(allowedIds: string[]): {
  getSnapshot(): FavoritesSnapshot;
  getServerSnapshot(): FavoritesSnapshot;
  subscribe(listener: () => void): () => void;
  toggle(id: string): void;
};
