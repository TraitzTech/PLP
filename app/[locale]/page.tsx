'use client'

import { Navbar } from '@/components/navigation/navbar';
import { HeroSection } from '@/components/hero/hero-section';
import { FeaturedProperties } from '@/components/properties/featured-properties';
import { PropertyCategories } from '@/components/properties/property-categories';
import { HomeDynamicSections } from '@/components/sections/home-dynamic-sections';
import { PlatformGuideSection } from '@/components/sections/platform-guide-section';
import { NewsletterSection } from '@/components/sections/newsletter-section';
import { Footer } from '@/components/navigation/footer';
import { NewsletterPopup } from '@/components/ui/newsletter-popup';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <HomeDynamicSections />
      <PlatformGuideSection showPopularSearches />
      <PropertyCategories />
      <FeaturedProperties />
      <NewsletterSection />
      <Footer />
      <NewsletterPopup delay={5000} />
    </main>
  );
}