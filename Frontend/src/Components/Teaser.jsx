import React from "react";
import teaser from "../assets/archive-originals/teaser.png";

export default function Teaser() {
  return (
    <section className="relative w-full max-w-5xl mx-auto flex flex-col items-center py-12 md:py-16">

      {/* Wrapper */}
      <div className="relative w-full flex flex-col items-center">

        {/* Title */}
        <img
          src={teaser}
          alt="Teaser Radioactive 2026"
          loading="lazy"
          decoding="async"
          className="relative z-20 w-full max-w-[320px] md:max-w-[620px] h-auto -mb-16 md:-mb-40"
        />

        {/* Video */}
        <div className="relative z-10 w-full aspect-video overflow-hidden rounded-[32px] bg-[#111] shadow-[0_0_40px_rgba(255,9,144,0.22)]">
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/cBSi1Drl1xo?autoplay=1&mute=1&loop=1&playlist=cBSi1Drl1xo&controls=1&modestbranding=1&rel=0&playsinline=1"
            title="RADIOACTIVE 2026 Official Teaser"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>

      </div>
    </section>
  );
}