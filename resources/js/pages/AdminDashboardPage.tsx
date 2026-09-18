'use client';

import React, { useState, useEffect } from 'react';
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
  QrCode,
  Building,
  Compass,
  Images,
  HeartHandshake,
  Database,
  Download,
  Search,
  Eye,
  ExternalLink,
  X,
} from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { defaultBlogs } from '@/data/initialBlogs';
import { defaultContent } from '@/data/initialContent';
import { SiteContent, HeroSlide, ProgramItem, PrincipleItem, GalleryItem } from '@/types/content';
import { ImageUploadInput } from '@/components/ImageUploadInput';

interface DonationItem {
  id: string;
  amount: string;
  frequency: string;
  name: string;
  email: string;
  phone?: string;
  utr?: string;
  screenshot?: string;
  paymentMethod?: string;
  status?: 'pending' | 'verified' | 'rejected' | string;
  createdAt: string;
}

const router = {
  push: (url: string) => {
    window.location.href = url;
  },
};

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'blogs' | 'banners' | 'metrics' | 'about' | 'programs' | 'approach' | 'gallery' | 'support' | 'payment' | 'content' | 'donations'
  >('blogs');

  // Database Connection State
  const [dbStatus, setDbStatus] = useState<{ configured: boolean; provider: string; message: string } | null>(null);

  // Data states
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [donationSearch, setDonationSearch] = useState('');
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Blog Form State
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);

  // Status Toast
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // Clear any residual localStorage cache
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('act_charitable_trust_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}

    // Verify admin authentication
    fetch('/api/admin/verify')
      .then(async (res) => {
        if (res.status === 401) {
          router.push('/admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.dbStatus) {
          setDbStatus(data.dbStatus);
        }
      })
      .catch(() => {});

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [blogsRes, contentRes, donRes] = await Promise.all([
        fetch(`/api/blogs?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/content?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/donations?t=${Date.now()}`, { cache: 'no-store' }),
      ]);

      if (blogsRes.ok) {
        const bJson = await blogsRes.json();
        if (bJson.blogs && Array.isArray(bJson.blogs)) {
          setBlogs(bJson.blogs);
        } else {
          setBlogs([]);
        }
        if (bJson.dbStatus) setDbStatus(bJson.dbStatus);
      } else {
        setBlogs([]);
      }

      if (contentRes.ok) {
        const cJson = await contentRes.json();
        if (cJson.data) {
          setContent(cJson.data);
        }
        if (cJson.dbStatus) setDbStatus(cJson.dbStatus);
      }

      if (donRes.ok) {
        const dJson = await donRes.json();
        if (dJson.donations && Array.isArray(dJson.donations)) {
          setDonations(dJson.donations);
        } else {
          setDonations([]);
        }
      }
    } catch (err) {
      console.warn('API fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    try {
      localStorage.removeItem('act_admin_user');
    } catch {}
    router.push('/admin/login');
  };

  const handleUpdateDonationStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/donations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setDonations((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
        );
        showToastMsg(`✓ Donation status updated to ${newStatus}`);
      } else {
        showToastMsg('Failed to update donation status');
      }
    } catch {
      showToastMsg('Error updating status');
    }
  };

  const handleExportDonationsCsv = () => {
    if (donations.length === 0) return;
    const headers = ['ID', 'Donor Name', 'Amount (INR)', 'Frequency', 'Email', 'Phone', 'Payment Method', 'UTR', 'Status', 'Date'];
    const rows = donations.map((d) => [
      `"${d.id || ''}"`,
      `"${(d.name || 'Anonymous').replace(/"/g, '""')}"`,
      `"${d.amount || ''}"`,
      `"${d.frequency || ''}"`,
      `"${d.email || ''}"`,
      `"${d.phone || ''}"`,
      `"${d.paymentMethod || ''}"`,
      `"${d.utr || ''}"`,
      `"${d.status || 'pending'}"`,
      `"${d.createdAt || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `act_donations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToastMsg('✓ Donations exported as CSV file');
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
      coverImage: editingBlog.coverImage || '',
      images: Array.isArray(editingBlog.images) ? editingBlog.images : (editingBlog.coverImage ? [editingBlog.coverImage] : []),
      author: editingBlog.author || '',
      date: editingBlog.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      category: editingBlog.category || 'Education',
      published: editingBlog.published !== undefined ? editingBlog.published : true,
    } as BlogPost;

    // Sync to API
    try {
      const url = isEdit ? `/api/blogs/${encodeURIComponent(blogToSave.id)}` : '/api/blogs';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogToSave),
      });
      if (res.ok) {
        setBlogs((prev) => {
          if (isEdit) {
            return prev.map((b) => (b.id === blogToSave.id ? blogToSave : b));
          } else {
            return [blogToSave, ...prev];
          }
        });
        setIsBlogModalOpen(false);
        setEditingBlog(null);
        showToastMsg(isEdit ? 'Impact Story updated successfully!' : 'New Impact Story published live!');
        fetchData();
      } else {
        const errorData = await res.json().catch(() => null);
        showToastMsg('Failed to save story: ' + (errorData?.message || res.statusText));
      }
    } catch (err) {
      console.error('API sync error:', err);
      showToastMsg('Network error while saving story');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        showToastMsg('Story deleted successfully.');
        fetchData();
      } else {
        const err = await res.json().catch(() => null);
        showToastMsg('Failed to delete story: ' + (err?.message || res.statusText));
      }
    } catch {
      console.error('API delete error');
      showToastMsg('Network error while deleting story');
    }
  };

  // Content Handlers
  const handleSaveContent = async (sectionName?: string) => {
    const secLabel = sectionName || 'Content';
    setSavingSection(secLabel);
    const timestamp = new Date().toISOString();
    const updatedContent: SiteContent = {
      ...content,
      updatedAt: timestamp,
    };
    setContent(updatedContent);

    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedContent),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setContent(json.data);
        }
        showToastMsg(`${secLabel} saved to database!`);
      } else {
        showToastMsg(`Failed to save ${secLabel}`);
      }
    } catch (err) {
      console.error('API save error:', err);
      showToastMsg(`Failed to save ${secLabel}`);
    } finally {
      setTimeout(() => setSavingSection(null), 500);
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

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs">
            <Database className="w-3.5 h-3.5 text-[#f2ad3b]" />
            <span className="font-medium text-white/90">
              {dbStatus?.provider === 'supabase'
                ? 'Supabase PostgreSQL: Connected'
                : 'Database: Dual-Sync Active'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                dbStatus?.provider === 'supabase' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </div>

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
        <aside className="md:col-span-1 bg-[#fffdf8] rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-[#d9e1d7] shadow-sm h-fit">
          <div className="flex items-center gap-2 pb-2 sm:pb-3 mb-2 border-b border-[#dce7dc]">
            <ShieldCheck className="w-4 h-4 text-[#28745e]" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#123f38]">Control Menu</p>
          </div>
          <div className="flex md:flex-col overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 pb-1 md:pb-0">
          
          {[
            { id: 'blogs' as const, label: 'Impact Stories (Blogs)', icon: FileText, count: blogs.length },
            { id: 'banners' as const, label: 'Hero Banners', icon: ImageIcon, count: content.hero?.slides?.length ?? 0 },
            { id: 'metrics' as const, label: 'Impact Numbers & Metrics', icon: BarChart3, count: content.impactStats?.length ?? 0 },
            { id: 'about' as const, label: 'About Us Section', icon: Info },
            { id: 'programs' as const, label: 'Strategic Initiatives', icon: Target, count: content.programs?.items?.length ?? 0 },
            { id: 'approach' as const, label: 'Approach & Principles', icon: Compass, count: content.approach?.principles?.length ?? 0 },
            { id: 'gallery' as const, label: 'Moments of Hope (Gallery)', icon: Images, count: content.gallery?.items?.length ?? 0 },
            { id: 'support' as const, label: 'Support & CTA Banner', icon: HeartHandshake },
            { id: 'payment' as const, label: 'Payment QR & Bank Details', icon: QrCode },
            { id: 'content' as const, label: 'Site Contact & Details', icon: Sliders },
            { id: 'donations' as const, label: 'Donation Records', icon: Heart, count: donations.length },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`shrink-0 md:w-full flex items-center justify-between rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2 sm:py-3 text-xs font-bold transition whitespace-nowrap ${
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
        </div>
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
                      coverImage: '',
                      author: '',
                      images: [],
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
                        onClick={async () => {
                          setEditingBlog(b);
                          setIsBlogModalOpen(true);
                          try {
                            const res = await fetch(`/api/blogs/${encodeURIComponent(b.id)}`);
                            if (res.ok) {
                              const json = await res.json();
                              if (json.blog) {
                                setEditingBlog((current) => current ? { ...current, ...json.blog } : json.blog);
                              }
                            }
                          } catch (err) {
                            console.warn('Failed to load full blog details:', err);
                          }
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
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#d9e1d7]">
                <div>
                  <h2 className="display-font text-2xl font-bold text-[#183a35]">Hero Banner Carousel</h2>
                  <p className="text-xs text-[#58706a]">Update, add, or delete main homepage background slide images and copy</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newSlide: HeroSlide = {
                        id: 'slide-' + Date.now(),
                        image: '',
                        eyebrow: '',
                        title: '',
                        copy: '',
                      };
                      setContent((prev) => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          slides: [...prev.hero.slides, newSlide],
                        },
                      }));
                      showToastMsg('New banner slide added! Configure details below.');
                    }}
                    className="flex items-center gap-1.5 rounded-full border border-[#28745e] px-4 py-2 text-xs font-bold text-[#28745e] hover:bg-[#28745e] hover:text-white transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Banner</span>
                  </button>
                  <button
                    onClick={() => handleSaveContent('Hero Banners')}
                    disabled={savingSection === 'Hero Banners'}
                    className="flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#28745e] transition disabled:opacity-70"
                  >
                    {savingSection === 'Hero Banners' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#f2ad3b]" />
                        <span>Saving Banners...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-[#f2ad3b]" />
                        <span>Save Banners</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-[#e8f0e8] border border-[#28745e]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <p className="text-xs font-bold text-[#123f38] flex items-center gap-1.5">
                    <span className="text-[#f2ad3b] text-base">📐</span>
                    <span>Recommended Banner Image Size & Proportions</span>
                  </p>
                  <p className="text-[11px] text-[#58706a] mt-0.5">
                    Best Resolution: <strong className="text-[#123f38]">Width: 1920 px × Height: 850 px</strong> (Landscape 16:9 ratio). You can upload image files from your computer or paste direct image links.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold bg-[#123f38] text-[#f2ad3b] px-3.5 py-1.5 rounded-full shrink-0 shadow-sm">
                  <span>1920 × 850 PX (16:9)</span>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {(!content.hero.slides || content.hero.slides.length === 0) ? (
                  <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-[#dce7dc]">
                    <p className="text-sm font-bold text-[#183a35]">No banner slides configured yet.</p>
                    <p className="text-xs text-[#58706a] mt-1">Upload a background image and title using the button above to add your first hero banner.</p>
                    <button
                      type="button"
                      onClick={() => {
                        const newSlide = {
                          id: `slide-${Date.now()}`,
                          title: '',
                          eyebrow: '',
                          copy: '',
                          image: '',
                          ctaText: 'Donate & Support',
                          ctaLink: '#programs',
                        };
                        setContent((prev) => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            slides: [...(prev.hero.slides || []), newSlide],
                          },
                        }));
                      }}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#123f38] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#28745e] transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add First Banner Slide</span>
                    </button>
                  </div>
                ) : (
                  content.hero.slides.map((slide, idx) => (
                  <div key={slide.id || idx} className="p-5 rounded-2xl bg-[#f8f4e9]/70 border border-[#dce7dc] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#28745e] text-xs font-bold text-white">
                          {idx + 1}
                        </span>
                        <p className="text-xs font-bold text-[#28745e]">Hero Banner Slide #{idx + 1}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono bg-white border border-[#dce7dc] px-2 py-0.5 rounded text-[#58706a]">
                          1920 × 850 px
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete banner slide #${idx + 1}?`)) {
                              setContent((prev) => ({
                                ...prev,
                                hero: {
                                  ...prev.hero,
                                  slides: prev.hero.slides.filter((_, i) => i !== idx),
                                },
                              }));
                              showToastMsg(`Banner slide #${idx + 1} deleted. Click "Save Banners" to update database.`);
                            }
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg transition"
                          title="Delete this banner slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Slide</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Heading Title</label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => {
                            setContent((prev) => ({
                              ...prev,
                              hero: {
                                ...prev.hero,
                                slides: prev.hero.slides.map((sl, i) => (i === idx ? { ...sl, title: e.target.value } : sl)),
                              },
                            }));
                          }}
                          className="w-full rounded-xl border p-2.5 text-xs bg-white font-bold"
                          placeholder="e.g. Building Hope & Resilient Futures Together"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Eyebrow Badge</label>
                        <input
                          type="text"
                          value={slide.eyebrow}
                          onChange={(e) => {
                            setContent((prev) => ({
                              ...prev,
                              hero: {
                                ...prev.hero,
                                slides: prev.hero.slides.map((sl, i) => (i === idx ? { ...sl, eyebrow: e.target.value } : sl)),
                              },
                            }));
                          }}
                          className="w-full rounded-xl border p-2.5 text-xs bg-white"
                          placeholder="e.g. Empower Communities • Transform Lives"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Banner Description / Subtitle (Copy)</label>
                      <textarea
                        rows={2}
                        value={slide.copy || ''}
                        onChange={(e) => {
                          setContent((prev) => ({
                            ...prev,
                            hero: {
                              ...prev.hero,
                              slides: prev.hero.slides.map((sl, i) => (i === idx ? { ...sl, copy: e.target.value } : sl)),
                            },
                          }));
                        }}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white"
                        placeholder="Brief summary paragraph displayed beneath the heading on the banner"
                      />
                    </div>

                    <div>
                      <ImageUploadInput
                        label="Hero Slide Background Image (Recommended: 1920 × 850 px)"
                        value={slide.image}
                        onChangeSingle={(url) => {
                          setContent((prev) => ({
                            ...prev,
                            hero: {
                              ...prev.hero,
                              slides: prev.hero.slides.map((sl, i) => (i === idx ? { ...sl, image: url } : sl)),
                            },
                          }));
                        }}
                        helperText="Exact Recommended Dimensions: 1920px width × 850px height. Supports file uploads or paste web image links."
                      />
                    </div>
                  </div>
                ))
              )}

              {/* Add Another Banner Slide Button */}
              {content.hero.slides && content.hero.slides.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const newSlide: HeroSlide = {
                      id: 'slide-' + Date.now(),
                      image: '',
                      eyebrow: '',
                      title: '',
                      copy: '',
                    };
                    setContent((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        slides: [...prev.hero.slides, newSlide],
                      },
                    }));
                    showToastMsg('New banner slide added. Upload your image and enter details!');
                  }}
                  className="w-full py-4 rounded-2xl border-2 border-dashed border-[#28745e]/40 bg-[#f8f4e9]/50 hover:bg-[#e8f0e8] text-[#28745e] font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Another Banner Slide</span>
                </button>
              )}
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
                      setContent((prev) => ({
                        ...prev,
                        impactStats: [...prev.impactStats, newStat],
                      }));
                      showToastMsg('New metric added!');
                    }}
                    className="flex items-center gap-1.5 rounded-full border border-[#28745e] px-4 py-2 text-xs font-bold text-[#28745e] hover:bg-[#28745e] hover:text-white transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Metric</span>
                  </button>
                  <button
                    onClick={() => handleSaveContent('Impact Metrics')}
                    disabled={savingSection === 'Impact Metrics'}
                    className="flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#28745e] transition disabled:opacity-70"
                  >
                    {savingSection === 'Impact Metrics' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#f2ad3b]" />
                        <span>Saving Metrics...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-[#f2ad3b]" />
                        <span>Save Metrics</span>
                      </>
                    )}
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
                            if (confirm(`Remove metric #${idx + 1}?`)) {
                              setContent((prev) => ({
                                ...prev,
                                impactStats: prev.impactStats.filter((_, i) => i !== idx),
                              }));
                            }
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
                          setContent((prev) => ({
                            ...prev,
                            impactStats: prev.impactStats.map((st, i) => (i === idx ? { ...st, stat: e.target.value } : st)),
                          }));
                        }}
                        className="w-full rounded-xl border p-2.5 text-sm bg-white font-bold"
                        placeholder="e.g. 50,000+ or 4000+ or 98%"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Metric Description Label *</label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          setContent((prev) => ({
                            ...prev,
                            impactStats: prev.impactStats.map((st, i) => (i === idx ? { ...st, label: e.target.value } : st)),
                          }));
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
                          setContent((prev) => ({
                            ...prev,
                            impactStats: prev.impactStats.map((st, i) => (i === idx ? { ...st, iconName: e.target.value } : st)),
                          }));
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
                  onClick={() => handleSaveContent('About Us')}
                  disabled={savingSection === 'About Us'}
                  className="flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#28745e] transition disabled:opacity-70"
                >
                  {savingSection === 'About Us' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#f2ad3b]" />
                      <span>Saving About Section...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#f2ad3b]" />
                      <span>Save About Section</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Eyebrow Title</label>
                    <input
                      type="text"
                      value={content.about.eyebrow}
                      onChange={(e) => setContent((prev) => ({ ...prev, about: { ...prev.about, eyebrow: e.target.value } }))}
                      className="w-full rounded-xl border p-2.5 text-xs bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Badge Title (e.g. 100% Transparent)</label>
                    <input
                      type="text"
                      value={content.about.badgeTitle}
                      onChange={(e) => setContent((prev) => ({ ...prev, about: { ...prev.about, badgeTitle: e.target.value } }))}
                      className="w-full rounded-xl border p-2.5 text-xs bg-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Main Section Heading</label>
                  <input
                    type="text"
                    value={content.about.title}
                    onChange={(e) => setContent((prev) => ({ ...prev, about: { ...prev.about, title: e.target.value } }))}
                    className="w-full rounded-xl border p-2.5 text-sm bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Primary Story Paragraph</label>
                  <textarea
                    rows={3}
                    value={content.about.copyOne}
                    onChange={(e) => setContent((prev) => ({ ...prev, about: { ...prev.about, copyOne: e.target.value } }))}
                    className="w-full rounded-xl border p-2.5 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Secondary Story Paragraph</label>
                  <textarea
                    rows={3}
                    value={content.about.copyTwo}
                    onChange={(e) => setContent((prev) => ({ ...prev, about: { ...prev.about, copyTwo: e.target.value } }))}
                    className="w-full rounded-xl border p-2.5 text-xs bg-white"
                  />
                </div>

                {/* About Us Image Upload */}
                <ImageUploadInput
                  label="About Us Main Showcase Photo"
                  value={content.about.image}
                  onChangeSingle={(url) => setContent((prev) => ({ ...prev, about: { ...prev.about, image: url } }))}
                  helperText="Upload or change the primary featured photo for the About Us section on the homepage."
                />
              </div>
            </div>
          )}

          {/* TAB 4: STRATEGIC INITIATIVES / PROGRAMS */}
          {activeTab === 'programs' && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#d9e1d7]">
                <div>
                  <h2 className="display-font text-2xl font-bold text-[#183a35]">Strategic Initiatives Editor</h2>
                  <p className="text-xs text-[#58706a]">Update program titles, descriptions, and background images</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newProg: ProgramItem = {
                        id: 'prog-' + Date.now(),
                        title: '',
                        description: '',
                        image: '',
                        icon: 'Sparkles',
                        badgeBg: 'bg-[#dcece5]',
                        badgeTextColor: 'text-[#28745e]',
                      };
                      setContent((prev) => ({
                        ...prev,
                        programs: {
                          ...prev.programs,
                          items: [...prev.programs.items, newProg],
                        },
                      }));
                      showToastMsg('New strategic initiative added!');
                    }}
                    className="flex items-center gap-1.5 rounded-full border border-[#28745e] px-4 py-2 text-xs font-bold text-[#28745e] hover:bg-[#28745e] hover:text-white transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Initiative</span>
                  </button>
                  <button
                    onClick={() => handleSaveContent('Initiatives')}
                    disabled={savingSection === 'Initiatives'}
                    className="flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#28745e] transition disabled:opacity-70"
                  >
                    {savingSection === 'Initiatives' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#f2ad3b]" />
                        <span>Saving Initiatives...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-[#f2ad3b]" />
                        <span>Save Initiatives</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {content.programs.items.map((prog, idx) => (
                  <div key={prog.id || idx} className="p-5 rounded-2xl bg-[#f8f4e9]/70 border border-[#dce7dc] space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#28745e]">Program Card #{idx + 1}</p>
                      {content.programs.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove Program Card #${idx + 1}?`)) {
                              setContent((prev) => ({
                                ...prev,
                                programs: {
                                  ...prev.programs,
                                  items: prev.programs.items.filter((_, i) => i !== idx),
                                },
                              }));
                            }
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Program</span>
                        </button>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold mb-1">Program Title</label>
                      <input
                        type="text"
                        value={prog.title}
                        onChange={(e) => {
                          setContent((prev) => ({
                            ...prev,
                            programs: {
                              ...prev.programs,
                              items: prev.programs.items.map((pr, i) => (i === idx ? { ...pr, title: e.target.value } : pr)),
                            },
                          }));
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
                          setContent((prev) => ({
                            ...prev,
                            programs: {
                              ...prev.programs,
                              items: prev.programs.items.map((pr, i) => (i === idx ? { ...pr, description: e.target.value } : pr)),
                            },
                          }));
                        }}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white"
                      />
                    </div>

                    {/* Program Image Upload */}
                    <ImageUploadInput
                      label="Program Card Background Photo"
                      value={prog.image}
                      onChangeSingle={(url) => {
                        setContent((prev) => ({
                          ...prev,
                          programs: {
                            ...prev.programs,
                            items: prev.programs.items.map((pr, i) => (i === idx ? { ...pr, image: url } : pr)),
                          },
                        }));
                      }}
                      helperText="Select or upload a high-quality photo representing this program initiative."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: OUR APPROACH & CORE PRINCIPLES */}
          {activeTab === 'approach' && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#d9e1d7]">
                <div>
                  <h2 className="display-font text-2xl font-bold text-[#183a35]">Our Approach & Core Principles</h2>
                  <p className="text-xs text-[#58706a]">Manage the &apos;How We Ensure Ethical & Long-Term Impact&apos; section, image, and principles cards</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newPrinciple: PrincipleItem = {
                        id: 'p-' + Date.now(),
                        title: 'New Core Principle',
                        description: 'Description of this foundational principle that guides our grassroots intervention.',
                        icon: 'Sprout',
                        iconBg: 'bg-[#28745e]',
                        iconColor: 'text-[#fffdf8]',
                      };
                      setContent((prev) => ({
                        ...prev,
                        approach: {
                          ...prev.approach,
                          principles: [...(prev.approach.principles || []), newPrinciple],
                        },
                      }));
                      showToastMsg('New core principle added!');
                    }}
                    className="flex items-center gap-1.5 rounded-full border border-[#28745e] px-4 py-2 text-xs font-bold text-[#28745e] hover:bg-[#28745e] hover:text-white transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Principle</span>
                  </button>
                  <button
                    onClick={() => handleSaveContent('Approach & Principles')}
                    disabled={savingSection === 'Approach & Principles'}
                    className="flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#28745e] transition disabled:opacity-70"
                  >
                    {savingSection === 'Approach & Principles' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#f2ad3b]" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-[#f2ad3b]" />
                        <span>Save Principles</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {/* Section Headings & Main Copy */}
                <div className="p-5 rounded-2xl bg-[#f8f4e9]/70 border border-[#dce7dc] space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#123f38]">Section Header & Copy</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">Eyebrow Tag</label>
                      <input
                        type="text"
                        value={content.approach.eyebrow}
                        onChange={(e) => setContent((prev) => ({ ...prev, approach: { ...prev.approach, eyebrow: e.target.value } }))}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Section Title</label>
                      <input
                        type="text"
                        value={content.approach.title}
                        onChange={(e) => setContent((prev) => ({ ...prev, approach: { ...prev.approach, title: e.target.value } }))}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Section Main Description</label>
                    <textarea
                      rows={2}
                      value={content.approach.copy}
                      onChange={(e) => setContent((prev) => ({ ...prev, approach: { ...prev.approach, copy: e.target.value } }))}
                      className="w-full rounded-xl border p-2.5 text-xs bg-white"
                    />
                  </div>

                  {/* Section Main Image Upload */}
                  <ImageUploadInput
                    label="Approach Section Feature Photo"
                    value={content.approach.image}
                    onChangeSingle={(url) => setContent((prev) => ({ ...prev, approach: { ...prev.approach, image: url } }))}
                    helperText="Upload or change the primary high-res photo representing community empowerment in the Approach section."
                  />
                </div>

                {/* Principles Cards List */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#123f38]">Core Principle Cards</h3>
                  {content.approach.principles.map((pr, idx) => (
                    <div key={pr.id || idx} className="p-4 rounded-2xl bg-white border border-[#dce7dc] shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#28745e]">Principle #{idx + 1}</span>
                        {content.approach.principles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove Principle #${idx + 1}?`)) {
                                setContent((prev) => ({
                                  ...prev,
                                  approach: {
                                    ...prev.approach,
                                    principles: prev.approach.principles.filter((_, i) => i !== idx),
                                  },
                                }));
                              }
                            }}
                            className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold mb-1">Principle Title</label>
                          <input
                            type="text"
                            value={pr.title}
                            onChange={(e) => {
                              setContent((prev) => ({
                                ...prev,
                                approach: {
                                  ...prev.approach,
                                  principles: prev.approach.principles.map((p, i) => (i === idx ? { ...p, title: e.target.value } : p)),
                                },
                              }));
                            }}
                            className="w-full rounded-xl border p-2 text-xs bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold mb-1">Icon Style</label>
                          <select
                            value={pr.icon}
                            onChange={(e) => {
                              setContent((prev) => ({
                                ...prev,
                                approach: {
                                  ...prev.approach,
                                  principles: prev.approach.principles.map((p, i) => (i === idx ? { ...p, icon: e.target.value } : p)),
                                },
                              }));
                            }}
                            className="w-full rounded-xl border p-2 text-xs bg-white"
                          >
                            <option value="Ear">Ear (Listening First)</option>
                            <option value="HandHeart">HandHeart (Community Driven)</option>
                            <option value="Sprout">Sprout (Sustainable Growth)</option>
                            <option value="Sparkles">Sparkles (Transformation)</option>
                            <option value="ShieldCheck">ShieldCheck (Ethical & Transparent)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold mb-1">Principle Description</label>
                        <textarea
                          rows={2}
                          value={pr.description}
                          onChange={(e) => {
                            setContent((prev) => ({
                              ...prev,
                              approach: {
                                ...prev.approach,
                                principles: prev.approach.principles.map((p, i) => (i === idx ? { ...p, description: e.target.value } : p)),
                              },
                            }));
                          }}
                          className="w-full rounded-xl border p-2 text-xs bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MOMENTS OF HOPE (GALLERY) */}
          {activeTab === 'gallery' && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#d9e1d7]">
                <div>
                  <h2 className="display-font text-2xl font-bold text-[#183a35]">Moments of Hope (Image Gallery)</h2>
                  <p className="text-xs text-[#58706a]">Manage photo showcase cards, titles, captions, and images displayed on the homepage</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newGalItem: GalleryItem = {
                        id: 'gal-' + Date.now(),
                        title: '',
                        caption: '',
                        image: '',
                      };
                      setContent((prev) => ({
                        ...prev,
                        gallery: {
                          ...prev.gallery,
                          items: [...(prev.gallery.items || []), newGalItem],
                        },
                      }));
                      showToastMsg('New gallery photo card added!');
                    }}
                    className="flex items-center gap-1.5 rounded-full border border-[#28745e] px-4 py-2 text-xs font-bold text-[#28745e] hover:bg-[#28745e] hover:text-white transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Photo Card</span>
                  </button>
                  <button
                    onClick={() => handleSaveContent('Moments of Hope Gallery')}
                    disabled={savingSection === 'Moments of Hope Gallery'}
                    className="flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#28745e] transition disabled:opacity-70"
                  >
                    {savingSection === 'Moments of Hope Gallery' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#f2ad3b]" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-[#f2ad3b]" />
                        <span>Save Gallery</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {/* Section Header */}
                <div className="p-5 rounded-2xl bg-[#f8f4e9]/70 border border-[#dce7dc] space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#123f38]">Gallery Section Header</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">Eyebrow Tag</label>
                      <input
                        type="text"
                        value={content.gallery.eyebrow}
                        onChange={(e) => setContent((prev) => ({ ...prev, gallery: { ...prev.gallery, eyebrow: e.target.value } }))}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Section Title</label>
                      <input
                        type="text"
                        value={content.gallery.title}
                        onChange={(e) => setContent((prev) => ({ ...prev, gallery: { ...prev.gallery, title: e.target.value } }))}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Section Description</label>
                    <textarea
                      rows={2}
                      value={content.gallery.copy}
                      onChange={(e) => setContent((prev) => ({ ...prev, gallery: { ...prev.gallery, copy: e.target.value } }))}
                      className="w-full rounded-xl border p-2.5 text-xs bg-white"
                    />
                  </div>
                </div>

                {/* Gallery Photo Cards */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#123f38]">Photo Gallery Cards</h3>
                  {content.gallery.items.map((item, idx) => (
                    <div key={item.id || idx} className="p-5 rounded-2xl bg-white border border-[#dce7dc] shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#28745e]">Gallery Card #{idx + 1}</span>
                        {content.gallery.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove Gallery Card #${idx + 1}?`)) {
                                setContent((prev) => ({
                                  ...prev,
                                  gallery: {
                                    ...prev.gallery,
                                    items: prev.gallery.items.filter((_, i) => i !== idx),
                                  },
                                }));
                              }
                            }}
                            className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Card</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold mb-1">Card Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              setContent((prev) => ({
                                ...prev,
                                gallery: {
                                  ...prev.gallery,
                                  items: prev.gallery.items.map((g, i) => (i === idx ? { ...g, title: e.target.value } : g)),
                                },
                              }));
                            }}
                            className="w-full rounded-xl border p-2 text-xs bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold mb-1">Caption / Subtext</label>
                          <input
                            type="text"
                            value={item.caption}
                            onChange={(e) => {
                              setContent((prev) => ({
                                ...prev,
                                gallery: {
                                  ...prev.gallery,
                                  items: prev.gallery.items.map((g, i) => (i === idx ? { ...g, caption: e.target.value } : g)),
                                },
                              }));
                            }}
                            className="w-full rounded-xl border p-2 text-xs bg-white"
                          />
                        </div>
                      </div>

                      {/* Image Upload Input */}
                      <ImageUploadInput
                        label="Gallery Card Image *"
                        value={item.image}
                        onChangeSingle={(url) => {
                          setContent((prev) => ({
                            ...prev,
                            gallery: {
                              ...prev.gallery,
                              items: prev.gallery.items.map((g, i) => (i === idx ? { ...g, image: url } : g)),
                            },
                          }));
                        }}
                        helperText="Upload official field photo to display on this gallery card."
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SUPPORT & CTA BANNER */}
          {activeTab === 'support' && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#d9e1d7]">
                <div>
                  <h2 className="display-font text-2xl font-bold text-[#183a35]">Support & CTA Banner Editor</h2>
                  <p className="text-xs text-[#58706a]">Manage the &apos;Make A Difference Today&apos; full-width callout section and background image</p>
                </div>
                <button
                  onClick={() => handleSaveContent('Support CTA Banner')}
                  disabled={savingSection === 'Support CTA Banner'}
                  className="flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#28745e] transition disabled:opacity-70"
                >
                  {savingSection === 'Support CTA Banner' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#f2ad3b]" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#f2ad3b]" />
                      <span>Save Support Banner</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div className="p-5 rounded-2xl bg-[#f8f4e9]/70 border border-[#dce7dc] space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">Eyebrow Badge</label>
                      <input
                        type="text"
                        value={content.support.eyebrow}
                        onChange={(e) => setContent((prev) => ({ ...prev, support: { ...prev.support, eyebrow: e.target.value } }))}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Main Heading</label>
                      <input
                        type="text"
                        value={content.support.title}
                        onChange={(e) => setContent((prev) => ({ ...prev, support: { ...prev.support, title: e.target.value } }))}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Banner Description Text</label>
                    <textarea
                      rows={3}
                      value={content.support.copy}
                      onChange={(e) => setContent((prev) => ({ ...prev, support: { ...prev.support, copy: e.target.value } }))}
                      className="w-full rounded-xl border p-2.5 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Action Button Text</label>
                    <input
                      type="text"
                      value={content.support.ctaText}
                      onChange={(e) => setContent((prev) => ({ ...prev, support: { ...prev.support, ctaText: e.target.value } }))}
                      className="w-full rounded-xl border p-2.5 text-xs bg-white font-bold"
                    />
                  </div>

                  {/* Banner Background Image Upload */}
                  <ImageUploadInput
                    label="Full-Width Callout Background Photo *"
                    value={content.support.image}
                    onChangeSingle={(url) => setContent((prev) => ({ ...prev, support: { ...prev.support, image: url } }))}
                    helperText="Upload or change the high-resolution background photo for the bottom 'Make A Difference Today' callout section."
                  />
                </div>
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
                  onClick={() => handleSaveContent('Site Details')}
                  disabled={savingSection === 'Site Details'}
                  className="flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#28745e] transition disabled:opacity-70"
                >
                  {savingSection === 'Site Details' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#f2ad3b]" />
                      <span>Saving Details...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#f2ad3b]" />
                      <span>Save Site Details</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {/* Logo Upload */}
                <div className="rounded-2xl border border-[#d9e1d7] bg-[#f8f4e9]/60 p-5 space-y-4">
                  <ImageUploadInput
                    label="Organization Logo (Image / Icon)"
                    value={content.brand.logo || ''}
                    onChangeSingle={(url) => setContent((prev) => ({ ...prev, brand: { ...prev.brand, logo: url } }))}
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
                            onChange={() => setContent((prev) => ({ ...prev, brand: { ...prev.brand, logoStyle: 'full' } }))}
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
                            onChange={() => setContent((prev) => ({ ...prev, brand: { ...prev.brand, logoStyle: 'icon_text' } }))}
                            className="accent-[#28745e]"
                          />
                          <div>
                            <p className="text-xs font-bold">Logo Icon + Text</p>
                            <p className="text-[10px] font-normal text-[#58706a]">Circular icon next to Org Name & Tagline text</p>
                          </div>
                        </label>
                      </div>

                      {/* Logo Height / Size Control */}
                      <div className="mt-4 pt-3 border-t border-[#d9e1d7]">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <label className="text-xs font-bold text-[#183a35]">
                            Logo Size in Header ({content.brand.logoHeight || 70}px)
                          </label>
                          <div className="flex flex-wrap gap-1 text-[11px]">
                            {[
                              { label: 'Normal (50px)', val: 50 },
                              { label: 'Medium (70px)', val: 70 },
                              { label: 'Large (90px)', val: 90 },
                              { label: 'Extra Large (110px)', val: 110 },
                            ].map((preset) => (
                              <button
                                key={preset.val}
                                type="button"
                                onClick={() => setContent((prev) => ({ ...prev, brand: { ...prev.brand, logoHeight: preset.val } }))}
                                className={`px-2.5 py-1 rounded-lg border transition ${
                                  (content.brand.logoHeight || 70) === preset.val
                                    ? 'bg-[#28745e] text-white border-[#28745e] font-bold shadow-xs'
                                    : 'bg-white text-[#58706a] hover:border-[#28745e]'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="140"
                          step="5"
                          value={content.brand.logoHeight || 70}
                          onChange={(e) => setContent((prev) => ({ ...prev, brand: { ...prev.brand, logoHeight: Number(e.target.value) } }))}
                          className="w-full accent-[#28745e] cursor-pointer"
                        />
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
                      onChange={(e) => setContent((prev) => ({ ...prev, brand: { ...prev.brand, name: e.target.value } }))}
                      className="w-full rounded-xl border p-2.5 text-sm bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Tagline</label>
                    <input
                      type="text"
                      value={content.brand.tagline}
                      onChange={(e) => setContent((prev) => ({ ...prev, brand: { ...prev.brand, tagline: e.target.value } }))}
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
                      onChange={(e) => setContent((prev) => ({ ...prev, brand: { ...prev.brand, email: e.target.value } }))}
                      className="w-full rounded-xl border p-2.5 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={content.brand.phone}
                      onChange={(e) => setContent((prev) => ({ ...prev, brand: { ...prev.brand, phone: e.target.value } }))}
                      className="w-full rounded-xl border p-2.5 text-sm bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Location Address</label>
                  <input
                    type="text"
                    value={content.brand.location}
                    onChange={(e) => setContent((prev) => ({ ...prev, brand: { ...prev.brand, location: e.target.value } }))}
                    className="w-full rounded-xl border p-2.5 text-sm bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: PAYMENT & QR CODE CONFIGURATION */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#d9e1d7]">
                <div>
                  <h2 className="display-font text-2xl font-bold text-[#183a35]">Payment Barcode & UPI QR Settings</h2>
                  <p className="text-xs text-[#58706a]">Upload your organization&apos;s UPI Barcode/QR Code image and configure bank transfer details</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveContent('Payment & QR Settings')}
                  disabled={savingSection === 'Payment & QR Settings'}
                  className="flex items-center gap-2 rounded-xl bg-[#123f38] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#28745e] transition shadow-md disabled:opacity-50"
                >
                  {savingSection === 'Payment & QR Settings' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#f2ad3b]" />}
                  <span>Save QR & Payment Info</span>
                </button>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#e8f0e8] border border-[#28745e]/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123f38] text-white">
                    <QrCode className="w-5 h-5 text-[#f2ad3b]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#123f38]">Enable UPI QR Code Donations</h4>
                    <p className="text-xs text-[#58706a]">Display QR code in Donation Modal & Website Footer for direct scan & pay</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content.payment?.enableQrDonation !== false}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        payment: { ...prev.payment, enableQrDonation: e.target.checked },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28745e]"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Column */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#f8f4e9] border border-[#dce7dc] space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#123f38] flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#28745e]" />
                      <span>QR Code / Barcode Image</span>
                    </h3>

                    <ImageUploadInput
                      label="Upload Payment QR Code / Barcode Image *"
                      value={content.payment?.qrCodeImage || ''}
                      onChangeSingle={(url) =>
                        setContent((prev) => ({
                          ...prev,
                          payment: { ...prev.payment, qrCodeImage: url },
                        }))
                      }
                      helperText="Upload official PhonePe / Google Pay / Paytm / BHIM UPI Barcode QR code (PNG, JPG, SVG or paste URL)"
                    />

                    <div>
                      <label className="block text-xs font-bold mb-1">Official UPI ID (VPA) *</label>
                      <input
                        type="text"
                        placeholder="e.g. actcharitabletrust@upi or 9876543210@paytm"
                        value={content.payment?.upiId || ''}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            payment: { ...prev.payment, upiId: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border p-2.5 text-sm bg-white font-mono"
                      />
                      <p className="text-[11px] text-[#58706a] mt-1">Donors will be able to copy this with 1 click to pay in their UPI app.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Beneficiary / Account Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. ACT Charitable Trust"
                        value={content.payment?.accountName || ''}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            payment: { ...prev.payment, accountName: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border p-2.5 text-sm bg-white"
                      />
                    </div>
                  </div>

                  {/* Bank Account Details */}
                  <div className="p-4 rounded-2xl bg-[#f8f4e9] border border-[#dce7dc] space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#123f38] flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#28745e]" />
                      <span>Direct Bank Transfer Details (IMPS / NEFT)</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Bank Name</label>
                        <input
                          type="text"
                          placeholder="e.g. State Bank of India"
                          value={content.payment?.bankName || ''}
                          onChange={(e) =>
                            setContent((prev) => ({
                              ...prev,
                              payment: { ...prev.payment, bankName: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border p-2.5 text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">IFSC Code</label>
                        <input
                          type="text"
                          placeholder="e.g. SBIN0001234"
                          value={content.payment?.ifscCode || ''}
                          onChange={(e) =>
                            setContent((prev) => ({
                              ...prev,
                              payment: { ...prev.payment, ifscCode: e.target.value.toUpperCase() },
                            }))
                          }
                          className="w-full rounded-xl border p-2.5 text-sm bg-white font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Account Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 98765432101234"
                        value={content.payment?.accountNumber || ''}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            payment: { ...prev.payment, accountNumber: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border p-2.5 text-sm bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Payment Instructions / Note</label>
                      <textarea
                        rows={3}
                        placeholder="Instructions displayed to donor below the QR code..."
                        value={content.payment?.instructions || ''}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            payment: { ...prev.payment, instructions: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border p-2.5 text-sm bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview Column */}
                <div>
                  <div className="sticky top-24 rounded-2xl bg-white p-6 border-2 border-dashed border-[#28745e]/40 shadow-md space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#dce7dc]">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#28745e] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#28745e]" />
                        <span>Live Donor View Preview</span>
                      </span>
                      <span className="text-[10px] bg-[#e8f0e8] text-[#123f38] px-2.5 py-0.5 rounded-full font-bold">
                        Interactive
                      </span>
                    </div>

                    <div className="text-center space-y-3">
                      <h4 className="font-bold text-base text-[#123f38]">
                        Scan to Pay with Any UPI App
                      </h4>
                      <p className="text-xs text-[#58706a]">
                        Google Pay • PhonePe • Paytm • BHIM • Any UPI App
                      </p>

                      {/* QR Image Box */}
                      <div className="mx-auto w-56 h-56 bg-white p-3 rounded-2xl border-2 border-[#123f38] shadow-lg flex items-center justify-center relative overflow-hidden">
                        {content.payment?.qrCodeImage ? (
                          <img
                            src={content.payment.qrCodeImage}
                            alt="Payment QR Code"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center p-4 text-[#58706a]">
                            <QrCode className="w-12 h-12 mx-auto text-[#28745e] opacity-40 mb-2" />
                            <p className="text-xs font-bold">No QR Code Uploaded</p>
                          </div>
                        )}
                      </div>

                      {/* UPI ID display */}
                      {content.payment?.upiId && (
                        <div className="inline-flex items-center gap-2 bg-[#f8f4e9] border border-[#dce7dc] px-4 py-2 rounded-xl text-xs font-mono font-bold text-[#123f38]">
                          <span>UPI ID: {content.payment.upiId}</span>
                        </div>
                      )}

                      {/* Beneficiary Name */}
                      {content.payment?.accountName && (
                        <p className="text-xs text-[#58706a]">
                          Account Name: <strong className="text-[#183a35]">{content.payment.accountName}</strong>
                        </p>
                      )}

                      {/* Bank Details Snippet */}
                      {(content.payment?.bankName || content.payment?.accountNumber) && (
                        <div className="rounded-xl bg-[#f8f4e9] p-3 text-left text-xs border border-[#dce7dc] space-y-1">
                          <p className="font-bold text-[#123f38]">Bank Transfer Details:</p>
                          {content.payment?.bankName && <p className="text-[#58706a]">Bank: {content.payment.bankName}</p>}
                          {content.payment?.accountNumber && <p className="text-[#58706a]">A/C No: {content.payment.accountNumber}</p>}
                          {content.payment?.ifscCode && <p className="text-[#58706a]">IFSC: {content.payment.ifscCode}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DONATIONS */}
          {activeTab === 'donations' && (() => {
            const totalRaised = donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
            const filteredDonations = donations.filter((d) => {
              if (!donationSearch.trim()) return true;
              const q = donationSearch.toLowerCase();
              return (
                (d.name && d.name.toLowerCase().includes(q)) ||
                (d.email && d.email.toLowerCase().includes(q)) ||
                (d.utr && d.utr.toLowerCase().includes(q)) ||
                (d.phone && d.phone.toLowerCase().includes(q))
              );
            });

            return (
              <div>
                <div className="pb-6 border-b border-[#d9e1d7] flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="display-font text-2xl font-bold text-[#183a35]">Donation Submissions</h2>
                    <p className="text-xs text-[#58706a]">Real-time donor contributions, UPI reference transactions & database records</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-[#e8f0e8] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#123f38]">
                      <Heart className="w-4 h-4 text-[#28745e] fill-[#28745e]" />
                      <span>Donors: {donations.length}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#f8f4e9] border border-[#dce7dc] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#28745e]">
                      <span>Raised: ₹{totalRaised.toLocaleString('en-IN')}</span>
                    </div>
                    <button
                      onClick={handleExportDonationsCsv}
                      disabled={donations.length === 0}
                      className="flex items-center gap-1.5 bg-[#123f38] text-white px-3.5 py-1.5 rounded-full text-xs font-bold hover:bg-[#28745e] transition disabled:opacity-40"
                    >
                      <Download className="w-3.5 h-3.5 text-[#f2ad3b]" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="mt-5 flex items-center justify-between gap-4">
                  <div className="relative w-full max-w-sm">
                    <Search className="w-4 h-4 text-[#58706a] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Search donor name, email, or UTR..."
                      value={donationSearch}
                      onChange={(e) => setDonationSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#dce7dc] bg-white focus:outline-none focus:border-[#28745e]"
                    />
                  </div>
                  <div className="text-xs text-[#58706a] font-medium">
                    Showing {filteredDonations.length} of {donations.length} records
                  </div>
                </div>

                <div className="mt-4">
                  {donations.length === 0 ? (
                    <div className="py-16 text-center text-[#58706a] text-sm font-medium bg-white rounded-2xl border border-[#dce7dc]">
                      No donations recorded yet. When users donate through the website, records will be saved here automatically.
                    </div>
                  ) : filteredDonations.length === 0 ? (
                    <div className="py-12 text-center text-[#58706a] text-xs font-medium bg-white rounded-2xl border border-[#dce7dc]">
                      No donations match your search filter.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-[#dce7dc] bg-white shadow-sm">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#f8f4e9] border-b border-[#dce7dc] text-[#123f38] uppercase font-bold">
                            <th className="p-3">Donor Name</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Frequency</th>
                            <th className="p-3">Contact</th>
                            <th className="p-3">Payment Method</th>
                            <th className="p-3">UTR / Transaction #</th>
                            <th className="p-3">Payment Proof</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dce7dc]">
                          {filteredDonations.map((d, i) => {
                            const dateStr = d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Recent';
                            const currentStatus = d.status || 'pending';

                            return (
                              <tr key={d.id || i} className="hover:bg-[#f8f4e9]/40 transition">
                                <td className="p-3 font-bold text-[#183a35]">{d.name || 'Anonymous'}</td>
                                <td className="p-3 font-bold text-[#28745e] text-sm">₹{d.amount}</td>
                                <td className="p-3 capitalize">{d.frequency}</td>
                                <td className="p-3">
                                  <div className="text-[#183a35] font-medium">{d.email}</div>
                                  {d.phone && <div className="text-[11px] text-[#58706a]">{d.phone}</div>}
                                </td>
                                <td className="p-3">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f0e8] px-2.5 py-0.5 font-bold text-[10px] text-[#123f38]">
                                    <QrCode className="w-3 h-3 text-[#28745e]" />
                                    <span>{d.paymentMethod || 'UPI / QR'}</span>
                                  </span>
                                </td>
                                <td className="p-3 font-mono">
                                  {d.utr ? (
                                    <span className="font-bold text-[#123f38] bg-[#f8f4e9] px-2 py-0.5 rounded border border-[#dce7dc]">
                                      {d.utr}
                                    </span>
                                  ) : (
                                    <span className="text-[#58706a] italic">N/A</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {d.screenshot ? (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewScreenshot(d.screenshot || null)}
                                      className="group inline-flex items-center gap-1.5 p-1 rounded-lg border border-[#dce7dc] hover:border-[#28745e] bg-white shadow-xs transition"
                                      title="Click to view payment proof screenshot"
                                    >
                                      <img
                                        src={d.screenshot}
                                        alt="Screenshot receipt"
                                        className="w-8 h-8 object-cover rounded"
                                      />
                                      <span className="text-[11px] font-bold text-[#28745e] pr-1 flex items-center gap-1">
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>View</span>
                                      </span>
                                    </button>
                                  ) : (
                                    <span className="text-[#58706a] italic text-[11px]">No proof</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <select
                                    value={currentStatus}
                                    onChange={(e) => handleUpdateDonationStatus(d.id, e.target.value)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none transition ${
                                      currentStatus === 'verified'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                        : currentStatus === 'rejected'
                                        ? 'bg-red-50 text-red-700 border-red-300'
                                        : 'bg-amber-50 text-amber-700 border-amber-300'
                                    }`}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="verified">Verified</option>
                                    <option value="rejected">Rejected</option>
                                  </select>
                                </td>
                                <td className="p-3 text-[#58706a] whitespace-nowrap">{dateStr}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
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
                  values={editingBlog.images || []}
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

      {/* SCREENSHOT PREVIEW MODAL */}
      {previewScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
          onClick={() => setPreviewScreenshot(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-[#fffdf8] rounded-3xl overflow-hidden shadow-2xl border border-[#dce7dc] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#dce7dc]">
              <h3 className="font-bold text-[#183a35] text-sm flex items-center gap-2">
                <span>Donor Payment Proof Screenshot</span>
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewScreenshot}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#28745e] hover:underline flex items-center gap-1 px-3 py-1 rounded-lg bg-[#e8f0e8] transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Size</span>
                </a>
                <button
                  onClick={() => setPreviewScreenshot(null)}
                  className="p-1.5 text-[#58706a] hover:text-[#183a35] rounded-xl hover:bg-black/5 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center bg-[#f8f4e9] rounded-2xl p-3 max-h-[75vh] overflow-auto">
              <img
                src={previewScreenshot}
                alt="Payment proof screenshot"
                className="max-h-[68vh] w-auto object-contain rounded-xl shadow-md"
              />
            </div>
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
