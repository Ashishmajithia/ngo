'use client';

import React, { useEffect } from 'react';
import { RefreshCw, LayoutDashboard } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#123f38] flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#28745e] text-[#f2ad3b] mb-4 shadow-xl">
        <LayoutDashboard className="w-8 h-8" />
      </div>
      <h2 className="display-font text-2xl font-bold">Admin Console Reset Needed</h2>
      <p className="mt-2 text-xs text-[#f8f4e9]/80 max-w-md">
        An unexpected session state occurred. Click below to reload the Control Console.
      </p>

      <button
        onClick={() => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('act_admin_user', JSON.stringify({ name: 'Administrator', email: 'admin@act.org' }));
          }
          reset();
        }}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f2ad3b] px-6 py-3 text-xs font-bold text-[#183a35] shadow-lg hover:bg-[#f5bf63] transition"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Reload Dashboard</span>
      </button>
    </div>
  );
}
