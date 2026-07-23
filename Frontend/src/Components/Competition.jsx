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
    <div id="competition" className="relative w-full max-w-4xl mx-auto h-auto items-center justify-center overflow-visible ">  
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


        <div className="right-[4%] relative w-full max-w-4xl mx-auto flex items-center justify-center overflow-visible animate-pop-shake">  
            <img 
                src={competition} 
                alt="Competition" 
                loading="lazy"
                decoding="async"
                className="w-full max-w-[700px] md:max-w-[1000px] h-auto object-contain drop-shadow-[0_0_15px_rgba(255,9,144,0.3)]" 
            />
        </div>

        {/* Radio Announcing Competition */}
        <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center overflow-visible mt-10 md:mt-18">
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
                <p className="text-white text-center text-[14px] md:text-[18px] font-avril px-10 md:px-10 mb-2">
                    Radio Announcing Competition merupakan rangkaian acara utama RADIOACTIVE. Lomba ini merupakan ajang untuk siswa SMA dan mahasiswa se-Jabodetabek untuk memperluas wawasan dan mengasah kemampuan di dunia broadcasting. Radio Announcing Competition ini memiliki konsep yang sesuai dengan nilai utama RADIOACTIVE 2026, yaitu embracing the best version of yourself. Tujuan dari lomba ini adalah untuk mengasah kreativitas peserta dalam membuat siaran dan secara tidak langsung memberikan informasi hingga mengajak para peserta untuk keluar dari zona nyaman mereka.
                </p>
            </div>
            <div className="w-full max-w-3xl flex justify-end px-4 md:px-8">
                <a
                    href="https://drive.google.com/file/d/15lAr97WclBifRn3yiRCsZHs-P4tqSp1_/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative inline-block px-4 py-2 md:px-5 md:py-2.5 bg-black border-2 border-[#FF0990] text-[#FF0990] font-avril text-xs md:text-sm tracking-widest uppercase rotate-0 hover:rotate-2 hover:bg-[#FF0990] hover:text-black transition-all duration-200 shadow-[4px_4px_0px_0px_#FF0990] hover:shadow-[0_0_20px_rgba(255,9,144,0.8)] active:scale-95"
                >
                    Download Guidebook ➔
                </a>
            </div>
        </div>
                
        {/* Podcast Competition */}
        <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center overflow-visible mt-10 md:mt-20">
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
                <p className="text-white text-center text-[14px] md:text-[18px] font-avril px-10 md:px-10 mb-2">
                    Lomba ini merupakan ajang untuk seluruh mahasiswa se-Jabodetabek mengasah kemampuan, dan kepercayaan diri dalam pemanfaatan media massa, khususnya di bidang podcast. RADIOACTIVE 2026 berharap melalui kompetisi ini, generasi muda dapat mengembangkan kemampuan diri sebagai wujud mengekspresikan pendapat dan kreativitas yang dimiliki.
                </p>
            </div>
           <div className="w-full max-w-3xl flex justify-end px-4 md:px-8 mt-3">
                <a
                    href="https://drive.google.com/file/d/1Jlvc2T3qRPbOvH1CbUUm133Ee0zZ489z/view?usp=drivesdk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative inline-block px-4 py-2 md:px-5 md:py-2.5 bg-black border-2 border-[#FF0990] text-[#FF0990] font-avril text-xs md:text-sm tracking-widest uppercase rotate-0 hover:rotate-2 hover:bg-[#FF0990] hover:text-black transition-all duration-200 shadow-[4px_4px_0px_0px_#FF0990] hover:shadow-[0_0_20px_rgba(255,9,144,0.8)] active:scale-95"
                >
                    Download Guidebook ➔
                </a>
            </div>
            

        </div>

        <div className="mt-8 mb-6 flex flex-col items-center">
            <h3 className="font-avril text-xl md:text-2xl tracking-[0.25em] uppercase text-[#FF0990] drop-shadow-[0_0_12px_rgba(255,9,144,0.8)]">
                Our judges will be officially revealed on 
            </h3>
             <h3 className="font-avril text-xl md:text-2xl tracking-[0.25em] uppercase text-[#FF0990] drop-shadow-[0_0_12px_rgba(255,9,144,0.8)]">
                5 august 2026
            </h3>

            </div>

        <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center overflow-visible mt-5">
            <button 
                onClick={() => handleRegisterClick('podcast')} 
                className={`transition-all duration-100 mb-0 md:mb-2
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
       
    </div>
  );
}
