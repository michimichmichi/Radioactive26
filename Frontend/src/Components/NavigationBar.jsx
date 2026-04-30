import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between shadow-xl sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold tracking-tighter">
          RADIOACTIVE
        </h1>
      </div>

      {/* Links */}
      <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
        <button><a href="#" className="hover:text-white transition-colors">Competitions</a></button>
        <button><a href="#" className="hover:text-white transition-colors">FAQ</a></button>
        <button><a href="#" className="hover:text-white transition-colors">About</a></button>
        <button><a href="#" className="hover:text-white transition-colors">Sponsors</a></button>
      </ul>

      {/* User / Status */}
      <div className="flex items-center gap-4">
        <button className="bg-zinc-800 px-4 py-2 rounded-full hover:bg-zinc-700 transition-colors">
          Login
        </button>
        <button className="md:hidden text-zinc-400 text-3xl">
          ☰
        </button>
      </div>
    </nav>
  );
};

export default Navbar;