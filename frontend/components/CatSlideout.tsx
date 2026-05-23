"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { assetUrl } from "@/lib/directus";
import type { CatResolved, Locale } from "@/lib/types";

interface Props {
  cat: CatResolved;
  locale: Locale;
  open: boolean;
  onClose: () => void;
}

export function CatSlideout({ cat, open, onClose }: Props) {
  const t = useTranslations("cats");

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const mainPhoto = cat.photos[0];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900">{cat.name}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500"
                aria-label={t("back_to_list")}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Photo */}
            <div className="aspect-[4/3] relative bg-gray-100 shrink-0">
              {mainPhoto ? (
                <Image
                  src={assetUrl(mainPhoto.id, { width: "800", height: "600", fit: "cover" })}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🐱</div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`badge-${cat.status} shadow`}>
                  {t(`status_${cat.status}` as "status_available" | "status_reserved" | "status_adopted")}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
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
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    {t("filter_traits")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.traits.map((trait) => (
                      <span key={trait.id} className="badge bg-orange-100 text-orange-800">
                        {trait.icon} {trait.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <p className="text-gray-700 leading-relaxed mb-4">{cat.description}</p>

              {/* Story */}
              {cat.story && (
                <div className="bg-brand-50 rounded-xl p-4 mb-6">
                  <p className="text-gray-700 text-sm leading-relaxed italic">{cat.story}</p>
                </div>
              )}

              {/* Thumbnail strip */}
              {cat.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {cat.photos.slice(0, 4).map((photo) => (
                    <div key={photo.id} className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={assetUrl(photo.id, { width: "120", height: "120", fit: "cover" })}
                        alt={cat.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Link
                  href={`/cats/${cat.slug}`}
                  className="btn-secondary flex-1 justify-center"
                  onClick={onClose}
                >
                  Full Profile
                </Link>
                {cat.status === "available" && (
                  <Link
                    href={`/adoptuj?cat=${cat.slug}`}
                    className="btn-primary flex-1 justify-center"
                    onClick={onClose}
                  >
                    {t("adopt_cta")}
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
