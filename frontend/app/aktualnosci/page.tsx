export const dynamic = "force-dynamic";
import { getArticles } from "@/lib/directus";
import { NewsCard } from "@/components/NewsCard";

export const metadata = { title: "Aktualności" };

export default async function AktualnosciPage() {
  const articles = await getArticles(50);

  return (
    <div className="section">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Aktualności</h1>
        <p className="text-gray-500">Historie, aktualizacje i ogłoszenia z fundacji.</p>
      </div>
      {articles.length === 0 ? (
        <p className="text-gray-500 text-center py-16">Brak aktualności.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
