import React from 'react';

import gallery from '../assets/gallery/gallery.png';
import cameraRoll from '../assets/gallery/camera roll.png';
import star from '../assets/gallery/star 6.png';
import camera from '../assets/gallery/kamera 1.png';

export default function Gallery() {
  return (
    <div id="gallery" className="relative w-full max-w-4xl mx-auto h-[1200px] md:h-[2000px] flex-col items-center justify-center overflow-visible select-none px-4 ">
        <div className="absolute right-[4%] w-full max-w-4xl mx-auto flex items-center justify-center overflow-visible">  
            <img 
                src={gallery} 
                alt="Gallery" 
                className="w-full max-w-[600px] md:max-w-[800px] h-auto object-contain drop-shadow-[0_0_15px_rgba(255,9,144,0.3)] z-10" 
            />
        </div>

        <div className="absolute top-[2%] left-1/2 transform -translate-x-1/2 w-full max-w-[400px] flex justify-center items-center z-0">
            <img 
                src={cameraRoll} 
                alt="Camera Roll" 
                className="max-w-[500px] md:max-w-[800px] h-auto object-cover object-top drop-shadow-[0_0_15px_rgba(255,9,144,0.3)]" 
            />
        </div>

        <div>
          <img 
            src={star} 
            alt="Star" 
            className="absolute top-[10%] left-[5%] w-[50px] md:w-[80px] h-auto z-20 object-contain transform drop-shadow-[0_0_30px_rgba(255,9,144,0.75)] animate-direct-pop" 
            style={{ animationDelay: '0s', animationDuration: '1.3s' }}
          />
          <img
            src={star}
            alt="Star"
            className="absolute bottom-[15%] right-[10%] w-[40px] md:w-[70px] h-auto z-20 object-contain transform drop-shadow-[0_0_30px_rgba(255,9,144,0.75)] animate-direct-pop"
            style={{ animationDelay: '0.2s', animationDuration: '1.5s' }}
          />
        </div>

        

    </div>
  );
}