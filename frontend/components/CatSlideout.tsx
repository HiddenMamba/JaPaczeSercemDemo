"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { assetUrl } from "@/lib/directus";
import type { CatResolved } from "@/lib/types";

const STATUS_LABELS = { available: "Dostępny", reserved: "Zarezerwowany", adopted: "Adoptowany", rainbow: "🌈 Za tęczowym mostem" };
const CATEGORY_LABELS = { kitten: "Kocię", adult: "Dorosły", senior: "Senior" };
const GENDER_LABELS = { male: "Kocur", female: "Kotka", unknown: "Nieznana" };

interface Props {
  cat: CatResolved;
  open: boolean;
  onClose: () => void;
}

export function CatSlideout({ cat, open, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const mainPhoto = cat.photos[0];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-y-auto"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900">{cat.name}</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500" aria-label="Zamknij">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="aspect-[4/3] relative bg-gray-100 shrink-0">
              {mainPhoto ? (
                <Image src={assetUrl(mainPhoto.id)} alt={cat.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🐱</div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`badge-${cat.status} shadow`}>{STATUS_LABELS[cat.status]}</span>
              </div>
            </div>

            <div className="p-6 flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge bg-brand-100 text-brand-800">{CATEGORY_LABELS[cat.category]}</span>
                <span className="badge bg-purple-100 text-purple-800">{GENDER_LABELS[cat.gender]}</span>
                {cat.date_of_birth && (
                  <span className="badge bg-blue-100 text-blue-800">
                    {cat.age_years > 0 ? `${cat.age_years}l. ` : ""}{cat.age_months}mies.
                  </span>
                )}
              </div>

              {cat.traits.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Cechy szczególne</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.traits.map((trait) => (
                      <span key={trait.id} className="badge bg-orange-100 text-orange-800">{trait.icon} {trait.label}</span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-gray-700 leading-relaxed mb-4">{cat.description}</p>

              {cat.story && (
                <div className="bg-brand-50 rounded-xl p-4 mb-6">
                  <p className="text-gray-700 text-sm leading-relaxed italic">{cat.story}</p>
                </div>
              )}

              {cat.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {cat.photos.slice(0, 4).map((photo) => (
                    <div key={photo.id} className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                      <Image src={assetUrl(photo.id)} alt={cat.name} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Link href={`/koty/${cat.slug}`} className="btn-secondary flex-1 justify-center" onClick={onClose}>
                  Pełny profil
                </Link>
                {cat.status === "available" && (
                  <Link href={`/adoptuj?cat=${cat.slug}`} className="btn-primary flex-1 justify-center" onClick={onClose}>
                    Chcę adoptować
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
