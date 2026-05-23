import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMenuItems, getSocialLinks, getSiteSettings, assetUrl } from "@/lib/directus";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SiteBanner } from "@/components/SiteBanner";
import type { Locale } from "@/lib/types";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: process.env.NEXT_PUBLIC_SITE_NAME ?? "Meow Haven",
      template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME ?? "Meow Haven"}`,
    },
    description: locale === "pl"
      ? "Schronisko dla kotów — adoptuj kota i daj mu dom na zawsze."
      : "Cat adoption charity — give a cat a forever home.",
    openGraph: {
      locale,
      type: "website",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const [menuItems, socialLinks, siteSettings] = await Promise.all([
    getMenuItems(locale as Locale),
    getSocialLinks(),
    getSiteSettings(),
  ]);
  const logoUrl = siteSettings.logo ? assetUrl(siteSettings.logo.id) : null;

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 btn-primary z-50"
        >
          Skip to main content
        </a>
        <SiteBanner settings={siteSettings} />
        <Navbar
          menuItems={menuItems}
          locale={locale as Locale}
          siteName={siteSettings.site_name}
          logoUrl={logoUrl}
        />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer socialLinks={socialLinks} />
      </div>
    </NextIntlClientProvider>
  );
}
