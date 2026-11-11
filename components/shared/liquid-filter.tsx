'use client';

import React, { useEffect } from 'react';

export function LiquidFilter() {
  useEffect(() => {
    // Detect Chromium for liquid refraction support
    const nav = navigator as any;
    const isChromium = nav.userAgentData?.brands?.some((b: any) => b.brand === 'Chromium') ?? false;
    document.documentElement.classList.toggle('glass-refract', isChromium);
  }, []);

  useEffect(() => {
    // Track pointer coordinates relative to hovered .liquid-glass element
    let activeEl: HTMLElement | null = null;

    const onPointerMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.('.liquid-glass') as HTMLElement | null;
      if (activeEl && activeEl !== target) {
        activeEl.style.removeProperty('--gx');
        activeEl.style.removeProperty('--gy');
      }
      activeEl = target ?? null;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      target.style.setProperty('--gx', `${x.toFixed(1)}%`);
      target.style.setProperty('--gy', `${y.toFixed(1)}%`);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  return (
    <svg aria-hidden="true" width="0" height="0" className="pointer-events-none absolute">
      <defs>
        <filter id="liquid-glass" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.014" numOctaves={2} seed={7} result="noise" />
          <feGaussianBlur in="noise" stdDeviation={2} result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale={46} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
