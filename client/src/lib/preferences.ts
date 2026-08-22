export type StoredLanguage = "ar" | "en";
export type StoredTheme = "gold" | "ocean" | "plum";

export type StoredPreferences = { language: StoredLanguage; theme: StoredTheme };

const fallback: StoredPreferences = { language: "ar", theme: "gold" };

export function parsePreferences(value: string | null): StoredPreferences {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value) as Partial<StoredPreferences>;
    return {
      language: parsed.language === "en" ? "en" : "ar",
      theme: parsed.theme === "ocean" || parsed.theme === "plum" ? parsed.theme : "gold",
    };
  } catch {
    return fallback;
  }
}

export function serializePreferences(value: StoredPreferences) {
  return JSON.stringify(value);
}
