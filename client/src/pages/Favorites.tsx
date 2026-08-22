import CinemaLayout from "@/components/CinemaLayout";
import MediaCard from "@/components/MediaCard";
import { readFavorites, toggleFavorite, writeFavorites, type FavoriteItem } from "@/lib/favorites";
import type { MediaItem } from "@/lib/media";
import { Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAppPreferences } from "@/contexts/AppPreferencesContext";

export default function Favorites() {
  const { language } = useAppPreferences();
  const isArabic = language === "ar";
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  useEffect(() => setFavorites(readFavorites()), []);

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
        <span className="eyebrow">{isArabic ? "مساحتك الخاصة" : "Your space"}</span>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-4xl text-stone-50 sm:text-5xl">{isArabic ? "قائمة مفضلتي" : "My favorites"}</h1><p className="mt-3 text-stone-400">{isArabic ? "محفوظة على جهازك فقط، لتعود إليها في أي وقت." : "Saved only on this device, ready whenever you return."}</p></div><span className="rounded-2xl border border-amber-200/15 bg-amber-300/5 px-4 py-3 text-sm text-amber-200">{favorites.length} {isArabic ? "عملاً محفوظاً" : "saved titles"}</span></div>
      </section>
      <section className="container mt-10">
        {favorites.length ? <div className="media-grid">{favorites.map((favorite) => <MediaCard key={`${favorite.mediaType}-${favorite.id}`} media={{ ...favorite, originalTitle: "", backdropPath: null, genreIds: [] } satisfies MediaItem} isFavorite onToggleFavorite={handleFavorite} />)}</div> : <div className="empty-state"><Heart className="size-8 text-amber-300" /><h2>{isArabic ? "لا توجد أعمال محفوظة بعد" : "No saved titles yet"}</h2><p>{isArabic ? "أضف فيلماً أو مسلسلاً من بطاقة العمل لتجده هنا." : "Save a title from its card and it will appear here."}</p><Link href="/search" className="gold-button mt-3"><Sparkles className="size-4" /> {isArabic ? "ابدأ الاستكشاف" : "Start exploring"}</Link></div>}
      </section>
    </CinemaLayout>
  );
}
