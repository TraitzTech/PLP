"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, ChevronRight, Building2, Search } from "lucide-react";
import { paoService } from "@/services/paoService";
import type { Landlord } from "@/services/types";
import {
  ContactVerifiedBadge,
  MetaRow,
  PaoEmptyState,
  PaoErrorState,
} from "@/components/dashboard/pao/pao-ui";

export default function PaoLandlordsPage() {
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState("");

  const fetchLandlords = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const data = await paoService.getLandlords();
      setLandlords(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error fetching landlords:", error);
      toast.error(error?.message || "Failed to load your landlords");
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLandlords();
  }, [fetchLandlords]);

  const term = search.trim().toLowerCase();
  const visible = term
    ? landlords.filter((landlord) =>
        [landlord.name, landlord.phone, landlord.city, landlord.location]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(term))
      )
    : landlords;

  return (
    <DashboardLayout userType="pao">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Landlords</h1>
            <p className="text-gray-600 mt-1">The property owners you work with.</p>
          </div>
          <Link href="/dashboard/pao/landlords/new">
            <Button className="w-full sm:w-auto h-11 bg-plp-purple hover:bg-plp-purple/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Landlord
            </Button>
          </Link>
        </div>

        {landlords.length > 0 ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="pl-10 h-11"
              placeholder="Search by name, phone or city"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        ) : null}

        {failed && !loading ? (
          <PaoErrorState message="We couldn't load your landlords." onRetry={fetchLandlords} />
        ) : loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <PaoEmptyState
                icon={Users}
                title={landlords.length === 0 ? "No landlords yet" : "No matches"}
                description={
                  landlords.length === 0
                    ? "Add a landlord first — you'll link properties to them."
                    : "Try a different search term."
                }
                action={
                  landlords.length === 0 ? (
                    <Link href="/dashboard/pao/landlords/new">
                      <Button className="h-11 bg-plp-purple hover:bg-plp-purple/90 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Landlord
                      </Button>
                    </Link>
                  ) : undefined
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {visible.map((landlord) => (
              <Link key={landlord.id} href={`/dashboard/pao/landlords/${landlord.id}`}>
                <Card className="hover:shadow-md hover:border-plp-purple/40 transition cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full bg-plp-purple/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-plp-purple font-semibold">
                          {landlord.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {landlord.name}
                          </h3>
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                        </div>

                        <div className="mt-1">
                          <MetaRow
                            phone={landlord.phone}
                            location={
                              [landlord.city, landlord.location].filter(Boolean).join(", ") || null
                            }
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className="flex items-center gap-1 text-sm text-gray-700">
                            <Building2 className="w-3.5 h-3.5" />
                            {landlord.listings_count ?? 0}{" "}
                            {(landlord.listings_count ?? 0) === 1 ? "property" : "properties"}
                          </span>
                          <ContactVerifiedBadge verified={landlord.contact_verified} />
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
