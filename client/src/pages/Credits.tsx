import CinemaLayout from "@/components/CinemaLayout";
import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

export default function Credits() {
  return (
    <CinemaLayout>
      <section className="container max-w-4xl pt-10 sm:pt-14">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-stone-400 transition hover:text-amber-200"><ArrowRight className="size-4" /> العودة إلى الرئيسية</Link>
        <div className="mt-8 overflow-hidden rounded-[2rem] border border-amber-200/15 bg-gradient-to-br from-amber-300/10 via-[#151218] to-[#0c0b0e] p-6 sm:p-10">
          <span className="eyebrow">الشفافية والإسناد</span>
          <h1 className="mt-4 font-display text-3xl text-stone-100 sm:text-4xl">بيانات HALAPINO ومحتوى TMDB</h1>
          <p className="mt-5 max-w-2xl leading-8 text-stone-300">تعتمد HALAPINO على واجهة TMDB لجلب بيانات الأفلام والمسلسلات والصور. العلامة التجارية الخاصة بـ HALAPINO هي العلامة الأبرز في المنصة، ويُعرض شعار TMDB المعتمد حصراً للإسناد دون أي إيحاء بالشراكة أو الاعتماد.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5"><ShieldCheck className="size-6 text-amber-300" /><h2 className="mt-3 font-display text-lg text-amber-100">الاستخدام غير التجاري</h2><p className="mt-2 text-sm leading-7 text-stone-400">الإصدار الحالي مخصص للاستخدام الشخصي غير التجاري، ولا يتضمن إعلانات أو اشتراكات مدفوعة أو روابط عمولة مرتبطة ببيانات TMDB.</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5"><ShieldCheck className="size-6 text-amber-300" /><h2 className="mt-3 font-display text-lg text-amber-100">حدود المحتوى</h2><p className="mt-2 text-sm leading-7 text-stone-400">لا تُخزَّن بيانات TMDB أو الصور داخل المنصة لفترة طويلة، ولا تُستخدم البيانات لتدريب أنظمة ذكاء اصطناعي أو لأغراض تسويقية مستقلة.</p></div>
          </div>

          <div className="mt-7 rounded-2xl border border-[#01b4e4]/35 bg-[#0d253f]/50 p-5">
            <p dir="ltr" className="text-sm leading-7 text-sky-50">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
            <a href="https://www.themoviedb.org/api-terms-of-use" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-[#90cea1] transition hover:text-white">مراجعة شروط استخدام TMDB الرسمية <ExternalLink className="size-4" /></a>
          </div>
        </div>
      </section>
    </CinemaLayout>
  );
}
