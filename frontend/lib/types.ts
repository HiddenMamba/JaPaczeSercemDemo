// ─── Directus Schema Types ───────────────────────────────────────────────────

import type { CatCategory } from "./cat-category";
import type { CatGender } from "./cat-gender";
import type { CatStatus } from "./cat-status";

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
  date_joined: string | null;
  gender: CatGender;
  status: CatStatus;
  category: CatCategory;
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

export interface PageStyle {
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  background_color: string | null;
  text_color: string | null;
  nav_background_color: string | null;
  footer_background_color: string | null;
  page_font: string | null;
  heading_font: string | null;
  base_font_size: string | null;
  nav_font: string | null;
  nav_font_size: string | null;
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
  icon: string | null;
  color: string | null;
  image: { id: string } | string | null;
}

// ─── Resolved types (same structure, kept for compatibility) ──────────────────

export interface CatResolved {
  id: string;
  slug: string;
  name: string;
  description: string;
  story: string | null;
  date_of_birth: string | null;
  date_joined: string | null;
  age_years: number;
  age_months: number;
  gender: Cat["gender"];
  status: CatStatus;
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
