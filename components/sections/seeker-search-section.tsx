"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "@/components/translation-provider";
import {
  ArrowRight,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

export function SeekerSearchSection() {
  const pathname = usePathname();
  const t = useTranslations();

  const locale = React.useMemo(() => {
    const first = pathname?.split("/").filter(Boolean)[0];
    return first === "en" || first === "fr" ? first : "en";
  }, [pathname]);

  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 sm:py-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-br from-plp-yellow/30 via-plp-pink/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-gradient-to-br from-plp-purple/20 via-indigo-400/20 to-transparent blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {t("seekerSearch.titleLead", "Find the")}{" "}
                <span className="text-plp-purple">
                  {t("seekerSearch.titleHighlight", "right property")}
                </span>{" "}
                {t("seekerSearch.titleTail", "without the guesswork")}
              </h2>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                {t(
                  "seekerSearch.description",
                  "Whether you are renting, buying, or investing, PLP makes it easy to search the full inventory and compare real listings in minutes.",
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-plp-purple/10 text-plp-purple">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {t("seekerSearch.smartTitle", "Smart Search")}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {t(
                      "seekerSearch.smartDesc",
                      "Filter by location, budget, and purpose in seconds.",
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-plp-pink/10 text-plp-pink">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {t("seekerSearch.filtersTitle", "Flexible Filters")}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {t(
                      "seekerSearch.filtersDesc",
                      "Refine by type, price range, and key amenities.",
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-plp-yellow/10 text-plp-yellow">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {t("seekerSearch.locationTitle", "Location First")}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {t(
                      "seekerSearch.locationDesc",
                      "Search by city, neighborhood, or specific address.",
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {t("seekerSearch.freshTitle", "Fresh Listings")}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {t(
                      "seekerSearch.freshDesc",
                      "See newly added properties as soon as they go live.",
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {["Douala", "Yaounde", "Bamenda", "Buea"].map((city) => (
                <Link
                  key={city}
                  href={`/${locale}/search?location=${encodeURIComponent(city)}`}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-plp-purple/40 hover:text-plp-purple"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-white/50 bg-white/80 p-6 shadow-2xl backdrop-blur">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-plp-purple/10 text-plp-purple">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t("seekerSearch.panelTitle", "Start your search")}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {t(
                      "seekerSearch.panelSubtitle",
                      "Leave fields empty to browse all listings.",
                    )}
                  </p>
                </div>
              </div>

              <form
                action={`/${locale}/search`}
                method="get"
                className="space-y-4"
              >
                <Input
                  name="location"
                  placeholder={t(
                    "seekerSearch.locationPlaceholder",
                    "City, neighborhood, or address",
                  )}
                  className="h-11"
                />
                <Input
                  name="type"
                  placeholder={t(
                    "seekerSearch.typePlaceholder",
                    "Property type (apartment, land, hotel)",
                  )}
                  className="h-11"
                />
                <select
                  name="purpose"
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-gray-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue=""
                >
                  <option value="">
                    {t("seekerSearch.purposeAny", "Any purpose")}
                  </option>
                  <option value="rent">
                    {t("seekerSearch.purposeRent", "For rent")}
                  </option>
                  <option value="purchase">
                    {t("seekerSearch.purposePurchase", "For purchase")}
                  </option>
                </select>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    name="priceMin"
                    type="number"
                    min={0}
                    placeholder={t("seekerSearch.minPrice", "Min price")}
                    className="h-11"
                  />
                  <Input
                    name="priceMax"
                    type="number"
                    min={0}
                    placeholder={t("seekerSearch.maxPrice", "Max price")}
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-plp-purple to-indigo-600 hover:from-plp-purple/90 hover:to-indigo-600/90 text-white font-semibold"
                >
                  {t("seekerSearch.submit", "Search inventory")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>{t("seekerSearch.noSignup", "No signup required.")}</span>
                <Link
                  href={`/${locale}/search`}
                  className="font-semibold text-plp-purple hover:text-plp-purple/80"
                >
                  {t("seekerSearch.browseAll", "Browse all listings")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
