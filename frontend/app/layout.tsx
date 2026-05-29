import type { Metadata } from "next";
import "./globals.css";
import { getMenuItems, getSocialLinks, getSiteSettings, getPageStyle, buildStyleVars, buildGoogleFontsUrl, assetUrl } from "@/lib/directus";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SiteBanner } from "@/components/SiteBanner";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: process.env.NEXT_PUBLIC_SITE_NAME ?? "Ja Pacze Sercem",
      template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME ?? "Ja Pacze Sercem"}`,
    },
    description: "Fundacja adopcyjna - adoptuj kota i daj mu dom na zawsze.",
    openGraph: {
      locale: "pl_PL",
      type: "website",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [menuItems, socialLinks, siteSettings, pageStyle] = await Promise.all([
    getMenuItems(),
    getSocialLinks(),
    getSiteSettings(),
    getPageStyle(),
  ]);
  const logoUrl = siteSettings.logo ? assetUrl(siteSettings.logo.id) : null;
  const styleVars = buildStyleVars(pageStyle);
  const googleFontsUrl = buildGoogleFontsUrl(pageStyle);

  return (
    <html lang="pl" style={styleVars as React.CSSProperties}>
      <head>
        {googleFontsUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="stylesheet" href={googleFontsUrl} />
          </>
        )}
      </head>
      <body>
        <div className="min-h-screen flex flex-col bg-[var(--ps-bg,#ffffff)] text-[var(--ps-text,#111827)] antialiased">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 btn-primary z-50"
          >
            Przejdź do treści
          </a>
          <SiteBanner settings={siteSettings} />
          <Navbar
            menuItems={menuItems}
            siteName={siteSettings.site_name}
            logoUrl={logoUrl}
          />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer socialLinks={socialLinks} />
        </div>
      </body>
    </html>
  );
}
