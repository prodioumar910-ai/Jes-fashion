import React, { useState } from 'react';
import { FAQ_ITEMS } from '../data/products';
import { ChevronDown, HelpCircle, Sparkles, MessageCircle, Search } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

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
                  <div className="p-5 sm:p-6 bg-white border-t border-neutral-200 text-sm text-black leading-relaxed font-medium">
                    <p className="mb-3">{faq.answer}</p>
                    <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-black bg-neutral-100 border border-neutral-300 px-2.5 py-0.5 rounded-full">
                      {faq.category}
                    </span>
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
