

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
    <section id="sponsor" className="section-shell relative mx-auto w-full max-w-6xl overflow-visible px-4 py-16 select-none md:px-8 md:py-24">
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
        
        <div className="relative mx-auto mb-8 flex w-full max-w-4xl justify-center animate-pop-shake md:mb-12">
    <img
        src={sponsor}
        alt="Sponsor"
        loading="lazy"
        decoding="async"
        className="w-full max-w-[600px] md:max-w-[800px] object-contain drop-shadow-[0_0_15px_rgba(255,9,144,0.3)]"
    />
</div>

<div className="partner-row mx-auto flex flex-wrap items-center justify-center gap-8 px-6 py-8 md:gap-16 md:px-12 md:py-10">
    {sponsorLogos.map((logo, index) => (
        <div
            key={index}
            className="flex items-center justify-center transition-transform duration-300 hover:scale-110"
        >
            <img
                src={logo}
                alt={`Sponsor ${index + 1}`}
                className="h-20 md:h-28 lg:h-36 w-auto object-contain"
            />
        </div>
    ))}
</div>

        <div className="relative mx-auto mt-20 flex w-full max-w-7xl items-center justify-center overflow-visible animate-pop-shake md:mt-28">
            <img 
                src={media} 
                alt="Media Partners" 
                loading="lazy"
                decoding="async"
                className="w-full max-w-[500px] md:max-w-[700px] h-auto object-contain drop-shadow-[0_0_15px_rgba(255,9,144,0.3)] mb-[50px] md:mb-[100px]" 
            />
        </div>
      <div className="partner-row mx-auto flex flex-wrap justify-center items-center gap-8 px-6 py-8 md:gap-14 md:px-12 md:py-10">
        {medparLogos.map((logo, index) => (
            <img
            key={index}
            src={logo}
            alt={`Medpar ${index + 1}`}
            className="h-10 md:h-16 lg:h-24 xl:h-32 w-auto max-w-full object-contain transition-transform duration-300 hover:scale-110"
            />
        ))}
      </div>
    </section>
  );
}
