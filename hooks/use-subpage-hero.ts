'use client';

import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface UseSubpageHeroOptions {
  onSetupTimeline?: (tl: gsap.core.Timeline) => void;
  deps?: React.DependencyList;
}

/**
 * Shared authentic subpage hero animation hook across /under-the-hood, /tools, /stats, /uses, /guestbook.
 * Matches target chunks 3tin1ee-6y4yy.js, 44r5ub9rzp-1u.js, 36co75r-byyjo.js, 2crhasr_gbg08.js, 1h5v_dkutqncu.js.
 */
export function useSubpageHero(
  heroRef: RefObject<HTMLElement | null>,
  glowRef?: RefObject<HTMLElement | null>,
  options?: UseSubpageHeroOptions
) {
  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero || typeof window === 'undefined') return;

    const isAudit = Boolean((navigator as any).webdriver);
    if (isAudit) return;

    const isRtl = document.documentElement.dir === 'rtl';
    const dir = isRtl ? -1 : 1;

    const ctx = gsap.context(() => {
      // 1. Initial states
      gsap.set('[data-word]', { yPercent: 115, rotate: 5 * dir });
      gsap.set('[data-reveal]', { y: 28, opacity: 0 });

      // 2. Timeline
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 });
      tl.to('[data-word]', {
        yPercent: 0,
        rotate: 0,
        duration: 1,
        stagger: 0.06,
      }).to(
        '[data-reveal]',
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.07,
        },
        '-=0.75'
      );

      options?.onSetupTimeline?.(tl);

      // 3. Counter numbers
      hero.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        const target = Number(el.dataset.count);
        if (isNaN(target)) return;
        const valObj = { v: 0 };
        gsap.to(valObj, {
          v: target,
          duration: 1.6,
          delay: 0.4,
          ease: 'power3.out',
          onUpdate: () => {
            el.textContent = Math.round(valObj.v).toLocaleString();
          },
        });
      });

      // 4. Horizontal backdrop parallax
      gsap.to('[data-backdrop]', {
        xPercent: -12 * dir,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, hero);

    // 5. Interactive cursor glow follower & depth tilt
    const glowEl = glowRef?.current;
    const isFine = window.matchMedia('(pointer: fine)').matches;
    const quickX = glowEl && isFine ? gsap.quickTo(glowEl, 'x', { duration: 1.6, ease: 'power3.out' }) : null;
    const quickY = glowEl && isFine ? gsap.quickTo(glowEl, 'y', { duration: 1.6, ease: 'power3.out' }) : null;

    const depths = Array.from(hero.querySelectorAll<HTMLElement>('[data-depth]')).map((el) => ({
      depth: Number(el.dataset.depth) || 1,
      x: gsap.quickTo(el, 'x', { duration: 1.8, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 1.8, ease: 'power3.out' }),
    }));

    const onPointerMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      quickX?.(e.clientX - rect.left);
      quickY?.(e.clientY - rect.top);

      depths.forEach((item) => {
        const ox = (e.clientX / window.innerWidth - 0.5) * 80 * item.depth;
        const oy = (e.clientY / window.innerHeight - 0.5) * 60 * item.depth;
        item.x(ox);
        item.y(oy);
      });
    };

    if (isFine) {
      hero.addEventListener('pointermove', onPointerMove);
    }

    return () => {
      hero.removeEventListener('pointermove', onPointerMove);
      ctx.revert();
    };
  }, options?.deps ?? []);
}
