import CinemaLayout from "@/components/CinemaLayout";
import MediaCard from "@/components/MediaCard";
import { readFavorites, toggleFavorite, writeFavorites, type FavoriteItem } from "@/lib/favorites";
import { trpc } from "@/lib/trpc";
import { LoaderCircle, Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppPreferences } from "@/contexts/AppPreferencesContext";

export default function Search() {
  const { language } = useAppPreferences();
  const isArabic = language === "ar";
  const [query, setQuery] = useState("");
  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">("all");
  const [genreId, setGenreId] = useState("all");
  const [year, setYear] = useState("all");
  const [minRating, setMinRating] = useState("0");
  const [sort, setSort] = useState<"relevance" | "rating" | "newest">("relevance");
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => setFavorites(readFavorites()), []);
  const searchInput = useMemo(() => ({
    query: query.trim(),
    mediaType,
    genreId: genreId === "all" ? undefined : Number(genreId),
    year: year === "all" ? undefined : Number(year),
    minRating: Number(minRating),
    sort,
  }), [query, mediaType, genreId, year, minRating, sort]);
  const { data: genres } = trpc.catalog.genres.useQuery();
  const { data, isFetching, error } = trpc.catalog.search.useQuery(searchInput, { enabled: query.trim().length >= 2 });
  const years = Array.from({ length: 30 }, (_, index) => new Date().getFullYear() - index);

  const handleFavorite = (item: FavoriteItem) => {
    setFavorites((current) => {
      const next = toggleFavorite(current, item);
      writeFavorites(next);
      return next;
    });
  };

  return (
    <CinemaLayout>
      <section className="container pt-10 sm:pt-14">
        <div className="max-w-3xl">
          <span className="eyebrow">{isArabic ? "محرك الاكتشاف" : "Discovery engine"}</span>
          <h1 className="mt-4 font-display text-4xl text-stone-50 sm:text-5xl">{isArabic ? "ابحث عن قصتك التالية" : "Find your next story"}</h1>
          <p className="mt-4 leading-7 text-stone-400">{isArabic ? "ابحث في مزود الكتالوج المهيأ، أو ضمن المكتبات القانونية الاحتياطية، ثم صَفِّ النتائج وفق الخيارات المتاحة." : "Search your configured catalog or legal fallback libraries, then refine results with available filters."}</p>
        </div>

        <div className="mt-9 rounded-[1.75rem] border border-amber-200/15 bg-[#111015]/85 p-4 shadow-2xl shadow-black/20 sm:p-5">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 transition focus-within:border-amber-300/50 focus-within:ring-4 focus-within:ring-amber-300/5">
            <SearchIcon className="size-5 text-amber-300" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isArabic ? "اكتب اسم فيلم أو مسلسل..." : "Search a film or series..."} className="h-14 w-full bg-transparent text-base text-stone-100 outline-none placeholder:text-stone-600" autoFocus />
            {query && <button type="button" aria-label={isArabic ? "مسح البحث" : "Clear search"} onClick={() => setQuery("")} className="text-stone-500 transition hover:text-stone-100"><X className="size-5" /></button>}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="filter-field"><span>{isArabic ? "المحتوى" : "Content"}</span><select value={mediaType} onChange={(event) => setMediaType(event.target.value as "all" | "movie" | "tv")}><option value="all">{isArabic ? "الكل" : "All"}</option><option value="movie">{isArabic ? "أفلام" : "Movies"}</option><option value="tv">{isArabic ? "مسلسلات" : "Series"}</option></select></label>
            <label className="filter-field"><span>{isArabic ? "النوع" : "Genre"}</span><select value={genreId} onChange={(event) => setGenreId(event.target.value)}><option value="all">{isArabic ? "كل الأنواع" : "All genres"}</option>{genres?.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}</select></label>
            <label className="filter-field"><span>{isArabic ? "السنة" : "Year"}</span><select value={year} onChange={(event) => setYear(event.target.value)}><option value="all">{isArabic ? "كل السنوات" : "All years"}</option>{years.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label className="filter-field"><span>{isArabic ? "أقل تقييم" : "Minimum rating"}</span><select value={minRating} onChange={(event) => setMinRating(event.target.value)}><option value="0">{isArabic ? "أي تقييم" : "Any rating"}</option><option value="6">{isArabic ? "6.0 فأعلى" : "6.0+"}</option><option value="7">{isArabic ? "7.0 فأعلى" : "7.0+"}</option><option value="8">{isArabic ? "8.0 فأعلى" : "8.0+"}</option></select></label>
            <label className="filter-field"><span>{isArabic ? "الترتيب" : "Sort"}</span><select value={sort} onChange={(event) => setSort(event.target.value as "relevance" | "rating" | "newest")}><option value="relevance">{isArabic ? "الأقرب للبحث" : "Best match"}</option><option value="rating">{isArabic ? "الأعلى تقييماً" : "Top rated"}</option><option value="newest">{isArabic ? "الأحدث" : "Newest"}</option></select></label>
          </div>
        </div>
      </section>

      <section className="container mt-10">
        {query.trim().length < 2 ? (
          <div className="empty-state"><SearchIcon className="size-7 text-amber-300" /><h2>{isArabic ? "اكتب حرفين على الأقل للبدء" : "Enter at least two characters"}</h2><p>{isArabic ? "ستظهر النتائج من المصدر المهيأ أو من المكتبات القانونية الاحتياطية." : "Results come from your provider or legal fallback libraries."}</p></div>
        ) : isFetching ? (
          <div className="empty-state"><LoaderCircle className="size-7 animate-spin text-amber-300" /><h2>{isArabic ? "نبحث في أرشيف السينما..." : "Searching the cinema archive..."}</h2><p>{isArabic ? "نرتب النتائج وفق خياراتك." : "Sorting results to your choices."}</p></div>
        ) : error ? (
          <div className="empty-state"><SlidersHorizontal className="size-7 text-amber-300" /><h2>{isArabic ? "تعذر إحضار النتائج" : "Results unavailable"}</h2><p>{isArabic ? "تحقق من الاتصال ثم أعد المحاولة." : "Check your connection and try again."}</p></div>
        ) : data?.results.length ? (
          <><div className="mb-5 flex items-center justify-between"><h2 className="font-display text-2xl text-stone-100">{isArabic ? "نتائج البحث" : "Search results"}</h2><span className="rounded-full bg-white/5 px-3 py-1.5 text-sm text-stone-400">{data.total} {isArabic ? "نتيجة ظاهرة" : "results shown"}</span></div><div className="media-grid">{data.results.map((media) => <MediaCard key={`${media.mediaType}-${media.id}`} media={media} showOverview isFavorite={favorites.some((favorite) => favorite.id === media.id && favorite.mediaType === media.mediaType)} onToggleFavorite={handleFavorite} />)}</div></>
        ) : (
          <div className="empty-state"><SearchIcon className="size-7 text-amber-300" /><h2>{isArabic ? "لا توجد نتائج مطابقة" : "No matching results"}</h2><p>{isArabic ? "جرّب اسماً مختلفاً أو خفف شروط التصفية." : "Try another title or loosen the filters."}</p></div>
        )}
      </section>
    </CinemaLayout>
  );
}
