import Image from "next/image";
import Link from "next/link";
import { assetUrl } from "@/lib/directus";
import type { NewsArticleResolved } from "@/lib/types";

interface Props {
  article: NewsArticleResolved;
}

export function NewsCard({ article }: Props) {
  const publishedDate = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(article.published_at));

  return (
    <Link href={`/aktualnosci/${article.slug}`} className="card flex flex-col group">
      <div className="aspect-video relative bg-gray-100 overflow-hidden">
        {article.cover_image ? (
          <Image
            src={assetUrl(article.cover_image.id)}
            alt={article.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📰</div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-2">{publishedDate}</p>
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-brand-600 transition">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-gray-500 line-clamp-3 flex-1">{article.excerpt}</p>
        )}
        <span className="text-brand-600 text-sm font-medium mt-3">Czytaj więcej →</span>
      </div>
    </Link>
  );
}
