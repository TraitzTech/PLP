"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, User } from "lucide-react";
import type { Landlord, LandlordRequest } from "@/services/types";

export type PaoLandlordFormValues = {
  name: string;
  phone: string;
  email: string;
  region: string;
  city: string;
  location: string;
  contact_verified: boolean;
  notes: string;
};

export const emptyLandlordFormValues: PaoLandlordFormValues = {
  name: "",
  phone: "",
  email: "",
  region: "",
  city: "",
  location: "",
  contact_verified: false,
  notes: "",
};

export function landlordToFormValues(landlord: Landlord): PaoLandlordFormValues {
  return {
    name: landlord.name ?? "",
    phone: landlord.phone ?? "",
    email: landlord.email ?? "",
    region: landlord.region ?? "",
    city: landlord.city ?? "",
    location: landlord.location ?? "",
    contact_verified: Boolean(landlord.contact_verified),
    notes: landlord.notes ?? "",
  };
}

/** Validate + convert. Optional text fields are sent as null when blank. */
export function buildLandlordPayload(
  values: PaoLandlordFormValues
): { payload: LandlordRequest } | { error: string } {
  if (!values.name.trim()) return { error: "Landlord name is required." };
  if (!values.phone.trim()) return { error: "Phone number is required." };

  const orNull = (value: string) => (value.trim() === "" ? null : value.trim());

  return {
    payload: {
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: orNull(values.email),
      region: orNull(values.region),
      city: orNull(values.city),
      location: orNull(values.location),
      contact_verified: values.contact_verified,
      notes: orNull(values.notes),
    },
  };
}

interface PaoLandlordFormProps {
  values: PaoLandlordFormValues;
  onChange: (values: PaoLandlordFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  onCancel?: () => void;
}

export function PaoLandlordForm({
  values,
  onChange,
  onSubmit,
  submitting,
  submitLabel,
  submittingLabel,
  onCancel,
}: PaoLandlordFormProps) {
  const set = <K extends keyof PaoLandlordFormValues>(key: K, value: PaoLandlordFormValues[K]) =>
    onChange({ ...values, [key]: value });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5" />
            Landlord details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              className="h-11"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              className="h-11"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+237 6XX XXX XXX"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              className="h-11"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                className="h-11"
                value={values.region}
                onChange={(e) => set("region", e.target.value)}
                placeholder="e.g. Littoral"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                className="h-11"
                value={values.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="e.g. Douala"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location / neighbourhood</Label>
            <Input
              id="location"
              className="h-11"
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Optional"
            />
          </div>

          <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer min-h-[44px]">
            <Checkbox
              checked={values.contact_verified}
              onCheckedChange={(checked) => set("contact_verified", checked === true)}
            />
            <span className="text-sm font-medium">
              Contact verified (I reached this landlord on this number)
            </span>
          </label>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={4}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Anything worth remembering about this landlord (optional)"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="outline" className="h-11" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          className="h-11 bg-plp-purple hover:bg-plp-purple/90 text-white"
          disabled={submitting}
        >
          <Save className="w-4 h-4 mr-2" />
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
