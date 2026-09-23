'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('INITIALIZING VERIFICATION LAYER');

  useEffect(() => {
    const statuses = [
      'INITIALIZING VERIFICATION LAYER',
      'LOADING CRYPTOGRAPHIC MODULES',
      'BUILDING TRUST INFRASTRUCTURE',
      'READY',
    ];

    let statusIdx = 0;
    const statusInterval = setInterval(() => {
      statusIdx = Math.min(statusIdx + 1, statuses.length - 1);
      setStatus(statuses[statusIdx]);
    }, 600);

    // Animate progress bar
    const tl = gsap.timeline({
      onComplete: () => {
        clearInterval(statusInterval);
        // Fade out loading screen
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete,
          });
        }
      },
    });

    tl.to({ val: 0 }, {
      val: 100,
      duration: 2.2,
      ease: 'power1.inOut',
      onUpdate: function () {
        setProgress(Math.round(this.targets()[0].val));
        if (barRef.current) {
          barRef.current.style.width = `${this.targets()[0].val}%`;
        }
      },
    });

    return () => {
      clearInterval(statusInterval);
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: '#050508' }}
    >
      {/* Logo mark */}
      <div className="mb-12 flex flex-col items-center gap-4">
        {/* Animated logo */}
        <div className="relative">
          <div
            className="w-12 h-12 rounded-sm"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              boxShadow: '0 0 30px rgba(59,130,246,0.5)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <div
            className="absolute inset-0 rounded-sm"
            style={{
              border: '1px solid rgba(59,130,246,0.3)',
              transform: 'scale(1.3)',
              animation: 'ping 2s ease-in-out infinite',
            }}
          />
        </div>

        <h1
          className="text-white text-2xl font-semibold tracking-[0.3em]"
          style={{ fontFamily: 'var(--font-geist)' }}
        >
          TOKCRED
        </h1>
      </div>

      {/* Status text */}
      <div className="mb-8 text-center">
        <p
          className="text-xs tracking-[0.2em] font-mono transition-all duration-300"
          style={{ color: '#4b6cb7' }}
        >
          {status}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-48 flex flex-col items-center gap-3">
        <div
          className="w-full h-px relative overflow-hidden"
          style={{ background: '#0d1a3a' }}
        >
          <div
            ref={barRef}
            className="h-full transition-none"
            style={{
              width: '0%',
              background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)',
              boxShadow: '0 0 8px rgba(59,130,246,0.8)',
            }}
          />
        </div>
        <span
          className="text-xs font-mono"
          style={{ color: '#1e3a8a', letterSpacing: '0.1em' }}
        >
          {progress.toString().padStart(3, '0')}%
        </span>
      </div>

      <style jsx>{`
        @keyframes ping {
          0%, 100% { opacity: 0.3; transform: scale(1.3); }
          50% { opacity: 0; transform: scale(1.6); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
