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

  const loadOptions = React.useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const [landlordList, typeResponse] = await Promise.all([
        paoService.getLandlords(),
        propertyTypeService.getAllPropertyTypes(),
      ]);
      setLandlords(Array.isArray(landlordList) ? landlordList : []);
      setPropertyTypes(normalizePropertyTypes(typeResponse));
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

    setSubmitting(true);
    try {
      const created = await paoService.createProperty(result.payload);
      toast.success("Property added. Now add some photos!");
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
            <p className="text-gray-600 text-sm mt-1">
              Keep it quick — you can add photos on the next screen.
            </p>
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
        ) : (
          <PaoPropertyForm
            values={values}
            onChange={setValues}
            onSubmit={handleSubmit}
            landlords={landlords}
            propertyTypes={propertyTypes}
            submitting={submitting}
            submitLabel="Add Property"
            submittingLabel="Adding..."
            onCancel={() => router.back()}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
