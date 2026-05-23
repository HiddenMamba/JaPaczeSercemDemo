"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { NavItem } from "@/lib/directus";
import type { Locale } from "@/lib/types";

interface Props {
  menuItems: NavItem[];
  locale: Locale;
  siteName: string;
  logoUrl: string | null;
}

const LOCALE_LABELS: Record<string, string> = { en: "EN", pl: "PL" };
const OTHER_LOCALE: Record<string, Locale> = { pl: "en", en: "pl" };

export function Navbar({ menuItems, locale, siteName, logoUrl }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations("nav");
  const pathname = usePathname();

  const otherLocale = OTHER_LOCALE[locale] ?? "en";

  // Default nav items as fallback if Directus has none
  const defaultItems = [
    { id: "home",    label: t("home"),    url: "/" },
    { id: "cats",    label: t("cats"),    url: "/cats" },
    { id: "news",    label: t("news"),    url: "/news" },
    { id: "about",   label: t("about"),   url: "/about" },
    { id: "contact", label: t("contact"), url: "/contact" },
  ];

  const navItems =
    menuItems.length > 0
      ? menuItems.map((m) => ({
          id: m.id,
          // label is set by getMenuItems resolver; fall back to url
          label: (m as unknown as { label: string }).label ?? m.url,
          url: m.url,
          open_in_new_tab: m.open_in_new_tab,
        }))
      : defaultItems;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-gray-900">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-2xl">🐱</span>
          )}
          <span className="text-orange-600">{siteName}</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.url;
            return (
              <li key={item.id}>
                <Link
                  href={item.url as "/"}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <Link
            href={pathname}
            locale={otherLocale}
            className="hidden md:inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 rounded-full px-3 py-1 transition hover:border-gray-400"
          >
            {LOCALE_LABELS[otherLocale]}
          </Link>

          {/* Adopt CTA */}
          <Link href="/cats" className="hidden md:inline-flex btn-primary py-2 px-4 text-sm">
            {t("cats")}
          </Link>

          {/* Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.url as "/"}
              className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 mt-2">
            <Link
              href={pathname}
              locale={otherLocale}
              className="block px-4 py-2 text-sm text-gray-500"
              onClick={() => setMobileOpen(false)}
            >
              {t("language")}: {LOCALE_LABELS[otherLocale]}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
