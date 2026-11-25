"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { paoService } from "@/services/paoService";
import { propertyTypeService } from "@/services/propertyTypeService";
import type { Landlord, PropertyType } from "@/services/types";
import {
  PaoPropertyForm,
  buildPropertyPayload,
  emptyPropertyFormValues,
  type PaoPropertyFormValues,
} from "@/components/dashboard/pao/pao-property-form";
import { PaoErrorState } from "@/components/dashboard/pao/pao-ui";
import { PaoCaptureEvidence, type PaoGpsCapture } from "@/components/dashboard/pao/pao-capture-evidence";
import type { PaoProperty } from "@/services/types";

/** The property-types endpoint has returned both a bare array and a wrapped object historically. */
function normalizePropertyTypes(response: unknown): PropertyType[] {
  if (Array.isArray(response)) return response as PropertyType[];
  const data = (response as { data?: unknown } | null)?.data;
  if (Array.isArray(data)) return data as PropertyType[];
  return [];
}

export default function NewPropertyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const landlordIdParam = searchParams.get("landlord_id");

  const [values, setValues] = useState<PaoPropertyFormValues>({
    ...emptyPropertyFormValues,
    landlord_id: landlordIdParam ?? "",
  });
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [gps, setGps] = useState<PaoGpsCapture | null>(null);
  const [submissionsToday, setSubmissionsToday] = useState(0);

  const loadOptions = React.useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const [landlordList, typeResponse, paoProperties] = await Promise.all([
        paoService.getLandlords(),
        propertyTypeService.getAllPropertyTypes(),
        paoService.getProperties().catch(() => [] as PaoProperty[]),
      ]);
      setLandlords(Array.isArray(landlordList) ? landlordList : []);
      setPropertyTypes(normalizePropertyTypes(typeResponse));
      const today = new Date().toDateString();
      setSubmissionsToday(paoProperties.filter((property) => property.created_at && new Date(property.created_at).toDateString() === today).length);
    } catch (error: any) {
      console.error("Error loading property form options:", error);
      toast.error(error?.message || "Failed to load the form");
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  // Keep the pre-selected landlord in sync once the list arrives.
  useEffect(() => {
    if (!landlordIdParam) return;
    const exists = landlords.some((landlord) => String(landlord.id) === landlordIdParam);
    if (exists) {
      setValues((prev) => (prev.landlord_id ? prev : { ...prev, landlord_id: landlordIdParam }));
    }
  }, [landlordIdParam, landlords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const result = buildPropertyPayload(values);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    if (photos.length < 3 || photos.length > 5) {
      toast.error("Capture three to five recent property photos.");
      return;
    }
    if (!video || videoDuration < 10 || videoDuration > 45) {
      toast.error("Record a live camera video between 10 and 45 seconds.");
      return;
    }
    if (!gps || gps.accuracy > 100) {
      toast.error("Capture an accurate GPS position (100 metres or better) at the property.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await paoService.createProperty({
        ...result.payload,
        photos,
        photo_capture_times: photos.map((photo) => new Date(photo.lastModified).toISOString()),
        live_video: video,
        live_video_duration: videoDuration,
        live_video_capture_method: "camera",
        latitude: gps.latitude,
        longitude: gps.longitude,
        gps_accuracy_m: gps.accuracy,
      });
      toast.success("Property submitted and pending Quality Assurance.");
      router.push(`/dashboard/pao/properties/${created.id}`);
    } catch (error: any) {
      console.error("Error creating property:", error);
      toast.error(error?.message || "Failed to add the property");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout userType="pao">
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="h-10 px-2" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add Property</h1>
            <p className="text-gray-600 text-sm mt-1">Capture complete property details and on-site evidence. New submissions await Quality Assurance.</p>
          </div>
        </div>

        {failed && !loading ? (
          <PaoErrorState message="We couldn't load the form." onRetry={loadOptions} />
        ) : loading ? (
          <Card>
            <CardContent className="p-6 space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-11 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : submissionsToday >= 3 ? (
            <Card className="border-amber-200 bg-amber-50"><CardContent className="p-5 text-sm text-amber-900">You have reached the limit of three property submissions for today. You can submit again tomorrow.</CardContent></Card>
          ) : <PaoPropertyForm
            values={values}
            onChange={setValues}
            onSubmit={handleSubmit}
            landlords={landlords}
            propertyTypes={propertyTypes}
            submitting={submitting}
            submitLabel="Add Property"
            submittingLabel="Adding..."
            onCancel={() => router.back()}
            canSubmit={!submitting && photos.length >= 3 && photos.length <= 5 && Boolean(video) && videoDuration >= 10 && videoDuration <= 45 && Boolean(gps) && (gps?.accuracy ?? 101) <= 100 && !("error" in buildPropertyPayload(values))}
            evidenceContent={<PaoCaptureEvidence photos={photos} onPhotosChange={setPhotos} video={video} onVideoChange={setVideo} duration={videoDuration} onDurationChange={setVideoDuration} gps={gps} onGpsChange={setGps} />}
          />}
      </div>
    </DashboardLayout>
  );
}
