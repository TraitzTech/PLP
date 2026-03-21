"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchForm } from "@/components/search/search-form";
import { ArrowRight, MapPin, Calendar, Users } from "lucide-react";
import { useTranslations } from "@/components/translation-provider";
import { homepageService } from "@/services/homepageService";

const formatCompact = (value: number): string => {
  if (value >= 1000000) return `${Math.round(value / 1000000)}M+`;
  if (value >= 1000) return `${Math.round(value / 1000)}K+`;
  return `${value}+`;
};

export function HeroSection() {
  const t = useTranslations();
  const [stats, setStats] = useState({
    properties: '50K+',
    customers: '25K+',
    cities: '100+',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await homepageService.getHomepageData();
        setStats({
          properties: formatCompact(data.portal_numbers?.properties_listed || 50000),
          customers: formatCompact(data.portal_numbers?.verified_agents || 25000),
          cities: formatCompact(data.portal_numbers?.cities_covered || 100),
        });
      } catch {
        setStats({ properties: '50K+', customers: '25K+', cities: '100+' });
      }
    };

    load();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-plp-gradient opacity-90 z-10"></div>
        <Image
          src="https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg"
          alt={t("hero.title", "Luxury property background")}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center space-y-8">
          {/* Hero Text */}
          <div className="space-y-4">
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight"
              data-hero-title
            >
              {t("hero.title", "Your Dream Property")}
              <span
                className="block text-plp-yellow"
                data-hero-subtitle
              >
                {t("hero.subtitle", "Awaits")}
              </span>
            </h1>
            <p
              className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
              data-hero-description
            >
              {t(
                "hero.description",
                "The easiest way to buy, rent, or sell property in Cameroon. Discover verified homes, land, and rentals."
              )}
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <SearchForm />
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-12 pt-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white">
                {stats.properties}
              </div>
              <div
                className="text-white/80"
                data-stats-label
              >
                {t("stats.properties.label", "Properties")}
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/30"></div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white">
                {stats.customers}
              </div>
              <div
                className="text-white/80"
                data-stats-label
              >
                {t("stats.customers.label", "Customers")}
              </div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/30"></div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white">
                {stats.cities}
              </div>
              <div
                className="text-white/80"
                data-stats-label
              >
                {t("stats.cities.label", "Cities")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="animate-bounce">
          <ArrowRight className="w-6 h-6 text-white rotate-90" />
        </div>
      </div>
    </section>
  );
}