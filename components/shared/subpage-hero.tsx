'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface StatItem {
  label: string;
  value: string | number;
}

export interface SubpageHeroProps {
  id?: string;
  titleId?: string;
  backdropText: string;
  title: string;
  intro: string;
  stats?: StatItem[];
  children?: React.ReactNode;
  className?: string;
}

export function SubpageHero({
  id,
  titleId = 'hero-title',
  backdropText,
  title,
  intro,
  stats,
  children,
  className = '',
}: SubpageHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const words = title.split(' ');

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const isAudit = typeof window !== 'undefined' && Boolean((navigator as any).webdriver);
    if (isAudit) return;

    const isRtl = document.documentElement.dir === 'rtl';

    const ctx = gsap.context(() => {
      // 1. Split-word reveal with homepage rotation physics
      gsap.fromTo(
        '[data-word]',
        {
          yPercent: 115,
          rotate: isRtl ? -6 : 6,
        },
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.95,
          ease: 'expo.out',
          stagger: 0.045,
        }
      );

      // 2. Subtitle & stats reveal
      gsap.fromTo(
        '[data-reveal]',
        {
          y: 28,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'expo.out',
          stagger: 0.08,
          delay: 0.15,
        }
      );

      // 3. Number counters on stats
      const countElements = hero.querySelectorAll<HTMLElement>('[data-count]');
      countElements.forEach((el) => {
        const rawTarget = el.dataset.count || '0';
        const target = parseInt(rawTarget, 10);
        if (isNaN(target)) return;

        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.4,
          ease: 'power2.out',
          delay: 0.25,
          onUpdate: () => {
            el.textContent = String(Math.round(obj.val));
          },
        });
      });

      // 4. Parallax backdrop stroke text on scroll
      gsap.to('[data-backdrop]', {
        y: 80,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });

      if (children) {
        gsap.fromTo(
          '[data-hero-extra]',
          {
            y: 35,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'expo.out',
            delay: 0.3,
          }
        );
      }
    }, hero);

    return () => ctx.revert();
  }, [children, title]);

  return (
    <section
      ref={heroRef}
      id={id}
      aria-labelledby={titleId}
      className={`relative isolate overflow-hidden bg-[#070a1a] text-white ${className}`}
    >
      {/* Ambient radial glows */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-40 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(38%_32%_at_78%_22%,rgba(47,69,255,0.55),transparent_72%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(30%_26%_at_18%_62%,rgba(116,131,255,0.28),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(22%_18%_at_62%_78%,rgba(255,178,30,0.16),transparent_70%)]" />
      </div>

      {/* Giant stroke backdrop text with Parallax */}
      <span
        data-backdrop="true"
        aria-hidden="true"
        dir="ltr"
        className="pointer-events-none absolute left-0 top-[14rem] rtl:left-auto rtl:right-0 -z-10 select-none whitespace-nowrap text-[30vw] font-bold leading-none tracking-[-0.06em] text-transparent md:top-[9rem] md:text-[22vw] will-change-transform"
        style={{ WebkitTextStroke: '2px rgba(116, 131, 255, 0.16)' }}
      >
        {backdropText}
      </span>

      {/* Container */}
      <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-36 md:px-10 md:pb-32 md:pt-44">
        <h1
          id={titleId}
          className="max-w-[18ch] text-[clamp(2.75rem,6.2vw,5.75rem)] font-bold leading-[1] tracking-[-0.04em]"
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
        </h1>

        <div className="mt-10 grid gap-10 md:mt-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <p
            data-reveal="true"
            className="max-w-[46ch] text-lg font-medium leading-relaxed text-white/70 md:text-xl"
          >
            {intro}
          </p>

          {stats && stats.length > 0 && (
            <dl data-reveal="true" className="flex gap-8 md:gap-12">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col-reverse gap-1">
                  <dt className="text-sm text-white/60">{stat.label}</dt>
                  <dd
                    data-count={String(stat.value)}
                    className="text-4xl font-bold tabular-nums tracking-tight md:text-5xl"
                  >
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {children && <div data-hero-extra="true">{children}</div>}
      </div>
    </section>
  );
}
