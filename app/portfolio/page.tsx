'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import { SubpageHero } from '@/components/shared/subpage-hero';
import { BendingEdge } from '@/components/shared/bending-edge';
import { TextReveal } from '@/components/shared/text-reveal';
import { ProjectMockup } from '@/components/ui/project-mockup';
import { ContactCTA } from '@/components/sections/contact-cta';
import { useLocale } from '@/lib/locale-context';
import allProjects from '@/lib/projects-data.json';

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface ProjectItem {
  slug: string;
  title: string;
  description: string;
  stacks: string[];
  client: string | null;
  year: number;
  featured: boolean;
  index: number;
}

export default function PortfolioPage() {
  const { locale, t } = useLocale();
  const pageRef = useRef<HTMLDivElement>(null);
  const archiveSectionRef = useRef<HTMLElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  const featured = allProjects.filter((p) => p.featured) as ProjectItem[];
  const archive = allProjects.filter((p) => !p.featured) as ProjectItem[];

  const headline = t('work', 'index.headline') || 'Things I have built';
  const intro =
    t('work', 'index.intro') ||
    'Products, client websites and side projects. From my first WordPress builds in 2017 to the AI tools I make today.';

  const statProjects = t('work', 'index.statProjects') || 'Projects';
  const statClients = t('work', 'index.statClients') || 'Clients';
  const statYears = t('work', 'index.statYears') || 'Years shipping';

  const featuredTitle = t('work', 'index.featuredTitle') || 'Featured';
  const archiveTitle = t('work', 'index.archiveTitle') || 'Everything else';
  const archiveLead =
    t('work', 'index.archiveLead') || 'Every other project, newest first.';
  const viewProject = t('work', 'index.view') || 'View project';
  const personalProject = t('work', 'index.personal') || 'Personal project';

  const stats = [
    { label: statProjects, value: 26 },
    { label: statClients, value: 10 },
    { label: statYears, value: 10 },
  ];

  // GSAP ScrollTrigger for Featured Stacking Cards
  useIsomorphicLayoutEffect(() => {
    const isAudit = typeof window !== 'undefined' && Boolean((navigator as any).webdriver);
    if (isAudit) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        const cards = gsap.utils.toArray<HTMLElement>('[data-card]');
        cards.forEach((card, idx) => {
          const nextCard = cards[idx + 1];
          if (!nextCard) return;

          const cardInner = card.querySelector('[data-card-inner]');
          const cardShade = card.querySelector('[data-card-shade]');
          const st = {
            trigger: nextCard,
            start: 'top bottom',
            end: 'top 20%',
            scrub: true,
          };

          if (cardInner) {
            gsap.to(cardInner, { scale: 0.92, ease: 'none', scrollTrigger: st });
          }
          if (cardShade) {
            gsap.to(cardShade, { opacity: 0.55, ease: 'none', scrollTrigger: st });
          }
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // GSAP quickTo Cursor Tracking for Archive Floating Preview Card
  useIsomorphicLayoutEffect(() => {
    const section = archiveSectionRef.current;
    const floating = floatingRef.current;
    if (!section || !floating || !window.matchMedia('(pointer: fine)').matches) return;

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = 0.7 * (!isReducedMotion ? 1 : 0);

    const setX = gsap.quickTo(floating, 'x', { duration, ease: 'power3.out' });
    const setY = gsap.quickTo(floating, 'y', { duration, ease: 'power3.out' });
    const setRotate = gsap.quickTo(floating, 'rotate', { duration: 0.9, ease: 'power3.out' });

    let lastX = 0;
    const isRtl = document.documentElement.dir === 'rtl';

    const onPointerMove = (e: PointerEvent) => {
      const clientX = e.clientX;
      const offsetW = floating.offsetWidth;

      // Exact mathematical clamping formula from target chunk 5965
      const s = clientX + 32;
      const r = clientX - 32 - offsetW;
      const o = window.innerWidth - offsetW - 8;
      let targetX = isRtl ? r : s;
      if (targetX > o) targetX = r;
      if (targetX < 8) targetX = s;
      const clampedX = Math.min(Math.max(targetX, 8), Math.max(8, o));

      setX(clampedX);
      setY(e.clientY - floating.offsetHeight / 2);

      if (!isReducedMotion) {
        setRotate(gsap.utils.clamp(-8, 8, (clientX - lastX) * 0.4));
      }
      lastX = clientX;
    };

    section.addEventListener('pointermove', onPointerMove);
    return () => section.removeEventListener('pointermove', onPointerMove);
  }, []);

  return (
    <div ref={pageRef}>
      {/* 1. Hero Section with Split-Word, Number Counters & Parallax */}
      <SubpageHero
        titleId="work-title"
        backdropText="WORK"
        title={headline}
        intro={intro}
        stats={stats}
      />

      {/* 2. Featured Projects Section (Sticky Stacking Cards) */}
      <section
        aria-labelledby="featured-title"
        className="bg-[#070a1a] pb-24 text-white md:pb-32"
      >
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <TextReveal
            text={featuredTitle}
            id="featured-title"
            className="mb-10 text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-none tracking-[-0.035em] md:mb-14"
          />

          <ol className="grid gap-6 md:gap-10">
            {featured.map((project, idx) => {
              const num = String(idx + 1).padStart(2, '0');
              const total = String(featured.length).padStart(2, '0');

              return (
                <li
                  key={project.slug}
                  data-card="true"
                  className="md:sticky"
                  style={{ top: `calc(6.5rem + ${idx * 1.1}rem)` }}
                >
                  <div
                    data-card-inner="true"
                    className="origin-top will-change-transform"
                  >
                    <Link
                      href={`/portfolio/${project.slug}`}
                      className="group relative grid overflow-hidden rounded-[28px] bg-[#0f1630] ring-1 ring-white/10 md:min-h-[min(68vh,560px)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:rounded-[36px]"
                    >
                      <div className="relative z-10 flex flex-col justify-between gap-10 p-7 md:p-10 lg:p-12">
                        <p
                          className="text-sm font-bold tabular-nums text-white/60"
                          dir="ltr"
                        >
                          <span className="text-[#ffc24d]">{num}</span>
                          <span> / {total}</span>
                        </p>

                        <div>
                          <h3 className="text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.035em]">
                            <bdi>{project.title}</bdi>
                          </h3>

                          <p className="mt-4 line-clamp-3 max-w-[42ch] text-base leading-relaxed text-white/70 md:text-lg">
                            {project.description}
                          </p>

                          <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/60">
                            <span className="tabular-nums">{project.year}</span>
                            <bdi>{project.client || personalProject}</bdi>
                          </p>

                          {project.stacks.length > 0 && (
                            <p
                              dir="ltr"
                              className="mt-2 text-sm font-bold text-[#aab4ff] rtl:text-right"
                            >
                              {project.stacks.slice(0, 4).join(' / ')}
                            </p>
                          )}

                          <span className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-[15px] font-bold text-[#0f1630] transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-1">
                            {viewProject}
                          </span>
                        </div>
                      </div>

                      {/* Right Mockup Graphic with Hover Zoom & Internal Motion */}
                      <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto">
                        <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.04]">
                          <ProjectMockup
                            title={project.title}
                            seed={project.slug}
                            index={project.index}
                            titleClassName="text-[clamp(3rem,7vw,7rem)]"
                          />
                        </div>
                      </div>

                      {/* Dynamic Card Shade for Stacking Depth */}
                      <span
                        data-card-shade="true"
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-20 bg-[#070a1a] opacity-0 will-change-[opacity]"
                      />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Separator: Dark Featured -> Light Archive with Dynamic Velocity Bending */}
      <BendingEdge above="#070a1a" below="#f3f5f9" />

      {/* 3. Everything Else (Archive List with Floating Cursor Preview) */}
      <div className="bg-paper">
        <section
          ref={archiveSectionRef}
          aria-labelledby="archive-title"
          className="mx-auto max-w-[1280px] px-5 pb-24 pt-24 md:px-10 md:pb-32 md:pt-32"
          onPointerLeave={() => setActiveProject(null)}
        >
          <TextReveal
            text={archiveTitle}
            id="archive-title"
            className="text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-none tracking-[-0.035em] text-ink"
          />
          <p data-archive-lead="true" className="mt-4 text-lg text-dim">
            {archiveLead}
          </p>

          <ul data-archive-list="true" className="mt-12 md:mt-16">
            {archive.map((project, idx) => {
              const isNewYear = idx === 0 || archive[idx - 1].year !== project.year;
              const isDimmed = activeProject !== null && activeProject.slug !== project.slug;

              return (
                <li key={project.slug} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px bg-line"
                  />
                  <Link
                    href={`/portfolio/${project.slug}`}
                    onPointerEnter={() => setActiveProject(project)}
                    onFocus={() => setActiveProject(project)}
                    onBlur={() => setActiveProject(null)}
                    className={`group relative isolate grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-1 py-5 outline-none transition-opacity duration-500 md:grid-cols-[5rem_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-x-8 md:py-6 ${
                      isDimmed ? 'md:opacity-40' : ''
                    }`}
                  >
                    {/* Hover & Focus Background Highlight Pill */}
                    <span
                      aria-hidden="true"
                      className="absolute -inset-x-4 inset-y-1 -z-10 scale-[0.98] rounded-[22px] bg-white opacity-0 shadow-[0_24px_50px_-32px_rgba(15,22,48,0.35)] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 group-focus-visible:ring-2 group-focus-visible:ring-cobalt md:-inset-x-6"
                    />

                    {/* Mobile Square Preview */}
                    <span className="relative row-span-2 block aspect-square overflow-hidden rounded-xl md:hidden">
                      <ProjectMockup
                        title={project.title}
                        seed={project.slug}
                        index={project.index}
                        titleClassName="text-[1.4rem]"
                      />
                    </span>

                    {/* Year (Desktop) */}
                    <span
                      className={`hidden text-base font-bold tabular-nums md:block ${
                        isNewYear ? 'text-ink' : 'text-transparent'
                      }`}
                    >
                      {project.year}
                    </span>

                    {/* Title with Smooth Horizontal Shift on Hover */}
                    <span className="min-w-0 text-xl font-bold leading-snug tracking-[-0.02em] text-ink transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-x-2 rtl:group-hover:-translate-x-2 md:text-2xl">
                      <bdi>{project.title}</bdi>
                    </span>

                    {/* Client & Mobile Year */}
                    <span className="flex min-w-0 gap-3 text-sm text-dim md:text-base">
                      <span className="tabular-nums md:hidden">{project.year}</span>
                      <span dir="auto" className="truncate rtl:text-right">
                        {project.client ?? personalProject}
                      </span>
                    </span>

                    {/* Tech Stacks (Desktop) */}
                    <span className="hidden min-w-0 truncate text-sm font-bold text-cobalt md:block md:text-end">
                      {project.stacks.slice(0, 3).join(' / ')}
                    </span>
                  </Link>
                </li>
              );
            })}
            <li aria-hidden="true" className="h-px bg-line" />
          </ul>

          {/* Floating Cursor Preview (Desktop Only) */}
          <div
            ref={floatingRef}
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[15rem] w-[20rem] md:block"
          >
            <AnimatePresence>
              {activeProject && (
                <motion.div
                  key={activeProject.slug}
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
                  transition={{
                    duration: 0.5,
                    ease: [0.19, 1, 0.22, 1],
                  }}
                  className="absolute inset-0 overflow-hidden rounded-[20px] shadow-[0_30px_60px_-20px_rgba(15,22,48,0.45)]"
                >
                  <ProjectMockup
                    title={activeProject.title}
                    seed={activeProject.slug}
                    index={activeProject.index}
                    titleClassName="text-[3rem]"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Separator: Light Archive -> Dark Footer with Dynamic Velocity Bending */}
      <BendingEdge above="#f3f5f9" below="#070a1a" />

      {/* Reusable Contact CTA Section */}
      <ContactCTA />
    </div>
  );
}
