'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/lib/locale-context';

interface NavbarProps {
  currentPath?: string;
}

function RollingText({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}

export function Navbar({ currentPath = '/' }: NavbarProps) {
  const { locale, toggleLocale, t } = useLocale();
  const [scrollY, setScrollY] = useState(0);
  const [hideHeader, setHideHeader] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const movingTimer = useRef<NodeJS.Timeout | null>(null);

  const mainLinks = [
    { id: 'work', href: '/portfolio', label: t('common', 'nav.portfolio') || 'Portfolio' },
    { id: 'about', href: '/about', label: t('common', 'nav.about') || 'About' },
    { id: 'writing', href: '/blog', label: t('common', 'nav.blog') || 'Blog' },
    { id: 'contact', href: '/contact', label: t('common', 'nav.contact') || 'Contact' },
  ];

  const moreLinks = [
    { id: 'underTheHood', href: '/under-the-hood', label: t('common', 'nav.underTheHood') || 'Under the Hood' },
    { id: 'tools', href: '/tools', label: t('common', 'nav.tools') || 'Useful Tools' },
    { id: 'statistics', href: '/stats', label: t('common', 'nav.statistics') || 'Statistics' },
    { id: 'uses', href: '/uses', label: t('common', 'nav.uses') || 'Daily Uses' },
    { id: 'guestbook', href: '/guestbook', label: t('common', 'nav.guestbook') || 'Guestbook' },
    { id: 'links', href: '/links', label: t('common', 'nav.links') || 'Links' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrollY(currentY);

      // Hide header when scrolling down past 240px, reveal when scrolling up
      if (currentY > 240 && currentY > lastScrollY.current) {
        setHideHeader(true);
      } else {
        setHideHeader(false);
      }
      lastScrollY.current = currentY;

      // Add glass-moving state during active scroll
      setIsMoving(true);
      if (movingTimer.current) clearTimeout(movingTimer.current);
      movingTimer.current = setTimeout(() => {
        setIsMoving(false);
      }, 180);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (movingTimer.current) clearTimeout(movingTimer.current);
    };
  }, []);

  // Lock scroll when mobile drawer is open
  useEffect(() => {
    if (!isMoreOpen || typeof window === 'undefined') return;
    if (window.innerWidth >= 768) return;

    const originalOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    window.__lenis?.stop();

    return () => {
      document.documentElement.style.overflow = originalOverflow;
      window.__lenis?.start();
    };
  }, [isMoreOpen]);

  // Close dropdown on click outside or escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMoreOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current?.contains(target) ||
        drawerRef.current?.contains(target)
      ) {
        return;
      }
      setIsMoreOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  // Compute smooth spring width and glass tint interpolation
  const progress = Math.min(Math.max(scrollY / 220, 0), 1);
  const currentMaxWidth = Math.round(1280 - progress * (1280 - 920));
  const currentTintAlpha = (0.18 + progress * (0.45 - 0.18)).toFixed(3);

  const isLinkActive = (href: string) =>
    currentPath === href || (href !== '/' && currentPath.startsWith(`${href}/`));

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[120] focus:rounded-lg focus:bg-[#2f45ff] focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      {/* Top Fixed Header */}
      <motion.header
        initial={false}
        animate={{ y: hideHeader ? -120 : 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="fixed inset-x-0 top-0 z-[100] px-3 pt-3 md:px-6 md:pt-5"
        style={{ viewTransitionName: 'site-header' }}
      >
        <div
          ref={headerRef}
          className={`liquid-glass liquid-glass-dark mx-auto flex items-center gap-4 rounded-full px-3 py-2 text-white md:px-4 ${
            isMoving ? 'glass-moving' : 'transition-[max-width,background-color] duration-300 ease-out'
          }`}
          style={{
            maxWidth: `${currentMaxWidth}px`,
            backgroundColor: `rgba(7, 10, 26, ${currentTintAlpha})`,
            ['--glass-tint' as any]: `rgba(7, 10, 26, ${currentTintAlpha})`,
          }}
        >
          {/* Avatar and Name */}
          <Link
            href="/"
            aria-label="Ryan Aulia"
            className="group flex items-center gap-2.5 ps-1 text-lg font-bold"
          >
            <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-[#2f45ff] transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-110">
              <Image
                src="/images/avatar-96.webp"
                alt="Ryan Aulia"
                width={36}
                height={36}
                className="h-full w-full object-cover"
                priority
              />
            </span>
            <span className="hidden sm:block">
              <RollingText>Ryan Aulia</RollingText>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav aria-label="Main" className="mx-auto hidden items-center gap-1 md:flex">
            {mainLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative rounded-full font-medium transition-colors px-4 py-2 text-[15px] ${
                    active ? 'text-[#070a1a]' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-full bg-white"
                    />
                  )}
                  <span className="relative">
                    <RollingText>{link.label}</RollingText>
                  </span>
                </Link>
              );
            })}

            {/* Desktop More Menu */}
            <div
              ref={dropdownRef}
              className="relative"
              onPointerEnter={(e) => e.pointerType === 'mouse' && setIsMoreOpen(true)}
              onPointerLeave={(e) => e.pointerType === 'mouse' && setIsMoreOpen(false)}
            >
              <button
                type="button"
                aria-expanded={isMoreOpen}
                aria-haspopup="menu"
                onClick={() => setIsMoreOpen((prev) => !prev)}
                className={`group relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
                  moreLinks.some((l) => isLinkActive(l.href))
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <RollingText>{t('common', 'nav.more') || 'More'}</RollingText>
                <motion.span
                  animate={{ rotate: isMoreOpen ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="text-[10px]"
                >
                  ▾
                </motion.span>
              </button>

              <AnimatePresence>
                {isMoreOpen && (
                  <div className="absolute start-1/2 top-full z-10 pt-3 -translate-x-1/2">
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -8, scale: 0.96, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -6, scale: 0.97, filter: 'blur(4px)' }}
                      transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                      className="[transform-origin:top_center]"
                    >
                      <ul className="liquid-glass liquid-glass-dark grid w-64 gap-0.5 rounded-3xl p-2 [--glass-tint:rgba(7,10,26,0.86)]">
                        {moreLinks.map((link, idx) => {
                          const active = isLinkActive(link.href);
                          return (
                            <motion.li
                              key={link.id}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.03 * idx, duration: 0.3 }}
                            >
                              <Link
                                href={link.href}
                                role="menuitem"
                                className={`flex items-center justify-between rounded-2xl px-4 py-2.5 text-[15px] font-medium transition-colors hover:bg-white/10 ${
                                  active ? 'text-white' : 'text-white/75'
                                }`}
                              >
                                {link.label}
                                {active && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#ffb21e]" />
                                )}
                              </Link>
                            </motion.li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Action: Language Switch Toggle */}
          <div className="ms-auto flex items-center gap-2 md:ms-0">
            <button
              type="button"
              role="switch"
              aria-checked={locale === 'ar'}
              aria-label={t('common', 'language.switchLabel') || 'Change language'}
              dir="ltr"
              onClick={toggleLocale}
              className="liquid-glass liquid-glass-dark relative flex h-10 w-[76px] shrink-0 items-center justify-between rounded-full px-2.5 cursor-pointer"
            >
              {/* UK Flag (Left) */}
              <span
                className={`h-5 w-5 overflow-hidden rounded-full transition-opacity duration-300 ${
                  locale === 'en' ? 'opacity-0' : 'opacity-45 grayscale'
                }`}
              >
                <img
                  data-testid="circle-country-flag"
                  alt=""
                  height="20"
                  width="20"
                  src="https://react-circle-flags.pages.dev/gb.svg"
                />
              </span>

              {/* Saudi Arabia Flag (Right) */}
              <span
                className={`h-5 w-5 overflow-hidden rounded-full transition-opacity duration-300 ${
                  locale === 'ar' ? 'opacity-0' : 'opacity-45 grayscale'
                }`}
              >
                <img
                  data-testid="circle-country-flag"
                  alt=""
                  height="20"
                  width="20"
                  src="https://react-circle-flags.pages.dev/sa.svg"
                />
              </span>

              {/* Sliding Active Pill Knob */}
              <motion.span
                initial={false}
                animate={{ x: locale === 'ar' ? 36 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute start-1 top-1 h-8 w-8 overflow-hidden rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.6)] ring-2 ring-white/70"
              >
                <img
                  data-testid="circle-country-flag"
                  alt=""
                  height="32"
                  width="32"
                  className="h-full w-full"
                  src={
                    locale === 'ar'
                      ? 'https://react-circle-flags.pages.dev/sa.svg'
                      : 'https://react-circle-flags.pages.dev/gb.svg'
                  }
                />
                <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(255,255,255,0.55),transparent_60%)]" />
              </motion.span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Floating Bottom Dock Navigation */}
      <nav
        aria-label="Main"
        className="liquid-glass liquid-glass-dark !fixed inset-x-3 bottom-3 z-[100] flex gap-1 rounded-full p-1.5 text-white md:hidden"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        {mainLinks.map((link) => {
          const active = isLinkActive(link.href);
          return (
            <Link
              key={link.id}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={`group relative rounded-full font-medium transition-colors min-w-0 flex-1 truncate px-1 py-[13px] text-center text-[12px] ${
                active ? 'text-[#070a1a]' : 'text-white/70 hover:text-white'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="dock-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-white"
                />
              )}
              <span className="relative">
                <RollingText>{link.label}</RollingText>
              </span>
            </Link>
          );
        })}

        {/* Mobile More Button */}
        <button
          type="button"
          aria-expanded={isMoreOpen}
          onClick={() => setIsMoreOpen((prev) => !prev)}
          className={`relative min-w-0 flex-1 truncate rounded-full px-1 py-[13px] text-center text-[12px] font-medium transition-colors cursor-pointer ${
            isMoreOpen || moreLinks.some((l) => isLinkActive(l.href))
              ? 'text-white'
              : 'text-white/70'
          }`}
        >
          {t('common', 'nav.more') || 'More'}
        </button>
      </nav>

      {/* Mobile More Drawer Popup */}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            ref={drawerRef}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
            className="fixed inset-x-3 bottom-20 z-[100] md:hidden"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          >
            <ul className="liquid-glass liquid-glass-dark grid grid-cols-2 gap-1 rounded-[28px] p-2 text-white">
              {moreLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      onClick={() => setIsMoreOpen(false)}
                      className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors active:bg-white/10 ${
                        active ? 'bg-white/10 text-white' : 'text-white/80'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
