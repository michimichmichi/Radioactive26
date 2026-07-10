import React from 'react';

import sponsor from '../assets/sponsor.png';
import media from '../assets/media partners.png';

export default function Sponsor() {
  return (
    <div id="sponsor" className="relative w-full max-w-4xl mx-auto h-auto flex-col items-center justify-center overflow-visible select-none px-4 ">
        <style>{`
            @keyframes popShakePop {
            0%, 100% { 
                transform: scale(1); 
                opacity: 1; 
            }
            
            /* 2. POP UP (Explodes outward quickly) */
            10% { 
                transform: scale(1.2); 
            }

            /* 3. SHAKE (Aggressive horizontal shifts) */
            22% { transform: translateX(-8px) rotate(-3deg); }
            30% { transform: translateX(6px) rotate(3deg); }
            38% { transform: translateX(-6px) rotate(-2deg); }
            46% { transform: translateX(4px) rotate(2deg); }
            54% { transform: translateX(0) rotate(0); }

            75% { 
                transform: scale(1); 
            }
        }

            .animate-pop-shake {
            animation: popShakePop 3s cubic-bezier(0.25, 1, 0.5, 1) infinite;
            }
        `}</style>  
        
        <div className="right-[4%] relative w-full max-w-4xl mx-auto flex items-center justify-center overflow-visible animate-pop-shake mb-[50px] md:mb-[100px]">  
            <img 
                src={sponsor} 
                alt="Sponsor" 
                loading="lazy"
                decoding="async"
                className="w-full max-w-[600px] md:max-w-[800px] h-auto object-contain drop-shadow-[0_0_15px_rgba(255,9,144,0.3)]" 
            />
        </div>

        <div className="right-[4%] relative w-full max-w-4xl mx-auto flex items-center justify-center overflow-visible animate-pop-shake">  
            <img 
                src={media} 
                alt="Media Partners" 
                loading="lazy"
                decoding="async"
                className="w-full max-w-[500px] md:max-w-[700px] h-auto object-contain drop-shadow-[0_0_15px_rgba(255,9,144,0.3)] mb-[50px] md:mb-[100px]" 
            />
        </div>
    </div>
  );
}
