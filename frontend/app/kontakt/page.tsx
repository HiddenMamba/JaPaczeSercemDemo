import { getPage, getSiteSettings } from "@/lib/directus";
import { ContactForm } from "@/components/ContactForm";

export const metadata = { title: "Kontakt" };
export const dynamic = "force-dynamic";

export default async function KontaktPage() {
  const [page, siteSettings] = await Promise.all([
    getPage("contact"),
    getSiteSettings(),
  ]);

  return (
    <div className="section max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
        {page?.title ?? "Kontakt"}
      </h1>
      <p className="text-gray-500 mb-6">Masz pytanie lub chcesz adoptować? Odezwij się!</p>

      {page?.content && (
        <div
          className="prose-content mb-8"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      )}

      {siteSettings.contact_email_visible && siteSettings.contact_email && (
        <div className="bg-brand-50 rounded-xl px-5 py-4 mb-8 flex items-center gap-3">
          <span className="text-2xl">✉️</span>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">E-mail</p>
            <a
              href={`mailto:${siteSettings.contact_email}`}
              className="text-brand-600 hover:underline font-medium"
            >
              {siteSettings.contact_email}
            </a>
          </div>
        </div>
      )}

      {siteSettings.contact_form_enabled ? (
        <ContactForm />
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
          <p className="mb-2">Formularz kontaktowy jest chwilowo niedostępny.</p>
          {siteSettings.contact_email && (
            <a href={`mailto:${siteSettings.contact_email}`} className="text-brand-600 hover:underline">
              Napisz do nas bezpośrednio →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
