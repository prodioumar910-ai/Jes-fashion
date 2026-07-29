import React, { useState, useEffect } from 'react';
import { HERO_SLIDES } from '../data/products';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface HeroCarouselProps {
  onOpenQuickOrder: () => void;
}

// Convert Google Drive links to Google's ultra-fast thumbnail CDN (w1200 for Hero)
const getFastHeroUrl = (url: string) => {
  if (!url) return url;
  const match = url.match(/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
  }
  return url;
};

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onOpenQuickOrder }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Preload all 5 hero images instantly on mount for zero-lag slide transitions
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = getFastHeroUrl(slide.imageUrl);
    });
  }, []);

  // Auto-rotate every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const scrollToModels = () => {
    const el = document.getElementById('modeles');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  return (
    <section id="hero" className="relative w-full bg-black overflow-hidden border-0 p-0 m-0">
      
      {/* Full frame image slider - Optimal responsive height, edge-to-edge */}
      <div className="relative w-full overflow-hidden min-h-[600px] sm:min-h-[720px] md:min-h-[820px] h-[80vh] sm:h-[85vh] md:h-[88vh] max-h-[920px]">
        
        {/* Background Images Slider - Images take 100% full frame without borders */}
        {HERO_SLIDES.map((slide, index) => {
          const fastUrl = getFastHeroUrl(slide.imageUrl);
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={fastUrl}
                alt={slide.title}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                onError={(e) => handleImageError(e, slide.imageUrl)}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center sm:object-top transition-transform duration-10000 ease-linear"
              />
            </div>
          );
        })}

        {/* Top-Left Pure Round Logo for Section 1 */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
          <img
            src="https://drive.google.com/thumbnail?id=1V8PJ5NcqlcZVrjCEy5id2vU0vCAn-Ivs&sz=w500"
            alt="Logo Jes Fashion"
            onError={(e) => {
              const img = e.currentTarget;
              img.src = "https://lh3.googleusercontent.com/d/1V8PJ5NcqlcZVrjCEy5id2vU0vCAn-Ivs";
            }}
            referrerPolicy="no-referrer"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shadow-lg"
          />
        </div>

        {/* Action Button ONLY: 'Voir nos produits' positioned at bottom-left */}
        <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 z-20">
          <button
            onClick={scrollToModels}
            className="btn-gold-foil px-6 py-3 text-xs sm:text-sm font-black flex items-center gap-2.5 cursor-pointer transition-transform hover:scale-105 shadow-2xl rounded-full text-black"
          >
            <span>Voir nos produits</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Prev / Next Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full bg-white/85 text-black hover:bg-[#BF953F] hover:text-black shadow-xl border border-neutral-200 transition-all cursor-pointer hover:scale-110"
          aria-label="Image précédente"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full bg-white/85 text-black hover:bg-[#BF953F] hover:text-black shadow-xl border border-neutral-200 transition-all cursor-pointer hover:scale-110"
          aria-label="Image suivante"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

      </div>

    </section>
  );
};

