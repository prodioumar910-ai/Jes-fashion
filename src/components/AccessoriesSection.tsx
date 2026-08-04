import React, { useState, useEffect } from 'react';
import { AccessoryProduct, AccessoryLine } from '../data/accessories';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, Sparkles, Eye } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { getCustomizedAccessories, subscribeToDatabase } from '../lib/database';

interface AccessoriesSectionProps {
  onSelectProduct: (product: Product) => void;
}

export const AccessoriesSection: React.FC<AccessoriesSectionProps> = ({ onSelectProduct }) => {
  const [accessoryLines, setAccessoryLines] = useState<AccessoryLine[]>([]);

  useEffect(() => {
    setAccessoryLines(getCustomizedAccessories());
    const unsubscribe = subscribeToDatabase(() => {
      setAccessoryLines(getCustomizedAccessories());
    });
    return unsubscribe;
  }, []);

  // Active index for each line (1, 2, 3) for the 3D coverflow carousel
  const [activeIndices, setActiveIndices] = useState<{ [key: number]: number }>({
    1: 0,
    2: 0,
    3: 0,
  });

  const handleNext = (lineIndex: number, maxItems: number) => {
    setActiveIndices((prev) => ({
      ...prev,
      [lineIndex]: (prev[lineIndex] + 1) % maxItems,
    }));
  };

  const handlePrev = (lineIndex: number, maxItems: number) => {
    setActiveIndices((prev) => ({
      ...prev,
      [lineIndex]: (prev[lineIndex] - 1 + maxItems) % maxItems,
    }));
  };

  const handleSelectIndex = (lineIndex: number, itemIndex: number) => {
    setActiveIndices((prev) => ({
      ...prev,
      [lineIndex]: itemIndex,
    }));
  };

  // Convert AccessoryProduct to Product format for OrderModal
  const handleProductClick = (accItem: AccessoryProduct) => {
    const productFormatted: Product = {
      id: accItem.id,
      title: accItem.title,
      category: 'Princesse', // Default valid product category
      lineIndex: accItem.lineIndex,
      price: accItem.price,
      refCode: accItem.refCode,
      imageUrl: accItem.imageUrl,
      description: accItem.description,
      features: accItem.features,
      rating: accItem.rating,
      badge: accItem.badge,
    };
    onSelectProduct(productFormatted);
  };

  // Clean titles mapping without "Ligne 1 :", etc.
  const getCleanLineTitle = (lineIndex: number) => {
    switch (lineIndex) {
      case 1:
        return 'Les Chaussures';
      case 2:
        return "Boucles d'Oreilles";
      case 3:
        return 'Les Brosses pour Cheveux';
      default:
        return '';
    }
  };

  return (
    <section id="accessoires" className="py-16 sm:py-24 bg-white text-neutral-900 relative overflow-hidden border-t border-neutral-200">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-neutral-900 tracking-tight">
            Nos Accessoires
          </h2>
        </div>

        {/* 3 Accessory Lines */}
        <div className="space-y-16 sm:space-y-24">
          {accessoryLines.map((line) => {
            const lineIdx = line.lineIndex as 1 | 2 | 3;
            const items = line.items;
            const activeIdx = activeIndices[lineIdx] ?? 0;
            const currentActiveItem = items[activeIdx];

            return (
              <div key={line.lineIndex} className="relative">
                
                {/* Category Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl sm:text-3xl font-serif font-bold text-amber-950 uppercase tracking-wide">
                    {getCleanLineTitle(line.lineIndex)}
                  </h3>
                </div>

                {/* Active Item Focused Title (3D Figma Coverflow style) */}
                <div className="text-center h-10 mb-4 transition-all duration-300">
                  <p className="font-serif font-extrabold text-base sm:text-xl text-neutral-800 tracking-wide uppercase">
                    {currentActiveItem?.title}
                  </p>
                </div>

                {/* 3D CoverFlow Stage */}
                <div className="relative flex items-center justify-center min-h-[360px] sm:min-h-[440px] px-8 sm:px-16 py-4 perspective-[1200px] overflow-hidden select-none">
                  
                  {/* Previous Arrow Button */}
                  <button
                    onClick={() => handlePrev(lineIdx, items.length)}
                    className="absolute left-2 sm:left-6 z-40 w-11 h-11 rounded-full bg-white/95 border-2 border-amber-300 hover:border-amber-500 text-neutral-800 hover:text-amber-700 shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
                    aria-label="Précédent"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  {/* Cards 3D Stack */}
                  <div className="relative w-full max-w-4xl h-[340px] sm:h-[420px] flex items-center justify-center">
                    {items.map((item, itemIdx) => {
                      const offset = itemIdx - activeIdx;
                      const isActive = offset === 0;

                      // Compute 3D Cover Flow Transform styles
                      let transformStyle = '';
                      let opacityStyle = 1;
                      let zIndexStyle = 10;
                      let pointerEventsStyle: 'auto' | 'none' = 'auto';

                      if (offset === 0) {
                        // Center Active Card
                        transformStyle = 'translateX(0%) scale(1.08) rotateY(0deg)';
                        opacityStyle = 1;
                        zIndexStyle = 30;
                      } else if (offset === -1 || (activeIdx === 0 && itemIdx === items.length - 1 && items.length > 2)) {
                        // Left Card
                        const isWrappedLeft = activeIdx === 0 && itemIdx === items.length - 1;
                        const posOffset = isWrappedLeft ? -1 : offset;
                        transformStyle = `translateX(${posOffset * 55}%) scale(0.85) rotateY(25deg)`;
                        opacityStyle = 0.65;
                        zIndexStyle = 20;
                      } else if (offset === 1 || (activeIdx === items.length - 1 && itemIdx === 0 && items.length > 2)) {
                        // Right Card
                        const isWrappedRight = activeIdx === items.length - 1 && itemIdx === 0;
                        const posOffset = isWrappedRight ? 1 : offset;
                        transformStyle = `translateX(${posOffset * 55}%) scale(0.85) rotateY(-25deg)`;
                        opacityStyle = 0.65;
                        zIndexStyle = 20;
                      } else {
                        // Far Cards
                        transformStyle = `translateX(${offset * 75}%) scale(0.68) rotateY(${offset > 0 ? -35 : 35}deg)`;
                        opacityStyle = 0.25;
                        zIndexStyle = 10;
                        pointerEventsStyle = 'none';
                      }

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (isActive) {
                              handleProductClick(item);
                            } else {
                              handleSelectIndex(lineIdx, itemIdx);
                            }
                          }}
                          style={{
                            transform: transformStyle,
                            opacity: opacityStyle,
                            zIndex: zIndexStyle,
                            pointerEvents: pointerEventsStyle,
                            transition: 'all 500ms cubic-bezier(0.25, 1, 0.5, 1)',
                          }}
                          className={`absolute w-60 sm:w-72 h-[320px] sm:h-[390px] rounded-3xl overflow-hidden cursor-pointer shadow-xl border-2 transition-shadow bg-neutral-900 group ${
                            isActive
                              ? 'border-amber-400 shadow-2xl ring-4 ring-amber-400/20'
                              : 'border-neutral-300 hover:border-amber-300'
                          }`}
                        >
                          {/* Image */}
                          <div className="relative w-full h-full bg-neutral-950 overflow-hidden">
                            <OptimizedImage
                              rawUrl={item.imageUrl}
                              imageSize="catalog"
                              alt={item.title}
                              loading="eager"
                              fetchPriority="high"
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                              containerClassName="w-full h-full"
                            />

                            {/* Hover / Click indicator overlay for center card */}
                            {isActive && (
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-center">
                                <button className="w-full py-2.5 px-4 rounded-full bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 group-hover:bg-amber-300 transition-colors">
                                  <Eye className="w-4 h-4" />
                                  <span>Voir le prix & Commander</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Next Arrow Button */}
                  <button
                    onClick={() => handleNext(lineIdx, items.length)}
                    className="absolute right-2 sm:right-6 z-40 w-11 h-11 rounded-full bg-white/95 border-2 border-amber-300 hover:border-amber-500 text-neutral-800 hover:text-amber-700 shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
                    aria-label="Suivant"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Dots Pagination */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  {items.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => handleSelectIndex(lineIdx, dotIdx)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        dotIdx === activeIdx
                          ? 'w-7 bg-amber-500 shadow-sm'
                          : 'w-2.5 bg-neutral-300 hover:bg-neutral-400'
                      }`}
                      aria-label={`Aller au modèle ${dotIdx + 1}`}
                    />
                  ))}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

