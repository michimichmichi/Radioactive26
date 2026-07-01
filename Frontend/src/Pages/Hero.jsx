import FuzzyText from '../Components/RA';
import Navbar from '../Components/NavigationBar';
import OpeningTitle from '../Components/Opening';
import Mascot from '../Components/mascot';

function Hero() {
  return (
    <div className="bg-black h-auto w-full items-center justify-center"
          style={{
            backgroundColor: "#050505",
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.1) 1.2px, transparent 1px)",
            backgroundSize: "5px 5px",
          }}
    >

      <Navbar />
      <OpeningTitle />
      <Mascot />

    </div>
  );
}

export default Hero;