import Link from "next/link";
import type { SocialLink } from "@/lib/types";

const SOCIAL_ICONS: Record<string, string> = {
  facebook: "📘",
  instagram: "📸",
  twitter: "🐦",
  youtube: "▶️",
  tiktok: "🎵",
  default: "🔗",
};

const NAV_LINKS = [
  { href: "/koty",        label: "Adoptuj kota" },
  { href: "/aktualnosci", label: "Aktualności" },
  { href: "/o-nas",       label: "O nas" },
  { href: "/kontakt",     label: "Kontakt" },
];

interface Props {
  socialLinks: SocialLink[];
}

export function Footer({ socialLinks }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🐱</span>
              <span className="font-extrabold text-white text-lg">
                {process.env.NEXT_PUBLIC_SITE_NAME ?? "Ja Pacze Sercem"}
              </span>
            </div>
            <p className="text-sm text-gray-400">Szukamy domów dla kotów potrzebujących miłości.</p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Strony</h3>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          {socialLinks.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Obserwuj nas</h3>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm hover:text-white transition"
                    aria-label={link.platform}
                  >
                    <span>{SOCIAL_ICONS[link.platform.toLowerCase()] ?? SOCIAL_ICONS.default}</span>
                    <span className="capitalize">{link.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          © {year} {process.env.NEXT_PUBLIC_SITE_NAME ?? "Ja Pacze Sercem"}. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  );
}
