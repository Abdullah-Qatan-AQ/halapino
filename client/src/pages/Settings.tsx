import CinemaLayout from "@/components/CinemaLayout";
import { useAppPreferences, type AppLanguage, type CinemaTheme } from "@/contexts/AppPreferencesContext";
import { trpc } from "@/lib/trpc";
import { Check, Database, Globe2, KeyRound, LoaderCircle, Palette, Route } from "lucide-react";

const themes: { id: CinemaTheme; ar: string; en: string; swatch: string }[] = [
  { id: "gold", ar: "الذهبي السينمائي", en: "Cinema gold", swatch: "from-amber-200 via-amber-500 to-amber-800" },
  { id: "ocean", ar: "المحيط الليلي", en: "Midnight ocean", swatch: "from-cyan-200 via-cyan-500 to-blue-900" },
  { id: "plum", ar: "البرقوقي", en: "Velvet plum", swatch: "from-fuchsia-200 via-fuchsia-500 to-purple-950" },
];

export default function Settings() {
  const { language, setLanguage, theme, setTheme } = useAppPreferences();
  const { data: sources, isLoading } = trpc.sourceConfig.status.useQuery();
  const isArabic = language === "ar";
  const title = isArabic ? "إعدادات التجربة" : "Experience settings";

  return <CinemaLayout>
    <section className="container pt-10 sm:pt-14">
      <div className="settings-hero"><span className="eyebrow">HALAPINO</span><h1 className="mt-4 font-display text-4xl text-white sm:text-5xl">{title}</h1><p className="mt-4 max-w-2xl leading-8 text-stone-300">{isArabic ? "خصص اللغة والمظهر وراجع ترتيب المصادر القانونية. تبقى المفاتيح على الخادم فقط ولا تُعرض في المتصفح." : "Choose your language and visual mood, and review the legal source order. API keys stay server-side and never appear in the browser."}</p></div>

      <div className="settings-grid mt-8">
        <section className="settings-panel"><div className="settings-title"><Globe2 className="size-5" /><div><h2>{isArabic ? "اللغة" : "Language"}</h2><p>{isArabic ? "تغيير لغة التنقل والإعدادات." : "Change the navigation and settings language."}</p></div></div><div className="mt-5 grid grid-cols-2 gap-3">{(["ar", "en"] as AppLanguage[]).map((item) => <button key={item} type="button" onClick={() => setLanguage(item)} className={`preference-button ${language === item ? "is-active" : ""}`}><span>{item === "ar" ? "العربية" : "English"}</span>{language === item && <Check className="size-4" />}</button>)}</div></section>

        <section className="settings-panel"><div className="settings-title"><Palette className="size-5" /><div><h2>{isArabic ? "المظهر" : "Theme"}</h2><p>{isArabic ? "يتغير فوراً ويُحفظ على هذا الجهاز." : "Applies instantly and stays on this device."}</p></div></div><div className="mt-5 space-y-3">{themes.map((item) => <button key={item.id} type="button" onClick={() => setTheme(item.id)} className={`theme-choice ${theme === item.id ? "is-active" : ""}`}><span className={`size-9 rounded-xl bg-gradient-to-br ${item.swatch}`} /><span>{isArabic ? item.ar : item.en}</span>{theme === item.id && <Check className="mr-auto size-4" />}</button>)}</div></section>

        <section className="settings-panel settings-panel-wide"><div className="settings-title"><Route className="size-5" /><div><h2>{isArabic ? "سلسلة المصادر القانونية" : "Legal source chain"}</h2><p>{isArabic ? "عند فشل مصدر أو غياب مفتاحه، ينتقل التطبيق تلقائياً إلى المصدر التالي." : "If a provider is unavailable or unconfigured, HALAPINO moves to the next provider."}</p></div></div>{isLoading ? <div className="mt-6 inline-flex items-center gap-2 text-stone-400"><LoaderCircle className="size-4 animate-spin" />{isArabic ? "نراجع حالة المصادر..." : "Checking providers..."}</div> : <div className="mt-6 source-chain">{sources?.orderedSources.map((source, index) => <div className="source-step" key={source}><span className="source-index">{index + 1}</span><div><strong>{source === "catalog-api" ? (isArabic ? "واجهة كتالوج مهيأة" : "Configured catalog API") : source === "internet-archive" ? "Internet Archive" : "Wikimedia Commons"}</strong><p>{source === "catalog-api" ? (sources.primaryConfigured ? (isArabic ? "مهيأ على الخادم" : "Configured on server") : (isArabic ? "المفتاح فارغ — يتم تجاوزه" : "Key is empty — skipped")) : (isArabic ? "احتياطي قانوني دون مفتاح" : "Legal keyless fallback")}</p></div></div>)}</div>}</section>

        <section className="settings-panel settings-panel-wide"><div className="settings-title"><KeyRound className="size-5" /><div><h2>{isArabic ? "مفاتيح المصادر" : "Provider keys"}</h2><p>{isArabic ? "تبقى الحقول التالية فارغة حتى تضيف خدمة كتالوج قانونية متوافقة معها." : "These entries stay blank until you add a compatible legal catalog service."}</p></div></div><div className="secret-slots mt-5"><div><code>CATALOG_API_BASE_URL=</code><span>{isArabic ? "رابط API لمزود قانوني متوافق" : "Base URL for a compatible legal provider"}</span></div><div><code>CATALOG_API_KEY=</code><span>{isArabic ? "مفتاح خاص بالخادم فقط" : "Server-side key only"}</span></div></div><p className="mt-5 text-sm leading-7 text-stone-400"><Database className="ml-2 inline size-4 text-[var(--cinema-accent)]" />{isArabic ? "لا تضع المفاتيح في المتصفح أو ملفات الكود؛ أضفها من إعدادات أسرار بيئة النشر. حتى ذلك الحين ستعمل المكتبة القانونية الاحتياطية تلقائياً." : "Never enter secrets in browser fields or source files; add them in deployment secrets. Until then, the legal fallback library works automatically."}</p></section>
      </div>
    </section>
  </CinemaLayout>;
}
