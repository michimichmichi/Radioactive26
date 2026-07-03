import React from 'react';

import word from '../assets/mascot/embrace.png'; 
import mascot from '../assets/mascot/glitz.png';  

export default function Mascot() {
  return (
    <div className="relative w-full max-w-4xl mx-auto min-h-[400px] md:h-[600px] flex items-center justify-center overflow-visible select-none px-4 ">  
      
      <style>{`
        @keyframes directPop {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.04); } 
          30% { transform: scale(0.99); } 
          45% { transform: scale(1); }
        }
        .animate-mascot-pop {
          animation: directPop 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      <div className="flex flex-row items-center justify-center -space-x-8 sm:-space-x-12 md:-space-x-20 lg:-space-x-28 w-full">
        
        <div className="w-1/2 flex justify-end items-center animate-mascot-pop origin-right">
          <img 
            src={word} 
            alt="Embrace The Glow Rule The Show" 
            className=" w-full max-w-[200px] sm:max-w-[250px] md:max-w-[280px] h-auto object-contain drop-shadow-[0_0_15px_rgba(255,9,144,0.3)]" 
            style={{ animationDelay: '0.2s' }}
          />
        </div>
        
        <div className="w-1/2 flex justify-start items-center">
          <img 
            src={mascot} 
            alt="Glitz Mascot" 
            className="w-full max-w-[280px] sm:max-w-[340px] md:max-w-[440px] h-auto object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.6)]" 
          />
        </div>

      </div>
       
    </div>
  );
}