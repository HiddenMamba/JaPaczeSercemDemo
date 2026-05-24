import { getPage, getDocuments } from "@/lib/directus";
import { DocumentList } from "@/components/DocumentList";

export const metadata = { title: "O nas" };
export const dynamic = "force-dynamic";

export default async function ONasPage() {
  const [page, documents] = await Promise.all([
    getPage("about"),
    getDocuments(),
  ]);

  return (
    <div className="section max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
        {page?.title ?? "O nas"}
      </h1>
      {page?.content && (
        <div
          className="prose-content mb-12"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      )}

      {documents.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Dokumenty i raporty</h2>
          <p className="text-gray-500 mb-6">Pobierz nasze raporty finansowe, formularze adopcyjne i inne dokumenty.</p>
          <DocumentList documents={documents} />
        </div>
      )}
    </div>
  );
}
