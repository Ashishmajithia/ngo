import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { BlogPost } from '../types/blog';

interface BlogDetailPageProps {
  slugOrId: string;
}

function getCachedStory(slugOrId: string): { blog: BlogPost | null; related: any[] } {
  try {
    // 1. Check sessionStorage for fully loaded story
    if (typeof sessionStorage !== 'undefined') {
      const cached = sessionStorage.getItem('act_story_' + slugOrId);
      if (cached) {
        const json = JSON.parse(cached);
        if (json && json.blog) {
          return { blog: json.blog, related: json.related || [] };
        }
      }
    }
  } catch {}
  return { blog: null, related: [] };
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ slugOrId }) => {
  const { content, isDonateOpen, setIsDonateOpen } = useContent();
  const initialCache = getCachedStory(slugOrId);
  const [blog, setBlog] = useState<BlogPost | null>(initialCache.blog);
  const [related, setRelated] = useState<any[]>(initialCache.related);
  const [loading, setLoading] = useState(() => !initialCache.blog || !initialCache.blog.content);
  const [copied, setCopied] = useState(false);

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

  // Estimate reading time
  const readingTime = blog?.content 
    ? Math.max(2, Math.ceil(blog.content.split(/\s+/).length / 180)) 
    : 3;

  // Format markdown-like content into structured HTML blocks
  const renderFormattedContent = (rawText: string) => {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraphs: string[] = [];

    const flushParagraph = (key: string) => {
      if (currentParagraphs.length > 0) {
        const text = currentParagraphs.join(' ');
        elements.push(
          <p key={key} className="text-base sm:text-lg leading-relaxed text-[#23423b] mb-6 font-normal">
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
            <p className="display-font text-lg sm:text-xl italic font-semibold text-[#003b73] leading-snug">
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
            <span className="text-base sm:text-lg text-[#23423b] leading-relaxed">
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
      <div className="border-b border-[#e2e8f0] bg-gradient-to-r from-[#f0f7ff] via-[#f8fafc] to-[#fff7ed] px-5 py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
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

          <div className="inline-flex items-center gap-2 rounded-full border border-[#1b8744]/30 bg-[#1b8744]/10 px-3 py-1 font-bold text-[#1b8744] text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Govt. Regd: REG.NO.220 • Official Trust Initiative</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 sm:px-5 py-8 sm:py-14">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#004b87] border-t-transparent"></div>
            <p className="mt-4 text-base font-bold text-[#58706a]">Loading inspiring story...</p>
          </div>
        ) : !blog ? (
          <div className="py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-[#d81b60]">
              <Bookmark className="w-10 h-10" />
            </div>
            <h2 className="display-font mt-6 text-2xl sm:text-3xl font-bold text-[#183a35]">Story Not Found</h2>
            <p className="mt-2 text-sm text-[#58706a]">The impact story you are looking for may have been archived.</p>
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
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="rounded-full bg-[#004b87] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm">
                  {blog.category || 'Child Welfare'}
                </span>
                <span className="rounded-full bg-[#d81b60]/10 border border-[#d81b60]/30 px-3 py-1 text-xs font-bold text-[#d81b60]">
                  Rising Hope for Children
                </span>
              </div>

              <h1 className="display-font text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-[#003b73] tracking-tight">
                {blog.title}
              </h1>

              {/* Story Excerpt / Subheading */}
              {blog.excerpt && (
                <p className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl font-medium leading-relaxed text-[#4a635d] border-l-2 border-[#f59e0b] pl-3.5 sm:pl-4">
                  {blog.excerpt}
                </p>
              )}

              {/* Meta & Social Share Toolbar */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-[#e2e8f0] py-4 text-xs sm:text-sm text-[#58706a]">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004b87]/10 text-[#004b87] font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-[#183a35] leading-none">{blog.author || 'ACT Trust Team'}</span>
                      <span className="text-[11px] text-[#718096]">Field Contributor</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-[#1b8744]" />
                    <span>{blog.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-[#f59e0b]" />
                    <span>{readingTime} min read</span>
                  </div>
                </div>

                {/* Share Icons */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#718096] mr-1 hidden sm:inline">
                    Share:
                  </span>
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25d366]/15 text-[#128c7e] hover:bg-[#25d366]/30 transition"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleShareTwitter}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1da1f2]/15 text-[#1da1f2] hover:bg-[#1da1f2]/30 transition"
                    title="Share on X / Twitter"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 rounded-full border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-bold text-[#183a35] hover:bg-[#f8fafc] transition shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#1b8744]" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {blog.coverImage && (
              <div className="mb-12 overflow-hidden rounded-3xl border border-[#e2e8f0] shadow-xl">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="h-[220px] xs:h-[300px] sm:h-[460px] md:h-[520px] w-full object-cover"
                />
                <div className="bg-[#f8fafc] px-4 sm:px-6 py-2.5 sm:py-3 text-xs text-[#718096] italic border-t border-[#e2e8f0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
                  <span>Photo from ACT Charitable Trust field initiatives across rural & community centers.</span>
                  <span className="font-semibold text-[#004b87]">ACT Charitable Trust</span>
                </div>
              </div>
            )}

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Story Article Column */}
              <div className="lg:col-span-8">
                <div className="prose prose-lg max-w-none text-[#23423b]">
                  {renderFormattedContent(blog.content || '')}
                </div>

                {/* Additional Attached Gallery Images */}
                {Array.isArray(blog.images) && blog.images.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-[#e2e8f0]">
                    <h4 className="display-font text-xl font-bold text-[#003b73] mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#f59e0b]" />
                      <span>Moments From This Initiative</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {blog.images.map((img, i) => (
                        <div key={i} className="overflow-hidden rounded-2xl border border-[#e2e8f0] shadow-md group">
                          <img
                            src={img}
                            alt={`Photo ${i + 1}`}
                            className="h-56 w-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Card: Sponsor A Child */}
                <div className="mt-10 sm:mt-12 rounded-3xl bg-gradient-to-br from-[#003b73] via-[#004b87] to-[#0d5ca8] p-5 sm:p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wider text-amber-300 uppercase mb-3">
                        <Heart className="w-3.5 h-3.5 fill-amber-300" />
                        Make Real Impact
                      </span>
                      <h3 className="display-font text-2xl sm:text-3xl font-bold leading-tight">
                        Help Write The Next Success Story
                      </h3>
                      <p className="mt-2 text-sm sm:text-base text-white/85 max-w-md leading-relaxed">
                        Your small monthly or one-time donation provides books, wholesome meals, and loving protection to children like Aarav.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsDonateOpen(true)}
                      className="shrink-0 flex items-center justify-center gap-2 rounded-full bg-[#d81b60] px-7 sm:px-8 py-3.5 sm:py-4 font-bold text-white shadow-xl hover:bg-[#c2185b] transition transform hover:-translate-y-0.5 text-sm sm:text-base w-full sm:w-auto active:scale-98"
                    >
                      <Heart className="w-5 h-5 fill-white" />
                      <span>Donate & Support</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Column */}
              <aside className="lg:col-span-4 space-y-8">
                {/* Official Trust Card */}
                <div className="rounded-3xl border border-[#e2e8f0] bg-white p-5 sm:p-6 shadow-md">
                  <div className="flex items-center gap-3 pb-4 border-b border-[#f1f5f9]">
                    <img
                      src={content.brand.logo || '/uploads/act_official_logo.jpg'}
                      alt="ACT Logo"
                      className="h-16 w-16 rounded-2xl object-contain border border-[#e2e8f0] p-1 shadow-sm"
                    />
                    <div>
                      <h4 className="font-bold text-[#003b73] text-base leading-tight">
                        ACT Charitable Trust
                      </h4>
                      <span className="inline-block mt-1 text-[11px] font-extrabold uppercase tracking-wider text-[#1b8744] bg-[#1b8744]/10 px-2 py-0.5 rounded">
                        REG.NO.220
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-xs sm:text-sm text-[#58706a] leading-relaxed">
                    Dedicated to grassroots child welfare, quality elementary education, balanced child nutrition, and emergency family assistance.
                  </p>

                  <div className="mt-6 space-y-2.5 text-xs text-[#23423b]">
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
                    className="mt-6 w-full rounded-full bg-[#1b8744] py-3 text-center text-xs font-bold text-white shadow-md hover:bg-[#156f37] transition flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Support Our Mission</span>
                  </button>
                </div>

                {/* Related Stories */}
                {related.length > 0 && (
                  <div className="rounded-3xl border border-[#e2e8f0] bg-white p-5 sm:p-6 shadow-md">
                    <h4 className="display-font text-lg font-bold text-[#003b73] mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#f59e0b]" />
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
                          className="group flex items-start gap-3 rounded-xl p-2 hover:bg-[#f0f7ff] transition"
                        >
                          <img
                            src={rel.coverImage}
                            alt={rel.title}
                            className="h-16 w-16 rounded-xl object-cover shrink-0 border border-[#e2e8f0]"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#d81b60]">
                              {rel.category}
                            </span>
                            <h5 className="text-xs font-bold leading-snug text-[#183a35] group-hover:text-[#004b87] transition line-clamp-2 mt-0.5">
                              {rel.title}
                            </h5>
                            <span className="text-[10px] text-[#718096] mt-1 block">
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

      <Footer />
      <DonateModal />
    </div>
  );
};

export default BlogDetailPage;
