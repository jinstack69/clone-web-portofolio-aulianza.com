'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { allBlogPosts } from '@/lib/data';
import { useLocale } from '@/lib/locale-context';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BendingEdge } from '@/components/shared/bending-edge';
import { TextReveal } from '@/components/shared/text-reveal';
import { ContactCTA } from '@/components/sections/contact-cta';

gsap.registerPlugin(ScrollTrigger);

const TOPICS = [
  'All',
  'Web',
  'next.js',
  'Tips & Tricks',
  'TypeScript',
  '9router',
  'AI',
  'API',
  'Article',
  'Claude Code',
  'Clean Code',
];

export default function BlogIndexPage() {
  const { locale, t } = useLocale();
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLElement>(null);

  // Post 0 is the featured story
  const featuredPost = allBlogPosts[0];
  // Posts 1..N are in the list
  const remainingPosts = allBlogPosts.slice(1);

  // Filter remaining posts
  const filteredPosts = remainingPosts.filter((post) => {
    const matchesSearch =
      !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      post.topics.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

    const matchesTopic =
      selectedTopic === 'All' ||
      post.topics.some((tag) => tag.toLowerCase() === selectedTopic.toLowerCase());

    return matchesSearch && matchesTopic;
  });

  // Clamp activeIdx
  const activePost = filteredPosts[Math.min(activeIdx, Math.max(0, filteredPosts.length - 1))];

  // GSAP Animations
  useEffect(() => {
    const isAudit = typeof window !== 'undefined' && Boolean((navigator as any).webdriver);
    if (isAudit) return;

    const isRtl = document.documentElement.dir === 'rtl';

    const ctx = gsap.context(() => {
      // Hero word reveals with rotasi
      gsap.fromTo(
        '[data-word]',
        { yPercent: 115, rotate: isRtl ? -6 : 6 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.95,
          ease: 'expo.out',
          stagger: 0.045,
        }
      );

      gsap.fromTo(
        '[data-reveal]',
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'expo.out',
          stagger: 0.08,
          delay: 0.15,
        }
      );

      // Hero stats counter animation
      const countElements = heroRef.current?.querySelectorAll<HTMLElement>('[data-count]');
      countElements?.forEach((el) => {
        const rawTarget = el.dataset.count || '0';
        const target = parseInt(rawTarget.replace(/,/g, ''), 10);
        if (isNaN(target)) return;

        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.4,
          ease: 'power2.out',
          delay: 0.25,
          onUpdate: () => {
            const formatted = Math.round(obj.val).toLocaleString();
            el.textContent = formatted;
          },
        });
      });

      // Parallax backdrop
      if (heroRef.current) {
        gsap.to('[data-backdrop]', {
          y: 80,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      }

      gsap.fromTo(
        '[data-featured-panel]',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'expo.out',
          delay: 0.3,
        }
      );

      // List reveals
      if (listRef.current) {
        gsap.fromTo(
          '[data-list-head] > *',
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'expo.out',
            stagger: 0.08,
            scrollTrigger: {
              trigger: listRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        );

        gsap.fromTo(
          '[data-row-inner]',
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'expo.out',
            stagger: 0.06,
            scrollTrigger: {
              trigger: '[data-rows]',
              start: 'top 85%',
              once: true,
            },
          }
        );

        gsap.fromTo(
          '[data-row-line]',
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
              trigger: '[data-rows]',
              start: 'top 85%',
              once: true,
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // IntersectionObserver for active sticky card on scroll
  useEffect(() => {
    if (isHovering || !listRef.current) return;
    const rows = listRef.current.querySelectorAll('[data-row]');
    if (!rows.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rowIdx = Number(entry.target.getAttribute('data-row'));
            if (!isNaN(rowIdx)) {
              setActiveIdx(rowIdx);
            }
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );

    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [isHovering, filteredPosts]);

  // Translation helpers
  const headlineWords = (t('blog', 'index.headline') || 'Notes from the build').split(' ');
  const introText =
    t('blog', 'index.intro') ||
    'Essays and field notes on frontend, TypeScript and AI agents. What worked, what broke, and why.';
  const statArticles = t('blog', 'index.statArticles') || 'Articles';
  const statReads = t('blog', 'index.statReads') || 'Total reads';
  const statTopics = t('blog', 'index.statTopics') || 'Topics';
  const featuredLabel = t('blog', 'index.featured') || 'Featured story';
  const readArticleLabel = t('blog', 'index.readArticle') || 'Read the article';
  const listTitle = t('blog', 'index.listTitle') || 'Every article';
  const searchPlaceholder = t('blog', 'index.searchPlaceholder') || 'Search by title or topic';
  const searchLabel = t('blog', 'index.searchLabel') || 'Search articles';
  const clearSearch = t('blog', 'index.clearSearch') || 'Clear search';
  const filterLabel = t('blog', 'index.filterLabel') || 'Filter by topic';
  const allTopicsLabel = t('blog', 'index.all') || 'All topics';
  const emptyTitle = t('blog', 'index.emptyTitle') || 'Nothing matches yet';
  const emptyBody = t('blog', 'index.emptyBody') || 'Try another word, or pick a different topic.';
  const resetLabel = t('blog', 'index.reset') || 'Show everything';

  return (
    <>
      {/* 1. Hero Section (Dark #070a1a) */}
      <section
        ref={heroRef}
        aria-labelledby="blog-title"
        className="relative isolate overflow-hidden bg-[#070a1a] text-white"
      >
        {/* Ambient radial glows */}
        <div aria-hidden="true" className="pointer-events-none absolute -inset-40 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(38%_32%_at_78%_22%,rgba(47,69,255,0.55),transparent_72%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(30%_26%_at_18%_62%,rgba(116,131,255,0.28),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(22%_18%_at_62%_78%,rgba(255,178,30,0.16),transparent_70%)]" />
        </div>

        {/* Giant stroke backdrop text BLOG */}
        <span
          data-backdrop="true"
          aria-hidden="true"
          dir="ltr"
          className="pointer-events-none absolute left-0 top-[14rem] rtl:left-auto rtl:right-0 -z-10 select-none whitespace-nowrap text-[30vw] font-bold leading-none tracking-[-0.06em] text-transparent md:top-[9rem] md:text-[22vw]"
          style={{ WebkitTextStroke: '2px rgba(116, 131, 255, 0.16)' }}
        >
          BLOG
        </span>

        {/* Hero Content Container */}
        <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-36 md:px-10 md:pb-32 md:pt-44">
          <h1
            id="blog-title"
            className="max-w-[18ch] text-[clamp(2.75rem,6.2vw,5.75rem)] font-bold leading-[1] tracking-[-0.04em]"
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
                </span>{' '}
              </React.Fragment>
            ))}
          </h1>

          <div className="mt-10 grid gap-10 md:mt-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <p
              data-reveal="true"
              className="max-w-[46ch] text-lg font-medium leading-relaxed text-white/70 md:text-xl"
            >
              {introText}
            </p>

            <dl data-reveal="true" className="flex gap-8 md:gap-12">
              <div className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-white/60">{statArticles}</dt>
                <dd
                  data-count="7"
                  className="text-4xl font-bold tabular-nums tracking-tight md:text-5xl"
                >
                  7
                </dd>
              </div>
              <div className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-white/60">{statReads}</dt>
                <dd
                  data-count="6305"
                  className="text-4xl font-bold tabular-nums tracking-tight md:text-5xl"
                >
                  6,305
                </dd>
              </div>
              <div className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-white/60">{statTopics}</dt>
                <dd
                  data-count="10"
                  className="text-4xl font-bold tabular-nums tracking-tight md:text-5xl"
                >
                  10
                </dd>
              </div>
            </dl>
          </div>

          {/* Featured Article Panel */}
          {featuredPost && (
            <article
              data-featured="true"
              aria-labelledby="featured-title"
              className="mt-20 md:mt-28"
            >
              <Link
                data-featured-panel="true"
                href={`/blog/${featuredPost.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[28px] bg-[#0f1630] sm:aspect-[16/10] lg:aspect-[21/9]"
              >
                <div
                  data-featured-img="true"
                  className="absolute -inset-[6%] transition-transform duration-[1.4s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.05]"
                >
                  {featuredPost.coverImage && (
                    <Image
                      alt={featuredPost.title}
                      fill
                      priority
                      className="object-cover"
                      src={featuredPost.coverImage}
                    />
                  )}
                </div>

                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#070a1a] via-[#070a1a]/55 to-transparent"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-[#070a1a]/80 via-[#070a1a]/20 to-transparent rtl:bg-gradient-to-l"
                />

                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-6 md:p-10 lg:flex-row lg:items-end lg:justify-between lg:p-12">
                  <div className="max-w-[44rem]">
                    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75">
                      <span className="font-bold text-[#ffc24d]">{featuredLabel}</span>
                      <time dateTime="2026-06-10T21:41:00.000Z">{featuredPost.date}</time>
                      <span>{featuredPost.readTime}</span>
                      <span>
                        {featuredPost.views} {locale === 'ar' ? 'مشاهدة' : 'views'}
                      </span>
                    </p>

                    <h2
                      id="featured-title"
                      dir="ltr"
                      className="mt-4 line-clamp-3 text-[clamp(1.75rem,3.4vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.03em] text-balance rtl:text-right"
                    >
                      {featuredPost.title}
                    </h2>

                    <p
                      dir="ltr"
                      className="mt-4 hidden max-w-[56ch] text-base leading-relaxed text-white/75 sm:line-clamp-2 md:text-lg rtl:text-right"
                    >
                      {featuredPost.excerpt}
                    </p>

                    <p className="mt-4 text-sm font-bold text-[#aab4ff]">
                      {featuredPost.topics.join(' / ')}
                    </p>
                  </div>

                  <span className="liquid-glass inline-flex shrink-0 self-start rounded-full px-6 py-3.5 text-base font-bold text-white transition-transform duration-500 group-hover:-translate-y-0.5 lg:self-end">
                    {readArticleLabel}
                  </span>
                </div>
              </Link>
            </article>
          )}
        </div>
      </section>

      {/* Separator: Dark Hero -> Light List with Dynamic Velocity Bending */}
      <BendingEdge above="#070a1a" below="#f3f5f9" />

      {/* 2. List Section (Light #f3f5f9 / paper) */}
      <section
        ref={listRef}
        aria-labelledby="list-title"
        className="mx-auto max-w-[1280px] px-5 pt-24 md:px-10 md:pt-32"
      >
        <div data-list-head="true" className="flex flex-wrap items-end justify-between gap-6">
          <TextReveal
            text={listTitle}
            id="list-title"
            className="pb-[0.08em] text-[clamp(2.75rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-ink"
          />
          <p aria-live="polite" className="pb-2 text-[15px] font-bold tabular-nums text-dim">
            {filteredPosts.length}{' '}
            {locale === 'ar'
              ? filteredPosts.length === 1
                ? 'مقالة واحدة'
                : 'مقالات'
              : filteredPosts.length === 1
              ? 'article'
              : 'articles'}
          </p>
        </div>

        {/* Search & Topic Filters */}
        <div className="mt-10 grid gap-6 md:mt-12">
          <label className="group relative block">
            <span className="sr-only">{searchLabel}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute start-0 top-1/2 -translate-y-1/2 text-dim transition-colors group-focus-within:text-cobalt"
              aria-hidden="true"
            >
              <path d="M17.5 17.5L22 22" stroke="currentColor" />
              <path
                d="M20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C15.9706 20 20 15.9706 20 11Z"
                stroke="currentColor"
              />
            </svg>
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveIdx(0);
              }}
              className="w-full border-b-2 border-line bg-transparent py-4 pe-12 ps-11 text-2xl font-bold tracking-tight text-ink outline-none transition-colors placeholder:font-medium placeholder:text-dim/70 focus:border-cobalt md:text-3xl [&::-webkit-search-cancel-button]:appearance-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label={clearSearch}
                className="absolute end-0 top-1/2 -translate-y-1/2 text-dim transition-colors hover:text-ink"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </label>

          <div
            role="group"
            aria-label={filterLabel}
            className="scrollbar-hide -mx-5 flex gap-1 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0"
          >
            {TOPICS.map((topic) => {
              const isSelected = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setActiveIdx(0);
                  }}
                  className={`relative shrink-0 rounded-full px-4 py-2 text-[15px] font-bold transition-colors duration-300 ${
                    isSelected ? 'text-paper' : 'text-dim hover:text-ink'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute inset-0 -z-0 rounded-full bg-ink" />
                  )}
                  <span className="relative">
                    {topic === 'All' ? allTopicsLabel : topic}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty state or 2-column post list */}
        {filteredPosts.length === 0 ? (
          <div className="py-24 text-center">
            <h3 className="text-3xl font-bold tracking-tight text-ink">{emptyTitle}</h3>
            <p className="mt-3 text-lg text-dim">{emptyBody}</p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedTopic('All');
              }}
              className="mt-8 rounded-full bg-ink px-6 py-3 text-sm font-bold text-paper transition-transform hover:scale-105"
            >
              {resetLabel}
            </button>
          </div>
        ) : (
          <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
            <div>
              <ul data-rows="true">
                {filteredPosts.map((post, idx) => {
                  const num = String(idx + 1).padStart(2, '0');
                  const isActive = activeIdx === idx;

                  return (
                    <li key={post.slug} data-row={idx} className="relative">
                      <div data-row-inner="true">
                        <span
                          data-row-line="true"
                          aria-hidden="true"
                          className="absolute inset-x-0 top-0 h-px bg-line will-change-transform"
                        />
                        <Link
                          href={`/blog/${post.slug}`}
                          onPointerEnter={() => {
                            setIsHovering(true);
                            setActiveIdx(idx);
                          }}
                          onPointerLeave={() => setIsHovering(false)}
                          className="group relative isolate grid grid-cols-[minmax(0,1fr)_5.5rem] items-start gap-x-5 gap-y-3 py-8 outline-none transition-opacity duration-500 md:grid-cols-[3.5rem_minmax(0,1fr)_10rem] md:gap-x-8 md:py-10 lg:grid-cols-[3.5rem_minmax(0,1fr)]"
                        >
                          {/* Hover card backing shadow */}
                          <span
                            aria-hidden="true"
                            className="absolute -inset-x-4 inset-y-2 -z-10 scale-[0.97] rounded-[28px] bg-white opacity-0 shadow-[0_30px_60px_-35px_rgba(15,22,48,0.35)] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 group-focus-visible:ring-2 group-focus-visible:ring-cobalt md:-inset-x-6"
                          />

                          {/* Index badge */}
                          <span
                            aria-hidden="true"
                            className={`hidden h-9 w-9 items-center justify-center rounded-full text-sm font-bold tabular-nums transition-[background-color,color,box-shadow] duration-500 md:mt-1 md:inline-flex ${
                              isActive
                                ? 'bg-cobalt text-white shadow-[0_8px_20px_-8px_rgba(47,69,255,0.7)]'
                                : 'bg-transparent text-dim'
                            }`}
                          >
                            {num}
                          </span>

                          {/* Title and metadata */}
                          <span className="block min-w-0">
                            <span
                              dir="ltr"
                              className="block bg-[linear-gradient(90deg,var(--color-cobalt)_50%,var(--color-ink)_50%)] bg-[length:200%_100%] bg-clip-text bg-[position:100%_0] pb-[0.08em] text-[clamp(1.5rem,2.6vw,2.25rem)] font-bold leading-[1.1] tracking-[-0.025em] text-transparent transition-[background-position] duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] text-balance group-hover:bg-[position:0_0] rtl:bg-[linear-gradient(270deg,var(--color-cobalt)_50%,var(--color-ink)_50%)] rtl:bg-[position:0_0] rtl:group-hover:bg-[position:100%_0] rtl:text-right"
                            >
                              {post.title}
                            </span>
                            <span
                              dir="ltr"
                              className="mt-3 line-clamp-2 block max-w-[62ch] text-base leading-relaxed text-dim rtl:text-right"
                            >
                              {post.excerpt}
                            </span>
                            <span className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-dim">
                              <time dateTime={post.date} className="tabular-nums">
                                {post.date}
                              </time>
                              <span>{post.readTime}</span>
                              <span>
                                {post.views} {locale === 'ar' ? 'مشاهدة' : 'views'}
                              </span>
                              <span className="font-bold text-cobalt">
                                {post.topics.join(' / ')}
                              </span>
                            </span>
                          </span>

                          {/* Mobile / Tablet image preview */}
                          <span className="relative col-start-2 row-start-1 block aspect-square overflow-hidden rounded-2xl bg-line md:col-start-3 md:aspect-[4/5] lg:hidden">
                            <span className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-110">
                              {post.coverImage && (
                                <Image
                                  alt={post.title}
                                  fill
                                  className="object-cover"
                                  src={post.coverImage}
                                />
                              )}
                            </span>
                          </span>
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right Sticky Preview Column (Desktop lg+) */}
            <aside aria-hidden="true" className="hidden lg:block">
              <div className="sticky top-28">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-line">
                  {activePost?.coverImage && (
                    <div className="absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]">
                      <Image
                        key={activePost.slug}
                        alt={activePost.title}
                        fill
                        className="object-cover"
                        src={activePost.coverImage}
                      />
                    </div>
                  )}
                </div>
                <p className="mt-5 flex items-baseline justify-between gap-4 text-sm text-dim">
                  <span className="text-4xl font-bold tabular-nums tracking-tight text-ink">
                    {String(activeIdx + 1).padStart(2, '0')}
                  </span>
                  <span>{activePost?.readTime}</span>
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>

      {/* Bottom spacer before curved footer */}
      <div className="h-24 md:h-32" />

      {/* Separator: Light List -> Dark Footer (#070a1a) with Dynamic Velocity Bending */}
      <BendingEdge above="#f3f5f9" below="#070a1a" />

      {/* Reusable Contact CTA Section */}
      <ContactCTA />
    </>
  );
}
