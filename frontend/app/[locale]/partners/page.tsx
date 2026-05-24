import Image from "next/image";
import { directus, assetUrl } from "@/lib/directus";
import { readItems } from "@directus/sdk";
import type { Locale } from "@/lib/types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "pl" ? "Partnerzy" : "Partners" };
}

interface Partner {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  logo: { id: string; width: number; height: number } | null;
  order: number;
  active: boolean;
}

async function getPartners(): Promise<Partner[]> {
  try {
    const items = await directus.request(
      readItems("partners", {
        fields: ["id", "name", "description", "url", "order", "active",
          "logo.id", "logo.width", "logo.height"],
        filter: { active: { _eq: true } },
        sort: ["order", "name"],
        limit: -1,
      })
    );
    return items as unknown as Partner[];
  } catch {
    return [];
  }
}

export default async function PartnersPage({ params }: Props) {
  const { locale } = await params;
  const partners = await getPartners();

  return (
    <div className="section max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
          {locale === "pl" ? "Nasi Partnerzy" : "Our Partners"}
        </h1>
        <p className="text-gray-600">
          {locale === "pl"
            ? "Dziękujemy wszystkim partnerom za wsparcie naszej misji."
            : "Thank you to all our partners for supporting our mission."}
        </p>
      </div>

      {partners.length === 0 ? (
        <p className="text-gray-500 text-center py-16">
          {locale === "pl" ? "Brak partnerów do wyświetlenia." : "No partners yet."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <div key={partner.id} className="card p-6 flex flex-col items-center text-center">
              {/* Logo */}
              {partner.logo ? (
                <div className="h-20 w-full relative mb-4 flex items-center justify-center">
                  <Image
                    src={assetUrl(partner.logo.id, { width: "240", height: "80", fit: "contain" })}
                    alt={partner.name}
                    width={240}
                    height={80}
                    className="object-contain max-h-20"
                  />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center mb-4 text-3xl">
                  🤝
                </div>
              )}

              <h2 className="font-bold text-gray-900 text-lg mb-2">{partner.name}</h2>

              {partner.description && (
                <p className="text-sm text-gray-500 mb-4 flex-1">{partner.description}</p>
              )}

              {partner.url && (
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary py-2 px-4 text-sm mt-auto"
                >
                  {locale === "pl" ? "Odwiedź stronę →" : "Visit website →"}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
