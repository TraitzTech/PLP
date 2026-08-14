"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertTriangle, ImagePlus, Upload, User, Phone, Camera } from "lucide-react";
import { paoService } from "@/services/paoService";
import { propertyTypeService } from "@/services/propertyTypeService";
import type { Landlord, PaoProperty, PropertyType } from "@/services/types";
import {
  PaoPropertyForm,
  buildPropertyPayload,
  propertyToFormValues,
  emptyPropertyFormValues,
  type PaoPropertyFormValues,
} from "@/components/dashboard/pao/pao-property-form";
import {
  PaoErrorState,
  VerificationBadge,
  formatDate,
  formatXAF,
} from "@/components/dashboard/pao/pao-ui";
import { resolveListingImageObjectSrc } from "@/lib/listingMedia";

function normalizePropertyTypes(response: unknown): PropertyType[] {
  if (Array.isArray(response)) return response as PropertyType[];
  const data = (response as { data?: unknown } | null)?.data;
  if (Array.isArray(data)) return data as PropertyType[];
  return [];
}

export default function PaoPropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id;
  const propertyId = Array.isArray(rawId) ? rawId[0] : rawId;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [property, setProperty] = useState<PaoProperty | null>(null);
  const [values, setValues] = useState<PaoPropertyFormValues>(emptyPropertyFormValues);
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadAll = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setFailed(false);
    try {
      const [fetched, landlordList, typeResponse] = await Promise.all([
        paoService.getProperty(propertyId),
        paoService.getLandlords().catch(() => [] as Landlord[]),
        propertyTypeService.getAllPropertyTypes().catch(() => [] as PropertyType[]),
      ]);
      setProperty(fetched);
      setValues(propertyToFormValues(fetched));
      // Fall back to the property's own landlord so the form is still usable
      // if the landlord list request fails.
      const resolvedLandlords = Array.isArray(landlordList) ? [...landlordList] : [];
      if (resolvedLandlords.length === 0 && fetched.landlord) {
        resolvedLandlords.push(fetched.landlord);
      }
      setLandlords(resolvedLandlords);
      setPropertyTypes(normalizePropertyTypes(typeResponse));
    } catch (error: any) {
      console.error("Error loading property:", error);
      toast.error(error?.message || "Failed to load this property");
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || saving) return;

    const result = buildPropertyPayload(values);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    const wasNeedingCorrection = property?.verification_status === "needs_correction";

    setSaving(true);
    try {
      const updated = await paoService.updateProperty(propertyId, result.payload);
      setProperty(updated);
      setValues(propertyToFormValues(updated));
      toast.success(
        wasNeedingCorrection
          ? "Resubmitted for review — an admin will verify it again."
          : "Property updated"
      );
    } catch (error: any) {
      console.error("Error updating property:", error);
      toast.error(error?.message || "Failed to update the property");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(Array.from(e.target.files ?? []));
  };

  const handleUpload = async () => {
    if (!propertyId || selectedFiles.length === 0 || uploading) return;

    setUploading(true);
    try {
      await paoService.uploadPropertyImages(propertyId, selectedFiles);
      toast.success(
        `${selectedFiles.length} photo${selectedFiles.length === 1 ? "" : "s"} uploaded`
      );
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Refresh so the new photos show up in the grid.
      const refreshed = await paoService.getProperty(propertyId);
      setProperty(refreshed);
    } catch (error: any) {
      console.error("Error uploading property images:", error);
      toast.error(error?.message || "Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  const images = property?.images ?? [];

  return (
    <DashboardLayout userType="pao">
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="h-10 px-2" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 line-clamp-2">
              {loading ? "Property" : property?.title || "Untitled property"}
            </h1>
            {!loading && property ? (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <VerificationBadge status={property.verification_status} />
                <span className="text-sm font-semibold text-plp-purple">
                  {formatXAF(property.price)}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {failed && !loading ? (
          <PaoErrorState message="We couldn't load this property." onRetry={loadAll} />
        ) : loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Card>
              <CardContent className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-11 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : property ? (
          <>
            {/* Correction notice */}
            {property.verification_status === "needs_correction" ? (
              <Card className="border-red-300 bg-red-50">
                <CardContent className="p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">This listing needs correction</p>
                    <p className="text-sm text-red-800 mt-1 whitespace-pre-line">
                      {property.verification_notes ||
                        "An admin asked for changes. Update the details below and save to resubmit."}
                    </p>
                    <p className="text-xs text-red-700 mt-2">
                      Saving your changes automatically resubmits it for review.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {property.verification_status === "rejected" && property.verification_notes ? (
              <Card className="border-amber-300 bg-amber-50">
                <CardContent className="p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Rejected</p>
                    <p className="text-sm text-amber-800 mt-1 whitespace-pre-line">
                      {property.verification_notes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Landlord summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Landlord
                </CardTitle>
              </CardHeader>
              <CardContent>
                {property.landlord ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{property.landlord.name}</p>
                      <p className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <Phone className="w-3.5 h-3.5" />
                        {property.landlord.phone}
                      </p>
                    </div>
                    <Link href={`/dashboard/pao/landlords/${property.landlord.id}`}>
                      <Button variant="outline" className="h-10">
                        View landlord
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Landlord details unavailable.</p>
                )}
                {property.verified_at ? (
                  <p className="text-xs text-gray-500 mt-4">
                    Verified on {formatDate(property.verified_at)}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera className="w-5 h-5" />
                  Photos ({images.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((image) => {
                      const src = resolveListingImageObjectSrc(image);
                      return (
                        <div
                          key={image.id}
                          className="aspect-square rounded-lg overflow-hidden border bg-gray-100"
                        >
                          {src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={src}
                              alt={image.alt_text || property.title || "Property photo"}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImagePlus className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No photos yet. Adding photos helps this listing get verified faster.
                  </p>
                )}

                <div className="space-y-3 pt-2 border-t">
                  <input
                    ref={fileInputRef}
                    id="propertyPhotos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-plp-purple/10 file:text-plp-purple hover:file:bg-plp-purple/20"
                  />
                  {selectedFiles.length > 0 ? (
                    <p className="text-sm text-gray-600">
                      {selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"} selected
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    className="h-11 w-full sm:w-auto bg-plp-purple hover:bg-plp-purple/90 text-white"
                    onClick={handleUpload}
                    disabled={uploading || selectedFiles.length === 0}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload photos"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Edit form */}
            <PaoPropertyForm
              values={values}
              onChange={setValues}
              onSubmit={handleSubmit}
              landlords={landlords}
              propertyTypes={propertyTypes}
              submitting={saving}
              submitLabel={
                property.verification_status === "needs_correction"
                  ? "Save & resubmit"
                  : "Save changes"
              }
              submittingLabel="Saving..."
            />
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
