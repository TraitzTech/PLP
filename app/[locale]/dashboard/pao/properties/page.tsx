"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Plus, BedDouble, Bath, MapPin, ChevronRight } from "lucide-react";
import { paoService } from "@/services/paoService";
import type { PaoProperty, VerificationStatus } from "@/services/types";
import {
  formatXAF,
  PaoEmptyState,
  PaoErrorState,
  VerificationBadge,
} from "@/components/dashboard/pao/pao-ui";
import { cn } from "@/lib/utils";

const FILTERS: { key: "all" | VerificationStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "verified", label: "Verified" },
  { key: "needs_correction", label: "Needs fix" },
];

export default function PaoPropertiesPage() {
  const [properties, setProperties] = useState<PaoProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<"all" | VerificationStatus>("all");

  const fetchProperties = useCallback(async (status: "all" | VerificationStatus) => {
    setLoading(true);
    setFailed(false);
    try {
      const data = await paoService.getProperties(
        status === "all" ? undefined : { verification_status: status }
      );
      setProperties(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error fetching PAO properties:", error);
      toast.error(error?.message || "Failed to load your properties");
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties(filter);
  }, [fetchProperties, filter]);

  return (
    <DashboardLayout userType="pao">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Properties</h1>
            <p className="text-gray-600 mt-1">Properties you have acquired for the platform.</p>
          </div>
          <Link href="/dashboard/pao/properties/new">
            <Button className="w-full sm:w-auto h-11 bg-plp-purple hover:bg-plp-purple/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={cn(
                "px-4 h-10 rounded-full text-sm font-medium whitespace-nowrap border transition",
                filter === item.key
                  ? "bg-plp-purple text-white border-plp-purple"
                  : "bg-white text-gray-700 border-gray-200 hover:border-plp-purple/40"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {failed && !loading ? (
          <PaoErrorState
            message="We couldn't load your properties."
            onRetry={() => fetchProperties(filter)}
          />
        ) : loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <PaoEmptyState
                icon={Building2}
                title={filter === "all" ? "No properties yet" : "Nothing in this filter"}
                description={
                  filter === "all"
                    ? "Add your first property to start earning acquisition bonuses."
                    : "Try a different filter to see your other properties."
                }
                action={
                  filter === "all" ? (
                    <Link href="/dashboard/pao/properties/new">
                      <Button className="h-11 bg-plp-purple hover:bg-plp-purple/90 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Property
                      </Button>
                    </Link>
                  ) : undefined
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {properties.map((property) => (
              <Link key={property.id} href={`/dashboard/pao/properties/${property.id}`}>
                <Card className="hover:shadow-md hover:border-plp-purple/40 transition cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-plp-purple to-plp-pink flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-white opacity-90" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">
                            {property.title || "Untitled property"}
                          </h3>
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-600">
                          {property.property_type?.name ? (
                            <span>{property.property_type.name}</span>
                          ) : null}
                          {property.bedrooms != null ? (
                            <span className="flex items-center gap-1">
                              <BedDouble className="w-3.5 h-3.5" />
                              {property.bedrooms}
                            </span>
                          ) : null}
                          {property.bathrooms != null ? (
                            <span className="flex items-center gap-1">
                              <Bath className="w-3.5 h-3.5" />
                              {property.bathrooms}
                            </span>
                          ) : null}
                        </div>

                        <p className="flex items-center gap-1 text-sm text-gray-600 mt-1 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          {[property.location, property.city].filter(Boolean).join(", ") || "—"}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                          <span className="text-sm font-semibold text-plp-purple">
                            {formatXAF(property.price)}
                          </span>
                          <VerificationBadge status={property.verification_status} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
