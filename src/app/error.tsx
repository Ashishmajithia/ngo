'use client';

import React, { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fffdf8] flex flex-col items-center justify-center p-6 text-[#183a35] text-center">
      <h2 className="display-font text-2xl font-bold">Something went wrong</h2>
      <p className="mt-2 text-xs text-[#58706a] max-w-md">
        Please try refreshing the page or click below to reset.
      </p>

      <button
        onClick={() => reset()}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-3 text-xs font-bold text-white shadow-lg hover:bg-[#28745e] transition"
      >
        <RefreshCw className="w-4 h-4 text-[#f2ad3b]" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
