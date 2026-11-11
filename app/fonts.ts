import localFont from 'next/font/local';

export const aulianzaSans = localFont({
  src: [
    {
      path: '../public/fonts/AulianzaSans/AulianzaSans-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/AulianzaSans/AulianzaSans-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/AulianzaSans/AulianzaSans-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-aulianza-sans',
  display: 'swap',
  adjustFontFallback: 'Arial',
});

export const notoSansArabic = localFont({
  src: [
    {
      path: '../public/fonts/NotoSansArabic/NotoSansArabic-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-noto-arabic',
  display: 'swap',
});
