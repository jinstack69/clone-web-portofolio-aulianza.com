import React from 'react';
import { HeroSection } from '@/components/sections/hero-section';
import { MarqueeTicker } from '@/components/sections/marquee-ticker';
import { SelectedWork } from '@/components/sections/selected-work';
import { WhatIDo } from '@/components/sections/what-i-do';
import { QuranReminder } from '@/components/sections/quran-reminder';
import { PhysicsChips } from '@/components/sections/physics-chips';
import { RecentBlog } from '@/components/sections/recent-blog';
import { ContactCTA } from '@/components/sections/contact-cta';
import { BendingEdge } from '@/components/shared/bending-edge';

export default function HomePage() {
  return (
    <>
      {/* 1. S1: Hero Section (h: 900) */}
      <HeroSection />

      {/* Separator 1: S1 -> S2 */}
      <BendingEdge above="#070a1a" below="#f3f5f9" />

      {/* 2. S2: Infinite Marquee Ticker (h: 368) */}
      <MarqueeTicker />

      {/* Separator 2: S2 -> S3 */}
      <BendingEdge above="#f3f5f9" below="#070a1a" />

      {/* 3. S3: Selected Work Horizontal Pin Deck (h: 3082) */}
      <SelectedWork />

      {/* Separator 3: S3 -> S4 */}
      <BendingEdge above="#070a1a" below="#f3f5f9" />

      {/* 4. S4: What I do Multi-Stage Pinned Showcase (h: 5955) */}
      <WhatIDo />

      {/* Separator 4: S4 -> S5 */}
      <BendingEdge above="#f3f5f9" below="#f3f5f9" />

      {/* 5. S5: Quran Reminder Carousel (h: 713.5) */}
      <QuranReminder />

      {/* Separator 5: S5 -> S6 */}
      <BendingEdge above="#f3f5f9" below="#0b1030" />

      {/* 6. S6: 2D Physics Chips Playground (h: 846.6) */}
      <PhysicsChips />

      {/* Separator 6: S6 -> S7 */}
      <BendingEdge above="#0b1030" below="#f3f5f9" />

      {/* 7. S7: Recent Blog / Writing (h: 617) */}
      <RecentBlog />

      {/* 8. S8: Spacer before footer (h: 160) */}
      <div className="h-28 md:h-40" />

      {/* Separator 7: S8 -> Footer */}
      <BendingEdge above="#f3f5f9" below="#070a1a" />

      {/* 9. S9: Reusable Contact CTA Section */}
      <ContactCTA />
    </>
  );
}
