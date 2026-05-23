import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { SocialLink } from "@/lib/types";

const SOCIAL_ICONS: Record<string, string> = {
  facebook: "📘",
  instagram: "📸",
  twitter: "🐦",
  youtube: "▶️",
  tiktok: "🎵",
  default: "🔗",
};

interface Props {
  socialLinks: SocialLink[];
}

export function Footer({ socialLinks }: Props) {
  const t = useTranslations("footer");
  const navT = useTranslations("nav");
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
                {process.env.NEXT_PUBLIC_SITE_NAME ?? "Meow Haven"}
              </span>
            </div>
            <p className="text-sm text-gray-400">{t("tagline")}</p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Links</h3>
            <ul className="space-y-2 text-sm">
              {(["/cats", "/news", "/about", "/contact"] as const).map((href) => {
                const key = href.slice(1) as "cats" | "news" | "about" | "contact";
                return (
                  <li key={href}>
                    <Link href={href} className="hover:text-white transition">
                      {navT(key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Social */}
          {socialLinks.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Follow Us</h3>
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
          © {year} {process.env.NEXT_PUBLIC_SITE_NAME ?? "Meow Haven"}. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
