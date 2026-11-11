'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { BendingEdge } from '@/components/shared/bending-edge';
import { ScrambleText } from '@/components/shared/scramble-text';
import { SectionHeading } from '@/components/shared/section-heading';
import { ContactCTA } from '@/components/sections/contact-cta';
import { useSubpageHero } from '@/hooks/use-subpage-hero';
import { useRevealGroup } from '@/hooks/use-reveal-group';
import { useLocale } from '@/lib/locale-context';
import i18nData from '@/lib/i18n-data.json';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* -------------------------------------------------------------------------- */
/* Easing Curves & Motion Data (from target chunk 0_igzv82kr3ao.js)           */
/* -------------------------------------------------------------------------- */
const CURVES = [
  { id: 'expo', name: 'Expo out', bezier: [0.19, 1, 0.22, 1], ms: 900, use: 'Reveals, hovers and most transitions' },
  { id: 'crossfade', name: 'Page crossfade', bezier: [0.33, 0, 0.2, 1], ms: 450, use: 'The fade between pages, 450ms' },
  { id: 'inout', name: 'Expo in and out', bezier: [0.76, 0, 0.24, 1], ms: 800, use: 'The trip back to the top' },
  { id: 'linear', name: 'Linear', bezier: [0, 0, 1, 1], ms: 600, use: 'Motion tied to the scroll' },
];

const formatBezier = (c: { bezier: number[] }) => `cubic-bezier(${c.bezier.join(', ')})`;

/* -------------------------------------------------------------------------- */
/* Generative Cover Generator (from target chunk 1pj0djp7losmw.js)            */
/* -------------------------------------------------------------------------- */
const COVER_PALETTES = [
  { bg: '#2f45ff', a: '#ffffff', b: '#ffb21e', text: '#ffffff' },
  { bg: '#ffb21e', a: '#0f1630', b: '#2f45ff', text: '#0f1630' },
  { bg: '#0f1630', a: '#7483ff', b: '#ffb21e', text: '#ffffff' },
  { bg: '#7483ff', a: '#0f1630', b: '#ffffff', text: '#0f1630' },
  { bg: '#ffffff', a: '#2f45ff', b: '#0f1630', text: '#0f1630' },
  { bg: '#19c39c', a: '#0f1630', b: '#ffffff', text: '#0f1630' },
];

const MOTION_HOVER_CLASS =
  'transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] [transform-box:fill-box] [transform-origin:center]';

function fnv1aHash(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x1000193);
  }
  return hash >>> 0;
}

function GenerativePattern({ seed, a, b }: { seed: number; a: string; b: string }) {
  let state = seed || 1;
  const prng = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 10000) / 10000;
  };

  const patternType = seed % 4;

  if (patternType === 0) {
    const cx = 260 + 80 * prng();
    const cy = 90 + 60 * prng();
    return (
      <g className={`${MOTION_HOVER_CLASS} group-hover:-translate-x-6 group-hover:rotate-12`}>
        {[150, 115, 80, 45].map((r, i) => (
          <circle
            key={r}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={i % 2 ? b : a}
            strokeWidth={14}
          />
        ))}
      </g>
    );
  }

  if (patternType === 1) {
    const wedges = Array.from({ length: 8 }, (_, i) => ({
      x: (i % 4) * 80 + 80,
      y: 80 * Math.floor(i / 4),
      rot: 90 * Math.floor(4 * prng()),
      color: prng() > 0.5 ? a : b,
    }));
    return (
      <g>
        {wedges.map((w, idx) => (
          <path
            key={idx}
            d="M0 0 H80 A80 80 0 0 1 0 80 Z"
            fill={w.color}
            transform={`translate(${w.x + 40} ${w.y + 40}) rotate(${w.rot}) translate(-40 -40)`}
            className={`${MOTION_HOVER_CLASS} ${idx % 2 ? 'group-hover:rotate-90' : 'group-hover:-rotate-90'}`}
          />
        ))}
      </g>
    );
  }

  if (patternType === 2) {
    return (
      <g>
        <g className={`${MOTION_HOVER_CLASS} group-hover:translate-x-8`}>
          {Array.from({ length: 9 }, (_, i) => (
            <rect
              key={i}
              x={46 * i - 40}
              y={-40}
              width={18}
              height={360}
              fill={a}
              transform="rotate(28 200 150)"
            />
          ))}
        </g>
        <circle
          cx={300 + 40 * prng()}
          cy={80 + 40 * prng()}
          r={70}
          fill={b}
          className={`${MOTION_HOVER_CLASS} group-hover:scale-125`}
        />
      </g>
    );
  }

  return (
    <g>
      <g className={`${MOTION_HOVER_CLASS} group-hover:-translate-y-4`}>
        {Array.from({ length: 70 }, (_, i) => (
          <circle
            key={i}
            cx={(i % 10) * 40 + 20}
            cy={40 * Math.floor(i / 10) + 20}
            r={4 + 4 * prng()}
            fill={a}
            opacity={0.85}
          />
        ))}
      </g>
      <path
        d={`M${200 + 120 * prng()} 0 a110 110 0 0 1 0 220 Z`}
        fill={b}
        className={`${MOTION_HOVER_CLASS} group-hover:rotate-180`}
      />
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/* Lighthouse Animated Circular Gauge (from chunk 0317gscv0l3ad.js)           */
/* -------------------------------------------------------------------------- */
function LighthouseGauge({
  label,
  score,
  inView,
  delay = 0,
}: {
  label: string;
  score: number;
  inView: boolean;
  delay?: number;
}) {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const isAudit = Boolean((navigator as any).webdriver);
    if (isAudit) {
      setCurrentScore(score);
      return;
    }

    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: score,
      duration: 1.4,
      delay,
      ease: 'power3.out',
      onUpdate: () => setCurrentScore(Math.round(obj.v)),
    });
    return () => {
      tween.kill();
    };
  }, [inView, score, delay]);

  return (
    <li className="flex flex-col items-center gap-4 text-center">
      <span className="relative block h-28 w-28 md:h-32 md:w-32">
        <svg viewBox="0 0 120 120" aria-hidden="true" className="h-full w-full -rotate-90 rtl:-scale-y-100">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="#19c39c"
            strokeWidth="8"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100"
            style={{
              strokeDashoffset: inView ? 100 - score : 100,
              transition: `stroke-dashoffset 1.4s cubic-bezier(0.19,1,0.22,1) ${delay}s`,
            }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold tabular-nums">
          {currentScore}
        </span>
      </span>
      <span className="text-base text-white/70">{label}</span>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/* Luminance & Contrast Formula (from chunk 0317gscv0l3ad.js)                 */
/* -------------------------------------------------------------------------- */
const DARK_BG = [7, 10, 26];

function channelLuminance(c: number): number {
  const val = c / 255;
  return val <= 0.03928 ? val / 12.92 : ((val + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance([r, g, b]: number[]): number {
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

function calculateContrastRatio(opacity: number): number {
  const norm = opacity / 100;
  const blendedColor = DARK_BG.map((bg) => 255 * norm + (1 - norm) * bg);
  return (relativeLuminance(blendedColor) + 0.05) / (relativeLuminance(DARK_BG) + 0.05);
}

/* -------------------------------------------------------------------------- */
/* Section 2: Request Steps Component (From Click to Paint)                   */
/* -------------------------------------------------------------------------- */
interface StepItem {
  code: string;
  title: string;
  body: string;
}

const DEFAULT_STEPS: StepItem[] = [
  {
    code: 'revalidate: 300',
    title: 'Ready HTML from the cache',
    body: 'Pages are built ahead of time and rebuilt in the background every few minutes. You get a finished page, not a fresh render.',
  },
  {
    code: 'getStaticProps()',
    title: 'Fresh data on each rebuild',
    body: 'Each rebuild reads posts and projects from the database through Prisma.',
  },
  {
    code: 'serverSideTranslations()',
    title: 'Text in your language',
    body: 'The page sends only the text it needs, in English or Arabic. Arabic flips the layout right to left.',
  },
  {
    code: 'size-adjust: 123.81%',
    title: 'First paint with no jump',
    body: 'A fallback font sized to match AulianzaSans shows first, so the text does not move when the real font loads.',
  },
  {
    code: 'next/dynamic',
    title: 'React takes over',
    body: 'React 19 hydrates the HTML. Sections below the fold load in their own small chunks.',
  },
  {
    code: 'requestIdleCallback()',
    title: 'Extras wait their turn',
    body: 'Smooth scroll and other extras start only when the browser is free.',
  },
  {
    code: 'document.startViewTransition()',
    title: 'The next page',
    body: 'When you click a link, the browser crossfades the old page into the new one.',
  },
];

function formatStepNumber(n: number, loc: string) {
  return new Intl.NumberFormat(loc === 'ar' ? 'ar-EG' : 'en-US', {
    minimumIntegerDigits: 2,
  }).format(n);
}

function RequestStepsSection() {
  const { locale, t } = useLocale();
  const listRef = useRef<HTMLOListElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const steps: StepItem[] = useMemo(() => {
    const list =
      (i18nData as any)[locale]?.['under-the-hood']?.request?.steps ||
      (i18nData as any)['en']?.['under-the-hood']?.request?.steps;
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_STEPS;
  }, [locale]);

  useLayoutEffect(() => {
    const listEl = listRef.current;
    const lineEl = lineRef.current;
    const progressEl = progressRef.current;
    if (!listEl || !lineEl || !progressEl) return;

    const isReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dots = Array.from(listEl.querySelectorAll<HTMLElement>('[data-dot]'));
    if (dots.length === 0) return;

    const getCenterY = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      return rect.top + rect.height / 2;
    };

    const updateLinePosition = () => {
      const listRect = listEl.getBoundingClientRect();
      const topOffset = getCenterY(dots[0]) - listRect.top;
      const totalHeight = getCenterY(dots[dots.length - 1]) - getCenterY(dots[0]);
      lineEl.style.top = `${topOffset}px`;
      lineEl.style.height = `${Math.max(0, totalHeight)}px`;
    };

    let rafId = 0;
    const onScroll = () => {
      rafId = 0;
      const targetY = 0.62 * window.innerHeight;
      const firstDotY = getCenterY(dots[0]);
      const lastDotY = getCenterY(dots[dots.length - 1]);
      const progress = gsap.utils.clamp(
        0,
        1,
        (targetY - firstDotY) / Math.max(1, lastDotY - firstDotY)
      );
      progressEl.style.transform = `scaleY(${isReduced ? 1 : progress})`;

      let currentActive = 0;
      dots.forEach((dot, idx) => {
        if (getCenterY(dot) <= targetY) {
          currentActive = idx;
        }
      });
      setActiveStepIndex(currentActive);
    };

    const scheduleScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(onScroll);
      }
    };

    const onResize = () => {
      updateLinePosition();
      scheduleScroll();
    };

    updateLinePosition();
    onScroll();

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(listEl);
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // Fade-in animation with GSAP for steps below viewport
    const stepsBelow = isReduced
      ? []
      : Array.from(listEl.querySelectorAll<HTMLElement>('[data-step]')).filter(
          (el) => el.getBoundingClientRect().top > window.innerHeight
        );

    stepsBelow.forEach((el) => {
      gsap.set(el.querySelectorAll('[data-fade]'), { y: 24, opacity: 0 });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            gsap.to(entry.target.querySelectorAll('[data-fade]'), {
              y: 0,
              opacity: 1,
              duration: 0.9,
              ease: 'expo.out',
              stagger: 0.06,
            });
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px' }
    );

    stepsBelow.forEach((el) => observer.observe(el));

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      observer.disconnect();
      window.removeEventListener('scroll', scheduleScroll);
      window.removeEventListener('resize', onResize);
      listEl.querySelectorAll('[data-fade]').forEach((el) => {
        gsap.set(el, { clearProps: 'all' });
      });
    };
  }, [locale]);

  const activeStep = steps[activeStepIndex] ?? steps[0];

  return (
    <section aria-labelledby="request-title" className="bg-paper text-ink">
      <div className="mx-auto grid max-w-[1280px] gap-14 px-5 pb-28 pt-24 md:px-10 md:pb-36 md:pt-32 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2
            id="request-title"
            className="pb-[0.08em] text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.035em]"
          >
            <ScrambleText text={t('under-the-hood', 'request.title') || 'From click to paint'} />
          </h2>
          <p className="mt-5 max-w-[38ch] text-lg leading-relaxed text-dim">
            {t('under-the-hood', 'request.intro') ||
              'What happens when you open a page here, step by step.'}
          </p>

          <div aria-hidden="true" className="mt-12 hidden border-t border-line pt-8 lg:block">
            <div className="flex items-end gap-6">
              <div className="relative h-[7.5rem] w-[9.5rem] shrink-0 overflow-hidden">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={activeStepIndex}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
                    className="absolute inset-x-0 bottom-0 block text-[7rem] font-bold leading-[1] tracking-[-0.06em] text-cobalt tabular-nums"
                  >
                    {formatStepNumber(activeStepIndex + 1, locale)}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="min-w-0 pb-3">
                <p className="text-sm text-dim">
                  {t('under-the-hood', 'request.of', {
                    total: formatStepNumber(steps.length, locale),
                  }) || `of ${formatStepNumber(steps.length, locale)} steps`}
                </p>
                <p dir="ltr" className="mt-1 truncate font-mono text-base text-ink rtl:text-end">
                  {activeStep?.code}
                </p>
              </div>
            </div>
          </div>
        </div>

        <ol ref={listRef} className="relative">
          <span
            ref={lineRef}
            aria-hidden="true"
            className="absolute start-[11px] w-[2px] rounded-full bg-line"
          >
            <span
              ref={progressRef}
              className="absolute inset-0 origin-top rounded-full bg-cobalt"
              style={{ transform: 'scaleY(0)' }}
            />
          </span>

          {steps.map((step, r) => {
            const isPassed = r <= activeStepIndex;
            const isCurrent = r === activeStepIndex;

            return (
              <li
                key={step.code}
                data-step={true}
                className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-x-6 pb-14 last:pb-0 md:gap-x-8 md:pb-16"
              >
                <span
                  aria-hidden="true"
                  data-dot={true}
                  className={`relative z-10 mt-2 h-6 w-6 rounded-full border-2 transition-colors duration-500 ${
                    isPassed ? 'border-cobalt bg-cobalt' : 'border-line bg-paper'
                  }`}
                >
                  <span
                    className={`absolute inset-[5px] rounded-full bg-white transition-transform duration-500 ${
                      isCurrent ? 'scale-100' : 'scale-0'
                    }`}
                  />
                </span>
                <div>
                  <p
                    data-fade={true}
                    dir="ltr"
                    className={`font-mono text-sm transition-colors duration-500 rtl:text-end ${
                      isPassed ? 'text-cobalt' : 'text-dim'
                    }`}
                  >
                    {step.code}
                  </p>
                  <h3
                    data-fade={true}
                    className="mt-2 text-2xl font-bold leading-tight tracking-[-0.02em] md:text-[1.75rem]"
                  >
                    {step.title}
                  </h3>
                  <p
                    data-fade={true}
                    className="mt-3 max-w-[46ch] text-base leading-relaxed text-dim md:text-lg"
                  >
                    {step.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default function UnderTheHoodPage() {
  const { locale, t } = useLocale();
  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useSubpageHero(heroRef, glowRef);
  useRevealGroup(sectionsRef);

  // Design tokens state
  const [activeCornerRadius, setActiveCornerRadius] = useState<'16px' | '28px' | '9999px'>('28px');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Typography state
  const [activeFontWeight, setActiveFontWeight] = useState<400 | 500 | 700>(700);
  const [selectedGlyph, setSelectedGlyph] = useState<string>('Aa');
  const [tryText, setTryText] = useState('Build things people enjoy using.');
  const [fontOverlay, setFontOverlay] = useState<'none' | 'fallback' | 'arial'>('fallback');

  // Motion state
  const [activeCurve, setActiveCurve] = useState(CURVES[0]);
  const [motionDuration, setMotionDuration] = useState(CURVES[0].ms);
  const [ballOffset, setBallOffset] = useState(0);
  const [vtScene, setVtScene] = useState<0 | 1>(0);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const motionTrackRef = useRef<HTMLDivElement>(null);
  const motionBallRef = useRef<HTMLSpanElement>(null);

  // Materials: Glass state
  const glassContainerRef = useRef<HTMLDivElement>(null);
  const glassPanelRef = useRef<HTMLDivElement>(null);
  const [glassDark, setGlassDark] = useState(false);

  // Materials: Spring Bending Edge state
  const springContainerRef = useRef<HTMLDivElement>(null);
  const springPathRef = useRef<SVGPathElement>(null);
  const springState = useRef({
    value: 0,
    vel: 0,
    target: 0,
    held: false,
    raf: 0,
  });

  // Fast & Usable state
  const gaugesListRef = useRef<HTMLUListElement>(null);
  const [gaugesInView, setGaugesInView] = useState(false);
  const [reducedMotionSetting, setReducedMotionSetting] = useState<boolean | null>(null);
  const [contrastOpacity, setContrastOpacity] = useState(60);
  const focusButtonRef = useRef<HTMLButtonElement>(null);

  // Generated Covers state
  const [projectName, setProjectName] = useState('Your project');
  const [paletteIndex, setPaletteIndex] = useState(0);

  // Bilingual state
  const [sampleDir, setSampleDir] = useState<'ltr' | 'rtl'>('ltr');

  // Hero text
  const headline = t('under-the-hood', 'hero.headline') || 'How this site is built';
  const headlineWords = headline.split(' ');
  const intro =
    t('under-the-hood', 'hero.intro') ||
    'The tools, the design system, and the small details that make it feel fast. Everything here is live, so try it.';

  // Copy token
  const handleCopyColor = (name: string, hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedColor(name);
    setTimeout(() => setCopiedColor(null), 1800);
  };

  // Setup gauges intersection observer
  useEffect(() => {
    const el = gaugesListRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setGaugesInView(true);
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotionSetting(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  // Liquid glass dragging logic with pointer capture
  useEffect(() => {
    const container = glassContainerRef.current;
    const panel = glassPanelRef.current;
    if (!container || !panel) return;

    let dragOffset: { dx: number; dy: number } | null = null;
    const pos = { x: 0, y: 0 };

    const updatePosition = () => {
      const cRect = container.getBoundingClientRect();
      const pRect = panel.getBoundingClientRect();
      pos.x = Math.max(0, Math.min(cRect.width - pRect.width, pos.x));
      pos.y = Math.max(0, Math.min(cRect.height - pRect.height, pos.y));
      panel.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    };

    const centerPanel = () => {
      const cRect = container.getBoundingClientRect();
      const pRect = panel.getBoundingClientRect();
      pos.x = (cRect.width - pRect.width) / 2;
      pos.y = (cRect.height - pRect.height) / 2;
      updatePosition();
    };

    centerPanel();

    const onPointerDown = (e: PointerEvent) => {
      panel.setPointerCapture(e.pointerId);
      dragOffset = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
      panel.classList.add('glass-moving');
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragOffset) return;
      pos.x = e.clientX - dragOffset.dx;
      pos.y = e.clientY - dragOffset.dy;
      updatePosition();
    };

    const onPointerUp = () => {
      dragOffset = null;
      panel.classList.remove('glass-moving');
    };

    panel.addEventListener('pointerdown', onPointerDown);
    panel.addEventListener('pointermove', onPointerMove);
    panel.addEventListener('pointerup', onPointerUp);
    panel.addEventListener('pointercancel', onPointerUp);

    const resizeObserver = new ResizeObserver(centerPanel);
    resizeObserver.observe(container);

    return () => {
      panel.removeEventListener('pointerdown', onPointerDown);
      panel.removeEventListener('pointermove', onPointerMove);
      panel.removeEventListener('pointerup', onPointerUp);
      panel.removeEventListener('pointercancel', onPointerUp);
      resizeObserver.disconnect();
    };
  }, []);

  // Spring Bending Edge rubber sheet simulation
  useEffect(() => {
    const container = springContainerRef.current;
    const path = springPathRef.current;
    if (!container || !path) return;

    const state = springState.current;

    const render = () => {
      path.setAttribute('d', `M0 80 Q720 ${80 - 2 * state.value} 1440 80 Z`);
      path.setAttribute('fill', state.value > 0 ? '#f3f5f9' : '#0f1630');
    };

    const loop = () => {
      const target = state.held ? state.target : 0;
      state.vel += (target - state.value) * 0.12;
      state.vel *= 0.78;
      state.value += state.vel;
      render();

      if (state.held || Math.abs(state.value) > 0.2 || Math.abs(state.vel) > 0.2) {
        state.raf = requestAnimationFrame(loop);
      } else {
        state.value = 0;
        state.vel = 0;
        render();
        state.raf = 0;
      }
    };

    const startLoop = () => {
      if (!state.raf) {
        state.raf = requestAnimationFrame(loop);
      }
    };

    let startY = 0;

    const onPointerDown = (e: PointerEvent) => {
      container.setPointerCapture(e.pointerId);
      startY = e.clientY;
      state.held = true;
      state.target = 0;
      startLoop();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (state.held) {
        state.target = Math.max(-70, Math.min(70, (startY - e.clientY) * 0.6));
      }
    };

    const onPointerUp = () => {
      state.held = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);

    return () => {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
    };
  }, []);

  const flickSpring = () => {
    const state = springState.current;
    state.value = -45;
    state.vel = 18;
    if (!state.raf) {
      const loop = () => {
        state.vel += (0 - state.value) * 0.12;
        state.vel *= 0.78;
        state.value += state.vel;
        if (springPathRef.current) {
          springPathRef.current.setAttribute(
            'd',
            `M0 80 Q720 ${80 - 2 * state.value} 1440 80 Z`
          );
          springPathRef.current.setAttribute(
            'fill',
            state.value > 0 ? '#f3f5f9' : '#0f1630'
          );
        }
        if (Math.abs(state.value) > 0.2 || Math.abs(state.vel) > 0.2) {
          state.raf = requestAnimationFrame(loop);
        } else {
          state.value = 0;
          state.vel = 0;
          state.raf = 0;
        }
      };
      state.raf = requestAnimationFrame(loop);
    }
  };

  // Ball runner animation trigger
  const playMotionDemo = () => {
    const track = motionTrackRef.current;
    const ball = motionBallRef.current;
    if (!track || !ball) return;
    const isRtl = getComputedStyle(track).direction === 'rtl';
    const travelDistance = (track.clientWidth - ball.offsetWidth - 16) * (isRtl ? -1 : 1);
    setBallOffset((prev) => (prev === 0 ? travelDistance : 0));
  };

  // View transition trigger
  const triggerViewTransition = () => {
    const toggleScene = () => setVtScene((prev) => ((prev + 1) % 2) as 0 | 1);
    const doc = document as any;
    if (!doc.startViewTransition) {
      toggleScene();
      return;
    }
    const root = document.documentElement;
    root.style.setProperty('--hood-vt', isSlowMo ? '1.8s' : '0.45s');
    doc.startViewTransition(toggleScene).finished.finally(() => {
      root.style.removeProperty('--hood-vt');
    });
  };

  // Contrast calculation
  const contrastRatio = useMemo(() => calculateContrastRatio(contrastOpacity), [contrastOpacity]);
  const contrastPasses = contrastRatio >= 4.5;

  // Cover generation
  const activeCoverTitle = projectName.trim() || 'Your project';
  const coverSeed = useMemo(() => fnv1aHash(activeCoverTitle.toLowerCase()), [activeCoverTitle]);
  const activeCoverPalette = COVER_PALETTES[paletteIndex % COVER_PALETTES.length];

  return (
    <>
      {/* 1. Dark Hero Section */}
      <section
        ref={heroRef}
        aria-labelledby="hood-title"
        className="relative isolate overflow-hidden bg-[#070a1a] text-white"
      >
        {/* Ambient radial glows */}
        <div aria-hidden="true" className="pointer-events-none absolute -inset-40 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(38%_32%_at_76%_30%,rgba(47,69,255,0.55),transparent_72%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(30%_26%_at_16%_70%,rgba(116,131,255,0.26),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(22%_18%_at_58%_82%,rgba(25,195,156,0.16),transparent_70%)]" />
          <div
            ref={glowRef}
            className="pointer-events-none absolute left-[-260px] top-[-260px] h-[520px] w-[520px] bg-[radial-gradient(closest-side,rgba(116,131,255,0.22),transparent)] opacity-0 transition-opacity duration-700"
          />
        </div>

        {/* Backdrop Giant Outline Word */}
        <span
          data-backdrop="true"
          aria-hidden="true"
          dir="ltr"
          className="pointer-events-none absolute end-0 top-[14rem] -z-10 select-none whitespace-nowrap text-[32vw] font-bold leading-none tracking-[-0.06em] text-transparent md:top-[8rem] md:text-[24vw]"
          style={{ WebkitTextStroke: '2px rgba(116, 131, 255, 0.16)' }}
        >
          HOOD
        </span>

        <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-36 md:px-10 md:pb-32 md:pt-44">
          <h1
            id="hood-title"
            className="max-w-[16ch] text-[clamp(2.75rem,6.2vw,5.75rem)] font-bold leading-[1] tracking-[-0.04em]"
          >
            {headlineWords.map((word, i) => (
              <React.Fragment key={i}>
                <span className="-mb-[0.2em] inline-block overflow-hidden pb-[0.2em] pt-[0.08em] align-top">
                  <span
                    data-word="true"
                    className="inline-block origin-bottom-left will-change-transform"
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
              <div className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-white/60">Framework</dt>
                <dd className="text-4xl font-bold tracking-tight md:text-5xl">Next.js 16</dd>
              </div>
              <div className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-white/60">Languages</dt>
                <dd className="text-4xl font-bold tracking-tight md:text-5xl">English, Arabic</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Separator: Dark Hero -> Light Canvas with Dynamic Velocity Bending */}
      <BendingEdge above="#070a1a" below="#f3f5f9" />

      <div ref={sectionsRef}>
        {/* 2. From click to paint (Light Paper) */}
        <RequestStepsSection />

        {/* Separator: Light Canvas -> Dark Stack */}
        <BendingEdge above="#f3f5f9" below="#070a1a" />

        {/* 3. The Stack (Dark Section) */}
        <section
          aria-labelledby="stack-title"
          className="relative isolate overflow-hidden bg-[#070a1a] text-white"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40%_30%_at_85%_10%,rgba(47,69,255,0.28),transparent_70%),radial-gradient(30%_25%_at_10%_90%,rgba(116,131,255,0.14),transparent_70%)]"
          />
          <div className="mx-auto max-w-[1280px] px-5 pb-28 pt-24 md:px-10 md:pb-36 md:pt-32">
            <SectionHeading
              id="stack-title"
              title="The stack"
              intro="Each tool has one job. Next to it is where you can see it on this site."
              tone="dark"
            />

            <ul className="mt-14 border-t border-white/15 md:mt-20">
              {[
                {
                  name: 'Framework',
                  tools: 'Next.js 16, React 19, TypeScript',
                  where: 'Every page. Most are static and refresh in the background.',
                  accent: '#2f45ff',
                },
                {
                  name: 'Styling',
                  tools: 'Tailwind CSS v4',
                  where: 'The colour tokens and type scale further down.',
                  accent: '#7483ff',
                },
                {
                  name: 'Motion',
                  tools: 'GSAP, ScrollTrigger, Lenis, Framer Motion',
                  where: 'This smooth scroll, and the line that drew itself above.',
                  accent: '#ffb21e',
                },
                {
                  name: 'Graphics',
                  tools: 'WebGL shader, matter-js',
                  where: 'The moving blue light and the skill blocks you can throw on the home page.',
                  accent: '#19c39c',
                },
                {
                  name: 'Data',
                  tools: 'Prisma, TanStack Query, Zod',
                  where: 'Blog posts, projects, and the live search on the blog.',
                  accent: '#2f45ff',
                },
                {
                  name: 'Language',
                  tools: 'next-i18next',
                  where: 'The English and Arabic version of each page.',
                  accent: '#7483ff',
                },
              ].map((row, idx) => (
                <li
                  key={idx}
                  tabIndex={0}
                  data-reveal-group="true"
                  style={{ '--accent': row.accent } as React.CSSProperties}
                  className="group relative isolate grid gap-3 border-b border-white/15 py-7 outline-none transition-colors md:grid-cols-[minmax(0,0.6fr)_minmax(0,1.3fr)_minmax(0,1fr)] md:items-start md:gap-10 md:py-9"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 origin-left scale-x-0 bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100 rtl:origin-right"
                  />
                  <h3
                    data-in="true"
                    className="flex items-center gap-3 text-base font-bold text-white/60 transition-colors duration-300 group-hover:text-white md:ps-4"
                  >
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: row.accent }}
                    />
                    {row.name}
                  </h3>
                  <p
                    data-in="true"
                    dir="ltr"
                    className="text-[clamp(1.375rem,2.2vw,2rem)] font-bold leading-[1.2] tracking-[-0.025em] rtl:text-end"
                  >
                    {row.tools}
                  </p>
                  <p data-in="true" className="text-base leading-relaxed text-white/70">
                    {row.where}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Separator: Dark Stack -> Light Design System */}
        <BendingEdge above="#070a1a" below="#f3f5f9" />

        {/* 4. The Design System (Light Paper Canvas) */}
        <section aria-labelledby="design-title" className="bg-paper text-ink">
          <div className="mx-auto max-w-[1280px] px-5 pb-28 pt-24 md:px-10 md:pb-36 md:pt-32">
            <SectionHeading
              id="design-title"
              title="The design system"
              intro="Nine colours, one spacing rhythm and three corner shapes. Click a colour to copy it."
              tone="light"
            />

            {/* Color Tokens Grid */}
            <ul className="mt-14 grid grid-cols-2 gap-3 md:mt-20 md:grid-cols-6 md:gap-4">
              {[
                { name: 'Night', hex: '#070a1a', desc: 'Dark sections', bg: '#070a1a', text: '#ffffff', span: 'col-span-2 min-h-[13rem] md:col-span-3 md:row-span-2 md:min-h-[22rem]' },
                { name: 'Paper', hex: '#f3f5f9', desc: 'Light sections', bg: '#f3f5f9', text: '#0f1630', span: 'md:col-span-3' },
                { name: 'Cobalt', hex: '#2f45ff', desc: 'Main accent', bg: '#2f45ff', text: '#ffffff', span: 'md:col-span-2' },
                { name: 'Lilac', hex: '#7483ff', desc: 'Accent on dark', bg: '#7483ff', text: '#0f1630', span: '' },
                { name: 'Ink', hex: '#0f1630', desc: 'Text', bg: '#0f1630', text: '#ffffff', span: 'md:col-span-2' },
                { name: 'Dim', hex: '#5b6482', desc: 'Quiet text', bg: '#5b6482', text: '#ffffff', span: '' },
                { name: 'Line', hex: '#dce1ec', desc: 'Borders', bg: '#dce1ec', text: '#0f1630', span: '' },
                { name: 'Sun', hex: '#ffb21e', desc: 'Warm accent', bg: '#ffb21e', text: '#0f1630', span: '' },
                { name: 'Mint', hex: '#19c39c', desc: 'Success', bg: '#19c39c', text: '#0f1630', span: 'col-span-2 md:col-span-1' },
              ].map((c) => (
                <li key={c.name} data-reveal-group="true" className={`flex ${c.span}`}>
                  <button
                    type="button"
                    data-in="true"
                    onClick={() => handleCopyColor(c.name, c.hex)}
                    aria-label={`Copy ${c.name}, ${c.hex}`}
                    className="group relative flex min-h-[9.5rem] w-full flex-col justify-between overflow-hidden rounded-2xl p-5 text-start ring-1 ring-ink/10 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cobalt active:scale-[0.98] md:p-6"
                    style={{ background: c.bg, color: c.text }}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-lg font-bold leading-tight md:text-xl">{c.name}</span>
                      <span className="text-sm font-bold opacity-80">
                        {copiedColor === c.name ? 'Copied' : ''}
                      </span>
                    </span>
                    <span className="mt-6 block">
                      <span
                        dir="ltr"
                        className="block origin-left font-mono text-base tracking-tight transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-110 rtl:origin-right rtl:text-end"
                      >
                        {c.hex}
                      </span>
                      <span className="mt-1 block text-sm opacity-75">{c.desc}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Spacing & Corners Grid */}
            <div className="mt-20 grid gap-14 border-t border-line pt-12 md:mt-28 lg:grid-cols-2 lg:gap-16">
              <div>
                <h3 className="text-2xl font-bold tracking-[-0.02em] md:text-[1.75rem]">Spacing</h3>
                <ul className="mt-8 grid gap-7">
                  <li>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-base font-bold">Page gutter</span>
                      <span dir="ltr" className="font-mono text-sm text-dim">20 / 40px</span>
                    </div>
                    <div aria-hidden="true" className="relative mt-3 h-3 rounded-full bg-line">
                      <div className="absolute inset-y-0 start-0 rounded-full bg-cobalt" style={{ width: '31.25%' }} />
                      <div className="absolute inset-y-0 start-0 rounded-full bg-[#7483ff]" style={{ width: '15.625%' }} />
                    </div>
                  </li>
                  <li>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-base font-bold">Column gap</span>
                      <span dir="ltr" className="font-mono text-sm text-dim">40 / 64px</span>
                    </div>
                    <div aria-hidden="true" className="relative mt-3 h-3 rounded-full bg-line">
                      <div className="absolute inset-y-0 start-0 rounded-full bg-cobalt" style={{ width: '50%' }} />
                      <div className="absolute inset-y-0 start-0 rounded-full bg-[#7483ff]" style={{ width: '31.25%' }} />
                    </div>
                  </li>
                  <li>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-base font-bold">Section padding</span>
                      <span dir="ltr" className="font-mono text-sm text-dim">96 / 128px</span>
                    </div>
                    <div aria-hidden="true" className="relative mt-3 h-3 rounded-full bg-line">
                      <div className="absolute inset-y-0 start-0 rounded-full bg-cobalt" style={{ width: '100%' }} />
                      <div className="absolute inset-y-0 start-0 rounded-full bg-[#7483ff]" style={{ width: '75%' }} />
                    </div>
                  </li>
                </ul>
                <p className="mt-6 max-w-[44ch] text-base leading-relaxed text-dim">
                  Lilac is the phone size, cobalt the desktop size. Content stops at 1280px wide.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold tracking-[-0.02em] md:text-[1.75rem]">Corners</h3>
                <div className="mt-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6">
                  <div
                    aria-hidden="true"
                    className="h-40 bg-cobalt transition-[border-radius] duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] md:h-48"
                    style={{ borderRadius: activeCornerRadius }}
                  />
                  <div role="radiogroup" aria-label="Corners" className="grid gap-2">
                    {[
                      { label: 'Cards', radius: '16px', size: '16px' },
                      { label: 'Covers and panels', radius: '28px', size: '28px' },
                      { label: 'Buttons', radius: '9999px', size: 'Full' },
                    ].map((corner) => {
                      const isChecked = activeCornerRadius === corner.radius;
                      return (
                        <button
                          key={corner.radius}
                          type="button"
                          role="radio"
                          aria-checked={isChecked}
                          onClick={() => setActiveCornerRadius(corner.radius as any)}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-start text-base transition-colors duration-300 ${
                            isChecked ? 'font-bold text-ink' : 'text-dim hover:text-ink'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className="size-5 shrink-0 border-2 border-current"
                            style={{ borderRadius: corner.radius === '9999px' ? '9999px' : '4px' }}
                          />
                          <span className="flex flex-wrap items-baseline gap-x-2">
                            {corner.label}
                            <span dir="ltr" className="font-mono text-sm text-dim">{corner.size}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Separator: Light Canvas -> Dark Typography */}
        <BendingEdge above="#f3f5f9" below="#070a1a" />

        {/* 5. Typography (Dark Section matching chunk 3pptfzaia3p8a.js) */}
        <section
          aria-labelledby="type-title"
          className="relative isolate overflow-hidden bg-[#070a1a] text-white"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(38%_30%_at_12%_20%,rgba(47,69,255,0.26),transparent_70%),radial-gradient(28%_24%_at_88%_80%,rgba(116,131,255,0.14),transparent_70%)]"
          />
          <div className="mx-auto max-w-[1280px] px-5 pb-28 pt-24 md:px-10 md:pb-36 md:pt-32">
            <SectionHeading
              id="type-title"
              title="Typography"
              intro="One typeface in three weights, paired with Noto Sans Arabic. Point at a glyph or type your own text."
              tone="dark"
            />

            {/* Weight Radio Pills */}
            <div
              role="radiogroup"
              aria-label="Font weight"
              className="mt-12 flex w-fit gap-1 rounded-full bg-white/10 p-1 md:mt-16"
            >
              {([400, 500, 700] as const).map((w) => {
                const isChecked = activeFontWeight === w;
                const name = w === 400 ? 'Regular 400' : w === 500 ? 'Medium 500' : 'Bold 700';
                return (
                  <button
                    key={w}
                    type="button"
                    role="radio"
                    aria-checked={isChecked}
                    onClick={() => setActiveFontWeight(w)}
                    className={`rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                      isChecked
                        ? 'bg-white text-[#070a1a] font-bold'
                        : 'text-white/70 hover:text-white'
                    }`}
                    style={{ fontWeight: w }}
                  >
                    {name}
                  </button>
                );
              })}
            </div>

            {/* Glyph Grid & Inspector */}
            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10">
              <div className="flex min-h-[15rem] items-center justify-center rounded-[28px] bg-white/[0.04] ring-1 ring-white/10 md:min-h-[18rem]">
                <span
                  className="text-[clamp(4rem,7vw,5.75rem)] leading-none tracking-[-0.03em] text-[#7483ff] transition-[font-weight] duration-300"
                  style={{ fontWeight: activeFontWeight }}
                >
                  {selectedGlyph}
                </span>
              </div>

              <ul className="grid grid-cols-6 gap-px overflow-hidden rounded-[28px] bg-white/10 sm:grid-cols-9">
                {'AaBbGgJjKkMmQqRrSsWwYy0123456789&?!@'.split('').map((char) => (
                  <li key={char} className="flex">
                    <button
                      type="button"
                      aria-label={char}
                      onPointerEnter={() => setSelectedGlyph(char)}
                      onFocus={() => setSelectedGlyph(char)}
                      onClick={() => setSelectedGlyph(char)}
                      className={`flex aspect-square w-full items-center justify-center text-2xl transition-colors duration-200 md:text-3xl ${
                        selectedGlyph === char
                          ? 'bg-[#2f45ff] text-white font-bold'
                          : 'bg-[#070a1a] text-white/80 hover:bg-[#0f1630]'
                      }`}
                      style={{ fontWeight: activeFontWeight }}
                    >
                      {char}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Type to try editable area */}
            <label className="mt-6 block">
              <span className="sr-only">Type to try the font</span>
              <textarea
                maxLength={64}
                rows={2}
                value={tryText}
                onChange={(e) => setTryText(e.target.value)}
                className="block h-[9.5rem] w-full resize-none overflow-hidden rounded-[28px] bg-white/[0.04] p-6 leading-[1.05] tracking-[-0.035em] text-white caret-[#7483ff] ring-1 ring-white/10 transition-[font-weight] placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#7483ff] md:h-[11rem] md:p-8"
                style={{
                  fontWeight: activeFontWeight,
                  fontSize: 'clamp(1.75rem, 4vw, 3.25rem)',
                }}
              />
            </label>

            {/* Latin and Arabic + Font Fallback comparison */}
            <div className="mt-20 grid gap-16 border-t border-white/15 pt-12 md:mt-28 lg:grid-cols-2">
              <div>
                <h3 className="text-2xl font-bold tracking-[-0.02em] md:text-[1.75rem]">Latin and Arabic</h3>
                <p className="mt-3 max-w-[42ch] text-base leading-relaxed text-white/70">
                  Arabic pages switch to Noto Sans Arabic, with the same weights.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[28px] bg-white/10">
                  <div dir="ltr" lang="en" className="bg-[#070a1a] p-6">
                    <p
                      className="text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.1] tracking-[-0.03em] font-bold"
                      style={{ fontWeight: activeFontWeight }}
                    >
                      Hello
                    </p>
                    <p className="mt-3 text-sm text-white/60">AulianzaSans</p>
                  </div>
                  <div dir="rtl" lang="ar" className="bg-[#070a1a] p-6">
                    <p
                      className="text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.25] font-bold font-arabic"
                      style={{ fontWeight: activeFontWeight }}
                    >
                      مرحباً
                    </p>
                    <p dir="ltr" className="mt-3 text-end text-sm text-white/60">Noto Sans Arabic</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold tracking-[-0.02em] md:text-[1.75rem]">No jump when the font loads</h3>
                <p className="mt-3 max-w-[42ch] text-base leading-relaxed text-white/70">
                  Before AulianzaSans arrives, a resized Arial stands in. Its lines match, so nothing moves. Compare it with plain Arial.
                </p>
                <div
                  role="radiogroup"
                  aria-label="Font fallback overlay"
                  className="mt-8 flex w-fit flex-wrap gap-1 rounded-[28px] bg-white/10 p-1"
                >
                  {[
                    { id: 'none', label: 'Real font' },
                    { id: 'fallback', label: 'Matched fallback' },
                    { id: 'arial', label: 'Plain Arial' },
                  ].map((tab) => {
                    const isChecked = fontOverlay === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="radio"
                        aria-checked={isChecked}
                        onClick={() => setFontOverlay(tab.id as any)}
                        className={`rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                          isChecked
                            ? 'bg-white text-[#070a1a] font-bold'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="relative mt-6 rounded-[28px] bg-white/[0.04] p-6 ring-1 ring-white/10">
                  <p className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-bold leading-[1.2] tracking-[-0.02em] text-white">
                    The quick brown fox jumps over the lazy dog.
                  </p>
                  {fontOverlay !== 'none' && (
                    <p
                      aria-hidden="true"
                      className="absolute inset-6 text-[clamp(1.5rem,2.6vw,2.25rem)] font-bold leading-[1.2] tracking-[-0.02em] text-[#ffb21e] mix-blend-screen opacity-75"
                      style={{
                        fontFamily: fontOverlay === 'fallback' ? 'Arial, sans-serif' : 'Arial, sans-serif',
                        fontSize: fontOverlay === 'fallback' ? '106.05%' : '100%',
                      }}
                    >
                      The quick brown fox jumps over the lazy dog.
                    </p>
                  )}
                </div>
                <p dir="ltr" className="mt-4 font-mono text-sm text-white/60 rtl:text-end">
                  size-adjust: 106.05%; ascent-override: 89.58%;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Separator: Dark Typography -> Light Motion */}
        <BendingEdge above="#070a1a" below="#f3f5f9" />

        {/* 6. Motion (Light Paper Canvas matching chunk 0_igzv82kr3ao.js) */}
        <section aria-labelledby="motion-title" className="bg-paper text-ink">
          <div className="mx-auto max-w-[1280px] px-5 pb-28 pt-24 md:px-10 md:pb-36 md:pt-32">
            <SectionHeading
              id="motion-title"
              title="Motion"
              intro="A few curves, used everywhere. Pick one, set the time, and play it."
              tone="light"
            />

            <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
              {/* Curve Selection Radio List */}
              <ul
                role="radiogroup"
                aria-label="Easing curve"
                className="border-t border-line"
              >
                {CURVES.map((item) => {
                  const isChecked = activeCurve.id === item.id;
                  return (
                    <li key={item.id} className="border-b border-line">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={isChecked}
                        onClick={() => {
                          setActiveCurve(item);
                          setMotionDuration(item.ms);
                        }}
                        className="group flex w-full items-baseline justify-between gap-4 py-5 text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
                      >
                        <span>
                          <span
                            className={`block text-xl font-bold tracking-[-0.02em] transition-colors duration-300 md:text-2xl ${
                              isChecked ? 'text-cobalt' : 'text-ink group-hover:text-cobalt'
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="mt-1 block text-base text-dim">
                            {item.use}
                          </span>
                        </span>
                        <span dir="ltr" className="hidden shrink-0 font-mono text-sm text-dim sm:block">
                          {item.bezier.join(', ')}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Animated Curve Visualizer & Runner */}
              <div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                <svg
                  aria-hidden="true"
                  viewBox="-12 -12 224 224"
                  className="h-48 w-48 overflow-visible md:h-56 md:w-56"
                >
                  <rect x="0" y="0" width="200" height="200" rx="16" className="fill-surface" />
                  <path d="M0 200 L200 0" className="stroke-line" strokeWidth="1.5" strokeDasharray="4 6" fill="none" />
                  <motion.path
                    key={activeCurve.id}
                    d={`M0 200 C${200 * activeCurve.bezier[0]} ${200 - 200 * activeCurve.bezier[1]} ${200 * activeCurve.bezier[2]} ${200 - 200 * activeCurve.bezier[3]} 200 0`}
                    fill="none"
                    className="stroke-cobalt"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                  />
                </svg>

                <div className="min-w-0">
                  <p dir="ltr" className="break-all font-mono text-sm text-dim rtl:text-end">
                    {formatBezier(activeCurve)} {motionDuration}ms
                  </p>

                  <label className="mt-4 block">
                    <span className="text-sm font-medium text-dim">Duration</span>
                    <input
                      type="range"
                      min={150}
                      max={1600}
                      step={50}
                      value={motionDuration}
                      onChange={(e) => setMotionDuration(Number(e.target.value))}
                      className="mt-2 block w-full accent-cobalt"
                    />
                  </label>

                  {/* Interactive Runner Track */}
                  <div
                    ref={motionTrackRef}
                    className="relative mt-5 h-14 rounded-full bg-surface p-2 ring-1 ring-line"
                  >
                    <span
                      ref={motionBallRef}
                      aria-hidden="true"
                      className="absolute start-2 top-2 h-10 w-10 rounded-full bg-cobalt"
                      style={{
                        transform: `translateX(${ballOffset}px)`,
                        transition: `transform ${motionDuration}ms ${formatBezier(activeCurve)}`,
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={playMotionDemo}
                    className="mt-5 rounded-full bg-ink px-6 py-3 text-base font-bold text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt active:translate-y-0"
                  >
                    Play
                  </button>
                </div>
              </div>
            </div>

            {/* View Transitions Demo Card */}
            <div className="mt-20 grid gap-10 border-t border-line pt-12 md:mt-28 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
              <div>
                <h3 className="text-2xl font-bold tracking-[-0.02em] md:text-[1.75rem]">The page crossfade</h3>
                <p className="mt-3 max-w-[42ch] text-base leading-relaxed text-dim">
                  When you change page, the browser takes a picture of the old page and fades it into the new one on the GPU. This frame uses the same timing.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <button
                    type="button"
                    onClick={triggerViewTransition}
                    className="rounded-full bg-cobalt px-6 py-3 text-base font-bold text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt active:translate-y-0"
                  >
                    Change page
                  </button>
                  <label className="flex cursor-pointer items-center gap-3 text-base text-dim">
                    <input
                      type="checkbox"
                      checked={isSlowMo}
                      onChange={(e) => setIsSlowMo(e.target.checked)}
                      className="h-5 w-5 accent-cobalt"
                    />
                    <span>Slow motion</span>
                  </label>
                </div>
              </div>

              {/* View Transition Frame Preview */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-line bg-surface p-8 shadow-sm flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={vtScene}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                      duration: isSlowMo ? 1.8 : 0.45,
                      ease: [0.33, 0, 0.2, 1],
                    }}
                    className="text-center"
                  >
                    <span className="inline-block rounded-full bg-cobalt/10 px-4 py-1 text-sm font-bold text-cobalt">
                      {vtScene === 0 ? 'Page one' : 'Page two'}
                    </span>
                    <h4 className="mt-4 text-3xl font-bold tracking-tight text-ink md:text-4xl">
                      {vtScene === 0 ? 'Software Engineer' : 'Product Designer'}
                    </h4>
                    <p className="mt-2 text-base text-dim">
                      {vtScene === 0
                        ? 'Shipping fast, delightful apps'
                        : 'Crafting responsive user experiences'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Separator: Light Motion -> Dark Materials */}
        <BendingEdge above="#f3f5f9" below="#070a1a" />

        {/* 7. Materials (Dark Section matching chunk 1yrq4re-mtc5b.js) */}
        <section
          aria-labelledby="material-title"
          className="relative isolate overflow-hidden bg-[#070a1a] text-white"
        >
          <div className="mx-auto max-w-[1280px] px-5 pb-28 pt-24 md:px-10 md:pb-36 md:pt-32">
            <SectionHeading
              id="material-title"
              title="Materials"
              intro="Two materials give the site its feel: glass for things that float, and edges that bend between sections."
              tone="dark"
            />

            <div className="mt-14 grid gap-14 md:mt-20 lg:grid-cols-2 lg:gap-12">
              {/* Liquid Glass Interactive Widget */}
              <div>
                <div
                  ref={glassContainerRef}
                  className="relative h-[22rem] overflow-hidden rounded-[28px] bg-[#0f1630] md:h-[26rem]"
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(40%_45%_at_25%_30%,#2f45ff,transparent_70%),radial-gradient(35%_40%_at_80%_70%,#ffb21e,transparent_70%),radial-gradient(30%_35%_at_70%_20%,#19c39c,transparent_70%)]"
                  />
                  <p
                    aria-hidden="true"
                    dir="ltr"
                    className="absolute inset-x-6 top-1/2 -translate-y-1/2 select-none text-[clamp(2.75rem,6.2vw,5.75rem)] font-bold leading-[0.95] tracking-[-0.05em] text-white/90"
                  >
                    Liquid glass
                  </p>

                  {/* Draggable panel */}
                  <div
                    ref={glassPanelRef}
                    role="img"
                    aria-label="A glass panel you can drag"
                    className={`liquid-glass absolute left-0 top-0 h-36 w-56 cursor-grab touch-none select-none rounded-[28px] active:cursor-grabbing ${
                      glassDark ? 'liquid-glass-dark' : ''
                    }`}
                  >
                    <span className="absolute bottom-4 start-5 text-sm font-bold text-white">
                      Drag me
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl font-bold tracking-[-0.02em] md:text-[1.75rem]">Liquid glass</h3>
                    <p className="mt-3 max-w-[42ch] text-base leading-relaxed text-white/70">
                      The header and buttons are glass. In Chrome, an SVG filter bends what is behind it. Other browsers get a frosted blur.
                    </p>
                  </div>
                  <div role="radiogroup" aria-label="Glass tint" className="flex gap-1 rounded-full bg-white/10 p-1">
                    {[false, true].map((dark) => (
                      <button
                        key={String(dark)}
                        type="button"
                        role="radio"
                        aria-checked={glassDark === dark}
                        onClick={() => setGlassDark(dark)}
                        className={`rounded-full px-4 py-2 text-sm transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7483ff] ${
                          glassDark === dark ? 'bg-white text-[#070a1a] font-bold' : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {dark ? 'Dark' : 'Clear'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bending Edges Physics Simulation */}
              <div>
                <div
                  ref={springContainerRef}
                  aria-hidden="true"
                  className="relative h-[22rem] cursor-ns-resize touch-none select-none overflow-hidden rounded-[28px] md:h-[26rem]"
                >
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-[#0f1630]" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-paper" />
                  <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="absolute inset-x-0 top-1/2 h-40 w-full -translate-y-1/2">
                    <path ref={springPathRef} d="M0 80 Q720 80 1440 80 Z" fill="#f3f5f9" />
                  </svg>
                  <span className="absolute bottom-6 start-6 text-sm font-medium text-dim">
                    Pull up or down, then let go
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl font-bold tracking-[-0.02em] md:text-[1.75rem]">Bending edges</h3>
                    <p className="mt-3 max-w-[42ch] text-base leading-relaxed text-white/70">
                      Every edge between a dark and a light section bends with your scroll speed, then springs back. Pull this one.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={flickSpring}
                    className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#070a1a] transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Flick it
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Separator: Dark Materials -> Light Bilingual */}
        <BendingEdge above="#070a1a" below="#f3f5f9" />

        {/* 8. Two languages, two directions (Light Paper Canvas) */}
        <section aria-labelledby="bilingual-title" className="bg-paper text-ink">
          <div className="mx-auto max-w-[1280px] px-5 pb-28 pt-24 md:px-10 md:pb-36 md:pt-32">
            <SectionHeading
              id="bilingual-title"
              title="Two languages, two directions"
              intro="Every page works in English and Arabic. Switch the sample to see what flips."
              tone="light"
            />

            <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
              {/* Interactive Direction Preview */}
              <div className="min-w-0">
                <div className="flex gap-2 mb-6">
                  {(['ltr', 'rtl'] as const).map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => setSampleDir(dir)}
                      className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                        sampleDir === dir ? 'bg-ink text-white' : 'border border-line bg-white text-ink'
                      }`}
                    >
                      {dir === 'ltr' ? 'Left to right' : 'Right to left'}
                    </button>
                  ))}
                </div>

                <div
                  dir={sampleDir}
                  className="rounded-[28px] border border-line bg-white p-8 shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-cobalt/10 flex items-center justify-center font-bold text-cobalt">
                      RA
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-ink">
                        {sampleDir === 'ltr' ? 'Ryan Aulia' : 'ريان أوليا'}
                      </h4>
                      <p className="text-sm text-dim">
                        {sampleDir === 'ltr' ? 'Software Engineer' : 'مهندس برمجيات'}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 text-base leading-relaxed text-dim">
                    {sampleDir === 'ltr'
                      ? 'Building delightful digital products with Next.js, TypeScript and Tailwind CSS.'
                      : 'بناء منتجات رقمية استثنائية باستخدام Next.js وTypeScript وTailwind CSS.'}
                  </p>
                </div>
              </div>

              {/* 6 Rules List */}
              <div className="grid gap-4">
                {[
                  { name: 'Direction', code: 'dir="rtl"' },
                  { name: 'Spacing', code: 'ps-* pe-*' },
                  { name: 'Alignment', code: 'text-start' },
                  { name: 'Numbers', code: 'Intl.NumberFormat' },
                  { name: 'Font', code: 'Noto Sans Arabic' },
                  { name: 'Stays left to right', code: 'code, brand names' },
                ].map((rule, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl border border-line bg-white p-4"
                  >
                    <span className="font-bold text-ink">{rule.name}</span>
                    <span dir="ltr" className="font-mono text-sm text-cobalt">{rule.code}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Separator: Light Bilingual -> Dark Fast */}
        <BendingEdge above="#f3f5f9" below="#070a1a" />

        {/* 9. Fast and usable (Dark Section matching chunk 0317gscv0l3ad.js) */}
        <section
          aria-labelledby="fast-title"
          className="relative isolate overflow-hidden bg-[#070a1a] text-white"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(36%_28%_at_80%_12%,rgba(25,195,156,0.16),transparent_70%),radial-gradient(34%_28%_at_10%_70%,rgba(47,69,255,0.22),transparent_70%)]"
          />
          <div className="mx-auto max-w-[1280px] px-5 pb-28 pt-24 md:px-10 md:pb-36 md:pt-32">
            <SectionHeading
              id="fast-title"
              title="Fast and usable"
              intro="Speed and access are part of the design, not a pass at the end."
              tone="dark"
            />

            {/* 4 Animated Lighthouse Gauges */}
            <ul ref={gaugesListRef} className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-4 md:mt-20">
              <LighthouseGauge label="Performance" score={93} inView={gaugesInView} delay={0} />
              <LighthouseGauge label="Accessibility" score={99} inView={gaugesInView} delay={0.12} />
              <LighthouseGauge label="Best practices" score={96} inView={gaugesInView} delay={0.24} />
              <LighthouseGauge label="SEO" score={100} inView={gaugesInView} delay={0.36} />
            </ul>
            <p className="mt-8 text-center text-sm text-white/60">
              Lighthouse scores measured on the live site, October 2026.
            </p>

            {/* Techniques Grid */}
            <ol className="mt-20 grid gap-x-16 border-t border-white/15 md:mt-28 md:grid-cols-2">
              {[
                { name: 'Static first', body: 'Pages are prebuilt and refreshed in the background.' },
                { name: 'Split code', body: 'Sections below the fold load in their own chunks.' },
                { name: 'Idle start', body: 'Smooth scroll and extras wait until the browser is free.' },
                { name: 'Font waits', body: 'Hero text waits up to 1.2 seconds for the font, so it never re-wraps.' },
                { name: 'No layout shift', body: 'Fixed sizes for media and a matched fallback font.' },
                { name: 'Light effects', body: 'Glows are radial gradients, not large blurred layers.' },
              ].map((tech, idx) => (
                <li
                  key={tech.name}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-white/15 py-6"
                >
                  <span className="text-base font-bold tabular-nums text-[#7483ff]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <span className="block text-xl font-bold tracking-[-0.02em]">{tech.name}</span>
                    <span className="mt-1 block text-base leading-relaxed text-white/70">{tech.body}</span>
                  </div>
                </li>
              ))}
            </ol>

            {/* Contrast Slider & Accessibility Controls */}
            <div className="mt-20 grid gap-14 md:mt-28 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16">
              <div>
                <h3 className="text-2xl font-bold tracking-[-0.02em] md:text-[1.75rem]">Contrast</h3>
                <p className="mt-3 max-w-[44ch] text-base leading-relaxed text-white/70">
                  Small text on dark is never below 60% white. Move the slider to see why.
                </p>

                <div className="mt-8 rounded-[28px] p-6 ring-1 ring-white/15 md:p-8">
                  <p
                    className="text-lg leading-relaxed transition-colors"
                    style={{ color: `rgba(255,255,255,${contrastOpacity / 100})` }}
                  >
                    Small text has to stay easy to read on a dark background.
                  </p>

                  <label className="mt-6 block">
                    <span className="sr-only">Text opacity</span>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      value={contrastOpacity}
                      onChange={(e) => setContrastOpacity(Number(e.target.value))}
                      className="block w-full accent-[#7483ff]"
                    />
                  </label>

                  <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
                    <span className="text-sm text-white/60">White at {contrastOpacity}%</span>
                    <span className="flex items-baseline gap-3">
                      <span dir="ltr" className="text-2xl font-bold tabular-nums">
                        {contrastRatio.toFixed(1)}:1
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          contrastPasses ? 'text-[#19c39c]' : 'text-[#ffb21e]'
                        }`}
                        aria-live="polite"
                      >
                        {contrastPasses ? 'Passes AA' : 'Too low'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Reduced Motion & Focus Ring Demos */}
              <div className="grid content-start gap-10">
                <div>
                  <h3 className="text-2xl font-bold tracking-[-0.02em] md:text-[1.75rem]">Reduced motion</h3>
                  <p className="mt-3 text-base leading-relaxed text-white/70">
                    If your device asks for less motion, the intros, smooth scroll and page fades turn off.
                  </p>
                  <p className="mt-4 text-lg font-bold" aria-live="polite">
                    {reducedMotionSetting === null
                      ? 'Checking your setting'
                      : reducedMotionSetting
                      ? 'Your device asks for less motion. It is off here.'
                      : 'Your device allows motion.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold tracking-[-0.02em] md:text-[1.75rem]">Focus rings</h3>
                  <p className="mt-3 text-base leading-relaxed text-white/70">
                    Every control shows a clear ring when you use a keyboard.
                  </p>
                  <button
                    ref={focusButtonRef}
                    type="button"
                    onClick={() => focusButtonRef.current?.focus({ focusVisible: true } as any)}
                    className="mt-5 rounded-full bg-white/10 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7483ff]"
                  >
                    Show the focus ring
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Separator: Dark Fast -> Light Covers */}
        <BendingEdge above="#070a1a" below="#f3f5f9" />

        {/* 10. Generated covers (Light Paper Canvas matching chunk 1pj0djp7losmw.js) */}
        <section aria-labelledby="covers-title" className="bg-paper text-ink">
          <div className="mx-auto max-w-[1280px] px-5 pb-28 pt-24 md:px-10 md:pb-36 md:pt-32">
            <SectionHeading
              id="covers-title"
              title="Generated covers"
              intro="Projects and posts without a picture get a poster drawn in code. Type a name to make one."
              tone="light"
            />

            <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-center lg:gap-16">
              {/* Live Generated Cover Card */}
              <div
                className="group aspect-[4/3] overflow-hidden rounded-[28px] shadow-lg cursor-pointer"
                role="img"
                aria-label={`Generated cover for ${activeCoverTitle}`}
              >
                <div
                  className="relative h-full w-full overflow-hidden transition-colors duration-500"
                  style={{ backgroundColor: activeCoverPalette.bg }}
                >
                  <svg
                    viewBox="0 0 400 300"
                    preserveAspectRatio="xMidYMid slice"
                    className="absolute inset-x-0 top-0 h-[70%] w-full"
                    aria-hidden="true"
                  >
                    <GenerativePattern
                      seed={coverSeed}
                      a={activeCoverPalette.a}
                      b={activeCoverPalette.b}
                    />
                  </svg>

                  <span
                    aria-hidden="true"
                    dir="ltr"
                    className="absolute -bottom-[0.14em] left-4 whitespace-nowrap text-[clamp(2.25rem,5vw,4.5rem)] font-bold tracking-[-0.04em] transition-colors duration-500"
                    style={{ color: activeCoverPalette.text }}
                  >
                    {activeCoverTitle}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div>
                <label className="block">
                  <span className="text-base font-bold">Project name</span>
                  <input
                    type="text"
                    value={projectName}
                    maxLength={22}
                    onChange={(e) => setProjectName(e.target.value)}
                    dir="auto"
                    className="mt-3 block w-full rounded-2xl bg-surface px-5 py-4 text-2xl font-bold tracking-[-0.02em] text-ink caret-cobalt ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-cobalt"
                  />
                </label>

                <p className="mt-6 text-base font-bold">Colours</p>
                <div
                  role="radiogroup"
                  aria-label="Colours"
                  className="mt-3 flex flex-wrap gap-3"
                >
                  {COVER_PALETTES.map((palette, idx) => (
                    <button
                      key={idx}
                      type="button"
                      role="radio"
                      aria-checked={paletteIndex === idx}
                      aria-label={palette.bg}
                      onClick={() => setPaletteIndex(idx)}
                      className={`h-11 w-11 rounded-full ring-1 ring-ink/15 transition-transform duration-300 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt ${
                        paletteIndex === idx
                          ? 'outline outline-2 outline-offset-2 outline-ink scale-110'
                          : ''
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${palette.bg} 55%, ${palette.b} 55%)`,
                      }}
                    />
                  ))}
                </div>

                <p className="mt-8 max-w-[38ch] text-base leading-relaxed text-dim">
                  The shapes come from the name, so a cover is the same on every visit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Separator: Light Covers -> Dark Story */}
        <BendingEdge above="#f3f5f9" below="#070a1a" />

        {/* 11. Why it exists (Dark Section) */}
        <section
          aria-labelledby="story-title"
          className="relative isolate overflow-hidden bg-[#070a1a] text-white"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40%_30%_at_15%_15%,rgba(47,69,255,0.26),transparent_70%),radial-gradient(30%_25%_at_90%_70%,rgba(255,178,30,0.1),transparent_70%)]"
          />
          <div className="mx-auto max-w-[1280px] px-5 pb-28 pt-24 md:px-10 md:pb-36 md:pt-32">
            <SectionHeading
              id="story-title"
              title="Why it exists"
              tone="dark"
            />

            <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-2 md:gap-16">
              <div className="border-t border-white/15 pt-6">
                <p className="text-[clamp(2.5rem,4.4vw,4rem)] font-bold leading-[1] tracking-[-0.04em] text-[#7483ff] tabular-nums">
                  2023
                </p>
                <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-white/75">
                  My first open-source site, aulianza.id, got more than 500 stars on GitHub. The code is still public.
                </p>
                <a
                  href="https://github.com/aulianza/aulianza.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-block text-base font-bold text-white underline decoration-white/30 underline-offset-[6px] transition-colors hover:decoration-[#7483ff]"
                >
                  See the old code on GitHub
                </a>
              </div>

              <div className="border-t border-white/15 pt-6">
                <p className="text-[clamp(2.5rem,4.4vw,4rem)] font-bold leading-[1] tracking-[-0.04em] text-[#7483ff] tabular-nums">
                  2026
                </p>
                <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-white/75">
                  I rebuilt it from scratch to learn and to show where I am now. This code is private, but the ideas are on this page.
                </p>
              </div>
            </div>

            <div className="mt-20 border-t border-white/15 pt-10 md:mt-28">
              <p className="text-base text-white/60">One domain</p>
              <a
                href="https://aulianza.com"
                dir="ltr"
                className="mt-3 inline-block pb-[0.12em] text-[clamp(2.75rem,6.2vw,5.75rem)] font-bold leading-[1] tracking-[-0.04em] text-transparent"
                style={{
                  WebkitTextStroke: '1.5px rgba(116, 131, 255, 0.55)',
                  backgroundImage: 'linear-gradient(90deg, #ffffff, #7483ff)',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '100% 100%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                }}
              >
                aulianza.com
              </a>

              <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-16">
                <p className="max-w-[44ch] text-lg leading-relaxed text-white/75">
                  aulianza.id and aulianza.dev now redirect here. One name is easier to remember and better for search.
                </p>
                <div className="flex flex-col-reverse gap-1 border-s border-white/15 ps-6">
                  <span className="text-sm text-white/60">Years registered</span>
                  <span className="text-4xl font-bold tabular-nums text-white md:text-5xl">4</span>
                </div>
              </div>

              <p className="mt-16 text-base italic text-white/60">
                Set in AulianzaSans and Noto Sans Arabic. Designed and built by Ryan Aulia in Jakarta.
              </p>
            </div>
          </div>
        </section>

        {/* Reusable Contact CTA Section */}
        <ContactCTA />
      </div>
    </>
  );
}
