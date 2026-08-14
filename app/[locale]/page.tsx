"use client";

import { Navbar } from "@/components/navigation/navbar";
import { HeroSection } from "@/components/hero/hero-section";
import { AgentCTASection } from "@/components/sections/agent-cta-section";
import { SeekerSearchSection } from "@/components/sections/seeker-search-section";
import { FeaturedProperties } from "@/components/properties/featured-properties";
import { PropertyCategories } from "@/components/properties/property-categories";
import { HomeDynamicSections } from "@/components/sections/home-dynamic-sections";
import { PlatformGuideSection } from "@/components/sections/platform-guide-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { Footer } from "@/components/navigation/footer";
import { NewsletterPopup } from "@/components/ui/newsletter-popup";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ScrollReveal>
        <AgentCTASection />
      </ScrollReveal>
      <ScrollReveal>
        <SeekerSearchSection />
      </ScrollReveal>
      <ScrollReveal>
        <HomeDynamicSections />
      </ScrollReveal>
      <ScrollReveal>
        <PlatformGuideSection />
      </ScrollReveal>
      <ScrollReveal>
        <PropertyCategories />
      </ScrollReveal>
      <ScrollReveal>
        <FeaturedProperties />
      </ScrollReveal>
      <ScrollReveal>
        <NewsletterSection />
      </ScrollReveal>
      <Footer />
      <NewsletterPopup delay={5000} />
    </main>
  );
}
