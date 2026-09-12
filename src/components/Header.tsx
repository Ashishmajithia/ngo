'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HeartHandshake, Menu, X, Settings2, Heart, Lock } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

export const Header: React.FC = () => {
  const { content, setIsDonateOpen, setIsAdminOpen } = useContent();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#d9e1d7] bg-[#fffdf8]/95 backdrop-blur transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
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
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
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

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Direct Admin Login Page Link */}
          <Link
            href="/admin/login"
            className="focusable flex items-center gap-1.5 rounded-full border border-[#123f38]/30 px-3.5 py-2.5 text-xs font-bold text-[#123f38] hover:bg-[#123f38] hover:text-white transition"
            title="Admin Login Portal"
          >
            <Lock className="w-3.5 h-3.5 text-[#f2ad3b]" />
            <span>Admin Login</span>
          </Link>

          {/* Dynamic Quick Customizer */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="focusable flex items-center gap-1.5 rounded-full border border-[#28745e]/30 px-3.5 py-2.5 text-xs font-bold text-[#123f38] hover:bg-[#e8f0e8] transition"
            title="Quick Edit Site Content"
          >
            <Settings2 className="w-3.5 h-3.5 text-[#28745e]" />
            <span>Quick Edit</span>
          </button>

          {/* Donate CTA */}
          <button
            onClick={() => setIsDonateOpen(true)}
            className="focusable flex items-center gap-2 rounded-full bg-[#123f38] px-5 py-3 text-sm font-bold text-[#fffdf8] shadow-md hover:bg-[#28745e] transition hover:-translate-y-0.5"
          >
            <Heart className="w-4 h-4 text-[#f2ad3b] fill-[#f2ad3b]" />
            <span>{content.brand.primaryCtaText}</span>
          </button>
        </div>

        {/* Mobile Nav */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/admin/login"
            className="focusable rounded-lg p-2 text-[#123f38] hover:bg-[#e8f0e8]"
            aria-label="Admin Login"
          >
            <Lock className="w-5 h-5 text-[#123f38]" />
          </Link>

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
              href="#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="focusable rounded py-2 text-base font-bold text-[#183a35]"
            >
              Impact Stories
            </a>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="focusable flex items-center gap-2 rounded-xl border border-[#123f38] px-4 py-2.5 font-bold text-[#123f38]"
            >
              <Lock className="w-4 h-4 text-[#f2ad3b]" />
              <span>Admin Login Portal</span>
            </Link>
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
