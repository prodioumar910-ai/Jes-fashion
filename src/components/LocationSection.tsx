import React from 'react';
import { MapPin, Navigation, Clock, Phone, Compass } from 'lucide-react';

export const LocationSection: React.FC = () => {
  const mapSearchUrl = "https://www.google.com/maps/search/?api=1&query=Badalabougou+Bamako+Mali";

  return (
    <section id="localisation" className="py-16 bg-white text-black relative overflow-hidden border-b border-neutral-200">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-black tracking-tight">
            Ma Localisation à Badalabougou
          </h2>
          <p className="mt-2 text-neutral-800 text-sm sm:text-base font-medium">
            Rendez-nous visite dans notre atelier-boutique d'exception à Badalabougou, Bamako pour vos séances d'essayages privées.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Info Card (Left Column) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 flex flex-col justify-between shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-100 border border-neutral-300 text-black text-xs font-mono font-bold mb-6">
                <MapPin className="w-3.5 h-3.5 text-black" />
                <span>Bamako, Mali</span>
              </div>

              <h3 className="text-2xl font-serif font-black text-black mb-4">
                Atelier & Boutique Jes Fashion
              </h3>

              <div className="space-y-4 text-sm text-black mb-8">
                <div className="flex items-start gap-3">
                  <Compass className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-black block font-bold">Adresse Principale :</strong>
                    <p className="text-neutral-800 text-xs font-medium mt-0.5">Badalabougou près de l'ex 4ème arrondissement, Bamako- MALI</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-black block font-bold">Horaires d'ouverture :</strong>
                    <p className="text-neutral-800 text-xs font-medium mt-0.5">Du lundi au Samedi: 09h00 à 18h00</p>
                    <p className="text-neutral-800 text-xs font-medium mt-0.5">Dimanches: sur rendez-vous uniquement</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-black block font-bold">Téléphone & Whatsapp :</strong>
                    <a 
                      href="https://wa.me/22372568975" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-black font-bold hover:underline text-xs font-mono"
                    >
                      +223 72568975
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Gold Button */}
            <a
              href={mapSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-gold-foil py-4 text-xs sm:text-sm font-black flex items-center justify-center gap-2 rounded-full cursor-pointer shadow-lg hover:scale-[1.02] transition-transform text-black mt-4"
            >
              <Navigation className="w-4 h-4 text-black" />
              <span>Badalabougou : Cliquer pour Localiser (Google Maps)</span>
            </a>

          </div>

          {/* Interactive Google Map Frame (Right Column) */}
          <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden border border-neutral-200 min-h-[400px] shadow-xl relative group">
            <iframe
              title="Google Map Badalabougou Bamako Jes Fashion"
              src="https://maps.google.com/maps?q=Badalabougou%20Bamako%20Mali&t=&z=14&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '420px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full rounded-3xl"
            />

            {/* Direct Map Button Overlay */}
            <a
              href={mapSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 btn-gold-foil text-black px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-2 shadow-xl cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-black" />
              <span>Ouvrir la Carte Plein Écran</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
