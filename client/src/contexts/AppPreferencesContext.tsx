import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { parsePreferences, serializePreferences } from "@/lib/preferences";

export type AppLanguage = "ar" | "en";
export type CinemaTheme = "gold" | "ocean" | "plum";

type Copy = {
  home: string;
  discover: string;
  shorts: string;
  library: string;
  favorites: string;
  settings: string;
  tagline: string;
  credits: string;
};

const copy: Record<AppLanguage, Copy> = {
  ar: { home: "الرئيسية", discover: "استكشف", shorts: "مقاطع قصيرة", library: "المكتبة المجانية", favorites: "مفضلتي", settings: "الإعدادات", tagline: "دليلك السينمائي العربي", credits: "الإسناد وشروط الاستخدام" },
  en: { home: "Home", discover: "Discover", shorts: "Shorts", library: "Free library", favorites: "Favorites", settings: "Settings", tagline: "Your Arabic cinema guide", credits: "Credits & terms" },
};

type Preferences = { language: AppLanguage; theme: CinemaTheme; setLanguage: (value: AppLanguage) => void; setTheme: (value: CinemaTheme) => void; t: Copy };
const PreferencesContext = createContext<Preferences | undefined>(undefined);
const storageKey = "halapino:preferences";

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const stored = () => parsePreferences(localStorage.getItem(storageKey));
  const [language, setLanguage] = useState<AppLanguage>(() => stored().language);
  const [theme, setTheme] = useState<CinemaTheme>(() => stored().theme);

  useEffect(() => {
    localStorage.setItem(storageKey, serializePreferences({ language, theme }));
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.cinemaTheme = theme;
  }, [language, theme]);

  const value = useMemo(() => ({ language, theme, setLanguage, setTheme, t: copy[language] }), [language, theme]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function useAppPreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("useAppPreferences must be used within AppPreferencesProvider");
  return context;
}
