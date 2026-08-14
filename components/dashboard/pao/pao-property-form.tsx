"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Save, UserPlus } from "lucide-react";
import type { Landlord, PaoProperty, PaoPropertyRequest, PropertyType } from "@/services/types";

export type PaoPropertyFormValues = {
  landlord_id: string;
  property_type_id: string;
  bedrooms: string;
  bathrooms: string;
  region: string;
  city: string;
  location: string;
  price: string;
  for_rent: boolean;
  for_purchase: boolean;
  title: string;
  description: string;
};

export const emptyPropertyFormValues: PaoPropertyFormValues = {
  landlord_id: "",
  property_type_id: "",
  bedrooms: "",
  bathrooms: "",
  region: "",
  city: "",
  location: "",
  price: "",
  for_rent: true,
  for_purchase: false,
  title: "",
  description: "",
};

/** Build form values from an existing property (edit screen). */
export function propertyToFormValues(property: PaoProperty): PaoPropertyFormValues {
  return {
    landlord_id: property.landlord_id ? String(property.landlord_id) : "",
    property_type_id: property.property_type_id ? String(property.property_type_id) : "",
    bedrooms: property.bedrooms != null ? String(property.bedrooms) : "",
    bathrooms: property.bathrooms != null ? String(property.bathrooms) : "",
    region: property.region ?? "",
    city: property.city ?? "",
    location: property.location ?? "",
    price: property.price != null ? String(property.price) : "",
    for_rent: property.for_rent ?? true,
    for_purchase: property.for_purchase ?? false,
    title: property.title ?? "",
    description: property.description ?? "",
  };
}

/**
 * Validate + convert form values into the API payload.
 * Returns an error string instead of throwing so callers can toast it.
 */
export function buildPropertyPayload(
  values: PaoPropertyFormValues
): { payload: PaoPropertyRequest } | { error: string } {
  if (!values.landlord_id) return { error: "Please choose a landlord." };
  if (!values.property_type_id) return { error: "Please choose a property type." };
  if (!values.region.trim()) return { error: "Region is required." };
  if (!values.city.trim()) return { error: "City is required." };
  if (!values.location.trim()) return { error: "Location is required." };

  const price = parseFloat(values.price);
  if (!Number.isFinite(price) || price <= 0) return { error: "Please enter a valid price." };

  if (!values.for_rent && !values.for_purchase) {
    return { error: "Select at least one of For Rent or For Sale." };
  }

  const bedrooms = values.bedrooms.trim() === "" ? null : parseInt(values.bedrooms, 10);
  const bathrooms = values.bathrooms.trim() === "" ? null : parseInt(values.bathrooms, 10);

  const payload: PaoPropertyRequest = {
    landlord_id: parseInt(values.landlord_id, 10),
    property_type_id: parseInt(values.property_type_id, 10),
    region: values.region.trim(),
    city: values.city.trim(),
    location: values.location.trim(),
    price,
    bedrooms: bedrooms != null && Number.isFinite(bedrooms) ? bedrooms : null,
    bathrooms: bathrooms != null && Number.isFinite(bathrooms) ? bathrooms : null,
    for_rent: values.for_rent,
    for_purchase: values.for_purchase,
  };

  if (values.title.trim()) payload.title = values.title.trim();
  if (values.description.trim()) payload.description = values.description.trim();

  return { payload };
}

interface PaoPropertyFormProps {
  values: PaoPropertyFormValues;
  onChange: (values: PaoPropertyFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  landlords: Landlord[];
  propertyTypes: PropertyType[];
  submitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  onCancel?: () => void;
  /** Lock the landlord select (e.g. when editing an existing property). */
  landlordDisabled?: boolean;
}

export function PaoPropertyForm({
  values,
  onChange,
  onSubmit,
  landlords,
  propertyTypes,
  submitting,
  submitLabel,
  submittingLabel,
  onCancel,
  landlordDisabled = false,
}: PaoPropertyFormProps) {
  const set = <K extends keyof PaoPropertyFormValues>(key: K, value: PaoPropertyFormValues[K]) =>
    onChange({ ...values, [key]: value });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Home className="w-5 h-5" />
            Property details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Landlord */}
          <div className="space-y-2">
            <Label htmlFor="landlord">Landlord *</Label>
            {landlords.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="mb-3">You need to add a landlord before you can add a property.</p>
                <Link href="/dashboard/pao/landlords/new">
                  <Button type="button" variant="outline" className="h-10">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add a landlord
                  </Button>
                </Link>
              </div>
            ) : (
              <Select
                value={values.landlord_id}
                onValueChange={(v) => set("landlord_id", v)}
                disabled={landlordDisabled}
              >
                <SelectTrigger id="landlord" className="h-11">
                  <SelectValue placeholder="Choose a landlord" />
                </SelectTrigger>
                <SelectContent>
                  {landlords.map((landlord) => (
                    <SelectItem key={landlord.id} value={String(landlord.id)}>
                      {landlord.name} — {landlord.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Property type */}
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property type *</Label>
            <Select value={values.property_type_id} onValueChange={(v) => set("property_type_id", v)}>
              <SelectTrigger id="propertyType" className="h-11">
                <SelectValue placeholder="Choose a property type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bedrooms / bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                inputMode="numeric"
                min={0}
                className="h-11"
                value={values.bedrooms}
                onChange={(e) => set("bedrooms", e.target.value)}
                placeholder="e.g. 3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                inputMode="numeric"
                min={0}
                className="h-11"
                value={values.bathrooms}
                onChange={(e) => set("bathrooms", e.target.value)}
                placeholder="e.g. 2"
              />
            </div>
          </div>

          {/* Region / city */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Input
                id="region"
                className="h-11"
                value={values.region}
                onChange={(e) => set("region", e.target.value)}
                placeholder="e.g. Littoral"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                className="h-11"
                value={values.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="e.g. Douala"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location / neighbourhood *</Label>
            <Input
              id="location"
              className="h-11"
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Bonapriso"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (XAF) *</Label>
            <Input
              id="price"
              type="number"
              inputMode="numeric"
              min={0}
              className="h-11"
              value={values.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="150000"
              required
            />
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label>Listing purpose *</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex items-center gap-3 rounded-lg border p-3 flex-1 cursor-pointer min-h-[44px]">
                <Checkbox
                  checked={values.for_rent}
                  onCheckedChange={(checked) => set("for_rent", checked === true)}
                />
                <span className="text-sm font-medium">For Rent</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border p-3 flex-1 cursor-pointer min-h-[44px]">
                <Checkbox
                  checked={values.for_purchase}
                  onCheckedChange={(checked) => set("for_purchase", checked === true)}
                />
                <span className="text-sm font-medium">For Sale</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              className="h-11"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Auto-generated from bedrooms + location if left blank"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Anything useful about the property (optional)"
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
          disabled={submitting || landlords.length === 0}
        >
          <Save className="w-4 h-4 mr-2" />
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
