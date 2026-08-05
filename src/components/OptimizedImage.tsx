import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  rawUrl: string;
  imageSize?: 'thumb' | 'catalog' | 'hero' | 'avatar';
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackAspect?: string;
}

export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80&w=800';

// Global memory cache of successfully loaded images for zero-delay re-rendering
const LOADED_IMAGES_CACHE = new Set<string>();

export const getFastImageUrl = (url: string, size: 'thumb' | 'catalog' | 'hero' | 'avatar' | 'tiny' = 'catalog') => {
  if (!url) return FALLBACK_IMAGE;
  const match = url.match(/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    const fileId = match[1];
    // Use Google's high-speed edge CDN (lh3.googleusercontent.com)
    // -rw: WebP format (smaller size, same quality)
    // -v: Cache versioning
    if (size === 'tiny') {
      return `https://lh3.googleusercontent.com/d/${fileId}=w20-rw`;
    }
    if (size === 'thumb' || size === 'avatar') {
      return `https://lh3.googleusercontent.com/d/${fileId}=w250-rw`;
    }
    if (size === 'hero') {
      return `https://lh3.googleusercontent.com/d/${fileId}=w1000-rw`;
    }
    // Default catalog size optimized for performance (500px width is often sufficient for mobile/desktop cards)
    return `https://lh3.googleusercontent.com/d/${fileId}=w550-rw`;
  }
  return url;
};

// Preload helper to warm browser cache for critical images
export const preloadFastImage = (rawUrl: string, size: 'thumb' | 'catalog' | 'hero' | 'avatar' = 'catalog') => {
  const fastUrl = getFastImageUrl(rawUrl, size);
  if (fastUrl && !LOADED_IMAGES_CACHE.has(fastUrl)) {
    const img = new Image();
    img.src = fastUrl;
    img.onload = () => LOADED_IMAGES_CACHE.add(fastUrl);
  }
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  rawUrl,
  imageSize = 'catalog',
  alt,
  className = '',
  containerClassName = '',
  loading = 'lazy',
  fetchPriority = 'auto',
  ...props
}) => {
  const fastUrl = getFastImageUrl(rawUrl, imageSize as any);
  const tinyUrl = getFastImageUrl(rawUrl, 'tiny');
  const [isLoaded, setIsLoaded] = useState(() => LOADED_IMAGES_CACHE.has(fastUrl));
  const [errorCount, setErrorCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (LOADED_IMAGES_CACHE.has(fastUrl)) {
      setIsLoaded(true);
      return;
    }
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      LOADED_IMAGES_CACHE.add(fastUrl);
      setIsLoaded(true);
    }
  }, [fastUrl]);

  const handleLoad = () => {
    LOADED_IMAGES_CACHE.add(fastUrl);
    setIsLoaded(true);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    const match = rawUrl.match(/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      if (errorCount === 0) {
        // Fallback 1: High-quality JPEG without WebP compression
        const fallback1 = `https://lh3.googleusercontent.com/d/${fileId}=w600`;
        if (img.src !== fallback1) {
          img.src = fallback1;
          setErrorCount(1);
        }
      } else if (errorCount === 1) {
        // Fallback 2: Google Drive thumbnail endpoint
        const fallback2 = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
        if (img.src !== fallback2) {
          img.src = fallback2;
          setErrorCount(2);
        }
      } else {
        img.src = FALLBACK_IMAGE;
        setIsLoaded(true);
      }
    } else {
      img.src = FALLBACK_IMAGE;
      setIsLoaded(true);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-neutral-900 ${containerClassName}`}>
      {/* LQIP (Low Quality Image Placeholder) blurred preview - loaded instantly */}
      {!isLoaded && (
        <div className="absolute inset-0 z-0 overflow-hidden bg-neutral-900">
          <img 
            src={tinyUrl} 
            alt="" 
            className="w-full h-full object-cover blur-md scale-110 opacity-30 transition-opacity duration-1000"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Shimmer overlay for loading state feedback */}
      {!isLoaded && errorCount === 0 && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer z-10 pointer-events-none" />
      )}

      <img
        {...props}
        ref={imgRef}
        src={fastUrl}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        onLoad={handleLoad}
        onError={handleImageError}
        referrerPolicy="no-referrer"
        className={`${className} transition-all duration-700 ease-in-out ${
          isLoaded 
            ? 'opacity-100 blur-0 scale-100' 
            : 'opacity-0 blur-lg scale-105'
        }`}
      />
    </div>
  );
};

