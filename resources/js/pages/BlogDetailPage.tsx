import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { DonateModal } from '../components/DonateModal';
import { useContent } from '../context/ContentContext';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  Share2, 
  Heart, 
  Check, 
  Sparkles, 
  BookOpen, 
  Bookmark,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2
} from 'lucide-react';
import { BlogPost } from '../types/blog';
import { defaultBlogs } from '../data/initialBlogs';
import { SafeImage } from '../components/SafeImage';

interface BlogDetailPageProps {
  slugOrId: string;
}

function getCachedStory(slugOrId: string): { blog: BlogPost | null; related: any[] } {
  try {
    // 1. Check sessionStorage for recently opened story
    if (typeof sessionStorage !== 'undefined') {
      const cached = sessionStorage.getItem('act_story_' + slugOrId);
      if (cached) {
        const json = JSON.parse(cached);
        if (json && json.blog) {
          return { blog: json.blog, related: json.related || [] };
        }
      }
    }

    // 2. Check server-injected dynamic blogs from Blade (0ms instant from database!)
    if (typeof document !== 'undefined') {
      const el = document.getElementById('server-initial-blogs');
      if (el && el.textContent) {
        const blogs: BlogPost[] = JSON.parse(el.textContent);
        if (Array.isArray(blogs)) {
          const found = blogs.find(b => b.slug === slugOrId || b.id === slugOrId);
          if (found) {
            const rel = blogs.filter(b => b.id !== found.id).slice(0, 3);
            return { blog: found, related: rel };
          }
        }
      }
    }

    // 3. Check defaultBlogs
    const foundDefault = defaultBlogs.find(b => b.slug === slugOrId || b.id === slugOrId);
    if (foundDefault) {
      const rel = defaultBlogs.filter(b => b.id !== foundDefault.id).slice(0, 3);
      return { blog: foundDefault, related: rel };
    }
  } catch {}
  return { blog: null, related: [] };
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ slugOrId }) => {
  const { content, isDonateOpen, setIsDonateOpen } = useContent();
  const initialCache = getCachedStory(slugOrId);
  const [blog, setBlog] = useState<BlogPost | null>(initialCache.blog);
  const [related, setRelated] = useState<any[]>(initialCache.related);
  // If story was already preloaded from server or cache, NEVER show any spinner!
  const [loading, setLoading] = useState(() => !initialCache.blog);
  const [copied, setCopied] = useState(false);

  // Full-screen image lightbox state
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Collect all photos from this blog (cover image + moments gallery)
  const allImages = useMemo(() => {
    const list: string[] = [];
    if (blog?.coverImage) list.push(blog.coverImage);
    if (Array.isArray(blog?.images)) {
      blog.images.forEach((img) => {
        if (img && typeof img === 'string' && !list.includes(img)) {
          list.push(img);
        }
      });
    }
    return list;
  }, [blog]);

  // Handle lightbox next & previous
  const handlePrevImage = useCallback(() => {
    if (previewIndex === null || allImages.length <= 1) return;
    setPreviewIndex((prev) => (prev === null ? 0 : (prev - 1 + allImages.length) % allImages.length));
  }, [previewIndex, allImages.length]);

  const handleNextImage = useCallback(() => {
    if (previewIndex === null || allImages.length <= 1) return;
    setPreviewIndex((prev) => (prev === null ? 0 : (prev + 1) % allImages.length));
  }, [previewIndex, allImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (previewIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewIndex(null);
      else if (e.key === 'ArrowLeft') handlePrevImage();
      else if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewIndex, handlePrevImage, handleNextImage]);

  // Prevent background scrolling when lightbox is open
  useEffect(() => {
    if (previewIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [previewIndex]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    async function loadStory() {
      try {
        const res = await fetch(`/api/blogs/${encodeURIComponent(slugOrId)}?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.blog) {
            setBlog(json.blog);
            setRelated(json.related || []);
            try {
              sessionStorage.setItem('act_story_' + slugOrId, JSON.stringify(json));
            } catch {}
          }
        }
      } catch (err) {
        console.error('Failed to load story details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStory();
  }, [slugOrId]);

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Read this inspiring story from ACT Charitable Trust (REG.NO.220): "${blog?.title}" - ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`"${blog?.title}" - Rising Hope for Children with ACT Charitable Trust (REG.NO.220)`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  // Reading time estimate
  const readingTime = blog?.content 
    ? Math.max(2, Math.ceil(blog.content.split(/\s+/).length / 180)) 
    : 3;

  // Format markdown-like text
  const renderFormattedContent = (rawText: string) => {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraphs: string[] = [];

    const flushParagraph = (key: string) => {
      if (currentParagraphs.length > 0) {
        const text = currentParagraphs.join(' ');
        elements.push(
          <p key={key} className="text-lg sm:text-xl leading-relaxed text-[#23423b] mb-6 font-normal">
            {text}
          </p>
        );
        currentParagraphs = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushParagraph(`para-${idx}`);
        return;
      }

      if (trimmed.startsWith('### ')) {
        flushParagraph(`para-before-h3-${idx}`);
        elements.push(
          <h3 key={`h3-${idx}`} className="display-font text-2xl sm:text-3xl font-bold text-[#003b73] mt-10 mb-4 tracking-tight">
            {trimmed.replace('### ', '')}
          </h3>
        );
      } else if (trimmed.startsWith('## ')) {
        flushParagraph(`para-before-h2-${idx}`);
        elements.push(
          <h2 key={`h2-${idx}`} className="display-font text-3xl sm:text-4xl font-bold text-[#003b73] mt-12 mb-5 tracking-tight border-b border-[#003b73]/10 pb-3">
            {trimmed.replace('## ', '')}
          </h2>
        );
      } else if (trimmed.startsWith('> ')) {
        flushParagraph(`para-before-quote-${idx}`);
        elements.push(
          <blockquote 
            key={`quote-${idx}`} 
            className="my-8 rounded-2xl bg-gradient-to-r from-[#f0f7ff] to-[#fdf2f8] border-l-4 border-[#d81b60] p-6 sm:p-8 shadow-sm"
          >
            <p className="display-font text-xl sm:text-2xl italic font-semibold text-[#003b73] leading-snug">
              {trimmed.replace('> ', '')}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d81b60]">
              <Heart className="w-3.5 h-3.5 fill-[#d81b60]" />
              <span>ACT Charitable Trust • Rising Hope</span>
            </div>
          </blockquote>
        );
      } else if (trimmed.startsWith('- ')) {
        flushParagraph(`para-before-list-${idx}`);
        const itemText = trimmed.replace('- ', '');
        elements.push(
          <div key={`list-${idx}`} className="flex items-start gap-3 mb-3 pl-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1b8744]/15 text-[#1b8744] mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </span>
            <span className="text-lg sm:text-xl text-[#23423b] leading-relaxed">
              {itemText.includes('**') ? (
                <span>
                  <strong>{itemText.split('**')[1]}</strong>
                  {itemText.split('**')[2]}
                </span>
              ) : itemText}
            </span>
          </div>
        );
      } else {
        currentParagraphs.push(trimmed);
      }
    });

    flushParagraph('final-para');
    return elements;
  };

  return (
    <div className="min-h-screen bg-[#fffdf8] text-[#183a35] selection:bg-[#d81b60]/20 selection:text-[#003b73]">
      <Header />

      {/* Top Breadcrumb & Trust Banner */}
      <div className="border-b border-[#e2e8f0] bg-gradient-to-r from-[#f0f7ff] via-[#f8fafc] to-[#fff7ed] px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-[#58706a]">
            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/';
              }} 
              className="font-bold text-[#004b87] hover:underline flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </a>
            <span>/</span>
            <span className="font-semibold text-[#183a35]">Impact Stories & Blog</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#1b8744]/30 bg-[#1b8744]/10 px-3.5 py-1.5 font-bold text-[#1b8744] text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Govt. Regd: REG.NO.220 • Official Trust Initiative</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        {loading && !blog ? (
          <div className="py-24 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#004b87] border-t-transparent"></div>
            <p className="mt-4 text-base font-bold text-[#58706a]">Loading inspiring story...</p>
          </div>
        ) : !blog ? (
          <div className="py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-[#d81b60]">
              <Bookmark className="w-10 h-10" />
            </div>
            <h2 className="display-font mt-6 text-3xl sm:text-4xl font-bold text-[#183a35]">Story Not Found</h2>
            <p className="mt-2 text-base text-[#58706a]">The impact story you are looking for may have been updated or archived.</p>
            <a
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#004b87] px-6 py-3 font-bold text-white shadow hover:bg-[#003b73] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Homepage</span>
            </a>
          </div>
        ) : (
          <article className="animate-in fade-in duration-300">
            {/* Story Header */}
            <div className="mb-10">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="rounded-full bg-[#004b87] px-4 py-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white shadow-sm">
                  {blog.category || 'Child Welfare'}
                </span>
                <span className="rounded-full bg-[#d81b60]/10 border border-[#d81b60]/30 px-3.5 py-1 text-xs sm:text-sm font-bold text-[#d81b60]">
                  Rising Hope for Children
                </span>
              </div>

              <h1 className="display-font text-3xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.14] text-[#003b73] tracking-tight">
                {blog.title}
              </h1>

              {/* Story Excerpt / Subheading */}
              {blog.excerpt && (
                <p className="mt-5 sm:mt-6 text-lg sm:text-2xl font-medium leading-relaxed text-[#4a635d] border-l-4 border-[#f59e0b] pl-4 sm:pl-5">
                  {blog.excerpt}
                </p>
              )}

              {/* Meta & Social Share Toolbar */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-[#e2e8f0] py-4 text-sm text-[#58706a]">
                <div className="flex flex-wrap items-center gap-5 sm:gap-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#004b87]/10 text-[#004b87] font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block font-bold text-[#183a35] text-sm leading-none">{blog.author || 'ACT Trust Team'}</span>
                      <span className="text-xs text-[#718096]">Field Contributor</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4 text-[#1b8744]" />
                    <span>{blog.date}</span>
                  </div>

                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="w-4 h-4 text-[#f59e0b]" />
                    <span>{readingTime} min read</span>
                  </div>
                </div>

                {/* Share Icons */}
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#718096] mr-1 hidden sm:inline">
                    Share:
                  </span>
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25d366]/15 text-[#128c7e] hover:bg-[#25d366]/30 transition"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleShareTwitter}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1da1f2]/15 text-[#1da1f2] hover:bg-[#1da1f2]/30 transition"
                    title="Share on X / Twitter"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 rounded-full border border-[#cbd5e1] bg-white px-3.5 py-1.5 text-xs font-bold text-[#183a35] hover:bg-[#f8fafc] transition shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#1b8744]" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Image (Click to open full-screen Lightbox) */}
            {blog.coverImage && (
              <div 
                onClick={() => setPreviewIndex(0)}
                className="group relative mb-14 overflow-hidden rounded-3xl border border-[#e2e8f0] shadow-2xl cursor-pointer"
                title="Click to view full screen"
              >
                <SafeImage
                  src={blog.coverImage}
                  alt={blog.title}
                  fallbackSrc="/uploads/act_official_logo.jpg"
                  className="h-[300px] xs:h-[400px] sm:h-[540px] md:h-[620px] lg:h-[680px] w-full object-cover transition duration-500 group-hover:scale-[1.01]"
                />
                
                {/* Floating zoom hint badge */}
                <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-4 py-2 text-xs font-bold text-white shadow-lg opacity-90 group-hover:opacity-100 group-hover:bg-[#004b87] transition">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Click to Expand Preview</span>
                </div>

                <div className="bg-[#f8fafc] px-6 py-3.5 text-xs sm:text-sm text-[#718096] italic border-t border-[#e2e8f0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
                  <span>Photo from ACT Charitable Trust field initiatives across rural & community centers.</span>
                  <span className="font-semibold text-[#004b87]">ACT Charitable Trust</span>
                </div>
              </div>
            )}

            {/* Main Content Layout - 12 Column Wider Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
              {/* Story Article Column (8 cols) */}
              <div className="lg:col-span-8">
                <div className="prose prose-lg sm:prose-xl max-w-none text-[#23423b]">
                  {renderFormattedContent(blog.content || '')}
                </div>

                {/* Additional Attached Gallery Images (Interactive Preview) */}
                {Array.isArray(blog.images) && blog.images.length > 0 && (
                  <div className="mt-14 pt-10 border-t border-[#e2e8f0]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                      <div>
                        <h4 className="display-font text-2xl sm:text-3xl font-bold text-[#003b73] flex items-center gap-2.5">
                          <Sparkles className="w-6 h-6 text-[#f59e0b]" />
                          <span>Moments From This Initiative</span>
                        </h4>
                        <p className="mt-1 text-sm text-[#58706a]">
                          Click any photo to open full-screen interactive preview with Next & Previous controls.
                        </p>
                      </div>
                      <span className="self-start sm:self-auto rounded-full bg-[#004b87]/10 px-3.5 py-1 text-xs font-bold text-[#004b87]">
                        {blog.images.length} Photos
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                      {blog.images.map((img, i) => {
                        const globalIndex = allImages.indexOf(img);
                        const targetIndex = globalIndex !== -1 ? globalIndex : (i + 1);

                        return (
                          <div 
                            key={i} 
                            onClick={() => setPreviewIndex(targetIndex)}
                            className="group relative h-64 sm:h-72 overflow-hidden rounded-2xl border border-[#e2e8f0] shadow-md hover:shadow-2xl transition duration-300 cursor-pointer bg-[#f1f5f9]"
                          >
                            <SafeImage
                              src={img}
                              alt={`Moment ${i + 1}`}
                              fallbackSrc="/uploads/act_official_logo.jpg"
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />

                            {/* Hover overlay with zoom icon */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-between p-4">
                              <div className="self-end rounded-full bg-white/20 backdrop-blur-md p-2 text-white shadow">
                                <Maximize2 className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-bold text-white uppercase tracking-wider block">Photo {i + 1}</span>
                                <span className="text-sm font-semibold text-[#f2ad3b]">Click to view full screen</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Card: Sponsor A Child */}
                <div className="mt-14 rounded-3xl bg-gradient-to-br from-[#003b73] via-[#004b87] to-[#0d5ca8] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 h-52 w-52 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold tracking-wider text-amber-300 uppercase mb-3">
                        <Heart className="w-3.5 h-3.5 fill-amber-300" />
                        Make Real Impact
                      </span>
                      <h3 className="display-font text-2xl sm:text-4xl font-bold leading-tight">
                        Help Write The Next Success Story
                      </h3>
                      <p className="mt-2 text-base sm:text-lg text-white/90 max-w-lg leading-relaxed">
                        Your small monthly or one-time donation provides books, wholesome meals, and loving protection to children like Aarav.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsDonateOpen(true)}
                      className="shrink-0 flex items-center justify-center gap-2 rounded-full bg-[#d81b60] px-8 py-4 font-bold text-white shadow-xl hover:bg-[#c2185b] transition transform hover:-translate-y-0.5 text-base w-full sm:w-auto active:scale-98"
                    >
                      <Heart className="w-5 h-5 fill-white" />
                      <span>Donate & Support</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Column (4 cols) */}
              <aside className="lg:col-span-4 space-y-8">
                {/* Official Trust Identity Card */}
                <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 sm:p-7 shadow-lg">
                  <div className="flex items-center gap-3 border-b border-[#f1f5f9] pb-4">
                    <SafeImage
                      src="/uploads/act_official_logo.jpg"
                      alt="ACT Trust"
                      className="h-12 w-12 rounded-full object-contain border border-[#e2e8f0] p-0.5"
                    />
                    <div>
                      <h4 className="font-bold text-[#003b73] text-base leading-tight">ACT Charitable Trust</h4>
                      <span className="text-xs font-bold text-[#1b8744]">REG. NO. 220</span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-[#58706a] leading-relaxed">
                    Dedicated to grassroots child welfare, quality elementary education, balanced child nutrition, and emergency family assistance.
                  </p>

                  <div className="mt-6 space-y-3 text-xs sm:text-sm text-[#23423b]">
                    <div className="flex items-center justify-between py-1.5 border-b border-[#f8fafc]">
                      <span className="text-[#718096]">Trust Slogan:</span>
                      <span className="font-bold text-[#d81b60]">Rising Hope for Children</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-[#f8fafc]">
                      <span className="text-[#718096]">Tax Exemption:</span>
                      <span className="font-bold text-[#1b8744]">80G Certified</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-[#718096]">Transparency:</span>
                      <span className="font-bold text-[#004b87]">100% Direct Allocation</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsDonateOpen(true)}
                    className="mt-6 w-full rounded-full bg-[#1b8744] py-3.5 text-center text-sm font-bold text-white shadow-md hover:bg-[#156f37] transition flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Support Our Mission</span>
                  </button>
                </div>

                {/* Related Stories */}
                {related.length > 0 && (
                  <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-lg">
                    <h4 className="display-font text-xl font-bold text-[#003b73] mb-5 flex items-center gap-2.5">
                      <BookOpen className="w-5 h-5 text-[#f59e0b]" />
                      <span>More Stories of Hope</span>
                    </h4>

                    <div className="space-y-4">
                      {related.map((rel) => (
                        <a
                          key={rel.id}
                          href={`/blog/${rel.slug || rel.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            window.history.pushState({}, '', `/blog/${rel.slug || rel.id}`);
                            window.dispatchEvent(new PopStateEvent('popstate'));
                          }}
                          className="group flex items-start gap-3.5 rounded-2xl p-2.5 hover:bg-[#f0f7ff] transition"
                        >
                          <SafeImage
                            src={rel.coverImage || rel.thumbnail}
                            alt={rel.title}
                            fallbackSrc="/uploads/act_official_logo.jpg"
                            loading="lazy"
                            decoding="async"
                            className="h-20 w-20 rounded-xl object-cover shrink-0 border border-[#e2e8f0] shadow-sm group-hover:scale-105 transition"
                          />
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d81b60]">
                              {rel.category}
                            </span>
                            <h5 className="text-sm font-bold leading-snug text-[#183a35] group-hover:text-[#004b87] transition line-clamp-2 mt-0.5">
                              {rel.title}
                            </h5>
                            <span className="text-xs text-[#718096] mt-1.5 block">
                              {rel.date}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </article>
        )}
      </main>

      {/* FULL-SCREEN IMAGE PREVIEW LIGHTBOX WITH PREV / NEXT */}
      {previewIndex !== null && allImages[previewIndex] && (
        <div 
          className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none animate-in fade-in duration-200"
          onClick={() => setPreviewIndex(null)}
        >
          {/* Top Control Bar */}
          <div 
            className="flex items-center justify-between w-full max-w-6xl mx-auto py-2 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/20 px-4 py-1 text-xs sm:text-sm font-bold text-white tracking-wider">
                Photo {previewIndex + 1} of {allImages.length}
              </span>
              <span className="text-xs sm:text-sm text-white/70 hidden md:inline truncate max-w-md">
                {blog?.title}
              </span>
            </div>

            <button
              onClick={() => setPreviewIndex(null)}
              className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/20 hover:bg-rose-600 text-white transition shadow-lg"
              title="Close Preview (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Center Image View with Left/Right Arrows */}
          <div 
            className="relative flex items-center justify-center flex-1 my-2 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Button */}
            {allImages.length > 1 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-2 sm:left-6 z-20 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-black/60 hover:bg-[#004b87] text-white transition border border-white/20 shadow-2xl backdrop-blur-sm group active:scale-95"
                title="Previous Image (Left Arrow)"
              >
                <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8 group-hover:-translate-x-0.5 transition" />
              </button>
            )}

            {/* Central High-Res Photo */}
            <div className="relative max-w-[92vw] max-h-[72vh] flex items-center justify-center">
              <SafeImage
                key={allImages[previewIndex]}
                src={allImages[previewIndex]}
                alt={`Preview photo ${previewIndex + 1}`}
                fallbackSrc="/uploads/act_official_logo.jpg"
                className="max-h-[72vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl transition duration-300"
              />
            </div>

            {/* Next Button */}
            {allImages.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-2 sm:right-6 z-20 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-black/60 hover:bg-[#004b87] text-white transition border border-white/20 shadow-2xl backdrop-blur-sm group active:scale-95"
                title="Next Image (Right Arrow)"
              >
                <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 group-hover:translate-x-0.5 transition" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Navigation Strip */}
          {allImages.length > 1 && (
            <div 
              className="w-full max-w-4xl mx-auto py-2 flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto px-4 pb-2"
              onClick={(e) => e.stopPropagation()}
            >
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setPreviewIndex(idx)}
                  className={`relative shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-xl overflow-hidden border-2 transition ${
                    previewIndex === idx 
                      ? 'border-[#f2ad3b] ring-2 ring-[#f2ad3b]/50 scale-105' 
                      : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <SafeImage
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fallbackSrc="/uploads/act_official_logo.jpg"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Footer />
      <DonateModal />
    </div>
  );
};

export default BlogDetailPage;
