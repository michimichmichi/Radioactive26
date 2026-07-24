import React from 'react';

import vinyl from '../assets/opening/vinyl.webp';
import star7 from '../assets/opening/Star 7.png'; 
import glistening from '../assets/opening/glistening peak.webp';
import logo from '../assets/LogoRadioactive.webp';

export default function OpeningTitle() {
  return (
    <div className="relative w-full max-w-5xl h-[700px] mx-auto flex items-center justify-center overflow-visible select-none">  
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
        width={565}
        height={1005}
        decoding="async"
        className="absolute top-[-8%] right-[20%] w-[260px] md:w-[320px] h-auto z-0 opacity-90 drop-shadow-[0_0_20px_rgba(255,9,144,0.2)] animate-direct-pop" 
        style={{ animationDelay: '0.4s', animationDuration: '1.6s' }}
      />
      
      <img 
        src={glistening} 
        alt="Glistening Peak" 
        width={1328}
        height={962}
        fetchPriority="high"
        decoding="async"
        className="absolute top-[23%] w-[550px] md:w-[680px] h-auto z-20 object-contain drop-shadow-[3px_5px_8px_rgba(0,0,0,0.8)] animate-direct-pop" 
        style={{ animationDelay: '0.2s' }}
      />

      <div className="absolute top-[10%] z-30 transform -rotate-[3deg] filter contrast-110 drop-shadow-[0_0_30px_rgba(255,9,144,0.75)] animate-direct-pop">
        <img 
          src={logo} 
          alt="Logo" 
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
          className="w-[400px] md:w-[500px] h-auto object-contain" 
        />
      </div>

      <img 
        src={star7} 
        alt="Left Star" 
        width={335}
        height={334}
        decoding="async"
        className="absolute top-[28%] left-[2%] w-[70px] md:w-[100px] h-auto z-20 object-contain transform -rotate-[15deg] drop-shadow-[0_0_30px_rgba(255,9,144,0.75)] animate-direct-pop" 
        style={{ animationDelay: '0s', animationDuration: '1.3s' }}
      />

      <img 
        src={star7} 
        alt="Right Star" 
        width={335}
        height={334}
        decoding="async"
        className="absolute bottom-[30%] right-[5%] w-[60px] md:w-[80px] h-auto z-20 transform drop-shadow-[0_0_30px_rgba(255,9,144,0.75)] animate-direct-pop" 
        style={{ animationDelay: '0.6s', animationDuration: '1.5s' }}
      />

    </div>
  );
}
