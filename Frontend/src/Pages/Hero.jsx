import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Navbar from '../Components/NavigationBar';
import OpeningTitle from '../Components/Opening';

const Mascot = lazy(() => import('../Components/mascot'));
const Competition = lazy(() => import('../Components/Competition'));
const Timeline = lazy(() => import('../Components/Timeline'));
const Medpar = lazy(() => import('../Components/Medpar'));
const Gallery = lazy(() => import('../Components/Gallery'));
const Footer = lazy(() => import('../Components/Footer'));
const Teaser = lazy(() => import('../Components/Teaser'))

function DeferredSection({ children }) {
  const sectionRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="min-h-[160px]">
      {shouldRender ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
}

function Hero() {
  return (
    <main
      id="about"
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
        <h1 className="sr-only">Radioactive 2026</h1>
        <OpeningTitle />
        <DeferredSection><Mascot /></DeferredSection>
        <DeferredSection><Competition /></DeferredSection>
        <DeferredSection><Timeline /></DeferredSection>
        <DeferredSection><Medpar /></DeferredSection>
        <DeferredSection><Teaser /></DeferredSection>
        <DeferredSection><Gallery /></DeferredSection>
        <DeferredSection><Footer /></DeferredSection>
      </div>

      {/* bottom pink fade */}
      <div className="pointer-events-none fixed bottom-0 left-0 w-full z-10 flex justify-between overflow-visible">
        <div className="w-[120px] md:w-[250px] h-[120px] md:h-[200px] bg-[#FF0990] opacity-25 md:opacity-30 blur-[60px] md:blur-[120px] -translate-x-1/4 translate-y-1/4" />
        <div className="w-[120px] md:w-[250px] h-[120px] md:h-[200px] bg-[#FF0990] opacity-25 md:opacity-30 blur-[60px] md:blur-[120px] translate-x-1/4 translate-y-1/4" />
      </div>
    </main>
  );

}

export default Hero;
