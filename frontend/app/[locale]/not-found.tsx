import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="section text-center py-32">
      <div className="text-8xl mb-6">😿</div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Page not found</h1>
      <p className="text-gray-500 mb-8">The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="btn-primary">
        ← Go home
      </Link>
    </div>
  );
}
