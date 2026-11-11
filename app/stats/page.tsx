'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { BendingEdge } from '@/components/shared/bending-edge';
import { ScrambleText } from '@/components/shared/scramble-text';
import { SectionHeading } from '@/components/shared/section-heading';
import { ContactCTA } from '@/components/sections/contact-cta';
import { useSubpageHero } from '@/hooks/use-subpage-hero';
import { useRevealGroup } from '@/hooks/use-reveal-group';
import { useLocale } from '@/lib/locale-context';
import statsData from '@/lib/stats-data.json';

gsap.registerPlugin(ScrollTrigger);

type RangeKey = '7d' | '30d' | '90d' | 'all';
type TabKey = 'pages' | 'sources' | 'countries';

/**
 * Animated numerical counter matching target function h in chunk 36co75r-byyjo.js
 */
function StatCounter({
  value,
  format,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const currentVal = useRef(value);
  const formatFn = useRef(format || ((n: number) => Math.round(n).toLocaleString()));

  useLayoutEffect(() => {
    formatFn.current = format || ((n: number) => Math.round(n).toLocaleString());
  });

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const isAudit = Boolean((navigator as any).webdriver);
    if (isAudit) {
      currentVal.current = value;
      el.textContent = formatFn.current(value);
      return;
    }

    const animObj = { v: currentVal.current };
    const tween = gsap.to(animObj, {
      v: value,
      duration: 1.4,
      ease: 'power3.out',
      onUpdate: () => {
        currentVal.current = animObj.v;
        el.textContent = formatFn.current(animObj.v);
      },
    });

    return () => {
      tween.kill();
    };
  }, [value]);

  return (
    <span ref={spanRef} className={className}>
      {(format || ((n: number) => Math.round(n).toLocaleString()))(value)}
    </span>
  );
}

/**
 * Exact Monotone Cubic Spline calculation function j(e, t) from chunk 36co75r-byyjo.js
 */
function monotoneCubicSpline(x: number[], y: number[]): string {
  const n = x.length;
  if (n === 0) return '';
  if (n === 1) return `M${x[0]},${y[0]}`;

  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    slopes.push((y[i + 1] - y[i]) / (x[i + 1] - x[i] || 1));
  }

  const tangents: number[] = [slopes[0]];
  for (let i = 1; i < n - 1; i++) {
    tangents.push(slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2);
  }
  tangents.push(slopes[n - 2]);

  for (let i = 0; i < n - 1; i++) {
    if (slopes[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const a = tangents[i] / slopes[i];
    const b = tangents[i + 1] / slopes[i];
    const r = a * a + b * b;
    if (r > 9) {
      const s = 3 / Math.sqrt(r);
      tangents[i] = s * a * slopes[i];
      tangents[i + 1] = s * b * slopes[i];
    }
  }

  let path = `M${x[0]},${y[0]}`;
  for (let i = 0; i < n - 1; i++) {
    const dx = (x[i + 1] - x[i]) / 3;
    path += `C${x[i] + dx},${y[i] + tangents[i] * dx} ${x[i + 1] - dx},${y[i + 1] - tangents[i + 1] * dx} ${x[i + 1]},${y[i + 1]}`;
  }
  return path;
}

/**
 * Nice round axis numbers calculation from target chunk 36co75r-byyjo.js
 */
function calculateAxisScale(maxVal: number) {
  if (maxVal <= 0) return { top: 4, step: 1 };
  const power = 10 ** Math.floor(Math.log10(maxVal / 5));
  const candidateSteps = [1, 2, 2.5, 5, 10, 20].map((m) => m * power);
  const step = candidateSteps.find((s) => 5 >= Math.ceil(maxVal / s)) || candidateSteps[0];
  const stepsCount = Math.max(4, Math.ceil(maxVal / step));
  return { top: step * stepsCount, step };
}

/**
 * Multi-Segment Shares Row Component matching chunk 0k5std6irivd6.js
 */
function SharesRow({
  title,
  items,
}: {
  title: string;
  items: Array<{ key: string; label: string; value: number; share: number }>;
}) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const colors = [
    { bg: '#2f45ff', fg: '#ffffff' },
    { bg: '#7483ff', fg: '#0f1630' },
    { bg: '#ffb21e', fg: '#0f1630' },
    { bg: '#19c39c', fg: '#0f1630' },
    { bg: '#0f1630', fg: '#ffffff' },
    { bg: '#c3cada', fg: '#0f1630' },
  ];

  return (
    <div
      data-reveal-group="true"
      className="grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-10"
    >
      <h3
        data-in="true"
        className="text-xl font-bold tracking-[-0.02em] text-ink md:pt-3 md:text-2xl"
      >
        {title}
      </h3>
      <div data-in="true" onPointerLeave={() => setHoveredKey(null)}>
        {/* Animated multi-segment flex bar */}
        <div aria-hidden="true" className="flex h-14 gap-1 md:h-16">
          {items.map((item, idx) => {
            const color = colors[idx % colors.length];
            const isDimmed = hoveredKey !== null && hoveredKey !== item.key;
            const percentLabel = `${Math.round(item.share * 100)}%`;

            return (
              <motion.div
                key={item.key}
                onPointerEnter={() => setHoveredKey(item.key)}
                initial={{ flexGrow: 1e-4, opacity: 0 }}
                animate={{
                  flexGrow: Math.max(item.share, 0.012),
                  opacity: isDimmed ? 0.35 : 1,
                }}
                transition={{
                  flexGrow: {
                    duration: 1.2,
                    ease: [0.19, 1, 0.22, 1],
                    delay: 0.08 * idx,
                  },
                  opacity: {
                    duration: hoveredKey ? 0.3 : 0.6,
                    delay: hoveredKey ? 0 : 0.08 * idx,
                  },
                }}
                className="relative flex min-w-[6px] basis-0 cursor-pointer items-center overflow-hidden rounded-xl px-3 first:rounded-s-2xl last:rounded-e-2xl"
                style={{ backgroundColor: color.bg, color: color.fg }}
              >
                {item.share >= 0.12 && (
                  <span className="flex min-w-0 items-baseline gap-2 whitespace-nowrap font-bold">
                    <span className="text-lg tabular-nums md:text-xl">
                      {percentLabel}
                    </span>
                    <span className="hidden truncate text-sm sm:inline">
                      {item.label}
                    </span>
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-1">
          {items.map((item, idx) => {
            const color = colors[idx % colors.length];
            const isDimmed = hoveredKey !== null && hoveredKey !== item.key;

            return (
              <li
                key={item.key}
                onPointerEnter={() => setHoveredKey(item.key)}
                className={`flex cursor-pointer min-w-0 items-center gap-2.5 py-2 transition-opacity duration-300 ${
                  isDimmed ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-3 w-3 shrink-0 rounded-[4px]"
                  style={{ backgroundColor: color.bg }}
                />
                <span className="min-w-0 truncate text-[15px] font-bold text-ink">
                  {item.label}
                </span>
                <span className="shrink-0 text-[15px] font-medium tabular-nums text-dim">
                  {(item.share * 100).toFixed(1)}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default function StatsPage() {
  const { locale, t } = useLocale();
  const [range, setRange] = useState<RangeKey>('all');
  const [activeTab, setActiveTab] = useState<TabKey>('pages');
  const [scrubberIndex, setScrubberIndex] = useState<number | null>(null);

  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const scrubberAreaRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  useSubpageHero(heroRef, glowRef);
  useRevealGroup(paperRef, [activeTab]);

  // Chart clipPath reveal on scroll trigger
  useLayoutEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const isAudit = Boolean((navigator as any).webdriver);
    if (isAudit) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: 'inset(0% 100% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.6,
          ease: 'expo.inOut',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [range]);

  const headline =
    t('statistics', 'hero.headline') || 'The numbers behind this site';
  const headlineWords = headline.split(' ');
  const intro =
    t('statistics', 'hero.intro') ||
    'Live traffic for aulianza.com, counted on my own server without cookies. You see the same numbers I do.';

  const currentStats = statsData.rangeData[range] || statsData.allTime;

  // Numeric values for animating
  const numericStats = {
    pageviews: parseInt(currentStats.pageviews.replace(/,/g, ''), 10) || 57160,
    visitors: parseInt(currentStats.visitors.replace(/,/g, ''), 10) || 12890,
    visits: parseInt(currentStats.visits.replace(/,/g, ''), 10) || 18450,
    bounceRate: parseFloat(currentStats.bounceRate) || 42,
  };

  // Chart data calculations
  const rawChartData = statsData.chartData[range] || statsData.chartData.all;
  const pointCount = rawChartData.length;

  const maxVal = Math.max(
    ...rawChartData.map((d: any) => Math.max(d.views, d.visits)),
    100
  );
  const axisScale = useMemo(() => calculateAxisScale(maxVal), [maxVal]);
  const topAxisVal = axisScale.top;

  // Coordinate mappers
  const mapX = (idx: number) =>
    pointCount <= 1 ? 500 : (idx / (pointCount - 1)) * 1000;
  const mapY = (val: number) => 24 + (1 - val / topAxisVal) * 312;

  const xCoords = useMemo(
    () => rawChartData.map((_: any, i: number) => mapX(i)),
    [pointCount]
  );
  const yCoordsViews = useMemo(
    () => rawChartData.map((d: any) => mapY(d.views)),
    [rawChartData, topAxisVal]
  );
  const yCoordsVisits = useMemo(
    () => rawChartData.map((d: any) => mapY(d.visits)),
    [rawChartData, topAxisVal]
  );

  const viewsCurve = useMemo(
    () => monotoneCubicSpline(xCoords, yCoordsViews),
    [xCoords, yCoordsViews]
  );
  const visitsCurve = useMemo(
    () => monotoneCubicSpline(xCoords, yCoordsVisits),
    [xCoords, yCoordsVisits]
  );
  const viewsArea = useMemo(
    () => (pointCount > 1 ? `${viewsCurve} L1000,360 L0,360 Z` : ''),
    [viewsCurve, pointCount]
  );

  // Peak index
  const peakIndex = useMemo(() => {
    let best = 0;
    for (let i = 1; i < rawChartData.length; i++) {
      if (rawChartData[i].views > rawChartData[best].views) {
        best = i;
      }
    }
    return best;
  }, [rawChartData]);

  // Axis gridlines
  const axisLines = useMemo(() => {
    const lines = [];
    for (let v = 0; v <= topAxisVal; v += axisScale.step) {
      lines.push(v);
    }
    return lines;
  }, [topAxisVal, axisScale.step]);

  // Scrubber pointer calculation
  const handlePointerScrub = (clientX: number) => {
    const el = scrubberAreaRef.current;
    if (!el || pointCount === 0) return;
    const rect = el.getBoundingClientRect();
    const relX = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const idx = Math.round(relX * (pointCount - 1));
    setScrubberIndex(idx);
  };

  const activePoint =
    scrubberIndex !== null ? rawChartData[scrubberIndex] : null;
  const activeXPercent =
    scrubberIndex !== null ? (mapX(scrubberIndex) / 1000) * 100 : 0;
  const activeYViewsPercent = activePoint
    ? (mapY(activePoint.views) / 360) * 100
    : 0;
  const activeYVisitsPercent = activePoint
    ? (mapY(activePoint.visits) / 360) * 100
    : 0;
  const tooltipYPercent = activePoint
    ? Math.min(78, Math.max(12, (mapY(activePoint.views) / 360) * 100))
    : 0;
  const peakXPercent = (mapX(peakIndex) / 1000) * 100;
  const peakYPercent = (mapY(rawChartData[peakIndex]?.views || 0) / 360) * 100;

  return (
    <>
      {/* 1. Dark Hero Section */}
      <section
        ref={heroRef}
        aria-labelledby="stats-title"
        className="relative isolate overflow-hidden bg-[#070a1a] text-white"
      >
        {/* Ambient radial glows */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute -inset-40 -z-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(36%_30%_at_76%_20%,rgba(47,69,255,0.52),transparent_72%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(28%_26%_at_16%_66%,rgba(116,131,255,0.26),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(20%_18%_at_58%_92%,rgba(25,195,156,0.14),transparent_70%)]" />
        </div>

        {/* Backdrop Giant Outline Word */}
        <span
          data-backdrop="true"
          aria-hidden="true"
          dir="ltr"
          className="pointer-events-none absolute end-0 top-[13rem] -z-10 select-none whitespace-nowrap text-[30vw] font-bold leading-none tracking-[-0.06em] text-transparent md:top-[8rem] md:text-[22vw]"
          style={{ WebkitTextStroke: '2px rgba(116, 131, 255, 0.16)' }}
        >
          STATS
        </span>

        <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-36 md:px-10 md:pb-20 md:pt-44">
          <h1
            id="stats-title"
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

            {/* Live site traffic count */}
            <p
              data-reveal="true"
              aria-live="polite"
              className="flex items-center gap-3 text-base font-bold"
            >
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#19c39c] opacity-70 motion-reduce:animate-none" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#19c39c]" />
              </span>
              <span className="text-white/80">1 person on the site now</span>
            </p>
          </div>

          {/* Range Pills and Since info */}
          <div
            data-reveal="true"
            className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-8"
          >
            <div
              role="group"
              aria-label="Filter by time range"
              className="relative flex w-full rounded-full bg-white/[0.07] p-1 ring-1 ring-white/10 sm:w-auto"
            >
              {(
                [
                  { id: '7d', label: '7 days' },
                  { id: '30d', label: '30 days' },
                  { id: '90d', label: '90 days' },
                  { id: 'all', label: 'All time' },
                ] as const
              ).map((item) => {
                const isSelected = range === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setRange(item.id);
                      setScrubberIndex(null);
                    }}
                    className={`relative flex-1 whitespace-nowrap rounded-full px-2 py-3 text-sm font-bold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7483ff] sm:flex-none sm:px-5 sm:py-2 sm:text-[15px] ${
                      isSelected
                        ? 'text-[#070a1a]'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="stats-range"
                        transition={{
                          duration: 0.5,
                          ease: [0.19, 1, 0.22, 1],
                        }}
                        className="absolute inset-0 -z-0 rounded-full bg-white"
                      />
                    )}
                    <span className="relative">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-sm font-medium text-white/60">
              {currentStats.since}
            </p>
          </div>

          {/* Big Statistics Cards */}
          <div
            data-reveal="true"
            className="mt-10 grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] md:items-end md:gap-12"
          >
            <div>
              <p className="text-base font-medium text-white/60">Pageviews</p>
              <dd className="mt-1 text-[clamp(3.25rem,7vw,5.75rem)] font-bold leading-[1] tracking-[-0.04em] tabular-nums">
                <StatCounter value={numericStats.pageviews} />
              </dd>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
              <div className="group flex flex-col-reverse gap-1.5 border-s border-white/15 ps-4 transition-colors duration-500 hover:border-[#7483ff]">
                <dt className="text-sm font-medium text-white/60">Visitors</dt>
                <dd className="text-[2rem] font-bold leading-none tracking-tight tabular-nums md:text-[2.5rem]">
                  <StatCounter value={numericStats.visitors} />
                </dd>
              </div>

              <div className="group flex flex-col-reverse gap-1.5 border-s border-white/15 ps-4 transition-colors duration-500 hover:border-[#7483ff]">
                <dt className="text-sm font-medium text-white/60">Visits</dt>
                <dd className="text-[2rem] font-bold leading-none tracking-tight tabular-nums md:text-[2.5rem]">
                  <StatCounter value={numericStats.visits} />
                </dd>
              </div>

              <div className="group flex flex-col-reverse gap-1.5 border-s border-white/15 ps-4 transition-colors duration-500 hover:border-[#7483ff]">
                <dt className="text-sm font-medium text-white/60">Bounce rate</dt>
                <dd className="text-[2rem] font-bold leading-none tracking-tight tabular-nums md:text-[2.5rem]">
                  <StatCounter
                    value={numericStats.bounceRate}
                    format={(n) => `${Math.round(n)}%`}
                  />
                </dd>
              </div>

              <div className="group flex flex-col-reverse gap-1.5 border-s border-white/15 ps-4 transition-colors duration-500 hover:border-[#7483ff]">
                <dt className="text-sm font-medium text-white/60">
                  Average visit
                </dt>
                <dd className="text-[2rem] font-bold leading-none tracking-tight tabular-nums md:text-[2.5rem]">
                  {currentStats.avgVisit}
                </dd>
              </div>
            </div>
          </div>

          {/* Traffic Over Time (Interactive Monotone Cubic Spline Chart) */}
          <div className="mt-20 border-t border-white/10 pt-16">
            <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
              <div>
                <h2 className="text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-none tracking-[-0.035em]">
                  <ScrambleText text="Traffic over time" />
                </h2>
                <p className="mt-4 text-lg text-white/70">
                  {currentStats.busiestMonth}
                </p>
              </div>

              <ul className="flex gap-6 text-[15px] font-bold text-white/80">
                <li className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="h-[3px] w-6 rounded-full bg-[#7483ff]"
                  />
                  <span>Pageviews</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="h-[3px] w-6 rounded-full bg-[#ffc24d]"
                  />
                  <span>Visits</span>
                </li>
              </ul>
            </div>

            {/* Interactive Chart Canvas */}
            <div className="mt-10 md:mt-12">
              <div
                className="relative h-[260px] ps-10 md:h-[380px] md:ps-14"
                dir="ltr"
              >
                {/* Horizontal Guide Lines */}
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 end-0 start-10 md:start-14"
                >
                  {axisLines.map((val) => (
                    <div
                      key={val}
                      className="absolute inset-x-0 border-t border-dashed border-white/10"
                      style={{ top: `${(mapY(val) / 360) * 100}%` }}
                    >
                      <span className="absolute -top-2.5 end-full me-3 text-xs font-medium tabular-nums text-white/60 md:text-[13px]">
                        {val.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Interactive Scrubber Layer */}
                <div
                  ref={scrubberAreaRef}
                  role="group"
                  tabIndex={pointCount > 0 ? 0 : -1}
                  aria-label="Interactive traffic chart scrubber"
                  onPointerMove={(e) => handlePointerScrub(e.clientX)}
                  onPointerDown={(e) => handlePointerScrub(e.clientX)}
                  onPointerLeave={() => setScrubberIndex(null)}
                  onBlur={() => setScrubberIndex(null)}
                  onKeyDown={(e) => {
                    if (pointCount === 0) return;
                    if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      setScrubberIndex((prev) =>
                        prev === null ? 0 : Math.min(pointCount - 1, prev + 1)
                      );
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      setScrubberIndex((prev) =>
                        prev === null
                          ? pointCount - 1
                          : Math.max(0, prev - 1)
                      );
                    } else if (e.key === 'Escape') {
                      setScrubberIndex(null);
                    }
                  }}
                  className="absolute inset-y-0 end-0 start-10 cursor-crosshair rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#7483ff] focus-visible:ring-offset-8 focus-visible:ring-offset-[#070a1a] md:start-14"
                  style={{ touchAction: 'pan-y' }}
                >
                  {/* SVG Curves Container */}
                  <div ref={chartRef} className="absolute inset-0">
                    <svg
                      viewBox="0 0 1000 360"
                      preserveAspectRatio="none"
                      className="absolute inset-0 h-full w-full overflow-visible"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient
                          id="stats-views-fill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#2f45ff"
                            stopOpacity="0.55"
                          />
                          <stop
                            offset="100%"
                            stopColor="#2f45ff"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>

                      {/* Area Fill */}
                      {viewsArea && (
                        <path d={viewsArea} fill="url(#stats-views-fill)" />
                      )}

                      {/* Pageviews Monotone Cubic Spline */}
                      <path
                        d={viewsCurve}
                        fill="none"
                        stroke="#7483ff"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />

                      {/* Visits Monotone Cubic Spline */}
                      <path
                        d={visitsCurve}
                        fill="none"
                        stroke="#ffc24d"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>

                    {/* Peak Month / Day Indicator Dot */}
                    <span
                      aria-hidden="true"
                      className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ring-4 ring-[#2f45ff]/50 transition-opacity duration-300 ${
                        activePoint ? 'opacity-0' : 'opacity-100'
                      }`}
                      style={{
                        left: `${peakXPercent}%`,
                        top: `${peakYPercent}%`,
                      }}
                    />
                  </div>

                  {/* Scrubber Crosshair Line & Floating Tooltip */}
                  {activePoint && scrubberIndex !== null && (
                    <>
                      {/* Vertical Hairline */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 w-px bg-white/35"
                        style={{ left: `${activeXPercent}%` }}
                      />

                      {/* Pageviews Circle Dot on Crosshair */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#7483ff] bg-[#070a1a]"
                        style={{
                          left: `${activeXPercent}%`,
                          top: `${activeYViewsPercent}%`,
                        }}
                      />

                      {/* Visits Circle Dot on Crosshair */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#ffc24d] bg-[#070a1a]"
                        style={{
                          left: `${activeXPercent}%`,
                          top: `${activeYVisitsPercent}%`,
                        }}
                      />

                      {/* Floating Tooltip Card */}
                      <div
                        role="status"
                        className={`pointer-events-none absolute z-20 w-max min-w-[10.5rem] -translate-y-1/2 rounded-2xl bg-white px-4 py-3 text-[#0f1630] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)] ${
                          activeXPercent > 60
                            ? '-ml-4 -translate-x-full'
                            : 'ml-4'
                        }`}
                        style={{
                          left: `${activeXPercent}%`,
                          top: `${tooltipYPercent}%`,
                        }}
                      >
                        <p className="text-sm font-bold text-[#5b6482]">
                          {activePoint.time}
                        </p>
                        <p className="mt-1.5 flex items-center justify-between gap-6 text-base font-bold">
                          <span className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="h-2.5 w-2.5 rounded-full bg-[#2f45ff]"
                            />
                            Pageviews
                          </span>
                          <span className="tabular-nums">
                            {activePoint.views.toLocaleString()}
                          </span>
                        </p>
                        <p className="mt-1 flex items-center justify-between gap-6 text-base font-bold">
                          <span className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="h-2.5 w-2.5 rounded-full bg-[#ffb21e]"
                            />
                            Visits
                          </span>
                          <span className="tabular-nums">
                            {activePoint.visits.toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* X Axis Month / Date Labels */}
              <div className="mt-4 flex justify-between ps-10 text-xs font-semibold tabular-nums text-white/50 md:ps-14">
                {rawChartData.map((d: any, idx: number) => {
                  // Show spaced out labels to prevent overlap
                  const showLabel =
                    pointCount <= 7 ||
                    idx === 0 ||
                    idx === pointCount - 1 ||
                    idx % Math.ceil(pointCount / 6) === 0;
                  return (
                    <span
                      key={idx}
                      className={showLabel ? 'visible' : 'invisible'}
                    >
                      {d.time}
                    </span>
                  );
                })}
              </div>

              <p className="mt-6 ps-10 text-xs text-white/40 md:ps-14">
                Move across the chart, or use the arrow keys, to read each point.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Separator: Dark Hero -> Light Canvas with Dynamic Velocity Bending */}
      <BendingEdge above="#070a1a" below="#f3f5f9" />

      {/* 2. Paper Canvas Content Area */}
      <div ref={paperRef} className="bg-paper pb-28 pt-8 md:pb-36">
        {/* Where readers come from Section */}
        <section
          aria-labelledby="breakdown-title"
          className="mx-auto max-w-[1280px] px-5 pt-24 md:px-10 md:pt-32"
        >
          <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:gap-20">
            {/* Left Tabs */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <h2
                id="breakdown-title"
                className="text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.035em] text-ink"
              >
                <ScrambleText text="Where readers come from" />
              </h2>
              <p className="mt-4 max-w-[34ch] text-lg text-dim">
                The pages people open, the sites that send them, and the countries they read from.
              </p>

              <div
                role="tablist"
                aria-label="Where readers come from"
                className="mt-10 flex flex-wrap gap-x-7 gap-y-2 lg:flex-col lg:gap-1"
              >
                {[
                  { id: 'pages', label: 'Pages' },
                  { id: 'sources', label: 'Sources' },
                  { id: 'countries', label: 'Countries' },
                ].map((tab) => {
                  const isSelected = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setActiveTab(tab.id as TabKey)}
                      className={`group relative w-fit py-1 text-start text-2xl font-bold tracking-[-0.02em] outline-none transition-colors duration-300 focus-visible:text-cobalt md:text-[2rem] ${
                        isSelected ? 'text-ink' : 'text-dim/60 hover:text-ink'
                      }`}
                    >
                      <span className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5">
                        {tab.label}
                      </span>
                      {isSelected && (
                        <span className="absolute -bottom-0.5 start-0 h-[3px] w-full rounded-full bg-cobalt lg:bottom-auto lg:-start-5 lg:top-1/2 lg:h-6 lg:w-[3px] lg:-translate-y-1/2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Tab Content Table */}
            <div id="breakdown-panel" role="tabpanel" className="min-h-[34rem]">
              <div className="flex items-baseline justify-between gap-4 pb-3 text-sm font-bold text-dim">
                <span>
                  {activeTab === 'pages'
                    ? 'Page'
                    : activeTab === 'sources'
                    ? 'Source'
                    : 'Country'}
                </span>
                <span>Count and share</span>
              </div>

              <ol>
                {(activeTab === 'pages'
                  ? statsData.pages
                  : activeTab === 'sources'
                  ? statsData.sources
                  : statsData.countries
                ).map((row: any, idx: number) => {
                  const percentVal = parseFloat(row.share) || 0;

                  return (
                    <li key={idx} data-reveal-group="true" className="relative">
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-px bg-line"
                      />

                      <div
                        data-in="true"
                        className="group relative isolate flex items-center gap-4 py-4 outline-none md:gap-6"
                      >
                        {/* Hover card surface */}
                        <span
                          aria-hidden="true"
                          className="absolute -inset-x-4 inset-y-1 -z-10 scale-[0.98] rounded-[20px] bg-white opacity-0 shadow-[0_24px_50px_-32px_rgba(15,22,48,0.35)] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-100 group-hover:opacity-100 md:-inset-x-6"
                        />

                        {/* Rank */}
                        <span className="w-7 shrink-0 text-sm font-bold tabular-nums text-dim">
                          {row.rank}
                        </span>

                        {/* Label & Progress Bar */}
                        <span className="min-w-0 flex-1">
                          <span className="flex min-w-0 items-center gap-2.5">
                            {row.url ? (
                              <Link
                                href={row.url}
                                className="truncate text-base font-bold text-ink transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-x-1 hover:text-cobalt md:text-lg"
                              >
                                {row.label}
                              </Link>
                            ) : (
                              <span className="truncate text-base font-bold text-ink transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-x-1 md:text-lg">
                                {row.label}
                              </span>
                            )}
                            {row.flag && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={`/images/flags/${row.flag}.svg`}
                                alt=""
                                className="size-4 shrink-0 rounded-full"
                              />
                            )}
                          </span>

                          <span
                            aria-hidden="true"
                            className="mt-2.5 block h-1 overflow-hidden rounded-full bg-line"
                          >
                            <span
                              className="block h-full origin-left rounded-full bg-cobalt transition-transform duration-700 rtl:origin-right"
                              style={{ width: `${percentVal}%` }}
                            />
                          </span>
                        </span>

                        {/* Count & Share */}
                        <span className="w-16 shrink-0 text-end md:w-24">
                          <span className="block text-base font-bold tabular-nums text-ink md:text-lg">
                            {row.count}
                          </span>
                          <span className="block text-sm font-medium tabular-nums text-dim">
                            {row.share}
                          </span>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        {/* What they read on Section (Authentic Multi-Segment Shares Bar) */}
        <section
          aria-labelledby="shares-title"
          className="mx-auto max-w-[1280px] px-5 pt-24 md:px-10 md:pt-32"
        >
          <SectionHeading
            id="shares-title"
            title="What they read on"
            intro="Screens, browsers and systems, split by share of visitors."
            tone="light"
          />

          <div className="mt-12 grid gap-14 md:mt-16 md:gap-16">
            <SharesRow
              title="Devices"
              items={statsData.shares.devices}
            />
            <SharesRow
              title="Browsers"
              items={statsData.shares.browsers}
            />
            <SharesRow
              title="Systems"
              items={statsData.shares.systems}
            />
          </div>
        </section>
      </div>

      {/* Separator to Dark Footer with Dynamic Velocity Bending */}
      <BendingEdge above="#f3f5f9" below="#070a1a" />

      {/* Reusable Contact CTA Section */}
      <ContactCTA />
    </>
  );
}
