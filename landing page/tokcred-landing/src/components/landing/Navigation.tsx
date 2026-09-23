'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface NavigationProps {
  currentScene: number; // 1-4
  scrollProgress: number;
}

const scenes = [
  { num: '01', label: 'ISSUE' },
  { num: '02', label: 'PROOF' },
  { num: '03', label: 'VERIFY' },
  { num: '04', label: 'TRUST' },
];

export default function Navigation({ currentScene, scrollProgress }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setIsScrolled(scrollProgress > 0.02);
  }, [scrollProgress]);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-5 flex items-center justify-between"
      style={{
        background: isScrolled
          ? 'linear-gradient(to bottom, rgba(5,5,8,0.92) 0%, transparent 100%)'
          : 'transparent',
        transition: 'background 0.6s ease',
        backdropFilter: isScrolled ? 'blur(8px)' : 'none',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="w-6 h-6 rounded-sm"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            boxShadow: '0 0 12px rgba(59,130,246,0.6)',
          }}
        />
        <span
          className="text-white font-semibold tracking-[0.15em] text-sm"
          style={{ fontFamily: 'var(--font-geist)', letterSpacing: '0.15em' }}
        >
          TOKCRED
        </span>
      </div>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-8">
        {['PRODUCT', 'HOW IT WORKS', 'VERIFY', 'LOGIN'].map((item) => (
          <button
            key={item}
            className="text-gray-400 hover:text-white transition-colors duration-200 text-xs tracking-widest font-medium"
            style={{ letterSpacing: '0.12em' }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Scene progress indicator */}
      <div className="hidden md:flex items-center gap-6">
        {scenes.map((scene, i) => {
          const isActive = currentScene === i + 1;
          const isPast = currentScene > i + 1;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className="text-xs font-mono transition-all duration-500"
                style={{
                  color: isActive ? '#3b82f6' : isPast ? '#4b5563' : '#1f2937',
                  letterSpacing: '0.08em',
                }}
              >
                {scene.num}
              </span>
              <div
                className="h-px transition-all duration-500"
                style={{
                  width: isActive ? '24px' : '12px',
                  background: isActive
                    ? '#3b82f6'
                    : isPast
                    ? '#374151'
                    : '#111827',
                  boxShadow: isActive ? '0 0 8px rgba(59,130,246,0.8)' : 'none',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-white p-2"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <div className="flex flex-col gap-1.5">
          <div className={`h-px w-5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <div className={`h-px w-5 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <div className={`h-px w-5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </div>
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 py-6 px-6 md:hidden"
          style={{ background: 'rgba(5,5,8,0.98)', backdropFilter: 'blur(16px)' }}
        >
          <div className="flex flex-col gap-4">
            {['PRODUCT', 'HOW IT WORKS', 'VERIFY', 'LOGIN'].map((item) => (
              <button
                key={item}
                className="text-gray-400 hover:text-white transition-colors py-2 text-left text-sm tracking-widest"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
