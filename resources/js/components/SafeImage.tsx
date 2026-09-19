'use client';

import React, { useState, useEffect, useMemo, forwardRef } from 'react';

// Normalize any image URL: trims whitespace, ensures leading slash on relative paths, protects data/http URIs
export const normalizeImageUrl = (raw?: string | null): string => {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
  onStatusChange?: (status: 'loading' | 'loaded' | 'error') => void;
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * SafeImage: Ultra-resilient image component
 * - Normalizes URL paths automatically (ensures proper /uploads/... routing)
 * - Auto-retries on 404/network glitches with cache-buster parameter to bypass stale browser caches
 * - Seamlessly falls back to fallbackSrc if original image fails
 * - Prevents raw broken-image alt text artifacts from distorting layouts
 */
export const SafeImage = forwardRef<HTMLImageElement, SafeImageProps>(
  (
    {
      src,
      alt,
      fallbackSrc,
      className = '',
      style,
      onLoad,
      onError,
      onStatusChange,
      fetchPriority,
      loading,
      ...rest
    },
    ref
  ) => {
    const cleanSrc = useMemo(() => normalizeImageUrl(src), [src]);
    const cleanFallback = useMemo(() => normalizeImageUrl(fallbackSrc), [fallbackSrc]);

    const [activeSrc, setActiveSrc] = useState<string>(() => cleanSrc || cleanFallback || '');
    const [retryStage, setRetryStage] = useState<number>(0); // 0 = initial, 1 = cache-busted, 2 = fallback
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

    useEffect(() => {
      const next = cleanSrc || cleanFallback || '';
      setActiveSrc(next);
      setRetryStage(0);
      setStatus(next ? 'loading' : 'error');
      onStatusChange?.(next ? 'loading' : 'error');
    }, [cleanSrc, cleanFallback, onStatusChange]);

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      // Stage 0 -> Stage 1: Auto-retry once with cache buster to break stale CDN/browser 404 cache
      if (retryStage === 0 && activeSrc && !activeSrc.startsWith('data:') && !activeSrc.startsWith('blob:')) {
        setRetryStage(1);
        const sep = activeSrc.includes('?') ? '&' : '?';
        const bustedSrc = `${activeSrc}${sep}cb=${Date.now()}`;
        setActiveSrc(bustedSrc);
        return;
      }

      // Stage 1 -> Stage 2: Try fallbackSrc if available and different
      if (retryStage <= 1 && cleanFallback && activeSrc !== cleanFallback) {
        setRetryStage(2);
        setActiveSrc(cleanFallback);
        return;
      }

      // Final failure
      setStatus('error');
      onStatusChange?.('error');
      onError?.(e);
    };

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setStatus('loaded');
      onStatusChange?.('loaded');
      onLoad?.(e);
    };

    if (!activeSrc) {
      return null;
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        src={activeSrc}
        alt={alt}
        loading={loading}
        // @ts-expect-error React 18 / DOM fetchPriority support
        fetchpriority={fetchPriority}
        onError={handleError}
        onLoad={handleLoad}
        className={`${className} ${status === 'error' ? 'invisible' : ''}`}
        style={{
          ...style,
          transition: style?.transition || 'opacity 0.25s ease-in-out',
        }}
        {...rest}
      />
    );
  }
);

SafeImage.displayName = 'SafeImage';
