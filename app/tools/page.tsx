'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { BendingEdge } from '@/components/shared/bending-edge';
import { ScrambleText } from '@/components/shared/scramble-text';
import { ContactCTA } from '@/components/sections/contact-cta';
import { useSubpageHero } from '@/hooks/use-subpage-hero';
import { useRevealGroup } from '@/hooks/use-reveal-group';
import { useLocale } from '@/lib/locale-context';
import toolsData from '@/lib/tools-data.json';

const CATEGORIES = [
  'All',
  'Developer tools',
  'Design tools',
  'CSS tools',
  'Content tools',
  'Utilities',
  'SEO tools',
];

const HERO_TILES = [
  { slug: 'color-palette-generator', x: '4%', y: '0%', r: -8, depth: 1.4, size: 'w-[13rem]' },
  { slug: 'json-formatter', x: '50%', y: '6%', r: 6, depth: 0.8, size: 'w-[11rem]' },
  { slug: 'glassmorphism', x: '30%', y: '42%', r: -3, depth: 1.8, size: 'w-[14rem]' },
  { slug: 'nik-parser', x: '0%', y: '64%', r: 7, depth: 1, size: 'w-[10rem]' },
  { slug: 'gradient-text', x: '58%', y: '60%', r: -10, depth: 0.6, size: 'w-[10.5rem]' },
];

export default function ToolsPage() {
  const { locale, t } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Hook up authentic hero animation with [data-tile] stagger
  useSubpageHero(heroRef, glowRef, {
    onSetupTimeline: (tl) => {
      tl.to(
        '[data-tile]',
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.3,
          stagger: 0.08,
        },
        '-=1'
      );
    },
  });

  const headline =
    t('tools', 'index.headline') || 'Small tools that do one job well';
  const headlineWords = headline.split(' ');
  const intro =
    t('tools', 'index.intro') ||
    'Free tools I built for my own work. They run in your browser, so what you paste stays on your device.';

  const filteredTools = useMemo(() => {
    return toolsData.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'All' || tool.category === selectedCategory;
      const matchesSearch =
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  useRevealGroup(listRef, [filteredTools]);

  return (
    <>
      {/* 1. Dark Hero Section */}
      <section
        ref={heroRef}
        aria-labelledby="tools-title"
        className="relative isolate overflow-hidden bg-[#070a1a] text-white"
      >
        {/* Ambient radial glows */}
        <div ref={glowRef} aria-hidden="true" className="pointer-events-none absolute -inset-40 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(38%_32%_at_76%_30%,rgba(47,69,255,0.55),transparent_72%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(30%_26%_at_16%_70%,rgba(116,131,255,0.26),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(22%_18%_at_58%_82%,rgba(25,195,156,0.16),transparent_70%)]" />
        </div>

        {/* Backdrop Giant Outline Word */}
        <span
          data-backdrop="true"
          aria-hidden="true"
          dir="ltr"
          className="pointer-events-none absolute start-0 top-[15rem] -z-10 select-none whitespace-nowrap text-[30vw] font-bold leading-none tracking-[-0.06em] text-transparent md:top-[10rem] md:text-[22vw]"
          style={{ WebkitTextStroke: '2px rgba(116, 131, 255, 0.16)' }}
        >
          TOOLS
        </span>

        <div className="mx-auto grid max-w-[1280px] gap-14 px-5 pb-24 pt-36 md:px-10 md:pb-32 md:pt-44 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-center lg:gap-10">
          {/* Left Column: Heading, Intro, Stats */}
          <div>
            <h1
              id="tools-title"
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

            <p
              data-reveal="true"
              className="mt-8 max-w-[44ch] text-lg font-medium leading-relaxed text-white/70 md:mt-10 md:text-xl"
            >
              {intro}
            </p>

            <dl data-reveal="true" className="mt-10 flex gap-8 md:gap-12">
              <div className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-white/60">
                  {t('tools', 'index.statTools') || 'Tools'}
                </dt>
                <dd
                  data-count="50"
                  className="text-4xl font-bold tabular-nums tracking-tight md:text-5xl"
                >
                  50
                </dd>
              </div>
              <div className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-white/60">
                  {t('tools', 'index.statGroups') || 'Groups'}
                </dt>
                <dd
                  data-count="6"
                  className="text-4xl font-bold tabular-nums tracking-tight md:text-5xl"
                >
                  6
                </dd>
              </div>
              <div className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-white/60">
                  {t('tools', 'index.statSignups') || 'Sign-ups'}
                </dt>
                <dd
                  data-count="0"
                  className="text-4xl font-bold tabular-nums tracking-tight md:text-5xl"
                >
                  0
                </dd>
              </div>
            </dl>
          </div>

          {/* Right Column: Floating Tool Tiles Illustration */}
          <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-[24rem]">
            {/* Tile 1: Color Palette (Yellow) */}
            <div
              data-depth={HERO_TILES[0].depth}
              className={`absolute hover:z-10 focus-within:z-10 select-none ${HERO_TILES[0].size}`}
              style={{ insetInlineStart: HERO_TILES[0].x, top: HERO_TILES[0].y }}
            >
              <div data-tile="true">
                <Link
                  href="/tools/color-palette-generator"
                  className="group block aspect-square overflow-hidden rounded-[24px] bg-[#ffb21e] p-4 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)] outline-none ring-1 ring-white/10 transition-[transform,border-radius] duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:scale-[1.06] hover:rounded-[32px] focus-visible:ring-2 focus-visible:ring-[#ffc24d]"
                  style={{ rotate: `${HERO_TILES[0].r}deg` }}
                >
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex gap-1.5">
                      <div className="h-20 w-4 rounded-full bg-[#0f1630]" />
                      <div className="h-20 w-4 rounded-full bg-[#2f45ff]" />
                      <div className="h-20 w-4 rounded-full bg-white" />
                      <div className="h-20 w-4 rounded-full bg-[#19c39c]" />
                    </div>
                    <div className="h-3 w-12 rounded-full bg-[#0f1630]/20" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Tile 2: Code Brackets (Blue) */}
            <div
              data-depth={HERO_TILES[1].depth}
              className={`absolute hover:z-10 focus-within:z-10 select-none ${HERO_TILES[1].size}`}
              style={{ insetInlineStart: HERO_TILES[1].x, top: HERO_TILES[1].y }}
            >
              <div data-tile="true">
                <Link
                  href="/tools/json-formatter"
                  className="group block aspect-square overflow-hidden rounded-[24px] bg-[#2f45ff] p-5 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)] outline-none ring-1 ring-white/10 transition-[transform,border-radius] duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:scale-[1.06] hover:rounded-[32px] focus-visible:ring-2 focus-visible:ring-[#ffc24d] flex items-center justify-center"
                  style={{ rotate: `${HERO_TILES[1].r}deg` }}
                >
                  <span className="font-mono text-5xl font-bold text-white tracking-tight">
                    {'{ }'}
                  </span>
                </Link>
              </div>
            </div>

            {/* Tile 3: Glass Card */}
            <div
              data-depth={HERO_TILES[2].depth}
              className={`absolute hover:z-10 focus-within:z-10 select-none ${HERO_TILES[2].size}`}
              style={{ insetInlineStart: HERO_TILES[2].x, top: HERO_TILES[2].y }}
            >
              <div data-tile="true">
                <Link
                  href="/tools/glassmorphism"
                  className="liquid-glass group block aspect-[4/3] overflow-hidden rounded-[22px] p-3.5 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)] outline-none ring-1 ring-white/20 transition-[transform,border-radius] duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:scale-[1.06] hover:rounded-[32px] focus-visible:ring-2 focus-visible:ring-[#ffc24d]"
                  style={{ rotate: `${HERO_TILES[2].r}deg` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#2f45ff]/40" />
                    <div className="space-y-1">
                      <div className="h-2.5 w-14 rounded-full bg-white/60" />
                      <div className="h-2 w-10 rounded-full bg-white/30" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 border-t border-white/10 pt-2">
                    <div className="h-2 w-full rounded-full bg-white/20" />
                    <div className="h-2 w-3/4 rounded-full bg-white/20" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Tile 4: ID Card / Controls */}
            <div
              data-depth={HERO_TILES[3].depth}
              className={`absolute hover:z-10 focus-within:z-10 select-none ${HERO_TILES[3].size}`}
              style={{ insetInlineStart: HERO_TILES[3].x, top: HERO_TILES[3].y }}
            >
              <div data-tile="true">
                <Link
                  href="/tools/nik-parser"
                  className="group block aspect-square overflow-hidden rounded-[22px] bg-white p-3.5 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)] ring-1 ring-black/5 transition-[transform,border-radius] duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:scale-[1.06] hover:rounded-[32px] focus-visible:ring-2 focus-visible:ring-[#ffc24d]"
                  style={{ rotate: `${HERO_TILES[3].r}deg` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#2f45ff]" />
                    <div className="space-y-1">
                      <div className="h-2.5 w-14 rounded-full bg-[#0f1630]" />
                      <div className="h-2 w-10 rounded-full bg-[#0f1630]/30" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 border-t border-line pt-2">
                    <div className="h-2 w-full rounded-full bg-[#0f1630]/10" />
                    <div className="h-2 w-3/4 rounded-full bg-[#0f1630]/10" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Tile 5: Typography Aa (Blue with Gradient Text) */}
            <div
              data-depth={HERO_TILES[4].depth}
              className={`absolute hover:z-10 focus-within:z-10 select-none ${HERO_TILES[4].size}`}
              style={{ insetInlineStart: HERO_TILES[4].x, top: HERO_TILES[4].y }}
            >
              <div data-tile="true">
                <Link
                  href="/tools/gradient-text"
                  className="group block aspect-square overflow-hidden rounded-[24px] bg-[#2f45ff] p-4 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)] ring-1 ring-white/10 transition-[transform,border-radius] duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:scale-[1.06] hover:rounded-[32px] focus-visible:ring-2 focus-visible:ring-[#ffc24d] flex items-center justify-center"
                  style={{ rotate: `${HERO_TILES[4].r}deg` }}
                >
                  <span
                    className="text-6xl font-black tracking-tighter"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff, #ffb21e)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Aa
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Separator: Dark Hero -> Light Canvas with Dynamic Velocity Bending */}
      <BendingEdge above="#070a1a" below="#f3f5f9" />

      {/* 2. Paper Canvas Content Area */}
      <div className="bg-paper pb-28 pt-10 md:pb-36" ref={listRef}>
        <section
          aria-labelledby="list-title"
          className="mx-auto max-w-[1280px] px-5 pt-24 md:px-10 md:pt-32"
        >
          {/* Section Header */}
          <div data-list-head="true" className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2
                id="list-title"
                className="pb-[0.08em] text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-none tracking-[-0.035em] text-ink"
              >
                <ScrambleText text={t('tools', 'index.listTitle') || 'Pick a tool'} />
              </h2>
              <p className="mt-4 text-lg text-dim">
                {t('tools', 'index.listLead') || 'Open one and start typing. No account needed.'}
              </p>
            </div>
            <p className="pb-1 text-[15px] font-bold tabular-nums text-dim">
              {filteredTools.length} tools
            </p>
          </div>

          {/* Search Bar & Filter Pills */}
          <div className="mt-10 grid gap-6 md:mt-12">
            <label className="group relative block">
              <span className="sr-only">
                {t('tools', 'index.searchLabel') || 'Search tools'}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke="currentColor"
                className="pointer-events-none absolute start-0 top-1/2 -translate-y-1/2 text-dim transition-colors group-focus-within:text-cobalt"
                aria-hidden="true"
              >
                <path d="M17.5 17.5L22 22" />
                <path d="M20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C15.9706 20 20 15.9706 20 11Z" />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('tools', 'index.searchPlaceholder') || 'Search by name or task'}
                className="w-full border-b-2 border-line bg-transparent py-4 pe-12 ps-10 text-xl font-bold tracking-tight text-ink outline-none transition-colors placeholder:font-medium placeholder:text-dim/70 focus:border-cobalt md:text-2xl"
              />
            </label>

            {/* Category Pills */}
            <div
              role="group"
              aria-label="Filter by group"
              className="-mx-5 flex gap-1 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0"
            >
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    aria-pressed={isSelected}
                    className={`relative shrink-0 rounded-full px-4 py-2 text-[15px] font-bold outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-cobalt ${
                      isSelected
                        ? 'text-paper'
                        : 'text-dim hover:text-ink'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute inset-0 rounded-full bg-ink" />
                    )}
                    <span className="relative">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 50 Tools List */}
          <ul data-rows="true" className="mt-8 md:mt-10">
            {filteredTools.map((tool) => (
              <li key={tool.slug} data-reveal-group="true" className="relative">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px bg-line"
                />

                <div data-row-inner="true" data-in="true">
                  <Link
                    href={tool.href}
                    className="group relative isolate grid grid-cols-[4.25rem_minmax(0,1fr)] items-center gap-x-4 gap-y-1 py-5 outline-none transition-opacity duration-500 md:grid-cols-[3.5rem_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,0.7fr)] md:gap-x-8 md:py-7"
                  >
                    {/* Hover Card Surface */}
                    <span
                      aria-hidden="true"
                      className="absolute -inset-x-4 inset-y-1 -z-10 scale-[0.98] rounded-[22px] bg-white opacity-0 shadow-[0_24px_50px_-32px_rgba(15,22,48,0.35)] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-100 group-hover:opacity-100 md:-inset-x-6"
                    />

                    {/* Number */}
                    <span className="hidden text-base font-bold tabular-nums text-dim transition-colors group-hover:text-cobalt md:block">
                      {tool.num}
                    </span>

                    {/* Title */}
                    <span className="min-w-0 text-xl font-bold leading-snug tracking-[-0.02em] text-ink transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-x-2 rtl:group-hover:-translate-x-2 md:text-2xl">
                      {tool.title}
                    </span>

                    {/* Description */}
                    <span className="line-clamp-2 min-w-0 text-[15px] leading-relaxed text-dim md:text-base">
                      {tool.description}
                    </span>

                    {/* Category */}
                    <span className="col-start-2 hidden text-sm font-semibold text-dim md:col-start-4 md:block">
                      {tool.category}
                    </span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Separator: Light Canvas -> Footer */}
      <BendingEdge above="#f3f5f9" below="#070a1a" />

      {/* Reusable Contact CTA Section */}
      <ContactCTA />
    </>
  );
}
