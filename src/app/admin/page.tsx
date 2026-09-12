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
} from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { defaultBlogs } from '@/data/initialBlogs';
import { defaultContent } from '@/data/initialContent';
import { SiteContent } from '@/types/content';

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
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'blogs' | 'banners' | 'content' | 'donations'>('blogs');

  // Data states
  const [blogs, setBlogs] = useState<BlogPost[]>(defaultBlogs);
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [donations, setDonations] = useState<DonationItem[]>([]);

  // Blog Form State
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);

  // Status Toast
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // Check local auth
    const savedUser = localStorage.getItem('act_admin_user');
    if (!savedUser) {
      router.push('/admin/login');
      return;
    }
    setAuthenticated(true);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [blogsRes, contentRes, donRes] = await Promise.all([
        fetch('/api/blogs'),
        fetch('/api/content'),
        fetch('/api/donations'),
      ]);

      if (blogsRes.ok) {
        const bJson = await blogsRes.json();
        if (bJson.blogs) setBlogs(bJson.blogs);
      }
      if (contentRes.ok) {
        const cJson = await contentRes.json();
        if (cJson.data) setContent(cJson.data);
      }
      if (donRes.ok) {
        const dJson = await donRes.json();
        if (dJson.donations) setDonations(dJson.donations);
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
    localStorage.removeItem('act_admin_user');
    router.push('/admin/login');
  };

  // Blog Handlers
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog?.title) return;

    try {
      const isEdit = !!editingBlog.id;
      const url = '/api/blogs';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBlog),
      });

      if (res.ok) {
        showToastMsg(isEdit ? 'Blog post updated!' : 'New Blog story published!');
        setIsBlogModalOpen(false);
        setEditingBlog(null);
        fetchData();
      }
    } catch {
      showToastMsg('Failed to save blog post.');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    try {
      const res = await fetch(`/api/blogs?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToastMsg('Blog post deleted.');
        fetchData();
      }
    } catch {
      showToastMsg('Delete failed.');
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

  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-[#f8f4e9] text-[#183a35] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-[#123f38] text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#28745e] text-[#f2ad3b]">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="display-font text-xl font-bold">ACT Trust Admin Dashboard</h1>
            <p className="text-xs text-[#f8f4e9]/80">Complete Content & Blog Control Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/30 px-3.5 py-1.5 text-xs font-bold hover:bg-white/10 transition"
          >
            <Globe className="w-4 h-4 text-[#f2ad3b]" />
            <span>View Live Website</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full bg-red-600/80 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <aside className="md:col-span-1 bg-[#fffdf8] rounded-3xl p-4 border border-[#d9e1d7] shadow-sm h-fit space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#58706a] px-3 mb-2">Navigation</p>
          {[
            { id: 'blogs' as const, label: 'Moments Of Hope (Blogs)', icon: FileText, count: blogs.length },
            { id: 'banners' as const, label: 'Hero Banners', icon: ImageIcon, count: content.hero.slides.length },
            { id: 'content' as const, label: 'Site Content & Details', icon: Sliders },
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

        {/* Dynamic Content Panel */}
        <main className="md:col-span-3 bg-[#fffdf8] rounded-3xl p-6 sm:p-8 border border-[#d9e1d7] shadow-sm">
          {/* TAB 1: BLOGS */}
          {activeTab === 'blogs' && (
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#d9e1d7]">
                <div>
                  <h2 className="display-font text-2xl font-bold text-[#183a35]">Impact Stories & Blogs</h2>
                  <p className="text-xs text-[#58706a]">Manage &apos;Moments Of Hope&apos; stories shown on homepage</p>
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
                  <span>Create New Blog</span>
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {blogs.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#f8f4e9] border border-[#dce7dc] gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.coverImage}
                        alt={b.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
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
                        className="p-2 rounded-xl border border-[#28745e] text-[#28745e] hover:bg-[#28745e] hover:text-white transition"
                        title="Edit Blog"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(b.id)}
                        className="p-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-600 hover:text-white transition"
                        title="Delete Blog"
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
                  <h2 className="display-font text-2xl font-bold text-[#183a35]">Hero Slide Banners</h2>
                  <p className="text-xs text-[#58706a]">Update background images and titles for the main hero carousel</p>
                </div>
                <button
                  onClick={handleSaveContent}
                  className="flex items-center gap-2 rounded-full bg-[#123f38] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#28745e] transition"
                >
                  <Save className="w-4 h-4 text-[#f2ad3b]" />
                  <span>Save Banners</span>
                </button>
              </div>

              <div className="mt-6 space-y-6">
                {content.hero.slides.map((slide, idx) => (
                  <div key={slide.id || idx} className="p-5 rounded-2xl bg-[#f8f4e9] border border-[#dce7dc] space-y-3">
                    <p className="text-xs font-bold text-[#28745e]">Hero Slide #{idx + 1}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Slide Title</label>
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
                      <label className="block text-xs font-bold mb-1">Banner Image URL</label>
                      <input
                        type="text"
                        value={slide.image}
                        onChange={(e) => {
                          const updated = [...content.hero.slides];
                          updated[idx].image = e.target.value;
                          setContent({ ...content, hero: { ...content.hero, slides: updated } });
                        }}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SITE CONTENT & DETAILS */}
          {activeTab === 'content' && (
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#d9e1d7]">
                <div>
                  <h2 className="display-font text-2xl font-bold text-[#183a35]">Site Contact & Brand Details</h2>
                  <p className="text-xs text-[#58706a]">Update trust name, tagline, email, phone, and about section</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Trust Name</label>
                    <input
                      type="text"
                      value={content.brand.name}
                      onChange={(e) => setContent({ ...content, brand: { ...content.brand, name: e.target.value } })}
                      className="w-full rounded-xl border p-2.5 text-sm bg-white"
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

          {/* TAB 4: DONATION RECORDS */}
          {activeTab === 'donations' && (
            <div>
              <div className="pb-6 border-b border-[#d9e1d7]">
                <h2 className="display-font text-2xl font-bold text-[#183a35]">Donation Submissions</h2>
                <p className="text-xs text-[#58706a]">Real-time donor contributions recorded from website forms</p>
              </div>

              <div className="mt-6">
                {donations.length === 0 ? (
                  <div className="py-12 text-center text-[#58706a] text-sm">No donations recorded yet.</div>
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
                        {donations.map((d, i) => (
                          <tr key={d.id || i} className="hover:bg-[#f8f4e9]/50">
                            <td className="p-3 font-bold text-[#183a35]">{d.name}</td>
                            <td className="p-3 font-bold text-[#28745e]">₹{d.amount}</td>
                            <td className="p-3 capitalize">{d.frequency}</td>
                            <td className="p-3">{d.email}</td>
                            <td className="p-3 text-[#58706a]">{new Date(d.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
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

              <div>
                <label className="block text-xs font-bold mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={editingBlog.coverImage || ''}
                  onChange={(e) => setEditingBlog({ ...editingBlog, coverImage: e.target.value })}
                  className="w-full rounded-xl border p-2.5 text-xs bg-white font-mono"
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
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#123f38] px-5 py-3 text-sm font-bold text-[#f2ad3b] shadow-2xl border border-[#f2ad3b]/40 animate-in fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
