import React, { createContext, useContext, useState, useEffect } from 'react';
import { emptyContent } from '../data/initialContent';

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
    impactStats: Array.isArray(override.impactStats) ? override.impactStats : [],
    hero: {
      ...base.hero,
      ...(override.hero || {}),
      slides: Array.isArray(override.hero?.slides) ? override.hero.slides : [],
    },
    programs: {
      ...base.programs,
      ...(override.programs || {}),
      items: Array.isArray(override.programs?.items) ? override.programs.items : [],
    },
    gallery: {
      ...base.gallery,
      ...(override.gallery || {}),
      items: Array.isArray(override.gallery?.items) ? override.gallery.items : [],
    },
  };
}

function getPreloadedContent() {
  // Server-injected state from Blade (0ms instant!) if available
  try {
    const el = typeof document !== 'undefined' ? document.getElementById('server-initial-content') : null;
    if (el && el.textContent) {
      const data = JSON.parse(el.textContent);
      if (data && typeof data === 'object') {
        return safeMerge(emptyContent, data);
      }
    }
  } catch (e) {}

  return emptyContent;
}

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(getPreloadedContent);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // Purge any legacy stale 4MB localStorage cache from user browsers
    try {
      localStorage.removeItem('act_trust_content_cache');
      localStorage.removeItem('act_trust_blogs_cache');
    } catch (e) {}

    // Fetch live content from database API to ensure freshest data
    async function syncWithServer() {
      try {
        const res = await fetch(`/api/content?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          let serverData = json.data;
          if (serverData && serverData.content && typeof serverData.content === 'object') {
            serverData = serverData.content;
          }
          if (serverData && typeof serverData === 'object') {
            setContent(prev => safeMerge(prev, serverData));
          }
        }
      } catch (err) {
        console.warn('API content sync warning:', err);
      }
    }

    syncWithServer();

    // Cross-tab real-time sync: when admin saves, visitor/donor tabs update immediately
    let bc;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('act_content_channel');
        bc.onmessage = (event) => {
          if (event.data && event.data.type === 'CONTENT_UPDATED' && event.data.data) {
            setContent(prev => safeMerge(prev, event.data.data));
          }
        };
      }
    } catch (e) {}

    return () => {
      if (bc) bc.close();
    };
  }, []);

  const updateContent = async (newContent) => {
    const timestamp = new Date().toISOString();
    const updated = safeMerge(content, { ...newContent, updatedAt: timestamp });
    setContent(updated);

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
            if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
              const bc = new BroadcastChannel('act_content_channel');
              bc.postMessage({ type: 'CONTENT_UPDATED', data: json.data });
              bc.close();
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Laravel API content sync error:', err);
    }
  };

  const resetContent = async () => {
    setContent(emptyContent);
    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(emptyContent),
      });
    } catch (e) {
      console.error('Reset content error:', e);
    }
    showToast('Content reset to empty state');
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
        setContent,
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
