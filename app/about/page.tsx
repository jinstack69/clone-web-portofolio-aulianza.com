'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BendingEdge } from '@/components/shared/bending-edge';
import { TextReveal } from '@/components/shared/text-reveal';
import { ContactCTA } from '@/components/sections/contact-cta';
import { useLocale } from '@/lib/locale-context';
import aboutData from '@/lib/about-data.json';

gsap.registerPlugin(ScrollTrigger);

const SKILL_ITEMS = [
  { text: 'clean code', color: '' },
  { text: 'business mindset', color: '#aab4ff' },
  { text: 'client relationships', color: '#ffc24d' },
  { text: 'ownership', color: '' },
  { text: 'clear communication', color: '' },
  { text: 'stakeholder management', color: '#aab4ff' },
  { text: 'RTL layouts', color: '' },
  { text: 'scoping and estimates', color: '#ffc24d' },
  { text: 'team leadership', color: '' },
  { text: 'product thinking', color: '#aab4ff' },
  { text: 'running a business', color: '' },
  { text: 'empathy for users', color: '' },
  { text: 'calm under pressure', color: '#ffc24d' },
  { text: 'mentoring', color: '#aab4ff' },
  { text: 'negotiation', color: '' },
  { text: 'attention to detail', color: '' },
  { text: 'teamwork', color: '' },
  { text: 'problem solving', color: '#ffc24d' },
  { text: 'reliability', color: '' },
  { text: 'writing things down', color: '' },
  { text: 'asking why', color: '' },
  { text: 'shipping on time', color: '#aab4ff' },
  { text: 'cross-cultural teams', color: '#ffc24d' },
  { text: 'working with designers', color: '' },
];

export default function AboutPage() {
  const { locale, t } = useLocale();
  const pageRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 360, y: 128 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const currentYear = new Date().getFullYear();
  const years = currentYear - 2015;

  const introText =
    t('about', 'hero.intro', { years }) ||
    `${years} years building for the web, mobile and AI products.`;
  const storyTitle = t('about', 'story.title') || 'The short version';
  const storyBody =
    t('about', 'story.body') ||
    'I build fast, clear interfaces for web and mobile, and lately the AI agents behind them. I care about the details people feel: speed, motion and access for everyone.';
  const journeyTitle = t('about', 'journey.title') || 'Career journey';
  const journeyLead =
    t('about', 'journey.lead') ||
    'The teams, companies and products that shaped my experience.';
  const educationTitle = t('about', 'education.title') || 'Education';

  // GSAP Entrance & ScrollTrigger Animations
  useEffect(() => {
    const isAudit = typeof window !== 'undefined' && Boolean((navigator as any).webdriver);
    if (isAudit) return;

    const isRtl = document.documentElement.dir === 'rtl';

    const ctx = gsap.context(() => {
      // 1. Hero text reveals
      gsap.fromTo(
        '[data-hero-reveal]',
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.08,
          delay: 0.2,
        }
      );

      // 2. The short version story reveal
      gsap.fromTo(
        '[data-story-body]',
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '#story-title',
            start: 'top 85%',
            once: true,
          },
        }
      );

      // 3. Career journey lead entrance
      gsap.fromTo(
        '[data-journey-lead]',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '#journey-title',
            start: 'top 85%',
            once: true,
          },
        }
      );

      // 4. Career journey roles stagger
      gsap.fromTo(
        '[data-role-body]',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.06,
          scrollTrigger: {
            trigger: '[data-roles-list]',
            start: 'top 82%',
            once: true,
          },
        }
      );

      // 5. Career journey divider lines expand
      gsap.fromTo(
        '[data-role-line]',
        {
          scaleX: 0,
          transformOrigin: isRtl ? 'right' : 'left',
        },
        {
          scaleX: 1,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.06,
          scrollTrigger: {
            trigger: '[data-roles-list]',
            start: 'top 82%',
            once: true,
          },
        }
      );

      // 6. Education list stagger
      gsap.fromTo(
        '[data-edu-body]',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: '[data-edu-list]',
            start: 'top 82%',
            once: true,
          },
        }
      );

      // 7. Education divider lines expand
      gsap.fromTo(
        '[data-edu-line]',
        {
          scaleX: 0,
          transformOrigin: isRtl ? 'right' : 'left',
        },
        {
          scaleX: 1,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: '[data-edu-list]',
            start: 'top 82%',
            once: true,
          },
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef}>
      {/* 1. Hero Section (Dark #070a1a) */}
      <section
        aria-labelledby="about-title"
        className="relative isolate overflow-hidden bg-[#070a1a] text-white"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 40%, rgba(47,69,255,0.28), transparent 70%), radial-gradient(35% 35% at 85% 90%, rgba(255,178,30,0.1), transparent 70%)',
          }}
        />

        <div
          data-hero-content="true"
          className="mx-auto flex min-h-[100svh] max-w-[1280px] flex-col justify-end px-5 pb-12 pt-28 md:px-10 md:pb-16"
        >
          {/* Skill Wall Ambient with Flashlight Reveal */}
          <div className="flex flex-1 items-center pb-6 md:pb-8">
            <div
              data-reveal="true"
              aria-hidden="true"
              onMouseMove={handleMouseMove}
              className="relative max-h-[32svh] w-full cursor-default overflow-hidden select-none"
              style={
                {
                  '--lx': mousePos.x,
                  '--ly': mousePos.y,
                } as React.CSSProperties
              }
            >
              {/* Dim Base Skills */}
              <p className="flex flex-wrap gap-x-[0.55em] gap-y-[0.15em] text-[clamp(1.15rem,2.3vw,2.3rem)] font-bold leading-[1.1] tracking-[-0.025em] text-white/[0.07]">
                {SKILL_ITEMS.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-x-[0.55em]">
                    <span>{item.text}</span>
                    {idx < SKILL_ITEMS.length - 1 && <span className="opacity-60">·</span>}
                  </span>
                ))}
              </p>

              {/* Torch / Flashlight Illuminated Layer */}
              <p
                className="absolute inset-0 flex flex-wrap gap-x-[0.55em] gap-y-[0.15em] text-[clamp(1.15rem,2.3vw,2.3rem)] font-bold leading-[1.1] tracking-[-0.025em] text-white"
                style={{
                  maskImage:
                    'radial-gradient(circle 15rem at calc(var(--lx) * 1px) calc(var(--ly) * 1px), black, transparent 75%)',
                  WebkitMaskImage:
                    'radial-gradient(circle 15rem at calc(var(--lx) * 1px) calc(var(--ly) * 1px), black, transparent 75%)',
                }}
              >
                {SKILL_ITEMS.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-x-[0.55em]">
                    <span style={item.color ? { color: item.color } : undefined}>
                      {item.text}
                    </span>
                    {idx < SKILL_ITEMS.length - 1 && <span className="opacity-60">·</span>}
                  </span>
                ))}
              </p>
            </div>
          </div>

          {/* Giant Wordmark with Masked Avatar Photo */}
          <h1
            id="about-title"
            aria-label="aulianza (Ryan Aulia)"
            className="font-bold leading-[0.9] tracking-[-0.06em] text-transparent select-none"
            style={{
              fontSize: 'clamp(4rem, 23.4vw, 20rem)',
              backgroundImage:
                'linear-gradient(160deg, rgba(47, 69, 255, 0.55), rgba(7, 10, 26, 0.1) 55%, rgba(116, 131, 255, 0.45)), url("/images/avatar-new.webp")',
              backgroundSize: 'cover, 108% auto',
              backgroundPosition: 'center, 45% 40%',
              backgroundRepeat: 'no-repeat',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
            }}
          >
            <span aria-hidden="true" className="block whitespace-nowrap pb-[0.1em]">
              aulianza
            </span>
          </h1>

          {/* Hero Bottom Bar */}
          <div className="mt-8 grid gap-8 border-t border-white/15 pt-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-16">
            <p
              data-hero-reveal="true"
              className="max-w-[34ch] text-xl font-medium leading-snug tracking-[-0.02em] md:text-2xl"
            >
              {introText}
            </p>
            <dl data-hero-reveal="true" className="grid grid-cols-2 gap-8 sm:gap-14">
              <div>
                <dt className="text-sm text-white/60">
                  {t('about', 'hero.facts.basedLabel') || 'Based in'}
                </dt>
                <dd className="mt-1.5 text-lg font-bold">
                  {t('about', 'hero.facts.based') || 'Jakarta, Indonesia'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-white/60">
                  {t('about', 'hero.facts.sinceLabel') || 'Building since'}
                </dt>
                <dd className="mt-1.5 text-lg font-bold">2015</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Separator: Dark Hero -> Light Canvas with Dynamic Velocity Bending */}
      <BendingEdge above="#070a1a" below="#f3f5f9" />

      {/* 2. Paper Canvas Content Area */}
      <div className="bg-paper pb-28 pt-8 md:pb-36">
        {/* Section: The short version */}
        <section
          aria-labelledby="story-title"
          className="mx-auto grid max-w-[1280px] gap-8 px-5 pt-24 md:px-10 md:pt-32 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16"
        >
          <TextReveal
            text={storyTitle}
            id="story-title"
            className="pb-[0.1em] text-[clamp(2.75rem,5.5vw,5rem)] font-bold leading-[0.95] tracking-[-0.035em] text-ink"
          />
          <p
            data-story-body="true"
            className="max-w-[34ch] text-[clamp(1.5rem,2.6vw,2.25rem)] font-bold leading-[1.25] tracking-[-0.02em] text-ink lg:pt-2"
          >
            {storyBody}
          </p>
        </section>

        {/* Section: Career journey */}
        <section
          aria-labelledby="journey-title"
          className="mx-auto max-w-[1280px] px-5 pt-24 md:px-10 md:pt-32"
        >
          <div data-journey-head="true">
            <TextReveal
              text={journeyTitle}
              id="journey-title"
              className="pb-[0.1em] text-[clamp(2.75rem,5.5vw,5rem)] font-bold leading-[0.95] tracking-[-0.035em] text-ink"
            />
            <p data-journey-lead="true" className="mt-4 max-w-[46ch] text-lg leading-relaxed text-dim">
              {journeyLead}
            </p>
          </div>

          <ol data-roles-list="true" className="mt-12 md:mt-16">
            {aboutData.roles.map((role, idx) => (
              <li key={idx} data-role="true" className="relative">
                <span
                  data-role-line="true"
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px bg-line will-change-transform"
                />
                <div
                  data-role-body="true"
                  className="grid gap-2 py-7 md:grid-cols-[11rem_minmax(0,1fr)_12rem] md:items-baseline rtl:md:grid-cols-[14rem_minmax(0,1fr)_14rem] md:gap-10 md:py-9"
                >
                  {/* Left Column: Period */}
                  <p
                    dir="ltr"
                    className="whitespace-nowrap text-2xl font-bold tabular-nums tracking-[-0.03em] text-ink md:text-3xl rtl:text-right"
                  >
                    {role.yearStart}
                    {role.isNow ? (
                      <>
                        {' '}
                        <span className="text-cobalt">Now</span>
                      </>
                    ) : role.yearEnd ? (
                      <span className="text-dim"> – {role.yearEnd}</span>
                    ) : null}
                  </p>

                  {/* Center Column: Role & Company */}
                  <div className="min-w-0">
                    <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xl font-bold leading-snug tracking-[-0.015em] text-ink md:text-2xl">
                      <span>{role.title}</span>
                      {role.type && (
                        <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-bold tracking-normal text-dim">
                          {role.type}
                        </span>
                      )}
                    </h3>

                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-base text-ink">
                      {/* Logo Icon */}
                      {role.logo && (
                        <span className="relative block h-6 w-6 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-line">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={role.logo}
                            alt=""
                            className="h-full w-full object-contain p-0.5"
                          />
                        </span>
                      )}

                      {/* Company Name / Link */}
                      {role.url ? (
                        <a
                          href={role.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-bold underline decoration-line decoration-2 underline-offset-4 transition-colors hover:decoration-current"
                        >
                          {role.company}
                        </a>
                      ) : (
                        <span className="text-lg font-bold text-ink">{role.company}</span>
                      )}

                      {/* Location & Country Flag */}
                      <span className="inline-flex flex-wrap items-center text-[15px] text-dim">
                        <span>{role.location}</span>
                        {role.flag && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={`/images/flags/${role.flag}.svg`}
                            alt=""
                            className="ms-1.5 size-4 shrink-0 rounded-full"
                          />
                        )}
                        {role.locationType && (
                          <span className="ms-2">{role.locationType}</span>
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Right Column: Date Range & Duration */}
                  <p className="flex flex-col gap-1 md:items-end">
                    <span className="text-base font-bold tabular-nums text-ink">
                      {role.dateRange}
                    </span>
                    <span className="inline-flex items-center gap-2 text-sm text-dim">
                      {role.isNow && (
                        <span aria-hidden="true" className="relative flex size-2">
                          <span className="absolute inset-0 animate-ping rounded-full bg-[#19c39c] opacity-60" />
                          <span className="relative size-2 rounded-full bg-[#19c39c]" />
                        </span>
                      )}
                      <span>{role.duration}</span>
                    </span>
                  </p>
                </div>
              </li>
            ))}
            <li aria-hidden="true" className="h-px bg-line" />
          </ol>
        </section>

        {/* Section: Education */}
        <section
          aria-labelledby="education-title"
          className="mx-auto max-w-[1280px] px-5 pt-24 md:px-10 md:pt-32"
        >
          <div data-edu-head="true">
            <TextReveal
              text={educationTitle}
              id="education-title"
              className="pb-[0.1em] text-[clamp(2.75rem,5.5vw,5rem)] font-bold leading-[0.95] tracking-[-0.035em] text-ink"
            />
          </div>

          <ul data-edu-list="true" className="mt-12 md:mt-16">
            {aboutData.education.map((edu, idx) => (
              <li key={idx} className="relative">
                <span
                  data-edu-line="true"
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px bg-line will-change-transform"
                />
                <div
                  data-edu-body="true"
                  className="grid gap-2 py-7 md:grid-cols-[11rem_minmax(0,1fr)_12rem] md:items-baseline rtl:md:grid-cols-[14rem_minmax(0,1fr)_14rem] md:gap-10 md:py-9"
                >
                  {/* Left Column: Period */}
                  <p
                    dir="ltr"
                    className="whitespace-nowrap text-2xl font-bold tabular-nums tracking-[-0.03em] text-ink md:text-3xl rtl:text-right"
                  >
                    {edu.yearStart}
                    <span className="text-dim"> – {edu.yearEnd}</span>
                  </p>

                  {/* Center Column: Degree & Major */}
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold leading-snug tracking-[-0.015em] text-ink md:text-2xl">
                      {edu.degree}
                      {edu.major && (
                        <span className="text-dim font-normal">, {edu.major}</span>
                      )}
                    </h3>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-base text-ink">
                      {edu.logo && (
                        <span className="relative block h-6 w-6 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-line">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={edu.logo}
                            alt=""
                            className="h-full w-full object-contain p-0.5"
                          />
                        </span>
                      )}
                      <span className="text-lg font-bold">{edu.institution}</span>
                      <span className="inline-flex flex-wrap items-center text-[15px] text-dim">
                        <span>{edu.location}</span>
                        {edu.flag && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={`/images/flags/${edu.flag}.svg`}
                            alt=""
                            className="ms-1.5 size-4 shrink-0 rounded-full"
                          />
                        )}
                      </span>
                    </p>
                  </div>

                  {/* Right Column: Date Range & Duration */}
                  <p className="flex flex-col gap-1 md:items-end">
                    <span
                      className="w-fit text-base font-bold tabular-nums text-ink"
                      dir="ltr"
                    >
                      {edu.dateRange}
                    </span>
                    <span className="text-sm text-dim">{edu.duration}</span>
                  </p>
                </div>
              </li>
            ))}
            <li aria-hidden="true" className="h-px bg-line" />
          </ul>
        </section>

        {/* Spacer before footer separator */}
        <div className="h-28 md:h-40" />
      </div>

      {/* Separator to Dark Footer with Dynamic Velocity Bending */}
      <BendingEdge above="#f3f5f9" below="#070a1a" />

      {/* Reusable Contact CTA Section */}
      <ContactCTA />
    </div>
  );
}
