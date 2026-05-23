import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCats, getArticles, getHomepageStats, getSiteSettings } from "@/lib/directus";
import { CatCard } from "@/components/CatCard";
import { NewsCard } from "@/components/NewsCard";
import { CatRandomizerButton } from "@/components/CatRandomizer";
import type { Locale } from "@/lib/types";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("home");

  const [cats, articles, siteSettings] = await Promise.all([
    getCats(locale, { status: "available" }),
    getArticles(locale, 3),
    getSiteSettings(),
  ]);

  const stats = await getHomepageStats(siteSettings.cats_adopted_before_website);
  const featuredCats = cats.slice(0, 6);
  const yearsActive = siteSettings.founded_year
    ? new Date().getFullYear() - siteSettings.founded_year
    : null;

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-brand-50 to-orange-50 py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none text-[20rem] leading-none text-center">
          🐱
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            {t("hero_title")}
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto">
            {t("hero_subtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/cats" className="btn-primary text-base px-8 py-4">
              {t("cta_browse")}
            </Link>
            <CatRandomizerButton locale={locale} label={t("cta_randomize")} />
          </div>
        </div>
      </section>

      {/* ── Featured Cats ── */}
      <section className="section">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{t("featured_cats")}</h2>
          <Link href="/cats" className="text-brand-600 hover:text-brand-700 font-medium text-sm">
            {t("see_all_cats")} →
          </Link>
        </div>
        {featuredCats.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No cats available at the moment. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCats.map((cat) => (
              <CatCard key={cat.id} cat={cat} locale={locale} />
            ))}
          </div>
        )}
      </section>

      {/* ── Stats Banner ── */}
      <section className="bg-orange-500 py-12 px-4">
        <div className={`max-w-4xl mx-auto grid gap-8 text-center text-white ${yearsActive ? "grid-cols-3" : "grid-cols-2"}`}>
          <div>
            {/* Available cats: precise number, no + */}
            <div className="text-4xl font-extrabold">{stats.available}</div>
            <div className="text-orange-100 mt-1 text-sm">
              {locale === "pl" ? "Kotów szuka domu" : "Cats looking for home"}
            </div>
          </div>
          <div>
            {/* Adopted: DB count + pre-website count, show + to indicate "at least" */}
            <div className="text-4xl font-extrabold">{stats.adopted}+</div>
            <div className="text-orange-100 mt-1 text-sm">
              {locale === "pl" ? "Kotów znalazło dom" : "Cats rehomed"}
            </div>
          </div>
          {yearsActive && (
            <div>
              <div className="text-4xl font-extrabold">{yearsActive}+</div>
              <div className="text-orange-100 mt-1 text-sm">
                {locale === "pl" ? "Lat działalności" : "Years of care"}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Latest News ── */}
      {articles.length > 0 && (
        <section className="section">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{t("latest_news")}</h2>
            <Link href="/news" className="text-brand-600 hover:text-brand-700 font-medium text-sm">
              {t("see_all_news")} →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
