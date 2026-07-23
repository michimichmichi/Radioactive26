import React from 'react';
import { FaInstagram } from 'react-icons/fa';
import { SiLine } from 'react-icons/si';

import RadioactiveLogo from '../assets/LogoRadioactive.png';

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white relative pt-10 pb-12 px-6 md:px-12 border-t-2 border-[#FF0990] shadow-[0_-10px_25px_rgba(255,9,144,0.5)]">
      
      {/* Pink Glow Gradient Overlay */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#FF0990]/20 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        <div className="flex flex-col md:flex-row items-center md:justify-between pb-8 border-b border-white/20 gap-6">
          <div className="flex justify-center md:justify-start">
            <img 
              src={RadioactiveLogo} 
              alt="Radioactive Logo" 
              className="h-16 md:h-28 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,9,144,0.6)]" 
            />
          </div>

          <nav className="flex flex-col md:flex-row items-center gap-4 md:gap-8 font-medium text-base md:text-lg tracking-wide">
            <a href="/#about" className="hover:text-[#FF0990] transition-colors">About</a>
            <a href="/#competition" className="hover:text-[#FF0990] transition-colors">Competitions</a>
            <a href="/#sponsor" className="hover:text-[#FF0990] transition-colors">Sponsors</a>
            <a href="/#gallery" className="hover:text-[#FF0990] transition-colors">Gallery</a>
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-10 items-start">
          
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <h3 className="text-xl font-bold tracking-wide">Connect With Us</h3>
            
            <div className="flex justify-center md:justify-start items-center gap-3">
              <a href="https://www.instagram.com/umnradioactive/" className="w-10 h-10 rounded-full border border-white flex items-center justify-center hover:bg-[#FF0990] hover:border-[#FF0990] hover:text-black transition-all">
                <FaInstagram className="text-lg" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white flex items-center justify-center hover:bg-[#FF0990] hover:border-[#FF0990] hover:text-black transition-all">
                <SiLine className="text-lg" />
              </a>
            </div>

            <p className="text-sm text-gray-200 max-w-sm leading-relaxed font-light">
              Ikuti kami di media sosial untuk mendapatkan informasi terbaru tentang Radioactive 2026.
            </p>
          </div>

        </div>

        <div className="pt-6 border-t border-white/20 text-center text-xs text-white/60 font-mono">
          <p>© 2026 Radioactive - Universitas Multimedia Nusantara. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;