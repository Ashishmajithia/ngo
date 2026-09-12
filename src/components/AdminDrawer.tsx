'use client';

import React, { useState } from 'react';
import { X, Save, RotateCcw, Sliders } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

type TabType = 'brand' | 'hero' | 'stats' | 'programs' | 'about';

export const AdminDrawer: React.FC = () => {
  const { content, updateContent, resetContent, isAdminOpen, setIsAdminOpen, showToast } = useContent();
  const [activeTab, setActiveTab] = useState<TabType>('brand');

  if (!isAdminOpen) return null;

  const handleBrandChange = (key: string, val: string) => {
    updateContent({
      brand: { ...content.brand, [key]: val },
    });
  };

  const handleHeroSlideChange = (index: number, key: string, val: string) => {
    const updatedSlides = [...content.hero.slides];
    updatedSlides[index] = { ...updatedSlides[index], [key]: val };
    updateContent({
      hero: { ...content.hero, slides: updatedSlides },
    });
  };

  const handleStatChange = (index: number, key: string, val: string) => {
    const updatedStats = [...content.impactStats];
    updatedStats[index] = { ...updatedStats[index], [key]: val };
    updateContent({ impactStats: updatedStats });
  };

  const handleProgramChange = (index: number, key: string, val: string) => {
    const updatedPrograms = [...content.programs.items];
    updatedPrograms[index] = { ...updatedPrograms[index], [key]: val };
    updateContent({
      programs: { ...content.programs, items: updatedPrograms },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-[#fffdf8] text-[#183a35] shadow-2xl flex flex-col border-l border-[#d9e1d7]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d9e1d7] bg-[#123f38] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <Sliders className="w-5 h-5 text-[#f2ad3b]" />
            <div>
              <h3 className="display-font font-bold text-lg">Dynamic Content Customizer</h3>
              <p className="text-xs text-[#f8f4e9]/80">Live edit all text, slides, and stats</p>
            </div>
          </div>
          <button
            onClick={() => setIsAdminOpen(false)}
            className="rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-[#d9e1d7] bg-[#f8f4e9] px-4 overflow-x-auto">
          {[
            { id: 'brand' as const, label: 'Brand & Contact' },
            { id: 'hero' as const, label: 'Hero Banner' },
            { id: 'stats' as const, label: 'Impact Stats' },
            { id: 'programs' as const, label: 'Programs' },
            { id: 'about' as const, label: 'About Info' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-[#28745e] text-[#123f38] bg-white'
                  : 'border-transparent text-[#58706a] hover:text-[#183a35]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'brand' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-[#123f38] border-b pb-2">Brand Info</h4>
              <div>
                <label className="block text-xs font-bold mb-1">Organization Name</label>
                <input
                  type="text"
                  value={content.brand.name}
                  onChange={(e) => handleBrandChange('name', e.target.value)}
                  className="w-full rounded-xl border p-2.5 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Tagline</label>
                <input
                  type="text"
                  value={content.brand.tagline}
                  onChange={(e) => handleBrandChange('tagline', e.target.value)}
                  className="w-full rounded-xl border p-2.5 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  value={content.brand.email}
                  onChange={(e) => handleBrandChange('email', e.target.value)}
                  className="w-full rounded-xl border p-2.5 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={content.brand.phone}
                  onChange={(e) => handleBrandChange('phone', e.target.value)}
                  className="w-full rounded-xl border p-2.5 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Primary Button Text</label>
                <input
                  type="text"
                  value={content.brand.primaryCtaText}
                  onChange={(e) => handleBrandChange('primaryCtaText', e.target.value)}
                  className="w-full rounded-xl border p-2.5 text-sm bg-white"
                />
              </div>
            </div>
          )}

          {activeTab === 'hero' && (
            <div className="space-y-6">
              <h4 className="font-bold text-sm text-[#123f38] border-b pb-2">Hero Banner Slides</h4>
              {content.hero.slides.map((slide, idx) => (
                <div key={slide.id || idx} className="p-4 rounded-2xl bg-[#f8f4e9] border border-[#dce7dc] space-y-3">
                  <p className="text-xs font-bold text-[#28745e]">Slide #{idx + 1}</p>
                  <div>
                    <label className="block text-xs font-bold mb-1">Eyebrow Badge</label>
                    <input
                      type="text"
                      value={slide.eyebrow}
                      onChange={(e) => handleHeroSlideChange(idx, 'eyebrow', e.target.value)}
                      className="w-full rounded-lg border p-2 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Heading Title</label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => handleHeroSlideChange(idx, 'title', e.target.value)}
                      className="w-full rounded-lg border p-2 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Description Copy</label>
                    <textarea
                      rows={2}
                      value={slide.copy}
                      onChange={(e) => handleHeroSlideChange(idx, 'copy', e.target.value)}
                      className="w-full rounded-lg border p-2 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Image URL</label>
                    <input
                      type="text"
                      value={slide.image}
                      onChange={(e) => handleHeroSlideChange(idx, 'image', e.target.value)}
                      className="w-full rounded-lg border p-2 text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-[#123f38] border-b pb-2">Impact Statistics</h4>
              {content.impactStats.map((st, idx) => (
                <div key={st.id || idx} className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#f8f4e9] border">
                  <div>
                    <label className="block text-xs font-bold mb-1">Metric Number</label>
                    <input
                      type="text"
                      value={st.stat}
                      onChange={(e) => handleStatChange(idx, 'stat', e.target.value)}
                      className="w-full rounded-lg border p-2 text-xs bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Label</label>
                    <input
                      type="text"
                      value={st.label}
                      onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                      className="w-full rounded-lg border p-2 text-xs bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'programs' && (
            <div className="space-y-6">
              <h4 className="font-bold text-sm text-[#123f38] border-b pb-2">Programs & Initiatives</h4>
              {content.programs.items.map((prog, idx) => (
                <div key={prog.id || idx} className="p-4 rounded-2xl bg-[#f8f4e9] border border-[#dce7dc] space-y-3">
                  <p className="text-xs font-bold text-[#28745e]">Card #{idx + 1}</p>
                  <div>
                    <label className="block text-xs font-bold mb-1">Title</label>
                    <input
                      type="text"
                      value={prog.title}
                      onChange={(e) => handleProgramChange(idx, 'title', e.target.value)}
                      className="w-full rounded-lg border p-2 text-xs bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={prog.description}
                      onChange={(e) => handleProgramChange(idx, 'description', e.target.value)}
                      className="w-full rounded-lg border p-2 text-xs bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-[#123f38] border-b pb-2">About Section</h4>
              <div>
                <label className="block text-xs font-bold mb-1">Main Title</label>
                <input
                  type="text"
                  value={content.about.title}
                  onChange={(e) => updateContent({ about: { ...content.about, title: e.target.value } })}
                  className="w-full rounded-xl border p-2.5 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Paragraph 1</label>
                <textarea
                  rows={3}
                  value={content.about.copyOne}
                  onChange={(e) => updateContent({ about: { ...content.about, copyOne: e.target.value } })}
                  className="w-full rounded-xl border p-2.5 text-sm bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#d9e1d7] bg-[#f8f4e9] p-4 flex items-center justify-between">
          <button
            onClick={resetContent}
            className="flex items-center gap-1.5 rounded-xl border border-red-300 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => {
              showToast('Dynamic site content updated live!');
              setIsAdminOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl bg-[#123f38] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#28745e] transition"
          >
            <Save className="w-4 h-4 text-[#f2ad3b]" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
