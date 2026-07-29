import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, Phone, User, CreditCard, ShieldCheck, Calendar, Tag } from 'lucide-react';
import { ReservedBanner } from './ReservedBanner';
import { addBookingRecord, getCustomizedProducts, reserveProductDirectly, confirmBookingRecord } from '../lib/database';

interface OrderModalProps {
  product: Product | null;
  onClose: () => void;
  reservedProductIds?: string[];
  onReserveProduct?: (productId: string) => void;
}

// Helper to convert Google Drive links to Google CDN thumbnail
const getFastModalUrl = (url: string) => {
  if (!url) return url;
  const match = url.match(/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
  }
  return url;
};

export const OrderModal: React.FC<OrderModalProps> = ({
  product,
  onClose,
  reservedProductIds = [],
  onReserveProduct,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState<'location' | 'achat'>('location');
  const [rentalDate, setRentalDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'orange' | 'wave' | 'especes' | 'virement'>('orange');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Lock scroll when modal is open
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [product]);

  if (!product) return null;

  const customProducts = getCustomizedProducts();
  const foundCustom = customProducts.find((p) => p.id === product.id);
  const activeProduct: Product = {
    ...(foundCustom || product),
    // Preserve the exact clicked image URL passed in product
    imageUrl: product.imageUrl || (foundCustom ? foundCustom.imageUrl : product.imageUrl),
    title: product.title || (foundCustom ? foundCustom.title : product.title),
  };
  const isReserved = reservedProductIds.includes(activeProduct.id);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    if (activeProduct?.imageUrl) {
      const match = activeProduct.imageUrl.match(/d\/([a-zA-Z0-9_-]+)/) || activeProduct.imageUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const fileId = match[1];
        const lh3Fallback = `https://lh3.googleusercontent.com/d/${fileId}`;
        const ucFallback = `https://drive.google.com/uc?export=view&id=${fileId}`;
        if (img.src !== lh3Fallback && !img.src.includes('lh3.googleusercontent.com')) {
          img.src = lh3Fallback;
        } else if (img.src !== ucFallback && !img.src.includes('uc?export=view')) {
          img.src = ucFallback;
        }
      }
    }
  };

  const getPaymentLabel = (m: string) => {
    switch (m) {
      case 'orange': return 'Orange Money (+223)';
      case 'wave': return 'Wave Mali';
      case 'especes': return 'Espèces en Boutique (Badalabougou)';
      case 'virement': return 'Virement Bancaire';
      default: return 'Orange Money';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert('Veuillez renseigner votre nom complet et numéro de téléphone.');
      return;
    }

    if (serviceType === 'location' && !rentalDate) {
      alert('Veuillez choisir le jour de la location (1 journée).');
      return;
    }

    setIsSubmitting(true);

    // Record booking in persistent database
    const newRecord = addBookingRecord({
      customerName: fullName,
      phone: phone,
      productId: activeProduct.id,
      productTitle: activeProduct.title,
      productRef: activeProduct.refCode,
      productImageUrl: activeProduct.imageUrl,
      serviceType: serviceType,
      rentalDate: serviceType === 'location' ? rentalDate : undefined,
      paymentMethod: getPaymentLabel(paymentMethod),
    });

    // Auto-confirm and immediately activate RÉSERVEZ in database
    confirmBookingRecord(newRecord.id);
    reserveProductDirectly(activeProduct.id);

    if (onReserveProduct && activeProduct) {
      onReserveProduct(activeProduct.id);
    }

    const serviceLabel = serviceType === 'location' ? 'Location (1 journée)' : 'Achat (Sur-Mesure)';
    const priceText = serviceType === 'location'
      ? (activeProduct.rentalPrice || '150 000 FCFA')
      : (activeProduct.purchasePrice || activeProduct.price || '250 000 FCFA');

    // Reformulated, ultra-clean WhatsApp Message for +223 72 56 89 75
    const targetPhone = '22372568975';
    let message = `👑 *RÉSERVATION - JES FASHION BADALABOUGOU* 👑\n\n` +
      `Bonjour Jes Fashion Badalabougou,\n` +
      `Je souhaite réserver la tenue suivante :\n\n` +
      `👗 *Modèle :* ${activeProduct.title}\n` +
      `🏷️ *Référence :* ${activeProduct.refCode}\n` +
      `📌 *Type de Service :* ${serviceLabel}\n`;

    if (serviceType === 'location' && rentalDate) {
      message += `📅 *Date de Location (1 jour) :* ${rentalDate}\n`;
    }

    message += `💰 *Montant :* ${priceText}\n\n` +
      `👤 *INFORMATIONS CLIENTE :*\n` +
      `• *Nom & Prénom :* ${fullName}\n` +
      `• *Téléphone :* ${phone}\n` +
      `• *Moyen de Paiement :* ${getPaymentLabel(paymentMethod)}\n\n` +
      `📷 *Photo du Modèle :*\n${activeProduct.imageUrl}\n\n` +
      `Merci de me confirmer la disponibilité pour valider ma réservation. Merci d'avance !`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMsg}`;

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden my-4 animate-scaleUp text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button Top Right (No header bar) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/80 backdrop-blur-md hover:bg-neutral-800 text-white font-bold text-xs border border-neutral-700 transition-all cursor-pointer shadow-xl group"
          aria-label="Fermer"
          title="Fermer pour voir un autre produit"
        >
          <X className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
          <span>Fermer</span>
        </button>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto bg-neutral-900 text-white">
          
          {/* 1. CLEAN PRODUCT IMAGE DISPLAY WITH RÉSERVEZ OVERLAY IF RESERVED */}
          <div className="relative w-full h-[440px] sm:h-[560px] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            <img
              src={getFastModalUrl(activeProduct.imageUrl)}
              alt={activeProduct.title}
              decoding="async"
              onError={handleImageError}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain object-center"
            />

            {/* Display RÉSERVEZ banner overlay if reserved */}
            {isReserved && <ReservedBanner />}

            {/* Reference Badge Overlay on Image */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-white bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-neutral-800">
                {activeProduct.title} (Réf: {activeProduct.refCode})
              </span>
            </div>
          </div>

          {/* 2. LOCATION VS ACHAT BUTTONS IN HORIZONTAL ROW */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-amber-200/90">
              Option souhaitée
            </label>
            
            <div className="flex flex-row items-center gap-3">
              {/* LOCATION BUTTON */}
              <button
                type="button"
                onClick={() => setServiceType('location')}
                className={`flex-1 py-3 px-4 rounded-xl font-serif font-black text-xs sm:text-sm transition-all border cursor-pointer ${
                  serviceType === 'location'
                    ? 'btn-gold-foil text-black shadow-md border-amber-400 scale-[1.02]'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                }`}
              >
                Location (1 jour)
              </button>

              {/* ACHAT BUTTON */}
              <button
                type="button"
                onClick={() => setServiceType('achat')}
                className={`flex-1 py-3 px-4 rounded-xl font-serif font-black text-xs sm:text-sm transition-all border cursor-pointer ${
                  serviceType === 'achat'
                    ? 'btn-gold-foil text-black shadow-md border-amber-400 scale-[1.02]'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                }`}
              >
                Achat (Sur-Mesure)
              </button>
            </div>

            {/* PRIX DU PRODUIT SELECTIONNE AFFICHE JUSTE EN DESSOUS DU BOUTON LOCATION */}
            <div className="mt-2.5 p-2.5 sm:p-3 bg-neutral-950/90 border border-amber-500/30 rounded-xl text-center space-y-0.5 shadow-lg animate-fadeIn">
              <span className="text-[10px] sm:text-xs uppercase tracking-widest font-extrabold text-amber-300 flex items-center justify-center gap-1">
                <Tag className="w-3 h-3 text-amber-400" />
                <span>Prix : {serviceType === 'location' ? 'Location (1 jour)' : "Achat Sur-Mesure"}</span>
              </span>
              <div className="text-base sm:text-lg font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5C0] via-[#BF953F] to-[#FCF6BA]">
                {serviceType === 'location'
                  ? (activeProduct.rentalPrice || '150 000 FCFA')
                  : (activeProduct.purchasePrice || activeProduct.price || '250 000 FCFA')}
              </div>
            </div>
          </div>

          {/* 3. ORDER FORM: Calendar (above), Nom & Prénom, Téléphone, Moyen de Paiement */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-neutral-800">
            
            {/* CALENDAR DATE SELECTOR FOR RENTAL (1 DAY) - PLACED ABOVE NOM ET PRENOM & TELEPHONE */}
            {serviceType === 'location' && (
              <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-amber-500/30 space-y-2 animate-fadeIn">
                <label className="block text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Choisir le jour de la location (1 journée) *</span>
                </label>
                <input
                  type="date"
                  required={serviceType === 'location'}
                  min={new Date().toISOString().split('T')[0]}
                  value={rentalDate}
                  onChange={(e) => setRentalDate(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-medium cursor-pointer"
                />
                <p className="text-[11px] text-neutral-400 font-medium">
                  La durée de location standard est de 24h (1 journée d'événement).
                </p>
              </div>
            )}

            {/* Nom & Prénom */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Nom & Prénom *</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Aïcha Maïga"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>

            {/* Numéro de téléphone */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Numéro de téléphone *</span>
              </label>
              <input
                type="tel"
                required
                placeholder="Ex: +223 75 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>

            {/* Moyen de paiement */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Moyen de paiement</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-medium cursor-pointer"
              >
                <option value="orange">Orange Money (+223)</option>
                <option value="wave">Wave Mali</option>
                <option value="especes">Espèces en Boutique (Badalabougou)</option>
                <option value="virement">Virement Bancaire</option>
              </select>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Transmission directe sur le WhatsApp (+223 72 56 89 75) de Jes Fashion</span>
            </div>

            {/* Action Submit Button & Fermer Button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn-gold-foil py-3.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 shadow-lg cursor-pointer rounded-full transition-transform hover:scale-[1.01] text-black"
              >
                <img
                  src="https://lh3.googleusercontent.com/d/1S2LxSpNum9j-KJ6gDMrY2O--pQZGpl5B"
                  alt="WhatsApp Logo"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.src = "https://drive.google.com/thumbnail?id=1S2LxSpNum9j-KJ6gDMrY2O--pQZGpl5B&sz=w500";
                  }}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 object-contain rounded-full"
                />
                <span>Envoyer la demande sur WhatsApp</span>
              </button>

              {/* Secondary Fermer button */}
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs border border-neutral-700 transition-colors cursor-pointer text-center"
              >
                Fermer
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
