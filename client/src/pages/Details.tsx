// @ts-nocheck
import CinemaLayout from "@/components/CinemaLayout";
import MediaCard from "@/components/MediaCard";
import { readFavorites, toggleFavorite, writeFavorites, type FavoriteItem } from "@/lib/favorites";
import { backdropUrl, posterUrl, releaseYear } from "@/lib/media";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CalendarDays, Clock3, Heart, LoaderCircle, Play, Star, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";

export default function Details() {
  const params = useParams<{ mediaType: "movie" | "tv"; id: string }>();
  const mediaType = params.mediaType === "tv" ? "tv" : "movie";
  const id = Number(params.id);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  useEffect(() => setFavorites(readFavorites()), []);
  const { data, isLoading, error } = trpc.catalog.details.useQuery({ mediaType, id }, { enabled: Number.isFinite(id) });

  if (isLoading) return <CinemaLayout><div className="container py-28"><div className="empty-state"><LoaderCircle className="size-8 animate-spin text-amber-300" /><h1>نفتح ستار التفاصيل...</h1></div></div></CinemaLayout>;
  if (error || !data) return <CinemaLayout><div className="container py-28"><div className="empty-state"><h1>تعذر العثور على هذا العمل</h1><Link href="/search" className="gold-button mt-3"><ArrowRight className="size-4" /> العودة إلى الاستكشاف</Link></div></div></CinemaLayout>;

  const isFavorite = favorites.some((favorite) => favorite.id === data.id && favorite.mediaType === data.mediaType);
  const handleFavorite = () => setFavorites((current) => {
    const item: FavoriteItem = { id: data.id, mediaType: data.mediaType, title: data.title, overview: data.overview, posterPath: data.posterPath, voteAverage: data.voteAverage, releaseDate: data.releaseDate };
    const next = toggleFavorite(current, item);
    writeFavorites(next);
    return next;
  });
  const backdrop = backdropUrl(data.backdropPath) || posterUrl(data.posterPath);

  return <CinemaLayout>
    <section className="relative overflow-hidden border-b border-white/10">
      {backdrop && <img src={backdrop} alt="" className="absolute inset-0 size-full object-cover opacity-30" />}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#09090b_0%,rgba(9,9,11,.86)_45%,rgba(9,9,11,.58)_100%)]" />
      <div className="container relative py-10 sm:py-16"><Link href="/search" className="inline-flex items-center gap-2 text-sm text-stone-300 transition hover:text-amber-200"><ArrowRight className="size-4" /> العودة إلى الاستكشاف</Link><div className="mt-8 grid items-end gap-8 md:grid-cols-[230px_1fr]"><div className="mx-auto w-full max-w-[230px] overflow-hidden rounded-[1.5rem] border border-white/15 bg-stone-900 shadow-2xl"><img src={posterUrl(data.posterPath) || ""} alt={`ملصق ${data.title}`} className="aspect-[2/3] w-full object-cover" /></div><div><span className="eyebrow">{data.mediaType === "movie" ? "فيلم" : "مسلسل"}</span><h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-white sm:text-6xl">{data.title}</h1><p className="mt-4 text-sm text-stone-400">{data.originalTitle}</p><div className="mt-5 flex flex-wrap gap-3 text-sm"><span className="metric"><Star className="size-4 fill-amber-300 text-amber-300" /> {data.voteAverage.toFixed(1)} من 10</span><span className="metric"><CalendarDays className="size-4" /> {releaseYear(data.releaseDate)}</span>{data.runtime ? <span className="metric"><Clock3 className="size-4" /> {data.runtime} دقيقة</span> : null}</div><div className="mt-6 flex flex-wrap gap-2">{data.genres.map((genre) => <span key={genre.id} className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs text-stone-300">{genre.name}</span>)}</div><button type="button" onClick={handleFavorite} className={`mt-7 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition active:scale-95 ${isFavorite ? "bg-amber-400 text-[#2a1800]" : "border border-amber-200/30 bg-black/25 text-amber-100 hover:bg-amber-400 hover:text-[#2a1800]"}`}><Heart className={`size-4 ${isFavorite ? "fill-current" : ""}`} />{isFavorite ? "محفوظ في المفضلة" : "أضف إلى المفضلة"}</button></div></div></div>
    </section>
    <section className="container grid gap-10 py-12 lg:grid-cols-[1.5fr_.8fr]"><div className="space-y-11"><div><h2 className="section-title">القصة</h2><p className="mt-4 max-w-3xl text-base leading-8 text-stone-300">{data.overview}</p></div>{data.playbackUrl ? <div><h2 className="section-title">المشاهدة داخل المنصة</h2><div className="mt-4 aspect-video overflow-hidden rounded-[1.5rem] border border-emerald-200/20 bg-black shadow-2xl">{data.activeSource === "wikimedia" ? <video className="size-full" controls src={data.playbackUrl} poster={posterUrl(data.posterPath) || undefined} /> : <iframe className="size-full" src={data.playbackUrl} title={`مشاهدة ${data.title} داخل المنصة`} allowFullScreen />}</div></div> : data.trailerKey ? <div><h2 className="section-title">المقطع الترويجي</h2><div className="mt-4 aspect-video overflow-hidden rounded-[1.5rem] border border-white/10 bg-black shadow-2xl"><iframe className="size-full" src={`https://www.youtube-nocookie.com/embed/${data.trailerKey}`} title={`المقطع الترويجي لفيلم ${data.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></div> : null}<div><h2 className="section-title">طاقم التمثيل</h2>{data.cast.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{data.cast.map((person) => <div key={person.id} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[.035] p-3"><div className="size-12 overflow-hidden rounded-full bg-stone-800">{person.profilePath ? <img src={posterUrl(person.profilePath, "w185") || ""} alt={person.name} className="size-full object-cover" /> : <UsersRound className="m-3 size-6 text-stone-500" />}</div><div><h3 className="text-sm font-medium text-stone-100">{person.name}</h3><p className="mt-0.5 text-xs text-stone-500">{person.character || "طاقم التمثيل"}</p></div></div>)}</div> : <p className="mt-4 text-stone-500">لا تتوفر معلومات الطاقم بالعربية لهذا العمل.</p>}</div></div><aside className="space-y-7"><div className="rounded-[1.45rem] border border-amber-200/15 bg-gradient-to-br from-amber-300/10 to-transparent p-5"><h2 className="font-display text-xl text-amber-100">خيارات المشاهدة القانونية</h2>{data.providers.length ? <><p className="mt-3 text-sm leading-6 text-stone-400">{data.activeSource === "catalog-api" ? "تتوفر لدى مزوّدي الخدمة التاليين وفق بيانات الكتالوج." : "يعرض هذا المصدر عملاً مرخّصاً للمشاهدة داخل المنصة."}</p><div className="mt-4 flex flex-wrap gap-2">{data.providers.map((provider) => <span key={provider.id} className="rounded-xl bg-black/30 px-3 py-2 text-xs text-stone-200">{provider.name}</span>)}</div>{data.providerLink ? <a href={data.providerLink} target="_blank" rel="noreferrer" className="gold-button mt-5 w-full justify-center"><Play className="size-4" /> عرض الترخيص</a> : null}</> : <p className="mt-3 text-sm leading-6 text-stone-400">لا تتوفر خيارات مشاهدة موثقة لمنطقتك حالياً.</p>}</div>{data.recommendations.length ? <div><h2 className="section-title">قد يعجبك أيضاً</h2><div className="mt-4 grid grid-cols-2 gap-3">{data.recommendations.slice(0, 4).map((media) => <MediaCard key={`${media.mediaType}-${media.id}`} media={media} />)}</div></div> : null}</aside></section>
  </CinemaLayout>;
}
