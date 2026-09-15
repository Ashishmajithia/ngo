'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteContent } from '@/types/content';
import { defaultContent } from '@/data/initialContent';

export const LOCAL_CONTENT_KEY = 'act_charitable_trust_content_v1';
export const CONTENT_SYNC_EVENT = 'act_charitable_trust_content_updated';

interface ContentContextType {
  content: SiteContent;
  updateContent: (newContent: Partial<SiteContent>) => Promise<void>;
  resetContent: () => Promise<void>;
  submitDonation: (donationData: {
    amount: string;
    frequency: string;
    name: string;
    email: string;
    phone?: string;
    utr?: string;
    paymentMethod?: string;
  }) => Promise<boolean>;
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

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Immediately hydrate from localStorage for instant, zero-flicker render
    let localData: SiteContent | null = null;
    try {
      const saved = localStorage.getItem(LOCAL_CONTENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.brand) {
          localData = parsed;
          setContent(parsed);
        }
      }
    } catch (e) {
      console.warn('Initial localStorage read error:', e);
    }

    // 2. Fetch fresh content from API route with cache busting
    async function syncWithServer() {
      try {
        const res = await fetch(`/api/content?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const serverData: SiteContent = json.data;

            // Re-read latest localStorage in case user made edits during fetch
            let currentLocal: SiteContent | null = localData;
            try {
              const freshSaved = localStorage.getItem(LOCAL_CONTENT_KEY);
              if (freshSaved) currentLocal = JSON.parse(freshSaved);
            } catch {}

            const serverTime = serverData.updatedAt ? new Date(serverData.updatedAt).getTime() : 0;
            const localTime = currentLocal?.updatedAt ? new Date(currentLocal.updatedAt).getTime() : 0;

            if (serverTime > localTime) {
              // Server has newer content
              setContent(serverData);
              try {
                localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(serverData));
              } catch {}
            } else if (localTime > serverTime && currentLocal) {
              // Local changes are newer! Retain local edits and sync to server in background
              setContent(currentLocal);
              fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentLocal),
              }).catch(() => {});
            }
          }
        }
      } catch (err) {
        console.warn('API content sync warning:', err);
      }
    }

    syncWithServer();

    // 3. Listen for cross-tab or same-window content updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_CONTENT_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.brand) {
            setContent(parsed);
          }
        } catch {}
      }
    };

    const handleCustomSync = (e: Event) => {
      const customEvt = e as CustomEvent<SiteContent>;
      if (customEvt.detail && customEvt.detail.brand) {
        setContent(customEvt.detail);
      } else {
        try {
          const saved = localStorage.getItem(LOCAL_CONTENT_KEY);
          if (saved) setContent(JSON.parse(saved));
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(CONTENT_SYNC_EVENT, handleCustomSync);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(CONTENT_SYNC_EVENT, handleCustomSync);
    };
  }, []);

  const updateContent = async (newContent: Partial<SiteContent>) => {
    const timestamp = new Date().toISOString();
    const updated: SiteContent = { ...content, ...newContent, updatedAt: timestamp };
    setContent(updated);

    try {
      localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(CONTENT_SYNC_EVENT, { detail: updated }));
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
    const timestamp = new Date().toISOString();
    const resetData: SiteContent = { ...defaultContent, updatedAt: timestamp };
    setContent(resetData);
    try {
      localStorage.removeItem(LOCAL_CONTENT_KEY);
      window.dispatchEvent(new CustomEvent(CONTENT_SYNC_EVENT, { detail: resetData }));
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetData),
      });
    } catch (e) {
      console.error('Reset content error:', e);
    }
    showToast('Reset to original default content!');
  };

  const submitDonation = async (donationData: {
    amount: string;
    frequency: string;
    name: string;
    email: string;
    phone?: string;
    utr?: string;
    paymentMethod?: string;
  }): Promise<boolean> => {
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
