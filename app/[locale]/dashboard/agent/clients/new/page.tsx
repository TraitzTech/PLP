"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useTranslations } from "@/components/translation-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Star } from "lucide-react";
import { toast } from "sonner";

export default function AddClientPage() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    status: "active",
    preferredProperties: [] as string[],
    budget: "",
    notes: "",
    sendWelcomeEmail: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success(
        t("dashboards.agent.clients.addSuccess", "Client added successfully!"),
      );
      router.push("/dashboard/agent/clients");
    }, 1500);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreferenceToggle = (preference: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredProperties: prev.preferredProperties.includes(preference)
        ? prev.preferredProperties.filter((p) => p !== preference)
        : [...prev.preferredProperties, preference],
    }));
  };

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("dashboards.agent.clients.backToClients", "Back to Clients")}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("dashboards.agent.clients.addTitle", "Add New Client")}
            </h1>
            <p className="text-gray-600 mt-2">
              {t(
                "dashboards.agent.clients.addSubtitle",
                "Create a client profile for better tracking.",
              )}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t(
                  "dashboards.agent.clients.basicInfoTitle",
                  "Basic Information",
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    {t("dashboards.agent.clients.firstName", "First Name")}
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    {t("dashboards.agent.clients.lastName", "Last Name")}
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t("dashboards.agent.clients.email", "Email")}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {t("dashboards.agent.clients.phone", "Phone")}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="pl-10"
                      placeholder={t(
                        "dashboards.agent.clients.phonePlaceholder",
                        "+237 6XX XXX XXX",
                      )}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  {t("dashboards.agent.clients.locationLabel", "Location")}
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="pl-10"
                    placeholder={t(
                      "dashboards.agent.clients.locationPlaceholder",
                      "City, Region",
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">
                  {t(
                    "dashboards.agent.clients.descriptionLabel",
                    "Description",
                  )}
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder={t(
                    "dashboards.agent.clients.descriptionPlaceholder",
                    "Client information...",
                  )}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t(
                  "dashboards.agent.clients.preferencesTitle",
                  "Client Preferences",
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="budget">
                  {t(
                    "dashboards.agent.clients.budgetLabel",
                    "Budget (XAF per night)",
                  )}
                </Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange("budget", e.target.value)}
                  placeholder="500000"
                />
              </div>

              <div>
                <Label>
                  {t(
                    "dashboards.agent.clients.preferredTypesLabel",
                    "Preferred Property Types",
                  )}
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {[
                    {
                      id: "luxuryVilla",
                      label: t(
                        "dashboards.agent.clients.preferences.luxuryVilla",
                        "Luxury Villa",
                      ),
                    },
                    {
                      id: "modernApartment",
                      label: t(
                        "dashboards.agent.clients.preferences.modernApartment",
                        "Modern Apartment",
                      ),
                    },
                    {
                      id: "executiveSuite",
                      label: t(
                        "dashboards.agent.clients.preferences.executiveSuite",
                        "Executive Suite",
                      ),
                    },
                    {
                      id: "familyHome",
                      label: t(
                        "dashboards.agent.clients.preferences.familyHome",
                        "Family Home",
                      ),
                    },
                    {
                      id: "studio",
                      label: t(
                        "dashboards.agent.clients.preferences.studio",
                        "Studio",
                      ),
                    },
                    {
                      id: "poolProperty",
                      label: t(
                        "dashboards.agent.clients.preferences.poolProperty",
                        "Property with Pool",
                      ),
                    },
                    {
                      id: "seaView",
                      label: t(
                        "dashboards.agent.clients.preferences.seaView",
                        "Sea View",
                      ),
                    },
                    {
                      id: "cityCenter",
                      label: t(
                        "dashboards.agent.clients.preferences.cityCenter",
                        "City Center",
                      ),
                    },
                  ].map((preference) => (
                    <div
                      key={preference.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={preference.id}
                        checked={formData.preferredProperties.includes(
                          preference.label,
                        )}
                        onCheckedChange={() =>
                          handlePreferenceToggle(preference.label)
                        }
                      />
                      <Label htmlFor={preference.id} className="text-sm">
                        {preference.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">
                  {t("dashboards.agent.clients.notesLabel", "Personal Notes")}
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder={t(
                    "dashboards.agent.clients.notesPlaceholder",
                    "Notes about client preferences, special requests, etc...",
                  )}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              {t("dashboards.common.cancel", "Cancel")}
            </Button>
            <Button type="submit" className="btn-primary" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading
                ? t("dashboards.agent.clients.adding", "Adding...")
                : t("dashboards.agent.clients.addClient", "Add Client")}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
