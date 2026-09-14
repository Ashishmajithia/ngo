'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Sliders,
  Heart,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Save,
  Globe,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Info,
  Target,
  BarChart3,
} from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { defaultBlogs } from '@/data/initialBlogs';
import { defaultContent } from '@/data/initialContent';
import { SiteContent } from '@/types/content';
import { ImageUploadInput } from '@/components/ImageUploadInput';

interface DonationItem {
  id: string;
  amount: string;
  frequency: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'blogs' | 'banners' | 'metrics' | 'about' | 'programs' | 'content' | 'donations'>('blogs');

  // Data states
  const [blogs, setBlogs] = useState<BlogPost[]>(defaultBlogs);
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [donations, setDonations] = useState<DonationItem[]>([]);

  const LOCAL_BLOGS_KEY = 'act_charitable_trust_blogs_v1';

  // Blog Form State
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);

  // Status Toast
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Ensure admin user session is initialized
    try {
      const savedUser = localStorage.getItem('act_admin_user');
      if (!savedUser) {
        localStorage.setItem(
          'act_admin_user',
          JSON.stringify({ name: 'Trust Administrator', email: 'admin@act.org' })
        );
      }
    } catch {
      console.warn('LocalStorage access warning');
    }

    // Load local cached blogs if any
    try {
      const savedBlogs = localStorage.getItem(LOCAL_BLOGS_KEY);
      if (savedBlogs) {
        const parsed = JSON.parse(savedBlogs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBlogs(parsed);
        }
      }
    } catch {}

    fetchData();
    setLoading(false);
  }, []);

  const fetchData = async () => {
    try {
      const [blogsRes, contentRes, donRes] = await Promise.all([
        fetch('/api/blogs'),
        fetch('/api/content'),
        fetch('/api/donations'),
      ]);

      if (blogsRes.ok) {
        const bJson = await blogsRes.json();
        if (bJson.blogs && Array.isArray(bJson.blogs) && bJson.blogs.length > 0) {
          setBlogs(bJson.blogs);
          try {
            localStorage.setItem(LOCAL_BLOGS_KEY, JSON.stringify(bJson.blogs));
          } catch {}
        }
      } else {
        // Fallback to localStorage if API has any issues
        try {
          const saved = localStorage.getItem(LOCAL_BLOGS_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) setBlogs(parsed);
          }
        } catch {}
      }
      if (contentRes.ok) {
        const cJson = await contentRes.json();
        if (cJson.data) setContent(cJson.data);
      }
      if (donRes.ok) {
        const dJson = await donRes.json();
        if (dJson.donations && Array.isArray(dJson.donations)) setDonations(dJson.donations);
      }
    } catch {
      console.warn('Dashboard fetch error');
    }
  };

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('act_admin_user');
    } catch {
      // ignore
    }
    router.push('/admin/login');
  };

  // Blog Handlers
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog?.title) return;

    const isEdit = !!editingBlog.id;
    const blogToSave: BlogPost = {
      ...editingBlog,
      id: editingBlog.id || 'blog-' + Date.now(),
      title: editingBlog.title,
      slug: editingBlog.slug || editingBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      excerpt: editingBlog.excerpt || '',
      content: editingBlog.content || '',
      coverImage: editingBlog.coverImage || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop',
      images: Array.isArray(editingBlog.images) && editingBlog.images.length > 0
        ? editingBlog.images
        : [editingBlog.coverImage || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop'],
      author: editingBlog.author || 'ACT Trust Team',
      date: editingBlog.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      category: editingBlog.category || 'Education',
      published: editingBlog.published !== undefined ? editingBlog.published : true,
    } as BlogPost;

    // Update state immediately & cache in localStorage
    setBlogs((prev) => {
      let updated: BlogPost[];
      if (isEdit) {
        updated = prev.map((b) => (b.id === blogToSave.id ? blogToSave : b));
      } else {
        updated = [blogToSave, ...prev];
      }
      try {
        localStorage.setItem(LOCAL_BLOGS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setIsBlogModalOpen(false);
    setEditingBlog(null);
    showToastMsg(isEdit ? 'Impact Story updated!' : 'New Impact Story published live!');

    // Background sync to API
    try {
      const url = '/api/blogs';
      const method = isEdit ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogToSave),
      });
    } catch (err) {
      console.warn('API sync warning:', err);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    setBlogs((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem(LOCAL_BLOGS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToastMsg('Story deleted successfully.');
    try {
      await fetch(`/api/blogs?id=${id}`, { method: 'DELETE' });
    } catch {
      console.warn('API delete warning');
    }
  };

  // Content Handlers
  const handleSaveContent = async () => {
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (res.ok) {
        showToastMsg('Site content saved to database!');
      }
    } catch {
      showToastMsg('Failed to save content.');
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#123f38] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#f2ad3b] mb-4" />
        <p className="font-bold text-sm">Loading Control Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f4e9] text-[#183a35] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-[#123f38] text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#28745e] text-[#f2ad3b] shadow-inner overflow-hidden">
            {content.brand.logo ? (
              <img src={content.brand.logo} alt="Logo" className="w-full h-full object-contain p-1" />
            ) : (
              <LayoutDashboard className="w-6 h-6" />
            )}
          </div>
          <div>
            <h1 className="display-font text-xl font-bold leading-tight">{content.brand.name} Admin Console</h1>
            <p className="text-xs text-[#f8f4e9]/80">Full Site & Blog Content Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs font-bold hover:bg-white/10 transition"
          >
            <Globe className="w-4 h-4 text-[#f2ad3b]" />
            <span>Open Website</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <aside className="md:col-span-1 bg-[#fffdf8] rounded-3xl p-5 border border-[#d9e1d7] shadow-sm h-fit space-y-2">
          <div className="flex items-center gap-2 pb-3 mb-2 border-b border-[#dce7dc]">
            <ShieldCheck className="w-4 h-4 text-[#28745e]" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#123f38]">Control Menu</p>
          </div>
          {[
            { id: 'blogs' as const, label: 'Impact Stories (Blogs)', icon: FileText, count: blogs.length },
            { id: 'banners' as const, label: 'Hero Banners', icon: ImageIcon, count: content.hero.slides.length },
            { id: 'metrics' as const, label: 'Impact Numbers & Metrics', icon: BarChart3, count: content.impactStats.length },
            { id: 'about' as const, label: 'About Us Section', icon: Info },
            { id: 'programs' as const, label: 'Strategic Initiatives', icon: Target, count: content.programs.items.length },
            { id: 'content' as const, label: 'Site Contact & Details', icon: Sliders },
            { id: 'donations' as const, label: 'Donation Records', icon: Heart, count: donations.length },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold transition ${
                  activeTab === item.id
                    ? 'bg-[#123f38] text-white shadow-md'
                    : 'text-[#58706a] hover:bg-[#f8f4e9] hover:text-[#183a35]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${activeTab === item.id ? 'text-[#f2ad3b]' : 'text-[#28745e]'}`} />
                  <span>{item.label}</span>
                </span>
                {item.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === item.id ? 'bg-[#28745e] text-white' : 'bg-[#e8f0e8] text-[#123f38]'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Dynamic Main Panel */}
        <main className="md:col-span-3 bg-[#fffdf8] rounded-3xl p-6 sm:p-8 border border-[#d9e1d7] shadow-sm">
          {/* TAB 1: BLOGS / MOMENTS OF HOPE */}
          {activeTab === 'blogs' && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#d9e1d7]">
                <div>
                  <h2 className="display-font text-2xl font-bold text-[#183a35]">Moments Of Hope Stories</h2>
                  <p className="text-xs text-[#58706a]">Manage &apos;Witness Our Impact In Action&apos; blogs displayed on website</p>
                </div>
                <button
                  onClick={() => {
                    setEditingBlog({
                      title: '',
                      excerpt: '',
                      content: '',
                      category: 'Education',
                      coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop',
                      author: 'Trust Team',
                    });
                    setIsBlogModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-full bg-[#28745e] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#123f38] transition"
                >
                  <Plus className="w-4 h-4 text-[#f2ad3b]" />
                  <span>+ Create New Story</span>
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {blogs.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#f8f4e9]/70 border border-[#dce7dc] gap-4 hover:border-[#28745e] transition"
                  >
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.coverImage}
                        alt={b.title}
                        className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-black/10"
                      />
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#123f38] text-[10px] font-bold text-[#f2ad3b] mb-1">
                          {b.category}
                        </span>
                        <h4 className="font-bold text-sm text-[#183a35] leading-snug">{b.title}</h4>
                        <p className="text-xs text-[#58706a] mt-0.5 line-clamp-1">{b.excerpt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => {
                          setEditingBlog(b);
                          setIsBlogModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl border border-[#28745e] text-[#28745e] hover:bg-[#28745e] hover:text-white transition"
                        title="Edit Story"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(b.id)}
                        className="p-2.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-600 hover:text-white transition"
                        title="Delete Story"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: HERO BANNERS */}
          {activeTab === 'banners' && (
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#d9e1d7]">
                <div>
                  <h2 className="display-font text-2xl font-bold text-[#183a35]">Hero Banner Carousel</h2>
                  <p className="text-xs text-[#58706a]">Update main homepage background slide images and copy</p>
                </div>
                <button
                  onClick={handleSaveContent}
                  className="flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#28745e] transition"
                >
                  <Save className="w-4 h-4 text-[#f2ad3b]" />
                  <span>Save Banners</span>
                </button>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-[#e8f0e8] border border-[#28745e]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <p className="text-xs font-bold text-[#123f38] flex items-center gap-1.5">
                    <span className="text-[#f2ad3b] text-base">📐</span>
                    <span>Recommended Banner Image Size & Proportions</span>
                  </p>
                  <p className="text-[11px] text-[#58706a] mt-0.5">
                    Best Resolution: <strong className="text-[#123f38]">Width: 1920 px × Height: 850 px</strong> (Landscape 16:9 ratio). Subject looks best centered or on the right side.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold bg-[#123f38] text-[#f2ad3b] px-3.5 py-1.5 rounded-full shrink-0 shadow-sm">
                  <span>1920 × 850 PX (16:9)</span>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {content.hero.slides.map((slide, idx) => (
                  <div key={slide.id || idx} className="p-5 rounded-2xl bg-[#f8f4e9]/70 border border-[#dce7dc] space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#28745e]">Hero Banner Slide #{idx + 1}</p>
                      <span className="text-[10px] font-mono bg-white border border-[#dce7dc] px-2 py-0.5 rounded text-[#58706a]">
                        Size: 1920 × 850 px
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Heading Title</label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => {
                            const updated = [...content.hero.slides];
                            updated[idx].title = e.target.value;
                            setContent({ ...content, hero: { ...content.hero, slides: updated } });
                          }}
                          className="w-full rounded-xl border p-2.5 text-xs bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Eyebrow Badge</label>
                        <input
                          type="text"
                          value={slide.eyebrow}
                          onChange={(e) => {
                            const updated = [...content.hero.slides];
                            updated[idx].eyebrow = e.target.value;
                            setContent({ ...content, hero: { ...content.hero, slides: updated } });
                          }}
                          className="w-full rounded-xl border p-2.5 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <ImageUploadInput
                        label="Hero Slide Background Image (Recommended: 1920 × 850 px)"
                        value={slide.image}
                        onChangeSingle={(url) => {
                          const updated = [...content.hero.slides];
                          updated[idx].image = url;
                          setContent({ ...content, hero: { ...content.hero, slides: updated } });
                        }}
                        helperText="Exact Recommended Dimensions: 1920px width × 850px height (PNG, JPG, WEBP)."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: IMPACT NUMBERS & METRICS */}
          {activeTab === 'metrics' && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#d9e1d7]">
                <div>
                  <h2 className="display-font text-2xl font-bold text-[#183a35]">Impact Numbers & Metrics Counter</h2>
                  <p className="text-xs text-[#58706a]">Customize the prominent green statistics strip displayed directly beneath the hero banner</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newStat = {
                        id: 'stat-' + Date.now(),
                        stat: '1,000+',
                        label: 'New Impact Achievement',
                        iconName: 'Award',
                      };
                      setContent({ ...content, impactStats: [...content.impactStats, newStat] });
                    }}
                    className="flex items-center gap-1.5 rounded-full border border-[#28745e] px-4 py-2 text-xs font-bold text-[#28745e] hover:bg-[#28745e] hover:text-white transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Metric</span>
                  </button>
                  <button
                    onClick={handleSaveContent}
                    className="flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#28745e] transition"
                  >
                    <Save className="w-4 h-4 text-[#f2ad3b]" />
                    <span>Save Metrics</span>
                  </button>
                </div>
              </div>

              {/* Live Preview Strip */}
              <div className="mt-6 p-5 rounded-2xl bg-[#28745e] text-white shadow-md">
                <p className="text-[11px] font-bold text-[#f2ad3b] uppercase tracking-wider mb-3">
                  Live Homepage Preview:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-x divide-white/20">
                  {content.impactStats.map((item, idx) => (
                    <div key={item.id || idx} className="px-2">
                      <p className="display-font text-2xl sm:text-3xl font-bold text-[#fffdf8]">{item.stat}</p>
                      <p className="text-xs text-[#f8f4e9]/90 mt-1 line-clamp-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editable Cards Grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.impactStats.map((item, idx) => (
                  <div key={item.id || idx} className="p-5 rounded-2xl bg-[#f8f4e9]/70 border border-[#dce7dc] space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#123f38] text-[10px] font-bold text-[#f2ad3b]">
                        Metric #{idx + 1}
                      </span>
                      {content.impactStats.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = content.impactStats.filter((_, i) => i !== idx);
                            setContent({ ...content, impactStats: updated });
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove Metric"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Counter Number / Stat Value *</label>
                      <input
                        type="text"
                        value={item.stat}
                        onChange={(e) => {
                          const updated = [...content.impactStats];
                          updated[idx].stat = e.target.value;
                          setContent({ ...content, impactStats: updated });
                        }}
                        className="w-full rounded-xl border p-2.5 text-sm bg-white font-bold"
                        placeholder="e.g. 50,000+ or 98%"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Metric Description Label *</label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const updated = [...content.impactStats];
                          updated[idx].label = e.target.value;
                          setContent({ ...content, impactStats: updated });
                        }}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white"
                        placeholder="e.g. Lives Positively Impacted"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Icon Style</label>
                      <select
                        value={item.iconName || 'Users'}
                        onChange={(e) => {
                          const updated = [...content.impactStats];
                          updated[idx].iconName = e.target.value;
                          setContent({ ...content, impactStats: updated });
                        }}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white font-medium"
                      >
                        <option value="Users">Users / Community</option>
                        <option value="Home">Home / Empowerment Centers</option>
                        <option value="GraduationCap">Graduation Cap / Education</option>
                        <option value="CheckCircle2">Checkmark / Transparency Rate</option>
                        <option value="HeartHandshake">Heart Handshake / Care</option>
                        <option value="Award">Award / Recognition</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ABOUT US SECTION */}
          {activeTab === 'about' && (
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#d9e1d7]">
                <div>
                  <h2 className="display-font text-2xl font-bold text-[#183a35]">About Us Section Editor</h2>
                  <p className="text-xs text-[#58706a]">Customize mission story, transparency badge, and section photo</p>
                </div>
                <button
                  onClick={handleSaveContent}
                  className="flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#28745e] transition"
                >
                  <Save className="w-4 h-4 text-[#f2ad3b]" />
                  <span>Save About Section</span>
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Eyebrow Title</label>
                    <input
                      type="text"
                      value={content.about.eyebrow}
                      onChange={(e) => setContent({ ...content, about: { ...content.about, eyebrow: e.target.value } })}
                      className="w-full rounded-xl border p-2.5 text-xs bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Badge Title (e.g. 100% Transparent)</label>
                    <input
                      type="text"
                      value={content.about.badgeTitle}
                      onChange={(e) => setContent({ ...content, about: { ...content.about, badgeTitle: e.target.value } })}
                      className="w-full rounded-xl border p-2.5 text-xs bg-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Main Section Heading</label>
                  <input
                    type="text"
                    value={content.about.title}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, title: e.target.value } })}
                    className="w-full rounded-xl border p-2.5 text-sm bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Primary Story Paragraph</label>
                  <textarea
                    rows={3}
                    value={content.about.copyOne}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, copyOne: e.target.value } })}
                    className="w-full rounded-xl border p-2.5 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Secondary Story Paragraph</label>
                  <textarea
                    rows={3}
                    value={content.about.copyTwo}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, copyTwo: e.target.value } })}
                    className="w-full rounded-xl border p-2.5 text-xs bg-white"
                  />
                </div>

                {/* About Us Image Upload */}
                <ImageUploadInput
                  label="About Us Main Showcase Photo"
                  value={content.about.image}
                  onChangeSingle={(url) => setContent({ ...content, about: { ...content.about, image: url } })}
                  helperText="Upload or change the primary featured photo for the About Us section on the homepage."
                />
              </div>
            </div>
          )}

          {/* TAB 4: STRATEGIC INITIATIVES / PROGRAMS */}
          {activeTab === 'programs' && (
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#d9e1d7]">
                <div>
                  <h2 className="display-font text-2xl font-bold text-[#183a35]">Strategic Initiatives Editor</h2>
                  <p className="text-xs text-[#58706a]">Update program titles, descriptions, and background images</p>
                </div>
                <button
                  onClick={handleSaveContent}
                  className="flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#28745e] transition"
                >
                  <Save className="w-4 h-4 text-[#f2ad3b]" />
                  <span>Save Initiatives</span>
                </button>
              </div>

              <div className="mt-6 space-y-6">
                {content.programs.items.map((prog, idx) => (
                  <div key={prog.id || idx} className="p-5 rounded-2xl bg-[#f8f4e9]/70 border border-[#dce7dc] space-y-4">
                    <p className="text-xs font-bold text-[#28745e]">Program Card #{idx + 1}</p>
                    
                    <div>
                      <label className="block text-xs font-bold mb-1">Program Title</label>
                      <input
                        type="text"
                        value={prog.title}
                        onChange={(e) => {
                          const updated = [...content.programs.items];
                          updated[idx].title = e.target.value;
                          setContent({ ...content, programs: { ...content.programs, items: updated } });
                        }}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Program Description</label>
                      <textarea
                        rows={2}
                        value={prog.description}
                        onChange={(e) => {
                          const updated = [...content.programs.items];
                          updated[idx].description = e.target.value;
                          setContent({ ...content, programs: { ...content.programs, items: updated } });
                        }}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white"
                      />
                    </div>

                    {/* Program Image Upload */}
                    <ImageUploadInput
                      label="Program Card Background Photo"
                      value={prog.image}
                      onChangeSingle={(url) => {
                        const updated = [...content.programs.items];
                        updated[idx].image = url;
                        setContent({ ...content, programs: { ...content.programs, items: updated } });
                      }}
                      helperText="Select or upload a high-quality photo representing this program initiative."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SITE CONTENT */}
          {activeTab === 'content' && (
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#d9e1d7]">
                <div>
                  <h2 className="display-font text-2xl font-bold text-[#183a35]">Site Contact & Brand Details</h2>
                  <p className="text-xs text-[#58706a]">Update trust name, tagline, email, phone, and location</p>
                </div>
                <button
                  onClick={handleSaveContent}
                  className="flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#28745e] transition"
                >
                  <Save className="w-4 h-4 text-[#f2ad3b]" />
                  <span>Save Site Details</span>
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {/* Logo Upload */}
                <div className="rounded-2xl border border-[#d9e1d7] bg-[#f8f4e9]/60 p-5 space-y-4">
                  <ImageUploadInput
                    label="Organization Logo (Image / Icon)"
                    value={content.brand.logo || ''}
                    onChangeSingle={(url) => setContent({ ...content, brand: { ...content.brand, logo: url } })}
                    helperText="Upload your trust or NGO logo (PNG, JPG, SVG, WebP). It will appear across website header, footer, and admin console."
                  />

                  {content.brand.logo && (
                    <div className="pt-3 border-t border-[#d9e1d7]">
                      <label className="block text-xs font-bold text-[#183a35] mb-2">Logo Display Style in Header</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          (content.brand.logoStyle === 'full' || !content.brand.logoStyle)
                            ? 'border-[#28745e] bg-[#28745e]/10 text-[#123f38] font-bold'
                            : 'border-[#d9e1d7] bg-white text-[#58706a]'
                        }`}>
                          <input
                            type="radio"
                            name="logoStyle"
                            checked={content.brand.logoStyle === 'full' || !content.brand.logoStyle}
                            onChange={() => setContent({ ...content, brand: { ...content.brand, logoStyle: 'full' } })}
                            className="accent-[#28745e]"
                          />
                          <div>
                            <p className="text-xs font-bold">Complete Logo Image (Pura Logo)</p>
                            <p className="text-[10px] font-normal text-[#58706a]">Full logo image directly replaces text & emblem</p>
                          </div>
                        </label>

                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          content.brand.logoStyle === 'icon_text'
                            ? 'border-[#28745e] bg-[#28745e]/10 text-[#123f38] font-bold'
                            : 'border-[#d9e1d7] bg-white text-[#58706a]'
                        }`}>
                          <input
                            type="radio"
                            name="logoStyle"
                            checked={content.brand.logoStyle === 'icon_text'}
                            onChange={() => setContent({ ...content, brand: { ...content.brand, logoStyle: 'icon_text' } })}
                            className="accent-[#28745e]"
                          />
                          <div>
                            <p className="text-xs font-bold">Logo Icon + Text</p>
                            <p className="text-[10px] font-normal text-[#58706a]">Circular icon next to Org Name & Tagline text</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Organization Name</label>
                    <input
                      type="text"
                      value={content.brand.name}
                      onChange={(e) => setContent({ ...content, brand: { ...content.brand, name: e.target.value } })}
                      className="w-full rounded-xl border p-2.5 text-sm bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Tagline</label>
                    <input
                      type="text"
                      value={content.brand.tagline}
                      onChange={(e) => setContent({ ...content, brand: { ...content.brand, tagline: e.target.value } })}
                      className="w-full rounded-xl border p-2.5 text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={content.brand.email}
                      onChange={(e) => setContent({ ...content, brand: { ...content.brand, email: e.target.value } })}
                      className="w-full rounded-xl border p-2.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={content.brand.phone}
                      onChange={(e) => setContent({ ...content, brand: { ...content.brand, phone: e.target.value } })}
                      className="w-full rounded-xl border p-2.5 text-sm bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Location Address</label>
                  <input
                    type="text"
                    value={content.brand.location}
                    onChange={(e) => setContent({ ...content, brand: { ...content.brand, location: e.target.value } })}
                    className="w-full rounded-xl border p-2.5 text-sm bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DONATIONS */}
          {activeTab === 'donations' && (
            <div>
              <div className="pb-6 border-b border-[#d9e1d7]">
                <h2 className="display-font text-2xl font-bold text-[#183a35]">Donation Submissions</h2>
                <p className="text-xs text-[#58706a]">Real-time donor contributions recorded from website forms</p>
              </div>

              <div className="mt-6">
                {donations.length === 0 ? (
                  <div className="py-12 text-center text-[#58706a] text-sm font-medium">No donations recorded yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#f8f4e9] border-b border-[#dce7dc] text-[#123f38] uppercase font-bold">
                          <th className="p-3">Donor Name</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Frequency</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dce7dc]">
                        {donations.map((d, i) => {
                          const dateStr = d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Recent';
                          return (
                            <tr key={d.id || i} className="hover:bg-[#f8f4e9]/50">
                              <td className="p-3 font-bold text-[#183a35]">{d.name}</td>
                              <td className="p-3 font-bold text-[#28745e]">₹{d.amount}</td>
                              <td className="p-3 capitalize">{d.frequency}</td>
                              <td className="p-3">{d.email}</td>
                              <td className="p-3 text-[#58706a]">{dateStr}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT BLOG MODAL */}
      {isBlogModalOpen && editingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#fffdf8] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#d9e1d7] max-h-[90vh] overflow-y-auto">
            <h3 className="display-font text-2xl font-bold text-[#183a35] mb-4">
              {editingBlog.id ? 'Edit Impact Story' : 'Create New Impact Story'}
            </h3>

            <form onSubmit={handleSaveBlog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Story Title *</label>
                <input
                  type="text"
                  required
                  value={editingBlog.title || ''}
                  onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                  className="w-full rounded-xl border p-2.5 text-sm bg-white"
                  placeholder="e.g. 500 Rural Children Receive Digital Tablets"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Category</label>
                  <select
                    value={editingBlog.category || 'Education'}
                    onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value as BlogPost['category'] })}
                    className="w-full rounded-xl border p-2.5 text-sm bg-white"
                  >
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Women Empowerment">Women Empowerment</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Community Event">Community Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Author Name</label>
                  <input
                    type="text"
                    value={editingBlog.author || ''}
                    onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                    className="w-full rounded-xl border p-2.5 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <ImageUploadInput
                label="Story Cover Image *"
                value={editingBlog.coverImage || ''}
                onChangeSingle={(url) => {
                  const currentImages = editingBlog.images || [];
                  const newImages = currentImages.length === 0 ? [url] : currentImages;
                  setEditingBlog({ ...editingBlog, coverImage: url, images: newImages });
                }}
                helperText="Main header photo displayed on blog cards and post headers"
              />

              {/* Multiple Gallery Images Upload */}
              <div className="pt-2">
                <ImageUploadInput
                  label="Multiple Gallery Images (Shown in Full Story Page)"
                  multiple={true}
                  values={editingBlog.images || (editingBlog.coverImage ? [editingBlog.coverImage] : [])}
                  onChangeMultiple={(urls) => {
                    setEditingBlog({
                      ...editingBlog,
                      images: urls,
                      coverImage: editingBlog.coverImage || urls[0] || '',
                    });
                  }}
                  helperText="Upload multiple event photos, village activity pictures, or testimonial photos for this story."
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Short Excerpt (Summary)</label>
                <textarea
                  rows={2}
                  value={editingBlog.excerpt || ''}
                  onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                  className="w-full rounded-xl border p-2.5 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Full Story Content</label>
                <textarea
                  rows={6}
                  required
                  value={editingBlog.content || ''}
                  onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                  className="w-full rounded-xl border p-2.5 text-sm bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#dce7dc] text-xs font-bold text-[#58706a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#123f38] text-xs font-bold text-white hover:bg-[#28745e] transition"
                >
                  Publish Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#123f38] px-5 py-3 text-sm font-bold text-[#f2ad3b] shadow-2xl border border-[#f2ad3b]/40 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#f2ad3b]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
