/** Sort options for the koty browser (maps to getCats sort param). */
export const CAT_SORT_VALUES = [
  "name",
  "age_asc",
  "age_desc",
  "joined_desc",
  "joined_asc",
] as const;

export type CatSort = (typeof CAT_SORT_VALUES)[number];

export const SORT_LABELS: Record<CatSort, string> = {
  name: "Imię (A–Z)",
  age_asc: "Wiek (najmłodsze)",
  age_desc: "Wiek (najstarsze)",
  joined_desc: "Najnowsze",
  joined_asc: "Najdłużej z nami",
};
