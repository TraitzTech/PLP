"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { agentService } from "@/services/agentService";
import type { AgentRegistrationRequest } from "@/services/types";
import { AlertCircle, CheckCircle2, FileUp, Loader2, User, UserCircle, MapPin, FileText } from "lucide-react";

interface AgentFormData extends Omit<AgentRegistrationRequest, "id_image_front" | "id_image_back" | "profile_photo"> {
  id_image_front: File | null;
  id_image_back: File | null;
  profile_photo: File | null;
}

interface FormErrors {
  [key: string]: string;
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

export function AgentSignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<AgentFormData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    gender: "male",
    user_type: "agent",
    profile_photo: null,
    bio: "",
    id_card_num: "",
    country: "",
    region: "",
    city: "",
    address: "",
    id_image_front: null,
    id_image_back: null,
  });

  const [previews, setPreviews] = useState({
    profile_photo: "",
    id_image_front: "",
    id_image_back: "",
  });

  const handleInputChange = (field: keyof AgentFormData, value: any) => {
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
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setFormErrors((prev) => ({
          ...prev,
          [field]: 'Only JPG and PNG images are allowed.',
        }));
        toast.error('Please upload a JPG or PNG image.');
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setFormErrors((prev) => ({
          ...prev,
          [field]: 'File size must be 2MB or less.',
        }));
        toast.error('Image size must be 2MB or less.');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [field]: file,
      }));

      setFormErrors((prev) => ({
        ...prev,
        [field]: '',
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

  const validateAll = (): boolean => {
    const errors: FormErrors = {};

    // Account Information
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 8) errors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.password_confirmation)
      errors.password_confirmation = "Passwords do not match";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";

    // Location & ID Information
    if (!formData.id_card_num.trim()) errors.id_card_num = "ID Card Number is required";
    if (!formData.country.trim()) errors.country = "Country is required";
    if (!formData.region.trim()) errors.region = "Region/State is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.address.trim()) errors.address = "Address is required";

    // ID Documents
    if (!formData.id_image_front) errors.id_image_front = "Front of ID is required";
    if (!formData.id_image_back) errors.id_image_back = "Back of ID is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error('Please fix the highlighted fields before submitting.');
      // Scroll to the first error
      const firstError = Object.keys(formErrors)[0];
      if (firstError) {
        const element = document.getElementById(firstError);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    try {
      setIsLoading(true);

      const submitData: AgentRegistrationRequest = {
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
      };

      await agentService.registerAgent(submitData);
      setIsRegistrationComplete(true);
      toast.success("Registration Successful. Awaiting admin approval.");
    } catch (error: any) {
      const errorMessage = error?.message || error?.data?.message || "Registration failed";
      toast.error(errorMessage);

      const backendErrors = error?.errors || error?.data?.errors;
      if (backendErrors) {
        if (Array.isArray(backendErrors)) {
          const first = backendErrors[0];
          if (first) {
            toast.error(String(first));
          }
        } else {
          const mapped: FormErrors = {};
          Object.entries(backendErrors).forEach(([key, value]) => {
            if (Array.isArray(value) && value[0]) {
              mapped[key] = String(value[0]);
            } else if (typeof value === 'string') {
              mapped[key] = value;
            }
          });
          setFormErrors((prev) => ({ ...prev, ...mapped }));
        }
      }

      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-plp-purple via-plp-pink to-plp-yellow flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Registration Successful!</CardTitle>
            <CardDescription className="mt-2">
              Your agent account has been created and is pending admin approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Our admin team will review your application and verify your documents. You'll receive an email once your account is approved.
                This typically takes 24-48 hours.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground text-center">
              You won't be able to access the agent dashboard until your account is approved.
            </p>
            <Button className="w-full" onClick={() => router.push("/")}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      <Card className="border-t-4 border-t-plp-purple">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-plp-purple to-plp-pink">
            Agent Registration
          </CardTitle>
          <CardDescription className="text-lg">
            Complete the form below to join our network of professional agents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-10 pt-4">
            
            {/* Account Information Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-xl font-semibold text-gray-800 border-b pb-2">
                <UserCircle className="w-6 h-6 text-plp-purple" />
                <h3>Account Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={formErrors.email ? "border-red-500" : ""}
                  />
                  {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="+237680090360"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={formErrors.phone ? "border-red-500" : ""}
                    maxLength={20}
                  />
                  {formErrors.phone && <p className="text-red-500 text-sm">{formErrors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger id="gender" className={formErrors.gender ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.gender && <p className="text-red-500 text-sm">{formErrors.gender}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={formErrors.password ? "border-red-500" : ""}
                  />
                  {formErrors.password && <p className="text-red-500 text-sm">{formErrors.password}</p>}
                </div>

                <div className="space-y-2">
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
                    <p className="text-red-500 text-sm">{formErrors.password_confirmation}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Profile Information Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-xl font-semibold text-gray-800 border-b pb-2">
                <User className="w-6 h-6 text-plp-pink" />
                <h3>Profile Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile_photo">Profile Photo (Optional)</Label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                          {previews.profile_photo ? (
                            <img src={previews.profile_photo} alt="Profile preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-gray-400" />
                          )}
                        </div>
                        <Input
                          id="profile_photo"
                          type="file"
                          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                          onChange={(e) => handleFileChange("profile_photo", e.target.files?.[0] || null)}
                          className="max-w-[200px]"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">JPG or PNG, Max 2MB</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about your experience and expertise..."
                    value={formData.bio || ""}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    maxLength={500}
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <p className="text-xs text-muted-foreground">{(formData.bio || "").length}/500</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Location & ID Information Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-xl font-semibold text-gray-800 border-b pb-2">
                <MapPin className="w-6 h-6 text-plp-yellow" />
                <h3>Location & ID Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="id_card_num">ID Card Number *</Label>
                  <Input
                    id="id_card_num"
                    placeholder="Enter your ID card number"
                    value={formData.id_card_num}
                    onChange={(e) => handleInputChange("id_card_num", e.target.value)}
                    className={formErrors.id_card_num ? "border-red-500" : ""}
                  />
                  {formErrors.id_card_num && <p className="text-red-500 text-sm">{formErrors.id_card_num}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="e.g., Cameroon"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className={formErrors.country ? "border-red-500" : ""}
                    maxLength={255}
                  />
                  {formErrors.country && <p className="text-red-500 text-sm">{formErrors.country}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region/State *</Label>
                  <Input
                    id="region"
                    placeholder="e.g., California"
                    value={formData.region}
                    onChange={(e) => handleInputChange("region", e.target.value)}
                    className={formErrors.region ? "border-red-500" : ""}
                    maxLength={255}
                  />
                  {formErrors.region && <p className="text-red-500 text-sm">{formErrors.region}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="e.g., San Francisco"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className={formErrors.city ? "border-red-500" : ""}
                    maxLength={255}
                  />
                  {formErrors.city && <p className="text-red-500 text-sm">{formErrors.city}</p>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="Street address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className={formErrors.address ? "border-red-500" : ""}
                    maxLength={255}
                  />
                  {formErrors.address && <p className="text-red-500 text-sm">{formErrors.address}</p>}
                </div>
              </div>
            </section>

            {/* ID Documents Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-xl font-semibold text-gray-800 border-b pb-2">
                <FileText className="w-6 h-6 text-green-600" />
                <h3>ID Documents</h3>
              </div>
              <Alert className="bg-blue-50 border-blue-200">
                <FileUp className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Please upload clear images of both sides of your ID. This helps us verify your identity.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="id_image_front" className="font-medium">Front of ID *</Label>
                  <div className="flex flex-col gap-3">
                    <Input
                      id="id_image_front"
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={(e) => handleFileChange("id_image_front", e.target.files?.[0] || null)}
                      className={formErrors.id_image_front ? "border-red-500" : ""}
                    />
                    <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed bg-gray-50 flex items-center justify-center">
                      {previews.id_image_front ? (
                        <img
                          src={previews.id_image_front}
                          alt="ID front preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">Front image preview will appear here</p>
                        </div>
                      )}
                    </div>
                    {formErrors.id_image_front && (
                      <p className="text-red-500 text-sm">{formErrors.id_image_front}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="id_image_back" className="font-medium">Back of ID *</Label>
                  <div className="flex flex-col gap-3">
                    <Input
                      id="id_image_back"
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={(e) => handleFileChange("id_image_back", e.target.files?.[0] || null)}
                      className={formErrors.id_image_back ? "border-red-500" : ""}
                    />
                    <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed bg-gray-50 flex items-center justify-center">
                      {previews.id_image_back ? (
                        <img
                          src={previews.id_image_back}
                          alt="ID back preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">Back image preview will appear here</p>
                        </div>
                      )}
                    </div>
                    {formErrors.id_image_back && (
                      <p className="text-red-500 text-sm">{formErrors.id_image_back}</p>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">Supported formats: JPG, PNG. Max size: 2MB per image.</p>
            </section>

            <Separator />

            <div className="flex flex-col gap-4">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-gradient-to-r from-plp-purple to-plp-pink hover:opacity-90 transition-opacity text-lg h-14"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Registration...
                  </>
                ) : (
                  "Submit Registration Application"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground italic">
                By submitting, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
