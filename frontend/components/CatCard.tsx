"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { assetUrl } from "@/lib/directus";
import { CatSlideout } from "./CatSlideout";
import { ImageLightbox, LightboxTrigger } from "./ImageLightbox";
import type { CatResolved } from "@/lib/types";

const STATUS_LABELS = { available: "Dostępny", reserved: "Zarezerwowany", adopted: "Adoptowany", rainbow: "🌈 Za tęczowym mostem" };
const CATEGORY_LABELS = { kitten: "Kocię", adult: "Dorosły", senior: "Senior" };
const GENDER_LABELS = { male: "Kocur", female: "Kotka", unknown: "Nieznana" };

interface Props {
  cat: CatResolved;
}

export function CatCard({ cat }: Props) {
  const [slideoutOpen, setSlideoutOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const mainPhoto = cat.photos[0];

  return (
    <>
      <div className="card group cursor-pointer" onClick={() => setSlideoutOpen(true)}>
        <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
          {mainPhoto ? (
            <LightboxTrigger onOpen={() => setLightboxIndex(0)} className="absolute inset-0">
              <Image
                src={assetUrl(mainPhoto.id)}
                alt={cat.name}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </LightboxTrigger>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🐱</div>
          )}
          <div className="absolute top-3 right-3 pointer-events-none">
            <span className={`badge-${cat.status} shadow-sm`}>{STATUS_LABELS[cat.status]}</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{cat.name}</h3>
            <span className="badge bg-brand-100 text-brand-800 ml-2 shrink-0">{CATEGORY_LABELS[cat.category]}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="badge bg-purple-100 text-purple-700">{GENDER_LABELS[cat.gender]}</span>
            {cat.date_of_birth && (
              <span className="badge bg-blue-100 text-blue-700">
                {cat.age_years > 0 ? `${cat.age_years}l. ` : ""}{cat.age_months}mies.
              </span>
            )}
          </div>

          {cat.traits.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {cat.traits.slice(0, 3).map((trait) => (
                <span key={trait.id} className="badge bg-rose-100 text-rose-800 text-xs">
                  {trait.icon} {trait.label}
                </span>
              ))}
              {cat.traits.length > 3 && (
                <span className="badge bg-gray-100 text-gray-500 text-xs">+{cat.traits.length - 3}</span>
              )}
            </div>
          )}

          <p className="text-sm text-gray-500 line-clamp-2">{cat.description}</p>

          <div className="mt-4 flex gap-2">
            <button
              className="flex-1 btn-secondary py-2 text-xs justify-center"
              onClick={(e) => { e.stopPropagation(); setSlideoutOpen(true); }}
            >
              Podgląd
            </button>
            <Link
              href={`/koty/${cat.slug}`}
              className="flex-1 btn-primary py-2 text-xs justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              Pełny profil
            </Link>
          </div>
        </div>
      </div>

      <CatSlideout cat={cat} open={slideoutOpen} onClose={() => setSlideoutOpen(false)} />

      <ImageLightbox
        photos={cat.photos}
        alt={cat.name}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />
    </>
  );
}
