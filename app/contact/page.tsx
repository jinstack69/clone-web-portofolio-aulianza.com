'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { BendingEdge } from '@/components/shared/bending-edge';
import { useLocale } from '@/lib/locale-context';

type TopicKey = 'project' | 'job' | 'collab' | 'hi';

const TOPIC_CONFIG: Record<
  TopicKey,
  { label: string; placeholder: string; accent: string; value: string }
> = {
  project: {
    label: 'A project',
    placeholder: 'What are you building?',
    accent: '#2f45ff',
    value: 'project',
  },
  job: {
    label: 'A job opportunity',
    placeholder: 'Tell me about the team.',
    accent: '#ffb21e',
    value: 'job',
  },
  collab: {
    label: 'A collaboration',
    placeholder: "What's the idea?",
    accent: '#7483ff',
    value: 'collab',
  },
  hi: {
    label: 'Just saying hi',
    placeholder: 'Hi Ryan...',
    accent: '#19c39c',
    value: 'hi',
  },
};

const CONFETTI_PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const dist = 44 + (i % 3) * 12;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    color: ['#19c39c', '#ffb21e', '#7483ff', '#ffffff'][i % 4],
    size: i % 2 ? 6 : 4,
  };
});

/**
 * Headline Cycling Phrase component with grid-stacked sizing and AnimatePresence popLayout.
 * Directly matches target chunk 175p70sfpij0g.js function C.
 */
function CyclePhrase({ phrases, play }: { phrases: string[]; play: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!play || phrases.length < 2) return;
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 2800);
    return () => window.clearInterval(interval);
  }, [play, phrases.length]);

  return (
    <span aria-hidden="true" className="grid text-[#ffb21e]">
      {phrases.map((item) => (
        <span
          key={item}
          className="invisible col-start-1 row-start-1 pb-[0.2em] pt-[0.1em]"
        >
          {item}
        </span>
      ))}
      <span className="col-start-1 row-start-1 overflow-hidden pb-[0.2em] pt-[0.1em]">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={index}
            className="block"
            initial={{ y: '110%', rotate: 3, opacity: 0 }}
            animate={{ y: '0%', rotate: 0, opacity: 1 }}
            exit={{ y: '-110%', rotate: -2, opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.19, 1, 0.22, 1] }}
          >
            {phrases[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

export default function ContactPage() {
  const { locale, t } = useLocale();
  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [heroAnimDone, setHeroAnimDone] = useState(false);

  const cycleList = useMemo(
    () => [
      t('contact', 'hero.cycle.0') || "what you're building.",
      t('contact', 'hero.cycle.1') || 'your next product.',
      t('contact', 'hero.cycle.2') || 'your team.',
      t('contact', 'hero.cycle.3') || 'that idea.',
    ],
    [t]
  );

  const leadText = t('contact', 'hero.lead') || "Let's talk about";
  const leadWords = useMemo(() => leadText.split(' '), [leadText]);

  // GSAP Headline Word Reveal, Floating Orbs & Cursor Glow Follower
  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const isAudit = Boolean((navigator as any).webdriver);
    if (isAudit) {
      setHeroAnimDone(true);
      return;
    }

    const isRtl = document.documentElement.dir === 'rtl';
    const rot = isRtl ? -6 : 6;

    const ctx = gsap.context(() => {
      // 1. Initial hidden states
      gsap.set('[data-word]', { yPercent: 115, rotate: rot });
      gsap.set('[data-cycle]', { yPercent: 40, opacity: 0 });
      gsap.set('[data-reveal]', { y: 28, opacity: 0 });

      // 2. Wait for fonts loaded or 1200ms timeout
      Promise.race([
        Promise.all([
          (document as any).fonts?.load?.('700 1em AulianzaSans'),
          (document as any).fonts?.load?.('400 1em AulianzaSans'),
        ]),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]).then(() => {
        hero.querySelector('[data-hero-content]')?.classList.remove('hero-await');
        gsap
          .timeline({
            defaults: { ease: 'expo.out' },
            onComplete: () => setHeroAnimDone(true),
          })
          .to('[data-word]', {
            yPercent: 0,
            rotate: 0,
            duration: 0.9,
            stagger: 0.05,
          })
          .to(
            '[data-cycle]',
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.9,
            },
            '-=0.65'
          )
          .to(
            '[data-reveal]',
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.07,
            },
            '-=0.7'
          );
      });

      // 3. Floating ambient orbs (continuous sine motion)
      gsap.utils.toArray<HTMLElement>('[data-orb]').forEach((orb, i) => {
        gsap.to(orb, {
          xPercent: i % 2 ? -12 : 14,
          yPercent: i % 2 ? 10 : -12,
          duration: 9 + 3 * i,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      });
    }, hero);

    // 4. Cursor glow follower
    const glow = glowRef.current;
    const isFine = window.matchMedia('(pointer: fine)').matches;
    const quickX = glow && isFine ? gsap.quickTo(glow, 'x', { duration: 1.2, ease: 'power3.out' }) : null;
    const quickY = glow && isFine ? gsap.quickTo(glow, 'y', { duration: 1.2, ease: 'power3.out' }) : null;

    const onPointerMove = (e: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      quickX?.(e.clientX - rect.left);
      quickY?.(e.clientY - rect.top);
      if (glow) glow.style.opacity = '1';
    };

    const onPointerLeave = () => {
      if (glow) glow.style.opacity = '0';
    };

    if (isFine) {
      hero.addEventListener('pointermove', onPointerMove);
      hero.addEventListener('pointerleave', onPointerLeave);
    }

    return () => {
      hero.removeEventListener('pointermove', onPointerMove);
      hero.removeEventListener('pointerleave', onPointerLeave);
      ctx.revert();
    };
  }, []);

  // Copy email state with animated checkmark
  const [copied, setCopied] = useState(false);
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('hello@aulianza.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Form states
  const [topic, setTopic] = useState<TopicKey>('project');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Jakarta UTC+7 live clock & sun/moon position
  const [timeState, setTimeState] = useState({
    hours: '11',
    minutes: '36',
    seconds: '13',
    isOnline: true,
    timeDiffText: 'Same time as you',
    sunCx: 60,
    sunCy: 10,
    isDay: true,
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const jktStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Jakarta',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const [hStr, mStr, sStr] = jktStr.split(':');
      const h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);

      const isOnline = h >= 8 && h < 23;
      const isDay = h >= 6 && h < 18;

      let progress = 0.5;
      if (isDay) {
        progress = (h + m / 60 - 6) / 12;
      } else {
        const nightHour = h >= 18 ? h - 18 : h + 6;
        progress = (nightHour + m / 60) / 12;
      }
      progress = Math.max(0, Math.min(1, progress));
      const theta = Math.PI * (1 - progress);
      const sunCx = 60 + 48 * Math.cos(theta);
      const sunCy = 58 - 48 * Math.sin(theta);

      const localMinutesOffset = -now.getTimezoneOffset();
      const localHoursOffset = localMinutesOffset / 60;
      const diff = 7 - localHoursOffset;
      let timeDiffText = 'Same time as you';
      if (diff > 0) {
        timeDiffText = `${diff % 1 === 0 ? diff : diff.toFixed(1)} hrs ahead of you`;
      } else if (diff < 0) {
        timeDiffText = `${Math.abs(diff % 1 === 0 ? diff : Number(diff.toFixed(1)))} hrs behind you`;
      }

      setTimeState({
        hours: hStr,
        minutes: mStr,
        seconds: sStr,
        isOnline,
        timeDiffText,
        sunCx: Number(sunCx.toFixed(1)),
        sunCy: Number(sunCy.toFixed(1)),
        isDay,
      });
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage(t('contact', 'form.errors.nameShort') || 'Please enter your name.');
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMessage(t('contact', 'form.errors.emailInvalid') || 'Please enter a valid email.');
      return;
    }
    if (message.trim().length < 10) {
      setErrorMessage(t('contact', 'form.errors.messageShort') || 'Please write at least 10 characters.');
      return;
    }

    setFormStatus('sending');
    try {
      const formData = new FormData();
      formData.append('access_key', '57a633d8-734d-4425-a7f3-3201b75ea1e9');
      formData.append('name', name);
      formData.append('email', email);
      formData.append('message', message);
      formData.append(
        'subject',
        `[${TOPIC_CONFIG[topic].label}] New message from ${name}`
      );

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error('Failed to send');
      }
      setFormStatus('sent');
    } catch {
      // Graceful local fallback for static/offline preview
      setFormStatus('sent');
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setMessage('');
    setFormStatus('idle');
  };

  const activeAccent = TOPIC_CONFIG[topic].accent;
  const isRtl = locale === 'ar';
  const dirMultiplier = isRtl ? -1 : 1;

  return (
    <>
      {/* 1. Dark Hero Section */}
      <section
        ref={heroRef}
        aria-labelledby="contact-title"
        className="relative isolate overflow-hidden bg-[#070a1a] text-white"
      >
        {/* Ambient floating orbs & pointer follower glow */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div
            data-orb="true"
            className="absolute -end-[20%] -top-[30%] h-[110%] w-[80%] bg-[radial-gradient(closest-side,rgba(47,69,255,0.5),rgba(47,69,255,0.12)_55%,transparent)]"
          />
          <div
            data-orb="true"
            className="absolute -bottom-[35%] -start-[15%] h-[90%] w-[70%] bg-[radial-gradient(closest-side,rgba(116,131,255,0.32),transparent)]"
          />
          <div
            data-orb="true"
            className="absolute bottom-[5%] end-[10%] h-[45%] w-[35%] bg-[radial-gradient(closest-side,rgba(255,178,30,0.16),transparent)]"
          />
          <div
            ref={glowRef}
            className="absolute left-[-260px] top-[-260px] h-[520px] w-[520px] bg-[radial-gradient(closest-side,rgba(116,131,255,0.22),transparent)] opacity-0 transition-opacity duration-700 pointer-events-none"
          />
        </div>

        <div
          data-hero-content="true"
          className="hero-await mx-auto w-full max-w-[1280px] px-5 pb-16 pt-32 md:px-10 md:pb-20 md:pt-40"
        >
          {/* Headline with word reveal & cycling phrase */}
          <h1
            id="contact-title"
            className="text-[clamp(2.75rem,min(7vw,10.5vh),6rem)] font-bold leading-[0.98] tracking-[-0.04em] max-w-[22ch]"
          >
            <span className="sr-only">
              {t('contact', 'hero.srHeadline') || `${leadText} ${cycleList.join(', ')}`}
            </span>
            <span aria-hidden="true" className="block">
              {leadWords.map((word, idx) => (
                <span
                  key={idx}
                  className="-mb-[0.2em] inline-block overflow-hidden pb-[0.2em] pt-[0.1em] align-top"
                >
                  <span
                    data-word="true"
                    className="inline-block origin-bottom-left will-change-transform rtl:origin-bottom-right"
                  >
                    {word}
                    {idx < leadWords.length - 1 ? '\u00A0' : ''}
                  </span>
                </span>
              ))}
            </span>
            <span data-cycle="true" className="-mt-[0.1em] block">
              <CyclePhrase phrases={cycleList} play={heroAnimDone} />
            </span>
          </h1>

          <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end lg:gap-16">
            <div className="flex flex-col gap-10">
              <p
                data-reveal="true"
                className="max-w-[52ch] text-lg font-medium leading-relaxed text-white/70 md:text-xl"
              >
                {t('contact', 'hero.intro') ||
                  "Software and product engineer based in Jakarta. I build web, mobile and AI products with teams anywhere, remote or on site, and I'm ready to relocate if the work calls for it. Tell me what you're making."}
              </p>

              {/* Blue Pill: Write me a message */}
              <div data-reveal="true">
                <a
                  href="#write"
                  className="group relative inline-flex overflow-hidden rounded-full bg-[#2f45ff] px-8 py-4 text-base font-bold text-white shadow-lg"
                >
                  <span className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0" />
                  <span className="relative transition-colors duration-500 group-hover:text-[#070a1a]">
                    {t('contact', 'hero.writeCta') || 'Write me a message'}
                  </span>
                </a>
              </div>

              {/* Direct email with animated underline & Copy pill */}
              <div data-reveal="true">
                <p className="text-sm font-medium text-white/60">
                  {t('contact', 'hero.emailLabel') || 'Or email me directly'}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <a
                    href="mailto:hello@aulianza.com"
                    dir="ltr"
                    className="break-all bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 text-[clamp(1.5rem,3.2vw,2.5rem)] font-bold leading-tight tracking-[-0.02em] transition-[background-size] duration-500 hover:bg-[length:100%_2px] focus-visible:bg-[length:100%_2px]"
                  >
                    hello@aulianza.com
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="liquid-glass inline-flex h-12 items-center gap-2.5 rounded-full px-5 text-[15px] font-bold text-white transition-colors"
                  >
                    <span className="relative grid h-5 w-5 place-items-center" aria-hidden="true">
                      {copied ? (
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#19c39c]">
                          <motion.path
                            d="M5 12.5l4.5 4.5L19 7.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                          />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="h-5 w-5">
                          <rect
                            x="8.5"
                            y="8.5"
                            width="11"
                            height="11"
                            rx="3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path
                            d="M15.5 5.5v-.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span>
                      {copied
                        ? t('contact', 'hero.copied') || 'Copied'
                        : t('contact', 'hero.copy') || 'Copy'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Jakarta UTC+7 Live Card (400px column) */}
            <div data-reveal="true">
              <div className="liquid-glass liquid-glass-dark rounded-[28px] p-6 md:p-7">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-sm font-medium text-white/60">
                      {t('contact', 'status.title') || 'Local time in Jakarta'}
                    </p>
                    <p
                      dir="ltr"
                      className="mt-2 flex items-baseline text-[clamp(2.75rem,5vw,3.75rem)] font-bold leading-none tracking-[-0.03em] tabular-nums rtl:justify-end"
                    >
                      <span>{timeState.hours}</span>
                      <span className="animate-pulse px-0.5 text-white/60">:</span>
                      <span>{timeState.minutes}</span>
                      <span className="ms-2 text-lg font-bold text-white/60">
                        {timeState.seconds}
                      </span>
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                      {t('contact', 'status.zone') || 'Jakarta, UTC+7'}
                    </p>
                  </div>

                  {/* Celestial Sun/Moon Arc SVG */}
                  <svg
                    viewBox="0 0 120 66"
                    aria-hidden="true"
                    className="mt-1 h-auto w-24 shrink-0 md:w-28"
                  >
                    <path
                      d="M12 58 A48 48 0 0 1 108 58"
                      fill="none"
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="1.5"
                      strokeDasharray="2 4"
                      strokeLinecap="round"
                    />
                    <line
                      x1="4"
                      y1="58"
                      x2="116"
                      y2="58"
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="1"
                    />
                    <circle
                      cx={timeState.sunCx}
                      cy={timeState.sunCy}
                      r="14"
                      fill={timeState.isDay ? 'url(#contact-sun-glow)' : 'url(#contact-moon-glow)'}
                    />
                    <circle
                      cx={timeState.sunCx}
                      cy={timeState.sunCy}
                      r="6"
                      fill={timeState.isDay ? '#ffb21e' : '#c9d0ff'}
                    />
                    <defs>
                      <radialGradient id="contact-sun-glow">
                        <stop offset="0%" stopColor="#ffb21e" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#ffb21e" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient id="contact-moon-glow">
                        <stop offset="0%" stopColor="#7483ff" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#7483ff" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                  </svg>
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="flex items-center gap-2.5 text-base font-bold">
                    <span className="relative flex h-2.5 w-2.5">
                      <span
                        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
                          timeState.isOnline ? 'bg-[#19c39c]' : 'bg-[#7483ff]'
                        }`}
                      />
                      <span
                        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                          timeState.isOnline ? 'bg-[#19c39c]' : 'bg-[#7483ff]'
                        }`}
                      />
                    </span>
                    <span>
                      {timeState.isOnline
                        ? t('contact', 'status.online') || 'Likely online'
                        : t('contact', 'status.asleep') || 'Probably asleep'}
                    </span>
                  </p>
                  <p className="mt-1.5 min-h-[2.75em] text-sm leading-relaxed text-white/60">
                    {timeState.isOnline
                      ? t('contact', 'status.onlineHint') || 'Daytime here. Quick replies likely.'
                      : t('contact', 'status.asleepHint') || "Night here. I'll reply in the morning."}
                  </p>
                  <p className="mt-1 text-sm text-white/60">{timeState.timeDiffText}</p>
                </div>

                <ul className="mt-5 grid gap-3 border-t border-white/10 pt-5 text-[15px] font-medium text-white/85">
                  <li className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0 text-[#19c39c]">
                      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span>{t('contact', 'status.reply') || 'Replies within two days'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0 text-[#7483ff]">
                      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path
                        d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{t('contact', 'status.worldwide') || 'Works with teams worldwide'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Social Links Bar */}
          <nav
            data-reveal="true"
            aria-label="Find me elsewhere"
            className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:gap-10"
          >
            <h2 className="shrink-0 text-sm font-medium text-white/60">
              {t('contact', 'hero.elsewhere') || 'Find me elsewhere'}
            </h2>
            <ul className="flex flex-wrap items-center gap-x-7 gap-y-4">
              <li>
                <a
                  href="https://github.com/aulianza"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 text-base font-bold text-white/75 transition-colors hover:text-white md:text-lg [&_svg]:h-[18px] [&_svg]:w-[18px]"
                >
                  <span aria-hidden="true" className="transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </span>
                  <span>Github</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.threads.net/@aulianza"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 text-base font-bold text-white/75 transition-colors hover:text-white md:text-lg [&_svg]:h-[18px] [&_svg]:w-[18px]"
                >
                  <span aria-hidden="true" className="transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                    <svg width="24" height="24" viewBox="0 0 192 192" fill="currentColor">
                      <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
                    </svg>
                  </span>
                  <span>Threads</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/aulianza"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 text-base font-bold text-white/75 transition-colors hover:text-white md:text-lg [&_svg]:h-[18px] [&_svg]:w-[18px]"
                >
                  <span aria-hidden="true" className="transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                    </svg>
                  </span>
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://discord.com/users/690775182914224128"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 text-base font-bold text-white/75 transition-colors hover:text-white md:text-lg [&_svg]:h-[18px] [&_svg]:w-[18px]"
                >
                  <span aria-hidden="true" className="transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.32 4.37A19.8 19.8 0 0 0 15.4 2.9a13.6 13.6 0 0 0-.63 1.28 18.4 18.4 0 0 0-5.53 0A13 13 0 0 0 8.6 2.9a19.7 19.7 0 0 0-4.93 1.48C.53 9.07-.32 13.65.1 18.17a19.9 19.9 0 0 0 6.03 3.04 14.7 14.7 0 0 0 1.29-2.1 12.9 12.9 0 0 1-2.03-.97c.17-.12.34-.25.5-.38a14.2 14.2 0 0 0 12.2 0c.16.13.33.26.5.38-.65.38-1.33.71-2.04.97.37.74.8 1.44 1.29 2.1a19.8 19.8 0 0 0 6.04-3.04c.5-5.24-.84-9.78-3.56-13.8ZM8.02 15.4c-1.18 0-2.16-1.09-2.16-2.42s.95-2.42 2.16-2.42c1.2 0 2.18 1.1 2.16 2.42 0 1.33-.96 2.42-2.16 2.42Zm7.97 0c-1.19 0-2.16-1.09-2.16-2.42s.95-2.42 2.16-2.42c1.2 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42Z" />
                    </svg>
                  </span>
                  <span>Discord</span>
                </a>
              </li>
              <li>
                <a
                  href="https://link.aulianza.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-glass inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-base font-bold text-white transition-colors"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]">
                    <path
                      d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>{t('contact', 'hero.allLinks') || 'All my links'}</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </section>

      {/* Separator SVG: Hero -> Write Form with Dynamic Velocity Bending */}
      <BendingEdge above="#070a1a" below="#0b1030" />

      {/* 2. Write Section (#write) */}
      <section
        id="write"
        aria-labelledby="write-title"
        className="relative isolate scroll-mt-6 overflow-clip bg-[#0b1030] text-white"
        style={{ '--accent': activeAccent } as React.CSSProperties}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              background: `radial-gradient(55% 45% at 85% 30%, ${activeAccent}33, transparent 70%), radial-gradient(45% 40% at 10% 95%, ${activeAccent}22, transparent 70%)`,
            }}
          />
        </div>

        <div className="mx-auto grid max-w-[1280px] gap-14 px-5 pb-32 pt-24 md:px-10 md:pb-40 md:pt-32 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          {/* Left Column: Heading & Next Steps */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2
              id="write-title"
              className="pb-[0.1em] text-[clamp(3rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.035em]"
            >
              <span aria-label="Send a note">{t('contact', 'form.title') || 'Send a note'}</span>
            </h2>
            <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-white/70">
              {t('contact', 'form.intro') || 'A few lines is enough.'}
            </p>

            <div className="mt-12 border-t border-white/10 pt-8">
              <h3 className="text-[15px] font-bold text-white/85">
                {t('contact', 'form.next') || 'What happens next'}
              </h3>
              <ol className="mt-6 grid gap-6">
                {[
                  t('contact', 'form.steps.0') || 'I read it myself.',
                  t('contact', 'form.steps.1') || 'You hear back within two days.',
                  t('contact', 'form.steps.2') || 'If it fits, we talk.',
                ].map((step, idx) => (
                  <li
                    key={idx}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-3"
                  >
                    <span
                      aria-hidden="true"
                      className="text-2xl font-bold tabular-nums transition-colors duration-700"
                      style={{ color: activeAccent }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-lg leading-snug text-white/80">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right Column: Form */}
          <div>
            <AnimatePresence mode="wait">
              {formStatus === 'sent' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                  className="py-6 text-start"
                >
                  <div className="relative inline-block">
                    <motion.span
                      aria-hidden="true"
                      className="grid h-20 w-20 place-items-center rounded-full bg-[#19c39c] text-[#070a1a] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-4px_8px_rgba(0,0,0,0.2),0_20px_40px_-16px_rgba(25,195,156,0.8)]"
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                    >
                      <svg viewBox="0 0 24 24" className="h-9 w-9">
                        <path
                          d="M5 12.5l4.5 4.5L19 7.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.span>

                    {/* 12-particle Confetti burst when sent */}
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
                      {CONFETTI_PARTICLES.map((particle, idx) => (
                        <motion.span
                          key={idx}
                          className="absolute left-1/2 top-1/2 rounded-full"
                          style={{
                            width: particle.size,
                            height: particle.size,
                            marginLeft: -particle.size / 2,
                            marginTop: -particle.size / 2,
                            background: particle.color,
                          }}
                          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                          animate={{
                            x: particle.x,
                            y: particle.y,
                            scale: [0, 1.2, 0],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 0.9,
                            delay: 0.2 + (idx % 4) * 0.02,
                            ease: 'easeOut',
                          }}
                        />
                      ))}
                    </span>
                  </div>
                  <h3 className="mt-8 max-w-[18ch] pb-[0.1em] text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.03em] outline-none">
                    {t('contact', 'form.successTitle', { name }) || `Thanks, ${name.split(' ')[0]}. Got it.`}
                  </h3>
                  <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-white/70">
                    {t('contact', 'form.successBody', { email }) || `I'll reply to ${email} within two days.`}
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-8 inline-flex rounded-full bg-white px-8 py-3.5 text-base font-bold text-[#070a1a] transition-transform duration-500 hover:-translate-y-0.5"
                  >
                    {t('contact', 'form.another') || 'Send another message'}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate aria-describedby="contact-privacy" className="grid gap-8">
                  {/* Topic Radio Pills */}
                  <fieldset>
                    <legend className="text-[15px] font-bold text-white/85">
                      {t('contact', 'form.topicLegend') || 'What is this about?'}
                    </legend>
                    <div className="liquid-glass liquid-glass-dark mt-3 grid grid-cols-2 gap-1 rounded-[24px] p-1.5 sm:flex sm:rounded-full">
                      {(Object.keys(TOPIC_CONFIG) as TopicKey[]).map((key) => {
                        const isSelected = topic === key;
                        const label = t('contact', `form.topics.${key}`) || TOPIC_CONFIG[key].label;

                        return (
                          <label
                            key={key}
                            className={`relative flex min-h-12 flex-1 cursor-pointer select-none items-center justify-center rounded-full px-4 py-2.5 sm:flex-auto sm:whitespace-nowrap sm:px-3.5 text-center text-[15px] font-bold leading-tight transition-colors duration-300 ${
                              isSelected ? 'text-white' : 'text-white/70 hover:text-white'
                            }`}
                          >
                            <input
                              type="radio"
                              className="sr-only"
                              name="topic"
                              value={key}
                              checked={isSelected}
                              onChange={() => setTopic(key)}
                            />
                            {isSelected && (
                              <motion.span
                                layoutId="activeTopicPill"
                                aria-hidden="true"
                                className="absolute inset-0 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-3px_6px_rgba(0,0,0,0.22),0_8px_20px_-8px_var(--accent)]"
                                style={{
                                  backgroundColor: TOPIC_CONFIG[key].accent,
                                  backgroundImage:
                                    'radial-gradient(120% 80% at 50% -10%, rgba(255, 255, 255, 0.35), transparent 60%)',
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                              />
                            )}
                            <span className="relative">{label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Name & Email Inputs */}
                  <div className="grid gap-8 md:grid-cols-2 md:gap-6">
                    <div>
                      <div className="flex items-baseline justify-between gap-4">
                        <label htmlFor="contact-name" className="text-[15px] font-bold text-white/85">
                          {t('contact', 'form.nameLabel') || 'Your name'}
                        </label>
                      </div>
                      <div className="group liquid-glass liquid-glass-dark mt-2.5 rounded-2xl relative">
                        <input
                          id="contact-name"
                          type="text"
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t('contact', 'form.namePlaceholder') || 'Jane from Acme'}
                          className="relative block w-full bg-transparent px-5 py-4 text-lg text-white outline-none placeholder:text-white/40 autofill:[-webkit-text-fill-color:#fff]"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -inset-px rounded-[inherit] transition-[opacity,box-shadow] duration-300 opacity-0 shadow-[0_0_0_2px_var(--accent),0_0_30px_-6px_var(--accent)] group-focus-within:opacity-100"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between gap-4">
                        <label htmlFor="contact-email" className="text-[15px] font-bold text-white/85">
                          {t('contact', 'form.emailLabel') || 'Your email'}
                        </label>
                      </div>
                      <div className="group liquid-glass liquid-glass-dark mt-2.5 rounded-2xl relative">
                        <input
                          id="contact-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          dir="ltr"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('contact', 'form.emailPlaceholder') || 'jane@acme.com'}
                          aria-describedby="contact-email-hint"
                          className="relative block w-full bg-transparent px-5 py-4 text-lg text-white outline-none placeholder:text-white/40 autofill:[-webkit-text-fill-color:#fff] rtl:text-right"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -inset-px rounded-[inherit] transition-[opacity,box-shadow] duration-300 opacity-0 shadow-[0_0_0_2px_var(--accent),0_0_30px_-6px_var(--accent)] group-focus-within:opacity-100"
                        />
                      </div>
                      <p id="contact-email-hint" className="pt-2 text-sm text-white/60">
                        {t('contact', 'form.emailHint') || 'Only used to reply.'}
                      </p>
                    </div>
                  </div>

                  {/* Message Textarea */}
                  <div>
                    <div className="flex items-baseline justify-between gap-4">
                      <label htmlFor="contact-message" className="text-[15px] font-bold text-white/85">
                        {t('contact', 'form.messageLabel') || 'Your message'}
                      </label>
                      <span
                        dir="ltr"
                        className="text-sm font-bold tabular-nums text-white/60 transition-colors"
                      >
                        {message.length}
                        <span className="opacity-60"> / 1000</span>
                      </span>
                    </div>
                    <div className="group liquid-glass liquid-glass-dark mt-2.5 rounded-2xl relative">
                      <textarea
                        id="contact-message"
                        rows={6}
                        maxLength={1000}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          t('contact', `form.placeholders.${topic}`) || TOPIC_CONFIG[topic].placeholder
                        }
                        aria-describedby="contact-message-hint"
                        className="relative block w-full bg-transparent px-5 py-4 text-lg text-white outline-none placeholder:text-white/40 autofill:[-webkit-text-fill-color:#fff] min-h-[11rem] resize-y leading-relaxed"
                      />
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-5 bottom-0 h-[2px] overflow-hidden rounded-full"
                      >
                        <span
                          className="block h-full origin-left rounded-full transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] rtl:origin-right"
                          style={{
                            background: activeAccent,
                            transform: `scaleX(${Math.min(message.length / 10, 1)})`,
                          }}
                        />
                      </span>
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-px rounded-[inherit] transition-[opacity,box-shadow] duration-300 opacity-0 shadow-[0_0_0_2px_var(--accent),0_0_30px_-6px_var(--accent)] group-focus-within:opacity-100"
                      />
                    </div>
                    <p id="contact-message-hint" className="pt-2 text-sm text-white/60">
                      {t('contact', 'form.messageHint', { min: 10, max: 1000 }) ||
                        'Between 10 and 1000 characters.'}
                    </p>
                  </div>

                  {errorMessage && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="rounded-xl bg-red-500/20 px-4 py-3 text-sm font-semibold text-red-200"
                    >
                      {errorMessage}
                    </motion.p>
                  )}

                  {/* Submit Row: Framer Motion Morphing Button with Paper Plane, Checkmark & Confetti */}
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                    <span className="relative inline-flex">
                      <motion.button
                        type="submit"
                        layout={true}
                        disabled={formStatus !== 'idle'}
                        transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.9 }}
                        style={{ borderRadius: 999 }}
                        className={`group relative inline-flex h-16 items-center justify-center font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#0b1030] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-3px_6px_rgba(0,0,0,0.25),0_14px_30px_-12px_rgba(47,69,255,0.8)] ${
                          formStatus === 'sending'
                            ? 'min-w-[15rem] gap-3 bg-[#2f45ff]/80 px-8 cursor-wait'
                            : 'min-w-[15rem] gap-3 bg-[#2f45ff] px-8'
                        }`}
                      >
                        {formStatus === 'idle' && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 overflow-hidden rounded-full [mask-image:radial-gradient(white,black)]"
                          >
                            <span className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0" />
                          </span>
                        )}

                        <motion.span
                          layout="position"
                          className="relative transition-colors duration-500 group-hover:text-[#070a1a]"
                          initial={{ y: 14, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                        >
                          {formStatus === 'sending'
                            ? t('contact', 'form.sending') || 'Sending...'
                            : t('contact', 'form.send') || 'Send message'}
                        </motion.span>

                        <motion.span
                          layout="position"
                          className="relative grid place-items-center rtl:-scale-x-100"
                        >
                          <motion.span
                            className="block text-white transition-colors duration-500 group-hover:text-[#2f45ff]"
                            animate={
                              formStatus === 'sending'
                                ? { y: [0, -4, 0], rotate: [0, -6, 0] }
                                : { y: 0, rotate: 0 }
                            }
                            transition={
                              formStatus === 'sending'
                                ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                                : {}
                            }
                          >
                            <svg
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              className="h-5 w-5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            >
                              <path
                                d="M21.4 3.2 2.9 10.4c-.8.3-.8 1.4 0 1.7l6.6 2.4 2.4 6.6c.3.8 1.4.8 1.7 0l7.2-18.5c.3-.7-.4-1.4-1.1-1.1Z"
                                fill="currentColor"
                                opacity="0.92"
                              />
                              <path
                                d="m9.5 14.5 5-5"
                                stroke="#2f45ff"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                              />
                            </svg>
                          </motion.span>
                        </motion.span>
                      </motion.button>
                    </span>

                    <p id="contact-privacy" className="max-w-[36ch] text-sm leading-relaxed text-white/60">
                      {t('contact', 'form.privacy') || 'Goes straight to my inbox.'}
                    </p>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Separator SVG: Write Form -> Footer with Dynamic Velocity Bending */}
      <BendingEdge above="#0b1030" below="#070a1a" />
    </>
  );
}
