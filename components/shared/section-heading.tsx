'use client';

import React from 'react';
import { ScrambleText } from '@/components/shared/scramble-text';

export interface SectionHeadingProps {
  id?: string;
  title: string;
  intro?: string;
  tone?: 'dark' | 'light';
  className?: string;
}

/**
 * Replicates target's SectionHeading component (module 78049 in chunk 171z6837e80r1.js).
 * Renders a grid with scrambled headline and intro text.
 */
export function SectionHeading({
  id,
  title,
  intro,
  tone = 'dark',
  className = '',
}: SectionHeadingProps) {
  return (
    <div
      className={`grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-16 ${className}`}
    >
      <h2
        id={id}
        className="pb-[0.08em] text-[clamp(2rem,3.6vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.035em]"
      >
        <ScrambleText text={title} />
      </h2>
      {intro && (
        <p
          className={`max-w-[42ch] text-lg leading-relaxed ${
            tone === 'dark' ? 'text-white/70' : 'text-dim'
          }`}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
