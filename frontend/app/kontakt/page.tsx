import { getPage, getSiteSettings, getSocialLinks } from "@/lib/directus";
import { ContactForm } from "@/components/ContactForm";

export const metadata = { title: "Kontakt" };
export const dynamic = "force-dynamic";

const SOCIAL_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  facebook:  { icon: "📘", color: "bg-blue-600 hover:bg-blue-700",      label: "Facebook" },
  instagram: { icon: "📸", color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:opacity-90", label: "Instagram" },
  twitter:   { icon: "🐦", color: "bg-sky-500 hover:bg-sky-600",        label: "Twitter / X" },
  youtube:   { icon: "▶️", color: "bg-red-600 hover:bg-red-700",        label: "YouTube" },
  tiktok:    { icon: "🎵", color: "bg-black hover:bg-gray-900",         label: "TikTok" },
  linkedin:  { icon: "💼", color: "bg-blue-700 hover:bg-blue-800",      label: "LinkedIn" },
  other:     { icon: "🔗", color: "bg-gray-600 hover:bg-gray-700",      label: "Link" },
  default:   { icon: "🔗", color: "bg-gray-600 hover:bg-gray-700",      label: "Link" },
};

export default async function KontaktPage() {
  const [page, siteSettings, socialLinks] = await Promise.all([
    getPage("contact"),
    getSiteSettings(),
    getSocialLinks(),
  ]);

  return (
    <div className="section max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
        {page?.title ?? "Kontakt"}
      </h1>
      <p className="text-gray-500 mb-8">Masz pytanie lub chcesz adoptować? Odezwij się!</p>

      {page?.content && (
        <div
          className="prose-content mb-8"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      )}

      {/* Social links */}
      {socialLinks.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Znajdź nas w sieci</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {socialLinks.map((link) => {
              const cfg = SOCIAL_CONFIG[link.platform.toLowerCase()] ?? SOCIAL_CONFIG.default;
              const emoji = link.icon || cfg.icon;
              const label = cfg.label !== "Link" ? cfg.label : link.platform;
              const bgColor = link.color ? undefined : cfg.color;
              const imgId = link.image ? (typeof link.image === "object" ? link.image.id : link.image) : null;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-white transition shadow-sm ${bgColor ?? ""}`}
                  style={link.color ? { backgroundColor: link.color } : undefined}
                >
                  {imgId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${imgId}`} alt={label} className="w-8 h-8 object-contain rounded" />
                  ) : (
                    <span className="text-2xl">{emoji}</span>
                  )}
                  <div>
                    <p className="font-semibold">{label}</p>
                    <p className="text-xs opacity-75 truncate max-w-[160px]">{link.url.replace(/^https?:\/\//, "")}</p>
                  </div>
                  <span className="ml-auto opacity-70 text-sm">→</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Contact form */}
      {siteSettings.contact_form_enabled && (
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Napisz do nas</h2>
          <ContactForm />
        </div>
      )}

      {!siteSettings.contact_form_enabled && socialLinks.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
          <p>Skontaktuj się z nami przez media społecznościowe.</p>
        </div>
      )}
    </div>
  );
}
