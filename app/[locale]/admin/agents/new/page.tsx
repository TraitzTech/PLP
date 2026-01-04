"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MultiStepForm, FormStep } from "@/components/ui/multi-step-form";
import { ArrowLeft, AlertCircle, FileUp } from "lucide-react";
import { toast } from "sonner";
import { agentService } from "@/services/agentService";
import type { AgentCreateRequest } from "@/services/types";

interface AdminAgentFormData extends Omit<AgentCreateRequest, "id_image_front" | "id_image_back" | "profile_photo"> {
  id_image_front: File | null;
  id_image_back: File | null;
  profile_photo: File | null;
}

interface FormErrors {
  [key: string]: string;
}

export default function CreateAgentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<AdminAgentFormData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    gender: "male",
    profile_photo: null,
    bio: "",
    id_card_num: "",
    country: "",
    region: "",
    city: "",
    address: "",
    id_image_front: null,
    id_image_back: null,
    status: "pending",
  });

  const [previews, setPreviews] = useState({
    profile_photo: "",
    id_image_front: "",
    id_image_back: "",
  });

  const handleInputChange = (field: keyof AdminAgentFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleFileChange = (field: "profile_photo" | "id_image_front" | "id_image_back", file: File | null) => {
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [field]: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({
          ...prev,
          [field]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: FormErrors = {};

    switch (step) {
      case 0: // User Account Information
        if (!formData.name.trim()) errors.name = "Name is required";
        if (!formData.email.trim()) errors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format";
        if (!formData.password) errors.password = "Password is required";
        else if (formData.password.length < 8) errors.password = "Password must be at least 8 characters";
        if (formData.password !== formData.password_confirmation)
          errors.password_confirmation = "Passwords do not match";
        if (!formData.phone.trim()) errors.phone = "Phone number is required";
        break;

      case 1: // Personal Information
        // Gender is already set to a default value, so this should not fail
        break;

      case 2: // Agent Profile Information
        if (!formData.id_card_num.trim()) errors.id_card_num = "ID Card Number is required";
        if (!formData.country.trim()) errors.country = "Country is required";
        if (!formData.region.trim()) errors.region = "Region/State is required";
        if (!formData.city.trim()) errors.city = "City is required";
        if (!formData.address.trim()) errors.address = "Address is required";
        break;

      case 3: // ID Documents & Status
        if (!formData.id_image_front) errors.id_image_front = "Front of ID is required";
        if (!formData.id_image_back) errors.id_image_back = "Back of ID is required";
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const submitData: AgentCreateRequest = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        phone: formData.phone,
        gender: formData.gender,
        user_type: "agent",
        profile_photo: formData.profile_photo,
        bio: formData.bio || null,
        id_card_num: formData.id_card_num,
        country: formData.country,
        region: formData.region,
        city: formData.city,
        address: formData.address,
        id_image_front: formData.id_image_front!,
        id_image_back: formData.id_image_back!,
        status: formData.status || "pending",
      };

      await agentService.createAgent(submitData);
      toast.success("Agent created successfully");
      router.push("/admin/agents");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Creation failed";
      toast.error(errorMessage);
      console.error("Creation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const steps: FormStep[] = [
    {
      id: "account",
      title: "Account Information",
      description: "Create login credentials",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={formErrors.name ? "border-red-500" : ""}
            />
            {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={formErrors.email ? "border-red-500" : ""}
            />
            {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className={formErrors.phone ? "border-red-500" : ""}
              maxLength={20}
            />
            {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={formErrors.password ? "border-red-500" : ""}
            />
            {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
          </div>

          <div>
            <Label htmlFor="password_confirmation">Confirm Password *</Label>
            <Input
              id="password_confirmation"
              type="password"
              placeholder="Confirm your password"
              value={formData.password_confirmation}
              onChange={(e) => handleInputChange("password_confirmation", e.target.value)}
              className={formErrors.password_confirmation ? "border-red-500" : ""}
            />
            {formErrors.password_confirmation && (
              <p className="text-red-500 text-sm mt-1">{formErrors.password_confirmation}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "personal",
      title: "Personal Information",
      description: "Tell us about the agent",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="gender">Gender *</Label>
            <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
              <SelectTrigger className={formErrors.gender ? "border-red-500" : ""}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.gender && <p className="text-red-500 text-sm mt-1">{formErrors.gender}</p>}
          </div>

          <div>
            <Label htmlFor="profile_photo">Profile Photo (Optional)</Label>
            <div className="flex flex-col gap-2">
              <Input
                id="profile_photo"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("profile_photo", e.target.files?.[0] || null)}
              />
              {previews.profile_photo && (
                <img src={previews.profile_photo} alt="Profile preview" className="w-24 h-24 object-cover rounded" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Max 2MB</p>
          </div>

          <div>
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about this agent's experience..."
              value={formData.bio || ""}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">{(formData.bio || "").length}/500</p>
          </div>
        </div>
      ),
    },
    {
      id: "location",
      title: "Location & ID Information",
      description: "Location details and identification",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="id_card_num">ID Card Number *</Label>
            <Input
              id="id_card_num"
              placeholder="Enter ID card number"
              value={formData.id_card_num}
              onChange={(e) => handleInputChange("id_card_num", e.target.value)}
              className={formErrors.id_card_num ? "border-red-500" : ""}
            />
            {formErrors.id_card_num && <p className="text-red-500 text-sm mt-1">{formErrors.id_card_num}</p>}
          </div>

          <div>
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              placeholder="e.g., United States"
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className={formErrors.country ? "border-red-500" : ""}
              maxLength={255}
            />
            {formErrors.country && <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="region">Region/State *</Label>
              <Input
                id="region"
                placeholder="e.g., California"
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
                className={formErrors.region ? "border-red-500" : ""}
                maxLength={255}
              />
              {formErrors.region && <p className="text-red-500 text-sm mt-1">{formErrors.region}</p>}
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="e.g., San Francisco"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className={formErrors.city ? "border-red-500" : ""}
                maxLength={255}
              />
              {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              placeholder="Street address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={formErrors.address ? "border-red-500" : ""}
              maxLength={255}
            />
            {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
          </div>
        </div>
      ),
    },
    {
      id: "documents",
      title: "ID Documents & Status",
      description: "Upload ID documents and set initial status",
      content: (
        <div className="space-y-6">
          <Alert>
            <FileUp className="h-4 w-4" />
            <AlertDescription>
              Upload clear images of both sides of the agent's ID for verification.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="id_image_front">Front of ID *</Label>
            <div className="flex flex-col gap-2">
              <Input
                id="id_image_front"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("id_image_front", e.target.files?.[0] || null)}
                className={formErrors.id_image_front ? "border-red-500" : ""}
              />
              {previews.id_image_front && (
                <img
                  src={previews.id_image_front}
                  alt="ID front preview"
                  className="w-full h-40 object-cover rounded border"
                />
              )}
            </div>
            {formErrors.id_image_front && (
              <p className="text-red-500 text-sm mt-1">{formErrors.id_image_front}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Max 2MB</p>
          </div>

          <div>
            <Label htmlFor="id_image_back">Back of ID *</Label>
            <div className="flex flex-col gap-2">
              <Input
                id="id_image_back"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("id_image_back", e.target.files?.[0] || null)}
                className={formErrors.id_image_back ? "border-red-500" : ""}
              />
              {previews.id_image_back && (
                <img
                  src={previews.id_image_back}
                  alt="ID back preview"
                  className="w-full h-40 object-cover rounded border"
                />
              )}
            </div>
            {formErrors.id_image_back && <p className="text-red-500 text-sm mt-1">{formErrors.id_image_back}</p>}
            <p className="text-xs text-muted-foreground mt-1">Max 2MB</p>
          </div>

          <div>
            <Label htmlFor="status">Initial Status *</Label>
            <Select value={formData.status || "pending"} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Set to "Pending Review" if you want to verify documents later
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Agent</h1>
            <p className="text-muted-foreground">Add a new property agent to the system</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <MultiStepForm
            steps={steps}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            onNext={() => validateStep(currentStep)}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitButtonText="Create Agent"
            showStepIndicator={true}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
