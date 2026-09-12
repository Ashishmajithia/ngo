'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-[#123f38] text-white flex flex-col items-center justify-center min-h-screen font-sans p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-xs text-[#f8f4e9]/80 mb-6">A temporary system error occurred. Click below to retry.</p>
        <button
          onClick={() => reset()}
          className="rounded-full bg-[#f2ad3b] px-6 py-2.5 text-xs font-bold text-[#183a35]"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
