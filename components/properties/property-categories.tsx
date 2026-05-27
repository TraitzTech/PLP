"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Chrome as Home,
  MapPin,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useTranslations } from "@/components/translation-provider";
import { propertyTypeService } from "@/services/propertyTypeService";
import type { PropertyType } from "@/services/types";

// Icon and image mapping for property types
const propertyTypeConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    image: string;
    color: string;
  }
> = {
  hotel: {
    icon: Building2,
    image: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg",
    color: "plp-purple",
  },
  house: {
    icon: Home,
    image: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg",
    color: "plp-pink",
  },
  land: {
    icon: MapPin,
    image: "https://images.pexels.com/photos/1095814/pexels-photo-1095814.jpeg",
    color: "plp-yellow",
  },
  apartment: {
    icon: Building2,
    image: "https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg",
    color: "plp-blue",
  },
  villa: {
    icon: Home,
    image: "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg",
    color: "plp-green",
  },
};

// Shimmer skeleton card component
function CategoryCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <Skeleton className="w-full h-64" />
      <CardContent className="p-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-32 mt-4" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PropertyCategories() {
  const pathname = usePathname();
  const t = useTranslations();
  const [categories, setCategories] = useState<
    (PropertyType & {
      icon: React.ComponentType<{ className?: string }>;
      image: string;
      color: string;
      count?: string;
    })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const locale = React.useMemo(() => {
    const first = pathname?.split("/").filter(Boolean)[0];
    return first === "en" || first === "fr" ? `/${first}` : "/en";
  }, [pathname]);

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        setIsLoading(true);
        const types = await propertyTypeService.getAllPropertyTypes();

        // Map property types with their config and limit to 8
        const countSuffix = t("categories.countSuffix", "properties");
        const categoriesWithConfig = types
          .slice(0, 6) // Limit to 6 property types
          .map((type) => ({
            ...type,
            icon:
              propertyTypeConfig[type.name.toLowerCase()]?.icon || Building2,
            image:
              propertyTypeConfig[type.name.toLowerCase()]?.image ||
              "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg",
            color:
              propertyTypeConfig[type.name.toLowerCase()]?.color ||
              "plp-purple",
            count: `${Math.floor(Math.random() * 10000) + 1000}+ ${countSuffix}`, // Placeholder count
          }));

        setCategories(categoriesWithConfig);
        setError(null);
      } catch (err) {
        console.error("Error fetching property types:", err);
        setError(t("categories.error", "Failed to load property types"));
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyTypes();
  }, [t]);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            {t("categories.title", "Explore Property Types")}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t(
              "categories.subtitle",
              "Whether you are looking for a luxury hotel, dream home, or investment land, we have the perfect property waiting for you.",
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {t("categories.empty", "No property types available")}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive =
                  category.status === 1 || category.status === true;
                return (
                  <Card
                    key={category.id}
                    className="group overflow-hidden border-0 shadow-lg"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className={`object-cover transition-transform duration-300 ${isActive ? "group-hover:scale-110" : ""}`}
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                      <div className="absolute top-4 left-4">
                        <div
                          className={`bg-${category.color} bg-opacity-90 text-white p-3 rounded-xl`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                      {!isActive && (
                        <div className="absolute top-4 right-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                          {t("categories.comingSoon", "Coming Soon")}
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-sm opacity-90">{category.count}</p>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <h3
                          className="text-2xl font-bold text-gray-900 group-hover:text-plp-purple transition-colors"
                          data-category-title
                        >
                          {category.name}
                        </h3>
                        <p className="text-gray-600">
                          {category.description ||
                            t(
                              "categories.placeholderDescription",
                              "Discover amazing properties in this category",
                            )}
                        </p>
                        {isActive ? (
                          <Link
                            href={`${locale}/search?type=${category.name.toLowerCase()}`}
                          >
                            <Button
                              variant="ghost"
                              className="group/btn p-0 h-auto font-semibold text-plp-purple hover:text-plp-pink transition-colors"
                            >
                              <span data-explore-button>
                                {t("categories.exploreButton", "Explore")}
                              </span>{" "}
                              {category.name}
                              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                          </Link>
                        ) : (
                          <p className="text-sm font-medium text-amber-700">
                            {t(
                              "categories.comingSoonNote",
                              "Coming soon for launch rollout",
                            )}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* View All Button */}
            <div className="flex justify-center mt-12">
              <Link href={`${locale}/search`}>
                <Button className="btn-primary group px-8 py-6 text-lg">
                  {t("categories.viewAll", "View All Property Types")}
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
