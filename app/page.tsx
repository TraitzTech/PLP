'use client'

import { Navbar } from '@/components/navigation/navbar';
import { HeroSection } from '@/components/hero/hero-section';
import { FeaturedProperties } from '@/components/properties/featured-properties';
import { PropertyCategories } from '@/components/properties/property-categories';
import { StatsSection } from '@/components/sections/stats-section';
import { NewsletterSection } from '@/components/sections/newsletter-section';
import { Footer } from '@/components/navigation/footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <PropertyCategories />
      <FeaturedProperties />
      <StatsSection />
      <NewsletterSection />
      <Footer />
    </main>
  );
}