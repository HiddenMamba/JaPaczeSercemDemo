import { getTranslations } from "next-intl/server";
import { getPage, getDocuments } from "@/lib/directus";
import { DocumentList } from "@/components/DocumentList";
import type { Locale } from "@/lib/types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "pl" ? "O nas" : "About Us" };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("about");

  const [page, documents] = await Promise.all([
    getPage("about", locale),
    getDocuments(locale),
  ]);

  return (
    <div className="section max-w-4xl">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8">
        {page?.title || t("title")}
      </h1>

      {page?.content ? (
        <div
          className="prose-content mb-16"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        <div className="mb-16 p-6 bg-orange-50 rounded-xl border border-orange-100">
          <p className="text-orange-700 text-sm">
            💡 {locale === "pl"
              ? "Treść tej strony możesz edytować w panelu administracyjnym → Strony → about."
              : "Edit this page content in the admin panel → Pages → about."}
          </p>
        </div>
      )}

      {documents.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("documents_title")}</h2>
          <p className="text-gray-600 mb-6">{t("documents_subtitle")}</p>
          <DocumentList documents={documents} />
        </section>
      )}
    </div>
  );
}
