"use client";

import { useState, useMemo, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CatCard } from "./CatCard";
import { CatSlideout } from "./CatSlideout";
import type { CatResolved, Locale } from "@/lib/types";

interface Trait {
  id: string;
  label: string;
  icon: string | null;
}

interface Props {
  cats: CatResolved[];
  traits: Trait[];
  locale: Locale;
}

type Category = "all" | "kitten" | "adult" | "senior";
type Gender = "all" | "male" | "female" | "unknown";
type Status = "all" | "available" | "reserved" | "adopted";

export function CatBrowser({ cats, traits, locale }: Props) {
  const t = useTranslations("cats");
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [gender, setGender] = useState<Gender>("all");
  const [status, setStatus] = useState<Status>("available");
  const [selectedTraits, setSelectedTraits] = useState<Set<string>>(new Set());
  const [slideoutCat, setSlideoutCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return cats.filter((cat) => {
      if (search && !cat.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== "all" && cat.category !== category) return false;
      if (gender !== "all" && cat.gender !== gender) return false;
      if (status !== "all" && cat.status !== status) return false;
      if (selectedTraits.size > 0) {
        const catTraitIds = new Set(cat.traits.map((tr) => tr.id));
        for (const traitId of selectedTraits) {
          if (!catTraitIds.has(traitId)) return false;
        }
      }
      return true;
    });
  }, [cats, search, category, gender, status, selectedTraits]);

  function toggleTrait(id: string) {
    startTransition(() => {
      setSelectedTraits((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    });
  }

  function randomCat() {
    const available = filtered.length > 0 ? filtered : cats.filter((c) => c.status === "available");
    if (available.length === 0) return;
    const pick = available[Math.floor(Math.random() * available.length)];
    setSlideoutCat(pick.id);
  }

  const randomizedCat = cats.find((c) => c.id === slideoutCat);

  return (
    <div>
      {/* ── Filters ── */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-8 space-y-4">
        {/* Search + randomize row */}
        <div className="flex gap-3">
          <input
            id="cat-search"
            name="cat-search"
            type="search"
            placeholder={t("search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
          <button type="button" onClick={randomCat} className="btn-secondary py-2 px-4 text-sm shrink-0">
            {t("randomize")}
          </button>
        </div>

        {/* Filter chips row */}
        <div className="flex flex-wrap gap-3">
          {/* Category */}
          <FilterGroup label={t("filter_category")}>
            {(["all", "kitten", "adult", "senior"] as Category[]).map((v) => (
              <Chip key={v} active={category === v} onClick={() => setCategory(v)}>
                {v === "all" ? t("all") : t(`category_${v}` as "category_kitten" | "category_adult" | "category_senior")}
              </Chip>
            ))}
          </FilterGroup>

          {/* Gender */}
          <FilterGroup label={t("filter_gender")}>
            {(["all", "male", "female"] as Gender[]).map((v) => (
              <Chip key={v} active={gender === v} onClick={() => setGender(v)}>
                {v === "all" ? t("all") : t(`gender_${v}` as "gender_male" | "gender_female")}
              </Chip>
            ))}
          </FilterGroup>

          {/* Status */}
          <FilterGroup label={t("filter_status")}>
            {(["all", "available", "reserved", "adopted"] as Status[]).map((v) => (
              <Chip key={v} active={status === v} onClick={() => setStatus(v)}>
                {v === "all" ? t("all") : t(`status_${v}` as "status_available" | "status_reserved" | "status_adopted")}
              </Chip>
            ))}
          </FilterGroup>
        </div>

        {/* Traits */}
        {traits.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">{t("filter_traits")}</p>
            <div className="flex flex-wrap gap-1.5">
              {traits.map((trait) => (
                <Chip
                  key={trait.id}
                  active={selectedTraits.has(trait.id)}
                  onClick={() => toggleTrait(trait.id)}
                >
                  {trait.icon} {trait.label}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Random cat slideout ── */}
      {randomizedCat && (
        <CatSlideout
          cat={randomizedCat}
          locale={locale}
          open={slideoutCat === randomizedCat.id}
          onClose={() => setSlideoutCat(null)}
        />
      )}

      {/* ── Results count ── */}
      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} {filtered.length === 1 ? "kot" : "kotów"}
      </p>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">😿</div>
          <p className="text-gray-500">{t("no_results")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cat) => (
            <CatCard key={cat.id} cat={cat} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-gray-500 shrink-0">{label}:</span>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`badge cursor-pointer transition border ${
        active
          ? "bg-orange-500 text-white border-orange-500"
          : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
      }`}
    >
      {children}
    </button>
  );
}
