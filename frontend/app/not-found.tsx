import Image from "next/image";
import { assetUrl, getSiteSettings } from "@/lib/directus";

export default async function NotFound() {
  const siteSettings = await getSiteSettings();
  const notFoundImage = siteSettings.not_found_image;

  return (
    <div className="section text-center">
      {notFoundImage ? (
        <div className="mx-auto mb-6 relative h-40 w-40 overflow-hidden rounded-3xl bg-gray-100 shadow-sm">
          <Image
            src={assetUrl(notFoundImage.id)}
            alt="Obrazek strony 404"
            fill
            className="object-cover"
            sizes="160px"
            priority
          />
        </div>
      ) : (
        <div className="text-6xl mb-4">😿</div>
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">404 - Strona nie istnieje</h1>
      <p className="text-gray-500 mb-6">Strona, której szukasz, nie istnieje lub została przeniesiona.</p>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="btn-primary inline-flex">Wróć na stronę główną</a>
    </div>
  );
}
