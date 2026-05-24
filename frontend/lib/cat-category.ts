/** Age category - keep in sync with Directus `cats.category` choices. */
export const CAT_CATEGORIES = ["kitten", "adult", "senior"] as const;

export type CatCategory = (typeof CAT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<CatCategory, string> = {
  kitten: "Kocię",
  adult: "Dorosły",
  senior: "Senior",
};
