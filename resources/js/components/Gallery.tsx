'use client';

import React from 'react';
import { Maximize2 } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { defaultContent } from '@/data/initialContent';
import { SafeImage } from '@/components/SafeImage';

export const Gallery: React.FC = () => {
  const { content, setSelectedGalleryImage } = useContent();
  const gallery = (content && content.gallery && typeof content.gallery === 'object')
    ? content.gallery
    : defaultContent.gallery;

  const items = (Array.isArray(gallery?.items) && gallery.items.length > 0)
    ? gallery.items
    : (defaultContent.gallery?.items || []);

  if (items.length === 0) return null;

  return (
    <section id="gallery" className="bg-[#123f38] px-4 sm:px-5 py-12 sm:py-20 lg:px-8 lg:py-28 text-[#fffdf8]">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        {(gallery?.title || gallery?.eyebrow || gallery?.copy) && (
          <div className="max-w-2xl">
            {gallery.eyebrow && (
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[.16em] text-[#f2ad3b]">
                {gallery.eyebrow}
              </p>
            )}
            {gallery.title && (
              <h2 className="display-font mt-3 sm:mt-4 text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                {gallery.title}
              </h2>
            )}
            {gallery.copy && (
              <p className="mt-3 sm:mt-5 text-base sm:text-lg leading-relaxed text-[#f8f4e9]/80">
                {gallery.copy}
              </p>
            )}
          </div>
        )}

        {/* Gallery Grid */}
        <div className="mt-8 sm:mt-12 grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <figure
              key={item.id}
              onClick={() => setSelectedGalleryImage(item.image)}
              className={`gallery-card group relative cursor-pointer overflow-hidden rounded-3xl bg-[#1a4941] shadow-xl ${
                item.gridSpan || ''
              }`}
            >
              <div className="overflow-hidden h-64 sm:h-80 relative">
                <SafeImage
                  src={item.image}
                  alt={item.title}
                  fallbackSrc="/uploads/gal_gal-1789648482492.jpg"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#123f38] via-transparent to-transparent opacity-80" />

                {/* Tap to expand overlay button: visible on mobile, hover on desktop */}
                <div className="absolute top-3.5 right-3.5 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#123f38]/80 backdrop-blur text-white opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition duration-300 shadow-md">
                  <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#f2ad3b]" />
                </div>
              </div>

              <figcaption className="p-4 sm:p-5">
                <p className="display-font font-bold text-base sm:text-lg text-[#fffdf8]">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-[#f8f4e9]/70 leading-snug">
                  {item.caption}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
