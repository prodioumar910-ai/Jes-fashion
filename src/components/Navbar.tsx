import React, { useState } from 'react';
import { Crown, Phone, Menu, X, Sparkles, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  onOpenQuickOrder: () => void;
}

const LOGO_PRIMARY_URL = "https://drive.google.com/thumbnail?id=1V8PJ5NcqlcZVrjCEy5id2vU0vCAn-Ivs&sz=w500";
const LOGO_ALT_URL = "https://lh3.googleusercontent.com/d/1V8PJ5NcqlcZVrjCEy5id2vU0vCAn-Ivs";

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickOrder }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    if (img.src !== LOGO_ALT_URL) {
      img.src = LOGO_ALT_URL;
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/50 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="group-hover:scale-105 transition-transform flex-shrink-0 flex items-center justify-center">
              <img
                src={LOGO_PRIMARY_URL}
                alt="Jes Fashion Logo"
                onError={handleLogoError}
                referrerPolicy="no-referrer"
                className="h-14 sm:h-16 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl md:text-3xl font-serif font-black tracking-tighter text-black uppercase">
                  JES <span className="text-[#BF953F]">FASHION</span>
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[#BF953F] animate-pulse" />
              </div>
              <p className="text-[9px] sm:text-[10px] text-neutral-500 tracking-[0.25em] uppercase font-bold">
                Haute Couture • Badalabougou
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase font-bold tracking-[0.2em] text-black">
            <button 
              onClick={() => scrollToSection('hero')} 
              className="hover:text-[#BF953F] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BF953F] hover:after:w-full after:transition-all"
            >
              Collection
            </button>
            <button 
              onClick={() => scrollToSection('confiance')} 
              className="hover:text-[#BF953F] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BF953F] hover:after:w-full after:transition-all"
            >
              Mariées
            </button>
            <button 
              onClick={() => scrollToSection('modeles')} 
              className="hover:text-[#BF953F] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BF953F] hover:after:w-full after:transition-all"
            >
              Modèles
            </button>
            <button 
              onClick={() => scrollToSection('accessoires')} 
              className="hover:text-[#BF953F] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BF953F] hover:after:w-full after:transition-all text-amber-600 font-extrabold"
            >
              Accessoires
            </button>
            <button 
              onClick={() => scrollToSection('reseaux')} 
              className="hover:text-[#BF953F] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BF953F] hover:after:w-full after:transition-all"
            >
              Réseaux
            </button>
            <button 
              onClick={() => scrollToSection('localisation')} 
              className="hover:text-[#BF953F] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BF953F] hover:after:w-full after:transition-all"
            >
              Atelier
            </button>
            <button 
              onClick={() => scrollToSection('faq')} 
              className="hover:text-[#BF953F] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#BF953F] hover:after:w-full after:transition-all"
            >
              FAQ
            </button>
          </nav>

          {/* WhatsApp / Contact Header Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="https://wa.me/22372568975?text=Bonjour%20Jes%20Fashion%2C%20je%20souhaite%20des%20informations%20sur%20vos%20robes%20de%20mari%C3%A9e."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-neutral-800 bg-amber-50 border border-amber-300 hover:bg-amber-100 transition-all shadow-xs"
            >
              <img
                src="https://lh3.googleusercontent.com/d/1S2LxSpNum9j-KJ6gDMrY2O--pQZGpl5B"
                alt="WhatsApp Logo"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.src = "https://drive.google.com/thumbnail?id=1S2LxSpNum9j-KJ6gDMrY2O--pQZGpl5B&sz=w500";
                }}
                referrerPolicy="no-referrer"
                className="w-4 h-4 object-contain rounded-full"
              />
              <span>+223 72 56 89 75</span>
            </a>

            <button
              onClick={onOpenQuickOrder}
              className="btn-gold-foil px-5 py-2.5 text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Commander une Robe</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenQuickOrder}
              className="btn-gold-foil px-3 py-1.5 text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Commander</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-800 rounded-lg hover:bg-amber-50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-amber-200 px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <button
            onClick={() => scrollToSection('hero')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-neutral-800 hover:bg-amber-50 rounded-lg"
          >
            Accueil
          </button>
          <button
            onClick={() => scrollToSection('confiance')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-neutral-800 hover:bg-amber-50 rounded-lg"
          >
            Elles nous ont fait confiance
          </button>
          <button
            onClick={() => scrollToSection('modeles')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-neutral-800 hover:bg-amber-50 rounded-lg"
          >
            Nos Modèles (Catalogue)
          </button>
          <button
            onClick={() => scrollToSection('accessoires')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-amber-700 bg-amber-50 rounded-lg font-bold"
          >
            Accessoires de Mariée (3 Lignes)
          </button>
          <button
            onClick={() => scrollToSection('reseaux')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-neutral-800 hover:bg-amber-50 rounded-lg"
          >
            Réseaux Sociaux
          </button>
          <button
            onClick={() => scrollToSection('localisation')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-neutral-800 hover:bg-amber-50 rounded-lg"
          >
            Localisation (Badalabougou)
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="block w-full text-left px-3 py-2 text-base font-medium text-neutral-800 hover:bg-amber-50 rounded-lg"
          >
            FAQ
          </button>

          <div className="pt-2 border-t border-amber-100 flex flex-col gap-2">
            <a
              href="https://wa.me/22372568975?text=Bonjour%20Jes%20Fashion%2C%20je%20souhaite%20un%20rendez-vous."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-neutral-900 bg-amber-100 border border-amber-300"
            >
              <Phone className="w-4 h-4 text-amber-700" />
              <span>WhatsApp : +223 72 56 89 75</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
