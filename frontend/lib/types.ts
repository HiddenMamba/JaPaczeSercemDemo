// ─── Directus Schema Types ───────────────────────────────────────────────────

export type Locale = "en" | "pl";

export interface DirectusFile {
  id: string;
  filename_download: string;
  title: string | null;
  type: string;
  filesize: number;
  width: number | null;
  height: number | null;
}

export interface CatTrait {
  id: string;
  translations: {
    languages_code: Locale;
    label: string;
  }[];
  icon: string | null; // emoji or icon name
}

export interface Cat {
  id: string;
  slug: string;
  age_years: number | null;
  age_months: number | null;
  gender: "male" | "female" | "unknown";
  status: "available" | "reserved" | "adopted";
  category: "kitten" | "adult" | "senior";
  photos: { directus_files_id: DirectusFile }[];
  traits: { cat_traits_id: CatTrait }[];
  translations: {
    languages_code: Locale;
    name: string;
    description: string;
    story: string | null;
  }[];
}

export interface NewsArticle {
  id: string;
  slug: string;
  published_at: string;
  cover_image: DirectusFile | null;
  translations: {
    languages_code: Locale;
    title: string;
    body: string;
    excerpt: string | null;
  }[];
}

export interface Page {
  id: string;
  slug: string;
  translations: {
    languages_code: Locale;
    title: string;
    content: string;
  }[];
}

export interface Document {
  id: string;
  file: DirectusFile;
  category: "financial" | "adoption" | "other";
  translations: {
    languages_code: Locale;
    name: string;
  }[];
}

export interface MenuItem {
  id: string;
  url: string;
  order: number;
  open_in_new_tab: boolean;
  parent: string | null;
  translations: {
    languages_code: Locale;
    label: string;
  }[];
  children?: MenuItem[];
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

// ─── Convenience types (locale-resolved) ─────────────────────────────────────

export interface CatResolved {
  id: string;
  slug: string;
  name: string;
  description: string;
  story: string | null;
  date_of_birth: string | null;  // ISO date string, e.g. "2022-03-15"
  age_years: number;             // calculated from date_of_birth
  age_months: number;            // calculated from date_of_birth
  gender: Cat["gender"];
  status: Cat["status"];
  category: Cat["category"];
  photos: DirectusFile[];
  traits: { id: string; label: string; icon: string | null }[];
}

export interface NewsArticleResolved {
  id: string;
  slug: string;
  published_at: string;
  cover_image: DirectusFile | null;
  title: string;
  body: string;
  excerpt: string | null;
}
