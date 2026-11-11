'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface MagneticButtonProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export function MagneticButton({
  children,
  strength = 0.35,
  className = '',
}: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(pointer: fine)').matches) return;

    const toX = gsap.quickTo(el, 'x', {
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
    });
    const toY = gsap.quickTo(el, 'y', {
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
    });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      toX((e.clientX - (r.left + r.width / 2)) * strength);
      toY((e.clientY - (r.top + r.height / 2)) * strength);
    };

    const onLeave = () => {
      toX(0);
      toY(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {children}
    </span>
  );
}
