"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, Upload, X, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { adminPaoService } from "@/services/adminPaoService";
import type { AdminPaoUpdateRequest, Pao, PaoStatus, UserGender } from "@/services/types";
import {
  formatDate,
  formatXAF,
  getApiErrorMessage,
  getPaoPhotoUrl,
  getUserInitials,
  targetPercent,
} from "../../pao-utils";

export default function EditPaoPage() {
  const router = useRouter();
  const params = useParams<{ id: string; locale: string }>();
  const paoId = params.id as string;
  const locale = params?.locale === "fr" ? "fr" : "en";
  const withLocale = (path: string) => `/${locale}${path.startsWith("/") ? path : `/${path}`}`;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pao, setPao] = useState<Pao | null>(null);
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
    status: "active" as PaoStatus,
  });

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");

  useEffect(() => {
    fetchPaoDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paoId]);

  const fetchPaoDetails = async () => {
    try {
      setIsLoading(true);
      const paoData = await adminPaoService.getPao(paoId);

      setPao(paoData);
      setFormData({
        name: paoData.user?.name || "",
        email: paoData.user?.email || "",
        phone: paoData.user?.phone || "",
        gender: paoData.user?.gender || "male",
        territory: paoData.territory || "",
        bio: paoData.bio || "",
        target_properties:
          paoData.target_properties === null || paoData.target_properties === undefined
            ? ""
            : String(paoData.target_properties),
        target_landlords:
          paoData.target_landlords === null || paoData.target_landlords === undefined
            ? ""
            : String(paoData.target_landlords),
        target_verified_properties:
          paoData.target_verified_properties === null ||
          paoData.target_verified_properties === undefined
            ? ""
            : String(paoData.target_verified_properties),
        status: paoData.status || "active",
      });

      if (paoData.profile_photo) {
        setProfilePhotoPreview(getPaoPhotoUrl(paoData.profile_photo));
      }
    } catch (error: any) {
      console.error("Error fetching PAO:", error);
      toast.error(getApiErrorMessage(error, "Failed to fetch PAO details"));
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

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

      const payload: AdminPaoUpdateRequest = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        territory: formData.territory.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        target_properties: parseTarget(formData.target_properties),
        target_landlords: parseTarget(formData.target_landlords),
        target_verified_properties: parseTarget(formData.target_verified_properties),
        status: formData.status,
      };

      // Only send the photo when a new one was picked.
      if (profilePhoto) {
        payload.profile_photo = profilePhoto;
      }

      await adminPaoService.updatePao(paoId, payload);
      toast.success("PAO updated successfully");
      router.push(withLocale("/admin/paos"));
    } catch (error: any) {
      console.error("Error updating PAO:", error);

      if (error.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          fieldErrors[field] = Array.isArray(messages) ? String(messages[0]) : String(messages);
        });
        setErrors(fieldErrors);
      }

      toast.error(getApiErrorMessage(error, "Failed to update PAO"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="admin">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!pao) {
    return (
      <DashboardLayout userType="admin">
        <div className="text-center py-12">
          <p className="text-muted-foreground">PAO not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusBadge = (
    <Badge
      variant="outline"
      className={
        pao.status === "active"
          ? "flex items-center gap-1 w-fit bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
          : "flex items-center gap-1 w-fit bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
      }
    >
      {pao.status === "active" ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      {pao.status === "active" ? "Active" : "Suspended"}
    </Badge>
  );

  return (
    <DashboardLayout userType="admin">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={getPaoPhotoUrl(pao.profile_photo) || undefined}
                  alt={pao.user?.name}
                />
                <AvatarFallback>{getUserInitials(pao.user?.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {pao.user?.name || "PAO"}
                </h1>
                <div className="flex items-center gap-3 text-muted-foreground text-sm mt-1">
                  <span className="font-mono">{pao.staff_code}</span>
                  <span>·</span>
                  <span>{pao.territory || "No territory"}</span>
                  <span>·</span>
                  <span>Joined {formatDate(pao.created_at)}</span>
                  {statusBadge}
                </div>
              </div>
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
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pao.properties_count || 0}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / {pao.target_properties || 0}
                </span>
              </div>
              <Progress
                value={targetPercent(pao.properties_count, pao.target_properties)}
                className="h-1.5 mt-2"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {pao.verified_count || 0}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / {pao.target_verified_properties || 0}
                </span>
              </div>
              <Progress
                value={targetPercent(pao.verified_count, pao.target_verified_properties)}
                className="h-1.5 mt-2"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Landlords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pao.landlords_count || 0}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / {pao.target_landlords || 0}
                </span>
              </div>
              <Progress
                value={targetPercent(pao.landlords_count, pao.target_landlords)}
                className="h-1.5 mt-2"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatXAF(pao.total_earnings)}</div>
              <p className="text-xs text-muted-foreground">Lifetime</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-600">
                {formatXAF(pao.paid_earnings)}
              </div>
              <p className="text-xs text-muted-foreground">Settled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-plp-purple">
                {formatXAF(pao.pending_earnings)}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>PAO Information</CardTitle>
              <CardDescription>
                Update account details, territory, targets and status
              </CardDescription>
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
                  </div>
                </div>
              </div>

              {/* Field Assignment */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Field Assignment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="territory">Territory</Label>
                    <Input
                      id="territory"
                      name="territory"
                      value={formData.territory}
                      onChange={handleInputChange}
                      placeholder="e.g., Douala"
                    />
                    {errors.territory && (
                      <p className="text-sm text-red-500">{errors.territory}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Suspended PAOs cannot submit new properties.
                    </p>
                  </div>
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
                </div>
              </div>

              {/* Monthly Targets */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Monthly Targets</h3>
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
                      placeholder="30"
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
                      placeholder="20"
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
                      placeholder="25"
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
                <CardDescription>Update this PAO's profile picture</CardDescription>
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Staff Code</span>
                  <span className="font-mono">{pao.staff_code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Status</span>
                  {statusBadge}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDate(pao.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{formatDate(pao.updated_at)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
