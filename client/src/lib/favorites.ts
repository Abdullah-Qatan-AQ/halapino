import type { MediaItem } from "./media";

export type FavoriteItem = Pick<MediaItem, "id" | "mediaType" | "title" | "overview" | "posterPath" | "voteAverage" | "releaseDate">;

const FAVORITES_KEY = "cinemahub:favorites";

export function readFavorites(): FavoriteItem[] {
  try {
    const saved = window.localStorage.getItem(FAVORITES_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeFavorites(items: FavoriteItem[]) {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
}

export function favoriteKey(item: Pick<FavoriteItem, "id" | "mediaType">) {
  return `${item.mediaType}:${item.id}`;
}

export function toggleFavorite(items: FavoriteItem[], item: FavoriteItem) {
  const key = favoriteKey(item);
  const exists = items.some((favorite) => favoriteKey(favorite) === key);
  return exists ? items.filter((favorite) => favoriteKey(favorite) !== key) : [item, ...items];
}
