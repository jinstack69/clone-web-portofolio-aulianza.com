import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Eye } from 'lucide-react';
import { BendingEdge } from '@/components/shared/bending-edge';
import { MarkdownView } from '@/components/ui/markdown-view';
import { ContactCTA } from '@/components/sections/contact-cta';
import { allBlogPosts } from '@/lib/data';
import articlesDetail from '@/lib/articles-detail-data.json';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allBlogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const postIndex = allBlogPosts.findIndex((p) => p.slug === slug);

  if (postIndex === -1) {
    notFound();
  }

  const basePost = allBlogPosts[postIndex];
  const detailed = (articlesDetail as Record<string, any>)[slug] || {};
  const post = {
    ...basePost,
    ...detailed,
  };

  // Related posts (excluding current)
  const relatedPosts = allBlogPosts
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  const words = post.title.split(' ');
  const content = post.content || `## Overview\n\n${post.excerpt}`;

  // Extract H2 headings for Table of Contents (TOC)
  const tocItems: { id: string; text: string }[] = [];
  const lines = content.split('\n');
  lines.forEach((line: string) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      const text = trimmed.replace('## ', '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      tocItems.push({ id, text });
    }
  });

  return (
    <>
      {/* 1. Dark Hero Section */}
      <section
        aria-labelledby="article-title"
        className="relative isolate overflow-hidden bg-[#070a1a] text-white"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(45%_55%_at_85%_10%,rgba(47,69,255,0.5),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(35%_40%_at_8%_90%,rgba(116,131,255,0.22),transparent_70%)]" />
        </div>

        <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-32 md:pb-20 md:px-10 md:pt-40">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/blog"
              className="group -my-3 inline-flex items-center gap-2 py-3 text-[15px] font-bold text-white/75 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4 transition-transform duration-500 group-hover:-translate-x-1" />
              <span>All posts</span>
            </Link>
            <p className="text-[15px] font-bold text-[#9aa6ff]">
              {post.topics?.join(' / ')}
            </p>
          </div>

          <h1
            id="article-title"
            dir="ltr"
            className="mt-10 max-w-[24ch] text-[clamp(2.15rem,4.6vw,4.125rem)] font-bold leading-[1.05] tracking-[-0.04em] text-balance md:mt-14"
          >
            {words.map((word: string, i: number) => (
              <React.Fragment key={i}>
                <span className="-mb-[0.2em] inline-block overflow-hidden pb-[0.2em] pt-[0.06em] align-top">
                  <span className="inline-block origin-bottom-left will-change-transform">
                    {word}
                  </span>
                </span>{' '}
              </React.Fragment>
            ))}
          </h1>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-x-10 gap-y-6 md:mt-12">
            <div className="flex items-center gap-4">
              <Image
                alt="Ryan Aulia"
                width={48}
                height={48}
                className="size-12 rounded-full bg-[#0f1630] object-cover ring-2 ring-white/15"
                src="/images/avatar-new.webp"
              />
              <div className="text-[15px] leading-snug">
                <p className="font-bold">Ryan Aulia</p>
                <p className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-white/60">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-4" />
                    <time dateTime={post.date}>{post.date}</time>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-4" />
                    {post.readTime}
                  </span>
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <Eye className="size-4" />
                    {post.views} views
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Separator: Dark Hero -> Light Article with Dynamic Velocity Bending */}
      <BendingEdge above="#070a1a" below="#f3f5f9" />

      {/* 2. Paper Canvas Article Content with TOC */}
      <div className="bg-paper pb-28 pt-14 md:pb-36 md:pt-20">
        <div className="mx-auto max-w-[1280px] gap-10 px-5 md:px-10 xl:gap-12 xl:grid xl:grid-cols-[13rem_minmax(0,1fr)_2.75rem]">
          {/* Left Column: Sticky Table of Contents (TOC) */}
          <aside className="hidden xl:block">
            {tocItems.length > 0 && (
              <div className="sticky top-28">
                <p className="mb-4 text-[16px] font-bold text-ink">On this page</p>
                <nav aria-label="On this page">
                  <ol className="relative grid gap-0.5 border-s border-line">
                    {tocItems.map((item, i) => (
                      <li key={i} className="relative">
                        <a
                          href={`#${item.id}`}
                          className="block py-2 text-[15px] font-medium leading-snug transition-colors duration-300 ps-4 text-dim hover:text-ink hover:font-bold"
                        >
                          <span dir="ltr" className="block rtl:text-right">
                            {item.text}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            )}
          </aside>

          {/* Center Column: Article Markdown */}
          <div className="min-w-0 max-w-[50rem]">
            <MarkdownView content={content} />

            {/* Tags footer */}
            {post.topics && (
              <div className="mt-12 flex flex-wrap gap-2 pt-8 border-t border-line">
                {post.topics.map((t: string) => (
                  <span
                    key={t}
                    className="rounded-full bg-white border border-line px-4 py-1.5 text-xs font-bold text-cobalt"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Author Card at the bottom */}
            <div className="mt-16 rounded-[28px] border border-line bg-white p-8 md:p-10 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <Image
                  alt="Ryan Aulia"
                  width={64}
                  height={64}
                  className="size-16 rounded-full bg-[#0f1630] object-cover ring-2 ring-line"
                  src="/images/avatar-new.webp"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-dim">Written by</p>
                  <p className="mt-0.5 text-xl font-bold text-ink">Ryan Aulia</p>
                  <p className="mt-2 text-sm leading-relaxed text-dim">
                    Software engineer in Jakarta. I build web, mobile and AI agent
                    products, and I write about what I learn on the way.
                  </p>
                </div>
                <Link
                  href="/about"
                  className="self-start rounded-full bg-paper px-5 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-line sm:self-center"
                >
                  More about me
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Empty margin spacer */}
          <div className="hidden xl:block" />
        </div>
      </div>

      {/* Separator: Light Content -> Dark Keep Reading with Dynamic Velocity Bending */}
      <BendingEdge above="#f3f5f9" below="#070a1a" />

      {/* 3. Keep Reading Section (Dark Horizontal Rows) */}
      <section
        aria-labelledby="keep-reading"
        className="bg-[#070a1a] pb-28 pt-24 text-white md:pb-36 md:pt-32"
      >
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <h2
            id="keep-reading"
            className="text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-none tracking-[-0.035em]"
          >
            Keep reading
          </h2>

          <ul data-related="true" className="mt-14 border-t border-white/15 md:mt-20">
            {relatedPosts.map((rel) => (
              <li key={rel.slug} className="relative">
                <Link
                  href={`/blog/${rel.slug}`}
                  className="group grid gap-2 border-b border-white/15 py-7 md:grid-cols-[10rem_minmax(0,1fr)_auto] md:items-center md:gap-10 md:py-9 outline-none"
                >
                  <time className="text-sm font-medium text-white/60">
                    {rel.date}
                  </time>
                  <span className="text-xl font-bold text-white transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-x-2 md:text-2xl">
                    {rel.title}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#ffb21e] md:text-end">
                    {rel.topics?.join(' / ')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reusable Contact CTA Section */}
      <ContactCTA />
    </>
  );
}
