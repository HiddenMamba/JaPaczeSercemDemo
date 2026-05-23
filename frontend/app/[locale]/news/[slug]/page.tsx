import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getArticle, getArticles, assetUrl } from "@/lib/directus";
import type { Locale } from "@/lib/types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getArticles("en", 100);
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticle(slug, locale);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt ?? article.body.slice(0, 160),
    openGraph: article.cover_image
      ? { images: [{ url: assetUrl(article.cover_image.id, { width: "1200", height: "630", fit: "cover" }) }] }
      : undefined,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations("news");
  const article = await getArticle(slug, locale);

  if (!article) notFound();

  const publishedDate = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(article.published_at));

  return (
    <article className="section max-w-3xl">
      <Link href="/news" className="text-brand-600 hover:text-brand-700 text-sm font-medium mb-8 inline-block">
        ← {t("title")}
      </Link>

      {article.cover_image && (
        <div className="aspect-video relative rounded-2xl overflow-hidden mb-8 bg-gray-100">
          <Image
            src={assetUrl(article.cover_image.id, { width: "1200", height: "675", fit: "cover" })}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{article.title}</h1>

      <p className="text-sm text-gray-400 mb-8">
        {t("published", { date: publishedDate })}
      </p>

      <div
        className="prose-content"
        dangerouslySetInnerHTML={{ __html: article.body }}
      />
    </article>
  );
}
