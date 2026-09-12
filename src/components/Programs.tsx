'use client';

import React from 'react';
import { GraduationCap, HeartPulse, Sparkles, Utensils, PartyPopper, ArrowUpRight } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  GraduationCap,
  HeartPulse,
  Sparkles,
  Utensils,
  PartyPopper,
};

export const Programs: React.FC = () => {
  const { content, setIsDonateOpen } = useContent();
  const { programs } = content;

  return (
    <section id="programs" className="bg-[#e8f0e8] px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-[#28745e]">
            {programs.eyebrow}
          </p>
          <h2 className="display-font mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#183a35]">
            {programs.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[#58706a]">
            {programs.copy}
          </p>
        </div>

        {/* Program Cards Grid */}
        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {programs.items.map((item) => {
            const IconComp = iconMap[item.icon] || GraduationCap;
            return (
              <article
                key={item.id}
                className={`program-card group overflow-hidden rounded-3xl bg-[#fffdf8] shadow-sm border border-[#d9e1d7] flex flex-col justify-between ${
                  item.gridSpan || ''
                }`}
              >
                <div>
                  <div className="overflow-hidden h-56 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                  </div>

                  <div className="p-6">
                    <span className={`inline-flex rounded-2xl p-3 ${item.badgeBg} ${item.badgeTextColor} shadow-sm`}>
                      <IconComp className="w-6 h-6" />
                    </span>
                    <h3 className="display-font mt-5 text-xl font-bold text-[#183a35]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#58706a]">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => setIsDonateOpen(true)}
                    className="focusable mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#28745e] group-hover:text-[#123f38] transition"
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
