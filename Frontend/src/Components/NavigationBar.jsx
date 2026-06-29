import React from 'react';

const Navbar = () => {
  return (
    <div>
      <nav className="bg-[#FF0990] px-6 h-18 flex items-center justify-between text-white">
        <div>
          <img src="src/assets/LogoRadioactive.png" alt="Logo" className="h-16 w-auto" />
        </div>

        <ul className="hidden md:flex items-center gap-8 text-sm font-avrile text-white font-semibold ">
          <li>
            <a href="#" className="hover:text-white transition-colors tracking-wider">ABOUT</a>
          </li>
          <li>
            <a href="#" className="hover:text-white transition-colors tracking-wider">COMPETITION</a>
          </li>
          <li>
            <a href="#" className="hover:text-white transition-colors tracking-wider">SPONSOR</a>
          </li>
          <li>
            <a href="#" className="hover:text-white transition-colors tracking-wider">GALLERY</a>
          </li>
        </ul>

        <div className="flex items-center gap-4">
          <button className="bg-black border border-white/10 px-5 py-1.5 rounded-xl hover:bg-zinc-900/70 transition-colors text-sm font-medium">
            Login
          </button>
          <button className="md:hidden text-white text-3xl">
            ☰
          </button>
        </div>
      </nav>

      <div className="pointer-events-none h-10 bg-gradient-to-b from-[#FF0990] to-transparent" />
  </div>
    
  );
};

export default Navbar;