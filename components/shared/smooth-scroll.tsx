'use client';

import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function SmoothScroll() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      allowNestedScroll: true,
    });

    window.__lenis = lenis;

    // Connect Lenis scroll events to ScrollTrigger and progress bar
    lenis.on('scroll', (e: { progress: number }) => {
      ScrollTrigger.update();
      setProgress(e.progress);
    });

    const updateRaf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateRaf);
    gsap.ticker.lagSmoothing(0);
    // Let CSS scroll-behavior: smooth match target behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    const onRefresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', onRefresh);
    document.fonts?.ready.then(onRefresh);

    return () => {
      gsap.ticker.remove(updateRaf);
      window.removeEventListener('load', onRefresh);
      lenis.destroy();
      delete window.__lenis;
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[400] h-[3px] origin-left bg-gradient-to-r from-[#2f45ff] via-[#7483ff] to-[#ffb21e] shadow-[0_0_12px_rgba(116,131,255,0.8)] rtl:origin-right transition-opacity duration-200"
      style={{
        transform: `scaleX(${progress})`,
        opacity: progress > 0.003 ? 1 : 0,
      }}
    />
  );
}
