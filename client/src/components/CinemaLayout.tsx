import { Clapperboard, Heart, Home, Languages, PlaySquare, Search, Settings2, Sparkles } from "lucide-react";
import { useAppPreferences } from "@/contexts/AppPreferencesContext";
import { trpc } from "@/lib/trpc";
import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";

export default function CinemaLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { language, setLanguage, t } = useAppPreferences();
  const { data: sourceStatus } = trpc.sourceConfig.status.useQuery();
  const navigation = [
    { href: "/", label: t.home, icon: Home }, { href: "/search", label: t.discover, icon: Search }, { href: "/shorts", label: t.shorts, icon: Sparkles }, { href: "/public-domain", label: t.library, icon: PlaySquare }, { href: "/favorites", label: t.favorites, icon: Heart },
  ];

  return (
    <div className="cinema-app min-h-screen text-stone-100" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="pointer-events-none fixed inset-0 cinematic-grain opacity-40" />
      <header className="sticky top-0 z-40 border-b border-amber-100/10 bg-[#09090b]/90 backdrop-blur-xl">
        <div className="container flex h-20 items-center justify-between gap-4">
          <Link href="/" className="group flex shrink-0 items-center gap-3 text-right">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 text-[#160e02] shadow-[0_0_32px_rgba(245,158,11,.28)] transition-transform duration-200 group-hover:scale-105">
              <Clapperboard className="size-5" />
            </span>
            <span className="hidden sm:block">
              <strong dir="ltr" className="block font-display text-xl tracking-[0.08em] text-amber-100">HALAPINO</strong>
              <span className="block text-[10px] tracking-[0.16em] text-stone-500">{t.tagline}</span>
            </span>
          </Link>

          <nav aria-label="التنقل الرئيسي" className="flex min-w-0 items-center gap-1 overflow-x-auto py-2">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? location === "/" : location.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition duration-200 sm:px-4 ${active ? "bg-amber-400/12 text-amber-200" : "text-stone-400 hover:bg-white/5 hover:text-stone-100"}`}
                >
                  <Icon className="size-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-2 lg:flex"><button type="button" onClick={() => setLanguage(language === "ar" ? "en" : "ar")} className="icon-utility" aria-label="Change language"><Languages className="size-4" /></button><Link href="/settings" className="icon-utility" aria-label={t.settings}><Settings2 className="size-4" /></Link></div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 mt-20 border-t border-amber-100/10 bg-black/20">
        <div className="container py-8 text-center sm:text-right">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="space-y-1 text-sm text-stone-500"><p>{language === "ar" ? "تُعرض البيانات والصور عبر مصادر قانونية مهيأة." : "Data and images are shown through configured legal sources."}</p><Link href="/credits" className="text-amber-200 transition hover:text-amber-100">{t.credits}</Link></div>
            {sourceStatus?.primaryIsTmdb ? <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" aria-label="زيارة The Movie Database" className="rounded-xl bg-white/95 px-3 py-2 transition hover:bg-white"><img src="/manus-storage/tmdb-approved-logo_c7dc87a4.svg" alt="The Movie Database" className="h-5 w-auto" /></a> : <span className="rounded-xl border border-white/10 px-3 py-2 text-xs text-stone-500">Legal media sources</span>}
            <span className="font-medium text-amber-200">HALAPINO</span>
          </div>
          {sourceStatus?.primaryIsTmdb ? <p dir="ltr" className="mt-5 border-t border-white/8 pt-4 text-[11px] leading-5 text-stone-500">This product uses the TMDB API but is not endorsed or certified by TMDB.</p> : null}
        </div>
      </footer>
    </div>
  );
}
