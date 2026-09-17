'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

export const ToastNotification: React.FC = () => {
  const { toastMessage } = useContent();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#123f38] px-5 py-3.5 text-white shadow-2xl border border-[#f2ad3b]/40 animate-in slide-in-from-bottom duration-300">
      <Sparkles className="w-5 h-5 text-[#f2ad3b] shrink-0" />
      <p className="text-sm font-semibold text-[#fffdf8]">{toastMessage}</p>
    </div>
  );
};
