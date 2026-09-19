'use client';

import React, { useState } from 'react';
import Link from './Link';
import {
  HeartHandshake,
  Phone,
  Mail,
  MapPin,
  Heart,
  Lock,
  QrCode,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';
import { useContent } from '@/context/ContentContext';

export const Footer: React.FC = () => {
  const { content, setIsDonateOpen, showToast } = useContent();
  const { brand, payment } = content;
  const [copiedUpi, setCopiedUpi] = useState(false);

  const qrImage = payment?.qrCodeImage || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=actcharitabletrust@upi&pn=ACT%20Charitable%20Trust&cu=INR';
  const upiId = payment?.upiId || 'actcharitabletrust@upi';
  const isQrEnabled = payment?.enableQrDonation !== false;

  const handleCopyUpi = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    showToast('✓ UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  return (
    <footer className="border-t border-[#d9e1d7] bg-[#f8f4e9] text-[#183a35]">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 py-10 sm:py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-10 border-b border-[#d9e1d7]">
          {/* Brand Info */}
          <div className="space-y-3.5 sm:space-y-4">
            <div className="flex items-center gap-3">
              {brand.logo ? (
                brand.logoStyle === 'full' ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-11 xs:h-12 sm:h-16 w-auto max-w-[190px] xs:max-w-[240px] sm:max-w-[320px] object-contain"
                  />
                ) : (
                  <>
                    <span className="relative flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center overflow-hidden rounded-xl border border-[#d9e1d7] bg-white shadow-sm shrink-0">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="h-full w-full object-contain p-1"
                      />
                    </span>
                    <span className="display-font font-bold text-base sm:text-lg">{brand.name}</span>
                  </>
                )
              ) : (
                <>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123f38] text-white shrink-0">
                    <HeartHandshake className="w-5 h-5 text-[#f2ad3b]" />
                  </span>
                  <span className="display-font font-bold text-base sm:text-lg">{brand.name}</span>
                </>
              )}
            </div>
            <p className="text-xs text-[#58706a] leading-relaxed">
              Empowering grassroots communities through quality education, rural healthcare drives, and sustainable livelihoods.
            </p>
            <div className="pt-1">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#58706a] hover:text-[#123f38] transition py-1"
              >
                <Lock className="w-3 h-3 text-[#28745e]" />
                <span>Admin Login Portal</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm text-[#123f38] uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[#58706a]">
              <li><a href="/#about" className="hover:text-[#28745e] transition py-0.5 inline-block">About Our Mission</a></li>
              <li><a href="/#programs" className="hover:text-[#28745e] transition py-0.5 inline-block">Grassroots Programs</a></li>
              <li><a href="/#approach" className="hover:text-[#28745e] transition py-0.5 inline-block">Core Principles</a></li>
              <li><a href="/#stories" className="hover:text-[#28745e] transition py-0.5 inline-block">Impact Stories & Blogs</a></li>
              <li><a href="/#gallery" className="hover:text-[#28745e] transition py-0.5 inline-block">Moments Gallery</a></li>
              <li><a href="/#impact" className="hover:text-[#28745e] transition py-0.5 inline-block">Impact Reports & Metrics</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-bold text-sm text-[#123f38] uppercase tracking-wider mb-3">
              Trust Details
            </h4>
            {(brand.location || brand.email || brand.phone) ? (
              <ul className="space-y-2.5 text-xs text-[#58706a]">
                {brand.location && (
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#28745e] shrink-0 mt-0.5" />
                    <span>{brand.location}</span>
                  </li>
                )}
                {brand.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#28745e] shrink-0" />
                    <a href={`mailto:${brand.email}`} className="hover:underline text-[#183a35] truncate">
                      {brand.email}
                    </a>
                  </li>
                )}
                {brand.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#28745e] shrink-0" />
                    <span className="text-[#183a35] font-semibold">{brand.phone}</span>
                  </li>
                )}
              </ul>
            ) : (
              <div className="space-y-2 text-xs text-[#58706a]">
                <p className="font-bold text-[#1b8744] uppercase tracking-wider">{brand.regNo || 'REG.NO.220'}</p>
                <p className="text-[#183a35] font-semibold">{brand.tagline || 'Rising Hope for Children'}</p>
                <p className="text-[11px] text-[#58706a]">Official Registered Charitable Trust</p>
              </div>
            )}
          </div>

          {/* UPI Scan & Pay QR Card */}
          <div>
            <h4 className="font-bold text-sm text-[#123f38] uppercase tracking-wider mb-3 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#28745e]" />
              <span>Scan & Pay Via UPI</span>
            </h4>

            {isQrEnabled ? (
              <div
                onClick={() => setIsDonateOpen(true)}
                className="group cursor-pointer rounded-2xl bg-white p-3.5 border border-[#dce7dc] shadow-sm hover:shadow-md hover:border-[#28745e] transition space-y-2.5"
              >
                <div className="flex items-center gap-3">
                  {/* QR Image Box */}
                  <div className="h-18 w-18 xs:h-20 xs:w-20 shrink-0 rounded-xl bg-white p-1 border border-[#123f38]/30 shadow-inner flex items-center justify-center overflow-hidden">
                    <img
                      src={qrImage}
                      alt="UPI Payment QR Code"
                      className="h-full w-full object-contain group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#123f38] leading-tight group-hover:text-[#28745e] transition">
                      Scan with any UPI App
                    </p>
                    <p className="text-[10px] text-[#58706a] mt-0.5">
                      GPay • PhonePe • Paytm
                    </p>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-[#28745e]">
                      <span>Open Form</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                    </span>
                  </div>
                </div>

                {/* UPI ID One-Click Copy */}
                {upiId && (
                  <div className="flex items-center justify-between gap-1 bg-[#f8f4e9] px-2.5 py-1.5 rounded-lg border border-[#dce7dc] text-[11px]">
                    <span className="font-mono text-[#183a35] font-bold truncate text-[10px] xs:text-[11px]">{upiId}</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="inline-flex items-center gap-1 text-[#28745e] hover:text-[#123f38] font-bold shrink-0 ml-1 py-0.5"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-[#28745e]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsDonateOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#123f38] px-4 py-3 text-xs font-bold text-white hover:bg-[#28745e] transition shadow-sm"
              >
                <Heart className="w-4 h-4 text-[#f2ad3b]" />
                <span>Contribute to {brand.name}</span>
              </button>
            )}
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#58706a] gap-2 text-center sm:text-left">
          <p>© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
          <p className="flex items-center justify-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for maximum performance on Vercel.
          </p>
        </div>
      </div>
    </footer>
  );
};
