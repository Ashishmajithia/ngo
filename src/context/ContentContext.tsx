'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteContent } from '@/types/content';
import { defaultContent } from '@/data/initialContent';

interface ContentContextType {
  content: SiteContent;
  updateContent: (newContent: Partial<SiteContent>) => Promise<void>;
  resetContent: () => Promise<void>;
  submitDonation: (donationData: { amount: string; frequency: string; name: string; email: string; phone?: string }) => Promise<boolean>;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isDonateOpen: boolean;
  setIsDonateOpen: (open: boolean) => void;
  selectedGalleryImage: string | null;
  setSelectedGalleryImage: (image: string | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'act_charitable_trust_content_v1';

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch initial content from API database first, fallback to localStorage/defaultContent
  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch('/api/content');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setContent(json.data);
            return;
          }
        }
      } catch (err) {
        console.warn('API content fetch failed, using local backup:', err);
      }

      // Local storage fallback
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          setContent(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Local storage read error:', e);
      }
    }

    loadContent();

    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          setContent(JSON.parse(saved));
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateContent = async (newContent: Partial<SiteContent>) => {
    const updated = { ...content, ...newContent };
    setContent(updated);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }

    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('API content sync error:', err);
    }
  };

  const resetContent = async () => {
    setContent(defaultContent);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultContent),
      });
    } catch (e) {
      console.error('Reset content error:', e);
    }
    showToast('Reset to original default content!');
  };

  const submitDonation = async (donationData: { amount: string; frequency: string; name: string; email: string; phone?: string }): Promise<boolean> => {
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData),
      });
      return res.ok;
    } catch (e) {
      console.error('Submit donation error:', e);
      return false;
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <ContentContext.Provider
      value={{
        content,
        updateContent,
        resetContent,
        submitDonation,
        isAdminOpen,
        setIsAdminOpen,
        isDonateOpen,
        setIsDonateOpen,
        selectedGalleryImage,
        setSelectedGalleryImage,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const ctx = useContext(ContentContext);
  if (!ctx) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return ctx;
};
