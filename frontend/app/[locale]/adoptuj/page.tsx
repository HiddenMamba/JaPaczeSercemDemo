import { getAdoptionQuestions } from "@/lib/directus";
import { getCat } from "@/lib/directus";
import { AdoptionForm } from "@/components/AdoptionForm";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ cat?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "pl" ? "Formularz adopcyjny" : "Adoption Form",
  };
}

export default async function AdoptujPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { cat: catSlug } = await searchParams;

  const [questions, cat] = await Promise.all([
    getAdoptionQuestions(),
    catSlug ? getCat(catSlug, locale) : Promise.resolve(null),
  ]);

  const pl = locale === "pl";

  return (
    <div className="section max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link href={cat ? `/cats/${cat.slug}` : "/cats"} className="text-orange-600 hover:text-orange-700 text-sm font-medium mb-4 inline-block">
          ← {pl ? "Wróć" : "Back"}
        </Link>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          {pl ? "Formularz adopcyjny" : "Adoption Form"}
        </h1>

        {cat && (
          <div className="flex items-center gap-3 mt-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <span className="text-2xl">🐱</span>
            <div>
              <p className="text-sm text-gray-500">{pl ? "Wybrany kot:" : "Selected cat:"}</p>
              <p className="font-bold text-gray-900 text-lg">{cat.name}</p>
            </div>
          </div>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <p>{pl ? "Formularz adopcyjny jest w przygotowaniu." : "Adoption form coming soon."}</p>
        </div>
      ) : (
        <AdoptionForm
          questions={questions}
          catName={cat?.name ?? null}
          catSlug={cat?.slug ?? null}
          locale={locale}
        />
      )}
    </div>
  );
}
