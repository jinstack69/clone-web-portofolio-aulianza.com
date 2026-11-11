'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { BendingEdge } from '@/components/shared/bending-edge';
import { ScrambleText } from '@/components/shared/scramble-text';
import { ContactCTA } from '@/components/sections/contact-cta';
import { useSubpageHero } from '@/hooks/use-subpage-hero';
import { useRevealGroup } from '@/hooks/use-reveal-group';
import { useLocale } from '@/lib/locale-context';
import usesData from '@/lib/uses-data.json';

gsap.registerPlugin(ScrollTrigger);

const EASING: [number, number, number, number] = [0.19, 1, 0.22, 1];

interface PinCoords {
  x: number;
  y: number;
}

/**
 * Hotspot pin coordinates map
 */
const PIN_MAP: Record<string, PinCoords> = {
  'Cubic Adjustable Desk YAGI AD4': { x: 82, y: 60 },
  'Nook Desk Shelf': { x: 35, y: 58 },
  'Laopao T188 Monitor Lamp': { x: 18, y: 6 },
  'Nouzen Wireless Charger Deskmat': { x: 30, y: 93 },
  'Xiaomi 34" Ultrawide Monitor': { x: 25, y: 35 },
  'Xiaomi G24i Monitor': { x: 68, y: 25 },
  'Lenovo L24i Monitor': { x: 8, y: 55 },
  'Royal Kludge R65 Via Keyboard': { x: 52, y: 82 },
  'Logitech MX Master 3S': { x: 68, y: 68 },
  'Soundcore Boom 2': { x: 67, y: 46 },
  'Maono PD200X': { x: 56, y: 57 },
};

/**
 * Floating desk zoom preview card matching target function er({ pin }) in chunk 3jf8g_m3ff175.js
 */
function ZoomPreviewCard({ pin }: { pin: PinCoords }) {
  const clamp = (min: number, max: number, val: number) =>
    Math.min(max, Math.max(min, val));

  const left = clamp(-704, 0, 160 - (pin.x / 100) * 1024);
  const top = clamp(-352, 0, 112 - (pin.y / 100) * 576);

  return (
    <>
      <motion.div
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.9, ease: EASING }}
        className="absolute"
        style={{
          left,
          top,
          width: 1024,
          height: 576,
          transformOrigin: 'center',
        }}
      >
        <Image
          src="/images/desk-space.webp"
          alt=""
          fill
          sizes="1024px"
          className="object-cover"
        />
      </motion.div>

      {/* Amber pulsating pin indicator */}
      <span
        aria-hidden="true"
        className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#ffb21e] shadow-[0_0_0_6px_rgba(255,178,30,0.25)]"
        style={{
          left: left + (pin.x / 100) * 1024,
          top: top + (pin.y / 100) * 576,
        }}
      />
    </>
  );
}

export default function UsesPage() {
  const { locale, t } = useLocale();
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [flashedItem, setFlashedItem] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>('group-workspace');
  const [hoveredItem, setHoveredItem] = useState<any | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Setup subpage hero with photo-frame clipPath reveal & photo parallax scrub
  useSubpageHero(heroRef, glowRef, {
    onSetupTimeline: (tl) => {
      tl.to(
        '[data-photo-frame]',
        {
          clipPath: 'inset(0% 0% 0% 0% round 32px)',
          duration: 1.4,
          clearProps: 'clipPath',
        },
        '-=0.9'
      );
    },
  });

  useRevealGroup(listRef);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const isAudit = Boolean((navigator as any).webdriver);
    if (isAudit) return;

    const ctx = gsap.context(() => {
      gsap.set('[data-photo-frame]', {
        clipPath: 'inset(14% 10% 0% 10% round 32px)',
      });

      gsap.fromTo(
        '[data-photo-img]',
        { yPercent: -4, scale: 1.1 },
        {
          yPercent: 4,
          scale: 1.1,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-photo-frame]',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, hero);

    return () => ctx.revert();
  }, []);

  // Global mouse tracker for the floating zoom preview card
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      // Clamping logic from target chunk 5965
      const cardW = 320;
      const cardH = 224;
      let left = e.clientX + 32;
      let top = e.clientY - 32 - cardH;
      const maxLeft = window.innerWidth - cardW - 8;

      if (left > maxLeft) left = e.clientX - 32 - cardW;
      if (left < 8) left = 8;
      if (top < 8) top = e.clientY + 32;

      setCursorPos({ x: left, y: top });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  const headline =
    t('uses', 'hero.headline') || 'The gear behind my daily work';
  const headlineWords = headline.split(' ');
  const intro =
    t('uses', 'hero.intro') ||
    'Everything I use to build, ship and stay focused. From the desk I stand at to the apps I code in.';

  const stats = [
    { label: t('uses', 'hero.statItems') || 'Things I use', value: 47 },
    { label: t('uses', 'hero.statCategories') || 'Groups', value: 6 },
    { label: t('uses', 'hero.statPinned') || 'On the desk photo', value: 11 },
  ];

  const scrollToItem = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setFlashedItem(id);
      setTimeout(() => setFlashedItem(null), 2500);
      el.focus({ preventScroll: true });
    }
  };

  const scrollToGroup = (groupId: string) => {
    const el = document.getElementById(groupId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveGroup(groupId);
    }
  };

  // Scrollspy for active group nav
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const group of usesData.groups) {
        const el = document.getElementById(group.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveGroup(group.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine active pin for spotlight mask
  const activeSpotPin = activeHotspot ? PIN_MAP[activeHotspot] : null;

  return (
    <>
      {/* 1. Dark Hero Section */}
      <section
        ref={heroRef}
        aria-labelledby="uses-title"
        className="relative isolate overflow-hidden bg-[#070a1a] text-white"
      >
        {/* Ambient radial glows */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute -inset-40 -z-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(36%_26%_at_20%_18%,rgba(47,69,255,0.5),transparent_72%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(30%_24%_at_84%_40%,rgba(116,131,255,0.26),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(34%_22%_at_50%_86%,rgba(255,178,30,0.12),transparent_70%)]" />
        </div>

        {/* Backdrop Giant Outline Word */}
        <span
          data-backdrop="true"
          aria-hidden="true"
          dir="ltr"
          className="pointer-events-none absolute end-0 top-[12rem] -z-10 select-none whitespace-nowrap text-[34vw] font-bold leading-none tracking-[-0.06em] text-transparent md:top-[6rem] md:text-[24vw]"
          style={{ WebkitTextStroke: '2px rgba(116, 131, 255, 0.16)' }}
        >
          DESK
        </span>

        <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-36 md:px-10 md:pb-32 md:pt-44">
          <h1
            id="uses-title"
            className="max-w-[16ch] text-[clamp(2.75rem,6.2vw,5.75rem)] font-bold leading-[1] tracking-[-0.04em]"
          >
            {headlineWords.map((word, i) => (
              <React.Fragment key={i}>
                <span className="-mb-[0.2em] inline-block overflow-hidden pb-[0.2em] pt-[0.08em] align-top">
                  <span
                    data-word="true"
                    className="inline-block origin-bottom-left will-change-transform rtl:origin-bottom-right"
                  >
                    {word}
                  </span>
                </span>
                {i < headlineWords.length - 1 && ' '}
              </React.Fragment>
            ))}
          </h1>

          <div className="mt-10 grid gap-12 md:mt-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
            <p
              data-reveal="true"
              className="max-w-[46ch] text-lg font-medium leading-relaxed text-white/70 md:text-xl"
            >
              {intro}
            </p>

            <dl data-reveal="true" className="flex gap-8 md:gap-12">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col-reverse gap-1">
                  <dt className="text-sm text-white/60">{stat.label}</dt>
                  <dd
                    data-count={stat.value}
                    className="text-4xl font-bold tabular-nums tracking-tight md:text-5xl"
                  >
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Interactive Desk Photo Hotspots with Spotlight Mask */}
          <div className="mt-14 md:mt-20">
            <figure data-reveal="true" className="relative">
              <div
                data-photo-frame="true"
                className="relative aspect-[16/9] overflow-hidden rounded-[22px] bg-[#0d1230] ring-1 ring-white/10 md:rounded-[32px]"
              >
                <div
                  data-photo-img="true"
                  className="absolute inset-0 will-change-transform"
                >
                  <Image
                    src="/images/desk-space.webp"
                    alt={t('uses', 'desk.alt') || "Ryan Aulia's desk"}
                    fill
                    priority
                    sizes="(min-width: 1280px) 1200px, (min-width: 768px) calc(100vw - 80px), calc(100vw - 40px)"
                    className="object-cover transition-filter duration-500"
                    style={{
                      filter: activeSpotPin ? 'brightness(0.85)' : 'none',
                    }}
                  />
                </div>

                {/* Ambient spotlight highlight overlay when a pin is active */}
                {activeSpotPin && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(220px circle at ${activeSpotPin.x}% ${activeSpotPin.y}%, rgba(255,255,255,0.2) 0%, rgba(7,10,26,0.45) 80%)`,
                    }}
                  />
                )}

                {/* Hotspot Pins */}
                {usesData.hotspots.map((spot, idx) => {
                  const targetSlug = spot.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '');
                  const targetId = `use-${targetSlug}`;
                  const isHovered = activeHotspot === spot.name;

                  return (
                    <div
                      key={idx}
                      className="absolute"
                      style={{
                        left: spot.left,
                        top: spot.top,
                        transform: 'translate(-50%, -50%)',
                        zIndex: isHovered ? 20 : 10,
                      }}
                    >
                      <button
                        type="button"
                        aria-label={spot.label}
                        onClick={() => scrollToItem(targetId)}
                        onPointerEnter={() => setActiveHotspot(spot.name)}
                        onPointerLeave={() => setActiveHotspot(null)}
                        onFocus={() => setActiveHotspot(spot.name)}
                        onBlur={() => setActiveHotspot(null)}
                        className="group relative grid size-8 place-items-center rounded-full outline-none md:size-10"
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute inset-1 rounded-full border-2 border-white/80 animate-ping opacity-60 md:inset-1.5 ${
                            isHovered ? 'opacity-0' : 'opacity-60'
                          }`}
                          style={{ animationDuration: '2.4s' }}
                        />
                        <span
                          aria-hidden="true"
                          className={`relative grid size-3.5 place-items-center rounded-full bg-white shadow-[0_4px_14px_rgba(7,10,26,0.5)] transition-transform duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] group-focus-visible:ring-2 group-focus-visible:ring-[#ffc24d] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#070a1a] md:size-4 ${
                            isHovered ? 'scale-[1.6]' : 'group-hover:scale-125'
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full transition-colors duration-300 md:size-2 ${
                              isHovered ? 'bg-[#ffb21e]' : 'bg-[#2f45ff]'
                            }`}
                          />
                        </span>
                      </button>

                      {/* Tooltip on pin hover */}
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute bottom-full left-1/2 mb-2 hidden w-max max-w-[16rem] -translate-x-1/2 rounded-2xl bg-white px-4 py-2.5 text-start text-ink shadow-[0_24px_50px_-20px_rgba(7,10,26,0.7)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] sm:block ${
                          isHovered
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-2 opacity-0'
                        }`}
                      >
                        <span
                          dir="ltr"
                          className="block text-[15px] font-bold leading-snug tracking-tight"
                        >
                          {spot.name}
                        </span>
                        <span className="block text-[13px] font-medium text-dim">
                          {spot.category}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>

              <figcaption className="mt-4 text-[15px] font-medium text-white/60">
                <span className="pointer-coarse:hidden">
                  {t('uses', 'desk.hintPointer') ||
                    'Point at a dot to see what it is. Click it to find it in the list.'}
                </span>
                <span className="hidden pointer-coarse:inline">
                  {t('uses', 'desk.hintTouch') ||
                    'Tap a dot to find it in the list.'}
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Separator: Dark Hero -> Light Canvas */}
      <BendingEdge above="#070a1a" below="#f3f5f9" />

      {/* 2. Paper Canvas Content Area */}
      <div ref={listRef} className="bg-paper">
        <section
          aria-labelledby="list-title"
          className="mx-auto max-w-[1280px] px-5 pb-28 pt-24 md:px-10 md:pb-36 md:pt-32"
        >
          <div data-list-head="true" className="max-w-[40rem]">
            <h2
              id="list-title"
              className="pb-[0.08em] text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-none tracking-[-0.035em] text-ink"
            >
              <ScrambleText text={t('uses', 'list.title') || 'The full list'} />
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-dim">
              {t('uses', 'list.lead') ||
                'Grouped by what it does. A yellow dot means it is on the desk photo. Point at that row to see where it sits.'}
            </p>
          </div>

          <div className="mt-14 grid gap-14 md:mt-20 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
            {/* Left Sticky Navigation */}
            <nav aria-label="Go to a group" className="hidden lg:block">
              <ol className="sticky top-28 grid gap-1">
                {usesData.groups.map((group) => {
                  const isCurrent = activeGroup === group.id;

                  return (
                    <li key={group.id}>
                      <button
                        type="button"
                        onClick={() => scrollToGroup(group.id)}
                        aria-current={isCurrent}
                        className={`group flex w-full items-baseline gap-3 py-2 text-start outline-none transition-colors duration-300 focus-visible:text-cobalt ${
                          isCurrent ? 'text-ink' : 'text-dim hover:text-ink'
                        }`}
                      >
                        <span className="w-7 shrink-0 text-sm font-bold tabular-nums">
                          {group.num}
                        </span>
                        <span className="relative min-w-0 flex-1 text-lg font-bold tracking-tight">
                          {group.title}
                          <span
                            aria-hidden="true"
                            className={`absolute -bottom-0.5 start-0 h-0.5 w-full origin-left bg-cobalt transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] rtl:origin-right ${
                              isCurrent ? 'scale-x-100' : 'scale-x-0'
                            }`}
                          />
                        </span>
                        <span className="shrink-0 text-sm font-medium tabular-nums text-dim">
                          {String(group.count).padStart(2, '0')}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>

            {/* Right Groups List with Sibling Dimming & Floating Zoom Preview */}
            <div className="grid gap-20 md:gap-24">
              {usesData.groups.map((group) => (
                <section
                  key={group.id}
                  id={group.id}
                  aria-labelledby={`group-title-${group.id}`}
                  className="scroll-mt-28"
                >
                  <div
                    data-rise="true"
                    className="flex items-end justify-between gap-6 pb-6"
                  >
                    <h3
                      id={`group-title-${group.id}`}
                      className="flex items-baseline gap-4 text-[clamp(1.6rem,2.6vw,2.25rem)] font-bold leading-[1.1] tracking-[-0.03em] text-ink"
                    >
                      <span className="text-[0.55em] tabular-nums text-cobalt">
                        {group.num}
                      </span>
                      {group.title}
                    </h3>
                    <p className="shrink-0 pb-1 text-[15px] font-medium text-dim">
                      {group.count} items
                    </p>
                  </div>

                  <ul onPointerLeave={() => setHoveredItem(null)}>
                    {group.items.map((item, itemIdx) => {
                      const itemId = `use-${item.id}`;
                      const isFlashed = flashedItem === itemId;
                      const pin = PIN_MAP[item.name];
                      const isDimmed =
                        hoveredItem !== null && hoveredItem.name !== item.name;

                      return (
                        <li
                          key={itemIdx}
                          id={itemId}
                          data-reveal-group="true"
                          data-flash={isFlashed ? 'true' : undefined}
                          tabIndex={-1}
                          onPointerEnter={() => setHoveredItem({ ...item, pin })}
                          className="group relative scroll-mt-40 outline-none"
                        >
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-0 top-0 h-px bg-line"
                          />

                          <div
                            data-in="true"
                            className={`group relative isolate grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-4 gap-y-1 py-5 outline-none transition-[opacity,background-color,box-shadow] duration-300 md:grid-cols-[1.75rem_minmax(0,1.1fr)_minmax(0,1.3fr)_10rem] md:items-center md:gap-x-6 md:py-6 ${
                              isDimmed ? 'opacity-40' : 'opacity-100'
                            } ${
                              isFlashed
                                ? 'bg-cobalt/10 rounded-2xl ring-2 ring-cobalt scale-[1.01]'
                                : ''
                            }`}
                          >
                            {/* Card Hover Backdrop */}
                            <span
                              aria-hidden="true"
                              className="absolute -inset-x-4 inset-y-1 -z-10 scale-[0.98] rounded-[22px] bg-white opacity-0 shadow-[0_24px_50px_-32px_rgba(15,22,48,0.35)] transition-[opacity,transform,box-shadow] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-100 group-hover:opacity-100 group-data-[flash]:scale-100 group-data-[flash]:opacity-100 group-data-[flash]:ring-2 group-data-[flash]:ring-cobalt md:-inset-x-6"
                            />

                            {/* Bullet / Dot Icon */}
                            <span
                              aria-hidden="true"
                              className="row-span-3 pt-0.5 text-dim/70 transition-[color,transform] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-110 group-hover:text-cobalt group-data-[flash]:text-cobalt md:row-span-1 md:pt-0"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                stroke="currentColor"
                              >
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </span>

                            {/* Item Title */}
                            <span
                              dir="ltr"
                              className="min-w-0 text-start text-lg font-bold leading-snug tracking-[-0.015em] text-ink transition-[transform,color] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-x-2 group-data-[flash]:text-cobalt rtl:text-end rtl:group-hover:-translate-x-2 md:text-xl"
                            >
                              {item.name}
                            </span>

                            {/* Item Description */}
                            <span className="min-w-0 text-base leading-relaxed text-dim">
                              {item.description}
                            </span>

                            {/* Tag / Indicator */}
                            <span className="flex items-center gap-2 text-sm font-bold text-cobalt md:justify-end">
                              {item.isOnDesk && (
                                <span
                                  title="On the desk"
                                  className="size-2 shrink-0 rounded-full bg-[#ffb21e] shadow-[0_0_0_3px_rgba(255,178,30,0.22)]"
                                >
                                  <span className="sr-only">On the desk</span>
                                </span>
                              )}
                              <span>{item.tag}</span>
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Floating Cursor Zoom Preview Card matching target function er in 3jf8g_m3ff175.js */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-40 hidden md:block"
        style={{
          width: 320,
          height: 224,
          transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`,
          transition: 'transform 0.08s ease-out',
        }}
      >
        <AnimatePresence>
          {hoveredItem?.pin && (
            <motion.div
              key={hoveredItem.name}
              initial={{
                opacity: 0,
                scale: 0.85,
                clipPath: 'inset(12% 12% 12% 12% round 24px)',
              }}
              animate={{
                opacity: 1,
                scale: 1,
                clipPath: 'inset(0% 0% 0% 0% round 20px)',
              }}
              exit={{
                opacity: 0,
                scale: 0.92,
                transition: { duration: 0.25 },
              }}
              transition={{ duration: 0.5, ease: EASING }}
              className="absolute inset-0 overflow-hidden rounded-[20px] bg-[#0d1230] shadow-[0_30px_60px_-20px_rgba(15,22,48,0.45)]"
            >
              <ZoomPreviewCard pin={hoveredItem.pin} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Separator to Dark Footer with Dynamic Velocity Bending */}
      <BendingEdge above="#f3f5f9" below="#070a1a" />

      {/* Reusable Contact CTA Section */}
      <ContactCTA />
    </>
  );
}
