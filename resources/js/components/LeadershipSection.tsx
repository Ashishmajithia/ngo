'use client';

import React from 'react';
import { Award, ShieldCheck, Quote, Phone, Mail, Sparkles } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { SafeImage } from '@/components/SafeImage';

export const LeadershipSection: React.FC = () => {
  const { content } = useContent();
  const leadership = content?.leadership;

  // If section is toggled off in Admin, do not render
  if (leadership?.isEnabled === false) return null;

  const leaders = leadership?.leaders || [];
  if (leaders.length === 0) return null;

  return (
    <section id="leadership" className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-gradient-to-b from-[#fffdf8] via-[#f9fbf9] to-[#fffdf8] overflow-hidden">
      {/* Subtle Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#28745e]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#f2ad3b]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          {leadership?.eyebrow && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#28745e]/10 text-[#28745e] text-xs sm:text-sm font-extrabold uppercase tracking-widest mb-3">
              <Award className="w-4 h-4 text-[#f2ad3b]" />
              <span>{leadership.eyebrow}</span>
            </div>
          )}

          <h2 className="display-font text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#123f38] tracking-tight leading-tight">
            {leadership?.title || 'Guiding Light & Trust Leadership'}
          </h2>

          {leadership?.subtitle && (
            <p className="mt-4 text-base sm:text-lg text-[#58706a] leading-relaxed">
              {leadership.subtitle}
            </p>
          )}
        </div>

        {/* 2-Column Responsive Leaders Grid (Specifically tuned for Current & Ex-Chairman) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
          {leaders.map((leader, index) => {
            const isFirst = index === 0;
            const badgeText = leader.badge || (isFirst ? 'Current Leadership' : 'Founder Patron');
            const isFounder = !isFirst || leader.role?.toLowerCase().includes('founder') || leader.role?.toLowerCase().includes('ex-');

            return (
              <div
                key={leader.id || `leader-${index}`}
                className="group relative rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-xl hover:shadow-2xl transition duration-300 border border-[#dce7dc] flex flex-col justify-between hover:-translate-y-1"
              >
                {/* Top Corner Decorative Badge */}
                <div className="flex items-center justify-between gap-2 mb-6">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isFounder
                        ? 'bg-[#f2ad3b]/15 text-[#b36b00] border border-[#f2ad3b]/30'
                        : 'bg-[#28745e]/15 text-[#1b6b55] border border-[#28745e]/30'
                    }`}
                  >
                    {isFounder ? (
                      <Sparkles className="w-3.5 h-3.5 text-[#f2ad3b]" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#28745e]" />
                    )}
                    <span>{badgeText}</span>
                  </span>

                  {leader.tenure && (
                    <span className="text-xs font-semibold text-[#58706a] bg-[#f8f4e9] px-3 py-1 rounded-full border border-[#e5dec9]">
                      {leader.tenure}
                    </span>
                  )}
                </div>

                {/* Leader Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 mb-6">
                  {/* Photo with double ring accent */}
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl ring-4 ring-[#28745e]/15 shrink-0 bg-[#eef3ee]">
                    <SafeImage
                      src={leader.photo}
                      alt={leader.name}
                      fallbackSrc="/uploads/act_official_logo.jpg"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>

                  {/* Name and Designation */}
                  <div className="flex-1 min-w-0">
                    <h3 className="display-font text-2xl sm:text-3xl font-bold text-[#183a35] tracking-tight leading-tight">
                      {leader.name}
                    </h3>
                    <p className="mt-1 text-sm sm:text-base font-extrabold text-[#28745e]">
                      {leader.role}
                    </p>
                    <p className="mt-1 text-xs text-[#58706a] font-medium">
                      ACT Charitable Trust • Reg. No. 220
                    </p>
                  </div>
                </div>

                {/* Inspiring Vision / Quote Box */}
                {leader.message && (
                  <div className="relative mt-2 rounded-2xl bg-[#f8f4e9]/80 p-4 sm:p-5 border border-[#e5dec9] text-[#2c4740]">
                    <Quote className="w-6 h-6 text-[#f2ad3b]/60 mb-1.5" />
                    <p className="text-sm leading-relaxed italic">
                      "{leader.message}"
                    </p>
                  </div>
                )}

                {/* Direct Action Contacts (if phone or email configured) */}
                {(leader.phone || leader.email) && (
                  <div className="mt-6 pt-4 border-t border-[#e8efe8] flex flex-wrap items-center gap-3">
                    {leader.phone && (
                      <a
                        href={`tel:${leader.phone.replace(/[^\d+]/g, '')}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#183a35] bg-[#28745e]/10 hover:bg-[#28745e] hover:text-white px-3.5 py-2 rounded-xl transition duration-200 cursor-pointer"
                        title={`Call ${leader.name}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{leader.phone}</span>
                      </a>
                    )}
                    {leader.email && (
                      <a
                        href={`mailto:${leader.email}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#58706a] hover:text-[#28745e] hover:underline px-2 py-1 transition cursor-pointer"
                        title={`Email ${leader.name}`}
                      >
                        <Mail className="w-3.5 h-3.5 text-[#28745e]" />
                        <span className="truncate max-w-[180px]">{leader.email}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;
