export const dynamic = "force-dynamic";
import Link from "next/link";

export const metadata = { title: "Wesprzyj nas" };

export default function WesprzyJNasPage() {
  return (
    <div className="section max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Wesprzyj nas</h1>
      <p className="text-gray-600 mb-8">
        Twoja pomoc finansowa pozwala nam opiekować się kotami i znajdować im domy.
        Każda złotówka ma znaczenie!
      </p>
      <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
        <p className="text-gray-700">
          Szczegóły dotyczące wsparcia zostaną wkrótce dodane.
          Skontaktuj się z nami przez{" "}
          <Link href="/kontakt" className="text-brand-600 hover:underline">formularz kontaktowy</Link>.
        </p>
      </div>
    </div>
  );
}
