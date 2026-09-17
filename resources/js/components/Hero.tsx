'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { defaultContent } from '@/data/initialContent';

export const Hero: React.FC = () => {
  const { content } = useContent();
  const hero = (content && content.hero && typeof content.hero === 'object')
    ? content.hero
    : defaultContent.hero;

  const slides = (Array.isArray(hero?.slides) && hero.slides.length > 0)
    ? hero.slides
    : defaultContent.hero.slides;

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
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
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

  const current = slides[activeSlide] || slides[0] || defaultContent.hero.slides[0];

  return (
    <section id="home" className="relative overflow-hidden bg-[#123f38] text-[#fffdf8]">
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
              src={slide.image || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1920&auto=format&fit=crop"}
              alt={slide.title || 'Hero Banner'}
              className="h-full w-full object-cover object-center scale-100 transition-transform duration-[10000ms] ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#123f38]/95 via-[#123f38]/60 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#123f38]/70 via-transparent to-black/20" />
          </div>
        ))}

        {/* Carousel Controls */}
        {slides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="focusable absolute left-4 md:left-8 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#fffdf8]/20 backdrop-blur text-white shadow-xl transition hover:bg-[#f2ad3b] hover:text-[#183a35] hover:scale-110"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className="focusable absolute right-4 md:right-8 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#fffdf8]/20 backdrop-blur text-white shadow-xl transition hover:bg-[#f2ad3b] hover:text-[#183a35] hover:scale-110"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Slide Indicators / Dots */}
            <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === activeSlide ? 'w-8 bg-[#f2ad3b]' : 'w-2.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Hero Content Panel */}
      <div className="relative z-20 mx-auto flex min-h-[620px] max-w-7xl items-center px-5 py-24 lg:px-8 lg:py-32">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f2ad3b]/80 bg-[#123f38]/60 backdrop-blur px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-[.14em] text-[#f2ad3b] shadow-md">
            <Sparkles className="w-4 h-4 text-[#f2ad3b]" />
            <span>{current?.eyebrow || 'Empower Communities • Transform Lives'}</span>
          </div>

          {/* Dynamic Title */}
          <h1 className="display-font mt-6 font-bold leading-[1.08] tracking-tight text-4xl sm:text-5xl md:text-6xl text-[#fffdf8]">
            {current?.title || 'Building Hope & Resilient Futures Together'}
          </h1>

          {/* Dynamic Copy */}
          <p className="mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-[#f8f4e9]/90 font-medium">
            {current?.copy || 'ACT Charitable Trust works closely at the grassroots level to unlock opportunities.'}
          </p>

          {/* CTA Link */}
          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <a
              href={current?.cta_link || current?.ctaLink || '#programs'}
              className="focusable inline-flex items-center gap-2 rounded-full bg-[#f2ad3b] px-7 py-4 font-bold text-[#183a35] shadow-xl transition hover:bg-[#f5bf63] hover:-translate-y-0.5"
            >
              <span>{hero?.ctaText || 'Explore Our Programs'}</span>
              <ArrowDownRight className="w-5 h-5" />
            </a>
            <a
              href="#about"
              className="focusable inline-flex items-center gap-2 rounded-full border border-[#fffdf8]/40 bg-[#123f38]/40 backdrop-blur px-6 py-4 font-bold text-[#fffdf8] hover:bg-[#fffdf8]/10 transition"
            >
              <span>Our Story</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
