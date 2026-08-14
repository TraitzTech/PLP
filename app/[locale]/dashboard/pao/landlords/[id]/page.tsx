"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Building2, Plus, ChevronRight, MapPin } from "lucide-react";
import { paoService } from "@/services/paoService";
import type { Landlord, VerificationStatus } from "@/services/types";
import {
  PaoLandlordForm,
  buildLandlordPayload,
  emptyLandlordFormValues,
  landlordToFormValues,
  type PaoLandlordFormValues,
} from "@/components/dashboard/pao/pao-landlord-form";
import {
  ContactVerifiedBadge,
  MetaRow,
  PaoEmptyState,
  PaoErrorState,
  VerificationBadge,
  formatXAF,
} from "@/components/dashboard/pao/pao-ui";

export default function PaoLandlordDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const landlordId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [values, setValues] = useState<PaoLandlordFormValues>(emptyLandlordFormValues);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadLandlord = useCallback(async () => {
    if (!landlordId) return;
    setLoading(true);
    setFailed(false);
    try {
      const data = await paoService.getLandlord(landlordId);
      setLandlord(data);
      setValues(landlordToFormValues(data));
    } catch (error: any) {
      console.error("Error loading landlord:", error);
      toast.error(error?.message || "Failed to load this landlord");
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [landlordId]);

  useEffect(() => {
    loadLandlord();
  }, [loadLandlord]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landlordId || saving) return;

    const result = buildLandlordPayload(values);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    setSaving(true);
    try {
      const updated = await paoService.updateLandlord(landlordId, result.payload);
      // The update response may omit the nested listings, so keep what we have.
      setLandlord((prev) => ({ ...(prev ?? updated), ...updated, listings: updated.listings ?? prev?.listings }));
      setValues(landlordToFormValues(updated));
      toast.success("Landlord updated");
    } catch (error: any) {
      console.error("Error updating landlord:", error);
      toast.error(error?.message || "Failed to update the landlord");
    } finally {
      setSaving(false);
    }
  };

  const listings = landlord?.listings ?? [];

  return (
    <DashboardLayout userType="pao">
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="h-10 px-2" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 line-clamp-1">
              {loading ? "Landlord" : landlord?.name || "Landlord"}
            </h1>
            {!loading && landlord ? (
              <div className="mt-2 space-y-2">
                <MetaRow
                  phone={landlord.phone}
                  location={[landlord.city, landlord.location].filter(Boolean).join(", ") || null}
                />
                <ContactVerifiedBadge verified={landlord.contact_verified} />
              </div>
            ) : null}
          </div>
        </div>

        {failed && !loading ? (
          <PaoErrorState message="We couldn't load this landlord." onRetry={loadLandlord} />
        ) : loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : landlord ? (
          <>
            {/* Their properties */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5" />
                  Properties ({listings.length})
                </CardTitle>
                <Link href={`/dashboard/pao/properties/new?landlord_id=${landlord.id}`}>
                  <Button variant="outline" className="h-10">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 sm:pt-0">
                {listings.length === 0 ? (
                  <PaoEmptyState
                    icon={Building2}
                    title="No properties for this landlord yet"
                    action={
                      <Link href={`/dashboard/pao/properties/new?landlord_id=${landlord.id}`}>
                        <Button className="h-11 bg-plp-purple hover:bg-plp-purple/90 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Property for this landlord
                        </Button>
                      </Link>
                    }
                  />
                ) : (
                  <div className="divide-y sm:divide-y-0 sm:space-y-3">
                    {listings.map((listing) => {
                      const status = (listing as { verification_status?: VerificationStatus })
                        .verification_status;
                      return (
                        <Link key={listing.id} href={`/dashboard/pao/properties/${listing.id}`}>
                          <div className="p-4 sm:border sm:rounded-lg hover:bg-gray-50 transition cursor-pointer flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 line-clamp-1">
                                {listing.title || "Untitled property"}
                              </p>
                              <p className="flex items-center gap-1 text-sm text-gray-600 mt-1 line-clamp-1">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                {[listing.location, listing.city].filter(Boolean).join(", ") || "—"}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-sm font-semibold text-plp-purple">
                                  {formatXAF(listing.price)}
                                </span>
                                {status ? <VerificationBadge status={status} /> : null}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit */}
            <PaoLandlordForm
              values={values}
              onChange={setValues}
              onSubmit={handleSubmit}
              submitting={saving}
              submitLabel="Save changes"
              submittingLabel="Saving..."
            />
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
