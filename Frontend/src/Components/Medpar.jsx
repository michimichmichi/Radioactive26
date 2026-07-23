

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
        
        <div className="relative w-full max-w-4xl mx-auto flex justify-center animate-pop-shake mb-10 md:mb-16">
    <img
        src={sponsor}
        alt="Sponsor"
        loading="lazy"
        decoding="async"
        className="w-full max-w-[600px] md:max-w-[800px] object-contain drop-shadow-[0_0_15px_rgba(255,9,144,0.3)]"
    />
</div>

<div className="mx-auto flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16 pb-12">
    {sponsorLogos.map((logo, index) => (
        <div
            key={index}
            className="flex items-center justify-center rounded-2xlobject-contain transition-transform duration-300 hover:scale-110"
        >
            <img
                src={logo}
                alt={`Sponsor ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="h-20 md:h-28 lg:h-36 w-auto object-contain"
            />
        </div>
    ))}
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
        {medparLogos.map((logo, index) => (
            <img
            key={index}
            src={logo}
            alt={`Medpar ${index + 1}`}
            loading="lazy"
            decoding="async"
            className="h-10 md:h-16 lg:h-24 xl:h-32 w-auto max-w-full object-contain transition-transform duration-300 hover:scale-110"
            />
        ))}
    </div>
    </div>
  );
}
