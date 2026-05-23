import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getCat, getCats, assetUrl } from "@/lib/directus";
import type { Locale } from "@/lib/types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateStaticParams() {
  // Pre-render all available cat pages at build time
  const cats = await getCats("en");
  return cats.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const cat = await getCat(slug, locale);
  if (!cat) return {};
  return {
    title: cat.name,
    description: cat.description.slice(0, 160),
    openGraph: cat.photos[0]
      ? { images: [{ url: assetUrl(cat.photos[0].id, { width: "1200", height: "630", fit: "cover" }) }] }
      : undefined,
  };
}

export default async function CatDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations("cats");
  const cat = await getCat(slug, locale);

  if (!cat) notFound();

  const mainPhoto = cat.photos[0];

  return (
    <div className="section max-w-5xl">
      <Link href="/cats" className="text-brand-600 hover:text-brand-700 text-sm font-medium mb-8 inline-block">
        {t("back_to_list")}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ── Photos ── */}
        <div className="space-y-4">
          {mainPhoto ? (
            <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={assetUrl(mainPhoto.id, { width: "800", height: "800", fit: "cover" })}
                alt={cat.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="aspect-square rounded-2xl bg-gray-100 flex items-center justify-center text-8xl">
              🐱
            </div>
          )}
          {cat.photos.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {cat.photos.slice(1, 5).map((photo) => (
                <div key={photo.id} className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={assetUrl(photo.id, { width: "200", height: "200", fit: "cover" })}
                    alt={cat.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-extrabold text-gray-900">{cat.name}</h1>
            <span className={`badge-${cat.status} text-sm`}>
              {t(`status_${cat.status}` as "status_available" | "status_reserved" | "status_adopted")}
            </span>
          </div>

          {/* Quick info pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="badge bg-brand-100 text-brand-800">
              {t(`category_${cat.category}` as "category_kitten" | "category_adult" | "category_senior")}
            </span>
            <span className="badge bg-purple-100 text-purple-800">
              {t(`gender_${cat.gender}` as "gender_male" | "gender_female" | "gender_unknown")}
            </span>
            {cat.date_of_birth ? (
              <span className="badge bg-blue-100 text-blue-800">
                {cat.age_years > 0 ? `${cat.age_years}y ` : ""}{cat.age_months}m
              </span>
            ) : null}
          </div>

          {/* Traits */}
          {cat.traits.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {t("filter_traits")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {cat.traits.map((trait) => (
                  <span key={trait.id} className="badge bg-orange-100 text-orange-800">
                    {trait.icon && <span>{trait.icon}</span>}
                    {trait.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-700 leading-relaxed mb-6">{cat.description}</p>

          {/* Story */}
          {cat.story && (
            <div className="bg-brand-50 rounded-xl p-4 mb-8">
              <p className="text-gray-700 leading-relaxed italic">{cat.story}</p>
            </div>
          )}

          {/* CTA */}
          {cat.status === "available" && (
            <Link href={`/adoptuj?cat=${cat.slug}`} className="btn-primary w-full justify-center">
              {t("adopt_cta")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
