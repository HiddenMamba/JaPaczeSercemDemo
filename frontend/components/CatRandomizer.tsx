"use client";

import { useState } from "react";
import { CatSlideout } from "./CatSlideout";
import type { CatResolved, Locale } from "@/lib/types";

interface Props {
  locale: Locale;
  label: string;
}

export function CatRandomizerButton({ locale, label }: Props) {
  const [cat, setCat] = useState<CatResolved | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/random-cat?locale=${locale}`);
      if (res.ok) {
        const data: CatResolved = await res.json();
        setCat(data);
        setOpen(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn-secondary text-base px-8 py-4"
      >
        {loading ? "🔄 Loading…" : label}
      </button>

      {cat && (
        <CatSlideout
          cat={cat}
          locale={locale}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
