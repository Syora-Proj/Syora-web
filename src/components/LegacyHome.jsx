import Navbar from './Navbar';
import Hero from './Hero';
import StorySection from './StorySection';
import CategorySection from './CategorySection';
import SizeChart from './SizeChart';
import AboutUs from './AboutUs';
import Footer from './Footer';

export default function LegacyHome() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <div className="content-wrapper">
          <StorySection />
          <CategorySection />

          {/* Morphism Transition */}
          <div style={{
            position: 'relative', height: '40px',
            marginTop: '-10px', marginBottom: '-10px', zIndex: 10,
            background: 'linear-gradient(to bottom, transparent 0%, rgba(245,230,210,0.5) 50%, transparent 100%)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', pointerEvents: 'none',
          }} />

          <SizeChart />

          <div style={{
            position: 'relative', height: '40px',
            marginTop: '-10px', marginBottom: '-10px', zIndex: 10,
            background: 'linear-gradient(to bottom, transparent 0%, rgba(245,230,210,0.5) 50%, transparent 100%)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', pointerEvents: 'none',
          }} />

          <AboutUs />
          <Footer />
        </div>
      </main>
    </>
  );
}
