import { useState, useEffect } from 'react';
import Navbar from '../Components/NavigationBar';
import Footer from '../Components/Footer';
import eventlogo from "../assets/funrun/funrun.webp";
import foto1 from "../assets/funrun/foto1.webp";
import foto2 from "../assets/funrun/foto2.webp";
import foto3 from "../assets/funrun/foto3.webp";
import foto4 from "../assets/funrun/foto4.webp";
import foto5 from "../assets/funrun/foto5.webp"

const rawImages = [
  foto1, 
  foto2, 
  foto3,
  foto4,
  foto5
];

const myPhotos = rawImages.map((src, index) => ({
  id: index + 1,
  url: src,
  title: `STAGE MOMENT #${String(index + 1).padStart(2, '0')}`,
}));

const tilts = [
  '-rotate-2 hover:rotate-0',
  'rotate-1 hover:rotate-0',
  '-rotate-1 hover:rotate-0',
  'rotate-2 hover:rotate-0',
  '-rotate-3 hover:rotate-0',
];

function Lightbox({ photo, index, total, onClose, onPrev, onNext }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md px-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-[#FF0990] text-3xl font-black transition-colors"
      >
        ✕
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-3 md:left-8 text-white/60 hover:text-[#FF0990] text-5xl font-light transition-colors select-none"
      >
        ‹
      </button>

      <div
        className="relative max-w-[90vw] max-h-[82vh] flex flex-col items-center justify-center border-4 border-[#FF0990] bg-[#0d0210] p-2 sm:p-3 shadow-[12px_12px_0px_0px_#FF0990]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#f995cc] border border-zinc-700 -rotate-2 z-20 shadow-md" />
        <img
          src={photo.url}
          alt={photo.title}
          className="max-w-full max-h-[75vh] object-contain filter contrast-110"
        />
        <div className="w-full flex items-center justify-between pt-2 px-2 text-xs font-mono text-[#FF0990] uppercase tracking-widest">
          <span>⚡ {photo.title}</span>
          <span className="tabular-nums">FRAME #{String(index + 1).padStart(2, '0')} / {total}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-3 md:right-8 text-white/60 hover:text-[#FF0990] text-5xl font-light transition-colors select-none"
      >
        ›
      </button>
    </div>
  );
}

export default function FunRun() {
  const [photoList] = useState(myPhotos);
  const [lightbox, setLightbox] = useState(null);

  const openLightbox  = (i) => setLightbox(i);
  const closeLightbox = ()  => setLightbox(null);
  const prevPhoto     = ()  => setLightbox((i) => (i - 1 + photoList.length) % photoList.length);
  const nextPhoto     = ()  => setLightbox((i) => (i + 1) % photoList.length);


  useEffect(() => {
    if (lightbox === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft')  prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'Escape')     closeLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

  return (
    <main
      className="min-h-screen w-full overflow-x-hidden bg-[#050505] text-white select-none"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1.2px, transparent 1px)',
        backgroundSize: '5px 5px',
      }}
    >
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* HERO SECTION */}
        <section className="relative flex flex-col items-center text-center mb-16 overflow-visible">
          <div className="relative flex items-center justify-center">
            <img
              src={eventlogo}
              alt="Event Logo"
              className="h-64 sm:h-64 md:h-72 w-auto max-w-[85vw] object-contain drop-shadow-[0_0_25px_rgba(255,9,144,0.7)] mb-[-60px]"
            />
          </div>
        </section>

        {/* PHOTO GRID */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {photoList.map((item, i) => {
              const tiltClass = tilts[i % tilts.length];
              const frameTag = `00${i + 1}`.slice(-2);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openLightbox(i)}
                  className={`group relative bg-[#0f0214] border-2 border-white/20 p-2 sm:p-2.5 flex flex-col focus:outline-none transition-transform hover:-translate-y-2 hover:border-[#FF0990] hover:shadow-[6px_6px_0px_#FF0990] ${tiltClass}`}
                >
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-zinc-900 border border-white/10">
                    <img
                      src={item.url}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover filter contrast-105 brightness-95 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-[#FF0990]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-3xl text-white drop-shadow-[0_0_12px_#FF0990]">+</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-zinc-400 group-hover:text-[#FF0990] uppercase tracking-widest px-0.5">
                    <span>ROLL-{frameTag}</span>
                    <span className="text-[8px] border border-white/20 px-1">VIEW</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <Footer />

      {lightbox !== null && (
        <Lightbox
          photo={photoList[lightbox]}
          index={lightbox}
          total={photoList.length}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}
    </main>
  );
}