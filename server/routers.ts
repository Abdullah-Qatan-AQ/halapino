import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { normalizeMedia, tmdbGet, type MediaKind } from "./tmdb";
import { fallbackDetails, getLegalFallbackCatalog, searchLegalFallback, sourceStatus } from "./contentSources";
import { z } from "zod";

const mediaTypeSchema = z.enum(["movie", "tv"]);

type PublicDomainMovie = {
  identifier: string;
  title: string;
  year: string;
  creator: string;
  description: string;
  licenseUrl: string;
};

const unsuitablePublicDomainContent = /sex|nudist|nazi|concentration|bloody|horror|haunted|reefer|marijuana|drug|torture|executioner|exploitation|violence|war crime|assassin|assassination|hostage|gunmen|psychopathic|murder|kidnap|suicide|rape|adult|obscene|unclothed|crime|demon|kill/i;
const publicDomainFallback: PublicDomainMovie[] = [
  { identifier: "HisNewJobCharlesChaplin-1915", title: "Charlie Chaplin — New Job", year: "1915", creator: "Charlie Chaplin", description: "فيلم قصير كلاسيكي ضمن الملكية العامة.", licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/" },
  { identifier: "charlie_chaplin_film_fest", title: "Charlie Chaplin Festival", year: "1938", creator: "Charlie Chaplin", description: "مختارات من أفلام تشارلي تشابلن القصيرة.", licenseUrl: "https://creativecommons.org/licenses/publicdomain/" },
  { identifier: "JungleBook", title: "Jungle Book", year: "1942", creator: "Alexander Korda", description: "مغامرة كلاسيكية مستوحاة من قصص الأدغال.", licenseUrl: "https://creativecommons.org/licenses/publicdomain/" },
  { identifier: "Sita_Sings_the_Blues", title: "Sita Sings the Blues", year: "2008", creator: "Nina Paley", description: "رسوم متحركة مستقلة متاحة ضمن الملكية العامة.", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/" },
  { identifier: "The_Pied_Piper_of_Hamelin", title: "The Pied Piper of Hamelin", year: "1957", creator: "Hal Stanley", description: "حكاية كلاسيكية ملونة مناسبة للمشاهدة العائلية.", licenseUrl: "https://creativecommons.org/licenses/publicdomain/" },
  { identifier: "abraham_lincoln", title: "Abraham Lincoln", year: "1930", creator: "D. W. Griffith", description: "فيلم سيرة تاريخية ضمن الملكية العامة.", licenseUrl: "https://creativecommons.org/licenses/publicdomain/" },
  { identifier: "3stooges", title: "Three Stooges Episodes", year: "—", creator: "Three Stooges", description: "مجموعة حلقات كوميدية قصيرة.", licenseUrl: "https://creativecommons.org/licenses/publicdomain/" },
];
let publicDomainCache: { updatedAt: number; items: PublicDomainMovie[] } | null = null;

function sortMedia<T extends { voteAverage: number; releaseDate: string | null }>(items: T[], sort: "relevance" | "rating" | "newest") {
  if (sort === "rating") return [...items].sort((a, b) => b.voteAverage - a.voteAverage);
  if (sort === "newest") return [...items].sort((a, b) => (b.releaseDate || "").localeCompare(a.releaseDate || ""));
  return items;
}

async function fallbackHomeCatalog() {
  const items = await getLegalFallbackCatalog();
  return {
    movies: items.slice(0, 12),
    shows: [] as typeof items,
    recommended: items.slice(0, 12),
    activeSource: items[0]?.sourceId || "unavailable",
  };
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  catalog: router({
    home: publicProcedure.query(async () => {
      try {
        const [movies, shows, recommended] = await Promise.all([
          tmdbGet<{ results: any[] }>("/trending/movie/week"),
          tmdbGet<{ results: any[] }>("/trending/tv/week"),
          tmdbGet<{ results: any[] }>("/discover/movie", { sort_by: "vote_average.desc", "vote_count.gte": 600, page: 1 }),
        ]);
        return {
          movies: movies.results.slice(0, 12).map((item) => normalizeMedia(item, "movie")),
          shows: shows.results.slice(0, 12).map((item) => normalizeMedia(item, "tv")),
          recommended: recommended.results.slice(0, 12).map((item) => normalizeMedia(item, "movie")),
          activeSource: "catalog-api",
        };
      } catch {
        return fallbackHomeCatalog();
      }
    }),
    genres: publicProcedure.query(async () => {
      try {
        const [movieGenres, tvGenres] = await Promise.all([
          tmdbGet<{ genres: { id: number; name: string }[] }>("/genre/movie/list"),
          tmdbGet<{ genres: { id: number; name: string }[] }>("/genre/tv/list"),
        ]);
        const seen = new Set<number>();
        return [...movieGenres.genres, ...tvGenres.genres].filter((genre) => !seen.has(genre.id) && (seen.add(genre.id) || true));
      } catch {
        return [];
      }
    }),
    search: publicProcedure.input(z.object({
      query: z.string().min(2).max(160),
      mediaType: z.enum(["all", "movie", "tv"]).default("all"),
      genreId: z.number().int().optional(),
      year: z.number().int().min(1888).max(2100).optional(),
      minRating: z.number().min(0).max(10).default(0),
      sort: z.enum(["relevance", "rating", "newest"]).default("relevance"),
    })).query(async ({ input }) => {
      try {
        const endpoint = input.mediaType === "all" ? "/search/multi" : `/search/${input.mediaType}`;
        const raw = await tmdbGet<{ results: any[]; total_results?: number }>(endpoint, { query: input.query, include_adult: false, page: 1 });
        const results = raw.results
          .filter((item) => input.mediaType !== "all" || item.media_type === "movie" || item.media_type === "tv")
          .map((item) => normalizeMedia(item, input.mediaType === "tv" ? "tv" : "movie"))
          .filter((item) => (!input.genreId || item.genreIds.includes(input.genreId)) && (!input.year || item.releaseDate?.startsWith(String(input.year))) && item.voteAverage >= input.minRating);
        return { results: sortMedia(results, input.sort).slice(0, 40), total: raw.total_results || results.length, activeSource: "catalog-api" };
      } catch {
        const results = await searchLegalFallback(input.query);
        return { results: sortMedia(results, input.sort).slice(0, 40), total: results.length, activeSource: results[0]?.sourceId || "unavailable" };
      }
    }),
    details: publicProcedure.input(z.object({ mediaType: mediaTypeSchema, id: z.number().int().positive() })).query(async ({ input }) => {
      try {
        const raw = await tmdbGet<any>(`/${input.mediaType}/${input.id}`, { append_to_response: "credits,videos,watch/providers,recommendations" });
        const base = normalizeMedia(raw, input.mediaType);
      const videos = raw.videos?.results || [];
      const trailer = videos.find((video: any) => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser")) || videos.find((video: any) => video.site === "YouTube");
      const providerResults = raw["watch/providers"]?.results || {};
      const firstProvider = Object.values(providerResults).find((value): value is Record<string, any> => Boolean(value)) || {};
      const providerData = providerResults.SA || providerResults.US || firstProvider;
      const recommendations = (raw.recommendations?.results || []).slice(0, 8).map((item: any) => normalizeMedia(item, input.mediaType));
      const allProviders = [...(providerData.flatrate || []), ...(providerData.rent || []), ...(providerData.buy || [])] as any[];
        return {
        ...base,
        runtime: raw.runtime || raw.episode_run_time?.[0] || null,
        genres: (raw.genres || []).map((genre: { id: number; name: string }) => ({ id: genre.id, name: genre.name })),
        cast: (raw.credits?.cast || []).slice(0, 12).map((person: any) => ({ id: person.id, name: person.name, character: person.character, profilePath: person.profile_path || null })),
        trailerKey: trailer?.key || null,
        providers: allProviders.filter((provider, index, array) => array.findIndex((current) => current.provider_id === provider.provider_id) === index).slice(0, 8).map((provider) => ({ id: provider.provider_id, name: provider.provider_name })),
        providerLink: providerData.link || null,
          recommendations,
          activeSource: "catalog-api",
        };
      } catch {
        const item = await fallbackDetails(input.id);
        if (!item) throw new Error("تعذر العثور على تفاصيل العمل ضمن المصادر القانونية المتاحة.");
        return { ...item, runtime: null, genres: [], cast: [], trailerKey: null, providers: [{ id: item.id, name: item.providerName }], providerLink: item.licenseUrl, recommendations: [], playbackUrl: item.playableUrl, activeSource: item.sourceId };
      }
    }),
    shorts: publicProcedure.query(async () => {
      try {
      const trending = await tmdbGet<{ results: any[] }>("/trending/all/week");
      const selections = trending.results.filter((item) => item.media_type === "movie" || item.media_type === "tv").slice(0, 12);
      const entries = await Promise.all(selections.map(async (item) => {
        const type = item.media_type as MediaKind;
        const videos = await tmdbGet<{ results: any[] }>(`/${type}/${item.id}/videos`);
        const trailer = videos.results.find((video) => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser")) || videos.results.find((video) => video.site === "YouTube");
        return trailer ? { ...normalizeMedia(item, type), trailerKey: trailer.key } : null;
      }));
      return entries.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
      } catch {
        return [];
      }
    }),
  }),

  sourceConfig: router({
    status: publicProcedure.query(() => sourceStatus()),
  }),

  publicDomain: router({
    list: publicProcedure.query(async () => {
      if (publicDomainCache && Date.now() - publicDomainCache.updatedAt < 5 * 60 * 1000) return publicDomainCache.items;
      const url = new URL("https://archive.org/advancedsearch.php");
      url.searchParams.set("q", "collection:feature_films AND licenseurl:*publicdomain*");
      url.searchParams.append("fl[]", "identifier");
      url.searchParams.append("fl[]", "title");
      url.searchParams.append("fl[]", "year");
      url.searchParams.append("fl[]", "creator");
      url.searchParams.append("fl[]", "description");
      url.searchParams.append("fl[]", "licenseurl");
      url.searchParams.append("sort[]", "downloads desc");
      url.searchParams.set("rows", "18");
      url.searchParams.set("output", "json");

      try {
        const response = await fetch(url, { headers: { accept: "application/json", "user-agent": "HALAPINO public-domain library" }, signal: AbortSignal.timeout(12_000) });
        if (!response.ok) throw new Error(`Archive status ${response.status}`);
        const payload = await response.json() as { response?: { docs?: Array<Record<string, unknown>> } };
        const items = (payload.response?.docs || [])
          .filter((item) => typeof item.identifier === "string" && typeof item.title === "string" && String(item.licenseurl || "").toLowerCase().includes("publicdomain"))
          .filter((item) => !unsuitablePublicDomainContent.test(`${item.title || ""} ${item.description || ""}`))
          .map((item) => ({
            identifier: item.identifier as string,
            title: item.title as string,
            year: String(item.year || "—"),
            creator: String(item.creator || "غير متاح"),
            description: String(item.description || "عمل متاح ضمن الملكية العامة."),
            licenseUrl: String(item.licenseurl || ""),
          }));
        if (!items.length) throw new Error("No suitable public-domain items returned");
        publicDomainCache = { updatedAt: Date.now(), items };
        return items;
      } catch (error) {
        console.warn("[Public Domain] Falling back to curated legal library:", error instanceof Error ? error.message : error);
        return publicDomainCache?.items || publicDomainFallback;
      }
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
