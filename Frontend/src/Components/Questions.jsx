import React, { useState } from 'react';

import faqImg from '../assets/FAQ.png'; 

export default function Questions() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "QUESTION",
      answer: "Answering the question"
    },
    {
      question: "QUESTION",
      answer: "Answering the question"
    },
    {
      question: "QUESTION",
      answer: "Answering the question"
    },
    {
      question: "QUESTION",
      answer: "Answering the question"
    }
  ];

  return (
    <div className="relative w-full max-w-6xl mx-auto h-auto flex flex-col lg:flex-row items-center lg:items-start justify-center overflow-visible select-none px-10 gap-8 py-16">
        <style>{`
            @keyframes popShakePop {
              0%, 100% { transform: scale(1); }
              10% { transform: scale(1.15); }
              22% { transform: translateX(-6px) rotate(-2deg); }
              30% { transform: translateX(5px) rotate(2deg); }
              38% { transform: translateX(-5px) rotate(-1deg); }
              46% { transform: translateX(3px) rotate(1deg); }
              54% { transform: translateX(0) rotate(0); }
              75% { transform: scale(1); }
            }

            .animate-pop-shake {
              animation: popShakePop 3s cubic-bezier(0.25, 1, 0.5, 1) infinite;
            }
        `}</style>  
        
        <div className="relative w-full flex items-center justify-center lg:items-center overflow-visible animate-pop-shake lg:sticky lg:top-28">  
            <img 
                src={faqImg} 
                alt="FAQ" 
                loading="lazy"
                decoding="async"
                className="w-full max-w-[500px] md:max-w-[700px] h-auto object-contain drop-shadow-[0_0_20px_rgba(255,9,144,0.6)]" 
            />
        </div>

        <div className=" relative w-full lg:w-2/3 flex flex-col gap-6 font-avrile">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className={`w-full transition-all duration-200 transform overflow-hidden border-2
                  ${isOpen 
                    ? 'border-[#FF0990] bg-zinc-900 -rotate-1 scale-[1.01] shadow-[5px_5px_0px_0px_#FF0990]' 
                    : 'border-white bg-black hover:border-[#FF0990] hover:rotate-1 hover:shadow-[5px_5px_0px_0px_rgba(255,9,144,0.5)]'
                  }`}
              >
                {/* question */}
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left font-black tracking-widest text-sm md:text-lg transition-colors"
                >
                    <span className={isOpen ? 'text-[#FF0990]' : 'text-white'}>
                        {item.question}
                    </span>
                    <span className={`text-xl font-black transition-transform duration-300 ml-4 ${isOpen ? 'text-[#FF0990] rotate-90' : 'text-white'}`}>
                        +
                    </span>
                </button>

                {/* answer */}
                <div 
                  className={`transition-all duration-300 ease-in-out px-6 overflow-hidden
                    ${isOpen ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-zinc-300 text-xs md:text-sm tracking-wide font-medium leading-relaxed border-t-2 border-dashed border-zinc-700 pt-4">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

    </div>
  );
}
