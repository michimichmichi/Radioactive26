import React from 'react';

import gallery from '../assets/gallery/gallery.png';

export default function Gallery() {
  return (
    <div id="gallery" className="relative w-full max-w-4xl mx-auto h-auto flex-col items-center justify-center overflow-visible select-none px-4 ">
        <div className="right-[4%] relative w-full max-w-4xl mx-auto flex items-center justify-center overflow-visible">  
            <img 
                src={gallery} 
                alt="Gallery" 
                loading="lazy"
                decoding="async"
                className="w-full max-w-[600px] md:max-w-[800px] h-auto object-contain drop-shadow-[0_0_15px_rgba(255,9,144,0.3)]" 
            />
        </div>

        

    </div>
  );
}
