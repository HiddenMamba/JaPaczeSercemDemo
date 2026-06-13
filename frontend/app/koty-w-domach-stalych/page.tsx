import Link from "next/link";
import { ForeverHomeGallery } from "@/components/ForeverHomeGallery";
import { getForeverHomePhotos } from "@/lib/directus";

export const dynamic = "force-dynamic";

export default async function ForeverHomePhotosPage() {
  const photos = await getForeverHomePhotos(-1);

  return (
    <section className="section">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Galeria</p>
          <h1 className="text-4xl font-bold text-gray-900">Koty w domach stałych</h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Wszystkie opublikowane zdjęcia naszych podopiecznych, które znalazły już swoje miejsce na zawsze.
          </p>
        </div>
        <Link href="/" className="btn-secondary">
          Wróć na stronę główną
        </Link>
      </div>

      {photos.length > 0 && (
        <p className="mb-6 text-sm text-gray-500">
          {photos.length} {photos.length === 1 ? "opublikowane zdjęcie" : photos.length < 5 ? "opublikowane zdjęcia" : "opublikowanych zdjęć"}.
        </p>
      )}

      <ForeverHomeGallery photos={photos} />
    </section>
  );
}
