import { directus } from "@/lib/directus";
import { readItems } from "@directus/sdk";
import type { Locale } from "@/lib/types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "pl" ? "Wesprzyj nas" : "Support Us",
    description: locale === "pl"
      ? "Pomóż nam pomagać kotom — wpłać darowiznę lub zostań patronem."
      : "Help us help cats — donate or become a patron.",
  };
}

interface SupportData {
  id: string;
  intro_text: string | null;
  patronite_url: string | null;
  bank_account: string | null;
  bank_name: string | null;
  bank_holder: string | null;
  facebook_donate_url: string | null;
}

async function getSupportPage(): Promise<SupportData | null> {
  try {
    const items = await directus.request(
      readItems("support_page", {
        fields: ["id", "intro_text", "patronite_url", "bank_account",
          "bank_name", "bank_holder", "facebook_donate_url"],
        limit: 1,
      })
    );
    return (items as unknown as SupportData[])[0] ?? null;
  } catch {
    return null;
  }
}

export default async function WesprzyNasPage({ params }: Props) {
  const { locale } = await params;
  const data = await getSupportPage();
  const pl = locale === "pl";

  return (
    <div className="section max-w-3xl">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
          {pl ? "Wesprzyj nas" : "Support Us"}
        </h1>
        {data?.intro_text ? (
          <div
            className="prose-content text-gray-600"
            dangerouslySetInnerHTML={{ __html: data.intro_text }}
          />
        ) : (
          <p className="text-gray-600">
            {pl
              ? "Twoja pomoc pozwala nam ratować i opiekować się kotami potrzebującymi domu."
              : "Your support helps us rescue and care for cats in need of a home."}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {/* Patronite */}
        {data?.patronite_url && (
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-3xl">🧡</span>
              <h2 className="text-xl font-bold text-gray-900">Patronite</h2>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              {pl
                ? "Zostań naszym patronem i wspieraj nas regularnie — nawet małą kwotą!"
                : "Become our patron and support us regularly — even a small amount helps!"}
            </p>
            <a
              href={data.patronite_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              {pl ? "Zostań patronem →" : "Become a patron →"}
            </a>
          </div>
        )}

        {/* Bank transfer */}
        {data?.bank_account && (
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-3xl">🏦</span>
              <h2 className="text-xl font-bold text-gray-900">
                {pl ? "Przelew bankowy" : "Bank Transfer"}
              </h2>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm font-mono">
              {data.bank_holder && (
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <span className="text-gray-400 font-sans shrink-0 w-32">
                    {pl ? "Odbiorca:" : "Recipient:"}
                  </span>
                  <span className="text-gray-900 font-sans font-medium">{data.bank_holder}</span>
                </div>
              )}
              {data.bank_name && (
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <span className="text-gray-400 font-sans shrink-0 w-32">Bank:</span>
                  <span className="text-gray-900 font-sans">{data.bank_name}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <span className="text-gray-400 font-sans shrink-0 w-32">IBAN:</span>
                <span className="text-gray-900 tracking-wider">{data.bank_account}</span>
              </div>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(data.bank_account ?? "")}
              className="btn-secondary mt-3 py-2 px-4 text-sm"
            >
              {pl ? "📋 Kopiuj numer konta" : "📋 Copy account number"}
            </button>
          </div>
        )}

        {/* Facebook donate */}
        {data?.facebook_donate_url && (
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-3xl">📘</span>
              <h2 className="text-xl font-bold text-gray-900">Facebook</h2>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              {pl
                ? "Wesprzyj nas przez zbiórkę na Facebooku."
                : "Support us through our Facebook fundraiser."}
            </p>
            <a
              href={data.facebook_donate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              {pl ? "Przejdź do zbiórki →" : "Go to fundraiser →"}
            </a>
          </div>
        )}

        {/* Empty state */}
        {!data?.patronite_url && !data?.bank_account && !data?.facebook_donate_url && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🐱</div>
            <p>{pl ? "Informacje o wsparciu pojawią się wkrótce." : "Support information coming soon."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
