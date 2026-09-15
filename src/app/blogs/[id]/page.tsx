'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  ArrowLeft,
  Heart,
  Share2,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  Clock,
  Check,
  Copy,
  QrCode,
  Quote,
  Send,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { defaultBlogs } from '@/data/initialBlogs';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DonateModal } from '@/components/DonateModal';
import { ContentProvider, useContent } from '@/context/ContentContext';

interface CommentItem {
  id: string;
  name: string;
  message: string;
  date: string;
}

function BlogDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>(defaultBlogs);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Well-Wisher Comments state
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');

  const { content, setIsDonateOpen, showToast } = useContent();
  const payment = content.payment || {};
  const upiId = payment.upiId || 'actcharitabletrust@upi';
  const qrImage = payment.qrCodeImage || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=actcharitabletrust@upi&pn=ACT%20Charitable%20Trust&cu=INR';

  useEffect(() => {
    async function fetchBlog() {
      let blogsList: BlogPost[] = defaultBlogs;

      try {
        const res = await fetch('/api/blogs');
        if (res.ok) {
          const json = await res.json();
          if (json.blogs && Array.isArray(json.blogs) && json.blogs.length > 0) {
            blogsList = json.blogs;
          }
        }
      } catch {
        console.warn('API blog fetch fallback');
      }

      // Try local storage cache
      try {
        const saved = localStorage.getItem('act_charitable_trust_blogs_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            blogsList = parsed;
          }
        }
      } catch {}

      setAllBlogs(blogsList);
      const found = blogsList.find((b: BlogPost) => b.id === id || b.slug === id);
      setBlog(found || blogsList[0]);

      // Load sample/saved comments for this blog
      try {
        const savedComments = localStorage.getItem(`act_comments_${id}`);
        if (savedComments) {
          setComments(JSON.parse(savedComments));
        } else {
          setComments([
            {
              id: 'c-1',
              name: 'Dr. Anita Roy',
              message: 'Inspiring to see the real impact on ground level! Keep up this incredible work.',
              date: '2 days ago',
            },
            {
              id: 'c-2',
              name: 'Karan Sharma',
              message: 'Glad to support this cause. Every child deserves such learning opportunities!',
              date: '5 days ago',
            },
          ]);
        }
      } catch {}

      setLoading(false);
    }

    if (id) fetchBlog();
  }, [id]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null || !blog) return;
      const images = blog.images && blog.images.length > 0 ? blog.images : [blog.coverImage];
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev !== null ? (prev === images.length - 1 ? 0 : prev + 1) : 0));
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev !== null ? (prev === 0 ? images.length - 1 : prev - 1) : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, blog]);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast('✓ Story link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined' && blog) {
      const text = encodeURIComponent(`Read this inspiring impact story from ${content.brand.name}: "${blog.title}" - ${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  const handleCopyUpi = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    showToast('✓ UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    const newComment: CommentItem = {
      id: 'com-' + Date.now(),
      name: commentName.trim(),
      message: commentText.trim(),
      date: 'Just now',
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    try {
      localStorage.setItem(`act_comments_${id}`, JSON.stringify(updated));
    } catch {}

    setCommentName('');
    setCommentText('');
    showToast('✓ Thank you! Your well-wisher message has been posted.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#123f38] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-9 h-9 animate-spin text-[#f2ad3b] mb-4" />
        <p className="text-base font-bold">Loading Impact Story...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#f8f4e9] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-bold text-[#183a35] mb-3">Story Not Found</h2>
        <p className="text-sm text-[#58706a] mb-6">The blog post you are looking for is unavailable.</p>
        <button
          onClick={() => router.push('/')}
          className="rounded-full bg-[#123f38] px-7 py-3 text-xs font-bold text-white shadow-md hover:bg-[#28745e] transition"
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  const galleryImages = blog.images && blog.images.length > 0 ? blog.images : [blog.coverImage];
  const relatedStories = allBlogs.filter((b) => b.id !== blog.id).slice(0, 3);
  const wordCount = (blog.content || '').split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="min-h-screen bg-[#f8f4e9] text-[#183a35] font-sans flex flex-col selection:bg-[#f2ad3b]/30">
      <Header />

      {/* Top Breadcrumbs Bar */}
      <div className="border-b border-[#dce7dc] bg-white/70 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs">
          <nav className="flex items-center gap-2 text-[#58706a] truncate">
            <Link href="/" className="hover:text-[#28745e] font-semibold transition">Home</Link>
            <span>/</span>
            <Link href="/#gallery" className="hover:text-[#28745e] font-semibold transition">Impact Stories</Link>
            <span>/</span>
            <span className="text-[#183a35] font-bold truncate max-w-[200px] sm:max-w-xs">{blog.title}</span>
          </nav>

          <button
            onClick={() => router.push('/#gallery')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#28745e] hover:text-[#123f38] transition shrink-0 ml-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">All Stories</span>
          </button>
        </div>
      </div>

      <main className="flex-1 pb-24 pt-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Article Meta Top Banner */}
        <header className="mb-8 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#123f38] px-3.5 py-1 text-xs font-bold text-[#f2ad3b] shadow-sm">
              <Sparkles className="w-3 h-3" />
              {blog.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-[#58706a] bg-white border border-[#dce7dc] rounded-full px-3 py-1 font-medium shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[#28745e]" />
              {readTimeMinutes} min read
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-[#58706a] bg-white border border-[#dce7dc] rounded-full px-3 py-1 font-medium shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#28745e]" />
              {blog.date}
            </span>
          </div>

          <h1 className="display-font text-3xl sm:text-4xl lg:text-5xl font-bold text-[#183a35] leading-[1.2] tracking-tight">
            {blog.title}
          </h1>

          {/* Author info pill */}
          <div className="mt-5 flex items-center justify-between gap-4 pt-4 border-t border-[#dce7dc]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#123f38] text-[#f2ad3b] font-bold text-sm shadow-md">
                {blog.author ? blog.author.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <p className="text-xs font-bold text-[#183a35]">{blog.author || 'ACT Community Team'}</p>
                <p className="text-[11px] text-[#58706a]">Grassroots Field Dispatch • {content.brand.name}</p>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#25D366] text-white px-3 py-1.5 text-xs font-bold shadow-sm hover:opacity-90 transition"
                title="Share on WhatsApp"
              >
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#dce7dc] px-3.5 py-1.5 text-xs font-bold text-[#183a35] hover:bg-[#f8f4e9] transition shadow-xs"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#28745e]" /> : <Share2 className="w-3.5 h-3.5 text-[#28745e]" />}
                <span>{copiedLink ? 'Copied Link' : 'Share'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Big Magazine Cover Hero */}
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#d9e1d7] mb-12 h-80 sm:h-[450px] lg:h-[520px] bg-neutral-900 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-md px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-black/90 transition"
          >
            <ImageIcon className="w-4 h-4 text-[#f2ad3b]" />
            <span>View Full Photo ({galleryImages.length})</span>
          </button>
        </div>

        {/* 2-Column Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Story & Gallery & Comments (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Excerpt Highlight Card */}
            {blog.excerpt && (
              <div className="relative rounded-3xl bg-[#e8f0e8] p-6 sm:p-8 border-l-8 border-[#28745e] shadow-sm">
                <Quote className="w-8 h-8 text-[#28745e]/30 absolute top-4 right-5" />
                <p className="display-font text-lg sm:text-xl font-semibold text-[#123f38] leading-relaxed italic">
                  &ldquo;{blog.excerpt}&rdquo;
                </p>
              </div>
            )}

            {/* Story Full Content */}
            <article className="prose prose-emerald max-w-none text-base sm:text-lg text-[#263e39] leading-relaxed whitespace-pre-line space-y-5 bg-white p-6 sm:p-10 rounded-3xl border border-[#dce7dc] shadow-sm">
              {blog.content}
            </article>

            {/* MULTI-PHOTO GALLERY MOSAIC */}
            {galleryImages.length > 0 && (
              <section className="rounded-3xl bg-white p-6 sm:p-8 border border-[#dce7dc] shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#dce7dc]">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#28745e]">
                      <ImageIcon className="w-4 h-4 text-[#f2ad3b]" />
                      <span>Visual Evidence & Moments</span>
                    </span>
                    <h3 className="display-font text-2xl font-bold text-[#183a35]">Field Photo Gallery</h3>
                  </div>
                  <span className="text-xs bg-[#e8f0e8] text-[#123f38] px-3 py-1 rounded-full font-bold">
                    {galleryImages.length} Photographs
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {galleryImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxIndex(idx)}
                      className={`group relative cursor-pointer rounded-2xl overflow-hidden border border-[#dce7dc] bg-[#f8f4e9] shadow-sm hover:shadow-xl transition-all duration-300 ${
                        idx === 0 && galleryImages.length > 1 ? 'sm:col-span-2 h-72' : 'h-56'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`${blog.title} photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                        <Sparkles className="w-4 h-4 text-[#f2ad3b]" />
                        <span>Click to Enlarge</span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/70 text-[11px] font-bold text-white backdrop-blur">
                        Photo #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Author & Mission Box */}
            <div className="rounded-3xl bg-[#123f38] text-[#fffdf8] p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center gap-5 border border-[#f2ad3b]/20">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#28745e] text-[#f2ad3b] font-bold text-2xl shadow-inner">
                {blog.author ? blog.author.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h4 className="display-font text-lg font-bold">{blog.author || 'ACT Trust Field Representative'}</h4>
                  <ShieldCheck className="w-4 h-4 text-[#f2ad3b]" />
                </div>
                <p className="text-xs text-[#f8f4e9]/80 leading-relaxed">
                  Reporting directly from grassroots intervention centers. We believe in 100% transparency and real-time storytelling of lives transformed.
                </p>
              </div>
            </div>

            {/* Well-Wisher Support Message Board */}
            <section className="rounded-3xl bg-white p-6 sm:p-8 border border-[#dce7dc] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#dce7dc]">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#28745e]" />
                  <h3 className="display-font text-xl font-bold text-[#183a35]">Well-Wisher Community Board</h3>
                </div>
                <span className="text-xs font-bold text-[#58706a]">{comments.length} Messages</span>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-3 bg-[#f8f4e9] p-4 rounded-2xl border border-[#dce7dc]">
                <p className="text-xs font-bold text-[#123f38]">Leave an encouraging message for our team & children:</p>
                <input
                  type="text"
                  required
                  placeholder="Your Full Name *"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="w-full rounded-xl border border-[#dce7dc] px-3.5 py-2 text-xs bg-white focus:border-[#28745e] focus:outline-none"
                />
                <textarea
                  rows={3}
                  required
                  placeholder="Write your words of support or blessings... *"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full rounded-xl border border-[#dce7dc] px-3.5 py-2 text-xs bg-white focus:border-[#28745e] focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#123f38] px-5 py-2 text-xs font-bold text-white hover:bg-[#28745e] transition shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 text-[#f2ad3b]" />
                    <span>Post Message</span>
                  </button>
                </div>
              </form>

              {/* Messages List */}
              <div className="space-y-3 pt-2">
                {comments.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-[#f8f4e9]/60 border border-[#dce7dc] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#183a35]">{c.name}</span>
                      <span className="text-[10px] text-[#58706a]">{c.date}</span>
                    </div>
                    <p className="text-xs text-[#58706a] leading-relaxed">{c.message}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Donation Card & Related Stories (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* STICKY QUICK DONATION & UPI QR CARD */}
            <div className="sticky top-16 rounded-3xl bg-white p-6 border-2 border-[#123f38]/20 shadow-xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-[#dce7dc]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#123f38] text-white shrink-0 shadow-md">
                  <Heart className="w-5 h-5 text-[#f2ad3b] fill-[#f2ad3b]" />
                </div>
                <div>
                  <h4 className="display-font font-bold text-base text-[#183a35]">Support This Mission</h4>
                  <p className="text-[11px] text-[#28745e] font-semibold">100% Direct Grassroots Impact</p>
                </div>
              </div>

              {/* UPI QR Scan Preview */}
              {payment.enableQrDonation !== false && (
                <div className="rounded-2xl bg-[#f8f4e9] p-3.5 border border-[#dce7dc] text-center space-y-2.5">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#123f38] uppercase tracking-wider">
                    <QrCode className="w-3.5 h-3.5 text-[#28745e]" />
                    <span>Scan with Any UPI App</span>
                  </div>

                  <div className="mx-auto w-40 h-40 bg-white p-2 rounded-xl border border-[#123f38] shadow-md flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrImage} alt="Payment QR Code" className="w-full h-full object-contain" />
                  </div>

                  {upiId && (
                    <div className="flex items-center justify-between gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-[#dce7dc] text-xs">
                      <span className="font-mono text-[11px] font-bold text-[#183a35] truncate">{upiId}</span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="inline-flex items-center gap-1 text-[#28745e] font-bold text-[10px] hover:text-[#123f38] shrink-0"
                      >
                        {copiedUpi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Preset Contribution Buttons */}
              <div>
                <p className="text-xs font-bold text-[#183a35] mb-2">Quick Contribution (₹):</p>
                <div className="grid grid-cols-3 gap-2">
                  {['500', '1000', '2500'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setIsDonateOpen(true)}
                      className="py-2 rounded-xl border border-[#dce7dc] bg-[#f8f4e9] text-xs font-bold text-[#183a35] hover:border-[#28745e] hover:bg-[#28745e] hover:text-white transition shadow-2xs"
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Open Modal CTA Button */}
              <button
                type="button"
                onClick={() => setIsDonateOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#123f38] py-3.5 text-sm font-bold text-[#fffdf8] shadow-lg hover:bg-[#28745e] transition"
              >
                <Heart className="w-4 h-4 text-[#f2ad3b] fill-[#f2ad3b]" />
                <span>Contribute & Get Receipt</span>
              </button>

              <div className="flex items-center justify-center gap-1 text-[11px] text-[#58706a]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#28745e]" />
                <span>80G Tax Exemption Eligible</span>
              </div>
            </div>

            {/* Related Stories Card */}
            {relatedStories.length > 0 && (
              <div className="rounded-3xl bg-white p-6 border border-[#dce7dc] shadow-sm space-y-4">
                <h4 className="display-font text-base font-bold text-[#183a35] pb-2 border-b border-[#dce7dc]">
                  More Moments of Hope
                </h4>

                <div className="space-y-3">
                  {relatedStories.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/blogs/${rel.slug || rel.id}`}
                      className="group flex gap-3 items-center p-2 rounded-2xl hover:bg-[#f8f4e9] transition"
                    >
                      <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-neutral-200 border border-[#dce7dc]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={rel.coverImage}
                          alt={rel.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#28745e] uppercase">{rel.category}</span>
                        <h5 className="text-xs font-bold text-[#183a35] line-clamp-2 group-hover:text-[#28745e] transition">
                          {rel.title}
                        </h5>
                        <p className="text-[10px] text-[#58706a] mt-0.5">{rel.date}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* BOTTOM ACTION HERO CALLOUT */}
        <section className="mt-16 rounded-[2.5rem] bg-[#123f38] text-white p-8 sm:p-12 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#f2ad3b]/30">
          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f2ad3b] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Be Part of This Transformation</span>
            </span>
            <h3 className="display-font text-2xl sm:text-3xl font-bold">Every Child Deserves A Dignified Future</h3>
            <p className="text-xs sm:text-sm text-[#f8f4e9]/80 max-w-xl">
              Your kindness translates into classroom benches, nutritious school meals, and lifesaving medical drives.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsDonateOpen(true)}
              className="flex items-center gap-2 rounded-full bg-[#f2ad3b] px-7 py-3.5 text-xs font-bold text-[#183a35] shadow-lg hover:bg-[#f5bf63] transition"
            >
              <Heart className="w-4 h-4 fill-[#183a35]" />
              <span>Donate Now</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-xs font-bold text-white hover:bg-white/10 transition"
            >
              <Share2 className="w-4 h-4 text-[#f2ad3b]" />
              <span>Share Story</span>
            </button>
          </div>
        </section>
      </main>

      {/* LIGHTBOX MODAL WITH KEYBOARD & TOUCH CONTROLS */}
      {lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 z-30 rounded-full bg-white/20 p-3 text-white hover:bg-white/40 transition"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev !== null ? (prev === 0 ? galleryImages.length - 1 : prev - 1) : 0));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 rounded-full bg-white/20 p-3.5 text-white hover:bg-white/40 transition"
                title="Previous Photo (Left Arrow)"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev !== null ? (prev === galleryImages.length - 1 ? 0 : prev + 1) : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 rounded-full bg-white/20 p-3.5 text-white hover:bg-white/40 transition"
                title="Next Photo (Right Arrow)"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          <div onClick={(e) => e.stopPropagation()} className="relative max-w-5xl max-h-[88vh] p-2 flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={galleryImages[lightboxIndex]}
              alt={`Story gallery photo ${lightboxIndex + 1}`}
              className="max-w-full max-h-[75vh] rounded-2xl object-contain shadow-2xl mx-auto border border-white/20"
            />
            <div className="text-center mt-3 text-xs font-bold text-white/90">
              Photograph {lightboxIndex + 1} of {galleryImages.length}
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
