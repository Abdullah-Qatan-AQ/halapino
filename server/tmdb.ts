import { ENV } from "./_core/env";

export type MediaKind = "movie" | "tv";

export type MediaItem = {
  id: number;
  mediaType: MediaKind;
  title: string;
  originalTitle: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  releaseDate: string | null;
  genreIds: number[];
};

type RawMedia = {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  media_type?: string;
};

const BASE_URL = ENV.catalogApiBaseUrl;

function hasBearerToken(key: string) {
  return key.startsWith("eyJ") || key.length > 70;
}

export function normalizeMedia(item: RawMedia, fallbackType: MediaKind = "movie"): MediaItem {
  const mediaType = item.media_type === "tv" || item.media_type === "movie" ? item.media_type : fallbackType;
  return {
    id: item.id,
    mediaType,
    title: item.title || item.name || "عنوان غير متاح",
    originalTitle: item.original_title || item.original_name || item.title || item.name || "",
    overview: item.overview || "لا يتوفر ملخص عربي لهذا العمل حالياً.",
    posterPath: item.poster_path || null,
    backdropPath: item.backdrop_path || null,
    voteAverage: Number(item.vote_average || 0),
    releaseDate: item.release_date || item.first_air_date || null,
    genreIds: item.genre_ids || [],
  };
}

export async function tmdbGet<T>(path: string, params: Record<string, string | number | boolean | undefined> = {}): Promise<T> {
  const apiKey = ENV.catalogApiKey;
  if (!apiKey) throw new Error("مفتاح مزود الكتالوج غير مهيأ.");
  if (!BASE_URL) throw new Error("رابط مزود الكتالوج غير مهيأ.");

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("language", "ar-SA");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  const headers: HeadersInit = { accept: "application/json" };
  if (hasBearerToken(apiKey)) {
    headers.Authorization = `Bearer ${apiKey}`;
  } else {
    url.searchParams.set("api_key", apiKey);
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`تعذر الوصول إلى مزود الكتالوج (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export function getYear(date: string | null) {
  return date?.slice(0, 4) || "—";
}
