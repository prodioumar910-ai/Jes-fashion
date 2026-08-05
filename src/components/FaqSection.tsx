import React, { useState, useEffect } from 'react';
import { FAQ_ITEMS } from '../data/products';
import { ChevronDown, HelpCircle, MessageCircle, Phone } from 'lucide-react';
import { OptimizedImage, preloadFastImage } from './OptimizedImage';

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-reservation');

  // Preload FAQ images instantly for zero-latency response when opening an accordion
  useEffect(() => {
    FAQ_ITEMS.forEach((faq) => {
      if (faq.imageUrl) {
        preloadFastImage(faq.imageUrl, 'thumb');
      }
    });
  }, []);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-16 bg-white text-black relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-black">
            Foire Aux Questions (FAQ)
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-neutral-200 rounded-2xl overflow-hidden transition-all duration-300 bg-white shadow-xs"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-black flex-shrink-0" />
                    <span className="text-base font-serif font-bold text-black">
                      {faq.question}
                    </span>
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-black transition-transform duration-300 flex-shrink-0 ${
                    isOpen ? 'rotate-180 bg-neutral-300' : ''
                  }`}>
                    <ChevronDown className="w-5 h-5 text-black" />
                  </div>
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-6 bg-white border-t border-neutral-200">
                    
                    {/* LUXURY FLYER CARD STYLE FOR FAQ ANSWER */}
                    <div className="bg-[#FAF8F5] border-2 border-amber-200/90 rounded-3xl p-5 sm:p-8 shadow-md relative overflow-hidden text-center text-neutral-900">
                      
                      {/* Decorative Gold Leaf Top Right */}
                      <svg className="absolute top-2 right-2 w-16 h-16 sm:w-20 sm:h-20 text-amber-400/30 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M50 0 C60 25, 75 40, 100 50 C75 60, 60 75, 50 100 C40 75, 25 60, 0 50 C25 40, 40 25, 50 0 Z" />
                      </svg>

                      {/* Header 1: Brand Name */}
                      <h3 className="font-serif font-black tracking-[0.25em] text-lg sm:text-2xl text-amber-950 uppercase mb-1">
                        {faq.headerTitle || "JES FASHION"}
                      </h3>

                      {/* Header 2: Subtitle / Title */}
                      <p className="font-serif font-bold text-xs sm:text-base text-neutral-800 uppercase tracking-wide max-w-lg mx-auto mb-3 px-2">
                        {faq.subTitle || faq.question}
                      </p>

                      {/* Center Arch Dress Image (Non-clickable showcase) */}
                      {faq.imageUrl && (
                        <div className="relative w-48 sm:w-56 h-64 sm:h-72 mx-auto rounded-t-full rounded-b-2xl overflow-hidden shadow-xl border-2 border-amber-300 relative bg-neutral-950 pointer-events-none select-none mb-4">
                          <OptimizedImage
                            rawUrl={faq.imageUrl}
                            imageSize="thumb"
                            alt="Illustration Jes Fashion"
                            className="w-full h-full object-cover object-top pointer-events-none"
                            containerClassName="w-full h-full pointer-events-none"
                          />
                          
                          {/* Gold JF Watermark Crest */}
                          <div className="absolute top-2.5 right-2.5 bg-white/95 rounded-full px-2 py-1 shadow-md border border-amber-300 pointer-events-none z-10 flex items-center gap-1">
                            <span className="text-[10px] font-black font-serif text-amber-900 tracking-tighter">JF</span>
                            <span className="text-[9px] font-bold text-neutral-700">Jes Fashion</span>
                          </div>
                        </div>
                      )}

                      {/* Clickable Phone / WhatsApp Badge between image and response (For all questions except Question 1) */}
                      {faq.id !== 'faq-reservation' && (
                        <div className="mb-4">
                          <a
                            href={`https://wa.me/22372568975?text=${encodeURIComponent(
                              faq.whatsappMessage ||
                              `Bonjour Jes Fashion,\n\nJe souhaite passer commande ou avoir des informations concernant :\n"${faq.question}"\n\nMerci !`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-mono font-black text-amber-950 bg-amber-100 hover:bg-emerald-600 hover:text-white px-4 py-1.5 rounded-full border border-amber-300 hover:border-emerald-500 shadow-sm transition-all hover:scale-105 cursor-pointer group"
                            title="Cliquer pour commander directement sur WhatsApp"
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-800 group-hover:text-white transition-colors" />
                            <span>{faq.phone || "+223 72 56 89 75"}</span>
                            <span className="text-[10px] font-sans font-bold bg-emerald-600 text-white group-hover:bg-white group-hover:text-emerald-700 px-2 py-0.5 rounded-full transition-colors">
                              WhatsApp 💬
                            </span>
                          </a>
                        </div>
                      )}

                      {/* Structured Steps or Text Details */}
                      {faq.steps && faq.steps.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left font-medium text-xs sm:text-sm text-neutral-900 mb-2">
                          {faq.steps.map((step, idx) => (
                            <div key={idx} className="bg-white/90 p-3.5 rounded-xl border border-amber-200/80 shadow-2xs flex items-start gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                              <span className="leading-snug text-neutral-900 font-semibold">{step}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white/90 p-4 rounded-xl border border-amber-200/80 shadow-2xs max-w-xl mx-auto text-left mb-2">
                          <p className="whitespace-pre-line text-xs sm:text-sm text-neutral-900 leading-relaxed font-semibold">
                            {faq.answer}
                          </p>
                        </div>
                      )}

                    </div>

                    {/* Optional WhatsApp CTA Button */}
                    {faq.whatsappCta && (
                      <div className="mt-4 text-center">
                        <a
                          href={`https://wa.me/22372568975?text=${encodeURIComponent(faq.whatsappMessage || 'Bonjour Jes Fashion')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md hover:scale-105"
                        >
                          <img
                            src="https://drive.google.com/thumbnail?id=1S2LxSpNum9j-KJ6gDMrY2O--pQZGpl5B&sz=w500"
                            alt="WhatsApp"
                            referrerPolicy="no-referrer"
                            className="w-5 h-5 object-contain rounded-full bg-white p-0.5"
                          />
                          <span>{faq.whatsappCta}</span>
                        </a>
                      </div>
                    )}

                    <div className="mt-3 flex justify-end">
                      <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-black bg-neutral-100 border border-neutral-300 px-2.5 py-0.5 rounded-full">
                        {faq.category}
                      </span>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white text-black text-center border border-neutral-200 shadow-xl">
          <h3 className="text-xl font-serif font-black mb-2 text-black">
            Une question spécifique pour votre robe de mariée ?
          </h3>
          <p className="text-xs text-neutral-800 mb-5 font-medium">
            Notre équipe de spécialistes Haute Couture à Badalabougou vous répond directement sur WhatsApp.
          </p>
          <a
            href="https://wa.me/22372568975?text=Bonjour%20Jes%20Fashion%2C%20j%27ai%20une%20question%20concernant%20vos%20robes."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 btn-gold-foil px-6 py-3.5 text-xs font-black rounded-full shadow-lg text-black"
          >
            <MessageCircle className="w-4 h-4 text-black" />
            <span>Discuter avec Jes Fashion sur WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};
