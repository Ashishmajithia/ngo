'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Users,
  Building2,
  Heart,
  Sparkles,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { defaultFieldCenters } from '@/data/initialContent';
import { FieldCenterItem } from '@/types/content';

export const FieldCentersSection: React.FC = () => {
  const { content, setIsDonateOpen } = useContent();

  const rawCenters = Array.isArray(content?.fieldCenters) && content.fieldCenters.length > 0
    ? content.fieldCenters
    : defaultFieldCenters;

  const centers: FieldCenterItem[] = rawCenters.filter((c) => c.isActive !== false);

  const [selectedId, setSelectedId] = useState<string>(() => centers[0]?.id || 'center-1');

  if (centers.length === 0) return null;

  const currentCenter = centers.find((c) => c.id === selectedId) || centers[0];

  // Calculate total children reached across all centers
  const totalApproxChildren = centers.reduce((acc, c) => {
    const num = parseInt(c.childrenCount.replace(/[^0-9]/g, ''), 10) || 0;
    return acc + num;
  }, 0);

  return (
    <section id="centers" className="relative bg-[#f8f4e9] text-[#183a35] px-4 sm:px-5 py-14 sm:py-20 lg:px-8 lg:py-28 overflow-hidden">
      {/* Background Accent Graphics */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-[#28745e]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-[#f2ad3b]/15 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 sm:pb-12 border-b border-[#dce7dc]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#28745e]/30 bg-white/80 backdrop-blur px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[.18em] text-[#28745e] mb-3 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[#28745e]" />
              <span>Ground Reach & Centers • REG.NO.220</span>
            </div>
            <h2 className="display-font text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-[#123f38]">
              Active Field Care Centers
            </h2>
            <p className="mt-2.5 sm:mt-3 text-sm sm:text-base text-[#58706a] leading-relaxed font-normal">
              Direct visibility into ACT Charitable Trust field centers across North India. Every pin represents real children receiving daily food, primary tuition, and healthcare support.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center gap-3 bg-white px-5 py-3.5 rounded-2xl border border-[#dce7dc] shadow-sm shrink-0">
            <div className="h-10 w-10 rounded-xl bg-[#28745e] text-white flex items-center justify-center font-bold shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#123f38] leading-none">
                {totalApproxChildren > 0 ? `${totalApproxChildren}+` : '1,200+'}
              </p>
              <p className="text-[11px] font-bold text-[#58706a] uppercase tracking-wider mt-0.5">
                Children Empowered Daily
              </p>
            </div>
          </div>
        </div>

        {/* Center Quick Switcher Chips on Mobile / Tablet */}
        <div className="mt-6 sm:mt-8 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {centers.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                c.id === selectedId
                  ? 'bg-[#123f38] text-white shadow-md'
                  : 'bg-white border border-[#dce7dc] text-[#58706a] hover:bg-[#e8f0e8] hover:text-[#183a35]'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  c.id === selectedId ? 'bg-[#f2ad3b] animate-ping' : 'bg-[#28745e]'
                }`}
              />
              <span>{c.name}</span>
              <span className="text-[10px] opacity-75 font-normal">({c.city})</span>
            </button>
          ))}
        </div>

        {/* Main Grid: Interactive Map (Left) + Selected Center Details (Right) */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12 items-stretch">
          {/* Interactive Map Canvas Panel */}
          <div className="lg:col-span-6 xl:col-span-7 rounded-3xl bg-white border border-[#dce7dc] p-4 sm:p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#28745e]/15 text-[#28745e]">
                  <MapPin className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#123f38]">
                  Interactive Geographic Locator
                </span>
              </div>
              <span className="text-[11px] text-[#58706a] font-medium hidden sm:inline">
                Tap pins to inspect center
              </span>
            </div>

            {/* Stylized Vector Map Area */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] rounded-2xl border border-[#cbd5e1] overflow-hidden flex items-center justify-center shadow-inner">
              {/* Subtle geographic grid lines */}
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage: 'radial-gradient(#28745e 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Vector Contour Outline representing North-Central India regional belt */}
              <svg
                viewBox="0 0 500 400"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-45"
              >
                <path
                  d="M140,80 Q200,50 280,60 T420,90 Q440,160 410,240 T350,330 Q280,360 210,340 T110,260 Q80,180 140,80 Z"
                  fill="#28745e"
                  fillOpacity="0.08"
                  stroke="#28745e"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                {/* State line indicators */}
                <path
                  d="M170,110 Q240,130 310,120 T380,160"
                  fill="none"
                  stroke="#123f38"
                  strokeWidth="1.5"
                  strokeOpacity="0.2"
                />
                <path
                  d="M210,180 Q270,220 340,240"
                  fill="none"
                  stroke="#123f38"
                  strokeWidth="1.5"
                  strokeOpacity="0.2"
                />
              </svg>

              {/* Interactive Pins on Map */}
              {centers.map((c) => {
                const isSelected = c.id === selectedId;
                const posX = Math.max(10, Math.min(90, c.mapX || 40));
                const posY = Math.max(10, Math.min(90, c.mapY || 40));

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    style={{ left: `${posX}%`, top: `${posY}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                  >
                    {/* Pulsing ring for active pin */}
                    {isSelected && (
                      <span className="absolute -inset-2 rounded-full bg-[#f2ad3b]/40 animate-ping" />
                    )}

                    <div
                      className={`relative flex items-center justify-center rounded-full transition-all duration-300 shadow-xl ${
                        isSelected
                          ? 'h-11 w-11 bg-[#123f38] text-[#f2ad3b] ring-4 ring-[#f2ad3b] scale-110'
                          : 'h-8 w-8 bg-[#28745e] text-white hover:scale-125'
                      }`}
                    >
                      <MapPin className={`${isSelected ? 'w-5 h-5' : 'w-4 h-4'}`} />
                    </div>

                    {/* Popover Badge above pin */}
                    <div
                      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-xl px-2.5 py-1 text-[10px] font-extrabold shadow-lg transition duration-200 pointer-events-none ${
                        isSelected
                          ? 'bg-[#123f38] text-white opacity-100 ring-1 ring-white/20'
                          : 'bg-white/90 text-[#183a35] opacity-0 group-hover:opacity-100 border border-[#dce7dc]'
                      }`}
                    >
                      <span>{c.city}</span> • <span className="text-[#f2ad3b]">{c.childrenCount}</span>
                    </div>
                  </div>
                );
              })}

              {/* Map Watermark & Compass */}
              <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur px-2.5 py-1 rounded-lg border border-[#dce7dc] text-[10px] font-bold text-[#58706a]">
                ACT Field Geographic Grid
              </div>
            </div>

            {/* Map Legend */}
            <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between text-xs text-[#58706a] gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#123f38] ring-2 ring-[#f2ad3b]" />
                  <span>Selected Center</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#28745e]" />
                  <span>Active Operating Hub</span>
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#28745e]">
                100% Direct Field Supervision
              </span>
            </div>
          </div>

          {/* Selected Center Detailed Profile Card */}
          <div className="lg:col-span-6 xl:col-span-5 rounded-3xl bg-white border border-[#dce7dc] p-5 sm:p-7 shadow-md flex flex-col justify-between">
            <div>
              {/* Photo & Header */}
              {currentCenter.image && (
                <div className="h-44 sm:h-52 w-full rounded-2xl overflow-hidden mb-5 relative shadow-inner border border-[#dce7dc]">
                  <img
                    src={currentCenter.image}
                    alt={currentCenter.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-[#123f38]/90 backdrop-blur px-3 py-1 text-[11px] font-bold text-white shadow-md flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#f2ad3b]" />
                    <span>Official Trust Center</span>
                  </div>
                  <div className="absolute bottom-3 right-3 rounded-full bg-emerald-600/90 backdrop-blur px-3 py-1 text-[11px] font-bold text-white shadow-md">
                    {currentCenter.city}, {currentCenter.state}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs font-extrabold text-[#28745e] uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>{currentCenter.city} • {currentCenter.state}</span>
              </div>

              <h3 className="display-font text-xl sm:text-2xl font-bold text-[#123f38] leading-tight">
                {currentCenter.name}
              </h3>

              {/* Children count callout */}
              <div className="mt-4 flex items-center gap-3 p-3.5 rounded-2xl bg-[#f8f4e9] border border-[#dce7dc]">
                <div className="h-10 w-10 rounded-xl bg-[#28745e] text-white flex items-center justify-center font-bold shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-[#123f38] leading-none">
                    {currentCenter.childrenCount}
                  </p>
                  <p className="text-xs text-[#58706a] mt-0.5">
                    Receiving direct daily educational & nutrition aid
                  </p>
                </div>
              </div>

              {/* Active Programs at this Center */}
              {Array.isArray(currentCenter.programs) && currentCenter.programs.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#123f38] mb-2">
                    Active Ground Programs
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCenter.programs.map((prog, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-xl bg-white border border-[#dce7dc] px-2.5 py-1 text-xs font-semibold text-[#183a35] shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#28745e]" />
                        <span>{prog}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Coordinator & Address info */}
              <div className="mt-4 pt-4 border-t border-[#f1f5f9] space-y-1.5 text-xs text-[#58706a]">
                {currentCenter.coordinator && (
                  <p>
                    Center Head: <strong className="text-[#183a35]">{currentCenter.coordinator}</strong>
                  </p>
                )}
                {currentCenter.address && (
                  <p className="line-clamp-2">
                    Address: {currentCenter.address}
                  </p>
                )}
              </div>
            </div>

            {/* Support button that opens DonateModal */}
            <div className="mt-6 pt-4 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={() => setIsDonateOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#d81b60] hover:bg-[#c2185b] py-3.5 px-5 font-bold text-white shadow-lg shadow-[#d81b60]/25 transition hover:-translate-y-0.5 active:scale-98 text-sm"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Support This Field Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FieldCentersSection;
