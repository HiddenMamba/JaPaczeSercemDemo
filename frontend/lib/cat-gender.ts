/** Cat gender — keep in sync with Directus `cats.gender` choices. */
export const CAT_GENDERS = ["male", "female", "unknown"] as const;

export type CatGender = (typeof CAT_GENDERS)[number];

/** Genders shown in browser filters (unknown omitted). */
export const CAT_GENDERS_FILTERABLE = ["male", "female"] as const satisfies readonly CatGender[];

export const GENDER_LABELS: Record<CatGender, string> = {
  male: "Kocur",
  female: "Kotka",
  unknown: "Nieznana",
};
