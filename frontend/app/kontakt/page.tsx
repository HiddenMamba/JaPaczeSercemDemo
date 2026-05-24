import { getPage } from "@/lib/directus";
import { ContactForm } from "@/components/ContactForm";

export const metadata = { title: "Kontakt" };

export const dynamic = "force-dynamic";

export default async function KontaktPage() {
  const page = await getPage("contact").catch(() => null);

  return (
    <div className="section max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
        {page?.title ?? "Kontakt"}
      </h1>
      <p className="text-gray-500 mb-8">Masz pytanie lub chcesz adoptować? Skontaktuj się z nami!</p>
      {page?.content && (
        <div
          className="prose-content mb-8"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      )}
      <ContactForm />
    </div>
  );
}
