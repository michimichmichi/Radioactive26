import FuzzyText from '../Components/RA';
import mic from "../assets/mic.png";
import Navbar from '../Components/NavigationBar';

function Hero() {
  return (
    <div className="bg-black h-screen items-center justify-center"
          style={{
            backgroundColor: "#050505",
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.1) 1.2px, transparent 1px)",
            backgroundSize: "5px 5px",
          }}
    >

      <Navbar />
      
      <section>
        <div className='absolute bottom-0 right-0 z-10'>
         <img
          src={mic}
          className="h-[500px] w-[500px] object-contain"
        />
        </div>
        <FuzzyText
          fontSize='clamp(3rem, 15vw, 10rem)'
          fontFamily="bitcount" /* <-- Keep this strictly lowercase 'bitcount' */
          baseIntensity={0.08}
          hoverIntensity={0.07}
          enableHover
        >
          RADIOACTIVE
        </FuzzyText>
        
      </section>
    </div>
  );
}

export default Hero;