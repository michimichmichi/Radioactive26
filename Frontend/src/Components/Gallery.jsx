import React from 'react';

import gallery from '../assets/gallery/gallery.png';
import cameraRoll from '../assets/gallery/camera roll.png';
import star from '../assets/gallery/Star 6.png';
import kamera from '../assets/gallery/kamera 1.png';

import photo1 from '../assets/gallery/1.PNG';
import photo2 from '../assets/gallery/2.JPG';
import photo3 from '../assets/gallery/3.JPG';
import photo4 from '../assets/gallery/4.JPG';
import photo5 from '../assets/gallery/5.JPG';
import photo6 from '../assets/gallery/6.JPG';
import photo7 from '../assets/gallery/7.JPG';
import photo8 from '../assets/gallery/8.JPG';
import photo9 from '../assets/gallery/9.JPG';
import photo10 from '../assets/gallery/10.PNG';
import photo11 from '../assets/gallery/11.PNG';
import photo17 from '../assets/gallery/17.JPG';
import photo18 from '../assets/gallery/18.JPG';
import photo19 from '../assets/gallery/19.JPG';
import photo20 from '../assets/gallery/20.JPG';
import photo21 from '../assets/gallery/21.JPG';

export default function Gallery() {
  const photos = [
  photo1,
  photo2,
  photo3,
  photo4,
  photo5,
  photo6,
  photo7,
  photo8,
  photo9,
  photo10,
  photo11,
  photo17,
  photo18,
  photo19,
  photo20,
  photo21,
];

  return (
    <div
      id="gallery"
      className="relative w-full max-w-4xl mx-auto h-[1200px] md:h-[2000px] flex-col items-center justify-center overflow-visible select-none px-4"
    >

      <style>{`
        @keyframes scrollGallery {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .gallery-track {
          display: flex;
          width: max-content;
          animation: scrollGallery 25s linear infinite;
        }

        .gallery-track:hover {
          animation-play-state: paused;
        }

        .gallery-photo {
          width: 200px;
          height: 260px;
          object-fit: cover;
          border-radius: 14px;
          margin-right: 16px;
          flex-shrink: 0;
          box-shadow: 0 10px 25px rgba(0,0,0,.3);
        }
      `}</style>

      {/* Gallery Title */}
      <div className="absolute right-[4%] w-full max-w-4xl flex justify-center z-30">
        <img
          src={gallery}
          alt="Gallery"
          className="w-full max-w-[600px] md:max-w-[800px] h-auto object-contain drop-shadow-[0_0_15px_rgba(255,9,144,0.3)]"
        />
      </div>

      {/* Camera Roll + Scrolling Gallery */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[800px]">

        {/* Scrolling Gallery */}
        <div className="absolute top-[16%] left-[5%] w-[90%] h-[68%] overflow-hidden z-10 rounded-xl">

          <div className="gallery-track">
            {[...photos, ...photos].map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt=""
                className="gallery-photo"
              />
            ))}
          </div>

        </div>

        {/* Camera Roll Frame */}
       

      </div>

      {/* Stars */}
      <img
        src={star}
        alt="Star"
        className="absolute top-[10%] left-[5%] w-[50px] md:w-[80px] z-40 drop-shadow-[0_0_30px_rgba(255,9,144,0.75)] animate-direct-pop"
        style={{ animationDelay: '0s', animationDuration: '1.3s' }}
      />

      <img
    src={kamera}
    alt="Camera"
    className="
        bottom-[65%]
        right-[-12%]
        w-[180px]
        md:w-[260px]
        lg:w-[320px]
        h-auto
        z-30
        rotate-[-12deg]
        drop-shadow-[0_0_30px_rgba(255,9,144,0.45)]
        pointer-events-none
    "
/>

    </div>
  );
}