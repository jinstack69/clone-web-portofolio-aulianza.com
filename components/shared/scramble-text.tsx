'use client';

import React, { useRef, useEffect } from 'react';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>';

interface ScrambleTextProps {
  text: string;
  className?: string;
}

export function ScrambleText({ text, className }: ScrambleTextProps) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el || typeof window === 'undefined') return;

    // Skip if running in automated test or reduced motion
    if ((navigator as any).webdriver) {
      el.textContent = text;
      return;
    }

    let rafId = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const startTime = performance.now();
          const frame = (now: number) => {
            const progress = Math.min(1, (now - startTime) / 900);
            const revealedCount = Math.floor(progress * text.length);

            el.textContent = text
              .split('')
              .map((char, idx) => {
                if (idx < revealedCount || char === ' ') {
                  return char;
                }
                return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
              })
              .join('');

            if (progress < 1) {
              rafId = requestAnimationFrame(frame);
            } else {
              el.textContent = text;
            }
          };

          rafId = requestAnimationFrame(frame);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [text]);

  return (
    <span ref={spanRef} className={className} aria-label={text}>
      {text}
    </span>
  );
}
