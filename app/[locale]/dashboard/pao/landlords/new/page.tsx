"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { paoService } from "@/services/paoService";
import {
  PaoLandlordForm,
  buildLandlordPayload,
  emptyLandlordFormValues,
  type PaoLandlordFormValues,
} from "@/components/dashboard/pao/pao-landlord-form";

export default function NewLandlordPage() {
  const router = useRouter();
  const [values, setValues] = useState<PaoLandlordFormValues>(emptyLandlordFormValues);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const result = buildLandlordPayload(values);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    setSubmitting(true);
    try {
      const created = await paoService.createLandlord(result.payload);
      toast.success("Landlord added");
      router.push(`/dashboard/pao/landlords/${created.id}`);
    } catch (error: any) {
      console.error("Error creating landlord:", error);
      toast.error(error?.message || "Failed to add the landlord");
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add Landlord</h1>
            <p className="text-gray-600 text-sm mt-1">
              Name and phone are all you need to get started.
            </p>
          </div>
        </div>

        <PaoLandlordForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Add Landlord"
          submittingLabel="Adding..."
          onCancel={() => router.back()}
        />
      </div>
    </DashboardLayout>
  );
}
