'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { featuredProjects } from '@/lib/data';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '@/components/shared/magnetic-button';
import { useLocale } from '@/lib/locale-context';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const cardThemes = [
  { bg: '#2f45ff', a: '#ffffff', b: '#ffb21e', text: '#ffffff' },
  { bg: '#ffb21e', a: '#0f1630', b: '#2f45ff', text: '#0f1630' },
  { bg: '#0f1630', a: '#7483ff', b: '#ffb21e', text: '#ffffff' },
  { bg: '#7483ff', a: '#0f1630', b: '#ffffff', text: '#0f1630' },
  { bg: '#ffffff', a: '#2f45ff', b: '#0f1630', text: '#0f1630' },
  { bg: '#19c39c', a: '#0f1630', b: '#ffffff', text: '#0f1630' },
];

function getHash(str: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

const motionBase =
  'transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] [transform-box:fill-box] [transform-origin:center]';

function CardArtwork({
  seed,
  a,
  b,
}: {
  seed: number;
  a: string;
  b: string;
}) {
  let s = seed || 1;
  const rand = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    return (((s ^= s << 5) >>> 0) % 10000) / 10000;
  };
  const mode = seed % 4;

  if (mode === 0) {
    const cx = 260 + 80 * rand();
    const cy = 90 + 60 * rand();
    return (
      <g className={`${motionBase} group-hover:-translate-x-6 group-hover:rotate-12`}>
        {[150, 115, 80, 45].map((r, i) => (
          <circle
            key={r}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={i % 2 ? b : a}
            strokeWidth="14"
          />
        ))}
      </g>
    );
  }
  if (mode === 1) {
    const items = Array.from({ length: 8 }, (_, t) => ({
      x: (t % 4) * 80 + 80,
      y: 80 * Math.floor(t / 4),
      rot: 90 * Math.floor(4 * rand()),
      c: rand() > 0.5 ? a : b,
    }));
    return (
      <g>
        {items.map((item, idx) => (
          <path
            key={idx}
            d="M0 0 H80 A80 80 0 0 1 0 80 Z"
            fill={item.c}
            transform={`translate(${item.x + 40} ${item.y + 40}) rotate(${item.rot}) translate(-40 -40)`}
            className={`${motionBase} ${
              idx % 2 ? 'group-hover:rotate-90' : 'group-hover:-rotate-90'
            }`}
          />
        ))}
      </g>
    );
  }
  if (mode === 2) {
    return (
      <g>
        <g className={`${motionBase} group-hover:translate-x-8`}>
          {Array.from({ length: 9 }, (_, idx) => (
            <rect
              key={idx}
              x={46 * idx - 40}
              y={-40}
              width={18}
              height={360}
              fill={a}
              transform="rotate(28 200 150)"
            />
          ))}
        </g>
        <circle
          cx={300 + 40 * rand()}
          cy={80 + 40 * rand()}
          r={70}
          fill={b}
          className={`${motionBase} group-hover:scale-125`}
        />
      </g>
    );
  }
  // mode === 3
  return (
    <g>
      <g className={`${motionBase} group-hover:-translate-y-4`}>
        {Array.from({ length: 70 }, (_, idx) => (
          <circle
            key={idx}
            cx={(idx % 10) * 40 + 20}
            cy={40 * Math.floor(idx / 10) + 20}
            r={4 + 4 * rand()}
            fill={a}
            opacity={0.85}
          />
        ))}
      </g>
      <path
        d={`M${200 + 120 * rand()} 0 a110 110 0 0 1 0 220 Z`}
        fill={b}
        className={`${motionBase} group-hover:rotate-180`}
      />
    </g>
  );
}

export function SelectedWork() {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const mm = gsap.matchMedia();

      mm.add('(min-width: 768px)', () => {
        const totalScroll = track.scrollWidth - window.innerWidth;

        const scrollTween = gsap.to(track, {
          x: () => -Math.max(totalScroll, 0),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=2182',
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progressRef.current) {
                progressRef.current.style.transform = `scaleX(${self.progress})`;
              }

              // Dynamic ambient lighting matching the current card theme
              const count = featuredProjects.length;
              const activeIdx = Math.min(
                count - 1,
                Math.max(0, Math.floor(self.progress * (count + 0.6) - 0.3))
              );
              const theme = cardThemes[activeIdx % cardThemes.length];
              const amb1 = theme.bg === '#ffffff' ? '#7483ff' : theme.bg;
              const amb2 = theme.b === '#ffffff' ? '#7483ff' : theme.b;
              section.style.setProperty('--amb', amb1);
              section.style.setProperty('--amb2', amb2);
            },
          },
        });

        // 3D perspective card rotations tied to horizontal position
        const cards = gsap.utils.toArray<HTMLElement>('[data-work-card]');
        cards.forEach((card, idx) => {
          if (idx === 0) {
            gsap.set(card, { rotateY: 0, scale: 1, opacity: 1, transformPerspective: 1400 });
          } else {
            gsap.fromTo(
              card,
              { rotateY: -14, scale: 0.92, opacity: 0.5, transformPerspective: 1400 },
              {
                rotateY: 0,
                scale: 1,
                opacity: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: scrollTween,
                  start: 'left right',
                  end: 'center 60%',
                  scrub: true,
                },
              }
            );
          }
        });

        // Title reveal with split text
        gsap.from('[data-work-title] span span', {
          yPercent: 110,
          duration: 1.2,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            once: true,
          },
        });
      });

      mm.add('(max-width: 767px)', () => {
        const cards = gsap.utils.toArray<HTMLElement>('[data-work-card]');
        cards.forEach((card) => {
          gsap.from(card, {
            y: 80,
            opacity: 0,
            rotate: 3,
            duration: 1.1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              once: true,
            },
          });
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="work-title"
      className="work-ambient relative overflow-hidden bg-[#070a1a] text-white md:h-screen"
      style={{
        ['--amb' as any]: '#2f45ff',
        ['--amb2' as any]: '#7483ff',
      }}
    >
      {/* Background Ambience reacting dynamically to scroll */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-colors duration-700"
        style={{
          background:
            'radial-gradient(55% 60% at var(--amb-x, 58%) 52%, color-mix(in srgb, var(--amb, #2f45ff) 34%, transparent), transparent 72%), radial-gradient(35% 40% at var(--amb-x2, 85%) 95%, color-mix(in srgb, var(--amb2, #7483ff) 22%, transparent), transparent 70%)',
        }}
      />

      <div
        ref={trackRef}
        className="flex h-full flex-col gap-10 px-5 py-20 md:w-max md:flex-row md:items-center md:gap-8 md:px-[6vw] md:pb-6 md:pt-20"
      >
        {/* Header Column */}
        <div className="shrink-0 md:w-[26vw] lg:w-[22vw]">
          <h2
            id="work-title"
            data-work-title="true"
            className="text-6xl font-bold leading-[0.9] tracking-tighter md:text-[clamp(3.5rem,5vw,6rem)] text-white"
          >
            {(t('home', 'v2.workTitle') || 'Selected\nwork')
              .split('\n')
              .map((line, idx) => (
                <span key={idx} className="block overflow-hidden">
                  <span className="block">{line}</span>
                </span>
              ))}
          </h2>
          <p className="mt-6 hidden text-white/50 text-base md:block">
            {t('home', 'v2.workScroll') || 'Scroll to see more'}
          </p>
        </div>

        {/* 6 Project Cards (a#0 to a#5) */}
        {featuredProjects.map((project, idx) => {
          const seed = getHash(project.slug);
          const theme = cardThemes[idx % cardThemes.length];

          return (
            <div
              key={project.slug}
              data-work-card="true"
              className={`shrink-0 [perspective:1400px] md:w-[min(38vw,calc((100svh-20rem)*4/3))] lg:w-[min(30vw,calc((100svh-20rem)*4/3))] card-deck-${idx}`}
            >
              <Link
                href={`/portfolio/${project.slug}`}
                className="group block"
              >
                {/* Generative Visual Header */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] transition-[border-radius] duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:rounded-[44px]">
                  <div
                    className="relative h-full w-full overflow-hidden"
                    style={{ backgroundColor: theme.bg }}
                  >
                    <svg
                      viewBox="0 0 400 300"
                      preserveAspectRatio="xMidYMid slice"
                      className="absolute inset-x-0 top-0 h-[70%] w-full"
                      aria-hidden="true"
                    >
                      <CardArtwork seed={seed} a={theme.a} b={theme.b} />
                    </svg>
                    <span
                      aria-hidden="true"
                      dir="ltr"
                      className="absolute -bottom-[0.14em] left-4 whitespace-nowrap text-[clamp(2.5rem,4.6vw,4.75rem)] font-bold leading-none tracking-[-0.05em] transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-2 group-hover:translate-x-2"
                      style={{ color: theme.text }}
                    >
                      {project.slug}
                    </span>
                  </div>
                </div>

                {/* Metadata & Description */}
                <div className="mt-5 grid gap-1.5">
                  <h3 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                    <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 group-hover:bg-[length:100%_2px]">
                      {project.title}
                    </span>
                  </h3>
                  <p className="line-clamp-2 max-w-[48ch] text-sm leading-relaxed text-white/55">
                    {project.description}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#7483ff]">
                    <span>{project.stacks.join(' / ')}</span>
                  </p>
                </div>
              </Link>
            </div>
          );
        })}

        {/* View All Works Magnetic Circle Button */}
        <div className="flex shrink-0 items-center justify-center md:w-[22vw]">
          <MagneticButton strength={0.5}>
            <Link
              href="/portfolio"
              className="group relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full bg-[#2f45ff] text-center text-lg font-bold text-white md:h-56 md:w-56 md:text-xl"
            >
              <span className="absolute inset-0 scale-0 rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-100" />
              <span className="relative px-6 transition-colors duration-500 group-hover:text-[#070a1a]">
                All work
              </span>
            </Link>
          </MagneticButton>
        </div>
      </div>

      {/* Horizontal Progress Bar */}
      <div className="absolute inset-x-[6vw] bottom-10 hidden h-px bg-white/10 md:block">
        <span
          ref={progressRef}
          data-progress="true"
          className="absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-[#2f45ff] to-[#7483ff]"
        />
      </div>
    </section>
  );
}
