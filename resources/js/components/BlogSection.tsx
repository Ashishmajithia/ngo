'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, User, ArrowRight, PlusCircle, BookOpen, ShieldCheck } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { defaultBlogs } from '@/data/initialBlogs';

interface BlogSectionProps {
  onSelectBlog?: (slugOrId: string) => void;
  onOpenCreateBlog?: () => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onSelectBlog, onOpenCreateBlog }) => {
  const [blogs, setBlogs] = useState<BlogPost[]>(defaultBlogs);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Clear any obsolete stale localStorage cache
    try {
      localStorage.removeItem('act_trust_blogs_cache');
    } catch {}

    async function fetchBlogs() {
      try {
        const res = await fetch(`/api/blogs?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.blogs)) {
            setBlogs(json.blogs);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch blogs from API:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  const dynamicCats = Array.from(new Set(blogs.map((b) => b.category).filter(Boolean)));
  const categories = ['All', ...(dynamicCats.length > 0 ? dynamicCats : ['Education', 'Healthcare', 'Women Empowerment', 'Nutrition', 'Community Event'])];

  // While loading initially, display a matching dark-blue shimmer skeleton instead of stale dummy content
  if (loading && blogs.length === 0) {
    return (
      <section id="stories" className="bg-gradient-to-b from-[#002244] via-[#003366] to-[#004080] text-white px-4 sm:px-5 py-14 sm:py-20 lg:px-8 lg:py-28 relative overflow-hidden">
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 animate-pulse">
            <div className="h-4 w-44 bg-white/20 rounded-full mx-auto mb-3"></div>
            <div className="h-8 w-80 bg-white/30 rounded-xl mx-auto mb-3"></div>
            <div className="h-4 w-96 max-w-full bg-white/15 rounded-lg mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 p-5 space-y-4 animate-pulse">
                <div className="w-full h-52 rounded-2xl bg-white/15"></div>
                <div className="h-4 w-28 bg-white/20 rounded-full"></div>
                <div className="h-6 w-3/4 bg-white/30 rounded-lg"></div>
                <div className="h-4 w-full bg-white/15 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!loading && blogs.length === 0) return null;

  const filteredBlogs = selectedCategory === 'All'
    ? blogs
    : blogs.filter((b) => b.category?.toLowerCase() === selectedCategory.toLowerCase());

  const handleCardClick = (blog: BlogPost) => {
    if (onSelectBlog) {
      onSelectBlog(blog);
    }
    window.history.pushState({}, '', `/blog/${blog.slug || blog.id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <section id="stories" className="bg-gradient-to-b from-[#002244] via-[#003366] to-[#004080] text-white px-4 sm:px-5 py-14 sm:py-20 lg:px-8 lg:py-28 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-1/4 -mt-24 h-96 w-96 rounded-full bg-[#f59e0b]/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 -mb-24 h-96 w-96 rounded-full bg-[#d81b60]/10 blur-3xl pointer-events-none"></div>

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f59e0b]/40 bg-white/10 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[.18em] text-[#fbbf24] mb-3 backdrop-blur shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#fbbf24] shrink-0" />
              <span>Stories of Transformation • Rising Hope</span>
            </div>
            <h2 className="display-font text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white">
              Witness Our Impact In Action
            </h2>
            <p className="mt-2.5 sm:mt-3 text-sm sm:text-base md:text-lg text-blue-100/85 leading-relaxed max-w-xl font-normal">
              Real children, transformed lives, and daily milestones from ACT Charitable Trust field centers (REG.NO.220).
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onOpenCreateBlog && (
              <button
                onClick={onOpenCreateBlog}
                className="focusable flex items-center justify-center gap-2 rounded-full bg-[#f59e0b] px-5 py-3 text-xs font-bold text-[#002b54] shadow-lg hover:bg-[#fbbf24] transition w-full sm:w-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Write New Story</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filters - Horizontal swipe on mobile, wrap on tablet/desktop */}
        <div className="mt-6 sm:mt-8 flex items-center gap-2 border-b border-white/15 pb-4 overflow-x-auto no-scrollbar sm:flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap shrink-0 rounded-full px-4 sm:px-5 py-2 text-xs font-bold transition shadow-sm ${
                selectedCategory === cat
                  ? 'bg-[#d81b60] text-white shadow-md shadow-[#d81b60]/30 ring-2 ring-white/30'
                  : 'bg-white/10 text-white/85 hover:bg-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="py-20 text-center text-blue-200 animate-pulse font-medium">
            Loading Stories of Hope...
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="py-20 text-center text-blue-200">
            No stories published under this category yet.
          </div>
        ) : (
          <div className="mt-8 sm:mt-10 grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => (
              <article
                key={blog.id}
                onClick={() => handleCardClick(blog)}
                className="group cursor-pointer overflow-hidden rounded-3xl bg-white text-[#183a35] shadow-xl flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 border border-white/10"
              >
                <div>
                  <div className="overflow-hidden h-48 sm:h-60 relative">
                    <img
                      src={blog.thumbnail || blog.coverImage || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop'}
                      alt={blog.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 rounded-full bg-[#003b73]/95 backdrop-blur px-3 py-1 text-[11px] font-extrabold text-white shadow-md">
                      {blog.category || 'Child Welfare'}
                    </div>
                    <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 rounded-full bg-[#1b8744]/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold text-white shadow-md flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>REG.220</span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4 text-xs text-[#64748b] mb-2.5 sm:mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#1b8744]" />
                        {blog.date}
                      </span>
                      <span className="flex items-center gap-1 truncate max-w-[140px]">
                        <User className="w-3.5 h-3.5 text-[#004b87]" />
                        <span className="truncate">{blog.author}</span>
                      </span>
                    </div>

                    <h3 className="display-font text-lg sm:text-xl font-bold leading-snug text-[#003b73] group-hover:text-[#d81b60] transition line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm leading-relaxed text-[#475569] line-clamp-3 font-normal">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0 flex items-center justify-between border-t border-[#f1f5f9] mt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#d81b60] group-hover:underline">
                    <BookOpen className="w-3.5 h-3.5" />
                    Read Full Story
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f7ff] text-[#004b87] group-hover:bg-[#d81b60] group-hover:text-white transition">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
