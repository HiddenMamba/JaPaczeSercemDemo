import { getAdoptionQuestions, getCat, getSocialLinks } from "@/lib/directus";
import { AdoptionForm } from "@/components/AdoptionForm";

export const metadata = { title: "Formularz adopcyjny" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ cat?: string }>;
}

export default async function AdoptujPage({ searchParams }: Props) {
  const { cat: catSlug } = await searchParams;

  const [questions, selectedCat, socialLinks] = await Promise.all([
    getAdoptionQuestions(),
    catSlug ? getCat(catSlug) : Promise.resolve(null),
    getSocialLinks(),
  ]);

  return (
    <div className="section max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Formularz adopcyjny</h1>
      <p className="text-gray-500 mb-8">Wypełnij formularz, a wygenerujemy gotową wiadomość do wysłania.</p>
      <AdoptionForm
        questions={questions}
        catName={selectedCat?.name ?? null}
        catSlug={catSlug ?? null}
        locale="pl"
        socialLinks={socialLinks}
      />
    </div>
  );
}
