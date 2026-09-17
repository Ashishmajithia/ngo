'use client';

import React from 'react';
import { X } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

export const GalleryModal: React.FC = () => {
  const { selectedGalleryImage, setSelectedGalleryImage } = useContent();

  if (!selectedGalleryImage) return null;

  return (
    <div
      onClick={() => setSelectedGalleryImage(null)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] w-full overflow-hidden rounded-3xl bg-black shadow-2xl border border-white/20"
      >
        <button
          onClick={() => setSelectedGalleryImage(null)}
          className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2.5 text-white hover:bg-white hover:text-black transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-center h-full p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedGalleryImage}
            alt="Enlarged view"
            className="max-h-[82vh] w-auto object-contain rounded-2xl mx-auto"
          />
        </div>
      </div>
    </div>
  );
};
