import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultContent } from '../data/initialContent';

// Key incremented to v3 to automatically flush any corrupt cached null states
export const LOCAL_CONTENT_KEY = 'act_charitable_trust_content_v3';
export const CONTENT_SYNC_EVENT = 'act_charitable_trust_content_updated_v3';

const ContentContext = createContext(undefined);

export function safeMerge(base, override) {
  if (!override || typeof override !== 'object') return base;
  return {
    ...base,
    ...override,
    brand: (override.brand && typeof override.brand === 'object') ? { ...base.brand, ...override.brand } : base.brand,
    about: (override.about && typeof override.about === 'object') ? { ...base.about, ...override.about } : base.about,
    approach: (override.approach && typeof override.approach === 'object') ? { ...base.approach, ...override.approach } : base.approach,
    support: (override.support && typeof override.support === 'object') ? { ...base.support, ...override.support } : base.support,
    payment: (override.payment && typeof override.payment === 'object') ? { ...base.payment, ...override.payment } : base.payment,
    impactStats: (Array.isArray(override.impactStats) && override.impactStats.length > 0) ? override.impactStats : base.impactStats,
    hero: {
      ...base.hero,
      ...(override.hero || {}),
      slides: (Array.isArray(override.hero?.slides) && override.hero.slides.length > 0) ? override.hero.slides : base.hero.slides,
    },
    programs: {
      ...base.programs,
      ...(override.programs || {}),
      items: (Array.isArray(override.programs?.items) && override.programs.items.length > 0) ? override.programs.items : base.programs.items,
    },
    gallery: {
      ...base.gallery,
      ...(override.gallery || {}),
      items: (Array.isArray(override.gallery?.items) && override.gallery.items.length > 0) ? override.gallery.items : base.gallery.items,
    },
  };
}

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(defaultContent);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // 1. Clean up old corrupted keys if present
    try {
      localStorage.removeItem('act_charitable_trust_content_v1');
      localStorage.removeItem('act_charitable_trust_content_v2');
    } catch {}

    // 2. Check local storage cache for v3
    try {
      const saved = localStorage.getItem(LOCAL_CONTENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setContent(prev => safeMerge(prev, parsed));
        }
      }
    } catch {}

    // 3. Fetch fresh content from Laravel backend API
    async function syncWithServer() {
      try {
        const res = await fetch(`/api/content?t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          let serverData = json.data;
          if (serverData && serverData.content && typeof serverData.content === 'object') {
            serverData = serverData.content;
          }
          if (serverData && typeof serverData === 'object') {
            setContent(prev => safeMerge(prev, serverData));
            try {
              localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(serverData));
            } catch {}
          }
        }
      } catch (err) {
        console.warn('API content sync warning:', err);
      }
    }

    syncWithServer();

    // 4. Listen for cross-tab or same-window content updates
    const handleStorageChange = (e) => {
      if (e.key === LOCAL_CONTENT_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed) {
            setContent(prev => safeMerge(prev, parsed));
          }
        } catch {}
      }
    };

    const handleCustomSync = (e) => {
      if (e.detail) {
        setContent(prev => safeMerge(prev, e.detail));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(CONTENT_SYNC_EVENT, handleCustomSync);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(CONTENT_SYNC_EVENT, handleCustomSync);
    };
  }, []);

  const updateContent = async (newContent) => {
    const timestamp = new Date().toISOString();
    const updated = safeMerge(content, { ...newContent, updatedAt: timestamp });
    setContent(updated);

    try {
      localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(CONTENT_SYNC_EVENT, { detail: updated }));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }

    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setContent(prev => safeMerge(prev, json.data));
          try {
            localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(json.data));
          } catch {}
        }
      }
    } catch (err) {
      console.error('Laravel API content sync error:', err);
    }
  };

  const resetContent = async () => {
    const timestamp = new Date().toISOString();
    const resetData = { ...defaultContent, updatedAt: timestamp };
    setContent(resetData);
    try {
      localStorage.removeItem(LOCAL_CONTENT_KEY);
      window.dispatchEvent(new CustomEvent(CONTENT_SYNC_EVENT, { detail: resetData }));
      await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(resetData),
      });
    } catch (e) {
      console.error('Reset content error:', e);
    }
    showToast('Reset to original default content!');
  };

  const submitDonation = async (donationData) => {
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(donationData),
      });
      return res.ok;
    } catch (e) {
      console.error('Submit donation error:', e);
      return false;
    }
  };

  const showToast = (msg) => {
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
