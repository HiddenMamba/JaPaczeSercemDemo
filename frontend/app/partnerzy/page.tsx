import { getPartners, getPage } from "@/lib/directus";

export const metadata = { title: "Partnerzy" };
export const dynamic = "force-dynamic";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "https://ja-pacze-sercem-cms.onrender.com";

export default async function PartnerzyPage() {
  const [partners, page] = await Promise.all([
    getPartners(),
    getPage("partners"),
  ]);

  return (
    <div className="section max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Partnerzy</h1>
      <p className="text-gray-500 mb-8">Organizacje i firmy, które wspierają naszą misję.</p>

      {page?.content && (
        <div
          className="prose-content mb-10"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      )}

      {partners.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-10 text-center text-gray-400">
          <p className="text-4xl mb-3">🤝</p>
          <p>Informacje o partnerach zostaną wkrótce dodane.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <div key={partner.id} className="card p-6 flex flex-col items-center text-center">
              {/* Logo */}
              {partner.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${DIRECTUS_URL}/assets/${partner.logo.id}`}
                  alt={partner.name}
                  className="h-16 w-auto object-contain mb-4"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mb-4 text-2xl">
                  🤝
                </div>
              )}

              <h3 className="font-bold text-gray-900 text-lg mb-2">{partner.name}</h3>

              {partner.description && (
                <p className="text-gray-500 text-sm mb-4 flex-1">{partner.description}</p>
              )}

              {partner.url && (
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm py-2 px-4 mt-auto"
                >
                  Odwiedź stronę →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
