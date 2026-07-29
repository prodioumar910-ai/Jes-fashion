import React from 'react';
import { Crown, Phone, MapPin, Heart, Sparkles, Database } from 'lucide-react';

interface FooterProps {
  onOpenAdminModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminModal }) => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-neutral-950 text-amber-200/90 border-t border-amber-500/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-800">
          
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 flex items-center justify-center">
                <img
                  src="https://lh3.googleusercontent.com/d/1V8PJ5NcqlcZVrjCEy5id2vU0vCAn-Ivs"
                  alt="Logo Jes Fashion"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.src = "https://drive.google.com/thumbnail?id=1V8PJ5NcqlcZVrjCEy5id2vU0vCAn-Ivs&sz=w500";
                  }}
                  referrerPolicy="no-referrer"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <span className="text-xl font-serif font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5C0] via-[#BF953F] to-[#8C6211]">
                JES <span className="font-sans font-light text-amber-300">FASHION</span>
              </span>
            </div>
            <p className="text-xs text-amber-100/80 leading-relaxed font-medium">
              Maison de couture spécialisée dans la confection et la vente de robes de mariée d'exception sur-mesure à Badalabougou, Bamako (Mali).
            </p>
          </div>

          {/* Col 2: Navigation rapide (Boutons cliquables) */}
          <div className="space-y-3">
            <h4 className="text-xs font-serif font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5C0] via-[#BF953F] to-[#FCF6BA] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Accès Direct aux Sections</span>
            </h4>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <button
                onClick={() => scrollToSection('hero')}
                className="px-3.5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-300 hover:text-amber-100 shadow-md hover:scale-105 transition-all cursor-pointer text-[11px] uppercase tracking-wider flex items-center gap-1"
              >
                <span>✨ Accueil</span>
              </button>
              <button
                onClick={() => scrollToSection('confiance')}
                className="px-3.5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-300 hover:text-amber-100 shadow-md hover:scale-105 transition-all cursor-pointer text-[11px] uppercase tracking-wider flex items-center gap-1"
              >
                <span>💍 Nos Mariées</span>
              </button>
              <button
                onClick={() => scrollToSection('modeles')}
                className="px-3.5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-300 hover:text-amber-100 shadow-md hover:scale-105 transition-all cursor-pointer text-[11px] uppercase tracking-wider flex items-center gap-1"
              >
                <span>👗 Nos Modèles</span>
              </button>
              <button
                onClick={() => scrollToSection('reseaux')}
                className="px-3.5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-300 hover:text-amber-100 shadow-md hover:scale-105 transition-all cursor-pointer text-[11px] uppercase tracking-wider flex items-center gap-1"
              >
                <span>📱 Réseaux</span>
              </button>
              <button
                onClick={() => scrollToSection('localisation')}
                className="px-3.5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-300 hover:text-amber-100 shadow-md hover:scale-105 transition-all cursor-pointer text-[11px] uppercase tracking-wider flex items-center gap-1"
              >
                <span>📍 Localisation</span>
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="px-3.5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-300 hover:text-amber-100 shadow-md hover:scale-105 transition-all cursor-pointer text-[11px] uppercase tracking-wider flex items-center gap-1"
              >
                <span>❓ FAQ</span>
              </button>
            </div>
          </div>

          {/* Col 3: Collections */}
          <div>
            <h4 className="text-xs font-serif font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5C0] via-[#BF953F] to-[#FCF6BA] mb-4">
              Nos Lignes
            </h4>
            <ul className="space-y-2 text-xs font-medium text-amber-100/90">
              <li className="flex items-center gap-1.5"><Crown className="w-3 h-3 text-amber-400" /> Ligne 1 : Princesse & Volumineuses</li>
              <li className="flex items-center gap-1.5"><Crown className="w-3 h-3 text-amber-400" /> Ligne 2 : Coupes Sirènes & Perles</li>
              <li className="flex items-center gap-1.5"><Crown className="w-3 h-3 text-amber-400" /> Ligne 3 : Bohème Chic, Satin & Soie</li>
              <li className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-amber-400" /> Confection Sur-Mesure</li>
            </ul>
          </div>

          {/* Col 4: Contact & Adresse */}
          <div>
            <h4 className="text-xs font-serif font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5C0] via-[#BF953F] to-[#FCF6BA] mb-4">
              Contact & Boutique
            </h4>
            <div className="space-y-3 text-xs text-amber-100/90 font-medium">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-amber-200">Badalabougou, Bamako, Mali</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a href="https://wa.me/22372568975" className="hover:text-amber-300 text-amber-200 font-mono font-bold">
                  +223 72 56 89 75
                </a>
              </p>
              <div className="pt-2">
                <a
                  href="https://wa.me/22372568975?text=Bonjour%20Jes%20Fashion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block btn-gold-foil px-5 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-full shadow-lg text-black hover:scale-105 transition-transform"
                >
                  Message Direct WhatsApp
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & Database Admin Access */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-bold gap-4">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5C0] via-[#BF953F] to-[#8C6211] font-serif font-bold text-sm">
            © {currentYear} Jes Fashion • Tous droits réservés.
          </p>

          {/* Admin Database Access Button at bottom of site */}
          <button
            onClick={onOpenAdminModal}
            className="btn-gold-foil px-5 py-2.5 text-xs font-serif font-black uppercase tracking-wider rounded-full flex items-center gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer text-black"
          >
            <Database className="w-4 h-4 text-black" />
            <span>jesfashion</span>
          </button>

          <p className="flex items-center gap-1 text-amber-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Badalabougou, Bamako - Mali</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
