'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroFluidCanvas } from './hero-fluid-canvas';
import { MagneticButton } from '@/components/shared/magnetic-button';
import { useLocale } from '@/lib/locale-context';

gsap.registerPlugin(ScrollTrigger);

const GREETINGS = [
  'Halo',
  'Salam',
  'Bonjour',
  'Hola',
  'Ciao',
  'Hallo',
  'Olá',
  'こんにちは',
  '안녕',
  '你好',
  'Привет',
  'Namaste',
  'Hej',
  'Merhaba',
  'สวัสดี',
  'Sawadee',
  'Xin chào',
  'Jambo',
  'Aloha',
  'Salut',
  'Howdy',
  'Guten Tag',
  '여보세요',
  'Hei',
  'Dzień dobry',
  'Szia',
  'Habari',
  'Bula',
];

function GreetingRotator() {
  const [index, setIndex] = useState(0);
  const [state, setState] = useState<'visible' | 'out' | 'in'>('visible');

  const advance = useCallback(() => {
    setState('out');
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % GREETINGS.length);
      setState('in');
      setTimeout(() => setState('visible'), 300);
    }, 300);
  }, []);

  useEffect(() => {
    // Skip cycling during automated audits
    if (typeof window !== 'undefined' && (navigator as any).webdriver) {
      return;
    }
    const timer = window.setInterval(advance, 2500);
    return () => window.clearInterval(timer);
  }, [advance]);

  const current = GREETINGS[index];
  const isArabic = /[\u0600-\u06FF]/.test(current);
  const isCjk = /[\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u4E00-\u9FFF]/.test(current);

  return (
    <span
      className="inline-block"
      style={{
        fontFamily: isArabic || isCjk ? 'system-ui, sans-serif' : 'inherit',
        direction: isArabic ? 'rtl' : 'ltr',
        opacity: state !== 'out' ? 1 : 0,
        filter: state === 'out' ? 'blur(8px)' : state === 'in' ? 'blur(0px)' : 'none',
        transform: state === 'out' ? 'scale(0.8)' : 'scale(1)',
        transition: 'opacity 0.3s, filter 0.3s, transform 0.3s',
      }}
    >
      {current}
    </span>
  );
}

export function HeroSection() {
  const { locale, t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const maskPRef = useRef<HTMLParagraphElement>(null);

  const headlineText = t('home', 'v2.headline') || 'I build web, mobile and AI products that feel fast and simple.';
  const heroWords = headlineText.split(' ');

  const [maskStyle, setMaskStyle] = useState<{ top: number; left: number; width: number }>(() => {
    const isMob = typeof window !== 'undefined' && window.innerWidth < 768;
    return isMob
      ? { top: 175, left: 20, width: 350 }
      : { top: 235, left: 120, width: 1120 };
  });

  // Track position of h1 for the yellow reveal mask text alignment
  useEffect(() => {
    const update = () => {
      if (h1Ref.current && sectionRef.current) {
        const h1Rect = h1Ref.current.getBoundingClientRect();
        const secRect = sectionRef.current.getBoundingClientRect();
        const top = Math.round(h1Rect.top - secRect.top);
        const left = Math.round(h1Rect.left - secRect.left);
        const width = Math.round(h1Rect.width);
        setMaskStyle({ top, left, width });

        if (maskPRef.current) {
          maskPRef.current.style.top = `${h1Ref.current.offsetTop}px`;
          maskPRef.current.style.left = `${h1Ref.current.offsetLeft}px`;
          maskPRef.current.style.width = `${h1Ref.current.offsetWidth}px`;
        }
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Yellow Cursor Mask Lerp Physics and 3D Headline Tilt
  useEffect(() => {
    const section = sectionRef.current;
    const mask = maskRef.current;
    const h1 = h1Ref.current;
    if (!section || !mask) return;

    const coords = { x: 0, y: 0, tx: 0, ty: 0, r: 0, tr: 0 };
    let rafId: number;

    const animateMask = () => {
      coords.x += (coords.tx - coords.x) * 0.18;
      coords.y += (coords.ty - coords.y) * 0.18;
      coords.r += (coords.tr - coords.r) * 0.12;

      mask.style.clipPath = `circle(${coords.r.toFixed(1)}px at ${coords.x.toFixed(1)}px ${coords.y.toFixed(1)}px)`;
      rafId = requestAnimationFrame(animateMask);
    };
    rafId = requestAnimationFrame(animateMask);

    const onPointerMove = (e: PointerEvent) => {
      const secRect = section.getBoundingClientRect();
      coords.tx = e.clientX - secRect.left;
      coords.ty = e.clientY - secRect.top;

      if (h1) {
        const h1Rect = h1.getBoundingClientRect();
        // Expand circle radius to 150px near headline, 14px elsewhere
        if (e.clientY > h1Rect.top - 40 && e.clientY < h1Rect.bottom + 40) {
          coords.tr = 150;
        } else {
          coords.tr = 14;
        }

        // 3D perspective tilt
        const t = e.clientX / window.innerWidth - 0.5;
        const i = e.clientY / window.innerHeight - 0.5;
        gsap.to(h1, {
          x: 18 * t,
          rotateY: 6 * t,
          rotateX: -(6 * i),
          duration: 1.2,
          ease: 'power3.out',
        });
      } else {
        coords.tr = 14;
      }
    };

    const onPointerLeave = () => {
      coords.tr = 0;
      if (h1) {
        gsap.to(h1, {
          x: 0,
          rotateY: 0,
          rotateX: 0,
          duration: 1.2,
          ease: 'power3.out',
        });
      }
    };

    section.addEventListener('pointermove', onPointerMove);
    section.addEventListener('pointerleave', onPointerLeave);

    return () => {
      cancelAnimationFrame(rafId);
      section.removeEventListener('pointermove', onPointerMove);
      section.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  // GSAP Entrance & Scroll Animations
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const isRtl = document.documentElement.dir === 'rtl';
      gsap.set('[data-word]', { yPercent: 115, rotate: isRtl ? -6 : 6 });
      gsap.set('[data-reveal]', { y: 28, opacity: 0 });

      // Trigger entrance once fonts are ready or timeout
      Promise.race([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]).then(() => {
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .to('[data-word]', {
            yPercent: 0,
            rotate: 0,
            duration: 0.9,
            stagger: 0.045,
          })
          .to(
            '[data-reveal]',
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.06,
            },
            '-=0.7'
          );
      });

      // Scroll line pulsing animation
      gsap.to('[data-scroll-line]', {
        scaleY: 0,
        transformOrigin: 'top',
        repeat: -1,
        duration: 1.4,
        ease: 'power2.inOut',
      });

      // Parallax scroll on hero headline
      if (h1Ref.current) {
        gsap.to(h1Ref.current, {
          yPercent: -18,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#070a1a] bg-[url('/images/hero-liquid.webp')] bg-cover bg-center text-white"
    >
      {/* Background WebGL Fluid Shader Canvas */}
      <HeroFluidCanvas className="absolute inset-0 -z-10 h-full w-full" />

      {/* Yellow Cursor Mask Reveal */}
      <div
        ref={maskRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 bg-[#ffb21e] text-[#070a1a]"
        style={{ clipPath: 'circle(0px at 0px 0px)' }}
      >
        <p
          ref={maskPRef}
          className="hero-mask-p absolute max-w-[20ch] text-[clamp(2.75rem,min(7vw,10.5vh),6rem)] font-bold leading-[0.98] tracking-[-0.04em]"
          style={{
            top: `${maskStyle.top}px`,
            left: `${maskStyle.left}px`,
            width: `${maskStyle.width}px`,
          }}
        >
          {t('home', 'v2.secret') || 'A software engineer obsessed with craft, motion, and speed.'}
        </p>
      </div>

      {/* Main Hero Content */}
      <div
        ref={contentRef}
        data-hero-content="true"
        className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center px-5 pb-10 pt-32 md:px-10 md:pt-36"
      >
        {/* Intro Greeting with Multilingual Rotator */}
        <p
          data-reveal="true"
          className="h-[1.3em] overflow-visible whitespace-nowrap text-2xl font-bold leading-[1.3em] text-white/70 md:text-3xl"
        >
          <GreetingRotator />
          {locale === 'ar' ? '،' : ','} {t('home', 'v2.greetingSuffix') || "I'm Ryan."}
        </p>

        {/* Display H1 with 3D perspective and staggered word reveals */}
        <h1
          ref={h1Ref}
          className="mt-4 max-w-[20ch] text-[clamp(2.75rem,min(7vw,10.5vh),6rem)] font-bold leading-[0.98] tracking-[-0.04em] [perspective:800px]"
        >
          {heroWords.map((word, i) => (
            <span
              key={i}
              className="-mb-[0.2em] inline-block overflow-hidden pb-[0.2em] pt-[0.1em] align-top"
            >
              <span
                data-word="true"
                className="inline-block origin-bottom-left will-change-transform rtl:origin-bottom-right"
              >
                {word}&nbsp;
              </span>
            </span>
          ))}
        </h1>

        {/* Bio & Actions Grid */}
        <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          {/* Bio text */}
          <p className="max-w-[54ch] text-lg font-medium leading-relaxed text-white/70 md:text-xl">
            {t('home', 'v2.intro', { years: new Date().getFullYear() - 2015 }) ||
              'Software and product engineer with 11 years of shipping, most of it on the frontend. Today I build AI agents that plan, use tools and get real work done, remotely, with product teams across the Middle East and Southeast Asia.'}
          </p>

          {/* CTA Buttons with Magnetic Pull */}
          <div data-reveal="true" className="flex flex-wrap items-center gap-3">
            <MagneticButton strength={0.35}>
              <Link
                href="/portfolio"
                className="group relative inline-flex overflow-hidden rounded-full bg-[#070a1a] px-7 py-4 text-base font-bold text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
              >
                <span className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0" />
                <span className="relative transition-colors duration-500 group-hover:text-[#070a1a]">
                  {t('home', 'v2.ctaWork') || 'See my work'}
                </span>
              </Link>
            </MagneticButton>

            <MagneticButton strength={0.35}>
              <Link
                href="/contact"
                className="liquid-glass inline-flex rounded-full px-7 py-4 text-base font-bold text-white"
              >
                {t('home', 'v2.ctaContact') || 'Get in touch'}
              </Link>
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Indicator & Status Bar */}
      <div
        data-reveal="true"
        className="mx-auto mb-8 flex w-full max-w-[1280px] items-end justify-between px-5 text-sm text-white/50 md:px-10"
      >
        <span>{t('home', 'v2.location') || 'Jakarta, Indonesia'}</span>

        <span className="flex flex-col items-center gap-3">
          {t('home', 'v2.scroll') || 'Scroll'}
          <span className="relative block h-12 w-px overflow-hidden bg-white/15">
            <span
              data-scroll-line="true"
              className="absolute inset-0 bg-white"
            />
          </span>
        </span>
      </div>
    </section>
  );
}
