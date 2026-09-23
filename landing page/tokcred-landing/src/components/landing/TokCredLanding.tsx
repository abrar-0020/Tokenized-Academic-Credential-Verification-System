'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navigation from './Navigation';
import SceneOverlay from './SceneOverlay';
import LoadingScreen from './LoadingScreen';

// Dynamically import 3D world to avoid SSR issues
const TokCredWorld = dynamic(() => import('@/components/three/TokCredWorld'), {
  ssr: false,
  loading: () => null,
});

function getScene(progress: number): number {
  if (progress < 0.28) return 1;
  if (progress < 0.55) return 2;
  if (progress < 0.78) return 3;
  return 4;
}

function getVerificationState(progress: number): 'idle' | 'checking' | 'verified' {
  if (progress < 0.62) return 'idle';
  if (progress < 0.73) return 'checking';
  return 'verified';
}

export default function TokCredLanding() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Use state for React rendering triggers (low-frequency UI updates)
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Ref for high-frequency R3F access (no re-render cost)
  const scrollProgressRef = useRef(0);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);

  // Detect mobile and reduced motion
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll handler — update ref immediately, state periodically
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.max(0, Math.min(1, scrollTop / maxScroll)) : 0;

      scrollProgressRef.current = progress;

      // Throttle state updates to avoid excessive re-renders and synchronous loops
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollProgress(p => (Math.abs(p - progress) > 0.001 ? progress : p));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse tracking for parallax (desktop only)
  useEffect(() => {
    if (isMobile || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const mx = (e.clientX / window.innerWidth) * 2 - 1;
      const my = -((e.clientY / window.innerHeight) * 2 - 1);
      mouseXRef.current = mx;
      mouseYRef.current = my;
      setMouseX(mx);
      setMouseY(my);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, prefersReducedMotion]);

  const handleLoadComplete = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const currentScene = getScene(scrollProgress);
  const verificationState = getVerificationState(scrollProgress);
  const effectiveProgress = prefersReducedMotion ? 0 : scrollProgress;

  return (
    <>
      {/* Loading screen */}
      {!isLoaded && <LoadingScreen onComplete={handleLoadComplete} />}

      {/* Tall scroll container — provides the scroll distance */}
      <div ref={scrollContainerRef} style={{ height: '700vh', position: 'relative' }}>

        {/* Sticky viewport — stays pinned while user scrolls */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            width: '100%',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          {/* 3D World */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <TokCredWorld
              scrollProgress={effectiveProgress}
              scrollProgressRef={scrollProgressRef}
              mouseX={isMobile ? 0 : mouseX}
              mouseY={isMobile ? 0 : mouseY}
              isMobile={isMobile}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>

          {/* HTML overlays */}
          <div style={{ position: 'absolute', inset: 0 }}>
            <SceneOverlay
              scrollProgress={effectiveProgress}
              currentScene={currentScene}
              verificationState={verificationState}
            />
          </div>

          {/* Navigation */}
          <Navigation currentScene={currentScene} scrollProgress={effectiveProgress} />

          {/* Scroll indicator (only at start) */}
          {scrollProgress < 0.03 && isLoaded && (
            <div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
              aria-hidden="true"
            >
              <div
                className="w-5 h-8 rounded-full border flex items-center justify-center"
                style={{ borderColor: 'rgba(59,130,246,0.4)' }}
              >
                <div
                  className="w-0.5 h-2 rounded-full"
                  style={{ background: '#3b82f6', animation: 'scrollDot 2s ease-in-out infinite' }}
                />
              </div>
              <span className="text-xs tracking-widest font-mono" style={{ color: '#374151' }}>SCROLL</span>
            </div>
          )}


        </div>
      </div>

      <style jsx global>{`
        html { scroll-behavior: auto; }
        body { background: #050508; overflow-x: hidden; }
        @keyframes scrollDot {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(12px); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </>
  );
}
