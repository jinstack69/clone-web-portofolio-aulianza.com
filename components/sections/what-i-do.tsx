'use client';

import React, { useRef, useState, useEffect } from 'react';
import { servicesData } from '@/lib/data';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleText } from '@/components/shared/scramble-text';
import { useLocale } from '@/lib/locale-context';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const stageConfigs: Record<
  string,
  {
    bg: string;
    textColor: string;
    badgeColor: string;
    strokeColor: string;
    descColor: string;
    word: string;
    chip: string;
    line: string;
  }
> = {
  ai: {
    bg: 'bg-[#2f45ff]',
    textColor: 'text-white',
    badgeColor: 'bg-white text-[#2f45ff]',
    strokeColor: 'rgba(255, 255, 255, 0.28)',
    descColor: 'text-white/75',
    word: 'AGENTS',
    chip: 'bg-white text-[#2f45ff]',
    line: 'border-white/25',
  },
  fullstack: {
    bg: 'bg-[#0f1630]',
    textColor: 'text-white',
    badgeColor: 'bg-[#7483ff] text-[#0f1630]',
    strokeColor: 'rgba(116, 131, 255, 0.35)',
    descColor: 'text-white/65',
    word: 'STACK',
    chip: 'bg-[#7483ff] text-[#0f1630]',
    line: 'border-white/15',
  },
  web: {
    bg: 'bg-white',
    textColor: 'text-[#0f1630]',
    badgeColor: 'bg-[#0f1630] text-white',
    strokeColor: 'rgba(47, 69, 255, 0.22)',
    descColor: 'text-[#5b6482]',
    word: 'WEB',
    chip: 'bg-[#0f1630] text-white',
    line: 'border-[#0f1630]/15',
  },
  mobile: {
    bg: 'bg-[#ffb21e]',
    textColor: 'text-[#0f1630]',
    badgeColor: 'bg-[#0f1630] text-[#ffb21e]',
    strokeColor: 'rgba(15, 22, 48, 0.22)',
    descColor: 'text-[#0f1630]/75',
    word: 'MOBILE',
    chip: 'bg-[#0f1630] text-[#ffb21e]',
    line: 'border-[#0f1630]/20',
  },
  ui: {
    bg: 'bg-[#7483ff]',
    textColor: 'text-white',
    badgeColor: 'bg-white text-[#3b49d6]',
    strokeColor: 'rgba(255, 255, 255, 0.3)',
    descColor: 'text-white/80',
    word: 'MOTION',
    chip: 'bg-white text-[#3b49d6]',
    line: 'border-white/30',
  },
  integrations: {
    bg: 'bg-[#070a1a]',
    textColor: 'text-white',
    badgeColor: 'bg-[#ffb21e] text-[#070a1a]',
    strokeColor: 'rgba(255, 178, 30, 0.32)',
    descColor: 'text-white/60',
    word: 'CONNECT',
    chip: 'bg-[#ffb21e] text-[#070a1a]',
    line: 'border-white/15',
  },
};

// Generative wireframe SVGs for each stage
function StageArtwork({ kind, color }: { kind: string; color: string }) {
  if (kind === 'ai') {
    const points: [number, number][] = [];
    for (let t = 0; t < 7; t++) {
      for (let r = 0; r < 10; r++) {
        points.push([
          76 * r + (t % 2) * 38 + ((37 * r + 53 * t) % 17),
          78 * t + ((29 * r + 11 * t) % 21),
        ]);
      }
    }
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 720 520"
        preserveAspectRatio="xMinYMin slice"
        className="pointer-events-none absolute start-0 top-0 h-[70%] w-full select-none [mask-image:radial-gradient(110%_100%_at_0%_0%,black_0%,rgba(0,0,0,0.5)_35%,transparent_70%)] lg:w-[62%]"
        fill="none"
        stroke="currentColor"
        style={{ color }}
      >
        {points.flatMap((p1, i) =>
          points
            .slice(i + 1)
            .filter((p2) => 96 > Math.hypot(p1[0] - p2[0], p1[1] - p2[1]))
            .map((p2, n) => (
              <line
                key={`${i}-${n}`}
                x1={p1[0]}
                y1={p1[1]}
                x2={p2[0]}
                y2={p2[1]}
                strokeWidth={1}
              />
            ))
        )}
        {points.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 5 === 0 ? 3.5 : 2.2}
            fill="currentColor"
            stroke="none"
          />
        ))}
      </svg>
    );
  }

  if (kind === 'fullstack') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 720 520"
        preserveAspectRatio="xMinYMin slice"
        className="pointer-events-none absolute start-0 top-0 h-[70%] w-full select-none [mask-image:radial-gradient(110%_100%_at_0%_0%,black_0%,rgba(0,0,0,0.5)_35%,transparent_70%)] lg:w-[62%]"
        fill="none"
        stroke="currentColor"
        style={{ color }}
      >
        {Array.from({ length: 12 }, (_, r) => {
          const i = 30 + 40 * r;
          const d = `M0 ${i} C 180 ${i - 14}, 360 ${i + 14}, 540 ${i} S 720 ${i - 10}, 760 ${i}`;
          return <path key={r} d={d} strokeWidth={r % 3 === 0 ? 1.6 : 1} />;
        })}
        {Array.from({ length: 12 }, (_, r) => (
          <rect
            key={`t${r}`}
            x={40 + (r % 4) * 150}
            y={22 + 40 * r}
            width={10}
            height={16}
            rx={2}
          />
        ))}
      </svg>
    );
  }

  if (kind === 'web') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 720 520"
        preserveAspectRatio="xMinYMin slice"
        className="pointer-events-none absolute start-0 top-0 h-[70%] w-full select-none [mask-image:radial-gradient(110%_100%_at_0%_0%,black_0%,rgba(0,0,0,0.5)_35%,transparent_70%)] lg:w-[62%]"
        fill="none"
        stroke="currentColor"
        style={{ color }}
      >
        {Array.from({ length: 13 }, (_, r) => (
          <line
            key={`v${r}`}
            x1={60 * r}
            y1={0}
            x2={60 * r}
            y2={520}
            strokeWidth={r % 4 === 0 ? 1.4 : 0.8}
          />
        ))}
        {Array.from({ length: 10 }, (_, r) => (
          <line
            key={`h${r}`}
            x1={0}
            y1={60 * r}
            x2={720}
            y2={60 * r}
            strokeWidth={0.8}
          />
        ))}
        <rect x={60} y={60} width={240} height={120} rx={6} strokeWidth={1.6} />
        <rect x={60} y={240} width={120} height={180} rx={6} strokeWidth={1.2} />
        <rect x={360} y={60} width={180} height={60} rx={6} strokeWidth={1.2} />
      </svg>
    );
  }

  if (kind === 'mobile') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 720 520"
        preserveAspectRatio="xMinYMin slice"
        className="pointer-events-none absolute start-0 top-0 h-[70%] w-full select-none [mask-image:radial-gradient(110%_100%_at_0%_0%,black_0%,rgba(0,0,0,0.5)_35%,transparent_70%)] lg:w-[62%]"
        fill="none"
        stroke="currentColor"
        style={{ color }}
      >
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 8 }, (_, i) => (
            <rect
              key={`${i}-${r}`}
              x={24 + 88 * i}
              y={24 + 88 * r}
              width={60}
              height={60}
              rx={16}
              strokeWidth={(i + r) % 5 === 0 ? 1.8 : 1}
            />
          ))
        )}
      </svg>
    );
  }

  if (kind === 'ui') {
    let size = 480;
    let rx = 0;
    let ry = 0;
    const boxes: [number, number, number][] = [];
    const paths: string[] = [];
    for (let t = 0; t < 8; t++) {
      boxes.push([rx, ry, size]);
      const s = size;
      if (t % 4 === 0) paths.push(`M${rx} ${ry + s} A ${s} ${s} 0 0 1 ${rx + s} ${ry}`);
      if (t % 4 === 1) paths.push(`M${rx} ${ry} A ${s} ${s} 0 0 1 ${rx + s} ${ry + s}`);
      if (t % 4 === 2) paths.push(`M${rx + s} ${ry} A ${s} ${s} 0 0 1 ${rx} ${ry + s}`);
      if (t % 4 === 3) paths.push(`M${rx + s} ${ry + s} A ${s} ${s} 0 0 1 ${rx} ${ry}`);
      const next = 0.618 * size;
      if (t % 4 === 0) rx += size;
      if (t % 4 === 1) {
        ry += size;
        rx += size - next;
      }
      if (t % 4 === 2) {
        rx -= next;
        ry += size - next;
      }
      if (t % 4 === 3) ry -= next;
      size = next;
    }

    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 720 520"
        preserveAspectRatio="xMinYMin slice"
        className="pointer-events-none absolute start-0 top-0 h-[70%] w-full select-none [mask-image:radial-gradient(110%_100%_at_0%_0%,black_0%,rgba(0,0,0,0.5)_35%,transparent_70%)] lg:w-[62%]"
        fill="none"
        stroke="currentColor"
        style={{ color }}
      >
        {boxes.map(([x, y, s], n) => (
          <rect
            key={`b${n}`}
            x={Math.round(x)}
            y={Math.round(y)}
            width={Math.round(s)}
            height={Math.round(s)}
            strokeWidth={0.8}
          />
        ))}
        {paths.map((p, r) => (
          <path key={r} d={p} strokeWidth={1.6} />
        ))}
      </svg>
    );
  }

  // integrations
  const radii = [90, 170, 260, 360, 470];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 720 520"
      preserveAspectRatio="xMinYMin slice"
      className="pointer-events-none absolute start-0 top-0 h-[70%] w-full select-none [mask-image:radial-gradient(110%_100%_at_0%_0%,black_0%,rgba(0,0,0,0.5)_35%,transparent_70%)] lg:w-[62%]"
      fill="none"
      stroke="currentColor"
      style={{ color }}
    >
      {radii.map((r, idx) => (
        <circle
          key={r}
          cx={0}
          cy={0}
          r={r}
          strokeWidth={idx % 2 ? 1 : 1.5}
          strokeDasharray={idx % 2 ? '4 8' : undefined}
        />
      ))}
      {radii.map((r, idx) =>
        [0.35, 0.9, 1.3].map((angle, n) => (
          <circle
            key={`${r}-${n}`}
            cx={Math.round(Math.cos(angle + 0.4 * idx) * r)}
            cy={Math.round(Math.sin(angle + 0.4 * idx) * r)}
            r={n === 1 ? 6 : 4}
            fill="currentColor"
            stroke="none"
          />
        ))
      )}
      <circle cx={0} cy={0} r={18} fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatIDo() {
  const { t } = useLocale();
  const containerRef = useRef<HTMLElement>(null);
  const pinTargetRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [isPinned, setIsPinned] = useState(false);

  const scrollToStage = (index: number) => {
    const st = timelineRef.current?.scrollTrigger;
    if (!st) return;
    const targetScroll =
      st.start + ((st.end - st.start) * index) / (servicesData.length - 1);
    if (window.__lenis) {
      window.__lenis.scrollTo(targetScroll, { duration: 1.2 });
    } else {
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

  useGSAP(
    () => {
      const pinTarget = pinTargetRef.current;
      if (!pinTarget) return;

      const mm = gsap.matchMedia();

      // Header entrance
      gsap.from('[data-services-head] > div > *', {
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: '[data-services-head]',
          start: 'top 80%',
          once: true,
        },
      });

      gsap.from('[data-services-head] li', {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.06,
        delay: 0.15,
        scrollTrigger: {
          trigger: '[data-services-head]',
          start: 'top 80%',
          once: true,
        },
      });

      mm.add('(min-width: 768px)', () => {
        const panels = gsap.utils.toArray<HTMLElement>('[data-panel]');
        const totalSteps = panels.length - 1;

        // Panel 0 starts visible; slice(1) hidden with bottom inset
        gsap.set(panels.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: pinTarget,
            start: 'top top',
            end: () => `+=${totalSteps * window.innerHeight}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onToggle: (self) => setIsPinned(self.isActive),
            onUpdate: (self) => {
              const current = Math.min(
                Math.round(self.progress * totalSteps),
                totalSteps
              );
              setActiveStage(current);
            },
          },
        });

        timelineRef.current = tl;

        panels.forEach((panel, idx) => {
          const watermark = panel.querySelector('[data-panel-word]');
          if (watermark) {
            tl.fromTo(
              watermark,
              { xPercent: 6 },
              { xPercent: -16, duration: Math.max(1, totalSteps) },
              0
            );
          }

          if (idx === 0) return;

          const prevPanel = panels[idx - 1];
          const insertTime = idx - 1;

          tl.to(
            panel,
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1,
              ease: 'power2.inOut',
            },
            insertTime
          )
            .fromTo(
              panel.querySelector('[data-panel-content]'),
              { yPercent: 18, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 1, ease: 'power2.out' },
              insertTime
            )
            .to(
              prevPanel.querySelector('[data-panel-content]'),
              { yPercent: -14, opacity: 0, duration: 1, ease: 'power2.in' },
              insertTime
            );
        });
      });

      mm.add('(max-width: 767px)', () => {
        const panels = gsap.utils.toArray<HTMLElement>('[data-panel]');
        const totalSteps = panels.length - 1;

        gsap.set(panels.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: pinTarget,
            start: 'top top',
            end: () => `+=${totalSteps * window.innerHeight}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onToggle: (self) => setIsPinned(self.isActive),
            onUpdate: (self) => {
              const current = Math.min(
                Math.round(self.progress * totalSteps),
                totalSteps
              );
              setActiveStage(current);
            },
          },
        });

        timelineRef.current = tl;

        panels.forEach((panel, idx) => {
          if (idx === 0) return;
          const prevPanel = panels[idx - 1];
          const insertTime = idx - 1;

          tl.to(
            panel,
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1,
              ease: 'power2.inOut',
            },
            insertTime
          )
            .fromTo(
              panel.querySelector('[data-panel-content]'),
              { yPercent: 18, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 1, ease: 'power2.out' },
              insertTime
            )
            .to(
              prevPanel.querySelector('[data-panel-content]'),
              { yPercent: -14, opacity: 0, duration: 1, ease: 'power2.in' },
              insertTime
            );
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      aria-labelledby="services-title"
      className="relative text-[#0f1630]"
    >
      {/* 1. Top Header Area */}
      <div className="relative isolate overflow-hidden bg-[#f3f5f9] h-[655.3px] md:h-[555px] text-[#0f1630]">
        {/* Background Gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_75%_at_80%_30%,rgba(47,69,255,0.10),transparent_70%),radial-gradient(35%_50%_at_8%_100%,rgba(255,178,30,0.08),transparent_70%)]"
        />

        {/* Top Grid SVG */}
        <svg
          aria-hidden="true"
          viewBox="0 0 760 460"
          preserveAspectRatio="xMinYMin slice"
          className="pointer-events-none absolute start-0 top-0 -z-10 h-full w-full select-none text-[#2f45ff] [mask-image:radial-gradient(100%_100%_at_0%_0%,black_0%,rgba(0,0,0,0.45)_40%,transparent_75%)] lg:w-[64%]"
          fill="none"
          stroke="currentColor"
        >
          <g strokeWidth="0.6" opacity="0.08">
            {Array.from({ length: 39 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 20} y1="0" x2={i * 20} y2="460" />
            ))}
            {Array.from({ length: 24 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 20} x2="760" y2={i * 20} />
            ))}
          </g>
        </svg>

        {/* Two-Column Header & Nav Grid */}
        <div
          data-services-head="true"
          className="mx-auto grid max-w-[1280px] gap-12 px-5 pb-16 pt-20 md:px-10 md:pb-20 md:pt-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-end lg:gap-20"
        >
          {/* Left Column with Hacker/Matrix Scramble Text */}
          <div>
            <h2
              id="services-title"
              className="text-[clamp(3rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.035em] text-[#0f1630]"
            >
              <ScrambleText text={t('home', 'v2.servicesTitle') || 'What I do'} />
            </h2>
            <p className="mt-5 max-w-[38ch] text-lg leading-relaxed text-[#5b6482]">
              {t('home', 'v2.servicesIntro') ||
                'From the first sketch to the last deploy, these are the parts of a product I own.'}
            </p>
          </div>

          {/* Right Column List with Animated Hover */}
          <ol className="border-t border-[#dce1ec] text-[#0f1630]">
            {servicesData.map((svc, idx) => {
              const kind = ['ai', 'fullstack', 'web', 'mobile', 'ui', 'integrations'][idx % 6];
              const cfg = stageConfigs[kind] ?? stageConfigs.web;
              return (
                <li key={svc.id} className="border-b border-[#dce1ec] text-[#0f1630]">
                  <button
                    type="button"
                    onClick={() => scrollToStage(idx)}
                    className="group flex w-full items-center gap-4 rounded-lg py-3.5 text-start outline-none transition-[translate] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] hover:translate-x-2 md:gap-5 md:py-4 text-[#0f1630] cursor-pointer"
                  >
                    <span className="w-7 shrink-0 text-sm font-bold tabular-nums text-[#5b6482]">
                      {svc.stepNumber}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`size-3.5 shrink-0 rounded-[4px] ring-1 ring-inset ring-black/10 transition-[scale,border-radius] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.6] group-hover:rounded-[3px] md:size-4 ${cfg.bg}`}
                    />
                    <span className="min-w-0 flex-1 text-lg font-bold leading-tight tracking-tight text-[#0f1630] md:text-2xl">
                      {svc.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* 2. Bending Separator Inside S4 */}
      <div className="pointer-events-none relative z-30 h-0">
        <svg
          className="absolute inset-x-0 -top-20 h-40 w-full text-[#0f1630]"
          fill="none"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 80 Q720 80 1440 80 Z" fill="#2f45ff" />
        </svg>
      </div>

      {/* 3. Pinned Stages Container */}
      <div
        ref={pinTargetRef}
        className="relative h-[100svh] overflow-hidden"
      >
        {servicesData.map((stage, idx) => {
          const kind = ['ai', 'fullstack', 'web', 'mobile', 'ui', 'integrations'][idx % 6];
          const cfg = stageConfigs[kind] ?? stageConfigs.web;

          return (
            <article
              key={stage.id}
              data-panel="true"
              aria-label={stage.title}
              style={{
                zIndex: idx + 1,
              }}
              className={`absolute inset-0 overflow-hidden ${cfg.bg} ${cfg.textColor}`}
            >
              {/* Giant Background Watermark Text */}
              <span
                data-panel-word="true"
                aria-hidden="true"
                dir="ltr"
                style={{
                  WebkitTextStroke: `2px ${cfg.strokeColor}`,
                }}
                className="pointer-events-none absolute -bottom-[0.18em] start-0 select-none whitespace-nowrap text-[34vw] font-bold leading-none tracking-[-0.06em] text-transparent md:text-[24vw] lg:[mask-image:linear-gradient(to_right,transparent_0%,transparent_38%,black_62%)]"
              >
                {cfg.word}
              </span>

              {/* Generative Blueprint SVG for this service */}
              <StageArtwork kind={kind} color={cfg.strokeColor} />

              {/* Main Content Layout */}
              <div
                data-panel-content="true"
                className="relative mx-auto grid h-full max-w-[1280px] grid-rows-[auto_minmax(0,1fr)_auto] gap-6 px-5 pb-28 pt-24 md:px-10 md:pb-16 md:pt-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-1 lg:gap-12"
              >
                {/* Left Header Column */}
                <div className="flex flex-col lg:justify-between lg:py-4">
                  <h3 className="max-w-[12ch] pb-[0.1em] text-[clamp(2.5rem,5.5vw,5.75rem)] font-bold leading-[1] tracking-[-0.035em]">
                    {stage.title}
                  </h3>

                  {/* Desktop Description & Tag Pills */}
                  <div className={`mt-8 hidden lg:block border-t pt-6 ${cfg.line}`}>
                    <p className={`max-w-[44ch] text-xl font-medium leading-snug ${cfg.descColor}`}>
                      {stage.description}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      <span className={`me-1 text-xs font-bold ${cfg.descColor}`}>
                        Built with:
                      </span>
                      {stage.builtWith.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full px-3.5 py-1.5 text-xs font-bold md:text-sm ${cfg.chip}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Middle Spacer */}
                <div aria-hidden="true" className="relative min-h-0" />

                {/* Mobile Description & Tag Pills */}
                <div className={`lg:hidden border-t pt-6 ${cfg.line}`}>
                  <p className={`max-w-[44ch] text-base font-medium leading-relaxed ${cfg.descColor}`}>
                    {stage.description}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <span className={`me-1 text-xs font-bold ${cfg.descColor}`}>
                      Built with:
                    </span>
                    {stage.builtWith.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-bold md:text-sm ${cfg.chip}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {/* Right Rail Navigation Indicator */}
        <nav
          aria-label="What I do"
          style={{
            opacity: isPinned ? 1 : 0,
            transform: isPinned ? 'translateX(0px)' : 'translateX(16px)',
            transition: 'opacity 0.5s cubic-bezier(0.19,1,0.22,1), transform 0.5s cubic-bezier(0.19,1,0.22,1)',
          }}
          className={`absolute end-4 top-1/2 z-50 -translate-y-1/2 md:end-8 text-white ${
            isPinned ? '' : 'pointer-events-none'
          }`}
        >
          <ul className="group/rail flex flex-col items-end py-2">
            {servicesData.map((svc, idx) => {
              const isActive = activeStage === idx;
              return (
                <li key={svc.id}>
                  <button
                    type="button"
                    onClick={() => scrollToStage(idx)}
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={svc.title}
                    className="flex items-center gap-3 py-[9px] ps-4 cursor-pointer"
                  >
                    <span
                      className={`hidden whitespace-nowrap text-[13px] font-bold opacity-0 lg:block transition-[opacity,transform] duration-300 group-hover/rail:opacity-100 group-hover/rail:translate-x-0 translate-x-2 ${
                        isActive ? '' : 'group-hover/rail:opacity-50'
                      }`}
                    >
                      {svc.title}
                    </span>
                    <span
                      className={`block h-[2px] rounded-full bg-current transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${
                        isActive ? 'w-10 opacity-100' : 'w-4 opacity-35'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
  );
}
