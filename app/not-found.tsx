import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#070a1a] px-4 text-white">
      <h1 className="text-6xl font-bold tracking-tight text-[#ffb21e]">404</h1>
      <h2 className="mt-4 text-2xl font-bold">Page Not Found</h2>
      <p className="mt-2 text-center text-white/60">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-[#2f45ff] px-6 py-3 font-semibold text-white transition hover:bg-[#2537cc]"
      >
        Back to Home
      </Link>
    </div>
  );
}
