'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HeartHandshake, Menu, X, Heart } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

export const Header: React.FC = () => {
  const { content, setIsDonateOpen } = useContent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#d9e1d7] bg-[#fffdf8]/95 backdrop-blur transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
        {/* Brand */}
        <Link href="/" className="focusable flex items-center gap-3 rounded-lg group">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#f8e6bd] bg-[#123f38] text-[#fffdf8] shadow-lg transition-transform group-hover:scale-105">
            <HeartHandshake className="w-6 h-6 text-[#f2ad3b]" />
          </span>
          <span className="flex flex-col">
            <span className="display-font text-lg md:text-xl font-bold leading-none text-[#183a35]">
              {content.brand.name}
            </span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#28745e]">
              {content.brand.tagline}
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          <a href="#about" className="focusable rounded text-sm font-bold text-[#183a35] hover:text-[#28745e] transition">
            About
          </a>
          <a href="#programs" className="focusable rounded text-sm font-bold text-[#183a35] hover:text-[#28745e] transition">
            Programs
          </a>
          <a href="#approach" className="focusable rounded text-sm font-bold text-[#183a35] hover:text-[#28745e] transition">
            Approach
          </a>
          <a href="#gallery" className="focusable rounded text-sm font-bold text-[#183a35] hover:text-[#28745e] transition">
            Impact Stories
          </a>
          <a href="#impact" className="focusable rounded text-sm font-bold text-[#183a35] hover:text-[#28745e] transition">
            Metrics
          </a>
        </nav>

        {/* Action Button - Clean Header */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => setIsDonateOpen(true)}
            className="focusable flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-3 text-sm font-bold text-[#fffdf8] shadow-md hover:bg-[#28745e] transition hover:-translate-y-0.5"
          >
            <Heart className="w-4 h-4 text-[#f2ad3b] fill-[#f2ad3b]" />
            <span>{content.brand.primaryCtaText}</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="focusable rounded-lg p-2 text-[#183a35]"
            type="button"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav className="border-t border-[#d9e1d7] bg-[#fffdf8] px-5 py-4 md:hidden shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-3">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="focusable rounded py-2 text-base font-bold text-[#183a35]"
            >
              About Us
            </a>
            <a
              href="#programs"
              onClick={() => setMobileMenuOpen(false)}
              className="focusable rounded py-2 text-base font-bold text-[#183a35]"
            >
              Our Programs
            </a>
            <a
              href="#approach"
              onClick={() => setMobileMenuOpen(false)}
              className="focusable rounded py-2 text-base font-bold text-[#183a35]"
            >
              Our Approach
            </a>
            <a
              href="#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="focusable rounded py-2 text-base font-bold text-[#183a35]"
            >
              Impact Stories
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsDonateOpen(true);
              }}
              className="focusable mt-2 flex items-center justify-center gap-2 rounded-full bg-[#123f38] px-5 py-3 text-center font-bold text-[#fffdf8] shadow-md"
            >
              <Heart className="w-4 h-4 text-[#f2ad3b] fill-[#f2ad3b]" />
              <span>{content.brand.primaryCtaText}</span>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};
