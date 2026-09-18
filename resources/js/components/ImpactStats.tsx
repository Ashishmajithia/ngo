'use client';

import React from 'react';
import { Users, Home, GraduationCap, CheckCircle2, HeartHandshake, Award } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Users,
  Home,
  GraduationCap,
  CheckCircle2,
  HeartHandshake,
  Award,
};

export const ImpactStats: React.FC = () => {
  const { content } = useContent();
  const stats = Array.isArray(content?.impactStats) ? content.impactStats : [];

  if (stats.length === 0) return null;

  const layoutClass = stats.length === 1
    ? 'flex justify-center items-center'
    : stats.length === 2
      ? 'grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto gap-3 sm:gap-6'
      : stats.length === 3
        ? 'grid grid-cols-1 sm:grid-cols-3 max-w-4xl mx-auto gap-3 sm:gap-6'
        : 'grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6';

  return (
    <section id="impact" className="bg-[#28745e] text-[#fffdf8] py-10 sm:py-14 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className={layoutClass}>
          {stats.map((item) => {
            const IconComp = item.iconName ? iconMap[item.iconName] || Users : Users;
            return (
              <div
                key={item.id || item.label}
                className="flex flex-col items-center justify-center p-3.5 sm:p-6 text-center rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm transition duration-300 hover:bg-white/15"
              >
                <div className="mb-2 p-2 sm:p-2.5 rounded-full bg-white/15 text-[#f59e0b] shadow-sm">
                  <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <p className="display-font text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#fffdf8]">
                  {item.stat}
                </p>
                <p className="mt-1 sm:mt-2 text-xs sm:text-base font-medium text-[#f8f4e9]/90 max-w-[180px] leading-tight">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
