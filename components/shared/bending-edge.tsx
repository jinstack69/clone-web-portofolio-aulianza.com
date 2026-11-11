'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface BendingEdgeProps {
  above?: string;
  below?: string;
  fillColor?: string; // fallback if single color passed
  className?: string;
}

// Global set of BendingEdge listeners sharing a single scroll velocity ticker
const listeners = new Set<(val: number) => void>();
let tickerInitialized = false;

function initGlobalTicker() {
  if (tickerInitialized || typeof window === 'undefined') return;
  tickerInitialized = true;

  let val = 0;
  let vel = 0;
  let lastY = window.scrollY;

  gsap.ticker.add(() => {
    const s = window.scrollY;
    const delta = (s - lastY) * 60;
    lastY = s;

    // Resting check
    if (delta === 0 && Math.abs(val) < 0.05 && Math.abs(vel) < 0.05) {
      if (val !== 0) {
        val = 0;
        vel = 0;
        listeners.forEach((cb) => cb(0));
      }
      return;
    }

    const target = gsap.utils.clamp(-70, 70, -0.035 * delta);
    vel += (target - val) * 0.12;
    vel *= 0.78;
    val += vel;

    listeners.forEach((cb) => cb(val));
  });
}

export function BendingEdge({
  above = '#070a1a',
  below,
  fillColor,
  className = '',
}: BendingEdgeProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const belowColor = below || fillColor || '#070a1a';
  const aboveColor = above || fillColor || '#070a1a';

  useEffect(() => {
    initGlobalTicker();

    const path = pathRef.current;
    if (!path) return;

    let prevD = '';
    const onVelocityUpdate = (velocityVal: number) => {
      const o = Math.abs(velocityVal) < 0.3 ? 0 : Math.round(10 * velocityVal) / 10;
      const d = `M0 80 Q720 ${80 - 2 * o} 1440 80 Z`;
      if (d !== prevD) {
        prevD = d;
        path.setAttribute('d', d);
        path.setAttribute('fill', o > 0 ? belowColor : aboveColor);
      }
    };

    listeners.add(onVelocityUpdate);
    return () => {
      listeners.delete(onVelocityUpdate);
    };
  }, [aboveColor, belowColor]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative z-30 h-0 ${className}`}
    >
      <svg
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        className="absolute inset-x-0 -top-20 h-40 w-full"
      >
        <path
          ref={pathRef}
          d="M0 80 Q720 80 1440 80 Z"
          fill={belowColor}
        />
      </svg>
    </div>
  );
}
