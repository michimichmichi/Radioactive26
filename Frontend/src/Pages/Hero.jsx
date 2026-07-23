import Navbar from '../Components/NavigationBar';
import OpeningTitle from '../Components/Opening';
import Mascot from '../Components/mascot';
import Competition from '../Components/Competition';
import Medpar from '../Components/Medpar';
import Gallery from '../Components/Gallery';
import Timeline from '../Components/Timeline';

function Hero() {
  return (
    <div
      className="bg-black h-auto w-full overflow-x-hidden"
      style={{
        backgroundColor: "#050505",
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.1) 1.2px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    >
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* Add top padding equal to navbar height */}
      <div className="pt-20">
        <OpeningTitle />
        <Mascot />
        <Competition />
        <Timeline />
        <Medpar />
        <Gallery />
      </div>

      {/* bottom pink fade */}
      <div className="pointer-events-none fixed bottom-0 left-0 w-full z-10 flex justify-between overflow-visible">
        <div className="w-[120px] md:w-[250px] h-[120px] md:h-[200px] bg-[#FF0990] opacity-25 md:opacity-30 blur-[60px] md:blur-[120px] -translate-x-1/4 translate-y-1/4" />
        <div className="w-[120px] md:w-[250px] h-[120px] md:h-[200px] bg-[#FF0990] opacity-25 md:opacity-30 blur-[60px] md:blur-[120px] translate-x-1/4 translate-y-1/4" />
      </div>
    </div>
  );

}

export default Hero;
