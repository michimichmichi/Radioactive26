

import sponsor from '../assets/sponsor.png';
import media from '../assets/media partners.png';
import comfest from '../assets/medpar/comfest.png';
import death from '../assets/medpar/deathrockstar.webp';
import medic from '../assets/medpar/medic.png';
import mufomic from '../assets/medpar/mufomic.png';



export default function Sponsor() {
    const sponsorLogos = [
    comfest,
    death,
    medic,
    mufomic,
    ];

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

        <div className="right-[4%] relative w-full max-w-7xl mx-auto flex items-center justify-center overflow-visible animate-pop-shake">  
            <img 
                src={media} 
                alt="Media Partners" 
                loading="lazy"
                decoding="async"
                className="w-full max-w-[500px] md:max-w-[700px] h-auto object-contain drop-shadow-[0_0_15px_rgba(255,9,144,0.3)] mb-[50px] md:mb-[100px]" 
            />
        </div>
      <div className="flex justify-center items-center gap-6 lg:gap-10 pb-10 pt-0">
        {sponsorLogos.map((logo, index) => (
            <img
            key={index}
            src={logo}
            alt={`Sponsor ${index + 1}`}
            className="h-10 md:h-16 lg:h-24 xl:h-32 w-auto max-w-full object-contain transition-transform duration-300 hover:scale-110"
            />
        ))}
    </div>
    </div>
  );
}
