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

export const getFastImageUrl = (url: string, size: 'thumb' | 'catalog' | 'hero' | 'avatar' = 'catalog') => {
  if (!url) return FALLBACK_IMAGE;
  const match = url.match(/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    const fileId = match[1];
    // Use Google's high-speed edge CDN (lh3.googleusercontent.com) with optimized dimension constraints
    if (size === 'thumb' || size === 'avatar') {
      return `https://lh3.googleusercontent.com/d/${fileId}=w400`;
    }
    if (size === 'hero') {
      return `https://lh3.googleusercontent.com/d/${fileId}=w1000`;
    }
    // Default catalog size (700px width is perfect for retina mobile & desktop cards)
    return `https://lh3.googleusercontent.com/d/${fileId}=w700`;
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
  loading = 'eager',
  fetchPriority = 'high',
  ...props
}) => {
  const fastUrl = getFastImageUrl(rawUrl, imageSize as 'thumb' | 'catalog' | 'hero' | 'avatar');
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
        // Fallback 1: Google Drive thumbnail endpoint
        const fallback1 = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
        if (img.src !== fallback1) {
          img.src = fallback1;
          setErrorCount(1);
        }
      } else if (errorCount === 1) {
        // Fallback 2: Raw Google CDN direct file link
        const fallback2 = `https://lh3.googleusercontent.com/d/${fileId}`;
        if (img.src !== fallback2) {
          img.src = fallback2;
          setErrorCount(2);
        }
      } else if (errorCount === 2) {
        // Fallback 3: UC export view
        const fallback3 = `https://drive.google.com/uc?export=view&id=${fileId}`;
        if (img.src !== fallback3) {
          img.src = fallback3;
          setErrorCount(3);
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
      {/* Animated Shimmer Skeleton loader while image is downloading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 animate-pulse flex flex-col items-center justify-center p-4 z-10">
          <div className="w-8 h-8 rounded-full border-2 border-[#BF953F] border-t-transparent animate-spin mb-2" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#BF953F]/90">Jes Fashion</span>
        </div>
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
        className={`${className} transition-opacity duration-300 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

