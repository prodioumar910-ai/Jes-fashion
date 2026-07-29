import React from 'react';

const LOGO_PRIMARY_URL = "https://lh3.googleusercontent.com/d/1V8PJ5NcqlcZVrjCEy5id2vU0vCAn-Ivs";
const LOGO_ALT_URL = "https://drive.google.com/thumbnail?id=1V8PJ5NcqlcZVrjCEy5id2vU0vCAn-Ivs&sz=w500";

const WA_ICON_PRIMARY = "https://lh3.googleusercontent.com/d/1S2LxSpNum9j-KJ6gDMrY2O--pQZGpl5B";
const WA_ICON_ALT = "https://drive.google.com/thumbnail?id=1S2LxSpNum9j-KJ6gDMrY2O--pQZGpl5B&sz=w500";

const TIKTOK_ICON_PRIMARY = "https://lh3.googleusercontent.com/d/1kmu-CUCd4phEMCprAS_DrBTzGIs1wopU";
const TIKTOK_ICON_ALT = "https://drive.google.com/thumbnail?id=1kmu-CUCd4phEMCprAS_DrBTzGIs1wopU&sz=w500";

const SNAP_ICON_PRIMARY = "https://lh3.googleusercontent.com/d/17_cpbmS5rgQbjwm2Ba2Psph7LQxJXmBi";
const SNAP_ICON_ALT = "https://drive.google.com/thumbnail?id=17_cpbmS5rgQbjwm2Ba2Psph7LQxJXmBi&sz=w500";

export const SocialsSection: React.FC = () => {
  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    if (img.src !== LOGO_ALT_URL) {
      img.src = LOGO_ALT_URL;
    }
  };

  return (
    <section id="reseaux" className="py-12 bg-white text-neutral-900 relative overflow-hidden border-b border-neutral-200">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Site Logo (No contour) */}
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
        </div>

        {/* 3 Social Network Icons WITHOUT Contour aligned on the SAME horizontal line */}
        <div className="flex flex-row items-center justify-center gap-8 sm:gap-14 my-4">
          
          {/* 1. WHATSAPP ICON (Sans contour) */}
          <a
            href="https://wa.me/22372568975?text=Bonjour%20Jes%20Fashion%2C%20je%20vous%20contacte%20depuis%20votre%20site%20web."
            target="_blank"
            rel="noopener noreferrer"
            title="Contacter sur WhatsApp (+223 72 56 89 75)"
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
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
          </a>

          {/* 2. TIKTOK ICON (Sans contour) */}
          <a
            href="https://www.tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            title="TikTok @jes.fashion"
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
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
          </a>

          {/* 3. SNAPCHAT ICON (Sans contour) */}
          <a
            href="https://www.snapchat.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Snapchat @jes_fashion"
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
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
          </a>

        </div>

      </div>
    </section>
  );
};
