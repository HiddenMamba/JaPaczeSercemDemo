import { getTranslations } from "next-intl/server";
import { getPage } from "@/lib/directus";
import { ContactForm } from "@/components/ContactForm";
import type { Locale } from "@/lib/types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "pl" ? "Kontakt" : "Contact" };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("contact");
  const page = await getPage("contact", locale);

  return (
    <div className="section max-w-2xl">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">{t("title")}</h1>
      <p className="text-gray-600 mb-8">{t("subtitle")}</p>

      {page && (
        <div
          className="prose-content mb-8"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      )}

      <ContactForm />
    </div>
  );
}
