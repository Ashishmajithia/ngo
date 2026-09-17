'use client';

import React from 'react';
import { Mail, Heart } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { defaultContent } from '@/data/initialContent';

export const SupportSection: React.FC = () => {
  const { content, setIsDonateOpen } = useContent();
  const support = content?.support;
  const brand = content?.brand;

  if (!support?.title && !support?.image && !support?.copy) return null;

  return (
    <section id="support" className="px-5 py-20 lg:px-8 lg:py-28 bg-[#fffdf8]">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={support?.image}
          alt={support?.title || 'Support ACT'}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#123f38]/95 via-[#123f38]/85 to-[#123f38]/90" />

        <div className="relative px-7 py-16 text-center sm:px-12 lg:px-20 lg:py-24 text-[#fffdf8]">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-[#f2ad3b]">
            {support?.eyebrow || 'Make A Difference Today'}
          </p>
          <h2 className="display-font mx-auto mt-4 max-w-3xl text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            {support?.title || 'Your Generosity Can Change A Child’s World Forever'}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#f8f4e9]/90">
            {support?.copy || 'Join hands with ACT Charitable Trust today. Every contribution directly fuels our programs.'}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setIsDonateOpen(true)}
              className="focusable inline-flex items-center gap-2 rounded-full bg-[#f2ad3b] px-8 py-4 font-bold text-[#183a35] shadow-2xl transition hover:bg-[#f5bf63] hover:-translate-y-0.5"
            >
              <Heart className="w-5 h-5 fill-[#183a35]" />
              <span>Make A Direct Contribution</span>
            </button>

            <a
              href={`mailto:${brand?.email || 'hello@actcharitabletrust.org'}`}
              className="focusable inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 backdrop-blur px-7 py-4 font-bold text-[#fffdf8] shadow-lg transition hover:bg-white/20"
            >
              <Mail className="w-5 h-5 text-[#f2ad3b]" />
              <span>{brand?.email || 'hello@actcharitabletrust.org'}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
