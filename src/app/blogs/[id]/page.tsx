'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  User,
  ArrowLeft,
  Heart,
  Share2,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { defaultBlogs } from '@/data/initialBlogs';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DonateModal } from '@/components/DonateModal';
import { ContentProvider, useContent } from '@/context/ContentContext';

function BlogDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { setIsDonateOpen, showToast } = useContent();

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await fetch('/api/blogs');
        if (res.ok) {
          const json = await res.json();
          if (json.blogs && Array.isArray(json.blogs)) {
            const found = json.blogs.find((b: BlogPost) => b.id === id || b.slug === id);
            if (found) {
              setBlog(found);
              setLoading(false);
              return;
            }
          }
        }
      } catch {
        console.warn('API blog fetch fallback');
      }

      // 1. Try local storage cache
      try {
        const saved = localStorage.getItem('act_charitable_trust_blogs_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const foundLocal = parsed.find((b: BlogPost) => b.id === id || b.slug === id);
            if (foundLocal) {
              setBlog(foundLocal);
              setLoading(false);
              return;
            }
          }
        }
      } catch {}

      // Fallback to default blogs
      const fallback = defaultBlogs.find((b) => b.id === id || b.slug === id);
      setBlog(fallback || defaultBlogs[0]);
      setLoading(false);
    }

    if (id) fetchBlog();
  }, [id]);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Story link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#123f38] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#f2ad3b] mb-3" />
        <p className="text-sm font-bold">Loading Impact Story...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#f8f4e9] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-[#183a35] mb-2">Story Not Found</h2>
        <p className="text-sm text-[#58706a] mb-6">The blog post you are looking for does not exist.</p>
        <button
          onClick={() => router.push('/')}
          className="rounded-full bg-[#123f38] px-6 py-2.5 text-xs font-bold text-white"
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  const galleryImages = blog.images && blog.images.length > 0 ? blog.images : [blog.coverImage];

  return (
    <div className="min-h-screen bg-[#f8f4e9] text-[#183a35] font-sans flex flex-col">
      <Header />

      <main className="flex-1 pb-20 pt-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Back Link */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/#gallery')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#28745e] hover:text-[#123f38] transition bg-white/80 border border-[#dce7dc] rounded-full px-4 py-2 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Impact Stories</span>
          </button>
        </div>

        {/* Category & Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#58706a] mb-4">
          <span className="rounded-full bg-[#123f38] px-3.5 py-1 text-xs font-bold text-[#f2ad3b]">
            {blog.category}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#28745e]" />
            {blog.date}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <User className="w-3.5 h-3.5 text-[#28745e]" />
            {blog.author}
          </span>
        </div>

        {/* Main Title */}
        <h1 className="display-font text-3xl sm:text-4xl lg:text-5xl font-bold text-[#183a35] leading-tight mb-6">
          {blog.title}
        </h1>

        {/* Cover Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#d9e1d7] mb-10 h-72 sm:h-96 lg:h-[450px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Article Excerpt Highlight */}
        {blog.excerpt && (
          <div className="p-6 rounded-2xl bg-[#e8f0e8] border-l-4 border-[#28745e] text-[#123f38] text-base sm:text-lg font-medium leading-relaxed mb-8 shadow-sm">
            {blog.excerpt}
          </div>
        )}

        {/* Full Story Content */}
        <article className="prose max-w-none text-base sm:text-lg text-[#334e48] leading-relaxed whitespace-pre-line space-y-4 mb-12">
          {blog.content}
        </article>

        {/* MULTIPLE GALLERY IMAGES SHOWCASE */}
        <section className="mt-12 pt-10 border-t border-[#dce7dc]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#28745e] mb-1">
                <ImageIcon className="w-4 h-4 text-[#f2ad3b]" />
                <span>Story Photo Gallery ({galleryImages.length} Photos)</span>
              </div>
              <h2 className="display-font text-2xl font-bold text-[#183a35]">Field Gallery & Visual Moments</h2>
            </div>
            <span className="text-xs text-[#58706a] hidden sm:block">Click any image to expand</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryImages.map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className="group relative cursor-pointer rounded-2xl overflow-hidden border border-[#dce7dc] bg-white h-60 shadow-md hover:shadow-xl transition-all duration-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={`${blog.title} gallery photo ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                  <BookOpen className="w-4 h-4 text-[#f2ad3b]" />
                  <span>Expand Image</span>
                </div>
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/60 text-[10px] font-bold text-white backdrop-blur">
                  Photo #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action Callout Box */}
        <div className="mt-14 p-8 rounded-3xl bg-[#123f38] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-[#f2ad3b]/30">
          <div className="space-y-1 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f2ad3b] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Make A Direct Difference</span>
            </span>
            <h3 className="display-font text-2xl font-bold">Inspired by this story?</h3>
            <p className="text-xs text-[#f8f4e9]/80">Your donation brings clean water, education, and health to rural communities.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsDonateOpen(true)}
              className="flex items-center gap-2 rounded-full bg-[#f2ad3b] px-6 py-3 text-xs font-bold text-[#183a35] shadow-lg hover:bg-[#f5bf63] transition"
            >
              <Heart className="w-4 h-4 fill-[#183a35]" />
              <span>Donate Now</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-xs font-bold text-white hover:bg-white/10 transition"
            >
              <Share2 className="w-4 h-4 text-[#f2ad3b]" />
              <span>Share Story</span>
            </button>
          </div>
        </div>
      </main>

      {/* LIGHTBOX MODAL FOR MULTIPLE GALLERY IMAGES */}
      {lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-20 rounded-full bg-white/20 p-3 text-white hover:bg-white/40 transition"
          >
            <X className="w-6 h-6" />
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev !== null ? (prev === 0 ? galleryImages.length - 1 : prev - 1) : 0));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/20 p-3 text-white hover:bg-white/40 transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev !== null ? (prev === galleryImages.length - 1 ? 0 : prev + 1) : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/20 p-3 text-white hover:bg-white/40 transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div onClick={(e) => e.stopPropagation()} className="relative max-w-4xl max-h-[85vh] p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={galleryImages[lightboxIndex]}
              alt={`Gallery Image ${lightboxIndex + 1}`}
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl mx-auto border border-white/20"
            />
            <div className="text-center mt-3 text-xs font-bold text-white/90">
              Photo {lightboxIndex + 1} of {galleryImages.length}
            </div>
          </div>
        </div>
      )}

      <Footer />
      <DonateModal />
    </div>
  );
}

export default function BlogDetailPage() {
  return (
    <ContentProvider>
      <BlogDetailPageContent />
    </ContentProvider>
  );
}
