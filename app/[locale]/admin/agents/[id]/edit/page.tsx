"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { agentService } from "@/services/agentService";
import type { Agent, AgentStatus, UserGender } from "@/services/types";

// Helper functions for image URLs
function getIdImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace('id_cards/', '');
  return `${process.env.NEXT_PUBLIC_API_URL}/../storage/id_cards/${cleanPath}`;
}

function getProfilePhotoUrl(imagePath: string): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace('profile_photos/', '');
  return `${process.env.NEXT_PUBLIC_API_URL}/../storage/profile_photos/${cleanPath}`;
}

export default function EditAgentPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agent, setAgent] = useState<Agent | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "male" as UserGender,
    bio: "",
    id_card_num: "",
    country: "",
    region: "",
    city: "",
    address: "",
    status: "pending" as AgentStatus,
  });

  // File states
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");
  const [idImageFront, setIdImageFront] = useState<File | null>(null);
  const [idImageFrontPreview, setIdImageFrontPreview] = useState<string>("");
  const [idImageBack, setIdImageBack] = useState<File | null>(null);
  const [idImageBackPreview, setIdImageBackPreview] = useState<string>("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAgentDetails();
  }, [agentId]);

  const fetchAgentDetails = async () => {
    try {
      setIsLoading(true);
      const response = await agentService.getAgent(agentId);
      const agentData = response;

      setAgent(agentData);
      setFormData({
        name: agentData.user?.name || "",
        email: agentData.user?.email || "",
        phone: agentData.user?.phone || "",
        gender: agentData.user?.gender || "male",
        bio: agentData.bio || "",
        id_card_num: agentData.id_card_num || "",
        country: agentData.country || "",
        region: agentData.region || "",
        city: agentData.city || "",
        address: agentData.address || "",
        status: agentData.status || "pending",
      });

      // Set existing image previews
      if (agentData.profile_photo) {
        setProfilePhotoPreview(getProfilePhotoUrl(agentData.profile_photo));
      }
      if (agentData.id_image_front) {
        setIdImageFrontPreview(getIdImageUrl(agentData.id_image_front));
      }
      if (agentData.id_image_back) {
        setIdImageBackPreview(getIdImageUrl(agentData.id_image_back));
      }
    } catch (error: any) {
      console.error("Error fetching agent:", error);
      toast.error(error.response?.data?.message || "Failed to fetch agent details");
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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "front" | "back"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      if (type === "profile") {
        setProfilePhoto(file);
        setProfilePhotoPreview(preview);
      } else if (type === "front") {
        setIdImageFront(file);
        setIdImageFrontPreview(preview);
      } else {
        setIdImageBack(file);
        setIdImageBackPreview(preview);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: "profile" | "front" | "back") => {
    if (type === "profile") {
      setProfilePhoto(null);
      setProfilePhotoPreview("");
    } else if (type === "front") {
      setIdImageFront(null);
      setIdImageFrontPreview("");
    } else {
      setIdImageBack(null);
      setIdImageBackPreview("");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.id_card_num.trim()) newErrors.id_card_num = "ID card number is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.region.trim()) newErrors.region = "Region is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

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

      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        bio: formData.bio || null,
        id_card_num: formData.id_card_num,
        country: formData.country,
        region: formData.region,
        city: formData.city,
        address: formData.address,
        status: formData.status,
      };

      // Only include files if they were changed
      if (profilePhoto) {
        updateData.profile_photo = profilePhoto;
      }
      if (idImageFront) {
        updateData.id_image_front = idImageFront;
      }
      if (idImageBack) {
        updateData.id_image_back = idImageBack;
      }

      await agentService.updateAgent(agentId, updateData);
      toast.success("Agent updated successfully");
      router.push("/admin/agents");
    } catch (error: any) {
      console.error("Error updating agent:", error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error("Please check the form for errors");
      } else {
        toast.error(error.response?.data?.message || "Failed to update agent");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="admin">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>

          {/* Form Skeleton */}
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
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout userType="admin">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Agent not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Agent</h1>
              <p className="text-muted-foreground">
                Update agent information and status
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
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Agent Information</CardTitle>
              <CardDescription>Update the agent's personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Information */}
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
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
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
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
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
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone}</p>
                    )}
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

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Brief description about the agent..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Agent Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Agent Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id_card_num">
                      ID Card Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="id_card_num"
                      name="id_card_num"
                      value={formData.id_card_num}
                      onChange={handleInputChange}
                      placeholder="ID-XXXXXXXXXX"
                    />
                    {errors.id_card_num && (
                      <p className="text-sm text-red-500">{errors.id_card_num}</p>
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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Cameroon"
                    />
                    {errors.country && (
                      <p className="text-sm text-red-500">{errors.country}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">
                      Region <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      placeholder="North-West"
                    />
                    {errors.region && (
                      <p className="text-sm text-red-500">{errors.region}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Bamenda"
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">
                      Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address"
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500">{errors.address}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Photo */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription>Upload agent's profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profilePhotoPreview} alt={formData.name} />
                    <AvatarFallback className="text-2xl">
                      {getUserInitials(formData.name || "NA")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("profile-photo")?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                    {profilePhotoPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeImage("profile")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <input
                    id="profile-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "profile")}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Optional. Max 5MB. JPG, PNG
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Current Status Badge */}
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={
                    agent.status === "approved"
                      ? "default"
                      : agent.status === "rejected"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-sm"
                >
                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                </Badge>
              </CardContent>
            </Card>

            {/* ID Documents */}
            <Card>
              <CardHeader>
                <CardTitle>ID Documents</CardTitle>
                <CardDescription>Update ID card images if needed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Front ID */}
                <div className="space-y-2">
                  <Label>ID Card Front</Label>
                  {idImageFrontPreview ? (
                    <div className="relative">
                      <img
                        src={idImageFrontPreview}
                        alt="ID Front"
                        className="w-full h-32 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeImage("front")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => document.getElementById("id-front")?.click()}
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary"
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload front
                      </p>
                    </div>
                  )}
                  <input
                    id="id-front"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "front")}
                  />
                </div>

                {/* Back ID */}
                <div className="space-y-2">
                  <Label>ID Card Back</Label>
                  {idImageBackPreview ? (
                    <div className="relative">
                      <img
                        src={idImageBackPreview}
                        alt="ID Back"
                        className="w-full h-32 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeImage("back")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => document.getElementById("id-back")?.click()}
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary"
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload back
                      </p>
                    </div>
                  )}
                  <input
                    id="id-back"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "back")}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}