export const dynamic = "force-dynamic";
import { getCats, getAllTraits } from "@/lib/directus";
import { CatBrowser } from "@/components/CatBrowser";

export const metadata = { title: "Adoptuj kota" };

export default async function KotyPage() {
  const [cats, traits] = await Promise.all([
    getCats(),
    getAllTraits(),
  ]);

  return (
    <div className="section">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Adoptuj kota</h1>
        <p className="text-gray-500">Wszystkie nasze koty są zaszczepione, wykastrowane i gotowe do znalezienia domu.</p>
      </div>
      <CatBrowser cats={cats} traits={traits} />
    </div>
  );
}
