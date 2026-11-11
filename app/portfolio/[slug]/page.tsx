import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { BendingEdge } from '@/components/shared/bending-edge';
import { ProjectMockup } from '@/components/ui/project-mockup';
import { MarkdownView } from '@/components/ui/markdown-view';
import { ContactCTA } from '@/components/sections/contact-cta';
import allProjects from '@/lib/projects-data.json';
import projectsDetail from '@/lib/projects-detail-data.json';

interface Props {
  params: Promise<{ slug: string }>;
}

const FEATURED_COLORS = [
  '#2f45ff',
  '#ffb21e',
  '#0f1630',
  '#7483ff',
  '#ffffff',
  '#19c39c',
];

export async function generateStaticParams() {
  return allProjects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const projectIndex = allProjects.findIndex((p) => p.slug === slug);

  if (projectIndex === -1) {
    notFound();
  }

  const baseProject = allProjects[projectIndex];
  const detailed = (projectsDetail as Record<string, any>)[slug] || {};
  const project = {
    ...baseProject,
    ...detailed,
  };

  const nextIndex = (projectIndex + 1) % allProjects.length;
  const nextProject = allProjects[nextIndex];

  const color = FEATURED_COLORS[projectIndex % FEATURED_COLORS.length];
  const nextColor = FEATURED_COLORS[nextIndex % FEATURED_COLORS.length];

  const content =
    project.content ||
    `## Overview\n\n${project.description}\n\n## Tech Stack\n\n${project.stacks
      ?.map((s: string) => `- ${s}`)
      .join('\n')}`;

  return (
    <>
      {/* 1. Project Detail Dark Hero Header */}
      <section
        aria-labelledby="work-title"
        className="relative isolate bg-[linear-gradient(to_bottom,#070a1a_0,#070a1a_calc(100%-clamp(8rem,16vw,14rem)),#f3f5f9_calc(100%-clamp(8rem,16vw,14rem)))] text-white"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(45%_45%_at_85%_8%,rgba(47,69,255,0.45),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(30%_35%_at_6%_50%,rgba(116,131,255,0.2),transparent_70%)]" />
        </div>

        <div className="mx-auto max-w-[1280px] px-5 pt-32 md:px-10 md:pt-40">
          <Link
            href="/portfolio"
            className="group -my-3 inline-flex items-center gap-2 py-3 text-[15px] font-bold text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>All work</span>
          </Link>

          <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
            <div>
              <h1
                id="work-title"
                className="text-[clamp(2.4rem,5.6vw,5rem)] font-bold leading-[1.02] tracking-[-0.04em] text-balance"
              >
                <bdi>{project.title}</bdi>
              </h1>
              <p className="mt-6 max-w-[52ch] text-lg font-medium leading-relaxed text-white/70 md:text-xl">
                {project.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-bold text-[#070a1a] transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] hover:-translate-y-0.5"
                >
                  <span>Visit site</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-bold text-white transition-transform duration-500 hover:-translate-y-0.5"
                >
                  <Github className="h-4 w-4" />
                  <span>Source code</span>
                </a>
              )}
            </div>
          </div>

          {/* Big Visual Mockup Panel */}
          <div data-visual="true" className="mt-14 md:mt-20">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] shadow-[0_40px_90px_-40px_rgba(7,10,26,0.65)] ring-1 ring-white/10 md:aspect-[21/9] md:rounded-[36px]">
              <ProjectMockup title={project.title} color={color} slug={project.slug} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Paper Canvas Content Area */}
      <div className="bg-paper pb-28 pt-16 md:pb-36 md:pt-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <div className="grid gap-12 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16">
            {/* Left Aside: Stacks, Services, Deliverables */}
            <aside>
              <dl className="grid gap-8 sm:grid-cols-3 lg:grid-cols-1">
                {project.stacks && project.stacks.length > 0 && (
                  <div>
                    <dt className="text-sm text-dim">Built with</dt>
                    <dd className="mt-2">
                      <ul className="grid gap-1.5 text-base font-bold text-ink">
                        {project.stacks.map((stack: string, idx: number) => (
                          <li key={idx}>{stack}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}

                {project.services && project.services.length > 0 && (
                  <div>
                    <dt className="text-sm text-dim">Services</dt>
                    <dd className="mt-2">
                      <ul className="grid gap-1.5 text-base font-bold text-ink">
                        {project.services.map((service: string, idx: number) => (
                          <li key={idx}>{service}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}

                {project.deliverables && project.deliverables.length > 0 && (
                  <div>
                    <dt className="text-sm text-dim">Deliverables</dt>
                    <dd className="mt-2">
                      <ul className="grid gap-1.5 text-base font-bold text-ink">
                        {project.deliverables.map((deliv: string, idx: number) => (
                          <li key={idx}>{deliv}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
            </aside>

            {/* Right: Markdown Overview */}
            <div className="min-w-0">
              <MarkdownView content={content} />
            </div>
          </div>
        </div>
      </div>

      {/* Separator to Dark Next Project with Dynamic Velocity Bending */}
      <BendingEdge above="#f3f5f9" below="#070a1a" />

      {/* 3. Next Project Section */}
      <section aria-label="Next project" className="bg-[#070a1a] text-white">
        <div className="mx-auto max-w-[1280px] px-5 py-20 md:px-10 md:py-28">
          <Link
            href={`/portfolio/${nextProject.slug}`}
            className="group grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:gap-14"
          >
            <div>
              <p className="text-[15px] font-bold text-[#ffc24d]">Next project</p>
              <p className="mt-4 text-[clamp(2.4rem,6vw,5.5rem)] font-bold leading-[1] tracking-[-0.04em]">
                <bdi className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_4px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:bg-[length:100%_4px] rtl:bg-right-bottom">
                  {nextProject.title}
                </bdi>
              </p>
              <p className="mt-5 line-clamp-2 max-w-[46ch] text-lg leading-relaxed text-white/65">
                {nextProject.description}
              </p>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] transition-[border-radius] duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:rounded-[48px] md:rounded-[32px]">
              <div className="absolute inset-0 scale-105 transition-transform duration-[1.2s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-100">
                <ProjectMockup title={nextProject.title} color={nextColor} slug={nextProject.slug} />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Reusable Contact CTA Section */}
      <ContactCTA />
    </>
  );
}
