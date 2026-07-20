import React from 'react';

import vinyl from '../assets/opening/vinyl.png';
import star7 from '../assets/opening/star 7.png'; 
import glistening from '../assets/opening/glistening peak.png';
import logo from '../assets/LogoRadioactive.png';

export default function OpeningTitle() {
  return (
    <section id="about" className="hero-stage relative mx-auto flex w-full max-w-6xl items-center justify-center overflow-visible px-4 select-none">  
      <style>{`
        @keyframes directPop {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.12); } /* Lowered from 1.18/1.08 for a tight, controlled pop */
          30% { transform: scale(0.99); } /* Subtle rebound snap */
          45% { transform: scale(1); }
        }
        .animate-direct-pop {
          /* 1.4s loop duration makes it punchy without being frantic */
          animation: directPop 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
      
      <img 
        src={vinyl} 
        alt="Vinyl" 
        decoding="async"
        className="absolute right-[7%] top-[4%] z-0 w-[150px] opacity-90 drop-shadow-[0_0_20px_rgba(255,9,144,0.2)] sm:right-[14%] sm:w-[220px] md:right-[18%] md:top-[-4%] md:w-[320px] animate-direct-pop" 
        style={{ animationDelay: '0.4s', animationDuration: '1.6s' }}
      />
      
      <img 
        src={glistening} 
        alt="Glistening Peak" 
        fetchPriority="high"
        decoding="async"
        className="absolute top-[27%] z-20 w-[min(94vw,550px)] object-contain drop-shadow-[3px_5px_8px_rgba(0,0,0,0.8)] animate-direct-pop md:top-[23%] md:w-[680px]" 
        style={{ animationDelay: '0.2s' }}
      />

      <div className="absolute top-[14%] z-30 -rotate-[3deg] filter contrast-110 drop-shadow-[0_0_30px_rgba(255,9,144,0.75)] animate-direct-pop md:top-[10%]">
        <img 
          src={logo} 
          alt="Logo" 
          fetchPriority="high"
          decoding="async"
          className="w-[min(86vw,400px)] object-contain md:w-[500px]" 
        />
      </div>

      <img 
        src={star7} 
        alt="Left Star" 
        decoding="async"
        className="absolute left-[-2%] top-[34%] z-20 w-[48px] -rotate-[15deg] object-contain drop-shadow-[0_0_30px_rgba(255,9,144,0.75)] animate-direct-pop sm:left-[2%] sm:w-[70px] md:top-[28%] md:w-[100px]" 
        style={{ animationDelay: '0s', animationDuration: '1.3s' }}
      />

      <img 
        src={star7} 
        alt="Right Star" 
        decoding="async"
        className="absolute bottom-[24%] right-[0%] z-20 w-[42px] object-contain drop-shadow-[0_0_30px_rgba(255,9,144,0.75)] animate-direct-pop sm:right-[5%] sm:w-[60px] md:bottom-[30%] md:w-[80px]" 
        style={{ animationDelay: '0.6s', animationDuration: '1.5s' }}
      />

    </section>
  );
}
