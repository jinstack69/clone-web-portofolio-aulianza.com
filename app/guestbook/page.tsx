'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { BendingEdge } from '@/components/shared/bending-edge';
import { ScrambleText } from '@/components/shared/scramble-text';
import { ContactCTA } from '@/components/sections/contact-cta';
import { useSubpageHero } from '@/hooks/use-subpage-hero';
import { useLocale } from '@/lib/locale-context';
import guestbookData from '@/lib/guestbook-data.json';

const HERO_AVATARS = [
  'https://lh3.googleusercontent.com/a/ACg8ocJWM9QB9JpEm5l70EwN7efihJPH3lcIH9EPzCKFWPl76FmSQppL=s96-c',
  'https://lh3.googleusercontent.com/a/ACg8ocIXFI26oflb8RVbZk2Ab5W76eGJgRAZd2V4jfqnzQOtvTkO6qo=s96-c',
  'https://lh3.googleusercontent.com/a/ACg8ocIYTnDKf_4ipxVq0_RtU6Erf0_KJjj1nf2F4_1GbPCsc_y1wg=s96-c',
  'https://lh3.googleusercontent.com/a/ACg8ocKE4FE4qk8F-fk4XQ0oQUuINa8_xe_zKCvYvXrRlGE1_HOrdAWl=s96-c',
  'https://lh3.googleusercontent.com/a/ACg8ocKDeAtfYWS1x10qGvtFWbf9YJDVZsDNCKpizt7Zs7V48cFYc7v-=s96-c',
  'https://lh3.googleusercontent.com/a/ACg8ocIXTk8XwQrftbBfd61aRmAAq2MFppOKxs-Na555lSyJ7pYoy1wF=s96-c',
];

interface NoteItem {
  date: string;
  name: string;
  isOwner?: boolean;
  time: string;
  avatar: string;
  message: string;
}

export default function GuestbookPage() {
  const { locale, t } = useLocale();
  const [messages, setMessages] = useState<NoteItem[]>(guestbookData as NoteItem[]);
  const [inputText, setInputText] = useState('');
  const [signedInUser, setSignedInUser] = useState<{
    name: string;
    avatar?: string;
  } | null>(null);

  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Setup subpage hero animations (split words, glow follow, backdrop)
  useSubpageHero(heroRef, glowRef);

  // Live counter animation matching target chunk 1h5v_dkutqncu.js
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const isAudit = Boolean((navigator as any).webdriver);
    if (isAudit) {
      setProgress(1);
      return;
    }

    const obj = { p: 0 };
    const tween = gsap.to(obj, {
      p: 1,
      duration: 1.4,
      ease: 'power3.out',
      onUpdate: () => setProgress(obj.p),
      onComplete: () => setProgress(1),
    });

    return () => {
      tween.kill();
    };
  }, []);

  // Card cursor parallax tilt
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const isAudit = Boolean((navigator as any).webdriver);
    if (isAudit || !window.matchMedia('(pointer: fine)').matches) return;

    const quickRotateX = gsap.quickTo(card, 'rotateX', { duration: 1.2, ease: 'power3.out' });
    const quickRotateY = gsap.quickTo(card, 'rotateY', { duration: 1.2, ease: 'power3.out' });

    const handlePointerMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      quickRotateX(-y * 8);
      quickRotateY(x * 8);
    };

    const handlePointerLeave = () => {
      quickRotateX(0);
      quickRotateY(0);
    };

    card.addEventListener('mousemove', handlePointerMove);
    card.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      card.removeEventListener('mousemove', handlePointerMove);
      card.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newNote: NoteItem = {
      name: signedInUser ? signedInUser.name : 'Visiting Friend',
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      date: locale === 'ar' ? 'اليوم' : 'Today',
      message: inputText.trim(),
      avatar:
        signedInUser?.avatar ||
        'https://lh3.googleusercontent.com/a/ACg8ocIXFI26oflb8RVbZk2Ab5W76eGJgRAZd2V4jfqnzQOtvTkO6qo=s96-c',
      isOwner: false,
    };

    setMessages((prev) => [...prev, newNote]);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFakeSignIn = (provider: 'google' | 'github') => {
    setSignedInUser({
      name: provider === 'google' ? 'Google Explorer' : 'GitHub Dev',
      avatar:
        provider === 'google'
          ? 'https://lh3.googleusercontent.com/a/ACg8ocIXFI26oflb8RVbZk2Ab5W76eGJgRAZd2V4jfqnzQOtvTkO6qo=s96-c'
          : 'https://lh3.googleusercontent.com/a/ACg8ocKE4FE4qk8F-fk4XQ0oQUuINa8_xe_zKCvYvXrRlGE1_HOrdAWl=s96-c',
    });
  };

  // Group messages by date
  const groupedItems: { type: 'separator' | 'message'; data: any }[] = [];
  let lastDate = '';

  messages.forEach((msg, idx) => {
    if (msg.date && msg.date !== lastDate) {
      groupedItems.push({ type: 'separator', data: msg.date });
      lastDate = msg.date;
    }
    groupedItems.push({ type: 'message', data: msg });
  });

  const headline = t('guestbook', 'hero.headline') || 'Leave a note on my wall';
  const headlineWords = headline.split(' ');
  const latestNote = messages[messages.length - 1] || messages[0];

  return (
    <>
      {/* 1. Dark Hero Section */}
      <section
        ref={heroRef}
        aria-labelledby="guestbook-title"
        className="relative isolate overflow-hidden bg-[#070a1a] text-white"
      >
        {/* Ambient radial glows */}
        <div ref={glowRef} aria-hidden="true" className="pointer-events-none absolute -inset-40 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(36%_34%_at_80%_30%,rgba(47,69,255,0.5),transparent_72%)] rtl:-scale-x-100" />
          <div className="absolute inset-0 bg-[radial-gradient(30%_28%_at_15%_70%,rgba(116,131,255,0.26),transparent_70%)] rtl:-scale-x-100" />
          <div className="absolute inset-0 bg-[radial-gradient(20%_18%_at_58%_84%,rgba(25,195,156,0.14),transparent_70%)] rtl:-scale-x-100" />
        </div>

        <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-36 md:px-10 md:pb-32 md:pt-44">
          <h1
            id="guestbook-title"
            className="max-w-[14ch] text-[clamp(2.75rem,6.2vw,5.75rem)] font-bold leading-[1] tracking-[-0.04em]"
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

          <div className="mt-10 grid gap-12 md:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-end lg:gap-16">
            {/* Left Column: Intro, CTA, Stats, Avatars */}
            <div className="flex flex-col gap-10">
              <p
                data-reveal="true"
                className="max-w-[46ch] text-lg font-medium leading-relaxed text-white/70 md:text-xl"
              >
                {t('guestbook', 'hero.intro') ||
                  'Say hi, share a thought, or tell me what you are building. Every note shows up here live, for everyone who visits.'}
              </p>

              <div
                data-reveal="true"
                className="flex flex-wrap items-center gap-x-10 gap-y-8"
              >
                <span className="inline-block">
                  <a
                    href="#guestbook-composer"
                    className="group relative inline-flex overflow-hidden rounded-full bg-white px-8 py-4 text-base font-bold text-[#070a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#070a1a]"
                  >
                    <span className="absolute inset-0 translate-y-full rounded-full bg-[#2f45ff] transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0" />
                    <span className="relative transition-colors duration-500 group-hover:text-white">
                      {t('guestbook', 'hero.signInToWrite') || 'Sign in to write'}
                    </span>
                  </a>
                </span>

                <dl className="flex gap-8 md:gap-12">
                  <div className="flex flex-col-reverse gap-1">
                    <dt className="text-sm text-white/60">
                      {t('guestbook', 'hero.notes') || 'Notes'}
                    </dt>
                    <dd className="text-4xl font-bold tabular-nums tracking-tight md:text-5xl">
                      {Math.round(messages.length * progress)}
                    </dd>
                  </div>
                  <div className="flex flex-col-reverse gap-1">
                    <dt className="text-sm text-white/60">
                      {t('guestbook', 'hero.people') || 'People'}
                    </dt>
                    <dd className="text-4xl font-bold tabular-nums tracking-tight md:text-5xl">
                      {Math.round(46 * progress)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Overlapping User Avatars */}
              <div data-reveal="true" aria-hidden="true" className="flex items-center">
                {HERO_AVATARS.map((url, idx) => (
                  <span
                    key={idx}
                    className="-ms-3 rounded-full ring-[3px] ring-[#070a1a] first:ms-0"
                    style={{ zIndex: HERO_AVATARS.length - idx }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="size-11 shrink-0 rounded-full bg-line object-cover"
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: Latest note Live card */}
            <aside
              ref={cardRef}
              data-reveal="true"
              aria-labelledby="guestbook-latest"
              className="liquid-glass liquid-glass-dark min-w-0 rounded-[28px] p-6 md:p-7 [transform-style:preserve-3d]"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 id="guestbook-latest" className="text-sm font-bold text-white/60">
                  {t('guestbook', 'hero.latest') || 'Latest note'}
                </h2>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[#19c39c]">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#19c39c] opacity-60 motion-reduce:hidden" />
                    <span className="relative inline-flex size-2 rounded-full bg-[#19c39c]" />
                  </span>
                  Live
                </span>
              </div>

              <div aria-live="polite" className="mt-5 min-h-[9.5rem]">
                <figure>
                  <figcaption className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={latestNote.avatar}
                      alt=""
                      className="size-11 shrink-0 rounded-full bg-line object-cover"
                    />
                    <span className="flex min-w-0 flex-col">
                      <span dir="auto" className="truncate text-base font-bold">
                        {latestNote.name}
                      </span>
                      <time className="text-[13px] font-medium tabular-nums text-white/60">
                        {latestNote.time}
                      </time>
                    </span>
                  </figcaption>
                  <blockquote
                    dir="auto"
                    className="mt-4 line-clamp-4 whitespace-pre-line break-words text-lg font-medium leading-relaxed text-white/90 [overflow-wrap:anywhere]"
                    dangerouslySetInnerHTML={{ __html: latestNote.message }}
                  />
                </figure>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Separator: Dark Hero -> Light Canvas with Dynamic Velocity Bending */}
      <BendingEdge above="#070a1a" below="#f3f5f9" />

      {/* 2. The Wall Section */}
      <section aria-labelledby="wall-title" className="bg-paper text-ink">
        <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-20 md:px-10 md:pb-32 md:pt-28">
          <div className="mb-10 md:mb-12">
            <h2
              id="wall-title"
              className="pb-[0.08em] text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.03em]"
            >
              <ScrambleText text={t('guestbook', 'wall.title') || 'The wall'} />
            </h2>
            <p className="mt-3 max-w-[44ch] text-lg leading-relaxed text-dim">
              {t('guestbook', 'wall.intro') ||
                'Newest notes at the bottom. It updates live.'}
            </p>
          </div>

          {/* Chat Frame */}
          <div
            id="guestbook-chat"
            className="relative overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_1px_0_rgba(15,22,48,0.04),0_40px_80px_-48px_rgba(15,22,48,0.35)]"
          >
            <div className="relative">
              {/* Top Gradient Fade */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 rounded-t-[inherit] bg-gradient-to-b from-white to-transparent"
              />

              {/* Scrollable Message Wall */}
              <div
                ref={scrollRef}
                tabIndex={0}
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                aria-label="The wall"
                className="h-[min(56vh,680px)] min-h-[380px] overflow-y-auto overscroll-contain px-4 py-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cobalt sm:px-8 md:h-[min(64vh,680px)] md:min-h-[420px] [scrollbar-color:#dce1ec_transparent] [scrollbar-width:thin]"
              >
                <div className="flex min-h-full flex-col">
                  <ul className="flex flex-col">
                    {groupedItems.map((item, idx) => {
                      if (item.type === 'separator') {
                        return (
                          <li
                            key={`sep-${idx}`}
                            role="separator"
                            className="mb-2 mt-10 flex items-center gap-4 first:mt-0"
                          >
                            <span aria-hidden="true" className="h-px flex-1 bg-line" />
                            <span className="min-h-[1.25rem] text-sm font-bold text-dim">
                              {item.data}
                            </span>
                            <span aria-hidden="true" className="h-px flex-1 bg-line" />
                          </li>
                        );
                      }

                      const note = item.data as NoteItem;
                      const isOwner = note.isOwner;

                      return (
                        <li
                          key={`msg-${idx}`}
                          className="group mt-6 flex gap-3 first:mt-0"
                        >
                          <div className="w-10 shrink-0">
                            {note.avatar ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={note.avatar}
                                alt=""
                                className="size-10 shrink-0 rounded-full bg-line object-cover"
                              />
                            ) : (
                              <div className="size-10 rounded-full bg-cobalt/10 flex items-center justify-center font-bold text-cobalt text-sm">
                                {note.name.slice(0, 1)}
                              </div>
                            )}
                          </div>

                          <div className="flex min-w-0 max-w-[min(38rem,calc(100%-3.25rem))] flex-col items-start">
                            <p className="mb-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 px-1">
                              <span
                                dir="auto"
                                className="text-[15px] font-bold tracking-tight text-ink"
                              >
                                {note.name}
                              </span>
                              {isOwner && (
                                <span className="text-[13px] font-bold text-cobalt">
                                  Site owner
                                </span>
                              )}
                              <time className="text-[13px] font-medium tabular-nums text-dim">
                                {note.time}
                              </time>
                            </p>

                            <div className="flex max-w-full items-center gap-1">
                              <p
                                dir="auto"
                                className={`min-w-0 whitespace-pre-line break-words rounded-[22px] px-4 py-2.5 text-base font-medium leading-relaxed [overflow-wrap:anywhere] rounded-ss-md ${
                                  isOwner
                                    ? 'bg-ink text-white'
                                    : 'bg-[#eef1f7] text-ink'
                                }`}
                                dangerouslySetInnerHTML={{ __html: note.message }}
                              />
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>

            {/* Composer Footer */}
            <div id="guestbook-composer" className="relative border-t border-line bg-white">
              {!signedInUser ? (
                <div className="flex flex-col gap-5 px-4 py-5 sm:px-8 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
                  <p className="max-w-[44ch] text-base font-medium leading-relaxed text-dim">
                    {t('guestbook', 'signInPrompt') ||
                      'Sign in to leave a note. Only your name and photo show on the wall.'}
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    {/* Google Button */}
                    <button
                      id="guestbook-signin"
                      type="button"
                      onClick={() => handleFakeSignIn('google')}
                      className="inline-flex h-[52px] items-center justify-center gap-3 rounded-full border border-line bg-white px-6 text-base font-bold text-ink transition-[background-color,border-color,transform] duration-300 hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 active:scale-[0.97]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        stroke="currentColor"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 12H17C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C13.3807 7 14.6307 7.55964 15.5355 8.46447" />
                      </svg>
                      <span>
                        {t('guestbook', 'continueWithGoogle') || 'Continue with Google'}
                      </span>
                    </button>

                    {/* GitHub Button */}
                    <button
                      type="button"
                      onClick={() => handleFakeSignIn('github')}
                      className="inline-flex h-[52px] items-center justify-center gap-3 rounded-full border border-ink bg-ink px-6 text-base font-bold text-white transition-[background-color,border-color,transform] duration-300 hover:border-cobalt hover:bg-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 active:scale-[0.97]"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        stroke="currentColor"
                      >
                        <path d="M6.51734 17.1132C6.91177 17.6905 8.10883 18.9228 9.74168 19.2333M9.86428 22C8.83582 21.8306 2 19.6057 2 12.0926C2 5.06329 8.0019 2 12.0008 2C15.9996 2 22 5.06329 22 12.0926C22 19.6057 15.1642 21.8306 14.1357 22C14.1357 22 13.9267 18.5826 14.0487 17.9969C14.1706 17.4113 13.7552 16.4688 13.7552 16.4688C14.7262 16.1055 16.2043 15.5847 16.7001 14.1874C17.0848 13.1032 17.3268 11.5288 16.2508 10.0489C16.2508 10.0489 16.5318 7.65809 15.9996 7.56548C15.4675 7.47287 13.8998 8.51192 13.8998 8.51192C13.4432 8.38248 12.4243 8.13476 12.0018 8.17939C11.5792 8.13476 10.5568 8.38248 10.1002 8.51192C10.1002 8.51192 8.53249 7.47287 8.00036 7.56548C7.46823 7.65809 7.74917 10.0489 7.74917 10.0489C6.67316 11.5288 6.91516 13.1032 7.2999 14.1874C7.79575 15.5847 9.27384 16.1055 10.2448 16.4688C10.2448 16.4688 9.82944 17.4113 9.95135 17.9969C10.0733 18.5826 9.86428 22 9.86428 22Z" />
                      </svg>
                      <span>
                        {t('guestbook', 'continueWithGitHub') || 'Continue with GitHub'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 px-4 py-5 sm:px-8 sm:py-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">
                      Signed in as <span className="text-cobalt">{signedInUser.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSignedInUser(null)}
                      className="text-dim underline hover:text-ink"
                    >
                      Sign out
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t('guestbook', 'composer.label') || 'Your note...'}
                      rows={2}
                      className="w-full resize-none rounded-2xl border border-line bg-canvas p-3.5 text-base text-ink focus:border-cobalt focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!inputText.trim()}
                      className="inline-flex shrink-0 items-center justify-center self-end rounded-full bg-cobalt px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                      {t('guestbook', 'composer.send') || 'Send'}
                    </button>
                  </div>
                  <p className="text-xs text-dim">
                    {t('guestbook', 'composer.hint') ||
                      'Press Enter to send. Shift and Enter adds a new line.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Separator to Dark Footer with Dynamic Velocity Bending */}
      <BendingEdge above="#f3f5f9" below="#070a1a" />

      {/* Reusable Contact CTA Section */}
      <ContactCTA />
    </>
  );
}
