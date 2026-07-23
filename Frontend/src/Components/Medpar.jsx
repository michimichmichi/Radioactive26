import React from 'react';
import sponsor from '../assets/sponsor.png';
import media from '../assets/media partners.png';
import comfest from '../assets/medpar/comfest.png';
import death from '../assets/medpar/deathrockstar.webp';
import medic from '../assets/medpar/medic.png';
import mufomic from '../assets/medpar/mufomic.png';
import Cen from '../assets/sponsor/Cen.png';
import roti from '../assets/sponsor/roti.png';


export default function Medpar() {
    const medparLogos = [
    comfest,
    death,
    medic,
    mufomic,
    ];

    const sponsorLogos = [
        Cen, 
        roti
]

return (
    <div id="sponsor" className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center overflow-visible select-none px-4 py-16 mt-[100px] md:mt-[200px] mb-24">
      
        {/* Keyframe Animasi Shake untuk Banner Utama */}
        <style>{`
            @keyframes rockTiltCenter {
            0%, 100% { transform: translateX(-50%) rotate(-3deg) scale(1); }
            50% { transform: translateX(-50%) rotate(2deg) scale(1.02); }
            }
            .animate-rock-center {
            animation: rockTiltCenter 3.5s ease-in-out infinite;
            }
        `}</style>

        {/* SECTION 1: SPONSORS */}
      <section className="relative w-full flex flex-col items-center md:mb-56 sm:mb-48 mb-32 pt-12">
        
        {/* Main Box Container (Sponsor) */}
        <div className="relative w-full max-w-4xl bg-[#0d0210] border-2 border-[#FF0990] rounded-none p-6 pt-20 md:pt-24 md:p-12 shadow-[8px_8px_0px_0px_rgba(255,9,144,0.8)] -rotate-1">
          
          <div className="absolute -top-32 sm:-top-32 md:-top-48 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-rock-center w-full flex justify-center">
            <img
                src={sponsor}
              alt="Sponsors"
              loading="lazy"
              decoding="async"
              className="w-[400px] sm:w-[400px] md:w-[600px] object-contain filter drop-shadow-[0_0_20px_rgba(255,9,144,0.9)] brightness-110"
            />
          </div>
          
          {/* Tapes */}
          <div className="absolute -top-3 -left-4 w-16 h-6 bg-[#f995cc] border border-zinc-700 rotate-[-25deg] shadow-md z-20" />
          <div className="absolute -top-3 -right-4 w-16 h-6 bg-[#f995cc] border border-zinc-700 rotate-[35deg] shadow-md z-20" />

          {/* Sponsors */}
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {sponsorLogos.map((logo, index) => (
              <div
                key={index}
                className={`group relative p-5 bg-[#17031c] border-2 border-white/20 hover:border-[#FF0990] transition-all duration-200 hover:scale-110 flex items-center justify-center ${
                  index % 2 === 0 ? 'rotate-2' : '-rotate-3'
                }`}
              >
                {/* Individual Tape */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-[#ffb9df] border border-zinc-600/50 -rotate-3" />
                    <img
                    src={logo}
                    alt={`Sponsor ${index + 1}`}
                    className="h-16 sm:h-20 md:h-24 w-auto object-contain filter brightness-90 contrast-125 group-hover:brightness-100 transition-all"
                    />
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: MEDIA PARTNERS */}
      <section className="relative w-full flex flex-col items-center pt-12">
        
        {/* Main Box Container (Media Partners) */}
        <div className="relative w-full max-w-4xl bg-[#0d0210] border-2 border-[#FF0990] rounded-none p-6 pt-20 md:pt-24 md:p-12 shadow-[-8px_8px_0px_0px_rgba(255,9,144,0.8)] rotate-1">
          
          <div className="absolute -top-36 sm:-top-36 md:-top-56 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-rock-center w-full flex justify-center">
            <img
                src={media}
              alt="Media Partners"
              loading="lazy"
              decoding="async"
              className="w-[350px] sm:w-[360px] md:w-[500px] object-contain filter drop-shadow-[0_0_20px_rgba(255,9,144,0.9)] brightness-110"
            />
          </div>

          {/* Tapes */}
          <div className="absolute -top-3 -left-4 w-16 h-6 bg-[#f995cc] border border-zinc-700 rotate-[-25deg] shadow-md z-20" />
          <div className="absolute -top-3 -right-4 w-16 h-6 bg-[#f995cc] border border-zinc-700 rotate-[35deg] shadow-md z-20" />

          {/* Medpars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 items-center justify-items-center">
            {medparLogos.map((logo, index) => {
              const tilts = ['-rotate-3', 'rotate-2', '-rotate-2', 'rotate-3'];
              return (
                <div
                  key={index}
                  className={`group relative w-full h-24 sm:h-28 md:h-32 p-3 bg-[#17031c] border-2 border-white/20 hover:border-[#FF0990] transition-all duration-200 hover:scale-105 hover:z-10 ${tilts[index % tilts.length]} flex items-center justify-center`}
                >
                  {/* medpar pins */}
                  <div className="absolute -top-1.5 left-2 w-3 h-3 bg-[#FF0990] rounded-full shadow-[0_0_8px_#FF0990]" />
                  
                  <img
                    src={logo}
                    alt={`Medpar ${index + 1}`}
                    className="max-h-full max-w-full object-contain filter contrast-125 brightness-90 group-hover:brightness-110 transition-all duration-200"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
