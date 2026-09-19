'use client';

import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { SafeImage } from '@/components/SafeImage';

export const About: React.FC = () => {
  const { content } = useContent();
  const about = content?.about;

  if (!about || (!about.title && !about.image && !about.copyOne && !about.copyTwo && !about.badgeTitle)) {
    return null;
  }

  return (
    <section id="about" className="mx-auto max-w-7xl px-4 sm:px-5 py-12 sm:py-16 lg:px-8 lg:py-24">
      <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Left Text */}
        <div className="flex flex-col items-start">
          {about.eyebrow && (
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[.16em] text-[#28745e]">
              {about.eyebrow}
            </p>
          )}
          {about.title && (
            <h2 className="display-font mt-3 sm:mt-4 text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#183a35]">
              {about.title}
            </h2>
          )}
          {about.copyOne && (
            <p className="mt-4 sm:mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[#58706a]">
              {about.copyOne}
            </p>
          )}
          {about.copyTwo && (
            <p className="mt-3 sm:mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-[#58706a]">
              {about.copyTwo}
            </p>
          )}
          {about.ctaText && (
            <a
              href="/#gallery"
              className="focusable mt-6 sm:mt-8 w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-full bg-[#123f38] px-7 py-3.5 font-bold text-[#fffdf8] shadow-md transition hover:bg-[#28745e] hover:-translate-y-0.5 active:scale-98"
            >
              <span>{about.ctaText}</span>
              <ArrowRight className="w-4 h-4 text-[#f2ad3b]" />
            </a>
          )}
        </div>

        {/* Right Photo Frame & Badge */}
        {about.image && (
          <div className="photo-frame relative w-full">
            <SafeImage
              src={about.image}
              alt={about.title || 'About ACT'}
              fallbackSrc="/uploads/about_image.jpg"
              className="h-[280px] xs:h-[360px] sm:h-[480px] w-full rounded-3xl object-cover shadow-2xl transition duration-500 hover:scale-[1.01]"
            />
            {about.badgeTitle && (
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:bottom-6 sm:left-6 max-w-[290px] rounded-2xl bg-[#fffdf8]/95 backdrop-blur border border-[#d9e1d7] p-3.5 sm:p-5 shadow-2xl">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#28745e] text-white shadow-sm">
                    <ShieldCheck className="w-6 h-6 text-[#f2ad3b]" />
                  </span>
                  <div>
                    <p className="font-bold text-[#183a35] text-sm sm:text-base leading-tight">{about.badgeTitle}</p>
                    {about.badgeCopy && (
                      <p className="mt-1 text-xs text-[#58706a] leading-snug">{about.badgeCopy}</p>
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
