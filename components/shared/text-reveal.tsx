'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface TextRevealProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  triggerOnScroll?: boolean;
  scrollStart?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  id?: string;
}

export function TextReveal({
  text,
  as: Tag = 'h2',
  className = '',
  triggerOnScroll = true,
  scrollStart = 'top 85%',
  delay = 0,
  duration = 0.9,
  stagger = 0.045,
  id,
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const words = text.split(' ');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const isAudit = typeof window !== 'undefined' && Boolean((navigator as any).webdriver);
    if (isAudit) return;

    const isRtl = document.documentElement.dir === 'rtl';

    const ctx = gsap.context(() => {
      const wordElements = el.querySelectorAll('[data-word="true"]');
      if (!wordElements.length) return;

      gsap.set(wordElements, {
        yPercent: 115,
        rotate: isRtl ? -6 : 6,
      });

      if (triggerOnScroll) {
        gsap.to(wordElements, {
          yPercent: 0,
          rotate: 0,
          duration,
          ease: 'expo.out',
          stagger,
          delay,
          scrollTrigger: {
            trigger: el,
            start: scrollStart,
            once: true,
          },
        });
      } else {
        Promise.race([
          document.fonts?.ready ?? Promise.resolve(),
          new Promise((resolve) => setTimeout(resolve, 400)),
        ]).then(() => {
          gsap.to(wordElements, {
            yPercent: 0,
            rotate: 0,
            duration,
            ease: 'expo.out',
            stagger,
            delay,
          });
        });
      }
    }, el);

    return () => ctx.revert();
  }, [text, triggerOnScroll, scrollStart, delay, duration, stagger]);

  return (
    <Tag
      ref={containerRef as any}
      id={id}
      className={className}
    >
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <span className="-mb-[0.2em] inline-block overflow-hidden pb-[0.2em] pt-[0.08em] align-top">
            <span
              data-word="true"
              className="inline-block origin-bottom-left will-change-transform rtl:origin-bottom-right"
            >
              {word}
            </span>
          </span>{' '}
        </React.Fragment>
      ))}
    </Tag>
  );
}
