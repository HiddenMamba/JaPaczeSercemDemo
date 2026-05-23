import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { assetUrl } from "@/lib/directus";
import type { NewsArticleResolved, Locale } from "@/lib/types";

interface Props {
  article: NewsArticleResolved;
  locale: Locale;
}

export function NewsCard({ article, locale }: Props) {
  const t = useTranslations("news");

  const publishedDate = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(article.published_at));

  return (
    <Link href={`/news/${article.slug}`} className="card flex flex-col group">
      {/* Cover image */}
      <div className="aspect-video relative bg-gray-100 overflow-hidden">
        {article.cover_image ? (
          <Image
            src={assetUrl(article.cover_image.id, { width: "600", height: "338", fit: "cover" })}
            alt={article.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📰</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-2">{publishedDate}</p>
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-brand-600 transition">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-gray-500 line-clamp-3 flex-1">{article.excerpt}</p>
        )}
        <span className="text-brand-600 text-sm font-medium mt-3">{t("read_more")}</span>
      </div>
    </Link>
  );
}
