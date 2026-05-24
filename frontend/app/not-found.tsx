export default function NotFound() {
  return (
    <div className="section text-center">
      <div className="text-6xl mb-4">😿</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">404 - Strona nie istnieje</h1>
      <p className="text-gray-500 mb-6">Strona, której szukasz, nie istnieje lub została przeniesiona.</p>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="btn-primary inline-flex">Wróć na stronę główną</a>
    </div>
  );
}
