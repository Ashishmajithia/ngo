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

        {/* Executive Cards Showcase (Rich, Cohesive Editorial Layout) */}
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
                className="group relative rounded-3xl bg-gradient-to-br from-white via-[#fefdfb] to-[#fbf8f2] p-6 sm:p-7 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#e8dfce] flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle Top Gradient Accent Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isFounder
                      ? 'bg-gradient-to-r from-[#f2ad3b] via-[#e59b20] to-[#b36b00]'
                      : 'bg-gradient-to-r from-[#28745e] via-[#359077] to-[#143d35]'
                  }`}
                />

                {/* 2-Column Responsive Card: Left is Portrait, Right is Complete Details */}
                <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 lg:gap-7 items-center sm:items-stretch flex-1">
                  {/* Left: Large Executive Portrait Photo (Stretches smoothly to match content on sm+, natural portrait on mobile) */}
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
                    className="group/photo relative w-36 h-44 xs:w-40 xs:h-48 sm:w-44 md:w-48 lg:w-52 sm:h-auto sm:self-stretch rounded-2xl overflow-hidden shadow-md border-2 border-white ring-1 ring-[#e6decb] shrink-0 bg-[#f4efe4] cursor-pointer transition-all duration-300 hover:ring-[#28745e] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#28745e]/30"
                  >
                    <SafeImage
                      src={leader.photo}
                      alt={leader.name}
                      fallbackSrc="/uploads/act_official_logo.jpg"
                      className="w-full h-full object-cover object-center group-hover/photo:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Subtle Zoom Hover Scrim */}
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white backdrop-blur-[2px]">
                      <div className="p-2.5 sm:p-3 rounded-full bg-black/60 text-white shadow-lg">
                        <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow" />
                      </div>
                    </div>
                  </div>

                  {/* Right: Content Column (Badges, Name, Role & Full Height Quote Box) */}
                  <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5 w-full">
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 mb-2.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            isFounder
                              ? 'bg-[#fef7ec] text-[#b36b00] border border-[#f5d99f]'
                              : 'bg-[#edf6f2] text-[#1b6b55] border border-[#b8dfd1]'
                          }`}
                        >
                          {isFounder ? (
                            <Sparkles className="w-3 h-3 text-[#f2ad3b]" />
                          ) : (
                            <ShieldCheck className="w-3 h-3 text-[#28745e]" />
                          )}
                          <span>{badgeText}</span>
                        </span>

                        {leader.tenure && (
                          <span className="text-[11px] font-semibold text-[#6d6352] bg-[#f7f4ec] px-2.5 py-0.5 rounded-full border border-[#e5dfd0]">
                            {leader.tenure}
                          </span>
                        )}
                      </div>

                      {/* Name & Role */}
                      <div className="text-center sm:text-left mb-2.5">
                        <h3 className="display-font text-2xl sm:text-3xl font-extrabold text-[#143d35] tracking-tight leading-snug">
                          {leader.name}
                        </h3>

                        <p className="mt-0.5 text-sm sm:text-base font-bold text-[#28745e]">
                          {leader.role}
                        </p>
                      </div>
                    </div>

                    {/* Inspiring Vision / Quote Box (flex-1 to match photo height perfectly) */}
                    {leader.message && (
                      <div className="relative rounded-2xl bg-gradient-to-br from-[#faf7f0] to-[#f4ede0] p-4 border border-[#ede3d0] shadow-xs flex-1 flex flex-col justify-center">
                        <div className="flex items-start gap-2.5">
                          <Quote className="w-4 h-4 text-[#f2ad3b] shrink-0 mt-0.5" />
                          <p className="text-xs sm:text-[13px] leading-relaxed italic text-[#395049] font-medium text-left">
                            "{leader.message}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Action Contacts (Unified Bottom Bar Across Whole Card) */}
                {(leader.phone || leader.email) && (
                  <div className="mt-5 pt-4 border-t border-[#f0eae0] flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    {leader.phone && (
                      <a
                        href={`tel:${leader.phone.replace(/[^\d+]/g, '')}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#143d35] bg-[#edf6f2] hover:bg-[#28745e] hover:text-white px-3.5 py-1.5 rounded-xl transition duration-200 cursor-pointer border border-[#cbe4da]"
                        title={`Call ${leader.name}`}
                      >
                        <Phone className="w-3 h-3 text-[#28745e] group-hover:text-white" />
                        <span>{leader.phone}</span>
                      </a>
                    )}

                    {leader.email && (
                      <a
                        href={`mailto:${leader.email}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#58706a] hover:text-[#28745e] hover:bg-[#faf7f0] px-3.5 py-1.5 rounded-xl transition duration-200 cursor-pointer border border-[#ede7d8]"
                        title={`Email ${leader.name}`}
                      >
                        <Mail className="w-3 h-3 text-[#28745e]" />
                        <span className="truncate max-w-[170px]">{leader.email}</span>
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
