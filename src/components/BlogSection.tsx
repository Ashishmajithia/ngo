'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, User, ArrowRight, PlusCircle, BookOpen } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { defaultBlogs } from '@/data/initialBlogs';

interface BlogSectionProps {
  onSelectBlog: (blog: BlogPost) => void;
  onOpenCreateBlog?: () => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onSelectBlog, onOpenCreateBlog }) => {
  const [blogs, setBlogs] = useState<BlogPost[]>(defaultBlogs);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch('/api/blogs');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.blogs) && json.blogs.length > 0) {
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

  const categories = ['All', 'Education', 'Healthcare', 'Women Empowerment', 'Nutrition'];

  const filteredBlogs = selectedCategory === 'All'
    ? blogs
    : blogs.filter((b) => b.category === selectedCategory);

  return (
    <section id="gallery" className="bg-[#123f38] text-[#fffdf8] px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f2ad3b]/40 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[.16em] text-[#f2ad3b] mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Moments Of Hope • Impact Stories</span>
            </div>
            <h2 className="display-font text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#fffdf8]">
              Witness Our Impact In Action
            </h2>
            <p className="mt-3 text-base sm:text-lg text-[#f8f4e9]/80 leading-relaxed max-w-xl">
              Real stories, real faces, and vibrant moments of change captured across our centers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onOpenCreateBlog && (
              <button
                onClick={onOpenCreateBlog}
                className="focusable flex items-center gap-2 rounded-full bg-[#f2ad3b] px-5 py-3 text-xs font-bold text-[#183a35] shadow-lg hover:bg-[#f5bf63] transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add Blog Story</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-[#28745e] text-white shadow-md'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="py-16 text-center text-white/70 animate-pulse">Loading Impact Stories...</div>
        ) : filteredBlogs.length === 0 ? (
          <div className="py-16 text-center text-white/70">No stories found in this category.</div>
        ) : (
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => (
              <article
                key={blog.id}
                onClick={() => onSelectBlog(blog)}
                className="gallery-card group cursor-pointer overflow-hidden rounded-3xl bg-[#183a35] border border-white/15 shadow-xl flex flex-col justify-between hover:border-[#f2ad3b]/60 transition duration-300"
              >
                <div>
                  <div className="overflow-hidden h-56 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-4 left-4 rounded-full bg-[#123f38]/90 backdrop-blur px-3 py-1 text-[11px] font-bold text-[#f2ad3b] border border-[#f2ad3b]/30">
                      {blog.category}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4 text-[11px] text-[#f8f4e9]/70 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#28745e]" />
                        {blog.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#28745e]" />
                        {blog.author}
                      </span>
                    </div>

                    <h3 className="display-font text-xl font-bold leading-snug text-[#fffdf8] group-hover:text-[#f2ad3b] transition">
                      {blog.title}
                    </h3>
                    <p className="mt-3 text-xs leading-relaxed text-[#f8f4e9]/80 line-clamp-3">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between border-t border-white/10 mt-4">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#f2ad3b] group-hover:underline">
                    <BookOpen className="w-3.5 h-3.5" />
                    Read Full Story
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#f2ad3b] transition-transform group-hover:translate-x-1" />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
