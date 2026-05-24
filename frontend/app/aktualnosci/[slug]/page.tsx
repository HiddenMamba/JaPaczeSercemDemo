import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArticles, getArticle, assetUrl } from "@/lib/directus";

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const articles = await getArticles(100);
    return articles.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  return { title: article?.title ?? "Aktualność" };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const publishedDate = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(article.published_at));

  return (
    <article className="section max-w-3xl mx-auto">
      <Link href="/aktualnosci" className="link-accent text-sm mb-6 inline-block">
        ← Wszystkie aktualności
      </Link>

      {article.cover_image && (
        <div className="aspect-video relative bg-gray-100 rounded-2xl overflow-hidden mb-8">
          <Image
            src={assetUrl(article.cover_image.id)}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <p className="text-sm text-gray-400 mb-3">Opublikowano {publishedDate}</p>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{article.title}</h1>

      <div
        className="prose-content"
        dangerouslySetInnerHTML={{ __html: article.body }}
      />
    </article>
  );
}
