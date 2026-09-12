'use client';

import React from 'react';
import { Maximize2 } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

export const Gallery: React.FC = () => {
  const { content, setSelectedGalleryImage } = useContent();
  const { gallery } = content;

  return (
    <section id="gallery" className="bg-[#123f38] text-[#fffdf8] px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[.16em] text-[#f2ad3b]">
              {gallery.eyebrow}
            </p>
            <h2 className="display-font mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#fffdf8]">
              {gallery.title}
            </h2>
          </div>
          <p className="max-w-md leading-relaxed text-[#f8f4e9]/80 text-base">
            {gallery.copy}
          </p>
        </div>

        {/* Gallery Cards Grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.items.map((item) => (
            <figure
              key={item.id}
              onClick={() => setSelectedGalleryImage(item.image)}
              className={`gallery-card group relative cursor-pointer overflow-hidden rounded-3xl bg-[#183a35] shadow-xl border border-white/10 ${
                item.gridSpan || ''
              }`}
            >
              <div className="overflow-hidden h-72 sm:h-80 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#123f38] via-transparent to-transparent opacity-80" />

                {/* Hover overlay button */}
                <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#123f38]/70 backdrop-blur text-white opacity-0 group-hover:opacity-100 transition duration-300">
                  <Maximize2 className="w-5 h-5 text-[#f2ad3b]" />
                </div>
              </div>

              <figcaption className="p-5">
                <p className="display-font font-bold text-lg text-[#fffdf8]">
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
