"use client";

import { useState } from "react";
import Image from "next/image";
import type { SiteSettings } from "@/lib/directus";

const BG_COLORS: Record<string, string> = {
  orange: "bg-orange-500 text-white",
  red:    "bg-red-500 text-white",
  green:  "bg-green-600 text-white",
  blue:   "bg-blue-600 text-white",
  purple: "bg-purple-600 text-white",
};

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "http://localhost:8055";

interface Props {
  settings: SiteSettings & { banner_image?: { id: string; width?: number; height?: number } | null };
}

export function SiteBanner({ settings }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (!settings.banner_enabled || dismissed) return null;
  if (!settings.banner_text && !settings.banner_image) return null;

  const colorClass = BG_COLORS[settings.banner_color] ?? BG_COLORS.orange;

  // Full-width image banner
  if (settings.banner_image?.id) {
    return (
      <div className="relative w-full">
        <Image
          src={`${directusUrl}/assets/${settings.banner_image.id}?width=1600&fit=cover`}
          alt="Banner"
          width={1600}
          height={400}
          className="w-full object-cover max-h-64"
          priority
        />
        {settings.banner_text && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <p className="text-white text-xl font-bold text-center px-4 drop-shadow">
              {settings.banner_text}
            </p>
          </div>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60 transition"
          aria-label="Zamknij baner"
        >
          ✕
        </button>
      </div>
    );
  }

  // Text-only banner
  return (
    <div className={`${colorClass} py-2 px-4 text-center text-sm font-medium relative`}>
      {settings.banner_text}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-75 hover:opacity-100 transition"
        aria-label="Zamknij baner"
      >
        ✕
      </button>
    </div>
  );
}
