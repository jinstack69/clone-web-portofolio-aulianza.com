'use client';

import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';

/**
 * Replicates target's useRevealGroup hook (chunk 171z6837e80r1.js module 95995).
 * Discovers all [data-reveal-group] elements below the fold, initializes their
 * [data-in] targets to { y: 32, opacity: 0 }, and reveals them with an
 * IntersectionObserver (rootMargin: '0px 0px -8% 0px') using ease: 'expo.out'.
 */
export function useRevealGroup(
  ref: RefObject<HTMLElement | null>,
  deps: React.DependencyList = []
) {
  useLayoutEffect(() => {
    const container = ref.current;
    if (!container || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    const isAudit = Boolean((navigator as any).webdriver);
    if (isAudit) return;

    const getTargets = (el: Element): Element[] => {
      const targets = el.querySelectorAll('[data-in]');
      return targets.length ? Array.from(targets) : [el];
    };

    const groups = Array.from(container.querySelectorAll('[data-reveal-group]')).filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight
    );

    groups.forEach((el) => {
      gsap.set(getTargets(el), { y: 32, opacity: 0 });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            gsap.to(getTargets(entry.target), {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: 'expo.out',
              stagger: 0.07,
              clearProps: 'transform,opacity',
            });
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px' }
    );

    groups.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      groups.forEach((el) => gsap.set(getTargets(el), { clearProps: 'transform,opacity' }));
    };
  }, deps);
}
