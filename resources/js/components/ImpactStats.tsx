'use client';

import React from 'react';
import { Users, Home, GraduationCap, CheckCircle2, HeartHandshake, Award } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { defaultContent } from '@/data/initialContent';

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
  const stats = (Array.isArray(content?.impactStats) && content.impactStats.length > 0)
    ? content.impactStats
    : defaultContent.impactStats;

  return (
    <section id="impact" className="bg-[#28745e] text-[#fffdf8] py-12 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-2 gap-y-8 gap-x-4 md:grid-cols-4 divide-y-2 md:divide-y-0 md:divide-x divide-white/20">
          {stats.map((item) => {
            const IconComp = item.iconName ? iconMap[item.iconName] || Users : Users;
            return (
              <div key={item.id || item.label} className="flex flex-col items-center justify-center p-4 text-center group">
                <div className="mb-2 p-2.5 rounded-full bg-white/10 group-hover:bg-[#f2ad3b] group-hover:text-[#183a35] transition duration-300">
                  <IconComp className="w-6 h-6" />
                </div>
                <p className="display-font text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#fffdf8]">
                  {item.stat}
                </p>
                <p className="mt-2 text-sm sm:text-base font-medium text-[#f8f4e9]/90 max-w-[200px]">
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
