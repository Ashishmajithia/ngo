'use client';

import React, { useState } from 'react';
import { X, Calendar, User, Heart, Share2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { useContent } from '@/context/ContentContext';

interface BlogModalProps {
  blog: BlogPost | null;
  onClose: () => void;
}

export const BlogModal: React.FC<BlogModalProps> = ({ blog, onClose }) => {
  const { setIsDonateOpen, showToast } = useContent();
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);

  if (!blog) return null;

  const galleryImages = blog.images && blog.images.length > 0 ? blog.images : [blog.coverImage];

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      const fullUrl = `${window.location.origin}/blogs/${blog.id}`;
      navigator.clipboard.writeText(fullUrl);
      showToast('Story link copied to clipboard!');
    }
  };

  const handleOpenFullPage = () => {
    onClose();
    window.location.href = `/blogs/${blog.id}`;
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-8 w-full max-w-3xl rounded-3xl bg-[#fffdf8] text-[#183a35] shadow-2xl border border-[#d9e1d7] overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full bg-black/60 p-2.5 text-white hover:bg-black transition shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {/* Cover Image */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fffdf8] via-transparent to-black/40" />
            <span className="absolute top-4 left-4 rounded-full bg-[#123f38] px-4 py-1.5 text-xs font-bold text-[#f2ad3b] shadow-md">
              {blog.category}
            </span>
          </div>

          {/* Story Body */}
          <div className="p-6 sm:p-10 -mt-8 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dce7dc] pb-4 mb-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#58706a]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-[#28745e]" />
                  {blog.date}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-4 h-4 text-[#28745e]" />
                  {blog.author}
                </span>
              </div>

              <button
                onClick={handleOpenFullPage}
                className="flex items-center gap-1.5 text-xs font-bold text-[#28745e] hover:underline"
              >
                <span>View Full Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <h2 className="display-font text-2xl sm:text-3xl font-bold leading-tight text-[#183a35]">
              {blog.title}
            </h2>

            <div className="mt-6 prose text-sm sm:text-base text-[#58706a] leading-relaxed whitespace-pre-line border-t border-[#dce7dc] pt-6">
              {blog.content}
            </div>

            {/* MULTIPLE GALLERY IMAGES DISPLAY */}
            {galleryImages.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[#dce7dc]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#28745e] flex items-center gap-1.5 mb-3">
                  <ImageIcon className="w-4 h-4 text-[#f2ad3b]" />
                  <span>Story Photo Gallery ({galleryImages.length} Uploaded Photos)</span>
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveLightboxImg(img)}
                      className="cursor-pointer relative rounded-2xl overflow-hidden border border-[#dce7dc] h-32 group shadow-sm hover:shadow-md transition"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                        Click to Zoom
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#dce7dc] pt-6">
              <button
                onClick={() => {
                  onClose();
                  setIsDonateOpen(true);
                }}
                className="flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#28745e] transition"
              >
                <Heart className="w-4 h-4 text-[#f2ad3b] fill-[#f2ad3b]" />
                <span>Support This Cause</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 rounded-full border border-[#dce7dc] px-4 py-2.5 text-xs font-bold text-[#183a35] hover:bg-[#f8f4e9] transition"
                >
                  <Share2 className="w-4 h-4 text-[#28745e]" />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleOpenFullPage}
                  className="flex items-center gap-1.5 rounded-full bg-[#28745e] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#123f38] transition"
                >
                  <span>Full Article</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox for Modal Image Click */}
      {activeLightboxImg && (
        <div
          onClick={() => setActiveLightboxImg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        >
          <button
            onClick={() => setActiveLightboxImg(null)}
            className="absolute top-4 right-4 z-20 rounded-full bg-white/20 p-3 text-white"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activeLightboxImg} alt="Gallery Enlarged" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
        </div>
      )}
    </div>
  );
};
