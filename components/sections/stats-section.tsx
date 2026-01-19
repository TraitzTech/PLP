"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, MapPin, Star } from "lucide-react";
import { useTranslations } from "@/components/translation-provider";

export function StatsSection() {
  const t = useTranslations();
  const stats = [
    {
      icon: Building2,
      value: "50,000+",
      label: t("stats.properties.label", "Properties Listed"),
      description: t(
        "stats.properties.description",
        "Verified properties across all categories"
      ),
    },
    {
      icon: Users,
      value: "25,000+",
      label: t("stats.customers.label", "Happy Customers"),
      description: t(
        "stats.customers.description",
        "Satisfied customers worldwide"
      ),
    },
    {
      icon: MapPin,
      value: "100+",
      label: t("stats.cities.label", "Cities"),
      description: t(
        "stats.cities.description",
        "Major cities and destinations"
      ),
    },
    {
      icon: Star,
      value: "4.8",
      label: t("stats.rating.label", "Average Rating"),
      description: t(
        "stats.rating.description",
        "From verified customer reviews"
      ),
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-plp-purple via-plp-pink to-plp-yellow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            {t("stats.title", "Trusted by Thousands")}
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {t(
              "stats.subtitle",
              "Join a community of satisfied customers who have found their perfect properties with us."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-md border-white/20 text-center"
              >
                <CardContent className="p-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white/20 p-4 rounded-2xl">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {stat.label}
                      </div>
                      <div className="text-sm text-white/80">
                        {stat.description}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
