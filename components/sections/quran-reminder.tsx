'use client';

import React, { useState, useEffect, useRef } from 'react';
import { quranReminders } from '@/lib/data';
import { MagneticButton } from '@/components/shared/magnetic-button';
import { motion, AnimatePresence } from 'framer-motion';

const EASE_EXPO = [0.19, 1, 0.22, 1] as const;

export function QuranReminder() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? quranReminders.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === quranReminders.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const current = quranReminders[currentIndex];
  const words = current.arabicText.split(/\s+/).filter(Boolean);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="reminders-title"
      aria-roledescription="carousel"
      className="relative isolate overflow-hidden bg-[#f3f5f9] py-24 text-[#0f1630] md:py-32"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsHovered(true)}
      onBlurCapture={() => setIsHovered(false)}
    >
      <h2 id="reminders-title" className="sr-only">
        A reminder
      </h2>

      {/* Khatam Geometric Pattern SVG */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute start-0 top-0 -z-10 h-full w-full text-[#2f45ff]/20 [contain:strict] [transform:translateZ(0)] [mask-image:radial-gradient(75%_85%_at_0%_0%,black_0%,rgba(0,0,0,0.45)_40%,transparent_72%)]"
      >
        <defs>
          <pattern id="khatam" width="80" height="80" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M40 12 L48 32 L68 40 L48 48 L40 68 L32 48 L12 40 L32 32 Z" />
              <rect x="24" y="24" width="32" height="32" transform="rotate(45 40 40)" />
              <rect x="26" y="26" width="28" height="28" />
              <path d="M0 0 L12 12 M80 0 L68 12 M0 80 L12 68 M80 80 L68 68" />
              <path d="M40 0 V12 M40 68 V80 M0 40 H12 M68 40 H80" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#khatam)" />
      </svg>

      {/* Subtle Background Radial Gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(35%_50%_at_85%_35%,rgba(47,69,255,0.09),transparent_70%),radial-gradient(25%_35%_at_10%_85%,rgba(255,178,30,0.08),transparent_70%)]"
      />

      <div className="mx-auto max-w-[1280px] px-5 md:px-10">
        {/* Arabic Calligraphy Block with Word-by-Word Reveal */}
        <div className="flex min-h-[9rem] items-center justify-end md:min-h-[16rem]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.blockquote
              key={currentIndex}
              lang="ar"
              dir="rtl"
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.3, ease: EASE_EXPO }}
              className="max-w-[60rem] text-right text-[clamp(2.1rem,5vw,4.5rem)] font-semibold leading-[1.6] text-[#0f1630] font-arabic"
            >
              <motion.span
                aria-hidden="true"
                className="me-3 inline-block text-[#2f45ff]/60"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: EASE_EXPO }}
              >
                ﴿
              </motion.span>
              {words.map((word, i) => (
                <motion.span
                  key={`${currentIndex}-${i}`}
                  className="inline-block"
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.07 * i, ease: EASE_EXPO }}
                >
                  {word}
                  {i < words.length - 1 ? '\u00A0' : ''}
                </motion.span>
              ))}
              <motion.span
                aria-hidden="true"
                className="ms-3 inline-block text-[#2f45ff]/60"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.07 * words.length,
                  ease: EASE_EXPO,
                }}
              >
                ﴾
              </motion.span>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        {/* Translation & Controls Grid */}
        <div className="mt-10 grid gap-10 border-t border-[#dce1ec] pt-8 md:mt-14 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-16">
          {/* Translation & Source */}
          <div className="min-h-[6.5rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, delay: 0.15, ease: EASE_EXPO }}
              >
                <p className="max-w-[46ch] text-xl font-medium leading-relaxed text-[#0f1630]/80 md:text-2xl">
                  {current.translation}
                </p>
                <p className="mt-3 text-[15px] font-bold text-[#2f45ff]">
                  {current.reference}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls & Index */}
          <div className="flex w-full flex-col gap-4 md:w-[17rem]">
            <div className="flex items-end justify-between gap-6">
              <p className="tabular-nums leading-none" dir="ltr">
                <span className="text-5xl font-bold tracking-[-0.04em] text-[#0f1630]">
                  {current.index.split('/')[0].trim()}
                </span>
                <span className="ms-1 text-lg font-bold text-[#5b6482]">
                  / 10
                </span>
              </p>

              <div className="flex gap-2">
                <MagneticButton strength={0.35}>
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous reminder"
                    className="grid size-12 place-items-center rounded-full bg-white text-[#0f1630] ring-1 ring-[#dce1ec] transition-[background-color,color,transform] duration-300 hover:-translate-x-0.5 hover:bg-[#0f1630] hover:text-white cursor-pointer"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M15 6C15 6 9 10.4189 9 12C9 13.5812 15 18 15 18" stroke="currentColor" />
                    </svg>
                  </button>
                </MagneticButton>

                <MagneticButton strength={0.35}>
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next reminder"
                    className="grid size-12 place-items-center rounded-full bg-[#0f1630] text-white transition-[background-color,transform] duration-300 hover:translate-x-0.5 hover:bg-[#2f45ff] cursor-pointer"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M9 6C9 6 15 10.4189 15 12C15 13.5812 9 18 9 18" stroke="currentColor" />
                    </svg>
                  </button>
                </MagneticButton>
              </div>
            </div>

            {/* Linear Fill Animated Progress Bar */}
            <span aria-hidden="true" className="relative block h-[3px] overflow-hidden rounded-full bg-[#dce1ec]">
              <span
                key={currentIndex}
                className="absolute inset-0 origin-left scale-x-0 rounded-full bg-[#2f45ff] will-change-transform"
                style={{
                  animation: 'reminder-fill 9000ms linear both',
                  animationPlayState: !isIntersecting || isHovered ? 'paused' : 'running',
                }}
                onAnimationEnd={nextSlide}
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
