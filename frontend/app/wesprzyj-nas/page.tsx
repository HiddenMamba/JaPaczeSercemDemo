import { getSupportMethods, getPage } from "@/lib/directus";

export const metadata = { title: "Wesprzyj nas" };
export const dynamic = "force-dynamic";

const TYPE_CONFIG = {
  info:         { icon: "ℹ️",  color: "border-blue-200 bg-blue-50" },
  account:      { icon: "🏦",  color: "border-green-200 bg-green-50" },
  link:         { icon: "🔗",  color: "border-purple-200 bg-purple-50" },
  crowdfunding: { icon: "❤️",  color: "border-ps-muted bg-ps-soft" },
};

export default async function WesprzyJNasPage() {
  const [methods, page] = await Promise.all([
    getSupportMethods(),
    getPage("support"),
  ]);

  return (
    <div className="section max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Wesprzyj nas</h1>
      <p className="text-gray-500 mb-8">
        Twoja pomoc pozwala nam opiekować się kotami i znajdować im kochające domy.
        Każde wsparcie - duże czy małe - ma ogromne znaczenie!
      </p>

      {page?.content && (
        <div
          className="prose-content mb-10"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      )}

      {methods.length === 0 ? (
        <div className="rounded-2xl p-8 border text-center" style={{ backgroundColor: "var(--ps-primary-soft,#fff8f4)", borderColor: "var(--ps-primary-muted,#ffe8db)" }}>
          <p className="text-4xl mb-3">🐱</p>
          <p className="text-gray-700 font-medium mb-2">Szczegóły dotyczące wsparcia zostaną wkrótce dodane.</p>
          <p className="text-gray-500 text-sm">
            Tymczasem skontaktuj się z nami przez{" "}
            <a href="/kontakt" className="link-accent hover:underline">formularz kontaktowy</a>.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {methods.map((method) => {
            const cfg = TYPE_CONFIG[method.type] ?? TYPE_CONFIG.info;
            const icon = method.icon || cfg.icon;
            return (
              <div
                key={method.id}
                className={`rounded-2xl border-2 p-6 ${cfg.color}`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl shrink-0">{icon}</span>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h2>
                    {method.description && (
                      <div
                        className="prose-content text-gray-700 text-sm mb-4"
                        dangerouslySetInnerHTML={{ __html: method.description }}
                      />
                    )}
                    {method.url && (
                      <a
                        href={method.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex py-2 px-5 text-sm"
                      >
                        {method.button_label || "Przejdź →"}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Thank you note */}
      <div className="mt-12 text-center p-8 rounded-2xl" style={{ backgroundColor: "var(--ps-primary-soft,#fff8f4)" }}>
        <p className="text-2xl mb-2">🐾</p>
        <p className="text-gray-700 font-medium">Dziękujemy za każde wsparcie!</p>
        <p className="text-gray-500 text-sm mt-1">
          Każda złotówka trafia bezpośrednio do opieki nad kotami.
        </p>
      </div>
    </div>
  );
}
