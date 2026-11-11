'use client';

import React from 'react';

const PALETTE = [
  { bg: '#2f45ff', a: '#ffffff', b: '#ffb21e', text: '#ffffff' },
  { bg: '#ffb21e', a: '#0f1630', b: '#2f45ff', text: '#0f1630' },
  { bg: '#0f1630', a: '#7483ff', b: '#ffb21e', text: '#ffffff' },
  { bg: '#7483ff', a: '#0f1630', b: '#ffffff', text: '#0f1630' },
  { bg: '#ffffff', a: '#2f45ff', b: '#0f1630', text: '#0f1630' },
  { bg: '#19c39c', a: '#0f1630', b: '#ffffff', text: '#0f1630' },
];

const motionBase =
  'transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] [transform-box:fill-box] [transform-origin:center]';

function hashSeed(t: string): number {
  let e = 0x811c9dc5;
  for (let i = 0; i < t.length; i++) {
    e ^= t.charCodeAt(i);
    e = Math.imul(e, 0x1000193);
  }
  return e >>> 0;
}

function Pattern({ seed, a, b }: { seed: number; a: string; b: string }) {
  let n = seed || 1;
  const rand = () => {
    n ^= n << 13;
    n ^= n >>> 17;
    n ^= n << 5;
    return ((n >>> 0) % 10000) / 10000;
  };
  const mode = seed % 4;

  if (mode === 0) {
    const cx = 260 + 80 * rand();
    const cy = 90 + 60 * rand();
    return (
      <g className={`${motionBase} group-hover:-translate-x-6 group-hover:rotate-12`}>
        {[150, 115, 80, 45].map((r, idx) => (
          <circle
            key={r}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={idx % 2 ? b : a}
            strokeWidth={14}
          />
        ))}
      </g>
    );
  }

  if (mode === 1) {
    const items = Array.from({ length: 8 }, (_, idx) => ({
      x: (idx % 4) * 80 + 80,
      y: 80 * Math.floor(idx / 4),
      rot: 90 * Math.floor(4 * rand()),
      c: rand() > 0.5 ? a : b,
    }));
    return (
      <g>
        {items.map((item, idx) => (
          <path
            key={idx}
            d="M0 0 H80 A80 80 0 0 1 0 80 Z"
            fill={item.c}
            transform={`translate(${item.x + 40} ${item.y + 40}) rotate(${item.rot}) translate(-40 -40)`}
            className={`${motionBase} ${idx % 2 ? 'group-hover:rotate-90' : 'group-hover:-rotate-90'}`}
          />
        ))}
      </g>
    );
  }

  if (mode === 2) {
    return (
      <g>
        <g className={`${motionBase} group-hover:translate-x-8`}>
          {Array.from({ length: 9 }, (_, idx) => (
            <rect
              key={idx}
              x={46 * idx - 40}
              y={-40}
              width={18}
              height={360}
              fill={a}
              transform="rotate(28 200 150)"
            />
          ))}
        </g>
        <circle
          cx={300 + 40 * rand()}
          cy={80 + 40 * rand()}
          r={70}
          fill={b}
          className={`${motionBase} group-hover:scale-125`}
        />
      </g>
    );
  }

  // mode === 3
  return (
    <g>
      <g className={`${motionBase} group-hover:-translate-y-4`}>
        {Array.from({ length: 70 }, (_, idx) => (
          <circle
            key={idx}
            cx={(idx % 10) * 40 + 20}
            cy={40 * Math.floor(idx / 10) + 20}
            r={4 + 4 * rand()}
            fill={a}
            opacity={0.85}
          />
        ))}
      </g>
      <path
        d={`M${200 + 120 * rand()} 0 a110 110 0 0 1 0 220 Z`}
        fill={b}
        className={`${motionBase} group-hover:rotate-180`}
      />
    </g>
  );
}

export interface ProjectMockupProps {
  title: string;
  seed?: string;
  slug?: string;
  index?: number;
  titleClassName?: string;
  className?: string;
  color?: string;
  textColor?: string;
}

export function ProjectMockup({
  title,
  seed,
  slug,
  index = 0,
  titleClassName,
  className = '',
  color,
  textColor,
}: ProjectMockupProps) {
  const seedKey = seed || slug || title || '';
  const hash = hashSeed(seedKey);
  const theme = PALETTE[index % PALETTE.length];
  const bg = color || theme.bg;
  const fg = textColor || theme.text;

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{ backgroundColor: bg }}
    >
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-x-0 top-0 h-[70%] w-full"
        aria-hidden="true"
      >
        <Pattern seed={hash} a={theme.a} b={theme.b} />
      </svg>
      <span
        aria-hidden="true"
        dir="ltr"
        className={`absolute -bottom-[0.14em] left-4 whitespace-nowrap ${
          titleClassName ?? 'text-[clamp(2.5rem,4.6vw,4.75rem)]'
        } font-bold leading-none tracking-[-0.05em] transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-2 group-hover:translate-x-2`}
        style={{ color: fg }}
      >
        {title}
      </span>
    </div>
  );
}
