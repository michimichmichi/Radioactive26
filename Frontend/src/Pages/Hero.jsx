import FuzzyText from '../Components/RA';
import mic from "../assets/mic.png";

function Hero() {
  return (
    <div className="bg-[#AD0056] h-screen flex items-center justify-center">
       
      <section>
        <div className='absolute bottom-0 right-0 z-10
    '>
         <img
          src={mic}
          className="h-500 w-500"
        />
        </div>
        <FuzzyText
        fontSize='clamp(3rem, 15vw, 10rem)'
          fontFamily="Bitcount Prop Double Ink"
          baseIntensity={0.08}
          hoverIntensity={0.07}
          enableHover
        >
          Radioactive
        </FuzzyText>
        
      </section>
    </div>
  );
}

export default Hero;