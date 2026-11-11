'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MagneticButton } from '@/components/shared/magnetic-button';
import { useLocale } from '@/lib/locale-context';

export function Footer() {
  const { t } = useLocale();
  const [jakartaTime, setJakartaTime] = useState('');

  // Live Jakarta clock
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hourCycle: 'h23',
        }).format(now);
        setJakartaTime(timeStr);
      } catch {
        setJakartaTime('12:00:00');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#070a1a] pb-20 text-white md:pb-0">
      <div className="relative mx-auto max-w-[1280px] px-5 md:px-10">
        {/* Links Grid */}
        <div className="grid gap-14 border-t border-white/10 py-14 md:py-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <h3 className="text-xs font-bold text-white/60">
              {t('common', 'site.sayHello') || 'Say hello'}
            </h3>
            <a
              href="mailto:hello@aulianza.com"
              dir="ltr"
              className="mt-4 inline-block break-all bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-1 text-2xl font-bold tracking-tight transition-[background-size] duration-500 hover:bg-[length:100%_2px] md:text-3xl text-white"
            >
              hello@aulianza.com
            </a>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7 lg:col-start-7">
            <nav aria-label="Pages">
              <h3 className="text-xs font-bold text-white/60">
                {t('common', 'site.pages') || 'Pages'}
              </h3>
              <ul className="mt-3 space-y-0.5 text-[15px] md:mt-5 md:space-y-3">
                <li>
                  <Link
                    href="/portfolio"
                    className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-white/65 transition-[color,background-size] duration-500 hover:bg-[length:100%_1px] hover:text-white"
                  >
                    {t('common', 'nav.portfolio') || 'Portfolio'}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-white/65 transition-[color,background-size] duration-500 hover:bg-[length:100%_1px] hover:text-white"
                  >
                    {t('common', 'nav.about') || 'About'}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-white/65 transition-[color,background-size] duration-500 hover:bg-[length:100%_1px] hover:text-white"
                  >
                    {t('common', 'nav.blog') || 'Blog'}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-white/65 transition-[color,background-size] duration-500 hover:bg-[length:100%_1px] hover:text-white"
                  >
                    {t('common', 'nav.contact') || 'Contact'}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/under-the-hood"
                    className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-white/65 transition-[color,background-size] duration-500 hover:bg-[length:100%_1px] hover:text-white"
                  >
                    {t('common', 'nav.underTheHood') || 'Under the Hood'}
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label="More">
              <h3 className="text-xs font-bold text-white/60">
                {t('common', 'site.more') || 'More'}
              </h3>
              <ul className="mt-3 space-y-0.5 text-[15px] md:mt-5 md:space-y-3">
                <li>
                  <Link
                    href="/tools"
                    className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-white/65 transition-[color,background-size] duration-500 hover:bg-[length:100%_1px] hover:text-white"
                  >
                    {t('common', 'nav.tools') || 'Useful Tools'}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/stats"
                    className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-white/65 transition-[color,background-size] duration-500 hover:bg-[length:100%_1px] hover:text-white"
                  >
                    {t('common', 'nav.statistics') || 'Statistics'}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/uses"
                    className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-white/65 transition-[color,background-size] duration-500 hover:bg-[length:100%_1px] hover:text-white"
                  >
                    {t('common', 'nav.uses') || 'Daily Uses'}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guestbook"
                    className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-white/65 transition-[color,background-size] duration-500 hover:bg-[length:100%_1px] hover:text-white"
                  >
                    {t('common', 'nav.guestbook') || 'Guestbook'}
                  </Link>
                </li>
                <li>
                  <a
                    href="https://link.aulianza.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-white/65 transition-[color,background-size] duration-500 hover:bg-[length:100%_1px] hover:text-white"
                  >
                    {t('common', 'nav.links') || 'Links'}
                  </a>
                </li>
              </ul>
            </nav>

            <nav aria-label="Social">
              <h3 className="text-xs font-bold text-white/60">
                {t('common', 'site.social') || 'Social'}
              </h3>
              <ul className="mt-3 space-y-0.5 text-[15px] md:mt-5 md:space-y-3">
                <li>
                  <a
                    href="https://github.com/aulianza"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 text-white/65 transition-colors hover:text-white [&_svg]:h-4 [&_svg]:w-4"
                  >
                    <span className="transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </span>
                    Github
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/aulianza/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 text-white/65 transition-colors hover:text-white [&_svg]:h-4 [&_svg]:w-4"
                  >
                    <span className="transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                      <svg width="24" height="24" viewBox="0 0 448 512" fill="currentColor">
                        <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z" />
                      </svg>
                    </span>
                    Linkedin
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.threads.net/@aulianza"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 text-white/65 transition-colors hover:text-white [&_svg]:h-4 [&_svg]:w-4"
                  >
                    <span className="transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                      <svg width="24" height="24" viewBox="0 0 192 192" fill="currentColor">
                        <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
                        </svg>
                      </span>
                      Threads
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://instagram.com/aulianza"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2.5 text-white/65 transition-colors hover:text-white [&_svg]:h-4 [&_svg]:w-4"
                    >
                      <span className="transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                        </svg>
                      </span>
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://discord.com/users/690775182914224128"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2.5 text-white/65 transition-colors hover:text-white [&_svg]:h-4 [&_svg]:w-4"
                    >
                      <span className="transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.32 4.37A19.8 19.8 0 0 0 15.4 2.9a13.6 13.6 0 0 0-.63 1.28 18.4 18.4 0 0 0-5.53 0A13 13 0 0 0 8.6 2.9a19.7 19.7 0 0 0-4.93 1.48C.53 9.07-.32 13.65.1 18.17a19.9 19.9 0 0 0 6.03 3.04 14.7 14.7 0 0 0 1.29-2.1 12.9 12.9 0 0 1-2.03-.97c.17-.12.34-.25.5-.38a14.2 14.2 0 0 0 12.2 0c.16.13.33.26.5.38-.65.38-1.33.71-2.04.97.37.74.8 1.44 1.29 2.1a19.8 19.8 0 0 0 6.04-3.04c.5-5.24-.84-9.78-3.56-13.8ZM8.02 15.4c-1.18 0-2.16-1.09-2.16-2.42s.95-2.42 2.16-2.42c1.2 0 2.18 1.1 2.16 2.42 0 1.33-.96 2.42-2.16 2.42Zm7.97 0c-1.19 0-2.16-1.09-2.16-2.42s.95-2.42 2.16-2.42c1.2 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42Z" />
                        </svg>
                      </span>
                      Discord
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative border-t border-white/10">
          <div className="mx-auto grid max-w-[1280px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 text-sm text-white/50 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:px-10">
            <span>© {currentYear} Ryan Aulia</span>
            <span className="col-span-2 row-start-2 flex justify-center md:col-span-1 md:row-start-auto">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Jakarta
                <span dir="ltr" className="min-w-[4.5rem] font-bold tabular-nums text-white">
                  {jakartaTime || '12:00:00'}
                </span>
              </span>
            </span>
            <span className="inline-block justify-self-end">
              <MagneticButton strength={0.35}>
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="liquid-glass group inline-flex items-center gap-2 rounded-full px-4 py-2 font-bold text-white cursor-pointer"
                >
                  <span className="inline-block transition-transform duration-500 group-hover:-translate-y-0.5">
                    ↑
                  </span>
                  {t('common', 'site.backToTop') || 'Back to top'}
                </button>
              </MagneticButton>
            </span>
          </div>
        </div>
      </footer>
    );
  }
