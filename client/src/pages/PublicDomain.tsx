import CinemaLayout from "@/components/CinemaLayout";
import { Archive, ExternalLink, Film, Heart, LoaderCircle, Play, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAppPreferences } from "@/contexts/AppPreferencesContext";

type ArchiveMovie = {
  identifier: string;
  title: string;
  year: string;
  creator: string;
  description: string;
  licenseUrl: string;
};

const savedArchiveKey = "halapino:public-domain-saves";

function readSavedArchiveIds() {
  try {
    const value = JSON.parse(localStorage.getItem(savedArchiveKey) || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export default function PublicDomain() {
  const { language } = useAppPreferences();
  const isArabic = language === "ar";
  const { data, isLoading, error } = trpc.publicDomain.list.useQuery();
  const [activeMovie, setActiveMovie] = useState<ArchiveMovie | null>(null);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  useEffect(() => setSavedIds(readSavedArchiveIds()), []);
  const visibleMovies = useMemo(() => {
    const normalizedQuery = libraryQuery.trim().toLowerCase();
    return (data || []).filter((movie) => (!showSaved || savedIds.includes(movie.identifier)) && (!normalizedQuery || `${movie.title} ${movie.creator} ${movie.description}`.toLowerCase().includes(normalizedQuery)));
  }, [data, libraryQuery, savedIds, showSaved]);
  const surpriseMe = () => {
    const pool = visibleMovies.length ? visibleMovies : data || [];
    if (!pool.length) return;
    setActiveMovie(pool[Math.floor(Math.random() * pool.length)]!);
  };
  const toggleArchiveSave = (identifier: string) => {
    setSavedIds((current) => {
      const next = current.includes(identifier) ? current.filter((id) => id !== identifier) : [...current, identifier];
      localStorage.setItem(savedArchiveKey, JSON.stringify(next));
      return next;
    });
  };

  return <CinemaLayout>
    <section className="container pt-10 sm:pt-14">
      <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200/15 bg-[radial-gradient(circle_at_80%_5%,rgba(52,211,153,.16),transparent_32%),linear-gradient(120deg,#101b19,#0b0d0d_65%)] p-7 sm:p-12">
        <div className="absolute -left-16 -top-16 size-48 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative max-w-3xl"><span className="eyebrow text-emerald-200">{isArabic ? "عرض قانوني داخل المنصة" : "Legal playback inside HALAPINO"}</span><h1 className="mt-4 font-display text-4xl leading-tight text-stone-50 sm:text-5xl">{isArabic ? <>مكتبة الأفلام <span className="text-emerald-300">المجانية</span></> : <>The <span className="text-emerald-300">free</span> film library</>}</h1><p className="mt-5 leading-8 text-stone-300">{isArabic ? "أعمال تُعرض داخل HALAPINO من نتائج Internet Archive المصنّفة ضمن الملكية العامة. تحقق من الترخيص المبيّن لكل عمل قبل أي إعادة استخدام خارج المنصة." : "Titles play inside HALAPINO from Internet Archive records labeled as public domain. Check each listed license before reuse outside the platform."}</p><div className="mt-7 flex flex-wrap gap-3 text-sm"><span className="inline-flex items-center gap-2 rounded-xl border border-emerald-100/15 bg-black/20 px-3 py-2 text-emerald-100"><ShieldCheck className="size-4" /> {isArabic ? "الملكية العامة فقط" : "Public domain only"}</span><span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-stone-300"><Archive className="size-4" /> {isArabic ? "المصدر: Internet Archive" : "Source: Internet Archive"}</span><button type="button" onClick={surpriseMe} className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-emerald-100 transition hover:bg-emerald-300/20"><Play className="size-4 fill-current" /> {isArabic ? "فاجئني بعمل" : "Surprise me"}</button></div></div>
      </div>
    </section>

    <section className="container mt-10">
      {activeMovie && <div className="archive-player mb-9"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="eyebrow text-emerald-200">{isArabic ? "تشغيل مضمّن" : "Embedded playback"}</span><h2 className="mt-2 font-display text-2xl text-stone-100">{activeMovie.title}</h2><p className="mt-2 text-sm text-stone-400">{activeMovie.creator} <span className="mx-2 text-stone-700">•</span> {activeMovie.year}</p></div><button type="button" onClick={() => setActiveMovie(null)} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-stone-300 transition hover:border-emerald-200 hover:text-emerald-100"><X className="size-4" /> {isArabic ? "إغلاق" : "Close"}</button></div><div className="mt-5 aspect-video overflow-hidden rounded-2xl bg-black"><iframe src={`https://archive.org/embed/${encodeURIComponent(activeMovie.identifier)}`} className="size-full" title={`${isArabic ? "تشغيل" : "Playing"} ${activeMovie.title} ${isArabic ? "داخل HALAPINO" : "inside HALAPINO"}`} allowFullScreen /></div><a href={activeMovie.licenseUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-200 hover:text-emerald-100">{isArabic ? "فتح صفحة الترخيص" : "Open license page"} <ExternalLink className="size-4" /></a></div>}

      {isLoading ? <div className="empty-state"><LoaderCircle className="size-8 animate-spin text-emerald-300" /><h2>نحضّر مكتبة المشاهدة...</h2><p>نراجع الأعمال المصنّفة ضمن الملكية العامة.</p></div> : error ? <div className="empty-state"><Film className="size-8 text-emerald-300" /><h2>تعذر جلب المكتبة الآن</h2><p>تأكد من الاتصال ثم حاول مجدداً.</p></div> : <><div className="mb-6 flex flex-col gap-3 sm:flex-row"><input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} className="h-12 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-stone-100 outline-none transition placeholder:text-stone-600 focus:border-emerald-300/50" placeholder="ابحث داخل المكتبة المجانية..." /><button type="button" onClick={() => setShowSaved((value) => !value)} className={`rounded-xl border px-4 py-2 text-sm transition ${showSaved ? "border-emerald-300/50 bg-emerald-300/15 text-emerald-100" : "border-white/10 bg-white/5 text-stone-400 hover:text-stone-100"}`}><Heart className={`ml-2 inline size-4 ${showSaved ? "fill-current" : ""}`} /> محفوظاتي ({savedIds.length})</button><span className="self-center text-sm text-stone-500">{visibleMovies.length} عملاً</span></div>{visibleMovies.length ? <div className="archive-grid">{visibleMovies.map((movie, index) => <article key={movie.identifier} className="archive-card" style={{ animationDelay: `${index * 45}ms` }}><button type="button" onClick={() => toggleArchiveSave(movie.identifier)} className={`archive-save ${savedIds.includes(movie.identifier) ? "is-saved" : ""}`} aria-label={savedIds.includes(movie.identifier) ? `إزالة ${movie.title} من المحفوظات` : `حفظ ${movie.title}`}><Heart className={`size-4 ${savedIds.includes(movie.identifier) ? "fill-current" : ""}`} /></button><button type="button" onClick={() => setActiveMovie(movie)} className="block w-full text-right"><div className="relative aspect-[16/10] overflow-hidden bg-[#172522]"><img src={`https://archive.org/services/img/${encodeURIComponent(movie.identifier)}`} alt={`ملصق ${movie.title}`} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-[#101716] via-transparent to-transparent" /><span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-300 px-2.5 py-1 text-xs font-bold text-[#06221b]"><Play className="size-3 fill-current" /> شاهد هنا</span></div><div className="p-4"><h2 className="line-clamp-1 font-display text-lg text-stone-100">{movie.title}</h2><p className="mt-2 text-xs text-stone-500">{movie.creator} <span className="mx-1 text-stone-700">•</span> {movie.year}</p><p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-400">{movie.description}</p></div></button></article>)}</div> : <div className="empty-state"><Film className="size-7 text-emerald-300" /><h2>لا توجد نتيجة مطابقة</h2><p>جرّب عنواناً أو اسماً مختلفاً.</p></div>}</>}
    </section>
  </CinemaLayout>;
}
