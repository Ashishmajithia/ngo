'use client';

import React, { useState } from 'react';
import Link from './Link';
import { HeartHandshake, Menu, X, Heart } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

export const Header: React.FC = () => {
  const { content, setIsDonateOpen } = useContent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#d9e1d7] bg-[#fffdf8]/95 backdrop-blur transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 lg:px-8">
        {/* Brand */}
        <Link href="/" className="focusable flex items-center gap-2.5 sm:gap-3 rounded-lg group min-w-0 max-w-[75%] sm:max-w-none">
          {content.brand.logo ? (
            content.brand.logoStyle === 'full' ? (
              /* Full Logo Image Mode (Entire Brand as Logo Image) */
              <div className="flex items-center gap-2.5 sm:gap-3 py-0.5 min-w-0">
                <img
                  src={content.brand.logo}
                  alt={content.brand.name}
                  style={content.brand.logoHeight ? { height: `${content.brand.logoHeight}px`, maxHeight: '80px' } : undefined}
                  className="h-11 xs:h-13 sm:h-16 md:h-20 w-auto max-w-[190px] xs:max-w-[240px] sm:max-w-[360px] md:max-w-[460px] object-contain transition-transform group-hover:scale-105"
                />
                <div className="hidden sm:flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1b8744]">
                    REG.NO.220
                  </span>
                  <span className="text-[10px] font-extrabold text-[#d81b60] tracking-wide">
                    Rising Hope for Children
                  </span>
                </div>
              </div>
            ) : (
              /* Icon + Text Mode */
              <>
                <span 
                  style={content.brand.logoHeight ? { height: `${content.brand.logoHeight}px`, width: `${content.brand.logoHeight}px` } : undefined}
                  className="relative flex h-11 w-11 xs:h-13 xs:w-13 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center overflow-hidden rounded-full border-2 border-[#e2e8f0] bg-white shadow-md transition-transform group-hover:scale-105 shrink-0"
                >
                  <img
                    src={content.brand.logo}
                    alt={content.brand.name}
                    className="h-full w-full object-contain p-0.5"
                  />
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="display-font text-base sm:text-lg md:text-2xl font-extrabold leading-tight text-[#003b73] truncate max-w-[170px] xs:max-w-[220px] sm:max-w-none">
                    {content.brand.name}
                  </span>
                  <span className="mt-0.5 sm:mt-1 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.14em]">
                    <span className="text-[#1b8744] font-black shrink-0">REG.NO.220</span>
                    <span className="text-[#cbd5e1]">•</span>
                    <span className="text-[#d81b60] font-extrabold truncate">{content.brand.tagline || 'Rising Hope for Children'}</span>
                  </span>
                </span>
              </>
            )
          ) : (
            <>
              <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border-4 border-[#f8e6bd] bg-[#003b73] text-[#fffdf8] shadow-lg transition-transform group-hover:scale-105 shrink-0">
                <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-[#f59e0b]" />
              </span>
              <span className="flex flex-col min-w-0">
                <span className="display-font text-base sm:text-lg md:text-xl font-bold leading-tight text-[#003b73] truncate max-w-[170px] xs:max-w-[220px] sm:max-w-none">
                  {content.brand.name}
                </span>
                <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1b8744] truncate">
                  REG.NO.220 • Rising Hope for Children
                </span>
              </span>
            </>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 lg:gap-8 md:flex" aria-label="Primary navigation">
          <a href="/#about" className="focusable rounded text-sm font-bold text-[#183a35] hover:text-[#004b87] transition">
            About
          </a>
          <a href="/#programs" className="focusable rounded text-sm font-bold text-[#183a35] hover:text-[#004b87] transition">
            Programs
          </a>
          <a href="/#approach" className="focusable rounded text-sm font-bold text-[#183a35] hover:text-[#004b87] transition">
            Approach
          </a>
          <a href="/#stories" className="focusable rounded text-sm font-bold text-[#004b87] hover:text-[#d81b60] transition flex items-center gap-1">
            <span>Stories & Blog</span>
            <span className="h-2 w-2 rounded-full bg-[#d81b60] animate-pulse"></span>
          </a>
          <a href="/#gallery" className="focusable rounded text-sm font-bold text-[#183a35] hover:text-[#004b87] transition">
            Gallery
          </a>
          <a href="/#impact" className="focusable rounded text-sm font-bold text-[#183a35] hover:text-[#004b87] transition">
            Metrics
          </a>
        </nav>

        {/* Action Button - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => setIsDonateOpen(true)}
            className="focusable flex items-center gap-2 rounded-full bg-[#d81b60] hover:bg-[#c2185b] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#d81b60]/30 transition hover:-translate-y-0.5"
          >
            <Heart className="w-4 h-4 fill-white text-white" />
            <span>{content.brand.primaryCtaText || 'Donate & Support'}</span>
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center md:hidden shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="focusable flex h-11 w-11 items-center justify-center rounded-xl p-2 text-[#183a35] hover:bg-black/5 active:scale-95 transition"
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav className="border-t border-[#d9e1d7] bg-[#fffdf8] px-5 py-4 md:hidden shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-2.5">
            <a
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="focusable rounded-xl py-2 px-3 text-base font-bold text-[#003b73] hover:bg-black/5 active:bg-black/10 transition"
            >
              About Us
            </a>
            <a
              href="/#programs"
              onClick={() => setMobileMenuOpen(false)}
              className="focusable rounded-xl py-2 px-3 text-base font-bold text-[#003b73] hover:bg-black/5 active:bg-black/10 transition"
            >
              Our Programs
            </a>
            <a
              href="/#approach"
              onClick={() => setMobileMenuOpen(false)}
              className="focusable rounded-xl py-2 px-3 text-base font-bold text-[#003b73] hover:bg-black/5 active:bg-black/10 transition"
            >
              Our Approach
            </a>
            <a
              href="/#stories"
              onClick={() => setMobileMenuOpen(false)}
              className="focusable rounded-xl py-2 px-3 text-base font-bold text-[#d81b60] flex items-center justify-between hover:bg-[#d81b60]/5 active:bg-[#d81b60]/10 transition"
            >
              <span>Stories & Blog</span>
              <span className="text-xs bg-[#d81b60]/15 text-[#d81b60] px-2.5 py-0.5 rounded-full font-bold">New Stories</span>
            </a>
            <a
              href="/#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="focusable rounded-xl py-2 px-3 text-base font-bold text-[#003b73] hover:bg-black/5 active:bg-black/10 transition"
            >
              Moments Gallery
            </a>
            <a
              href="/#impact"
              onClick={() => setMobileMenuOpen(false)}
              className="focusable rounded-xl py-2 px-3 text-base font-bold text-[#003b73] hover:bg-black/5 active:bg-black/10 transition"
            >
              Our Impact Metrics
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsDonateOpen(true);
              }}
              className="focusable mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#d81b60] hover:bg-[#c2185b] px-5 py-3.5 text-center font-extrabold text-white shadow-lg shadow-[#d81b60]/25 active:scale-98 transition"
            >
              <Heart className="w-4 h-4 fill-white text-white" />
              <span>{content.brand.primaryCtaText || 'Donate & Support'}</span>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};
