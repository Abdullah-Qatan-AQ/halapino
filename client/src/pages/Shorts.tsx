import CinemaLayout from "@/components/CinemaLayout";
import { backdropUrl, posterUrl } from "@/lib/media";
import { trpc } from "@/lib/trpc";
import { Clapperboard, ExternalLink, LoaderCircle, Play } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useAppPreferences } from "@/contexts/AppPreferencesContext";

export default function Shorts() {
  const { language } = useAppPreferences();
  const isArabic = language === "ar";
  const { data, isLoading, error } = trpc.catalog.shorts.useQuery();
  const [activeClipKey, setActiveClipKey] = useState<string | null>(null);
  const activeClip = data?.find((clip) => `${clip.mediaType}-${clip.id}` === activeClipKey);
  return (
    <CinemaLayout>
      <section className="container pt-10 sm:pt-14"><span className="eyebrow">{isArabic ? "نبض السينما" : "Cinema pulse"}</span><h1 className="mt-4 font-display text-4xl text-stone-50 sm:text-5xl">{isArabic ? "مقاطع قصيرة" : "Shorts"}</h1><p className="mt-4 max-w-2xl leading-7 text-stone-400">{isArabic ? "تشكيلة من المقاطع الدعائية واللمحات السينمائية المتاحة عبر YouTube، عند توفر مزود كتالوج مهيأ." : "A selection of trailers and cinema moments from YouTube when a catalog provider is configured."}</p></section>
      <section className="container mt-10">
        {activeClip ? <div className="shorts-player mb-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><span className="eyebrow">{isArabic ? "عرض داخل المنصة" : "Watch inside HALAPINO"}</span><h2 className="mt-2 font-display text-xl text-stone-100">{activeClip.title}</h2></div><button type="button" onClick={() => setActiveClipKey(null)} className="rounded-xl border border-white/15 px-3 py-2 text-sm text-stone-300 transition hover:border-amber-200 hover:text-amber-100">{isArabic ? "إغلاق المشغل" : "Close player"}</button></div><div className="mt-5 aspect-video overflow-hidden rounded-2xl bg-black"><iframe className="size-full" src={`https://www.youtube-nocookie.com/embed/${activeClip.trailerKey}?autoplay=1`} title={`${isArabic ? "مقطع" : "Clip"} ${activeClip.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></div> : null}
        {isLoading ? <div className="empty-state"><LoaderCircle className="size-7 animate-spin text-amber-300" /><h2>{isArabic ? "نحضّر العرض القصير..." : "Preparing shorts..."}</h2></div> : error ? <div className="empty-state"><Clapperboard className="size-7 text-amber-300" /><h2>{isArabic ? "تعذر جلب المقاطع الآن" : "Shorts are unavailable"}</h2><p>{isArabic ? "حاول مرة أخرى بعد قليل." : "Try again in a moment."}</p></div> : <div className="shorts-grid">{data?.map((clip) => {
          const image = backdropUrl(clip.backdropPath) || posterUrl(clip.posterPath);
          return <article key={`${clip.mediaType}-${clip.id}`} className="group relative aspect-[9/14] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#141217] shadow-2xl shadow-black/30">
            {image ? <img src={image} alt={`${isArabic ? "لقطة من" : "Still from"} ${clip.title}`} className="size-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" /> : <div className="size-full bg-stone-900" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 p-5"><span className="text-xs text-amber-200">{isArabic ? "مقطع دعائي قصير" : "Short trailer"}</span><h2 className="mt-2 line-clamp-2 font-display text-xl text-white">{clip.title}</h2><div className="mt-4 flex gap-2"><button type="button" onClick={() => setActiveClipKey(`${clip.mediaType}-${clip.id}`)} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-[#2d1a00] transition hover:bg-amber-300"><Play className="size-4 fill-current" /> {isArabic ? "تشغيل هنا" : "Play here"}</button><Link href={`/details/${clip.mediaType}/${clip.id}`} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-white transition hover:bg-white/10"><ExternalLink className="size-4" /> {isArabic ? "التفاصيل" : "Details"}</Link></div></div>
          </article>;
        })}</div>}
      </section>
    </CinemaLayout>
  );
}
