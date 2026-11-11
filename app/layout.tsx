import type { Metadata } from 'next';
import './globals.css';
import { aulianzaSans, notoSansArabic } from './fonts';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { LiquidFilter } from '@/components/shared/liquid-filter';
import { SmoothScroll } from '@/components/shared/smooth-scroll';
import { LocaleProvider } from '@/lib/locale-context';

export const metadata: Metadata = {
  metadataBase: new URL('https://aulianza.com'),
  title: 'Ryan Aulia — Software & Product Engineer',
  description: 'I build web, mobile and AI products that feel fast and simple. Software and product engineer with 11 years of shipping.',
  keywords: ['Software Engineer', 'Product Engineer', 'AI Agents', 'Next.js', 'React', 'Frontend', 'TypeScript'],
  authors: [{ name: 'Ryan Aulia', url: 'https://aulianza.com' }],
  openGraph: {
    title: 'Ryan Aulia — Software & Product Engineer',
    description: 'I build web, mobile and AI products that feel fast and simple.',
    url: 'https://aulianza.com',
    siteName: 'Ryan Aulia',
    images: [
      {
        url: '/og-aulianza.png',
        width: 1200,
        height: 630,
        alt: 'Ryan Aulia',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/images/avatar-96.webp',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${aulianzaSans.variable} ${notoSansArabic.variable}`}>
      <body className="min-h-screen antialiased selection:bg-[#2f45ff] selection:text-white">
        <SmoothScroll />
        <LiquidFilter />
        <LocaleProvider>
          <div id="__next">
            <div className="relative isolate">
              <div className="min-h-screen">
                <Navbar />
                <main id="main">
                  {children}
                </main>
                <Footer />
              </div>
            </div>
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
