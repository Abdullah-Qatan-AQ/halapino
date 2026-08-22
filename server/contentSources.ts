import { type MediaItem } from "./tmdb";
import { ENV } from "./_core/env";

export type LegalFallbackMedia = MediaItem & {
  sourceId: "archive" | "wikimedia";
  sourceItemId: string;
  playableUrl: string;
  licenseUrl: string;
  providerName: string;
};

type WikimediaPage = {
  title?: string;
  imageinfo?: Array<{
    url?: string;
    thumburl?: string;
    descriptionurl?: string;
    extmetadata?: {
      LicenseUrl?: { value?: string };
      Artist?: { value?: string };
    };
  }>;
};

const unsuitableContent = /sex|nudist|nazi|concentration|bloody|horror|haunted|reefer|marijuana|drug|torture|executioner|exploitation|violence|war crime|assassin|assassination|hostage|gunmen|psychopathic|murder|kidnap|suicide|rape|adult|obscene|unclothed|crime|demon|kill/i;
const fallbackStore = new Map<number, LegalFallbackMedia>();
let cachedLegalCatalog: { savedAt: number; items: LegalFallbackMedia[] } | null = null;

function stableId(value: string) {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return Math.abs(hash || 1);
}

function cache(items: LegalFallbackMedia[]) {
  items.forEach((item) => fallbackStore.set(item.id, item));
  cachedLegalCatalog = { savedAt: Date.now(), items };
  return items;
}

async function archiveCatalog(): Promise<LegalFallbackMedia[]> {
  const url = new URL("https://archive.org/advancedsearch.php");
  url.searchParams.set("q", "collection:feature_films AND licenseurl:*publicdomain*");
  ["identifier", "title", "year", "creator", "description", "licenseurl"].forEach((field) => url.searchParams.append("fl[]", field));
  url.searchParams.append("sort[]", "downloads desc");
  url.searchParams.set("rows", "18");
  url.searchParams.set("output", "json");
  const response = await fetch(url, { headers: { accept: "application/json", "user-agent": "HALAPINO legal catalog" }, signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`Archive status ${response.status}`);
  const payload = await response.json() as { response?: { docs?: Array<Record<string, unknown>> } };
  return (payload.response?.docs || [])
    .filter((item) => typeof item.identifier === "string" && typeof item.title === "string" && String(item.licenseurl || "").toLowerCase().includes("publicdomain"))
    .filter((item) => !unsuitableContent.test(`${item.title || ""} ${item.description || ""}`))
    .map((item) => {
      const sourceItemId = item.identifier as string;
      return {
        id: stableId(`archive:${sourceItemId}`),
        mediaType: "movie" as const,
        title: item.title as string,
        originalTitle: item.title as string,
        overview: String(item.description || "عمل مرخّص ضمن الملكية العامة."),
        posterPath: `https://archive.org/services/img/${encodeURIComponent(sourceItemId)}`,
        backdropPath: null,
        voteAverage: 0,
        releaseDate: item.year ? `${item.year}-01-01` : null,
        genreIds: [],
        sourceId: "archive" as const,
        sourceItemId,
        playableUrl: `https://archive.org/embed/${encodeURIComponent(sourceItemId)}`,
        licenseUrl: String(item.licenseurl),
        providerName: "Internet Archive",
      };
    });
}

async function wikimediaCatalog(): Promise<LegalFallbackMedia[]> {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({ action: "query", generator: "search", gsrsearch: 'incategory:"Videos of films in the public domain"', gsrnamespace: "6", gsrlimit: "12", prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "640", format: "json", origin: "*" }).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`Wikimedia status ${response.status}`);
  const payload = await response.json() as { query?: { pages?: Record<string, WikimediaPage> } };
  return Object.values(payload.query?.pages || {})
    .map((page) => ({ page, info: page.imageinfo?.[0] }))
    .filter(({ page, info }) => Boolean(info?.url && page.title && /\.(webm|ogv|mp4)$/i.test(info.url)))
    .filter(({ page }) => !unsuitableContent.test(page.title || ""))
    .map(({ page, info }) => {
      const sourceItemId = page.title || "";
      return {
        id: stableId(`wikimedia:${sourceItemId}`),
        mediaType: "movie" as const,
        title: sourceItemId.replace(/^File:/, "").replace(/\.[a-z0-9]+$/i, ""),
        originalTitle: sourceItemId,
        overview: "فيديو مرخّص من Wikimedia Commons.",
        posterPath: info?.thumburl || null,
        backdropPath: null,
        voteAverage: 0,
        releaseDate: null,
        genreIds: [],
        sourceId: "wikimedia" as const,
        sourceItemId,
        playableUrl: info?.url || "",
        licenseUrl: info?.extmetadata?.LicenseUrl?.value || info?.descriptionurl || "https://commons.wikimedia.org/",
        providerName: "Wikimedia Commons",
      };
    });
}

export async function getLegalFallbackCatalog() {
  if (cachedLegalCatalog && Date.now() - cachedLegalCatalog.savedAt < 5 * 60 * 1000) return cachedLegalCatalog.items;
  try {
    const archive = await archiveCatalog();
    if (archive.length) return cache(archive);
  } catch (error) {
    console.warn("[Content Sources] Internet Archive unavailable:", error instanceof Error ? error.message : error);
  }
  try {
    const wikimedia = await wikimediaCatalog();
    if (wikimedia.length) return cache(wikimedia);
  } catch (error) {
    console.warn("[Content Sources] Wikimedia Commons unavailable:", error instanceof Error ? error.message : error);
  }
  return cache([]);
}

export async function searchLegalFallback(query: string) {
  const normalized = query.trim().toLowerCase();
  const items = await getLegalFallbackCatalog();
  return items.filter((item) => `${item.title} ${item.originalTitle} ${item.overview}`.toLowerCase().includes(normalized));
}

export async function fallbackDetails(id: number) {
  if (!fallbackStore.has(id)) await getLegalFallbackCatalog();
  return fallbackStore.get(id) || null;
}

export function sourceStatus() {
  const primaryUrl = ENV.catalogApiBaseUrl;
  return {
    primaryConfigured: Boolean(primaryUrl && ENV.catalogApiKey),
    primaryIsTmdb: primaryUrl.includes("themoviedb.org"),
    orderedSources: ["catalog-api", "internet-archive", "wikimedia-commons"],
  } as const;
}
