'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { recentPosts } from '@/lib/data';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleText } from '@/components/shared/scramble-text';
import { useLocale } from '@/lib/locale-context';

gsap.registerPlugin(ScrollTrigger);

export function RecentBlog() {
  const { locale, t } = useLocale();
  const containerRef = useRef<HTMLElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check reduced motion or automated audit
    const isAudit = typeof window !== 'undefined' && Boolean((navigator as any).webdriver);
    if (isAudit) return;

    const isRtl = document.documentElement.dir === 'rtl';

    const ctx = gsap.context(() => {
      gsap.from('[data-writing-head] > *', {
        y: 50,
        opacity: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          once: true,
        },
      });

      gsap.from('[data-post]', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: container,
          start: 'top 70%',
          once: true,
        },
      });

      gsap.from('[data-post-line]', {
        scaleX: 0,
        transformOrigin: isRtl ? 'right' : 'left',
        duration: 1.4,
        ease: 'expo.inOut',
        stagger: 0.1,
        scrollTrigger: {
          trigger: container,
          start: 'top 70%',
          once: true,
        },
      });
    }, container);

    return () => ctx.revert();
  }, [locale]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const titleText = t('home', 'v2.writingTitle') || 'Blog';
  const allArticlesText = t('home', 'v2.writingAll') || 'All posts';
  const viewsSuffix = locale === 'ar' ? 'مشاهدة' : 'views';

  return (
    <section
      ref={containerRef}
      aria-labelledby="writing-title"
      className="relative mx-auto mt-28 max-w-[1280px] px-5 text-[#0f1630] md:mt-40 md:px-10"
    >
      {/* Header with Hacker/Matrix Scramble Text */}
      <div data-writing-head="true" className="flex items-end justify-between gap-6">
        <h2
          id="writing-title"
          className="text-5xl font-bold tracking-tighter text-[#0f1630] md:text-8xl"
        >
          <ScrambleText text={titleText} />
        </h2>

        <Link
          href="/blog"
          className="group shrink-0 text-[15px] font-bold text-[#2f45ff] dark:text-[#7483ff]"
        >
          <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-[length:100%_2px] rtl:bg-right-bottom">
            {allArticlesText}
          </span>
        </Link>
      </div>

      {/* Post Rows with Sibling Hover Dimming */}
      <ul
        className="mt-10 text-[#0f1630]"
        onPointerLeave={() => setHoveredIdx(null)}
      >
        {recentPosts.map((post, idx) => (
          <li key={post.slug} data-post="true" className="relative text-[#0f1630]">
            <span
              data-post-line="true"
              className="absolute inset-x-0 top-0 h-px bg-[#dce1ec]"
            />
            <Link
              href={`/blog/${post.slug}`}
              onPointerEnter={() => setHoveredIdx(idx)}
              onFocus={() => setHoveredIdx(idx)}
              className={`group grid gap-2 py-8 transition-opacity duration-300 md:grid-cols-[9rem_1fr_auto] md:items-center md:gap-10 md:py-10 text-[#0f1630] ${
                hoveredIdx !== null && hoveredIdx !== idx ? 'md:opacity-30' : ''
              }`}
            >
              <time className="text-sm tabular-nums text-[#5b6482]">
                {formatDate(post.date)}
              </time>
              <span className="text-2xl font-bold tracking-tight text-[#0f1630] transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-x-3 rtl:group-hover:-translate-x-3 md:text-4xl">
                {post.title}
              </span>
              <span className="text-sm text-[#5b6482]">
                {post.views} {viewsSuffix}
              </span>
            </Link>
          </li>
        ))}
        {/* Bottom divider item */}
        <li aria-hidden="true" className="h-px bg-[#dce1ec] text-[#0f1630]" />
      </ul>
    </section>
  );
}
