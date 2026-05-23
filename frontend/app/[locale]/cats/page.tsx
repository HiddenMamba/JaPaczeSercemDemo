import { getTranslations } from "next-intl/server";
import { getCats, getAllTraits } from "@/lib/directus";
import { CatBrowser } from "@/components/CatBrowser";
import type { Locale } from "@/lib/types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "pl" ? "Adoptuj kota" : "Adopt a Cat",
    description: locale === "pl"
      ? "Przeglądaj koty dostępne do adopcji."
      : "Browse cats available for adoption.",
  };
}

export default async function CatsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("cats");

  const [cats, traits] = await Promise.all([
    getCats(locale),
    getAllTraits(locale),
  ]);

  return (
    <div className="section">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
          {t("title")}
        </h1>
        <p className="text-gray-600 max-w-2xl">{t("subtitle")}</p>
      </div>
      {/* CatBrowser is a client component that handles all filtering */}
      <CatBrowser cats={cats} traits={traits} locale={locale} />
    </div>
  );
}
