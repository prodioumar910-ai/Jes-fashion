import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroCarousel } from './components/HeroCarousel';
import { TrustSection } from './components/TrustSection';
import { ModelsCatalog } from './components/ModelsCatalog';
import { AccessoriesSection } from './components/AccessoriesSection';
import { SocialsSection } from './components/SocialsSection';
import { LocationSection } from './components/LocationSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { OrderModal } from './components/OrderModal';
import { AdminModal } from './components/AdminModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { PRODUCTS } from './data/products';
import { Product } from './types';
import { getReservedProductIds, subscribeToDatabase, toggleProductReservationStatus, getCustomizedProducts } from './lib/database';

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [reservedProductIds, setReservedProductIds] = useState<string[]>(() => getReservedProductIds());

  useEffect(() => {
    // Synchronize with database state changes
    const unsubscribe = subscribeToDatabase(() => {
      setReservedProductIds(getReservedProductIds());
    });
    return () => unsubscribe();
  }, []);

  const handleReserveProduct = (productId: string) => {
    toggleProductReservationStatus(productId);
  };

  // Helper to trigger order modal directly
  const handleOpenQuickOrder = () => {
    const customProducts = getCustomizedProducts();
    // Default to the first flagship gown if none selected
    setSelectedProduct(customProducts[0] || PRODUCTS[0]);
  };

  const handleSelectGownByRef = (gownRef: string, imageUrl?: string) => {
    const cleanRef = gownRef.replace(/^Réf:\s*/i, '').trim();
    const customProducts = getCustomizedProducts();
    const found = customProducts.find((p) => p.refCode === cleanRef || p.refCode === gownRef) ||
                  PRODUCTS.find((p) => p.refCode === cleanRef || p.refCode === gownRef);

    if (found) {
      setSelectedProduct({
        ...found,
        imageUrl: imageUrl || found.imageUrl,
      });
    } else {
      setSelectedProduct({
        ...PRODUCTS[0],
        id: `trust-${cleanRef}`,
        title: gownRef.startsWith('Modèle') ? gownRef : `Modèle ${gownRef}`,
        refCode: cleanRef,
        imageUrl: imageUrl || PRODUCTS[0].imageUrl,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-amber-200 selection:text-amber-900 antialiased">
      
      {/* Main Content Sections */}
      <main>
        {/* Section 1: Hero Carousel (Image Full Frame + Gold 'Voir nos produits' Button) */}
        <HeroCarousel onOpenQuickOrder={handleOpenQuickOrder} />

        {/* Section 2: Ils Nous Ont Fait Confiance (Full Frame Images + Gold 'Voir le modèle' Button) */}
        <TrustSection onSelectGownRef={handleSelectGownByRef} />

        {/* Section 3: Nos Modèles (Full Frame Images, Details & Price in Modal on Click) */}
        <ModelsCatalog
          onSelectProduct={(p) => setSelectedProduct(p)}
          reservedProductIds={reservedProductIds}
        />

        {/* Section 4: Accessoires de Mariée (3 Lignes : Chaussures, Boucles d'Oreilles, Brosses Cheveux) */}
        <AccessoriesSection
          onSelectProduct={(p) => setSelectedProduct(p)}
        />

        {/* Section 5: Mes Réseaux Sociaux */}
        <SocialsSection />

        {/* Section 5: Ma Localisation */}
        <LocationSection />

        {/* Section 6: FAQ */}
        <FaqSection />
      </main>

      {/* Footer with Database Admin Access */}
      <Footer onOpenAdminModal={() => setIsAdminOpen(true)} />

      {/* Floating Action Button for Quick WhatsApp Chat */}
      <FloatingWhatsApp />

      {/* Order Modal Component */}
      <OrderModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        reservedProductIds={reservedProductIds}
        onReserveProduct={handleReserveProduct}
      />

      {/* Database & Admin Location Management Portal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

    </div>
  );
}


