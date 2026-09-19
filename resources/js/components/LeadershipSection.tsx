'use client';

import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, Quote, Phone, Mail, Sparkles, Maximize2, X } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { SafeImage } from '@/components/SafeImage';
import { LeaderItem } from '@/types/content';

export const LeadershipSection: React.FC = () => {
  const { content } = useContent();
  const leadership = content?.leadership;
  const [previewLeader, setPreviewLeader] = useState<LeaderItem | null>(null);

  // ESC key listener & body scroll lock when image preview is open
  useEffect(() => {
    if (!previewLeader) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewLeader(null);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewLeader]);

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

        {/* Executive Cards Showcase (Balanced, High-End & Fully Adjustable Grid) */}
        <div
          className={`grid gap-8 lg:gap-10 items-stretch ${
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
                className="group relative rounded-3xl bg-white p-7 sm:p-9 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#e8e1d3] flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle Top Gradient Accent Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isFounder
                      ? 'bg-gradient-to-r from-[#f2ad3b] via-[#e59b20] to-[#b36b00]'
                      : 'bg-gradient-to-r from-[#28745e] via-[#359077] to-[#143d35]'
                  }`}
                />

                <div className="flex-1 flex flex-col">
                  {/* Top Status Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-6 sm:mb-8">
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
                      <span className="text-xs font-semibold text-[#6d6352] bg-[#f7f4ec] px-3.5 py-1 rounded-full border border-[#e5dfd0]">
                        {leader.tenure}
                      </span>
                    )}
                  </div>

                  {/* Leader Profile Header: Large Prominent Portrait + Clean Distinguished Title */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 sm:gap-7">
                    {/* Enlarged Portrait Photo Container (Clickable for Full HD Lightbox) */}
                    <div
                      onClick={() => setPreviewLeader(leader)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setPreviewLeader(leader);
                        }
                      }}
                      title={`Click to preview full photo of ${leader.name}`}
                      className="group/photo relative w-40 h-48 sm:w-44 sm:h-52 md:w-48 md:h-56 rounded-2xl overflow-hidden shadow-md border-2 border-white ring-2 ring-[#e6decb] shrink-0 bg-[#f4efe4] cursor-pointer transition-all duration-300 hover:ring-[#28745e] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#28745e]/30"
                    >
                      <SafeImage
                        src={leader.photo}
                        alt={leader.name}
                        fallbackSrc="/uploads/act_official_logo.jpg"
                        className="w-full h-full object-cover object-top group-hover/photo:scale-105 transition-transform duration-500 ease-out"
                      />

                      {/* Minimalist Hover Scrim with Preview Icon */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white backdrop-blur-[2px]">
                        <div className="p-3 rounded-full bg-black/50 text-white shadow-lg">
                          <Maximize2 className="w-5 h-5 drop-shadow" />
                        </div>
                      </div>
                    </div>

                    {/* Name & Role (Clean, distinguished typography with zero clutter) */}
                    <div className="flex-1 text-center sm:text-left min-w-0 flex flex-col justify-center">
                      <h3 className="display-font text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#143d35] tracking-tight leading-tight">
                        {leader.name}
                      </h3>

                      <p className="mt-2 text-base sm:text-lg font-bold text-[#28745e] tracking-wide">
                        {leader.role}
                      </p>
                    </div>
                  </div>

                  {/* Inspiring Vision / Message Quote (Full Width, Balanced & Dignified) */}
                  {leader.message && (
                    <div className="relative mt-6 sm:mt-7 rounded-2xl bg-gradient-to-br from-[#faf7f0] via-[#f8f4ec] to-[#f4ede0] p-5 sm:p-6 border border-[#ede3d0] shadow-xs flex-1 flex flex-col justify-center">
                      <div className="flex items-start gap-3.5">
                        <div className="p-2 rounded-xl bg-[#f2ad3b]/15 text-[#b36b00] shrink-0 mt-0.5">
                          <Quote className="w-4 h-4" />
                        </div>
                        <p className="text-sm sm:text-[15px] leading-relaxed italic text-[#334d46] font-medium">
                          "{leader.message}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Action Contacts (if phone or email configured) */}
                {(leader.phone || leader.email) && (
                  <div className="mt-6 pt-5 border-t border-[#f0eae0] flex flex-wrap items-center gap-3">
                    {leader.phone && (
                      <a
                        href={`tel:${leader.phone.replace(/[^\d+]/g, '')}`}
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#143d35] bg-[#edf6f2] hover:bg-[#28745e] hover:text-white px-3.5 py-2 rounded-xl transition duration-200 cursor-pointer border border-[#cbe4da] shadow-xs hover:shadow"
                        title={`Call ${leader.name}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-[#28745e] group-hover:text-white" />
                        <span>{leader.phone}</span>
                      </a>
                    )}

                    {leader.email && (
                      <a
                        href={`mailto:${leader.email}`}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#58706a] hover:text-[#28745e] hover:bg-[#faf7f0] px-3 py-2 rounded-xl transition duration-200 cursor-pointer border border-[#ede7d8] shadow-xs"
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

      {/* Leader Photo Preview Modal / Lightbox */}
      {previewLeader && (
        <div
          onClick={() => setPreviewLeader(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full max-h-[92vh] overflow-hidden rounded-3xl bg-[#0f2e27] shadow-2xl border border-white/20 flex flex-col animate-in zoom-in-95 duration-200"
          >
            {/* Close Button */}
            <button
              onClick={() => setPreviewLeader(null)}
              className="absolute top-4 right-4 z-20 rounded-full bg-black/60 p-2.5 text-white hover:bg-white hover:text-black transition duration-200 shadow-lg cursor-pointer"
              title="Close Preview (ESC)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Info */}
            <div className="px-6 py-4 bg-[#143d35] border-b border-white/10 flex items-center gap-3 pr-16">
              <div className="p-2 rounded-xl bg-[#28745e]/40 text-[#f2ad3b]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white leading-snug">{previewLeader.name}</h4>
                <p className="text-xs font-medium text-[#f2ad3b]">
                  {previewLeader.role} • {previewLeader.badge || 'Trust Leadership'}
                </p>
              </div>
            </div>

            {/* Main High-Res Image Display */}
            <div className="flex items-center justify-center p-4 sm:p-6 bg-black/40 overflow-hidden flex-1 max-h-[68vh]">
              <SafeImage
                src={previewLeader.photo}
                alt={previewLeader.name}
                fallbackSrc="/uploads/act_official_logo.jpg"
                className="max-h-[64vh] w-auto max-w-full object-contain rounded-2xl shadow-xl mx-auto border border-white/10"
              />
            </div>

            {/* Modal Footer Caption */}
            <div className="px-6 py-3.5 bg-[#143d35] border-t border-white/10 flex items-center justify-between text-xs text-white/80">
              <span className="font-semibold text-white/70">Official Leadership Portrait</span>
              <span className="text-white/50 text-[11px]">Press ESC or click outside to close</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default LeadershipSection;
