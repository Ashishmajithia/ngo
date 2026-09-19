'use client';

import React from 'react';
import { GraduationCap, HeartPulse, Sparkles, Utensils, PartyPopper, ArrowUpRight, Heart } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { defaultContent } from '@/data/initialContent';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  GraduationCap,
  HeartPulse,
  Sparkles,
  Utensils,
  PartyPopper,
  Heart,
};

export const Programs: React.FC = () => {
  const { content, setIsDonateOpen } = useContent();
  const programs = (content && content.programs && typeof content.programs === 'object')
    ? content.programs
    : defaultContent.programs;

  const items = (Array.isArray(programs?.items) && programs.items.length > 0)
    ? programs.items
    : (defaultContent.programs?.items || []);

  if (items.length === 0) return null;

  return (
    <section id="programs" className="bg-[#e8f0e8] px-4 sm:px-5 py-12 sm:py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        {(programs?.title || programs?.eyebrow || programs?.copy) && (
          <div className="max-w-2xl">
            {programs.eyebrow && (
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[.16em] text-[#28745e]">
                {programs.eyebrow}
              </p>
            )}
            {programs.title && (
              <h2 className="display-font mt-3 sm:mt-4 text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#183a35]">
                {programs.title}
              </h2>
            )}
            {programs.copy && (
              <p className="mt-3 sm:mt-5 text-base sm:text-lg leading-relaxed text-[#58706a]">
                {programs.copy}
              </p>
            )}
          </div>
        )}

        {/* Program Cards Grid */}
        <div className="mt-8 sm:mt-12 grid gap-5 sm:gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const IconComp = item.icon ? iconMap[item.icon] || Heart : Heart;
            return (
              <article
                key={item.id}
                className={`program-card group overflow-hidden rounded-3xl bg-[#fffdf8] shadow-sm border border-[#d9e1d7] flex flex-col justify-between ${
                  item.gridSpan || ''
                }`}
              >
                <div>
                  <div className="overflow-hidden h-48 sm:h-56 relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                  </div>

                  <div className="p-5 sm:p-6">
                    <span className={`inline-flex rounded-2xl p-2.5 sm:p-3 ${item.badgeBg || 'bg-[#f8e6bd]'} ${item.badgeTextColor || 'text-[#8b590b]'} shadow-sm`}>
                      <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                    </span>
                    <h3 className="display-font mt-4 sm:mt-5 text-lg sm:text-xl font-bold text-[#183a35]">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm leading-relaxed text-[#58706a]">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0">
                  <button
                    onClick={() => setIsDonateOpen(true)}
                    className="focusable mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#28745e] hover:text-[#123f38] transition py-1"
                  >
                    <span>Support This Cause</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
