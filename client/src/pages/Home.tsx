import CinemaLayout from "@/components/CinemaLayout";
import MediaCard from "@/components/MediaCard";
import { readFavorites, toggleFavorite, writeFavorites, type FavoriteItem } from "@/lib/favorites";
import { backdropUrl } from "@/lib/media";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Clapperboard, Heart, LibraryBig, LoaderCircle, Play, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAppPreferences } from "@/contexts/AppPreferencesContext";

function Shelf({ title, subtitle, items, favorites, onToggle, moreLabel }: { title: string; subtitle: string; items?: any[]; favorites: FavoriteItem[]; onToggle: (item: FavoriteItem) => void; moreLabel: string }) {
  return <section className="container mt-16"><div className="mb-6 flex items-end justify-between gap-5"><div><span className="eyebrow">{subtitle}</span><h2 className="mt-3 font-display text-3xl text-stone-100">{title}</h2></div><Link href="/search" className="hidden items-center gap-2 text-sm text-amber-200 transition hover:text-amber-100 sm:inline-flex">{moreLabel} <ArrowLeft className="size-4" /></Link></div><div className="media-rail">{items?.map((media) => <MediaCard key={`${media.mediaType}-${media.id}`} media={media} isFavorite={favorites.some((favorite) => favorite.id === media.id && favorite.mediaType === media.mediaType)} onToggleFavorite={onToggle} />)}</div></section>;
}

export default function Home() {
  const { language } = useAppPreferences();
  const isArabic = language === "ar";
  const { data, isLoading, error } = trpc.catalog.home.useQuery();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  useEffect(() => setFavorites(readFavorites()), []);
  const handleFavorite = (item: FavoriteItem) => setFavorites((current) => { const next = toggleFavorite(current, item); writeFavorites(next); return next; });
  const hero = data?.movies?.[0];
  const heroBackdrop = hero ? backdropUrl(hero.backdropPath) : null;

  return <CinemaLayout>
    <section className="relative isolate overflow-hidden border-b border-amber-100/10">
      {heroBackdrop && <img src={heroBackdrop} alt="" className="absolute inset-0 -z-20 size-full object-cover opacity-40" />}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_25%,rgba(203,146,40,.25),transparent_26%),linear-gradient(90deg,#09090b_5%,rgba(9,9,11,.93)_42%,rgba(9,9,11,.45)_100%)]" />
      <div className="container py-16 sm:py-24 lg:py-32"><div className="hero-reveal max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-200/10 px-4 py-2 text-sm text-amber-100"><Clapperboard className="size-4" /> {isArabic ? "تجربة اكتشاف سينمائية عربية" : "A cinematic discovery experience"}</span><h1 className="mt-7 font-display text-5xl leading-[1.18] text-white sm:text-6xl lg:text-7xl">{isArabic ? <>كل حكاية عظيمة تبدأ من <span className="text-amber-300">مشهدٍ واحد</span>.</> : <>Every great story starts with <span className="text-amber-300">one scene</span>.</>}</h1><p className="mt-6 max-w-xl text-base leading-8 text-stone-300 sm:text-lg">{isArabic ? "استكشف أعمالاً ومقاطع من مزود الكتالوج المهيأ، أو انتقل تلقائياً إلى مكتبات مجانية مرخّصة عند غياب المفتاح أو تعذر الاستجابة." : "Discover titles from your configured catalog, with an automatic transition to free, licensed libraries when it is unavailable."}</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/search" className="gold-button"><Search className="size-5" /> {isArabic ? "ابدأ البحث" : "Start searching"}</Link><Link href="/public-domain" className="ghost-button"><LibraryBig className="size-5" /> {isArabic ? "المكتبة المجانية" : "Free library"}</Link><Link href="/shorts" className="ghost-button"><Play className="size-5 fill-current" /> {isArabic ? "مقاطع قصيرة" : "Shorts"}</Link></div></div></div>
    </section>
    {isLoading ? <div className="container py-24"><div className="empty-state"><LoaderCircle className="size-8 animate-spin text-amber-300" /><h2>{isArabic ? "نحضّر المشهد الأول..." : "Setting the first scene..."}</h2><p>{isArabic ? "نراجع مصادر المحتوى المتاحة." : "Reviewing available content sources."}</p></div></div> : error ? <div className="container py-24"><div className="empty-state"><Clapperboard className="size-8 text-amber-300" /><h2>{isArabic ? "تعذر تحميل الكتالوج" : "Catalog unavailable"}</h2><p>{isArabic ? "يرجى تحديث الصفحة أو المحاولة لاحقاً." : "Refresh the page or try again later."}</p></div></div> : <><Shelf title={isArabic ? "أعمال مختارة" : "Featured titles"} subtitle={data?.activeSource === "catalog-api" ? (isArabic ? "من مزودك المهيأ" : "From your configured provider") : (isArabic ? "من مكتبة مرخّصة" : "From a licensed library")} items={data?.movies} favorites={favorites} onToggle={handleFavorite} moreLabel={isArabic ? "استكشف المزيد" : "Explore more"} />{data?.shows?.length ? <Shelf title={isArabic ? "مسلسلات تستحق المشاهدة" : "Series worth watching"} subtitle={isArabic ? "عروض الشاشة الصغيرة" : "Small-screen picks"} items={data?.shows} favorites={favorites} onToggle={handleFavorite} moreLabel={isArabic ? "استكشف المزيد" : "Explore more"} /> : null}<Shelf title={isArabic ? "اختيارات للمشاهدة" : "Watchlist picks"} subtitle={isArabic ? "لقطات موصى بها" : "Recommended scenes"} items={data?.recommended} favorites={favorites} onToggle={handleFavorite} moreLabel={isArabic ? "استكشف المزيد" : "Explore more"} /></>}
    <section className="container mt-20"><div className="relative overflow-hidden rounded-[2rem] border border-amber-200/15 bg-gradient-to-l from-amber-400/15 to-[#17131c] p-8 sm:p-12"><div className="absolute -left-10 -top-10 size-44 rounded-full bg-amber-300/10 blur-3xl" /><div className="relative max-w-2xl"><Heart className="size-7 text-amber-300" /><h2 className="mt-5 font-display text-3xl text-stone-100">{isArabic ? "اجمع قائمتك الشخصية" : "Build your personal list"}</h2><p className="mt-3 leading-7 text-stone-400">{isArabic ? "احفظ الأعمال التي تثير اهتمامك في المفضلة، وستبقى على جهازك لتعود إليها وقتما تشاء." : "Save titles you love to favorites and keep them on this device for later."}</p><Link href="/favorites" className="ghost-button mt-6">{isArabic ? "فتح المفضلة" : "Open favorites"} <ArrowLeft className="size-4" /></Link></div></div></section>
  </CinemaLayout>;
}
