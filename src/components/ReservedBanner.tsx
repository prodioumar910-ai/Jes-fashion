import React from 'react';

export const ReservedBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none flex items-center justify-center z-20 overflow-hidden ${className}`}>
      {/* Metallic Gold Ribbon Banner matching uploaded style */}
      <div className="w-[140%] transform -rotate-12 bg-gradient-to-r from-black/85 via-neutral-900/95 to-black/85 border-y-4 border-[#BF953F] py-2.5 sm:py-3.5 px-6 flex flex-col items-center justify-center shadow-2xl backdrop-blur-xs">
        {/* Top Gold Line */}
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#FCF6BA] to-transparent mb-1" />
        
        {/* Main RÉSERVEZ text in Gold Foil */}
        <span className="font-serif font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5C0] via-[#BF953F] to-[#8C6211] drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
          RÉSERVEZ
        </span>

        {/* Bottom Gold Line */}
        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#FCF6BA] to-transparent mt-1" />
      </div>
    </div>
  );
};
