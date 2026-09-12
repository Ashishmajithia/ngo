'use client';

import React from 'react';
import { HeartHandshake, Phone, Mail, MapPin, Heart } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

export const Footer: React.FC = () => {
  const { content, setIsAdminOpen } = useContent();
  const { brand } = content;

  return (
    <footer className="border-t border-[#d9e1d7] bg-[#f8f4e9] text-[#183a35]">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-8 border-b border-[#d9e1d7]">
          {/* Brand Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123f38] text-white">
                <HeartHandshake className="w-5 h-5 text-[#f2ad3b]" />
              </span>
              <span className="display-font font-bold text-lg">{brand.name}</span>
            </div>
            <p className="text-xs text-[#58706a] leading-relaxed">
              Empowering grassroots communities through quality education, rural health drives, and sustainable livelihoods.
            </p>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-bold text-sm text-[#123f38] uppercase tracking-wider mb-3">
              Contact Info
            </h4>
            <ul className="space-y-2 text-xs text-[#58706a]">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#28745e] shrink-0" />
                <span>{brand.location}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#28745e] shrink-0" />
                <a href={`mailto:${brand.email}`} className="hover:underline">
                  {brand.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#28745e] shrink-0" />
                <span>{brand.phone}</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm text-[#123f38] uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-1.5 text-xs font-semibold text-[#58706a]">
              <li><a href="#about" className="hover:text-[#28745e]">About Our Mission</a></li>
              <li><a href="#programs" className="hover:text-[#28745e]">Grassroots Programs</a></li>
              <li><a href="#approach" className="hover:text-[#28745e]">Core Principles</a></li>
              <li><a href="#gallery" className="hover:text-[#28745e]">Photo Gallery</a></li>
              <li><a href="#impact" className="hover:text-[#28745e]">Impact Reports</a></li>
            </ul>
          </div>

          {/* Admin Customizer Link */}
          <div>
            <h4 className="font-bold text-sm text-[#123f38] uppercase tracking-wider mb-3">
              Dynamic Controls
            </h4>
            <p className="text-xs text-[#58706a] mb-3">
              Edit all text, hero slides, images, stats, and contact info live.
            </p>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="focusable inline-flex items-center gap-1.5 rounded-full border border-[#28745e] px-4 py-2 text-xs font-bold text-[#123f38] hover:bg-[#123f38] hover:text-white transition"
            >
              <Heart className="w-3.5 h-3.5 text-[#f2ad3b]" />
              <span>Open Content Customizer</span>
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#58706a] gap-2">
          <p>© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for maximum performance on Vercel.
          </p>
        </div>
      </div>
    </footer>
  );
};
