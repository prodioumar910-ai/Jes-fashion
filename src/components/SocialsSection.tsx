import React from 'react';
import { Instagram, MapPin, MessageCircle, Navigation } from 'lucide-react';

const LOGO_PRIMARY_URL = "https://drive.google.com/thumbnail?id=1V8PJ5NcqlcZVrjCEy5id2vU0vCAn-Ivs&sz=w500";
const LOGO_ALT_URL = "https://lh3.googleusercontent.com/d/1V8PJ5NcqlcZVrjCEy5id2vU0vCAn-Ivs";

const WA_ICON_PRIMARY = "https://drive.google.com/thumbnail?id=1S2LxSpNum9j-KJ6gDMrY2O--pQZGpl5B&sz=w500";
const WA_ICON_ALT = "https://lh3.googleusercontent.com/d/1S2LxSpNum9j-KJ6gDMrY2O--pQZGpl5B";

const TIKTOK_ICON_PRIMARY = "https://drive.google.com/thumbnail?id=1kmu-CUCd4phEMCprAS_DrBTzGIs1wopU&sz=w500";
const TIKTOK_ICON_ALT = "https://lh3.googleusercontent.com/d/1kmu-CUCd4phEMCprAS_DrBTzGIs1wopU";

const SNAP_ICON_PRIMARY = "https://drive.google.com/thumbnail?id=17_cpbmS5rgQbjwm2Ba2Psph7LQxJXmBi&sz=w500";
const SNAP_ICON_ALT = "https://lh3.googleusercontent.com/d/17_cpbmS5rgQbjwm2Ba2Psph7LQxJXmBi";

export const SocialsSection: React.FC = () => {
  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    if (img.src !== LOGO_ALT_URL) {
      img.src = LOGO_ALT_URL;
    }
  };

  const socialLinks = [
    {
      name: 'TikTok',
      handle: '@jesfashion',
      url: 'https://www.tiktok.com/@jesfashion?_r=1&_t=ZS-98gkMCH5oxM',
      iconType: 'image',
      iconPrimary: TIKTOK_ICON_PRIMARY,
      iconAlt: TIKTOK_ICON_ALT,
      bgColor: 'bg-black text-white hover:bg-neutral-800',
      borderColor: 'border-neutral-900',
    },
    {
      name: 'Instagram',
      handle: '@jess_fashion03',
      url: 'https://www.instagram.com/jess_fashion03?igsh=N2txd3hreG1lYjVy',
      iconType: 'lucide',
      lucideIcon: Instagram,
      gradient: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white',
      bgColor: 'bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white hover:opacity-95',
      borderColor: 'border-pink-500',
    },
    {
      name: 'WhatsApp',
      handle: '+223 72 56 89 75',
      url: 'https://wa.me/22372568975?text=Bonjour%20Jes%20Fashion%2C%20je%20vous%20contacte%20depuis%20votre%20site%20web.',
      iconType: 'image',
      iconPrimary: WA_ICON_PRIMARY,
      iconAlt: WA_ICON_ALT,
      bgColor: 'bg-emerald-600 text-white hover:bg-emerald-700',
      borderColor: 'border-emerald-600',
    },
    {
      name: 'Snapchat',
      handle: '@jess_fashion03',
      url: 'https://www.snapchat.com/add/jess_fashion03',
      iconType: 'image',
      iconPrimary: SNAP_ICON_PRIMARY,
      iconAlt: SNAP_ICON_ALT,
      bgColor: 'bg-amber-400 text-black hover:bg-amber-300 font-bold',
      borderColor: 'border-amber-400',
    },
    {
      name: 'Google Maps',
      handle: 'Badalabougou, Bamako',
      url: 'https://www.google.com/maps/search/?api=1&query=Badalabougou+Bamako+Mali',
      iconType: 'lucide',
      lucideIcon: Navigation,
      bgColor: 'bg-neutral-900 text-amber-300 hover:bg-neutral-800',
      borderColor: 'border-amber-500/50',
    },
  ];

  return (
    <section id="reseaux" className="py-12 bg-white text-neutral-900 relative overflow-hidden border-b border-neutral-200">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Site Logo */}
        <div className="text-center max-w-2xl mx-auto mb-6 flex flex-col items-center">
          <div className="mb-2 flex items-center justify-center">
            <img
              src={LOGO_PRIMARY_URL}
              alt="Logo Jes Fashion"
              onError={handleLogoError}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-md"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-black">
            Contact & Réseaux Sociaux
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-neutral-600 font-medium">
            Suivez la maison Jes Fashion sur nos comptes officiels
          </p>
        </div>

        {/* High-quality Social Network Icons aligned on the same line */}
        <div className="flex flex-row items-center justify-center gap-6 sm:gap-12 my-6 flex-wrap">
          
          {/* 1. WHATSAPP */}
          <a
            href="https://wa.me/22372568975?text=Bonjour%20Jes%20Fashion%2C%20je%20vous%20contacte%20depuis%20votre%20site%20web."
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp (+223 72 56 89 75)"
            aria-label="WhatsApp Jes Fashion"
            className="group flex flex-col items-center gap-1.5 transition-transform hover:scale-110"
          >
            <img
              src={WA_ICON_PRIMARY}
              alt="WhatsApp"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== WA_ICON_ALT) img.src = WA_ICON_ALT;
              }}
              referrerPolicy="no-referrer"
              className="w-11 h-11 sm:w-14 sm:h-14 object-contain drop-shadow-md"
            />
            <span className="text-[10px] sm:text-xs font-bold text-neutral-700 group-hover:text-emerald-600 transition-colors">WhatsApp</span>
          </a>

          {/* 2. TIKTOK */}
          <a
            href="https://www.tiktok.com/@jesfashion?_r=1&_t=ZS-98gkMCH5oxM"
            target="_blank"
            rel="noopener noreferrer"
            title="TikTok @jesfashion"
            aria-label="TikTok Jes Fashion"
            className="group flex flex-col items-center gap-1.5 transition-transform hover:scale-110"
          >
            <img
              src={TIKTOK_ICON_PRIMARY}
              alt="TikTok"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== TIKTOK_ICON_ALT) img.src = TIKTOK_ICON_ALT;
              }}
              referrerPolicy="no-referrer"
              className="w-11 h-11 sm:w-14 sm:h-14 object-contain drop-shadow-md"
            />
            <span className="text-[10px] sm:text-xs font-bold text-neutral-700 group-hover:text-black transition-colors">TikTok</span>
          </a>

          {/* 3. INSTAGRAM */}
          <a
            href="https://www.instagram.com/jess_fashion03?igsh=N2txd3hreG1lYjVy"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram @jess_fashion03"
            aria-label="Instagram Jes Fashion"
            className="group flex flex-col items-center gap-1.5 transition-transform hover:scale-110"
          >
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Instagram className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600" />
              </div>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-neutral-700 group-hover:text-pink-600 transition-colors">Instagram</span>
          </a>

          {/* 4. SNAPCHAT */}
          <a
            href="https://www.snapchat.com/add/jess_fashion03"
            target="_blank"
            rel="noopener noreferrer"
            title="Snapchat @jess_fashion03"
            aria-label="Snapchat Jes Fashion"
            className="group flex flex-col items-center gap-1.5 transition-transform hover:scale-110"
          >
            <img
              src={SNAP_ICON_PRIMARY}
              alt="Snapchat"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== SNAP_ICON_ALT) img.src = SNAP_ICON_ALT;
              }}
              referrerPolicy="no-referrer"
              className="w-11 h-11 sm:w-14 sm:h-14 object-contain drop-shadow-md"
            />
            <span className="text-[10px] sm:text-xs font-bold text-neutral-700 group-hover:text-amber-500 transition-colors">Snapchat</span>
          </a>

        </div>

      </div>
    </section>
  );
};
