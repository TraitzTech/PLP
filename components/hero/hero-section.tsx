"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchForm } from "@/components/search/search-form";
import { ArrowRight, MapPin, Calendar, Users } from "lucide-react";
import { useTranslations } from "@/components/translation-provider";

export function HeroSection() {
  const t = useTranslations();

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
                "The trusted bridge for seamless property listing, booking, and discovery. Find your perfect stay from luxury hotels to dream homes."
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
                50K+
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
                25K+
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
                100+
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