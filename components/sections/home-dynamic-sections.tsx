"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, Building2, MapPin, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/translation-provider";
import {
  homepageService,
  type HomepagePayload,
  type HomepageProperty,
} from "@/services/homepageService";

function getListingImageUrl(imagePath?: string): string {
  if (!imagePath) {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="380"%3E%3Crect fill="%23e5e7eb" width="600" height="380"/%3E%3Ctext x="50%25" y="50%25" font-size="20" text-anchor="middle" dy=".3em" fill="%239ca3af"%3ENo image%3C/text%3E%3C/svg%3E';
  }
  return `${process.env.NEXT_PUBLIC_API_URL}/../storage/listing_images/${imagePath}`;
}

function getProfilePhotoUrl(photoPath?: string | null): string | undefined {
  if (!photoPath) return undefined;
  const cleanPath = photoPath.replace("profile_photos/", "");
  return `${process.env.NEXT_PUBLIC_API_URL}/../storage/profile_photos/${cleanPath}`;
}

function formatCurrency(value?: number): string {
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(value || 0);
}

function formatCompact(value?: number): string {
  const safe = Number(value || 0);
  if (safe >= 1000000) return `${Math.round(safe / 1000000)}M+`;
  if (safe >= 1000) return `${Math.round(safe / 1000)}K+`;
  return `${safe}+`;
}

function localePrefix(pathname: string): string {
  const first = pathname.split("/").filter(Boolean)[0];
  return first === "en" || first === "fr" ? `/${first}` : "/en";
}

function PropertyMiniCard({
  property,
  locale,
  cityFallback,
}: {
  property: HomepageProperty;
  locale: string;
  cityFallback: string;
}) {
  const firstImage = property.images?.[0];
  const imagePath = firstImage?.image_path || firstImage?.image_url;

  return (
    <Link
      href={`${locale}/property/${property.id}`}
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={getListingImageUrl(imagePath)}
          alt={property.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized
        />
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-gray-900">
          {property.title}
        </h3>
        <p className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          {property.city || cityFallback}
        </p>
        <p className="text-sm font-semibold text-blue-700">
          {formatCurrency(property.discount_price || property.price)}
        </p>
      </div>
    </Link>
  );
}

export function HomeDynamicSections() {
  const pathname = usePathname();
  const t = useTranslations();
  const [data, setData] = useState<HomepagePayload | null>(null);
  const [loading, setLoading] = useState(true);

  const locale = useMemo(() => localePrefix(pathname), [pathname]);

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await homepageService.getHomepageData();
        setData(payload);
      } catch (error) {
        console.error("Failed to load homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const whyUsePoints = data?.why_use_points || [
    t("homeDynamic.whyUsePoints.0", "Verified Property Listings"),
    t(
      "homeDynamic.whyUsePoints.1",
      "Direct Contact with Trusted Agents and Landlords",
    ),
    t("homeDynamic.whyUsePoints.2", "Simple and Fast Property Search"),
    t("homeDynamic.whyUsePoints.3", "Safe and Transparent Property Discovery"),
  ];
  const citiesCovered = data?.cities_covered || ["Douala", "Bamenda"];
  const numbers = data?.portal_numbers || {
    properties_listed: 50000,
    verified_agents: 25000,
    cities_covered: 100,
    monthly_visitors: 0,
  };

  return (
    <>
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              {t("homeDynamic.whyUseEyebrow", "Why Use PLP")}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("homeDynamic.whyUseTitle", "Why Use Property Listing Portal?")}
            </h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            {whyUsePoints.map((point, index) => (
              <div
                key={`${point}-${index}`}
                className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4"
              >
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                <p className="text-sm font-medium text-gray-800">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 lg:w-5/12">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {t("homeDynamic.featuredAgentEyebrow", "Featured Agent")}
              </p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                {t("homeDynamic.featuredAgentTitle", "Agent of the Week")}
              </h3>

              {loading ? (
                <div className="mt-5 space-y-3">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ) : data?.featured_agent ? (
                <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full bg-emerald-100">
                      {getProfilePhotoUrl(data.featured_agent.profile_photo) ? (
                        <Image
                          src={
                            getProfilePhotoUrl(
                              data.featured_agent.profile_photo,
                            ) || ""
                          }
                          alt={data.featured_agent.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-emerald-700">
                          {data.featured_agent.name?.charAt(0)?.toUpperCase() ||
                            "A"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {data.featured_agent.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {data.featured_agent.city ||
                          t("homeDynamic.defaultCountry", "Cameroon")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg bg-white p-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500">
                        {t("homeDynamic.featuredAgentCityLabel", "City")}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {data.featured_agent.city ||
                          t("homeDynamic.notAvailable", "N/A")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        {t(
                          "homeDynamic.featuredAgentListingsLabel",
                          "Listings",
                        )}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {data.featured_agent.listings_count}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm text-gray-500">
                  {t(
                    "homeDynamic.featuredAgentEmpty",
                    "No featured agent available yet.",
                  )}
                </p>
              )}
            </div>

            <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 lg:w-7/12">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                    {t("homeDynamic.freshListingsEyebrow", "Fresh Listings")}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-gray-900">
                    {t("homeDynamic.recentTitle", "Recently Added Properties")}
                  </h3>
                </div>
                <Link href={`${locale}/search`}>
                  <Button variant="outline">
                    {t("homeDynamic.viewAll", "View all")}
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Skeleton className="h-56 rounded-xl" />
                  <Skeleton className="h-56 rounded-xl" />
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {(data?.recent_properties || [])
                    .slice(0, 4)
                    .map((property) => (
                      <PropertyMiniCard
                        key={property.id}
                        property={property}
                        locale={locale}
                        cityFallback={t(
                          "homeDynamic.cityNotSpecified",
                          "City not specified",
                        )}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              {t("homeDynamic.coverageEyebrow", "Current Coverage")}
            </p>
            <h3 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("homeDynamic.coverageTitle", "Cities Covered")}
            </h3>
            <p className="text-sm text-gray-600">
              {t(
                "homeDynamic.coverageSubtitle",
                "Starting with key cities and expanding steadily as we grow.",
              )}
            </p>
          </div>

          <div className="mb-10 flex flex-wrap gap-3">
            {citiesCovered.map((city) => (
              <span
                key={city}
                className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700"
              >
                {city}
              </span>
            ))}
          </div>

          <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8">
            <h4 className="text-2xl font-bold text-white">
              {t(
                "homeDynamic.statsTitle",
                "Property Listing Portal in Numbers",
              )}
            </h4>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                <Building2 className="h-5 w-5 text-amber-300" />
                <p className="mt-2 text-2xl font-bold text-white">
                  {formatCompact(numbers.properties_listed)}
                </p>
                <p className="text-sm text-slate-200">
                  {t("homeDynamic.statsProperties", "Properties Listed")}
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                <Users className="h-5 w-5 text-emerald-300" />
                <p className="mt-2 text-2xl font-bold text-white">
                  {formatCompact(numbers.verified_agents)}
                </p>
                <p className="text-sm text-slate-200">
                  {t("homeDynamic.statsCustomers", "Happy Customers")}
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                <MapPin className="h-5 w-5 text-blue-300" />
                <p className="mt-2 text-2xl font-bold text-white">
                  {formatCompact(numbers.cities_covered)}
                </p>
                <p className="text-sm text-slate-200">
                  {t("homeDynamic.statsCities", "Cities")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
