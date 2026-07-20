import Navbar from '../Components/NavigationBar';
import OpeningTitle from '../Components/Opening';
import Mascot from '../Components/mascot';
import Competition from '../Components/Competition';
import Medpar from '../Components/Medpar';
import Gallery from '../Components/Gallery';

function Hero() {
  return (
    <main className="home-shell min-h-screen w-full overflow-hidden"
      style={{
      backgroundColor: "#050505",
      backgroundImage:
      "radial-gradient(circle, rgba(255,255,255,0.1) 1.2px, transparent 1px)",
      backgroundSize: "5px 5px",
      }}
    >

      <Navbar />
      <div className="relative z-0">
        <OpeningTitle />
        <Mascot />
        <Competition />
        <Medpar />
        <Gallery />
      </div>


      {/* bottom pink fade */}
      <div className="pointer-events-none fixed bottom-0 left-0 w-full z-10 flex justify-between overflow-visible">

        {/* left*/}
        <div className="w-[120px] md:w-[250px] h-[120px] md:h-[200px] bg-[#FF0990] opacity-25 md:opacity-30 filter blur-[60px] md:blur-[120px] transform -translate-x-1/4 translate-y-1/4" />
        
        {/* right*/}
        <div className="w-[120px] md:w-[250px] h-[120px] md:h-[200px] bg-[#FF0990] opacity-25 md:opacity-30 filter blur-[60px] md:blur-[120px] transform translate-x-1/4 translate-y-1/4" />

      </div>

    </main>
  );
}

export default Hero;
