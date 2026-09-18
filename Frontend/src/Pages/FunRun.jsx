import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Components/NavigationBar';
import Footer from '../Components/Footer';

// ── 1. OTOMATISASI ASSETS / DATA INPUT ──
// Opsi Vite Glob: membaca otomatis folder lokal. Jika kosong, gunakan array fallback URL/placeholder.
const localImages = Object.values(
  import.meta.glob('../assets/gallery/optimized/*.{jpg,jpeg,png,webp}', {
    eager: true,
    import: 'default',
  })
);

// Jika folder lokal belum diisi foto asli, gunakan placeholder rockstar sementara
const placeholderPhotos = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  url: `https://picsum.photos/seed/rockrun${i + 1}/600/800`,
  title: `STAGE MOMENT #${String(i + 1).padStart(2, '0')}`,
}));

// Gunakan gambar lokal jika ada; jika tidak, gunakan placeholder
const initialPhotos = localImages.length > 0 
  ? localImages.map((src, i) => ({ id: i + 1, url: src, title: `ROLL #${String(i + 1).padStart(2, '0')}` }))
  : placeholderPhotos;

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
  const [photoList] = useState(initialPhotos);
  const [lightbox, setLightbox] = useState(null);

  const openLightbox  = (i) => setLightbox(i);
  const closeLightbox = ()  => setLightbox(null);
  const prevPhoto     = ()  => setLightbox((i) => (i - 1 + photoList.length) % photoList.length);
  const nextPhoto     = ()  => setLightbox((i) => (i + 1) % photoList.length);

  const handleKeyDown = (e) => {
    if (lightbox === null) return;
    if (e.key === 'ArrowLeft')  prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'Escape')     closeLightbox();
  };

  return (
    <main
      className="min-h-screen w-full overflow-x-hidden bg-[#050505] text-white select-none"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1.2px, transparent 1px)',
        backgroundSize: '5px 5px',
      }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">

        {/* HERO SECTION */}
        <section className="relative flex flex-col items-center text-center mb-16 overflow-visible">
          <div className="w-28 h-7 bg-[#f995cc] border border-zinc-700 rotate-[4deg] shadow-md -mb-4 z-20" />
          <div className="relative bg-[#0d0210] border-4 border-[#FF0990] px-6 sm:px-12 py-5 shadow-[8px_8px_0px_0px_rgba(255,9,144,0.85)] -rotate-1">
            <h1 className="font-black text-[clamp(2.8rem,9vw,6.5rem)] leading-none tracking-tight uppercase text-white drop-shadow-[0_0_25px_rgba(255,9,144,0.8)]">
              FUN RUN '26
            </h1>
            <span className="absolute -bottom-3 right-4 bg-[#FF0990] text-black font-black text-[10px] sm:text-xs px-2 py-0.5 tracking-widest uppercase rotate-2">
              OFFICIAL ROLL
            </span>
          </div>

          <p className="mt-8 max-w-xl text-zinc-300 text-xs sm:text-sm md:text-base font-medium tracking-wider leading-relaxed px-2">
            DOCUMENTATION OF RADIOACTIVE'S FUN RUN EVENT
          </p>

          <div className="mt-8 flex flex-wrap justify-center items-center gap-3 text-[11px] font-mono tracking-widest uppercase">
            <span className="bg-[#1a0322] border-2 border-[#FF0990]/60 text-[#FF0990] px-3 py-1 shadow-[3px_3px_0px_#FF0990]">
              ⚡ {photoList.length} TOTAL CAPTURES
            </span>
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
                  key={item.id || i}
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
                      onError={(e) => {
                        // Fallback jika file gambar rusak/tidak ditemukan
                        e.target.src = 'https://via.placeholder.com/600x800/0d0210/FF0990?text=RADIOACTIVE+FRAME';
                      }}
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