import React from 'react';
import { Sparkles } from 'lucide-react';

const WA_CUSTOM_LOGO_PRIMARY = "https://lh3.googleusercontent.com/d/1S2LxSpNum9j-KJ6gDMrY2O--pQZGpl5B";
const WA_CUSTOM_LOGO_FALLBACK = "https://drive.google.com/thumbnail?id=1S2LxSpNum9j-KJ6gDMrY2O--pQZGpl5B&sz=w500";

export const FloatingWhatsApp: React.FC = () => {
  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    if (img.src !== WA_CUSTOM_LOGO_FALLBACK) {
      img.src = WA_CUSTOM_LOGO_FALLBACK;
    }
  };

  return (
    <a
      href="https://wa.me/22372568975?text=Bonjour%20Jes%20Fashion%2C%20je%20souhaite%20un%20rendez-vous%20en%20boutique."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 p-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 border-2 border-amber-300"
      aria-label="Contacter sur WhatsApp (+223 72 56 89 75)"
    >
      <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white p-0.5 flex items-center justify-center flex-shrink-0 shadow-md">
        <img
          src={WA_CUSTOM_LOGO_PRIMARY}
          alt="WhatsApp Jes Fashion"
          onError={handleLogoError}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain rounded-full"
        />
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-300 rounded-full animate-ping" />
      </div>
      <span className="hidden sm:inline-block text-xs font-bold font-sans pr-1">
        +223 72 56 89 75
      </span>
      <Sparkles className="w-3.5 h-3.5 text-amber-200 hidden sm:inline-block" />
    </a>
  );
};

