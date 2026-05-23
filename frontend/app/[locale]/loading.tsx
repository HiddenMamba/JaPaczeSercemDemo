export default function Loading() {
  return (
    <div className="section flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-4 text-gray-400">
        <div className="text-5xl animate-bounce">🐱</div>
        <p className="text-sm font-medium">Loading…</p>
      </div>
    </div>
  );
}
