import { getTranslations } from "next-intl/server";
import { getArticles } from "@/lib/directus";
import { NewsCard } from "@/components/NewsCard";
import type { Locale } from "@/lib/types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "pl" ? "Aktualności" : "News",
  };
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("news");
  const articles = await getArticles(locale, 50);

  return (
    <div className="section">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">{t("title")}</h1>
        <p className="text-gray-600">{t("subtitle")}</p>
      </div>

      {articles.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No news yet. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
