'use client';

import React from 'react';
import { Award, ShieldCheck, Quote, Phone, Mail, Sparkles } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { SafeImage } from '@/components/SafeImage';

export const LeadershipSection: React.FC = () => {
  const { content } = useContent();
  const leadership = content?.leadership;

  // Strict check: If disabled or no real leaders exist in database, do not render on homepage
  if (!leadership || leadership.isEnabled === false) return null;

  const leaders = leadership.leaders || [];
  if (!Array.isArray(leaders) || leaders.length === 0) return null;

  return (
    <section
      id="leadership"
      className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-28 bg-[#fbf9f5] border-y border-[#ede6d8] overflow-hidden"
    >
      {/* Decorative Subtle Background Textures */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#28745e]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#f2ad3b]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#28745e]/10 text-[#1b6b55] text-xs sm:text-sm font-extrabold uppercase tracking-widest mb-3 border border-[#28745e]/20">
            <Award className="w-4 h-4 text-[#f2ad3b]" />
            <span>{leadership.eyebrow || 'Trust Governance & Stewards'}</span>
          </div>

          <h2 className="display-font text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#143d35] tracking-tight leading-tight">
            {leadership.title || 'Guiding Light & Trust Leadership'}
          </h2>

          {leadership.subtitle && (
            <p className="mt-4 text-base sm:text-lg text-[#58706a] leading-relaxed max-w-2xl mx-auto">
              {leadership.subtitle}
            </p>
          )}
        </div>

        {/* Executive Cards Showcase (Balanced 2-Column Full-Width Grid) */}
        <div
          className={`grid gap-8 lg:gap-10 ${
            leaders.length === 1
              ? 'max-w-3xl mx-auto grid-cols-1'
              : 'grid-cols-1 lg:grid-cols-2'
          }`}
        >
          {leaders.map((leader, index) => {
            const isFirst = index === 0;
            const isFounder =
              !isFirst ||
              leader.role?.toLowerCase().includes('founder') ||
              leader.role?.toLowerCase().includes('ex-') ||
              leader.badge?.toLowerCase().includes('founder');

            const badgeText =
              leader.badge || (isFirst ? 'Current Chairman' : 'Founder & Ex-Chairman');

            return (
              <div
                key={leader.id || `leader-${index}`}
                className="group relative rounded-3xl bg-white p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#e8e1d3] flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle Top Gradient Accent Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isFounder
                      ? 'bg-gradient-to-r from-[#f2ad3b] via-[#e59b20] to-[#b36b00]'
                      : 'bg-gradient-to-r from-[#28745e] via-[#359077] to-[#143d35]'
                  }`}
                />

                <div>
                  {/* Top Status Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isFounder
                          ? 'bg-[#fef7ec] text-[#b36b00] border border-[#f5d99f]'
                          : 'bg-[#edf6f2] text-[#1b6b55] border border-[#b8dfd1]'
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
                      <span className="text-xs font-semibold text-[#6d6352] bg-[#f7f4ec] px-3 py-1 rounded-full border border-[#e5dfd0]">
                        {leader.tenure}
                      </span>
                    )}
                  </div>

                  {/* Leader Profile: Large Full HD Portrait + Title */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                    {/* Portrait Photo Container */}
                    <div className="relative w-36 h-44 sm:w-40 sm:h-48 rounded-2xl overflow-hidden shadow-md border-2 border-white ring-2 ring-[#e6decb] shrink-0 bg-[#f4efe4]">
                      <SafeImage
                        src={leader.photo}
                        alt={leader.name}
                        fallbackSrc="/uploads/act_official_logo.jpg"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Name, Role & Trust Credential */}
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="display-font text-2xl sm:text-3xl font-extrabold text-[#143d35] tracking-tight leading-snug">
                        {leader.name}
                      </h3>

                      <p className="mt-1 text-base font-bold text-[#28745e]">
                        {leader.role}
                      </p>

                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#6d6352] font-semibold bg-[#f7f4ec] px-2.5 py-1 rounded-md border border-[#e8e2d4]">
                        <span>ACT Charitable Trust</span>
                        <span>•</span>
                        <span className="text-[#143d35]">Reg. No. 220</span>
                      </div>

                      {/* Inspiring Message / Quote */}
                      {leader.message && (
                        <div className="relative mt-4 rounded-xl bg-[#faf7f0] p-3.5 sm:p-4 border border-[#eee7d8] text-[#334d46]">
                          <Quote className="w-5 h-5 text-[#f2ad3b]/70 mb-1" />
                          <p className="text-xs sm:text-sm leading-relaxed italic text-[#3f5750]">
                            "{leader.message}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Action Contacts (if phone or email configured) */}
                {(leader.phone || leader.email) && (
                  <div className="mt-6 pt-4 border-t border-[#f0eae0] flex flex-wrap items-center gap-3">
                    {leader.phone && (
                      <a
                        href={`tel:${leader.phone.replace(/[^\d+]/g, '')}`}
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#143d35] bg-[#edf6f2] hover:bg-[#28745e] hover:text-white px-3.5 py-2 rounded-xl transition duration-200 cursor-pointer border border-[#cbe4da]"
                        title={`Call ${leader.name}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-[#28745e] group-hover:text-white" />
                        <span>{leader.phone}</span>
                      </a>
                    )}

                    {leader.email && (
                      <a
                        href={`mailto:${leader.email}`}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#58706a] hover:text-[#28745e] hover:bg-[#faf7f0] px-3 py-2 rounded-xl transition duration-200 cursor-pointer border border-[#ede7d8]"
                        title={`Email ${leader.name}`}
                      >
                        <Mail className="w-3.5 h-3.5 text-[#28745e]" />
                        <span className="truncate max-w-[200px]">{leader.email}</span>
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
