import React, { useEffect } from 'react';
import { TRUSTED_CLIENTS } from '../data/products';
import { Heart } from 'lucide-react';
import { OptimizedImage, getFastImageUrl } from './OptimizedImage';

interface TrustSectionProps {
  onSelectGownRef: (gownRef: string, imageUrl?: string) => void;
}

export const TrustSection: React.FC<TrustSectionProps> = ({ onSelectGownRef }) => {
  // Preload all testimonial images on mount for zero-lag marquee animation
  useEffect(() => {
    TRUSTED_CLIENTS.forEach((client) => {
      const img = new Image();
      img.src = getFastImageUrl(client.imageUrl, 'catalog');
    });
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, rawUrl: string) => {
    const img = e.currentTarget;
    const match = rawUrl.match(/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      const fallback = `https://lh3.googleusercontent.com/d/${fileId}`;
      if (img.src !== fallback) {
        img.src = fallback;
      }
    }
  };

  // Duplicate array to ensure seamless continuous left-to-right infinite scrolling
  const marqueeItems = [...TRUSTED_CLIENTS, ...TRUSTED_CLIENTS, ...TRUSTED_CLIENTS];

  return (
    <section id="confiance" className="py-16 bg-white text-black overflow-hidden relative border-y border-neutral-200">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-black tracking-tight">
          Ils Nous Ont Fait Confiance
        </h2>
      </div>

      {/* Infinite Horizontal Marquee Scrolling Animation (Left to Right) */}
      <div className="relative w-full overflow-hidden py-2">
        
        {/* Left & Right Gradient Shadows */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none" />

        {/* Marquee Track moving Left to Right (animate-marquee-ltr) */}
        <div className="animate-marquee-ltr flex items-center gap-6">
          {marqueeItems.map((client, idx) => {
            return (
              <div
                key={`${client.id}-${idx}`}
                onClick={() => onSelectGownRef(client.gownRef, client.imageUrl)}
                className="w-72 sm:w-80 md:w-88 flex-shrink-0 bg-white rounded-2xl p-3 border border-neutral-200 shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col justify-between cursor-pointer"
              >
                {/* Image Container taking 100% full frame */}
                <div className="relative h-[480px] sm:h-[560px] md:h-[620px] rounded-xl overflow-hidden mb-3 bg-neutral-900">
                  <OptimizedImage
                    rawUrl={client.imageUrl}
                    imageSize="catalog"
                    alt={client.name}
                    loading={idx < 4 ? 'eager' : 'lazy'}
                    fetchPriority={idx < 4 ? 'high' : 'low'}
                    className="w-full h-full object-cover object-top sm:object-center group-hover:scale-105 transition-transform duration-700"
                    containerClassName="w-full h-full"
                  />
                  {/* Subtle hover overlay button */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 z-20">
                    <span className="btn-gold-foil px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-lg rounded-full text-black">
                      Voir le modèle
                    </span>
                  </div>
                </div>

                {/* Button: 'Voir le modèle' in Gold Foil */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectGownRef(client.gownRef, client.imageUrl);
                  }}
                  className="w-full btn-gold-foil py-2.5 px-3 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 rounded-full cursor-pointer shadow-md text-black"
                >
                  <Heart className="w-3.5 h-3.5 text-black fill-black" />
                  <span>Voir le modèle</span>
                </button>

              </div>
            );
          })}
        </div>

      </div>

    </section>
  );
};
