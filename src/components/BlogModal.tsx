'use client';

import React from 'react';
import { X, Calendar, User, Heart, Share2 } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { useContent } from '@/context/ContentContext';

interface BlogModalProps {
  blog: BlogPost | null;
  onClose: () => void;
}

export const BlogModal: React.FC<BlogModalProps> = ({ blog, onClose }) => {
  const { setIsDonateOpen, showToast } = useContent();

  if (!blog) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Story link copied to clipboard!');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-8 w-full max-w-3xl rounded-3xl bg-[#fffdf8] text-[#183a35] shadow-2xl border border-[#d9e1d7] overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full bg-black/60 p-2.5 text-white hover:bg-black transition shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cover Image */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fffdf8] via-transparent to-black/40" />
          <span className="absolute top-4 left-4 rounded-full bg-[#123f38] px-4 py-1.5 text-xs font-bold text-[#f2ad3b] shadow-md">
            {blog.category}
          </span>
        </div>

        {/* Story Body */}
        <div className="p-6 sm:p-10 -mt-8 relative z-10">
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#58706a] mb-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-[#28745e]" />
              {blog.date}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-4 h-4 text-[#28745e]" />
              {blog.author}
            </span>
          </div>

          <h2 className="display-font text-2xl sm:text-4xl font-bold leading-tight text-[#183a35]">
            {blog.title}
          </h2>

          <div className="mt-6 prose text-base text-[#58706a] leading-relaxed whitespace-pre-line border-t border-[#dce7dc] pt-6">
            {blog.content}
          </div>

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
              <span>Support This Impact Cause</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-full border border-[#dce7dc] px-5 py-3 text-xs font-bold text-[#183a35] hover:bg-[#f8f4e9] transition"
            >
              <Share2 className="w-4 h-4 text-[#28745e]" />
              <span>Share Story</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
