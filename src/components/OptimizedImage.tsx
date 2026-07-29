import React, { useState } from 'react';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  rawUrl: string;
  imageSize?: 'thumb' | 'catalog' | 'hero' | 'avatar';
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackAspect?: string;
}

export const getFastImageUrl = (url: string, size: 'thumb' | 'catalog' | 'hero' | 'avatar' = 'catalog') => {
  if (!url) return url;
  const match = url.match(/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    const fileId = match[1];
    let width = 800;
    if (size === 'thumb' || size === 'avatar') width = 400;
    if (size === 'hero') width = 1200;
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
  }
  return url;
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const fastUrl = getFastImageUrl(rawUrl, imageSize as 'thumb' | 'catalog' | 'hero' | 'avatar');

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    const match = rawUrl.match(/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      if (errorCount === 0) {
        const fallback1 = `https://lh3.googleusercontent.com/d/${fileId}`;
        if (img.src !== fallback1) {
          img.src = fallback1;
          setErrorCount(1);
        }
      } else if (errorCount === 1) {
        const fallback2 = `https://drive.google.com/uc?export=view&id=${fileId}`;
        if (img.src !== fallback2) {
          img.src = fallback2;
          setErrorCount(2);
        }
      }
    }
  };

  return (
    <div className={`relative overflow-hidden w-full h-full ${containerClassName}`}>
      {/* Animated Skeleton Shimmer Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-900 animate-pulse flex items-center justify-center z-10">
          <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin opacity-60" />
        </div>
      )}
      <img
        {...props}
        src={fastUrl}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        onLoad={() => setIsLoaded(true)}
        onError={handleImageError}
        referrerPolicy="no-referrer"
        className={`${className} transition-opacity duration-500 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
