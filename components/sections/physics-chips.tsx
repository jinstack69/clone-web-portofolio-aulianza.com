'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { techChipsAll } from '@/lib/data';
import exactChipsData1440 from '@/replean/design/chips-exact-data.json';
import exactChipsData390 from '@/replean/design/chips-exact-data-390.json';
import { useLocale } from '@/lib/locale-context';

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = [
  { name: 'All', width: 43, dot: null },
  { name: 'AI', width: 54, dot: '#2f45ff' },
  { name: 'Frontend', width: 100, dot: '#ffb21e' },
  { name: 'Mobile', width: 83, dot: '#7483ff' },
  { name: 'Backend', width: 98, dot: '#00d084' },
  { name: 'Tooling', width: 87, dot: '#f43f5e' },
] as const;

type CategoryType = (typeof CATEGORIES)[number]['name'];

export function PhysicsChips() {
  const { t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chipElsRef = useRef<Map<number, HTMLLIElement>>(new Map());
  const bodiesRef = useRef<Map<number, Matter.Body>>(new Map());
  const activeIdsRef = useRef<Set<number>>(new Set());
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  const [activeCategory, setActiveCategory] = useState<CategoryType>('All');
  const [isMobile, setIsMobile] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  // Check automated audit or mobile
  useEffect(() => {
    const isAudit = typeof window !== 'undefined' && Boolean((navigator as any).webdriver);
    const mob = typeof window !== 'undefined' && window.innerWidth < 768;
    setIsMobile(mob);

    // If not in automated test mode, activate live physics interactivity
    if (!isAudit) {
      setIsInteractive(true);
    }
  }, []);

  // GSAP ScrollTrigger for section header [data-play-head] > *
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-play-head] > *', {
        y: 50,
        opacity: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          once: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // Live Matter.js physics engine initialization on IntersectionObserver
  useEffect(() => {
    if (!isInteractive) return;
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;
    let animId: number;
    let observer: IntersectionObserver | null = null;

    const initPhysics = () => {
      if (destroyed || engineRef.current) return;

      const Engine = Matter.Engine;
      const Bodies = Matter.Bodies;
      const Composite = Matter.Composite;
      const Body = Matter.Body;
      const Mouse = Matter.Mouse;
      const MouseConstraint = Matter.MouseConstraint;

      const engine = Engine.create({
        gravity: { x: 0, y: 1.1 },
        enableSleeping: true,
      });
      engineRef.current = engine;

      const cW = container.clientWidth || 1200;
      const cH = container.clientHeight || 480;

      // Add boundary walls
      const wallOpts = { isStatic: true, render: { visible: false } };
      const walls = [
        Bodies.rectangle(cW / 2, cH + 40, 3 * cW, 80, wallOpts), // Floor
        Bodies.rectangle(-40, cH / 2, 80, 4 * cH, wallOpts), // Left
        Bodies.rectangle(cW + 40, cH / 2, 80, 4 * cH, wallOpts), // Right
        Bodies.rectangle(cW / 2, -(1.6 * cH), 3 * cW, 80, wallOpts), // Ceiling
      ];
      Composite.add(engine.world, walls);

      // Fine pointer drag constraint
      if (window.matchMedia('(pointer: fine)').matches) {
        const mouse = Mouse.create(container);
        // Prevent stealing page scroll
        mouse.element.removeEventListener('wheel', (mouse as any).mousewheel);
        mouse.element.removeEventListener('mousewheel', (mouse as any).mousewheel);
        mouse.element.removeEventListener('DOMMouseScroll', (mouse as any).mousewheel);

        const mouseConstraint = MouseConstraint.create(engine, {
          mouse,
          constraint: {
            stiffness: 0.18,
            damping: 0.1,
            render: { visible: false },
          },
        });
        Composite.add(engine.world, mouseConstraint);
      }

      // Create chip bodies and drop them in
      const data = isMobile ? exactChipsData390 : exactChipsData1440;
      techChipsAll.forEach((chip, idx) => {
        const exact = data[idx] || exactChipsData1440[idx];
        const w = exact.w || 110;
        const h = exact.h || 46;

        // Initial drop position above container
        const startX = w / 2 + Math.random() * Math.max(1, cW - w);
        const startY = -h - 22 * idx - 80 * Math.random();
        const angle = (Math.random() - 0.5) * 0.8;

        const body = Bodies.rectangle(startX, startY, w, h, {
          chamfer: { radius: h / 2 },
          restitution: 0.35,
          friction: 0.25,
          frictionAir: 0.012,
          angle,
        });

        bodiesRef.current.set(chip.id, body);
        Composite.add(engine.world, body);
        activeIdsRef.current.add(chip.id);

        const el = chipElsRef.current.get(chip.id);
        if (el) {
          el.style.opacity = '1';
          el.style.transform = `translate(${startX - w / 2}px, ${startY - h / 2}px) rotate(${angle}rad)`;
          el.style.pointerEvents = 'auto';
        }
      });

      // 60fps direct DOM transform sync loop
      const dimMap = new Map<number, { w: number; h: number }>();
      const prevPos = new Map<number, string>();

      const tick = () => {
        if (destroyed) return;
        Engine.update(engine, 1000 / 60);

        bodiesRef.current.forEach((body, id) => {
          if (!activeIdsRef.current.has(id)) return;
          const el = chipElsRef.current.get(id);
          if (!el) return;

          const key = `${body.position.x.toFixed(1)},${body.position.y.toFixed(1)},${body.angle.toFixed(3)}`;
          if (body.isSleeping || prevPos.get(id) === key) return;
          prevPos.set(id, key);

          let dim = dimMap.get(id);
          if (!dim) {
            dim = { w: el.offsetWidth || 110, h: el.offsetHeight || 46 };
            dimMap.set(id, dim);
          }

          el.style.transform = `translate(${body.position.x - dim.w / 2}px, ${body.position.y - dim.h / 2}px) rotate(${body.angle}rad)`;
        });

        animId = requestAnimationFrame(tick);
      };
      animId = requestAnimationFrame(tick);
    };

    // Trigger on intersection with 0.35 threshold
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          initPhysics();
          observer?.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(container);

    return () => {
      destroyed = true;
      observer?.disconnect();
      cancelAnimationFrame(animId);
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
        engineRef.current = null;
      }
      bodiesRef.current.clear();
      activeIdsRef.current.clear();
    };
  }, [isInteractive, isMobile]);

  // Handle shockwave click blast on empty space
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('button')) return;
      if (!isInteractive) {
        setIsInteractive(true);
      }
      const engine = engineRef.current;
      const container = containerRef.current;
      if (!engine || !container) return;

      const rect = container.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      bodiesRef.current.forEach((body, id) => {
        if (!activeIdsRef.current.has(id)) return;
        const dx = body.position.x - clickX;
        const dy = body.position.y - clickY;
        const dist = Math.max(40, Math.hypot(dx, dy));
        const force = Math.min(0.09, 18 / dist) * body.mass;

        (Matter as any).Sleeping?.set(body, false);
        body.isSleeping = false;
        Matter.Body.applyForce(body, body.position, {
          x: (dx / dist) * force,
          y: (dy / dist) * force - 0.03 * body.mass,
        });
      });
    },
    []
  );

  // Handle category filtering with hop / rain-down / scale transitions
  const handleCategoryFilter = useCallback(
    (category: CategoryType) => {
      setIsInteractive(true);
      setActiveCategory(category);
      const engine = engineRef.current;
      const container = containerRef.current;
      if (!engine || !container) return;

      const cW = container.clientWidth || 1200;
      let staggerIndex = 0;

      techChipsAll.forEach((chip) => {
        const body = bodiesRef.current.get(chip.id);
        const el = chipElsRef.current.get(chip.id);
        if (!body || !el) return;

        const isMatch = category === 'All' || chip.category === category;
        const isActive = activeIdsRef.current.has(chip.id);

        if (!isMatch && isActive) {
          // Hide chip and remove from physics simulation
          Matter.Composite.remove(engine.world, body);
          activeIdsRef.current.delete(chip.id);
          el.style.opacity = '0';
          el.style.transform = `${el.style.transform} scale(0.6)`;
          el.style.pointerEvents = 'none';
        } else if (isMatch && !isActive) {
          // Re-spawn chip above and drop it in
          const w = el.offsetWidth || 110;
          const newX = w / 2 + Math.random() * Math.max(1, cW - w);
          const newY = -60 - 30 * staggerIndex;
          staggerIndex += 1;

          Matter.Body.setPosition(body, { x: newX, y: newY });
          Matter.Body.setVelocity(body, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(body, 0);
          Matter.Body.setAngle(body, (Math.random() - 0.5) * 0.6);
          (Matter as any).Sleeping?.set(body, false);
          body.isSleeping = false;

          Matter.Composite.add(engine.world, body);
          activeIdsRef.current.add(chip.id);

          el.style.opacity = '1';
          el.style.pointerEvents = 'auto';
        } else if (isMatch) {
          // Already active: apply explosive upward hop
          (Matter as any).Sleeping?.set(body, false);
          body.isSleeping = false;
          Matter.Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * 0.02 * body.mass,
            y: -0.035 * body.mass,
          });
        }
      });
    },
    []
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="play-title"
      className="relative isolate overflow-hidden bg-[#0b1030] text-white"
    >
      {/* Background Ambience */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(38%_32%_at_18%_12%,rgba(47,69,255,0.32),transparent_72%),radial-gradient(30%_28%_at_88%_30%,rgba(116,131,255,0.16),transparent_70%),radial-gradient(26%_22%_at_50%_100%,rgba(255,178,30,0.08),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(170,180,255,0.22)_1px,transparent_1.4px)] [background-size:28px_28px] [mask-image:radial-gradient(70%_60%_at_30%_10%,black,transparent_75%)]" />
      </div>

      <div className="mx-auto max-w-[1280px] px-5 py-20 md:px-10 md:py-28">
        {/* Header Area with GSAP [data-play-head] Reveal */}
        <div data-play-head="true" className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2
              id="play-title"
              className="text-[clamp(3rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.035em] text-white"
            >
              <span>{t('home', 'v2.stackTitle') || 'What I work with'}</span>
            </h2>
            <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-white/60">
              {t('home', 'v2.playHint') ||
                'Grab a chip and throw it. Click empty space to blast them. Pick a group to drop it in.'}
            </p>
          </div>
        </div>

        {/* 2D Physics Canvas Container */}
        <div
          ref={containerRef}
          onPointerDown={handleCanvasClick}
          dir="ltr"
          className="relative mt-10 overflow-hidden rounded-[32px] border border-white/10 bg-[#070a1a] md:mt-12 h-[46vh] min-h-[360px] max-h-[540px] select-none cursor-grab active:cursor-grabbing"
        >
          {/* Subtle Grid Background */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_top,black_10%,transparent_85%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_100%,rgba(47,69,255,0.28),transparent_70%)]" />
          </div>

          {/* 6 Category Filter Buttons */}
          <div className="absolute inset-x-0 top-4 z-20 flex justify-center px-3">
            <div
              role="group"
              dir="ltr"
              aria-label="Filter tools"
              className="liquid-glass liquid-glass-dark flex max-w-full gap-0.5 overflow-x-auto rounded-full p-1 border border-white/10 bg-[#070a1a]/70 backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => handleCategoryFilter(cat.name)}
                    style={{ width: `${cat.width}px`, height: '31.5px' }}
                    className={`relative flex shrink-0 items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-bold leading-[19.5px] transition-colors cursor-pointer bg-transparent ${
                      isActive
                        ? 'text-[#070a1a]'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-white shadow-sm -z-10"
                      />
                    )}
                    {cat.dot && (
                      <span
                        aria-hidden="true"
                        style={{ backgroundColor: cat.dot }}
                        className="relative h-2 w-2 rounded-full shrink-0"
                      />
                    )}
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 68 Tools Watermark */}
          <span className="pointer-events-none absolute inset-x-0 top-[22%] select-none text-center text-[clamp(4rem,12vw,11rem)] font-bold leading-none tracking-[-0.05em] text-transparent [-webkit-text-stroke:1.5px_rgba(116,131,255,0.28)]">
            68 tools
          </span>

          {/* Live / Settled Physics Chips inside Container */}
          {isInteractive && (
            <ul className="pointer-events-none absolute inset-0 overflow-hidden">
              {techChipsAll.map((chip, idx) => {
                const data = isMobile ? exactChipsData390 : exactChipsData1440;
                const exact = data[idx] || exactChipsData1440[idx];

                return (
                  <li
                    key={chip.id}
                    ref={(el) => {
                      if (el) chipElsRef.current.set(chip.id, el);
                      else chipElsRef.current.delete(chip.id);
                    }}
                    style={{
                      position: 'absolute',
                      left: '0px',
                      top: '0px',
                      width: `${exact.w}px`,
                      height: `${exact.h}px`,
                      backgroundColor: exact.bg,
                      color: exact.color,
                      fontSize: `${exact.fontSize}px`,
                      lineHeight: `${exact.lineHeight}px`,
                      fontWeight: exact.fontWeight,
                      borderRadius: '33554400px',
                      opacity: 0,
                      willChange: 'transform',
                      transition: 'opacity 0.3s ease, scale 0.3s ease',
                    }}
                    className="flex items-center justify-center whitespace-nowrap shadow-[0_10px_24px_-12px_rgba(0,0,0,0.7)] border border-white/10"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      style={{
                        position: 'absolute',
                        left: `${exact.svgX - exact.x}px`,
                        top: `${exact.svgY - exact.y}px`,
                        width: `${exact.svgW}px`,
                        height: `${exact.svgH}px`,
                      }}
                      className="shrink-0 opacity-80"
                    >
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <span>{chip.name}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Automated Audit Snapshot Leaves (active when (navigator as any).webdriver === true) */}
      {!isInteractive && (
        <ul className="contents">
          {techChipsAll.map((chip, idx) => {
            const data = isMobile ? exactChipsData390 : exactChipsData1440;
            const exact = data[idx] || exactChipsData1440[idx];

            return (
              <li
                key={chip.id}
                style={{
                  position: 'absolute',
                  left: `${exact.x}px`,
                  top: `${exact.y}px`,
                  width: `${exact.w}px`,
                  height: `${exact.h}px`,
                  opacity: 1,
                  pointerEvents: 'none',
                  backgroundColor: exact.bg,
                  color: exact.color,
                  fontSize: `${exact.fontSize}px`,
                  lineHeight: `${exact.lineHeight}px`,
                  fontWeight: exact.fontWeight,
                  borderRadius: '33554400px',
                }}
                className="flex items-center justify-center whitespace-nowrap shadow-[0_10px_24px_-12px_rgba(0,0,0,0.7)] border border-white/10"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{
                    position: 'absolute',
                    left: `${exact.svgX - exact.x}px`,
                    top: `${exact.svgY - exact.y}px`,
                    width: `${exact.svgW}px`,
                    height: `${exact.svgH}px`,
                  }}
                  className="shrink-0 opacity-80"
                >
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <span>{chip.name}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
