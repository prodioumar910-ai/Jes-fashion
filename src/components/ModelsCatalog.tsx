import React, { useRef, useEffect, useState } from 'react';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, Hand } from 'lucide-react';
import { ReservedBanner } from './ReservedBanner';
import { getCustomizedProducts, subscribeToDatabase } from '../lib/database';
import { OptimizedImage, getFastImageUrl } from './OptimizedImage';

interface ModelsCatalogProps {
  onSelectProduct: (product: Product) => void;
  reservedProductIds?: string[];
  products?: Product[];
}

// Convert Google Drive links to Google's ultra-fast thumbnail CDN (w800 for Catalog)
const getFastCatalogUrl = (url: string) => {
  if (!url) return url;
  const match = url.match(/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
  }
  return url;
};

export const ModelsCatalog: React.FC<ModelsCatalogProps> = ({
  onSelectProduct,
  reservedProductIds = [],
  products: initialProducts,
}) => {
  const [productList, setProductList] = useState<Product[]>(() => initialProducts || getCustomizedProducts());

  useEffect(() => {
    if (initialProducts) {
      setProductList(initialProducts);
    } else {
      setProductList(getCustomizedProducts());
    }
  }, [initialProducts]);

  useEffect(() => {
    const unsubscribe = subscribeToDatabase(() => {
      if (!initialProducts) {
        setProductList(getCustomizedProducts());
      }
    });
    return () => unsubscribe();
  }, [initialProducts]);

  // Split products into 3 catalog lines
  const line1Products = productList.filter((p) => p.lineIndex === 1);
  const line2Products = productList.filter((p) => p.lineIndex === 2);
  const line3Products = productList.filter((p) => p.lineIndex === 3);

  // Preload first 4 items of each row for instant visual render
  useEffect(() => {
    const criticalProducts = [
      ...line1Products.slice(0, 4),
      ...line2Products.slice(0, 4),
      ...line3Products.slice(0, 4),
    ];
    criticalProducts.forEach((p) => {
      const img = new Image();
      img.src = getFastImageUrl(p.imageUrl, 'catalog');
    });
  }, []);

  // Single product card taking 100% full image frame
  const renderProductCard = (product: Product, indexInRow: number) => {
    const isReserved = reservedProductIds.includes(product.id);

    return (
      <div
        key={product.id}
        onClick={() => onSelectProduct(product)}
        className="w-72 sm:w-80 md:w-88 flex-shrink-0 bg-white rounded-2xl border border-neutral-200 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col justify-between hover:-translate-y-1.5 relative"
      >
        {/* Tall full-frame image container for head-to-toe dress visibility */}
        <div className="relative h-[580px] sm:h-[680px] md:h-[780px] lg:h-[840px] overflow-hidden bg-neutral-950">
          <OptimizedImage
            rawUrl={product.imageUrl}
            imageSize="catalog"
            alt={product.title}
            loading={indexInRow < 3 ? 'eager' : 'lazy'}
            fetchPriority={indexInRow < 3 ? 'high' : 'low'}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            containerClassName="w-full h-full"
          />

          {/* RÉSERVEZ Golden Ribbon Banner if product is reserved */}
          {isReserved && <ReservedBanner />}

          {/* Subtle Gold Hover Button Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 z-30">
            <button className="btn-gold-foil px-6 py-3 text-xs font-black uppercase tracking-wider shadow-xl rounded-full text-black transform group-hover:scale-105 transition-transform">
              Voir & Commander
            </button>
          </div>
        </div>
      </div>
    );
  };


  // Helper component for manual horizontal line scrolling
  const ManualScrollRow: React.FC<{ title: string; products: Product[] }> = ({ title, products }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const scrollAmount = direction === 'left' ? -380 : 380;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };

    return (
      <div className="relative group">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-serif font-black text-black flex items-center gap-2 uppercase tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full bg-[#AA771C] inline-block" />
            <span>{title}</span>
          </h3>

          {/* Manual Scroll Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-neutral-100 border border-neutral-300 text-black hover:bg-[#BF953F] hover:text-black transition-colors cursor-pointer shadow-xs"
              aria-label="Défiler vers la gauche"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-neutral-100 border border-neutral-300 text-black hover:bg-[#BF953F] hover:text-black transition-colors cursor-pointer shadow-xs"
              aria-label="Défiler vers la droite"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Manual Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-6 overflow-x-auto scroll-smooth px-4 sm:px-8 py-3 no-scrollbar"
        >
          {products.map((p, idx) => (
            <React.Fragment key={p.id}>
              {renderProductCard(p, idx)}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section id="modeles" className="py-16 bg-white relative overflow-hidden border-b border-neutral-200">
      
      {/* Section Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-black tracking-tight">
          Nos Modèles
        </h2>
        <p className="mt-2 text-xs sm:text-sm font-medium text-neutral-600 flex items-center justify-center gap-1.5">
          <Hand className="w-4 h-4 text-[#BF953F]" />
          <span>Défilement manuel : glissez vers la gauche ou la droite pour explorer nos créations</span>
        </p>
      </div>

      {/* THREE MANUAL HORIZONTAL SCROLLING LINES */}
      <div className="space-y-12">
        <ManualScrollRow title="Robes Princesses" products={line1Products} />
        <ManualScrollRow title="Robes Sirènes Detachable" products={line2Products} />
        <ManualScrollRow title="Robes Sirènes Évasées" products={line3Products} />
      </div>

    </section>
  );
};

