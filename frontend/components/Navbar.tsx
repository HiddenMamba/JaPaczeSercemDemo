"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/directus";

interface Props {
  menuItems: NavItem[];
  siteName: string;
  logoUrl: string | null;
}

const DEFAULT_ITEMS = [
  { id: "home",     label: "Strona główna",  url: "/" },
  { id: "cats",     label: "Adoptuj kota",   url: "/koty" },
  { id: "news",     label: "Aktualności",    url: "/aktualnosci" },
  { id: "about",    label: "O nas",          url: "/o-nas" },
  { id: "partners", label: "Partnerzy",      url: "/partnerzy" },
  { id: "support",  label: "Wesprzyj nas",   url: "/wesprzyj-nas" },
  { id: "contact",  label: "Kontakt",        url: "/kontakt" },
];

export function Navbar({ menuItems, siteName, logoUrl }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = menuItems.length > 0
    ? menuItems.map((m) => ({ id: m.id, label: m.label ?? m.url, url: m.url, open_in_new_tab: m.open_in_new_tab }))
    : DEFAULT_ITEMS;

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
          <span className="text-brand-700">{siteName}</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.url;
            return (
              <li key={item.id}>
                <Link
                  href={item.url}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-100 text-brand-800"
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
          <Link href="/koty" className="hidden md:inline-flex btn-primary py-2 px-4 text-sm">
            Adoptuj kota
          </Link>
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Otwórz menu"
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
              href={item.url}
              className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-800"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
