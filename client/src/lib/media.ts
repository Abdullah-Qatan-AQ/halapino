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

export const posterUrl = (path: string | null, size = "w500") =>
  path ? (path.startsWith("http") ? path : `https://image.tmdb.org/t/p/${size}${path}`) : null;

export const backdropUrl = (path: string | null) =>
  path ? (path.startsWith("http") ? path : `https://image.tmdb.org/t/p/original${path}`) : null;

export const releaseYear = (date: string | null) => date?.slice(0, 4) || "—";

export const mediaLabel = (mediaType: MediaKind) => (mediaType === "movie" ? "فيلم" : "مسلسل");
