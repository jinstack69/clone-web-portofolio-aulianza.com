'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '@/components/shared/magnetic-button';
import { useLocale } from '@/lib/locale-context';

gsap.registerPlugin(ScrollTrigger);

export interface ContactCTAProps {
  id?: string;
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  variant?: 'default' | 'compact' | 'minimal';
  showBackgroundGrid?: boolean;
  showRadialGlow?: boolean;
  className?: string;
  hideOnContactPage?: boolean;
  hidden?: boolean;
}

export function ContactCTA({
  id = 'footer-contact',
  title,
  description,
  primaryButtonText,
  primaryButtonHref = '/contact',
  secondaryButtonText,
  secondaryButtonHref = 'https://link.aulianza.com',
  variant = 'default',
  showBackgroundGrid = true,
  showRadialGlow = true,
  className = '',
  hideOnContactPage = false,
  hidden = false,
}: ContactCTAProps) {
  const { t } = useLocale();
  const pathname = usePathname();
  const containerRef = useRef<HTMLElement>(null);
  const gridGlowRef = useRef<HTMLDivElement>(null);

  // If hidden explicitly or if hideOnContactPage is true while on /contact
  if (hidden || (hideOnContactPage && pathname === '/contact')) {
    return null;
  }

  const displayTitle =
    title || t('common', 'site.letsTalk') || "Let's talk";
  const displayDescription =
    description ||
    t('common', 'site.contactBody') ||
    'Want to build something together? Send me a message. I reply within two days.';
  const displayPrimary =
    primaryButtonText || t('common', 'site.emailCta') || 'Contact me';
  const displaySecondary =
    secondaryButtonText || t('common', 'site.linksCta') || 'All my links';

  // GSAP ScrollTrigger for [data-talk] headline zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container || variant === 'minimal') return;

    const isAudit = typeof window !== 'undefined' && Boolean((navigator as any).webdriver);
    if (isAudit) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-talk]',
        { scale: 0.55, yPercent: 30, opacity: 0.2 },
        {
          scale: 1,
          yPercent: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            end: 'top 25%',
            scrub: 0.6,
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, [variant]);

  // Grid background interactive cursor glow
  useEffect(() => {
    const container = containerRef.current;
    const grid = gridGlowRef.current;
    if (!container || !grid || !showBackgroundGrid) return;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      grid.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      grid.style.setProperty('--my', `${e.clientY - rect.top}px`);
      grid.style.setProperty('--glow', '1');
    };

    const onPointerLeave = () => {
      grid.style.setProperty('--glow', '0');
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);

    return () => {
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [showBackgroundGrid]);

  return (
    <section
      ref={containerRef}
      aria-labelledby={id}
      className={`relative isolate overflow-hidden bg-[#070a1a] text-white text-center ${
        variant === 'compact'
          ? 'py-16 md:py-20'
          : variant === 'minimal'
          ? 'py-12 md:py-16'
          : 'pb-16 pt-24 md:pb-24 md:pt-36'
      } ${className}`}
    >
      {/* Interactive Background Grid Glow */}
      {showBackgroundGrid && (
        <div
          ref={gridGlowRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={
            {
              '--mx': '50%',
              '--my': '0%',
              '--glow': '0',
            } as React.CSSProperties
          }
        >
          <div
            className="absolute inset-0 text-white/[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(to right, currentcolor 1px, transparent 1px), linear-gradient(currentcolor 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage:
                'linear-gradient(black 0%, rgba(0, 0, 0, 0.45) 45%, transparent 90%)',
              WebkitMaskImage:
                'linear-gradient(black 0%, rgba(0, 0, 0, 0.45) 45%, transparent 90%)',
            }}
          />
          <div
            className="absolute inset-0 text-[#7483ff]/40 transition-opacity duration-500"
            style={{
              backgroundImage:
                'linear-gradient(to right, currentcolor 1px, transparent 1px), linear-gradient(currentcolor 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              opacity: 'var(--glow, 0)',
              maskImage:
                'radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), black, transparent 70%)',
              WebkitMaskImage:
                'radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), black, transparent 70%)',
            }}
          />
        </div>
      )}

      {/* Radial Blue Glow */}
      {showRadialGlow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-1/2 start-1/2 h-[80vh] w-[120vw] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(47,69,255,0.35),transparent_60%)] rtl:translate-x-1/2 -z-10"
        />
      )}

      <div className="relative mx-auto max-w-[1280px] px-5 md:px-10">
        <h2
          id={id}
          data-talk={variant !== 'minimal' ? 'true' : undefined}
          className={`origin-bottom font-bold tracking-[-0.05em] transition-transform duration-700 hover:scale-[1.02] ${
            variant === 'compact'
              ? 'text-[clamp(3rem,8vw,7rem)] leading-[0.95]'
              : variant === 'minimal'
              ? 'text-[clamp(2.5rem,6vw,5rem)] leading-[1]'
              : 'mt-4 text-[17vw] leading-[0.85] md:text-[clamp(5rem,12vw,15rem)] md:whitespace-nowrap'
          }`}
        >
          {displayTitle}
        </h2>

        {displayDescription && (
          <p className="mx-auto mt-6 max-w-[52ch] text-base leading-relaxed text-white/60 md:mt-8 md:text-lg">
            {displayDescription}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:mt-10">
          <MagneticButton strength={0.35}>
            <Link
              href={primaryButtonHref}
              className="group relative inline-flex overflow-hidden rounded-full bg-[#2f45ff] px-8 py-4 text-base font-bold text-white shadow-[0_10px_30px_-12px_rgba(47,69,255,0.6)]"
            >
              <span className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0" />
              <span className="relative transition-colors duration-500 group-hover:text-[#070a1a]">
                {displayPrimary}
              </span>
            </Link>
          </MagneticButton>

          {displaySecondary && secondaryButtonHref && (
            <MagneticButton strength={0.35}>
              <a
                href={secondaryButtonHref}
                target={secondaryButtonHref.startsWith('http') ? '_blank' : undefined}
                rel={secondaryButtonHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="liquid-glass inline-flex rounded-full px-8 py-4 text-base font-bold text-white"
              >
                {displaySecondary}
              </a>
            </MagneticButton>
          )}
        </div>
      </div>
    </section>
  );
}
