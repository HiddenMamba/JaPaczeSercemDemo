// ─── Directus Schema Types ───────────────────────────────────────────────────

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
  label: string;
  icon: string | null;
}

export interface Cat {
  id: string;
  slug: string;
  date_of_birth: string | null;
  gender: "male" | "female" | "unknown";
  status: "available" | "reserved" | "adopted" | "rainbow";
  category: "kitten" | "adult" | "senior";
  name: string;
  description: string;
  story: string | null;
  photos: { directus_files_id: DirectusFile }[];
  traits: { cat_traits_id: CatTrait }[];
}

export interface NewsArticle {
  id: string;
  slug: string;
  published_at: string;
  cover_image: DirectusFile | null;
  title: string;
  body: string;
  excerpt: string | null;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
}

export interface Document {
  id: string;
  file: DirectusFile;
  category: "financial" | "adoption" | "other";
  name: string;
}

export interface MenuItem {
  id: string;
  url: string;
  order: number;
  open_in_new_tab: boolean;
  parent: string | null;
  label: string;
  children?: MenuItem[];
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

// ─── Resolved types (same structure, kept for compatibility) ──────────────────

export interface CatResolved {
  id: string;
  slug: string;
  name: string;
  description: string;
  story: string | null;
  date_of_birth: string | null;
  age_years: number;
  age_months: number;
  gender: Cat["gender"];
  status: "available" | "reserved" | "adopted" | "rainbow";
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
