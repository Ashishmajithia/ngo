'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { defaultContent } from '@/data/initialContent';

export const Hero: React.FC = () => {
  const { content, setIsDonateOpen } = useContent();
  const hero = (content && content.hero && typeof content.hero === 'object')
    ? content.hero
    : defaultContent.hero;

  const slides = Array.isArray(hero?.slides) ? hero.slides : [];

  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number>(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    if (slides.length === 0) return;
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    if (slides.length === 0) return;
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].screenX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff < 0) handleNext();
      else handlePrev();
    }
  };

  const current = slides[activeSlide] || slides[0] || null;

  return (
    <section id="home" className="relative overflow-hidden bg-[#123f38] text-[#fffdf8]">
      {slides.length === 0 && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#123f38] via-[#1a4941] to-[#183a35]" />
      )}
      {/* Background Image Carousel */}
      <div
        className="absolute inset-0 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt={slide.title || 'Hero Banner'}
              className="h-full w-full object-cover object-center scale-100 transition-transform duration-[10000ms] ease-out"
            />
            {/* Refined directional scrim: ensures text is 100% readable while keeping the background image bright, vivid & clearly visible */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#001628]/85 via-[#002444]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          </div>
        ))}

        {/* Carousel Controls - Arrows shown on tablet/desktop, swipe on mobile */}
        {slides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="focusable absolute left-4 md:left-8 top-1/2 z-30 hidden sm:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 backdrop-blur text-white shadow-xl transition hover:bg-[#f59e0b] hover:text-[#002b54] hover:scale-110"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className="focusable absolute right-4 md:right-8 top-1/2 z-30 hidden sm:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 backdrop-blur text-white shadow-xl transition hover:bg-[#f59e0b] hover:text-[#002b54] hover:scale-110"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Slide Indicators / Dots */}
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === activeSlide ? 'w-8 bg-[#f59e0b]' : 'w-2.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Hero Content Panel */}
      <div className="relative z-20 mx-auto flex min-h-[480px] xs:min-h-[540px] sm:min-h-[580px] md:min-h-[620px] max-w-7xl items-center px-4 xs:px-5 py-14 xs:py-16 sm:py-24 lg:px-8 lg:py-32">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          {(current?.eyebrow || content?.brand?.regNo) && (
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#f59e0b]/80 bg-[#002244]/80 backdrop-blur px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-[.14em] sm:tracking-[.16em] text-[#fbbf24] shadow-md">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#fbbf24] shrink-0" />
              <span className="truncate">{current?.eyebrow || `${content.brand.regNo} • ${content.brand.tagline || 'Rising Hope for Children'}`}</span>
            </div>
          )}

          {/* Dynamic Title */}
          <h1 className="display-font mt-4 sm:mt-6 font-extrabold leading-[1.12] sm:leading-[1.08] tracking-tight text-3xl xs:text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {current?.title || content.brand.name || 'ACT Charitable Trust'}
          </h1>

          {/* Dynamic Copy */}
          {(current?.copy || content?.brand?.tagline) && (
            <p className="mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed text-white/95 font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">
              {current?.copy || content.brand.tagline}
            </p>
          )}

          {/* CTA Link Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col xs:flex-row gap-3 sm:gap-4 items-stretch xs:items-center">
            <button
              type="button"
              onClick={() => setIsDonateOpen(true)}
              className="focusable inline-flex items-center justify-center gap-2 rounded-full bg-[#d81b60] hover:bg-[#c2185b] px-6 sm:px-7 py-3.5 sm:py-4 font-extrabold text-white shadow-xl shadow-[#d81b60]/25 transition hover:-translate-y-0.5 active:scale-98 cursor-pointer z-10 text-sm sm:text-base"
            >
              <span>{current?.cta_text || current?.ctaText || content?.brand?.primaryCtaText || 'Donate & Support'}</span>
              <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <a
              href="/#about"
              className="focusable inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 backdrop-blur px-6 py-3.5 sm:py-4 font-bold text-white hover:bg-white/20 transition active:scale-98 text-sm sm:text-base"
            >
              <span>Learn More</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
