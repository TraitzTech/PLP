"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2, Upload, X, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { adminPaoService } from "@/services/adminPaoService";
import type { AdminPaoCreateRequest, UserGender } from "@/services/types";
import { getApiErrorMessage, getUserInitials } from "../pao-utils";

const DEFAULT_TARGET_PLACEHOLDERS = {
  properties: "Default: 30",
  landlords: "Default: 20",
  verified: "Default: 25",
};

export default function CreatePaoPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale === "fr" ? "fr" : "en";
  const withLocale = (path: string) => `/${locale}${path.startsWith("/") ? path : `/${path}`}`;

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "male" as UserGender,
    territory: "",
    bio: "",
    target_properties: "",
    target_landlords: "",
    target_verified_properties: "",
  });

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(file);
      setProfilePhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setProfilePhotoPreview("");
  };

  const parseTarget = (value: string): number | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      newErrors.email = "Invalid email format";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";

    (
      ["target_properties", "target_landlords", "target_verified_properties"] as const
    ).forEach((field) => {
      const raw = formData[field].trim();
      if (!raw) return;
      const parsed = Number(raw);
      if (!Number.isFinite(parsed) || parsed < 0) {
        newErrors[field] = "Enter a valid positive number";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSaving(true);

      const payload: AdminPaoCreateRequest = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        territory: formData.territory.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        profile_photo: profilePhoto,
        target_properties: parseTarget(formData.target_properties),
        target_landlords: parseTarget(formData.target_landlords),
        target_verified_properties: parseTarget(formData.target_verified_properties),
      };

      await adminPaoService.createPao(payload);
      toast.success("PAO created successfully. Login credentials have been emailed to them.");
      router.push(withLocale("/admin/paos"));
    } catch (error: any) {
      console.error("Error creating PAO:", error);

      if (error.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          fieldErrors[field] = Array.isArray(messages) ? String(messages[0]) : String(messages);
        });
        setErrors(fieldErrors);
      }

      toast.error(getApiErrorMessage(error, "Failed to create PAO"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create New PAO</h1>
              <p className="text-muted-foreground">
                Add a new Property Acquisition Officer to the field team
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create PAO"
              )}
            </Button>
          </div>
        </div>

        <Alert>
          <KeyRound className="h-4 w-4" />
          <AlertDescription>
            A temporary password will be generated and emailed to this PAO automatically. PAOs
            cannot register themselves.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>PAO Information</CardTitle>
              <CardDescription>Account details and field assignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">User Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+237 XXX XXX XXX"
                      maxLength={20}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleSelectChange("gender", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                  </div>
                </div>
              </div>

              {/* Field Assignment */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Field Assignment</h3>
                <div className="space-y-2">
                  <Label htmlFor="territory">Territory</Label>
                  <Input
                    id="territory"
                    name="territory"
                    value={formData.territory}
                    onChange={handleInputChange}
                    placeholder="e.g., Douala"
                  />
                  {errors.territory && <p className="text-sm text-red-500">{errors.territory}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Brief description about this officer..."
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">{formData.bio.length}/500</p>
                  {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
                </div>
              </div>

              {/* Monthly Targets */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Monthly Targets</h3>
                <p className="text-xs text-muted-foreground">
                  Leave blank to use the platform defaults configured in Settings.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target_properties">Target Properties</Label>
                    <Input
                      id="target_properties"
                      name="target_properties"
                      type="number"
                      min={0}
                      value={formData.target_properties}
                      onChange={handleInputChange}
                      placeholder={DEFAULT_TARGET_PLACEHOLDERS.properties}
                    />
                    {errors.target_properties && (
                      <p className="text-sm text-red-500">{errors.target_properties}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_landlords">Target Landlords</Label>
                    <Input
                      id="target_landlords"
                      name="target_landlords"
                      type="number"
                      min={0}
                      value={formData.target_landlords}
                      onChange={handleInputChange}
                      placeholder={DEFAULT_TARGET_PLACEHOLDERS.landlords}
                    />
                    {errors.target_landlords && (
                      <p className="text-sm text-red-500">{errors.target_landlords}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_verified_properties">Target Verified</Label>
                    <Input
                      id="target_verified_properties"
                      name="target_verified_properties"
                      type="number"
                      min={0}
                      value={formData.target_verified_properties}
                      onChange={handleInputChange}
                      placeholder={DEFAULT_TARGET_PLACEHOLDERS.verified}
                    />
                    {errors.target_verified_properties && (
                      <p className="text-sm text-red-500">{errors.target_verified_properties}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription>Optional profile picture for this PAO</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profilePhotoPreview} alt={formData.name} />
                    <AvatarFallback className="text-2xl">
                      {getUserInitials(formData.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("pao-profile-photo")?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                    {profilePhotoPreview && (
                      <Button type="button" variant="outline" size="sm" onClick={removePhoto}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <input
                    id="pao-profile-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Optional. Max 5MB. JPG, PNG
                  </p>
                  {errors.profile_photo && (
                    <p className="text-sm text-red-500">{errors.profile_photo}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  A staff code is generated automatically once the account is created.
                </p>
                <p>
                  The PAO receives their login email and temporary password by email — no password
                  is set here.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
