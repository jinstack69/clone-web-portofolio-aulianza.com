import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BendingEdge } from '@/components/shared/bending-edge';
import { ContactCTA } from '@/components/sections/contact-cta';
import toolsData from '@/lib/tools-data.json';

interface ToolPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return toolsData.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = toolsData.find((t) => t.slug === slug);
  if (!tool) {
    return { title: 'Tool Not Found' };
  }
  return {
    title: `${tool.title} — Ryan Aulia`,
    description: tool.description,
  };
}

export default async function ToolDetailPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = toolsData.find((t) => t.slug === slug);

  if (!tool) {
    notFound();
  }

  const relatedTools = toolsData
    .filter((t) => t.category === tool.category && t.slug !== tool.slug)
    .slice(0, 3);

  return (
    <>
      {/* Dark Hero Header */}
      <section
        aria-labelledby="tool-title"
        className="relative isolate overflow-hidden bg-[#070a1a] text-white"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -inset-40 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(38%_32%_at_76%_30%,rgba(47,69,255,0.45),transparent_72%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(30%_26%_at_16%_70%,rgba(116,131,255,0.2),transparent_70%)]" />
        </div>

        <div className="mx-auto max-w-[1280px] px-5 pb-20 pt-36 md:px-10 md:pb-24 md:pt-44">
          {/* Breadcrumb / Back Link */}
          <div className="mb-8 flex items-center gap-3 text-sm font-bold text-white/60">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 transition-colors hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="rtl:rotate-180"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>All tools</span>
            </Link>
            <span aria-hidden="true" className="text-white/20">/</span>
            <span className="text-white/80">{tool.category}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/80">
                  {tool.num}
                </span>
                <span className="text-sm font-semibold text-[#19c39c]">
                  Runs in browser
                </span>
              </div>

              <h1
                id="tool-title"
                className="mt-4 text-[clamp(2.5rem,5.5vw,4.75rem)] font-bold leading-[1.05] tracking-[-0.035em]"
              >
                {tool.title}
              </h1>

              <p className="mt-6 max-w-[50ch] text-lg font-medium leading-relaxed text-white/70 md:text-xl">
                {tool.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Separator to Light Paper Canvas */}
      <BendingEdge above="#070a1a" below="#f3f5f9" />

      {/* Main Tool Workbench Canvas */}
      <div className="bg-paper pb-28 pt-12 md:pb-36">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          {/* Workbench Box */}
          <div className="liquid-glass rounded-[28px] border border-line bg-white p-6 shadow-[0_30px_60px_-24px_rgba(15,22,48,0.12)] md:p-10">
            <div className="flex items-center justify-between border-b border-line pb-6">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#ff5f56]" />
                <span className="size-3 rounded-full bg-[#ffbd2e]" />
                <span className="size-3 rounded-full bg-[#27c93f]" />
                <span className="ms-3 text-xs font-bold uppercase tracking-wider text-dim">
                  Interactive Workbench
                </span>
              </div>
              <span className="text-xs font-bold text-dim">
                Client-side Only
              </span>
            </div>

            <div className="py-12 text-center md:py-16">
              <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-cobalt/10 text-cobalt">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>

              <h2 className="mt-6 text-2xl font-bold tracking-tight text-ink md:text-3xl">
                Ready to use
              </h2>
              <p className="mx-auto mt-3 max-w-[42ch] text-base leading-relaxed text-dim">
                No sign-up or installation required. What you paste or generate stays privately in your browser.
              </p>

              <div className="mt-8 flex justify-center gap-4">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-cobalt"
                >
                  Explore other tools
                </Link>
              </div>
            </div>
          </div>

          {/* Related Tools */}
          {relatedTools.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl font-bold tracking-tight text-ink">
                More in {tool.category}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedTools.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={rel.href}
                    className="group relative rounded-[22px] border border-line bg-white p-6 shadow-[0_24px_50px_-32px_rgba(15,22,48,0.1)] transition-transform duration-500 hover:-translate-y-1"
                  >
                    <span className="text-xs font-bold text-cobalt">{rel.num}</span>
                    <h3 className="mt-2 text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-cobalt">
                      {rel.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-dim">
                      {rel.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Separator to Dark Footer */}
      <BendingEdge above="#f3f5f9" below="#070a1a" />

      {/* Reusable Contact CTA Section */}
      <ContactCTA />
    </>
  );
}
