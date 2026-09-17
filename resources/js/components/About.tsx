'use client';

import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { defaultContent } from '@/data/initialContent';

export const About: React.FC = () => {
  const { content } = useContent();
  const about = content?.about;

  if (!about || (!about.title && !about.image && !about.copyOne && !about.copyTwo && !about.badgeTitle)) {
    return null;
  }

  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Left Text */}
        <div className="flex flex-col items-start">
          {about.eyebrow && (
            <p className="text-sm font-bold uppercase tracking-[.16em] text-[#28745e]">
              {about.eyebrow}
            </p>
          )}
          {about.title && (
            <h2 className="display-font mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#183a35]">
              {about.title}
            </h2>
          )}
          {about.copyOne && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#58706a]">
              {about.copyOne}
            </p>
          )}
          {about.copyTwo && (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#58706a]">
              {about.copyTwo}
            </p>
          )}
          {about.ctaText && (
            <a
              href="#gallery"
              className="focusable mt-8 inline-flex items-center gap-2 rounded-full bg-[#123f38] px-7 py-3.5 font-bold text-[#fffdf8] shadow-md transition hover:bg-[#28745e] hover:-translate-y-0.5"
            >
              <span>{about.ctaText}</span>
              <ArrowRight className="w-4 h-4 text-[#f2ad3b]" />
            </a>
          )}
        </div>

        {/* Right Photo Frame & Badge */}
        {about.image && (
          <div className="photo-frame relative w-full">
            <img
              src={about.image}
              alt={about.title || 'About ACT'}
              className="h-[400px] sm:h-[480px] w-full rounded-[2rem] object-cover shadow-2xl transition duration-500 hover:scale-[1.01]"
            />
            {about.badgeTitle && (
              <div className="absolute bottom-6 left-6 max-w-[280px] rounded-2xl bg-[#fffdf8]/95 backdrop-blur border border-[#d9e1d7] p-5 shadow-2xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#28745e] text-white">
                    <ShieldCheck className="w-6 h-6 text-[#f2ad3b]" />
                  </span>
                  <div>
                    <p className="font-bold text-[#183a35] text-base">{about.badgeTitle}</p>
                    {about.badgeCopy && (
                      <p className="mt-0.5 text-xs text-[#58706a] leading-snug">{about.badgeCopy}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
