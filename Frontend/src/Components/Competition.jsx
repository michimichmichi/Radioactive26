import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import competition from '../assets/competition/competition.png'; 
import radAnnouncing from '../assets/competition/radio announcing competition.png';
import podcast from '../assets/competition/podcast competition.png';
import register from '../assets/competition/register now.png';

export default function Competition() {
    const navigate = useNavigate();
    const [clickedId, setClickedId] = useState(null);
    const handleRegisterClick = (id) => {
        setClickedId(id);
        setTimeout(() => setClickedId(null), 150);
        navigate('/competition-registration');
    };

  return (
    <section id="competition" className="section-shell relative mx-auto w-full max-w-6xl overflow-visible px-4 py-16 md:px-8 md:py-24">  
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

            .animate-pop-shake {
            animation: popShakePop 3s cubic-bezier(0.25, 1, 0.5, 1) infinite;
            }
        `}</style>


        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center justify-center overflow-visible animate-pop-shake">
            <img 
                src={competition} 
                alt="Competition" 
                loading="lazy"
                decoding="async"
                className="w-full max-w-[700px] md:max-w-[1000px] h-auto object-contain drop-shadow-[0_0_15px_rgba(255,9,144,0.3)]" 
            />
        </div>

        {/* Radio Announcing Competition */}
        <div className="competition-card relative mx-auto mt-12 flex w-full max-w-5xl flex-col items-center justify-center overflow-visible px-1 py-8 sm:px-5 md:mt-16 md:py-12">
            <div className="relative w-full max-w-4xl mx-auto mb-5 md:mb-10 flex items-center justify-center overflow-visible">
                <img 
                    src={radAnnouncing} 
                    alt="Radio Announcing Competition" 
                    loading="lazy"
                    decoding="async"
                    className=" transform w-full max-w-[300px] md:max-w-[600px] h-auto drop-shadow-[0_0_15px_rgba(255,9,144,0.3)]" 
                />
            </div>
            <div>
                <p className="max-w-3xl px-1 text-center text-sm leading-7 text-zinc-200 md:text-base md:leading-8">
                    Radio Announcing Competition merupakan rangkaian acara utama RADIOACTIVE. Lomba ini merupakan ajang untuk siswa SMA dan mahasiswa se-Jabodetabek untuk memperluas wawasan dan mengasah kemampuan di dunia broadcasting. Radio Announcing Competition ini memiliki konsep yang sesuai dengan nilai utama RADIOACTIVE 2026, yaitu embracing the best version of yourself. Tujuan dari lomba ini adalah untuk mengasah kreativitas peserta dalam membuat siaran dan secara tidak langsung memberikan informasi hingga mengajak para peserta untuk keluar dari zona nyaman mereka.
                </p>
            </div>
        </div>
                
        {/* Podcast Competition */}
        <div className="competition-card relative mx-auto mt-6 flex w-full max-w-5xl flex-col items-center justify-center overflow-visible px-1 py-8 sm:px-5 md:mt-8 md:py-12">
            <div className="relative left-[2%] w-full max-w-4xl mx-auto mb-5 md:mb-10 flex items-center justify-center overflow-visible">
                <img 
                    src={podcast} 
                    alt="Podcast Competition" 
                    loading="lazy"
                    decoding="async"
                    className=" transform w-full max-w-[250px] md:max-w-[500px] h-auto drop-shadow-[0_0_15px_rgba(255,9,144,0.3)]" 
                />
            </div>
            <div>
                <p className="max-w-3xl px-1 text-center text-sm leading-7 text-zinc-200 md:text-base md:leading-8">
                    Lomba ini merupakan ajang untuk seluruh mahasiswa se-Jabodetabek mengasah kemampuan, dan kepercayaan diri dalam pemanfaatan media massa, khususnya di bidang podcast. RADIOACTIVE 2026 berharap melalui kompetisi ini, generasi muda dapat mengembangkan kemampuan diri sebagai wujud mengekspresikan pendapat dan kreativitas yang dimiliki.
                </p>
            </div>
            <button 
                onClick={() => handleRegisterClick('podcast')} 
                className={`transition-all duration-100 mb-5 md:mb-10
                  ${clickedId === 'podcast' 
                    ? 'scale-90 brightness-75 drop-shadow-none' 
                    : 'hover:scale-110 active:scale-95'
                  }`} >   
                  <img 
                    src={register} 
                    alt="Register Now" 
                    loading="lazy"
                    decoding="async"
                    className="transform w-full max-w-[200px] md:max-w-[400px] h-auto drop-shadow-[0_0_15px_rgba(255,9,144,0.3)]" 
                />
            </button>
        </div>
       
    </section>
  );
}
