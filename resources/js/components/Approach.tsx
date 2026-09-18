'use client';

import React from 'react';
import { Ear, HandHeart, Sprout } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Ear,
  HandHeart,
  Sprout,
};

export const Approach: React.FC = () => {
  const { content } = useContent();
  const approach = content?.approach;
  const principles = Array.isArray(approach?.principles) ? approach.principles : [];

  if (principles.length === 0 && !approach?.title && !approach?.image && !approach?.copy) return null;

  return (
    <section id="approach" className="px-4 sm:px-5 py-12 sm:py-20 lg:px-8 lg:py-28 bg-[#fffdf8]">
      <div className="mx-auto grid max-w-7xl items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Photo Frame Left */}
        {approach?.image && (
          <div className="photo-frame relative order-2 lg:order-1">
            <img
              src={approach.image}
              alt={approach.title || 'Our Approach'}
              className="h-[260px] xs:h-[340px] sm:h-[480px] w-full rounded-3xl object-cover shadow-2xl"
            />
          </div>
        )}

        {/* Content Right */}
        <div className={`order-1 ${approach?.image ? 'lg:order-2' : 'lg:col-span-2 max-w-3xl'}`}>
          {approach?.eyebrow && (
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[.16em] text-[#28745e]">
              {approach.eyebrow}
            </p>
          )}
          {approach?.title && (
            <h2 className="display-font mt-3 sm:mt-4 text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#183a35]">
              {approach.title}
            </h2>
          )}
          {approach?.copy && (
            <p className="mt-3 sm:mt-5 text-base sm:text-lg leading-relaxed text-[#58706a]">
              {approach.copy}
            </p>
          )}

          {/* Principles Cards */}
          <div className="mt-6 sm:mt-9 grid gap-3.5 sm:gap-4">
            {principles.map((p) => {
              const IconComp = iconMap[p.icon] || Sprout;
              return (
                <article
                  key={p.id}
                  className="principle-card rounded-2xl border border-[#dce7dc] bg-[#f8f4e9]/50 p-4 sm:p-5 backdrop-blur shadow-sm"
                >
                  <div className="flex gap-3.5 sm:gap-4 items-start">
                    <span className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full ${p.iconBg || 'bg-[#123f38]'} ${p.iconColor || 'text-white'} shadow-md`}>
                      <IconComp className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="display-font text-base sm:text-lg font-bold text-[#183a35]">
                        {p.title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#58706a]">
                        {p.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
