"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/translation-provider";
import { ArrowRight, Building2, ShieldCheck, Users } from "lucide-react";

export function AgentCTASection() {
  const pathname = usePathname();
  const t = useTranslations();

  const locale = React.useMemo(() => {
    const first = pathname?.split("/").filter(Boolean)[0];
    return first === "en" || first === "fr" ? first : "en";
  }, [pathname]);

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 opacity-10 pointer-events-none">
        <div className="aspect-square w-[600px] rounded-full bg-gradient-to-br from-plp-purple to-plp-pink" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {t("agentCta.title", "Are you a Property Owner or Agent?")}
              </h2>
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                {t(
                  "agentCta.description",
                  "Building a verified property network across Cameroon, one genuine property at a time.",
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col items-start gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-plp-purple/10 text-plp-purple">
                  <Users className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  {t("agentCta.audienceTitle", "Growing Network")}
                </h4>
                <p className="text-xs text-gray-500">
                  {t(
                    "agentCta.audienceDesc",
                    "Present genuine properties to people searching for a home.",
                  )}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-plp-pink/10 text-plp-pink">
                  <Building2 className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  {t("agentCta.managementTitle", "Easy Management")}
                </h4>
                <p className="text-xs text-gray-500">
                  {t(
                    "agentCta.managementDesc",
                    "List and track properties with ease.",
                  )}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-plp-yellow/10 text-plp-yellow">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  {t("agentCta.leadsTitle", "Clear Property Details")}
                </h4>
                <p className="text-xs text-gray-500">
                  {t(
                    "agentCta.leadsDesc",
                    "Help seekers make informed decisions with accurate listing information.",
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${locale}/auth/signup?type=agent`}
                className="inline-block"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-plp-purple to-plp-pink hover:opacity-90 text-white font-bold py-6 px-8 rounded-full shadow-lg hover:shadow-xl transition-all group"
                >
                  {t("agentCta.cta", "Start Listing Today")}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=960&h=720&fit=crop&q=75"
                alt={t("agentCta.imageAlt", "Agents working together")}
                className="object-cover w-full h-full"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
