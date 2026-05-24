import {
  createDirectus,
  rest,
  readItems,
  staticToken,
} from "@directus/sdk";
import type { CatCategory } from "./cat-category";
import type { CatSort } from "./cat-sort";
import type {
  Cat,
  CatResolved,
  NewsArticle,
  NewsArticleResolved,
  SocialLink,
  DirectusFile,
} from "./types";

// ─── Client ──────────────────────────────────────────────────────────────────

// DIRECTUS_URL is server-only; NEXT_PUBLIC_DIRECTUS_URL is available in browser too
const directusUrl = process.env.DIRECTUS_URL ?? process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "https://ja-pacze-sercem-cms.onrender.com";

// For client-side asset URLs (used in client components), use the public var
const publicDirectusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? process.env.DIRECTUS_URL ?? "https://ja-pacze-sercem-cms.onrender.com";
const directusToken = process.env.DIRECTUS_TOKEN ?? "";

export const directus = createDirectus(directusUrl)
  .with(staticToken(directusToken))
  .with(rest());

/** Build the public asset URL for a Directus file.
 *  When used with next/image, pass no params — Next.js handles resizing.
 *  Params are only useful for raw <img> tags or direct downloads.
 */
export function assetUrl(fileId: string, params?: Record<string, string>): string {
  const base = `${publicDirectusUrl}/assets/${fileId}`;
  if (!params || Object.keys(params).length === 0) return base;
  const qs = new URLSearchParams(params).toString();
  return `${base}?${qs}`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveCat(cat: any): CatResolved {
  const photos: DirectusFile[] = ((cat.photos as unknown[]) ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((p: any) => {
      if (p?.directus_files_id && typeof p.directus_files_id === "object") {
        return p.directus_files_id as DirectusFile;
      }
      if (p?.id) return p as DirectusFile;
      return null;
    })
    .filter(Boolean) as DirectusFile[];

  const traits = ((cat.traits as unknown[]) ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((tr: any) => {
      const trait = (tr?.cat_traits_id && typeof tr.cat_traits_id === "object")
        ? tr.cat_traits_id
        : tr;
      return {
        id: trait.id ?? tr.id,
        label: trait.label ?? trait.icon ?? "?",
        icon: trait.icon ?? null,
      };
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((t: any) => t.id);

  const dob = cat.date_of_birth ?? null;
  const age = calcAge(dob);
  // Auto-derive category from DOB if available; fall back to stored value
  const category = dob ? age.category : (cat.category as CatCategory) ?? "adult";

  return {
    id: cat.id,
    slug: cat.slug,
    name: cat.name ?? cat.slug ?? "Nieznany",
    description: cat.description ?? "",
    story: cat.story ?? null,
    date_of_birth: dob,
    date_joined: cat.date_joined ?? null,
    age_years: age.years,
    age_months: age.months,
    gender: cat.gender ?? "unknown",
    status: (cat.status ?? "available") as CatResolved["status"],
    category,
    photos,
    traits,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveArticle(article: any): NewsArticleResolved {
  let cover_image: DirectusFile | null = null;
  if (article.cover_image) {
    if (typeof article.cover_image === "string") {
      cover_image = { id: article.cover_image } as DirectusFile;
    } else if (typeof article.cover_image === "object" && article.cover_image.id) {
      cover_image = article.cover_image as DirectusFile;
    }
  }
  return {
    id: article.id,
    slug: article.slug,
    published_at: article.published_at ?? new Date().toISOString(),
    cover_image,
    title: article.title ?? article.slug ?? "Bez tytułu",
    body: article.body ?? "",
    excerpt: article.excerpt ?? null,
  };
}

// ─── Field selectors ──────────────────────────────────────────────────────────

const CAT_FIELDS = [
  "id", "slug", "gender", "status", "category",
  "name", "description", "story", "date_of_birth", "date_joined",
  "photos.directus_files_id.id",
  "photos.directus_files_id.filename_download",
  "photos.directus_files_id.width",
  "photos.directus_files_id.height",
  "traits.cat_traits_id.id",
  "traits.cat_traits_id.label",
  "traits.cat_traits_id.icon",
] as const;

const ARTICLE_FIELDS = [
  "id", "slug", "published_at",
  "title", "body", "excerpt",
  "cover_image.id",
  "cover_image.width",
  "cover_image.height",
  "cover_image.filename_download",
] as const;

// ─── Cats ─────────────────────────────────────────────────────────────────────

export async function getCats(
  filters?: {
    category?: string;
    gender?: string;
    status?: string;
    traits?: string[];
    sort?: CatSort;
  }
): Promise<CatResolved[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};
  if (filters?.category) filter.category = { _eq: filters.category };
  if (filters?.gender) filter.gender = { _eq: filters.gender };
  if (filters?.status) filter.status = { _eq: filters.status };
  if (filters?.traits?.length) {
    filter.traits = { cat_traits_id: { id: { _in: filters.traits } } };
  }

  const sortMap: Record<string, string[]> = {
    name:         ["name"],
    age_asc:      ["date_of_birth"],
    age_desc:     ["-date_of_birth"],
    joined_asc:   ["date_joined"],
    joined_desc:  ["-date_joined"],
  };
  const sortField = sortMap[filters?.sort ?? "name"] ?? ["name"];

  const cats = await directus.request(
    readItems("cats", {
      fields: CAT_FIELDS as unknown as string[],
      filter,
      sort: sortField,
      limit: -1,
    })
  );
  return (cats as unknown as Cat[]).map((c) => resolveCat(c));
}

export async function getCat(slug: string): Promise<CatResolved | null> {
  const cats = await directus.request(
    readItems("cats", {
      fields: CAT_FIELDS as unknown as string[],
      filter: { slug: { _eq: slug } },
      limit: 1,
    })
  );
  const cat = (cats as unknown as Cat[])[0];
  return cat ? resolveCat(cat) : null;
}

export async function getRandomCat(): Promise<CatResolved | null> {
  const cats = await getCats({ status: "available" });
  if (!cats.length) return null;
  return cats[Math.floor(Math.random() * cats.length)];
}

export async function getAllTraits() {
  const traits = await directus.request(
    readItems("cat_traits", {
      fields: ["id", "icon", "label"],
      limit: -1,
    })
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (traits as any[]).map((t) => ({
    id: t.id,
    label: t.label ?? t.icon ?? "Cecha",
    icon: t.icon ?? null,
  }));
}

// ─── News ────────────────────────────────────────────────────────────────────

export async function getArticles(limit = 12): Promise<NewsArticleResolved[]> {
  const articles = await directus.request(
    readItems("news", {
      fields: ARTICLE_FIELDS as unknown as string[],
      sort: ["-published_at"],
      limit,
    })
  );
  return (articles as unknown as NewsArticle[]).map((a) => resolveArticle(a));
}

export async function getArticle(slug: string): Promise<NewsArticleResolved | null> {
  const articles = await directus.request(
    readItems("news", {
      fields: ARTICLE_FIELDS as unknown as string[],
      filter: { slug: { _eq: slug } },
      limit: 1,
    })
  );
  const article = (articles as unknown as NewsArticle[])[0];
  return article ? resolveArticle(article) : null;
}

// ─── Pages ───────────────────────────────────────────────────────────────────

export async function getPage(slug: string): Promise<{ title: string; content: string } | null> {
  try {
    const pages = await directus.request(
      readItems("pages", {
        fields: ["id", "slug", "title", "content"],
        filter: { slug: { _eq: slug } },
        limit: 1,
      })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = (pages as any[])[0];
    if (!page) return null;
    return { title: page.title ?? slug, content: page.content ?? "" };
  } catch {
    return null;
  }
}

// ─── Documents ───────────────────────────────────────────────────────────────

export async function getDocuments() {
  try {
    const docs = await directus.request(
      readItems("documents", {
        fields: ["id", "category", "name", "file.id", "file.filename_download", "file.filesize", "file.type"],
        sort: ["category"],
        limit: -1,
      })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (docs as any[]).map((d) => ({
      id: d.id,
      name: d.name ?? d.file?.filename_download ?? "Dokument",
      category: d.category ?? "other",
      file: d.file ?? { id: d.file, filename_download: "file", filesize: 0, type: "application/pdf" },
      downloadUrl: d.file?.id ? assetUrl(d.file.id) : "#",
    }));
  } catch {
    return [];
  }
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  url: string;
  open_in_new_tab: boolean;
  children: NavItem[];
}

export async function getMenuItems(): Promise<NavItem[]> {
  try {
    const items = await directus.request(
      readItems("menu_items", {
        fields: ["id", "url", "order", "open_in_new_tab", "parent", "label"],
        sort: ["order"],
        limit: -1,
      })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = items as any[];
    const map = new Map<string, NavItem & { parentId: string | null }>(
      raw.map((i) => [
        i.id,
        {
          id: i.id,
          label: i.label ?? i.url ?? "",
          url: i.url ?? "/",
          open_in_new_tab: i.open_in_new_tab ?? false,
          parentId: i.parent ?? null,
          children: [],
        },
      ])
    );
    const roots: NavItem[] = [];
    for (const item of map.values()) {
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.children.push(item);
      } else {
        roots.push(item);
      }
    }
    return roots;
  } catch {
    return [];
  }
}

// ─── Adoption Questions ───────────────────────────────────────────────────────

export interface AdoptionQuestion {
  id: string;
  question: string;
  field_type: "text" | "textarea" | "radio" | "multiselect";
  options: { label: string; value: string }[];
  required: boolean;
  order: number;
  placeholder: string | null;
}

export async function getAdoptionQuestions(): Promise<AdoptionQuestion[]> {
  try {
    const items = await directus.request(
      readItems("adoption_questions", {
        fields: ["id", "question", "field_type", "options", "required", "order", "placeholder"],
        filter: { active: { _eq: true } },
        sort: ["order"],
        limit: -1,
      })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (items as any[]).map((q) => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : [],
    }));
  } catch {
    return [];
  }
}

// ─── Homepage Stats ───────────────────────────────────────────────────────────

export async function getHomepageStats(catsAdoptedBeforeWebsite: number): Promise<{
  available: number;
  adopted: number;
}> {
  try {
    const [availableRes, adoptedRes] = await Promise.all([
      directus.request(readItems("cats", {
        filter: { status: { _eq: "available" } },
        aggregate: { count: ["id"] },
        limit: 1,
      })),
      directus.request(readItems("cats", {
        filter: { status: { _eq: "adopted" } },
        aggregate: { count: ["id"] },
        limit: 1,
      })),
    ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const available = Number((availableRes as any[])[0]?.count?.id ?? 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adoptedOnSite = Number((adoptedRes as any[])[0]?.count?.id ?? 0);
    return { available, adopted: adoptedOnSite + catsAdoptedBeforeWebsite };
  } catch {
    return { available: 0, adopted: catsAdoptedBeforeWebsite };
  }
}

// ─── Support Methods ─────────────────────────────────────────────────────────

export interface SupportMethod {
  id: string;
  title: string;
  type: "info" | "account" | "link" | "crowdfunding";
  description: string | null;
  url: string | null;
  button_label: string | null;
  icon: string | null;
  order: number;
}

export async function getSupportMethods(): Promise<SupportMethod[]> {
  try {
    const items = await directus.request(
      readItems("support_methods", {
        fields: ["id", "title", "type", "description", "url", "button_label", "icon", "order"],
        filter: { active: { _eq: true } },
        sort: ["order"],
        limit: -1,
      })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items as any[];
  } catch {
    return [];
  }
}

// ─── Partners ────────────────────────────────────────────────────────────────

export interface Partner {
  id: string;
  name: string;
  url: string | null;
  logo: { id: string } | null;
  description: string | null;
  order: number;
}

export async function getPartners(): Promise<Partner[]> {
  try {
    const items = await directus.request(
      readItems("partners", {
        fields: ["id", "name", "url", "description", "order", "logo.id"],
        filter: { active: { _eq: true } },
        sort: ["order"],
        limit: -1,
      })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (items as any[]).map((p) => ({
      id: p.id,
      name: p.name,
      url: p.url ?? null,
      logo: p.logo && typeof p.logo === "object" ? p.logo : null,
      description: p.description ?? null,
      order: p.order ?? 0,
    }));
  } catch {
    return [];
  }
}

// ─── Social Links ────────────────────────────────────────────────────────────

export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const links = await directus.request(
      readItems("social_links", {
        fields: ["id", "platform", "url", "icon", "color", "image.id"],
        limit: -1,
      })
    );
    return links as unknown as SocialLink[];
  } catch {
    return [];
  }
}

// ─── Site Settings ───────────────────────────────────────────────────────────

export interface SiteSettings {
  site_name: string;
  tagline: string | null;
  logo: DirectusFile | null;
  banner_enabled: boolean;
  banner_text: string | null;
  banner_color: string;
  banner_image: { id: string; width?: number; height?: number } | null;
  founded_year: number | null;
  cats_adopted_before_website: number;
  contact_form_enabled: boolean;
  contact_email_visible: boolean;
  contact_email: string | null;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const defaults: SiteSettings = {
    site_name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Ja Pacze Sercem",
    tagline: null,
    logo: null,
    banner_enabled: false,
    banner_text: null,
    banner_color: "orange",
    banner_image: null,
    founded_year: null,
    cats_adopted_before_website: 0,
    contact_form_enabled: true,
    contact_email_visible: false,
    contact_email: null,
  };
  try {
    const result = await directus.request(
      readItems("site_settings", {
        fields: [
          "site_name", "tagline", "banner_enabled", "banner_text", "banner_color",
          "founded_year", "cats_adopted_before_website",
          "contact_form_enabled", "contact_email_visible", "contact_email",
          "logo.id", "logo.width", "logo.height", "logo.filename_download",
          "banner_image.id", "banner_image.width", "banner_image.height",
        ],
        limit: 1,
      })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = Array.isArray(result) ? (result as any[])[0] : result as any;
    if (!s) return defaults;
    return {
      site_name: s.site_name ?? defaults.site_name,
      tagline: s.tagline ?? null,
      logo: s.logo && typeof s.logo === "object" && s.logo.id ? s.logo
           : s.logo && typeof s.logo === "string" ? { id: s.logo } as DirectusFile
           : null,
      banner_enabled: s.banner_enabled === true || s.banner_enabled === "true",
      banner_text: s.banner_text ?? null,
      banner_color: s.banner_color ?? "orange",
      banner_image: s.banner_image && typeof s.banner_image === "object" && s.banner_image.id
        ? s.banner_image
        : s.banner_image && typeof s.banner_image === "string"
        ? { id: s.banner_image }
        : null,
      founded_year: s.founded_year ?? null,
      cats_adopted_before_website: Number(s.cats_adopted_before_website ?? 0),
      contact_form_enabled: s.contact_form_enabled !== false,
      contact_email_visible: s.contact_email_visible === true,
      contact_email: s.contact_email ?? null,
    };
  } catch (e) {
    console.error("getSiteSettings error:", e);
    return defaults;
  }
}

// ─── Age calculation ──────────────────────────────────────────────────────────

export function calcAge(dob: string | null): { years: number; months: number; category: CatCategory } {
  if (!dob) return { years: 0, months: 0, category: "adult" };
  const now = new Date();
  const birth = new Date(dob);
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  const totalMonths = years * 12 + months;
  const category = totalMonths < 12 ? "kitten" : totalMonths >= 84 ? "senior" : "adult";
  return { years, months, category };
}
