import React from 'react';
import {
  FaInstagram,
  FaPhoneAlt,
  FaEnvelopeOpen,
} from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

import RadioactiveLogo from '../assets/LogoRadioactive.webp';

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white relative pt-10 pb-12 px-6 md:px-12 border-t-2 border-[#FF0990] shadow-[0_-10px_25px_rgba(255,9,144,0.5)]">

      {/* Pink Glow Gradient Overlay */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#FF0990]/20 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Top */}
        <div className="flex flex-col md:flex-row items-center md:justify-between pb-8 border-b border-white/20 gap-6">

          <div className="flex justify-center md:justify-start">
            <img
              src={RadioactiveLogo}
              alt="Radioactive Logo"
              width={1920}
              height={1080}
              className="h-16 md:h-28 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,9,144,0.6)]"
            />
          </div>

          <nav className="flex flex-col md:flex-row items-center gap-4 md:gap-8 font-medium text-base md:text-lg tracking-wide">
            <a href="/#about" className="hover:text-[#FF0990] transition-colors">
              About
            </a>
            <a href="/#competition" className="hover:text-[#FF0990] transition-colors">
              Competitions
            </a>
            <a href="/#sponsor" className="hover:text-[#FF0990] transition-colors">
              Sponsors
            </a>
            <a href="/#gallery" className="hover:text-[#FF0990] transition-colors">
              Gallery
            </a>
          </nav>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-10">

          {/* Left */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">

            <h3 className="text-2xl font-bold">Connect With Us</h3>

            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/umnradioactive/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-11 h-11 rounded-full border border-white flex items-center justify-center hover:bg-[#FF0990] hover:border-[#FF0990] hover:text-black transition-all"
              >
                <FaInstagram className="text-lg" />
              </a>

             <a
                href="https://www.tiktok.com/@umnradioactive"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Radioactive on TikTok"
                className="w-11 h-11 rounded-full border border-white flex items-center justify-center hover:bg-[#FF0990] hover:border-[#FF0990] hover:text-black transition-all"
              >
                <SiTiktok className="text-lg" />
              </a>
            </div>

            <p className="text-gray-300 leading-8 max-w-sm">
              Follow us on social media to stay updated with 
              announcements and exciting updates about Radioactive 2026.
            </p>

          </div>

          {/* Right */}
          <div className="w-full">

            <h3 className="text-2xl font-bold mb-2">
              Contact Person
            </h3>

            <p className="text-sm text-gray-400 mb-6">
              Need more information? Contact our team below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Event */}
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:border-[#FF0990] hover:shadow-[0_0_20px_rgba(255,9,144,0.25)] transition-all">

                <p className="text-xs uppercase tracking-[0.2em] text-[#FF0990] font-bold mb-5">
                  Event
                </p>

                <div className="space-y-4">

                  <a
                    href="https://wa.me/6281224982700"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-gray-300 hover:text-[#FF0990] transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FF0990]/10 flex items-center justify-center flex-shrink-0">
                      <FaPhoneAlt className="text-[#FF0990] text-xs" />
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        Jessica
                      </p>
                      <p className="text-sm break-words">
                        +62 812-2498-2700
                      </p>
                    </div>
                  </a>

                  <div className="border-t border-white/10" />

                  <a
                    href="https://wa.me/6282210000824"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-gray-300 hover:text-[#FF0990] transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FF0990]/10 flex items-center justify-center flex-shrink-0">
                      <FaPhoneAlt className="text-[#FF0990] text-xs" />
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        Nawra
                      </p>
                      <p className="text-sm break-words">
                        +62 822-1000-0824
                      </p>
                    </div>
                  </a>

                </div>
              </div>

              {/* Media Relation */}
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:border-[#FF0990] hover:shadow-[0_0_20px_rgba(255,9,144,0.25)] transition-all">

                <p className="text-xs uppercase tracking-[0.2em] text-[#FF0990] font-bold mb-5">
                  Media Relation
                </p>

                <div className="space-y-4">

                  <a
                    href="https://wa.me/6282110691012"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-gray-300 hover:text-[#FF0990] transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FF0990]/10 flex items-center justify-center flex-shrink-0">
                      <FaPhoneAlt className="text-[#FF0990] text-xs" />
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        Kizza
                      </p>
                      <p className="text-sm break-words">
                        +62 821-1069-1012
                      </p>
                    </div>
                  </a>

                  <a
                    href="mailto:mediarelationsradioactive@gmail.com"
                    className="flex items-start gap-3 text-gray-300 hover:text-[#FF0990] transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FF0990]/10 flex items-center justify-center flex-shrink-0">
                      <FaEnvelopeOpen className="text-[#FF0990] text-xs" />
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        Email
                      </p>
                      <p className="text-sm break-all">
                        mediarelationsradioactive@gmail.com
                      </p>
                    </div>
                  </a>

                </div>

              </div>

            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:border-[#FF0990] hover:shadow-[0_0_20px_rgba(255,9,144,0.25)] transition-all mt-4">

                <p className="text-xs uppercase tracking-[0.2em] text-[#FF0990] font-bold mb-5">
                  Sponsorship
                </p>

                <div className="space-y-4">

                  <a
                    href="https://wa.me/6281366540106"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 text-gray-300 hover:text-[#FF0990] transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FF0990]/10 flex items-center justify-center flex-shrink-0">
                      <FaPhoneAlt className="text-[#FF0990] text-xs" />
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        Candice
                      </p>
                      <p className="text-sm break-words">
                        +62 813-6654-0106
                      </p>
                    </div>
                  </a>

                </div>

              </div>


          </div>

        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-white/20 text-center text-xs text-white/60 font-mono">
          © 2026 Radioactive - Universitas Multimedia Nusantara. All rights reserved.
        </div>

      </div>

    </footer>
  );
};

export default Footer;