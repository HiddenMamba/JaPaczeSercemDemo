export const dynamic = "force-dynamic";
import Link from "next/link";
import { getCats, getArticles, getForeverHomePhotos, getHomepageStats, getSiteSettings } from "@/lib/directus";
import { CatCard } from "@/components/CatCard";
import { NewsCard } from "@/components/NewsCard";
import { CatRandomizerButton } from "@/components/CatRandomizer";
import { ForeverHomeStrip } from "@/components/ForeverHomeStrip";

export default async function HomePage() {
  const [cats, articles, siteSettings, foreverHomePhotos] = await Promise.all([
    getCats({ status: "available" }),
    getArticles(3),
    getSiteSettings(),
    getForeverHomePhotos(12),
  ]);

  const stats = await getHomepageStats(siteSettings.cats_adopted_before_website);
  // Show newest cats first (by date_joined desc, then by id desc as fallback)
  const featuredCats = [...cats]
    .sort((a, b) => {
      const aDate = a.date_joined ?? "";
      const bDate = b.date_joined ?? "";
      if (bDate !== aDate) return bDate > aDate ? 1 : -1;
      return b.id > a.id ? 1 : -1;
    })
    .slice(0, 6);
  const yearsActive = siteSettings.founded_year
    ? new Date().getFullYear() - siteSettings.founded_year
    : null;

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{ background: "linear-gradient(135deg, var(--ps-primary-soft,#fff8f4) 0%, #ffffff 50%, var(--ps-primary-soft,#fff8f4) 100%)" }}>
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none text-[20rem] leading-none text-center">
          🐱
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            Daj kotu dom na zawsze
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto">
            Przeglądaj nasze koty szukające kochających rodzin i otwórz swoje serce już dziś.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link href="/wesprzyj-nas" className="btn-primary text-lg px-10 py-5 shadow-md hover:shadow-lg">
              Dowiedz się jak możesz nam pomóc ❤️
            </Link>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/koty" className="btn-secondary text-base px-8 py-4">
                Poznaj nasze koty
              </Link>
              <CatRandomizerButton label="Losuj kota 🎲" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Cats ── */}
      <section className="section">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Wyróżnione koty</h2>
          <Link href="/koty" className="link-accent text-sm">
            Wszystkie koty →
          </Link>
        </div>
        {featuredCats.length === 0 ? (
          <p className="text-gray-500 text-center py-12">Brak kotów w tej chwili. Sprawdź wkrótce!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCats.map((cat) => (
              <CatCard key={cat.id} cat={cat} />
            ))}
          </div>
        )}
      </section>

      {/* ── Stats Banner ── */}
      <section className="border-y py-12 px-4" style={{ backgroundColor: "var(--ps-primary-soft,#fff8f4)", borderColor: "var(--ps-primary-muted,#ffe8db)" }}>
        <div className={`max-w-4xl mx-auto grid gap-8 text-center ${yearsActive ? "grid-cols-3" : "grid-cols-2"}`}>
          <div>
            <div className="text-4xl font-extrabold" style={{ color: "var(--ps-primary)" }}>{stats.available}</div>
            <div className="text-gray-600 mt-1 text-sm">Kotów szuka domu</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold" style={{ color: "var(--ps-primary)" }}>{stats.adopted}+</div>
            <div className="text-gray-600 mt-1 text-sm">Kotów znalazło dom</div>
          </div>
          {yearsActive && (
            <div>
              <div className="text-4xl font-extrabold" style={{ color: "var(--ps-primary)" }}>{yearsActive}+</div>
              <div className="text-gray-600 mt-1 text-sm">Lat działalności</div>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Koty w domach stałych</h2>
            <p className="text-sm text-gray-500 mt-1">
              Najnowsze zdjęcia naszych podopiecznych, które już są u siebie.
            </p>
          </div>
          <Link href="/koty-w-domach-stalych" className="link-accent text-sm">
            Wszystkie zdjęcia →
          </Link>
        </div>
        <ForeverHomeStrip photos={foreverHomePhotos} />
      </section>

      {/* ── Latest News ── */}
      {articles.length > 0 && (
        <section className="section">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Ostatnie aktualności</h2>
            <Link href="/aktualnosci" className="link-accent text-sm">
              Wszystkie aktualności →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
