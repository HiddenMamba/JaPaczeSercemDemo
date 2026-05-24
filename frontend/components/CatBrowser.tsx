"use client";

import { useState, useMemo, useTransition } from "react";
import { CatCard } from "./CatCard";
import { CatSlideout } from "./CatSlideout";
import type { CatResolved } from "@/lib/types";

interface Trait {
  id: string;
  label: string;
  icon: string | null;
}

interface Props {
  cats: CatResolved[];
  traits: Trait[];
}

type CategoryValue = "kitten" | "adult" | "senior";
type GenderValue = "male" | "female" | "unknown";
type StatusValue = "available" | "reserved" | "adopted" | "rainbow";

const CATEGORY_LABELS: Record<CategoryValue, string> = {
  kitten: "Kocię",
  adult: "Dorosły",
  senior: "Senior",
};
const GENDER_LABELS: Record<GenderValue, string> = {
  male: "Kocur",
  female: "Kotka",
  unknown: "Nieznana płeć",
};
const STATUS_LABELS: Record<StatusValue, string> = {
  available: "Dostępny",
  reserved: "Zarezerwowany",
  adopted: "Adoptowany",
  rainbow: "Za tęczowym mostem 🌈",
};

const ALL_STATUSES: StatusValue[] = ["available", "reserved", "adopted", "rainbow"];
const ALL_CATEGORIES: CategoryValue[] = ["kitten", "adult", "senior"];
const ALL_GENDERS: GenderValue[] = ["male", "female", "unknown"];

export function CatBrowser({ cats, traits }: Props) {
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  // Multi-select: empty set = "all" (show everything)
  const [categories, setCategories] = useState<Set<CategoryValue>>(new Set());
  const [genders, setGenders] = useState<Set<GenderValue>>(new Set());
  const [statuses, setStatuses] = useState<Set<StatusValue>>(new Set(["available"]));
  const [selectedTraits, setSelectedTraits] = useState<Set<string>>(new Set());
  const [slideoutCat, setSlideoutCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return cats.filter((cat) => {
      if (search && !cat.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categories.size > 0 && !categories.has(cat.category)) return false;
      if (genders.size > 0 && !genders.has(cat.gender)) return false;
      if (statuses.size > 0 && !statuses.has(cat.status as StatusValue)) return false;
      if (selectedTraits.size > 0) {
        const catTraitIds = new Set(cat.traits.map((tr) => tr.id));
        for (const traitId of selectedTraits) {
          if (!catTraitIds.has(traitId)) return false;
        }
      }
      return true;
    });
  }, [cats, search, categories, genders, statuses, selectedTraits]);

  function toggleCategory(v: CategoryValue) {
    startTransition(() => setCategories((prev) => { const n = new Set(prev); n.has(v) ? n.delete(v) : n.add(v); return n; }));
  }
  function toggleGender(v: GenderValue) {
    startTransition(() => setGenders((prev) => { const n = new Set(prev); n.has(v) ? n.delete(v) : n.add(v); return n; }));
  }
  function toggleStatus(v: StatusValue) {
    startTransition(() => setStatuses((prev) => { const n = new Set(prev); n.has(v) ? n.delete(v) : n.add(v); return n; }));
  }
  function toggleTrait(id: string) {
    startTransition(() => setSelectedTraits((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }));
  }

  function randomCat() {
    const pool = filtered.length > 0 ? filtered : cats.filter((c) => c.status === "available");
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setSlideoutCat(pick.id);
  }

  const randomizedCat = cats.find((c) => c.id === slideoutCat);

  return (
    <div>
      {/* Filters */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-8 space-y-4">
        <div className="flex gap-3">
          <input
            type="search"
            placeholder="Szukaj po imieniu…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
          <button type="button" onClick={randomCat} className="btn-secondary py-2 px-4 text-sm shrink-0">
            Losowy kot 🎲
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Status multi-select */}
          <FilterGroup label="Status">
            <Chip
              active={statuses.size === 0}
              onClick={() => startTransition(() => setStatuses(new Set()))}
            >
              Wszystkie
            </Chip>
            {ALL_STATUSES.map((v) => (
              <Chip key={v} active={statuses.has(v)} onClick={() => toggleStatus(v)}>
                {STATUS_LABELS[v]}
              </Chip>
            ))}
          </FilterGroup>

          {/* Category multi-select */}
          <FilterGroup label="Wiek">
            <Chip
              active={categories.size === 0}
              onClick={() => startTransition(() => setCategories(new Set()))}
            >
              Wszystkie
            </Chip>
            {ALL_CATEGORIES.map((v) => (
              <Chip key={v} active={categories.has(v)} onClick={() => toggleCategory(v)}>
                {CATEGORY_LABELS[v]}
              </Chip>
            ))}
          </FilterGroup>

          {/* Gender single-select style (still multi internally) */}
          <FilterGroup label="Płeć">
            <Chip
              active={genders.size === 0}
              onClick={() => startTransition(() => setGenders(new Set()))}
            >
              Wszystkie
            </Chip>
            {ALL_GENDERS.filter(g => g !== "unknown").map((v) => (
              <Chip key={v} active={genders.has(v)} onClick={() => toggleGender(v)}>
                {GENDER_LABELS[v]}
              </Chip>
            ))}
          </FilterGroup>
        </div>

        {traits.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Cechy szczególne</p>
            <div className="flex flex-wrap gap-1.5">
              {traits.map((trait) => (
                <Chip key={trait.id} active={selectedTraits.has(trait.id)} onClick={() => toggleTrait(trait.id)}>
                  {trait.icon} {trait.label}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Active filters summary + clear */}
        {(categories.size > 0 || genders.size > 0 || statuses.size > 0 || selectedTraits.size > 0 || search) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategories(new Set());
              setGenders(new Set());
              setStatuses(new Set());
              setSelectedTraits(new Set());
            }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Wyczyść filtry
          </button>
        )}
      </div>

      {randomizedCat && (
        <CatSlideout
          cat={randomizedCat}
          open={slideoutCat === randomizedCat.id}
          onClose={() => setSlideoutCat(null)}
        />
      )}

      <p className="text-sm text-gray-500 mb-4">
        Znaleziono: <strong>{filtered.length}</strong> {filtered.length === 1 ? "kot" : "kotów"}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">😿</div>
          <p className="text-gray-500 mb-3">Nie znaleziono kotów z wybranymi filtrami.</p>
          <button
            type="button"
            onClick={() => { setSearch(""); setCategories(new Set()); setGenders(new Set()); setStatuses(new Set()); setSelectedTraits(new Set()); }}
            className="btn-secondary text-sm"
          >
            Wyczyść filtry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cat) => (
            <CatCard key={cat.id} cat={cat} />
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
        active ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
      }`}
    >
      {children}
    </button>
  );
}
