import { Heart, Play, Star } from "lucide-react";
import { Link } from "wouter";
import { favoriteKey, type FavoriteItem } from "@/lib/favorites";
import { mediaLabel, posterUrl, releaseYear, type MediaItem } from "@/lib/media";
import { useAppPreferences } from "@/contexts/AppPreferencesContext";

type MediaCardProps = {
  media: MediaItem;
  isFavorite?: boolean;
  onToggleFavorite?: (item: FavoriteItem) => void;
  showOverview?: boolean;
};

export default function MediaCard({ media, isFavorite = false, onToggleFavorite, showOverview = false }: MediaCardProps) {
  const { language } = useAppPreferences();
  const isArabic = language === "ar";
  const poster = posterUrl(media.posterPath);
  const favorite: FavoriteItem = {
    id: media.id,
    mediaType: media.mediaType,
    title: media.title,
    overview: media.overview,
    posterPath: media.posterPath,
    voteAverage: media.voteAverage,
    releaseDate: media.releaseDate,
  };

  return (
    <article className="group relative min-w-0 overflow-hidden rounded-[1.35rem] border border-white/8 bg-[#121116] shadow-[0_20px_50px_rgba(0,0,0,.24)] transition duration-300 hover:-translate-y-1 hover:border-amber-300/35 hover:shadow-[0_26px_60px_rgba(0,0,0,.48)]">
      <Link href={`/details/${media.mediaType}/${media.id}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden bg-stone-900">
          {poster ? (
            <img src={poster} alt={`${isArabic ? "ملصق" : "Poster for"} ${media.title}`} className="size-full object-cover transition duration-500 group-hover:scale-[1.06]" loading="lazy" />
          ) : (
            <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_50%_25%,#5d4a25,transparent_45%),#1d1a20] text-stone-500">
              <Play className="size-9" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#121116] via-[#121116]/15 to-transparent" />
          <span className="absolute right-3 top-3 rounded-full border border-amber-200/20 bg-black/60 px-2.5 py-1 text-xs font-medium text-amber-100 backdrop-blur-sm">{isArabic ? mediaLabel(media.mediaType) : media.mediaType === "movie" ? "Movie" : "Series"}</span>
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-[#251700]">
            <Star className="size-3 fill-current" /> {media.voteAverage.toFixed(1)}
          </span>
        </div>
      </Link>

      {onToggleFavorite && (
        <button
          type="button"
          aria-label={isFavorite ? (isArabic ? `إزالة ${media.title} من المفضلة` : `Remove ${media.title} from favorites`) : (isArabic ? `إضافة ${media.title} إلى المفضلة` : `Add ${media.title} to favorites`)}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(favorite)}
          className={`absolute left-3 top-3 grid size-9 place-items-center rounded-full border backdrop-blur-md transition active:scale-95 ${isFavorite ? "border-amber-300 bg-amber-400 text-[#2d1b01]" : "border-white/15 bg-black/50 text-white hover:border-amber-200 hover:text-amber-200"}`}
        >
          <Heart className={`size-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      )}

      <div className="space-y-2 p-4">
        <Link href={`/details/${media.mediaType}/${media.id}`} className="block truncate font-display text-base text-stone-100 transition hover:text-amber-200">{media.title}</Link>
        <p className="text-xs text-stone-500">{releaseYear(media.releaseDate)} <span className="mx-1 text-stone-700">•</span> {media.originalTitle || (isArabic ? "عنوان أصلي غير متاح" : "Original title unavailable")}</p>
        {showOverview && <p className="line-clamp-2 text-sm leading-6 text-stone-400">{media.overview}</p>}
      </div>
    </article>
  );
}
