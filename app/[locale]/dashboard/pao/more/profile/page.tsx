"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, KeyRound, IdCard, MapPin } from "lucide-react";
import { profileService, type ProfileData } from "@/services/profileService";
import { paoService } from "@/services/paoService";
import type { PaoDashboardStats } from "@/services/types";
import { PaoErrorState } from "@/components/dashboard/pao/pao-ui";

type ProfileFormState = {
  name: string;
  phone: string;
  bio: string;
  region: string;
  city: string;
};

type PasswordFormState = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};

const emptyPasswordForm: PasswordFormState = {
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
};

export default function PaoProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [pao, setPao] = useState<PaoDashboardStats["pao"] | null>(null);
  const [form, setForm] = useState<ProfileFormState>({
    name: "",
    phone: "",
    bio: "",
    region: "",
    city: "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(emptyPasswordForm);

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
      setForm({
        name: data.name ?? "",
        phone: data.phone ?? "",
        bio: data.bio ?? "",
        region: data.region ?? "",
        city: data.city ?? "",
      });
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error(error?.message || "Failed to load your profile");
      setFailed(true);
    } finally {
      setLoading(false);
    }

    // PAO-specific fields (staff code / territory) only come from the dashboard
    // stats endpoint — a failure here shouldn't break the profile screen.
    try {
      const stats = await paoService.getDashboardStats();
      setPao(stats.pao);
    } catch (error) {
      console.error("Error loading PAO details:", error);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    setSaving(true);
    try {
      const updated = await profileService.updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        region: form.region.trim(),
        city: form.city.trim(),
      });
      setProfile(updated);
      toast.success("Profile updated");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error?.message || "Failed to update your profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (changingPassword) return;

    if (!passwordForm.current_password || !passwordForm.new_password) {
      toast.error("Please fill in both password fields.");
      return;
    }
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast.error("The new passwords don't match.");
      return;
    }

    setChangingPassword(true);
    try {
      await profileService.changePassword(passwordForm);
      toast.success("Password changed");
      setPasswordForm(emptyPasswordForm);
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error?.message || "Failed to change your password");
    } finally {
      setChangingPassword(false);
    }
  };

  const initials = (profile?.name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <DashboardLayout userType="pao">
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="h-10 px-2" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
        </div>

        {failed && !loading ? (
          <PaoErrorState message="We couldn't load your profile." onRetry={loadProfile} />
        ) : loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        ) : (
          <>
            {/* Identity card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={profile?.avatar || undefined} />
                    <AvatarFallback className="bg-plp-purple text-white text-lg">
                      {initials || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-gray-900 truncate">
                      {profile?.name || "—"}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{profile?.email || "—"}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {pao?.staff_code ? (
                        <Badge variant="secondary" className="border-transparent bg-plp-purple/10 text-plp-purple">
                          <IdCard className="w-3 h-3 mr-1" />
                          {pao.staff_code}
                        </Badge>
                      ) : null}
                      {pao?.territory ? (
                        <Badge variant="secondary" className="border-transparent bg-gray-100 text-gray-700">
                          <MapPin className="w-3 h-3 mr-1" />
                          {pao.territory}
                        </Badge>
                      ) : null}
                      {pao?.status ? (
                        <Badge
                          variant="secondary"
                          className={
                            pao.status === "active"
                              ? "border-transparent bg-green-100 text-green-800 capitalize"
                              : "border-transparent bg-red-100 text-red-800 capitalize"
                          }
                        >
                          {pao.status}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Editable details */}
            <form onSubmit={handleSaveProfile}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">My details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      className="h-11"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" className="h-11" value={profile?.email ?? ""} disabled />
                    <p className="text-xs text-gray-500">
                      Contact an admin if your email needs to change.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      className="h-11"
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Input
                        id="region"
                        className="h-11"
                        value={form.region}
                        onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        className="h-11"
                        value={form.city}
                        onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      value={form.bio}
                      onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder="A short introduction (optional)"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="h-11 bg-plp-purple hover:bg-plp-purple/90 text-white"
                      disabled={saving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>

            {/* Password */}
            <form onSubmit={handleChangePassword}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <KeyRound className="w-5 h-5" />
                    Change password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      className="h-11"
                      value={passwordForm.current_password}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))
                      }
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      className="h-11"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }))
                      }
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="h-11"
                      value={passwordForm.new_password_confirmation}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          new_password_confirmation: e.target.value,
                        }))
                      }
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" variant="outline" className="h-11" disabled={changingPassword}>
                      {changingPassword ? "Updating..." : "Update password"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
