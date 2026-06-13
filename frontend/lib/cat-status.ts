/** Cat adoption status - keep in sync with Directus `cats.status` choices. */
export const CAT_STATUSES = [
  "available",
  "inTreatment",
  "adopted",
  "rainbow",
] as const;

export type CatStatus = (typeof CAT_STATUSES)[number];

export const STATUS_LABELS: Record<CatStatus, string> = {
  available: "Dostępny",
  inTreatment: "W trakcie leczenia",
  adopted: "Adoptowany",
  rainbow: "🌈 Za tęczowym mostem",
};
