'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

export const WhatsAppFloatingButton: React.FC = () => {
  const { content, isDonateOpen } = useContent();
  const brand = content?.brand || {};

  const isEnabled = brand.enableWhatsappButton !== false;
  const rawPhone = brand.whatsappNumber || brand.phone || '';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '') || '919876543210';
  const defaultText = encodeURIComponent(
    brand.whatsappGreeting ||
      `Hello ${brand.name || 'ACT Charitable Trust'}! I would like to learn more about your child welfare initiatives.`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${defaultText}`;

  const [isTooltipDismissed, setIsTooltipDismissed] = useState(false);

  // If disabled by admin or donation modal is open, do not render
  if (!isEnabled || isDonateOpen) return null;

  return (
    <aside
      aria-label="Contact via WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 group"
    >
      {/* Floating Helper Tooltip */}
      {!isTooltipDismissed && (
        <div className="hidden xs:flex items-center gap-2 bg-[#123f38] text-white px-3.5 py-2 rounded-2xl shadow-xl border border-white/20 text-xs font-semibold animate-in fade-in slide-in-from-right-4 duration-300">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#f2ad3b] transition"
          >
            Chat with ACT Trust
          </a>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsTooltipDismissed(true);
            }}
            className="text-white/60 hover:text-white p-0.5"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Circular Button with Beacon */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open WhatsApp Chat"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl hover:bg-[#20ba59] hover:scale-110 active:scale-95 transition-all duration-300"
      >
        {/* Animated radar wave */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none opacity-75"></span>
        <MessageCircle className="w-7 h-7 fill-white text-[#25D366]" />
      </a>
    </aside>
  );
};

export default WhatsAppFloatingButton;
