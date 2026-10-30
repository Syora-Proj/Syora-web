import { useEffect, useRef, useState } from 'react';

export default function StorySection() {
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const totalScrollDistance = rect.height + windowHeight;
      const scrolled = windowHeight - rect.top;

      let progress = scrolled / totalScrollDistance;
      progress = Math.max(0, Math.min(1, progress));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  const mapProgress = (value, start1, end1, start2, end2) => {
    if (value <= start1) return start2;
    if (value >= end1) return end2;
    return start2 + ((value - start1) / (end1 - start1)) * (end2 - start2);
  };

  const translateY = mapProgress(scrollProgress, 0, 1, -100, 100);
  const scale = 1 + Math.sin(scrollProgress * Math.PI) * 0.15;
  const rotate = mapProgress(scrollProgress, 0, 1, 10, -10);

  // Horizontally translate the juttis fully from the right column to the left column (only on desktop)
  const translateX = isMobile ? 0 : mapProgress(scrollProgress, 0.4, 0.6, 0, -45);

  // Opacities for the two scenes
  const scene1Opacity = isMobile ? 1 : mapProgress(scrollProgress, 0.4, 0.5, 1, 0);
  const scene2Opacity = isMobile ? 1 : mapProgress(scrollProgress, 0.5, 0.6, 0, 1);

  return (
    <section className="story" ref={sectionRef}>
      <div className="story__content">

        {/* Left Column containing both scenes overlapping */}
        <div className="story__left-col">

          {/* SCENE 1: Story Text */}
          <div className="story__scene" style={{ opacity: scene1Opacity, pointerEvents: scene1Opacity > 0 ? 'auto' : 'none' }}>
            <div className="story__label">— 01 / BEFORE THE FIRST STEP</div>
            <h2 className="story__title">EVERY STEP<br/>HAS A <em>STORY.</em></h2>
            <div className="story__text">
              <p>Somewhere between what we inherited<br/>and what we want to become,<br/>there was a jutti.</p>
              <br />
              <p>Familiar. Indian. Beautiful.<br/>We just thought it deserved<br/>a little more attitude.</p>
            </div>
            <h3 className="story__subtitle">SO WE GAVE IT<br/>A GLOW-UP.</h3>
            <div className="story__text">
              <p>The craft stayed.<br/>The rules didn't.</p>
            </div>
          </div>
        </div>

        {/* Right Column containing the traveling Juttis and the Process Roadmap */}
        <div className="story__right-col">

          {/* SCENE 2: Process Roadmap (Fades in on the right as juttis leave) */}
          <div className="story__scene" style={{ opacity: scene2Opacity, pointerEvents: scene2Opacity > 0 ? 'auto' : 'none' }}>
            <div className="story__roadmap" style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/roadmap.png" alt="Process Roadmap" style={{ width: '120%', maxHeight: '102vh', objectFit: 'contain' }} />
            </div>
          </div>

          {/* Traveling Juttis */}
          <div
            className="story__juttis"
            style={isMobile ? {} : {
              transform: `translate(${translateX}vw, ${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
              zIndex: 10
            }}
          >
            <img src="/juttis 01.png" alt="SYORA Juttis" className="story__juttis-img" />
          </div>
        </div>

      </div>
    </section>
  );
}
