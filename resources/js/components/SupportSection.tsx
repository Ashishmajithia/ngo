'use client';

import React from 'react';
import { Mail, Heart, Phone } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { SafeImage } from '@/components/SafeImage';

export const SupportSection: React.FC = () => {
  const { content, setIsDonateOpen } = useContent();
  const support = content?.support;
  const brand = content?.brand;

  if (!support?.title && !support?.image && !support?.copy) return null;

  return (
    <section id="support" className="px-4 sm:px-5 py-12 sm:py-20 lg:px-8 lg:py-28 bg-[#fffdf8]">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl sm:rounded-[2.5rem] shadow-2xl">
        <SafeImage
          src={support?.image}
          alt={support?.title || 'Support ACT'}
          fallbackSrc="/uploads/support_image.jpg"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#123f38]/95 via-[#123f38]/85 to-[#123f38]/90" />

        <div className="relative px-5 py-12 text-center sm:px-12 sm:py-16 lg:px-20 lg:py-24 text-[#fffdf8]">
          {support?.eyebrow && (
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[.16em] text-[#f2ad3b]">
              {support.eyebrow}
            </p>
          )}
          {support?.title && (
            <h2 className="display-font mx-auto mt-3 sm:mt-4 max-w-3xl text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              {support.title}
            </h2>
          )}
          {support?.copy && (
            <p className="mx-auto mt-3.5 sm:mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-[#f8f4e9]/90">
              {support.copy}
            </p>
          )}

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4">
            <button
              onClick={() => setIsDonateOpen(true)}
              className="focusable inline-flex items-center justify-center gap-2 rounded-full bg-[#f2ad3b] px-7 sm:px-8 py-3.5 sm:py-4 font-bold text-[#183a35] shadow-2xl transition hover:bg-[#f5bf63] hover:-translate-y-0.5 active:scale-98 w-full sm:w-auto"
            >
              <Heart className="w-5 h-5 fill-[#183a35]" />
              <span>{support?.ctaText || 'Make A Direct Contribution'}</span>
            </button>

            {brand?.phone && (
              <a
                href={`tel:${brand.phone.replace(/[^\d+]/g, '')}`}
                className="focusable inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 backdrop-blur px-6 sm:px-7 py-3.5 sm:py-4 font-bold text-[#fffdf8] shadow-lg transition hover:bg-white/20 active:scale-98 w-full sm:w-auto text-sm sm:text-base"
                title={`Call ${brand.phone}`}
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#f2ad3b] shrink-0" />
                <span>{brand.phone}</span>
              </a>
            )}

            {brand?.email && (
              <a
                href={`mailto:${brand.email}`}
                className="focusable inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 backdrop-blur px-6 sm:px-7 py-3.5 sm:py-4 font-bold text-[#fffdf8] shadow-lg transition hover:bg-white/20 active:scale-98 w-full sm:w-auto text-sm sm:text-base truncate"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#f2ad3b] shrink-0" />
                <span className="truncate">{brand.email}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
