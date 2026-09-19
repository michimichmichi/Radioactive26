import React from 'react';
import poster1 from '../assets/medpar/poster1.webp';
import poster2 from '../assets/medpar/poster2.webp';
import poster3 from '../assets/medpar/poster3.webp';

import sponsor from '../assets/sponsor.webp';
import media from '../assets/media partners.webp';
import comfest from '../assets/medpar/comfest.webp';
import death from '../assets/medpar/deathrockstar.webp';
import medic from '../assets/medpar/medic.webp';
import mufomic from '../assets/medpar/mufomic.webp';
import Cen from '../assets/sponsor/Cen.webp';
import roti from '../assets/sponsor/roti.webp';
import events from '../assets/medpar/event.webp';
import mercu from '../assets/medpar/mercu.webp';
import rtc from '../assets/medpar/rtc.webp';
import starlight from '../assets/medpar/starlight.webp';
import teen from '../assets/medpar/teensound.webp';
import ulti from '../assets/medpar/ultimagz.webp';

export default function Medpar() {
  // 3 Guest Stars Data (easy to customize images, names, and tags)
  const guestStars = [
    {
      img: poster1,
      tag: 'HEADLINER',
      name: 'GUEST STAR 01',
      tilt: '-rotate-2',
      tapeColor: 'bg-[#f995cc]',
    },
    {
      img: poster2,
      tag: 'SPECIAL GUEST',
      name: 'GUEST STAR 02',
      tilt: 'rotate-2 md:-translate-y-3', // Slightly elevated middle poster
      tapeColor: 'bg-[#ffb9df]',
    },
    {
      img: poster3,
      tag: 'SPECIAL GUEST',
      name: 'GUEST STAR 03',
      tilt: '-rotate-1',
      tapeColor: 'bg-[#f995cc]',
    },
  ];

  const medparLogos = [
    comfest,
    death,
    medic,
    mufomic,
    events,
    mercu,
    rtc,
    starlight,
    teen,
    ulti,
  ];

  const sponsorLogos = [
    Cen, 
    roti
  ];

  // 3x duplication for a completely seamless infinite film reel loop
  const carouselItems = [...medparLogos, ...medparLogos, ...medparLogos];

  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center overflow-visible select-none px-4 py-16 mt-[80px] md:mt-[140px] mb-24">
      
      {/* Custom Keyframe Animations */}
      <style>{`
        @keyframes rockTiltCenter {
          0%, 100% { transform: translateX(-50%) rotate(-3deg) scale(1); }
          50% { transform: translateX(-50%) rotate(2deg) scale(1.02); }
        }
        @keyframes rockTiltInline {
          0%, 100% { transform: rotate(-3deg) scale(1); }
          50% { transform: rotate(2deg) scale(1.02); }
        }
        @keyframes filmRoll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-rock-center {
          animation: rockTiltCenter 3.5s ease-in-out infinite;
        }
        .animate-rock-inline {
          animation: rockTiltInline 3.5s ease-in-out infinite;
        }
        .animate-film-roll {
          display: flex;
          width: max-content;
          animation: filmRoll 30s linear infinite;
        }
        .animate-film-roll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* ========================================================================= */}
      {/* SECTION 0: 3 GUEST STAR CONCERT POSTERS (ON TOP OF SPONSOR)              */}
      {/* ========================================================================= */}
      <section className="relative w-full flex flex-col items-center mb-36 sm:mb-44 md:mb-52">
        
        {/* Title Header Badge */}
       

        {/* 3 Posters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 lg:gap-8 w-full max-w-5xl mt-[-200px] justify-items-center items-center">
          {guestStars.map((guest, idx) => (
            <div
              key={idx}
              className={`group relative w-full max-w-xs bg-[#120317] border-4 border-[#FF0990] p-3 sm:p-4 shadow-[10px_10px_0px_0px_rgba(255,9,144,0.85)] ${guest.tilt} hover:rotate-0 hover:scale-105 hover:z-20 hover:shadow-[14px_14px_0px_0px_rgba(255,9,144,1)] transition-all duration-300`}
            >
             

              {/* Poster Image Container */}
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-black border-2 border-white/20">
                <img
                  src={guest.img}
                  alt={guest.name}
                  width={1200}
                  height={1600}
                  className="w-full h-full object-cover filter contrast-110 brightness-100 group-hover:contrast-125 group-hover:scale-105 transition-all duration-300"
                />

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />


          
             
              </div>

             

            </div>
          ))}
        </div>

      </section>


      {/* ========================================================================= */}
      {/* SECTION 1: SPONSORS                                                       */}
      {/* ========================================================================= */}
      <section className="relative w-full flex flex-col items-center md:mb-56 sm:mb-48 mb-32 pt-12">
        {/* Main Box Container (Sponsor) */}
        <div className="relative w-full max-w-4xl bg-[#0d0210] border-2 border-[#FF0990] rounded-none p-6 pt-20 md:pt-24 md:p-12 shadow-[8px_8px_0px_0px_rgba(255,9,144,0.8)] -rotate-1">
          
          <div className="absolute -top-32 sm:-top-32 md:-top-48 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-rock-center w-full flex justify-center">
            <img
              src={sponsor}
              alt="Sponsors"
              width={1105}
              height={607}
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
                  width={3164}
                  height={3446}
                  className="h-16 sm:h-20 md:h-24 w-auto object-contain filter brightness-90 contrast-125 group-hover:brightness-100 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: MEDIA PARTNERS (FILM ROLL CAROUSEL)                            */}
      {/* ========================================================================= */}
      <section className="relative w-full flex flex-col items-center">
        
        {/* Media Partners Header Banner */}
        <div className="z-30 pointer-events-none animate-rock-inline mb-[-80px] flex justify-center">
          <img
            src={media}
            alt="Media Partners"
            width={1183}
            height={796}
            loading="lazy"
            decoding="async"
            className="w-[350px] sm:w-[380px] md:w-[500px] object-contain filter drop-shadow-[0_0_20px_rgba(255,9,144,0.9)] brightness-110"
          />
        </div>

        {/* FILM STRIP CONTAINER */}
        <div className="relative w-full -rotate-1 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-y-2 border-[#FF0990]/50 bg-[#08010b]">
          
          {/* Subtle edge fade overlays */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#0d0210] to-transparent z-30" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#0d0210] to-transparent z-30" />

          {/* Continuous Film Reel Marquee */}
          <div className="w-full overflow-hidden">
            <div className="animate-film-roll flex items-center">
              {carouselItems.map((logo, index) => {
                const frameNumber = ((index % medparLogos.length) + 1).toString().padStart(2, '0');
                
                return (
                  <div
                    key={index}
                    className="group relative shrink-0 flex flex-col bg-[#0f0214] border-r-4 border-black/80 hover:bg-[#1a0324] transition-colors duration-300 cursor-pointer"
                  >
                    {/* TOP SPROCKET PERFORATION HOLES */}
                    <div className="w-full h-7 sm:h-8 bg-black/90 flex items-center justify-between px-3 border-b border-white/10">
                      <div className="w-3.5 h-4 sm:w-4 sm:h-4.5 bg-[#08010b] rounded-[3px] border border-white/20 shadow-inner" />
                      <span className="text-[9px] font-mono text-[#FF0990]/80 tracking-widest uppercase select-none">
                        35mm • ISO 800
                      </span>
                      <div className="w-3.5 h-4 sm:w-4 sm:h-4.5 bg-[#08010b] rounded-[3px] border border-white/20 shadow-inner" />
                    </div>

                    {/* FILM FRAME NEGATIVE CELL (Logo Area) */}
                    <div className="relative w-48 sm:w-56 md:w-64 h-28 sm:h-32 md:h-36 mx-2 my-2 bg-[#17031e]/90 border-2 border-white/15 group-hover:border-[#FF0990] group-hover:shadow-[0_0_15px_rgba(255,9,144,0.5)] transition-all duration-300 flex items-center justify-center p-4">
                      {/* Inner film frame corner ticks */}
                      <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-white/30" />
                      <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-white/30" />
                      <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-white/30" />
                      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/30" />

                      {/* Partner Logo */}
                      <img
                        src={logo}
                        alt={`Medpar ${frameNumber}`}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] contrast-125 brightness-105 group-hover:scale-110 group-hover:drop-shadow-[0_0_16px_#FF0990] group-hover:brightness-125 transition-all duration-300"
                      />
                    </div>

                    {/* BOTTOM SPROCKET PERFORATION HOLES */}
                    <div className="w-full h-7 sm:h-8 bg-black/90 flex items-center justify-between px-3 border-t border-white/10">
                      <div className="w-3.5 h-4 sm:w-4 sm:h-4.5 bg-[#08010b] rounded-[3px] border border-white/20 shadow-inner" />
                      <span className="text-[10px] font-mono text-[#FF0990] font-bold tracking-wider select-none flex items-center gap-1">
                        ▲ {frameNumber}A
                      </span>
                      <div className="w-3.5 h-4 sm:w-4 sm:h-4.5 bg-[#08010b] rounded-[3px] border border-white/20 shadow-inner" />
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}