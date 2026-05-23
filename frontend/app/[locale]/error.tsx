"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="section text-center py-32">
      <div className="text-8xl mb-6">🙀</div>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Something went wrong</h2>
      <p className="text-gray-500 mb-8 text-sm">{error.message}</p>
      <button onClick={reset} className="btn-primary">
        Try again
      </button>
    </div>
  );
}
