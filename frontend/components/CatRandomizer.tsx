"use client";

import { useState } from "react";
import { CatSlideout } from "./CatSlideout";
import type { CatResolved } from "@/lib/types";

interface Props {
  label: string;
}

export function CatRandomizerButton({ label }: Props) {
  const [cat, setCat] = useState<CatResolved | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/random-cat");
      if (res.ok) {
        const data = await res.json();
        setCat(data);
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
        {loading ? "Szukam…" : label}
      </button>
      {cat && (
        <CatSlideout cat={cat} open={!!cat} onClose={() => setCat(null)} />
      )}
    </>
  );
}
