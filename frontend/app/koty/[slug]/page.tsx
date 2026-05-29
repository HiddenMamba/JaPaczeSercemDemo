import { notFound } from "next/navigation";
import Link from "next/link";
import { getCats, getCat } from "@/lib/directus";
import { CatPhotoGallery } from "@/components/CatPhotoGallery";
import { CATEGORY_LABELS } from "@/lib/cat-category";
import { GENDER_LABELS } from "@/lib/cat-gender";
import { STATUS_LABELS } from "@/lib/cat-status";

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const cats = await getCats();
    return cats.map((cat) => ({ slug: cat.slug }));
  } catch {
    return [];
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cat = await getCat(slug);
  return { title: cat?.name ?? "Kot" };
}

export default async function CatPage({ params }: Props) {
  const { slug } = await params;
  const cat = await getCat(slug);
  if (!cat) notFound();

  return (
    <div className="section max-w-4xl mx-auto">
      <Link href="/koty" className="link-accent text-sm mb-6 inline-block">
        ← Powrót do listy
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <CatPhotoGallery photos={cat.photos} name={cat.name} />

        {/* Info */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-extrabold text-gray-900">{cat.name}</h1>
            <span className={`badge-${cat.status}`}>{STATUS_LABELS[cat.status]}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="badge" style={{ backgroundColor: "var(--ps-primary-muted,#ffe8db)", color: "var(--ps-primary-text,#9a3210)" }}>{CATEGORY_LABELS[cat.category]}</span>
            <span className="badge bg-purple-100 text-purple-700">{GENDER_LABELS[cat.gender]}</span>
            {cat.date_of_birth && (
              <span className="badge bg-blue-100 text-blue-700">
                {cat.age_years > 0 ? `${cat.age_years} l. ` : ""}{cat.age_months} mies.
              </span>
            )}
          </div>

          {cat.traits.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Cechy szczególne</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.traits.map((trait) => (
                  <span key={trait.id} className="badge bg-rose-100 text-rose-800">
                    {trait.icon} {trait.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-gray-700 leading-relaxed mb-4">{cat.description}</p>

          {cat.story && (
            <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: "var(--ps-primary-soft,#fff8f4)" }}>
              <p className="text-gray-700 text-sm leading-relaxed italic">{cat.story}</p>
            </div>
          )}

          {(cat.status === "available") && (
            <Link href={`/adoptuj?cat=${cat.slug}`} className="btn-primary w-full justify-center py-3 text-base">
              Chcę adoptować
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
