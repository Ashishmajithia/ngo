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
  // 1. First priority: Server-injected state from Blade (0ms instant!)
  try {
    const el = typeof document !== 'undefined' ? document.getElementById('server-initial-content') : null;
    if (el && el.textContent) {
      const data = JSON.parse(el.textContent);
      if (data && typeof data === 'object') {
        return safeMerge(emptyContent, data);
      }
    }
  } catch (e) {}

  // 2. Second priority: localStorage cache for instant render on repeat visits
  try {
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem('act_trust_content_cache');
      if (cached) {
        const data = JSON.parse(cached);
        if (data && typeof data === 'object') {
          return safeMerge(emptyContent, data);
        }
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
    // Fetch live content from database API to ensure freshest data
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
              localStorage.setItem('act_trust_content_cache', JSON.stringify(serverData));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn('API content sync warning:', err);
      }
    }

    syncWithServer();
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
            localStorage.setItem('act_trust_content_cache', JSON.stringify(json.data));
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
