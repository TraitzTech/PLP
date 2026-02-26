'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Settings, DollarSign, FileText, User, Camera, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { profileService } from '@/services/profileService';
import apiClient from '@/lib/apiClient';

type SettingType = 'string' | 'boolean' | 'integer' | 'float' | 'json';

const toBool = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1';
  if (typeof value === 'number') return value !== 0;
  return fallback;
};

const ensureDate = (value: unknown): string => {
  const str = String(value || '').trim();
  if (!str) return new Date().toISOString().slice(0, 10);
  return str.slice(0, 10);
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null as string | null,
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [platformSettings, setPlatformSettings] = useState({
    siteName: 'PLP Listings',
    siteDescription: 'Find your perfect property with PLP Listings',
    defaultCurrency: 'XAF',
    defaultLanguage: 'en',
    maintenanceMode: false,
    allowRegistration: true,
    autoApproveProperties: false,
    enableLandlordListing: true,
    enableVirtualTours: true,
  });

  const [rolloutSettings, setRolloutSettings] = useState({
    enforceCityScope: true,
    rolloutCities: 'Douala, Bamenda',
    rentalsOnly: true,
    hotelEnabled: false,
    salesEnabled: false,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    platformFeeXaf: '1000',
    customerBookingFreeMode: true,
    customerPlatformAccessFeeEnabled: false,
    mesombAccessKey: '',
    mesombApplicationKey: '',
    mesombSecretKey: '',
    mesombLiveMode: false,
    mesombDefaultService: 'MTN',
    mesombDefaultCountry: 'CM',
  });

  const [legalSettings, setLegalSettings] = useState({
    termsEn: '',
    termsFr: '',
    termsLastUpdated: new Date().toISOString().slice(0, 10),
    privacyEn: '',
    privacyFr: '',
    privacyLastUpdated: new Date().toISOString().slice(0, 10),
  });

  const previewLegal = useMemo(
    () => ({
      terms: legalSettings.termsEn || '<p>No terms content yet.</p>',
      privacy: legalSettings.privacyEn || '<p>No privacy content yet.</p>',
    }),
    [legalSettings.termsEn, legalSettings.privacyEn]
  );

  const saveSetting = async (
    key: string,
    value: unknown,
    type: SettingType,
    group: string,
    description?: string
  ) => {
    await apiClient.patch(`/settings/key/${key}`, {
      value,
      type,
      group,
      description,
    });
  };

  const handleSaveGeneralSettings = async () => {
    try {
      setSaving(true);
      const rolloutCities = rolloutSettings.rolloutCities
        .split(',')
        .map((city) => city.trim())
        .filter(Boolean);

      await Promise.all([
        saveSetting('site_name', platformSettings.siteName, 'string', 'general'),
        saveSetting('site_description', platformSettings.siteDescription, 'string', 'general'),
        saveSetting('default_currency', platformSettings.defaultCurrency, 'string', 'general'),
        saveSetting('default_language', platformSettings.defaultLanguage, 'string', 'general'),
        saveSetting('maintenance_mode', platformSettings.maintenanceMode, 'boolean', 'features'),
        saveSetting('enable_registration', platformSettings.allowRegistration, 'boolean', 'features'),
        saveSetting('auto_approve_properties', platformSettings.autoApproveProperties, 'boolean', 'features'),
        saveSetting('enable_landlord_listing', platformSettings.enableLandlordListing, 'boolean', 'features'),
        saveSetting('enable_virtual_tours', platformSettings.enableVirtualTours, 'boolean', 'features'),
        saveSetting('launch_enforce_city_scope', rolloutSettings.enforceCityScope, 'boolean', 'rollout'),
        saveSetting('launch_rollout_cities', rolloutCities, 'json', 'rollout'),
        saveSetting('launch_rentals_only', rolloutSettings.rentalsOnly, 'boolean', 'rollout'),
        saveSetting('launch_hotel_enabled', rolloutSettings.hotelEnabled, 'boolean', 'rollout'),
        saveSetting('launch_sales_enabled', rolloutSettings.salesEnabled, 'boolean', 'rollout'),
      ]);

      toast.success('General and rollout settings updated.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save general settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePaymentSettings = async () => {
    try {
      setSaving(true);
      await Promise.all([
        saveSetting('platform_fee_xaf', paymentSettings.platformFeeXaf, 'integer', 'payments'),
        saveSetting('customer_booking_free_mode', paymentSettings.customerBookingFreeMode, 'boolean', 'payments'),
        saveSetting('customer_platform_access_fee_enabled', paymentSettings.customerPlatformAccessFeeEnabled, 'boolean', 'payments'),
        saveSetting('mesomb_access_key', paymentSettings.mesombAccessKey, 'string', 'payments'),
        saveSetting('mesomb_application_key', paymentSettings.mesombApplicationKey, 'string', 'payments'),
        saveSetting('mesomb_secret_key', paymentSettings.mesombSecretKey, 'string', 'payments'),
        saveSetting('mesomb_live_mode', paymentSettings.mesombLiveMode, 'boolean', 'payments'),
        saveSetting('mesomb_default_service', paymentSettings.mesombDefaultService, 'string', 'payments'),
        saveSetting('mesomb_default_country', paymentSettings.mesombDefaultCountry, 'string', 'payments'),
      ]);

      toast.success('Payment settings updated.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLegalSettings = async () => {
    try {
      setSaving(true);
      await Promise.all([
        saveSetting('legal_terms_content_en', legalSettings.termsEn, 'string', 'legal'),
        saveSetting('legal_terms_content_fr', legalSettings.termsFr, 'string', 'legal'),
        saveSetting('legal_terms_last_updated', legalSettings.termsLastUpdated, 'string', 'legal'),
        saveSetting('legal_privacy_content_en', legalSettings.privacyEn, 'string', 'legal'),
        saveSetting('legal_privacy_content_fr', legalSettings.privacyFr, 'string', 'legal'),
        saveSetting('legal_privacy_last_updated', legalSettings.privacyLastUpdated, 'string', 'legal'),
      ]);

      toast.success('Legal pages updated and published.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save legal settings');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadProfileAndSettings = async () => {
      try {
        const [data, settingsRes] = await Promise.all([
          profileService.getProfile(),
          apiClient.get('/settings/key-value'),
        ]);

        setProfileData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          avatar: data.avatar,
        });

        const settings = (settingsRes.data as any)?.data || {};

        setPlatformSettings((prev) => ({
          ...prev,
          siteName: String(settings.site_name ?? prev.siteName),
          siteDescription: String(settings.site_description ?? prev.siteDescription),
          defaultCurrency: String(settings.default_currency ?? prev.defaultCurrency),
          defaultLanguage: String(settings.default_language ?? prev.defaultLanguage),
          maintenanceMode: toBool(settings.maintenance_mode, prev.maintenanceMode),
          allowRegistration: toBool(settings.enable_registration, prev.allowRegistration),
          autoApproveProperties: toBool(settings.auto_approve_properties, prev.autoApproveProperties),
          enableLandlordListing: toBool(settings.enable_landlord_listing, prev.enableLandlordListing),
          enableVirtualTours: toBool(settings.enable_virtual_tours, prev.enableVirtualTours),
        }));

        setRolloutSettings((prev) => ({
          ...prev,
          enforceCityScope: toBool(settings.launch_enforce_city_scope, prev.enforceCityScope),
          rolloutCities: Array.isArray(settings.launch_rollout_cities)
            ? settings.launch_rollout_cities.join(', ')
            : prev.rolloutCities,
          rentalsOnly: toBool(settings.launch_rentals_only, prev.rentalsOnly),
          hotelEnabled: toBool(settings.launch_hotel_enabled, prev.hotelEnabled),
          salesEnabled: toBool(settings.launch_sales_enabled, prev.salesEnabled),
        }));

        setPaymentSettings((prev) => ({
          ...prev,
          platformFeeXaf: String(settings.platform_fee_xaf ?? prev.platformFeeXaf),
          customerBookingFreeMode: toBool(settings.customer_booking_free_mode, prev.customerBookingFreeMode),
          customerPlatformAccessFeeEnabled: toBool(settings.customer_platform_access_fee_enabled, prev.customerPlatformAccessFeeEnabled),
          mesombAccessKey: String(settings.mesomb_access_key ?? prev.mesombAccessKey),
          mesombApplicationKey: String(settings.mesomb_application_key ?? prev.mesombApplicationKey),
          mesombSecretKey: String(settings.mesomb_secret_key ?? prev.mesombSecretKey),
          mesombLiveMode: toBool(settings.mesomb_live_mode, prev.mesombLiveMode),
          mesombDefaultService: String(settings.mesomb_default_service ?? prev.mesombDefaultService),
          mesombDefaultCountry: String(settings.mesomb_default_country ?? prev.mesombDefaultCountry),
        }));

        setLegalSettings((prev) => ({
          ...prev,
          termsEn: String(settings.legal_terms_content_en ?? prev.termsEn),
          termsFr: String(settings.legal_terms_content_fr ?? prev.termsFr),
          termsLastUpdated: ensureDate(settings.legal_terms_last_updated ?? prev.termsLastUpdated),
          privacyEn: String(settings.legal_privacy_content_en ?? prev.privacyEn),
          privacyFr: String(settings.legal_privacy_content_fr ?? prev.privacyFr),
          privacyLastUpdated: ensureDate(settings.legal_privacy_last_updated ?? prev.privacyLastUpdated),
        }));
      } catch {
        toast.error('Failed to load profile/settings');
      } finally {
        setLoading(false);
      }
    };

    loadProfileAndSettings();
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be less than 2MB');
      return;
    }

    setSelectedPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await profileService.updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        profile_photo: selectedPhoto || undefined,
      });

      setProfileData((prev) => ({ ...prev, avatar: updated.avatar }));
      setSelectedPhoto(null);
      setPhotoPreview(null);
      toast.success('Profile updated successfully.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.current_password || !passwordData.new_password) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await profileService.changePassword(passwordData);
      setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
      toast.success('Password changed successfully.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-2">Centralize payments, rollout strategy, legal pages, and platform behavior.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Legal Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={photoPreview || profileData.avatar || undefined} />
                        <AvatarFallback className="text-lg">{getInitials(profileData.name || 'A')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handlePhotoSelect}
                        />
                        <Button variant="outline" className="mb-2" onClick={() => fileInputRef.current?.click()}>
                          <Camera className="w-4 h-4 mr-2" />
                          Change Photo
                        </Button>
                        <p className="text-sm text-gray-500">JPG, PNG, WEBP. 2MB max.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="profileName">Full Name</Label>
                        <Input
                          id="profileName"
                          value={profileData.name}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profileEmail">Email</Label>
                        <Input id="profileEmail" type="email" value={profileData.email} disabled className="bg-gray-50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profilePhone">Phone</Label>
                        <Input
                          id="profilePhone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>

                    <Button onClick={handleSaveProfile} className="btn-primary" disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Profile
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="pr-10"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, current_password: e.target.value }))}
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-0 top-0 h-full px-3">
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      className="pr-10"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, new_password: e.target.value }))}
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-0 top-0 h-full px-3">
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="pr-10"
                      value={passwordData.new_password_confirmation}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, new_password_confirmation: e.target.value }))}
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-0 top-0 h-full px-3">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button onClick={handleChangePassword} className="btn-primary" disabled={changingPassword}>
                  {changingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Site Name</Label>
                    <Input value={platformSettings.siteName} onChange={(e) => setPlatformSettings((prev) => ({ ...prev, siteName: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Select value={platformSettings.defaultCurrency} onValueChange={(value) => setPlatformSettings((prev) => ({ ...prev, defaultCurrency: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XAF">XAF</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Language</Label>
                    <Select value={platformSettings.defaultLanguage} onValueChange={(value) => setPlatformSettings((prev) => ({ ...prev, defaultLanguage: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Francais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Site Description</Label>
                  <Textarea value={platformSettings.siteDescription} onChange={(e) => setPlatformSettings((prev) => ({ ...prev, siteDescription: e.target.value }))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <Label>Maintenance Mode</Label>
                    </div>
                    <Switch checked={platformSettings.maintenanceMode} onCheckedChange={(checked) => setPlatformSettings((prev) => ({ ...prev, maintenanceMode: checked }))} />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <Label>Allow Registration</Label>
                    </div>
                    <Switch checked={platformSettings.allowRegistration} onCheckedChange={(checked) => setPlatformSettings((prev) => ({ ...prev, allowRegistration: checked }))} />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <Label>Enable Landlord Listing</Label>
                    </div>
                    <Switch checked={platformSettings.enableLandlordListing} onCheckedChange={(checked) => setPlatformSettings((prev) => ({ ...prev, enableLandlordListing: checked }))} />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <Label>Enable Virtual Tours</Label>
                    </div>
                    <Switch checked={platformSettings.enableVirtualTours} onCheckedChange={(checked) => setPlatformSettings((prev) => ({ ...prev, enableVirtualTours: checked }))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Go-To-Market Rollout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Launch Cities (comma separated)</Label>
                  <Input
                    value={rolloutSettings.rolloutCities}
                    onChange={(e) => setRolloutSettings((prev) => ({ ...prev, rolloutCities: e.target.value }))}
                    placeholder="Douala, Bamenda"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <Label>Enforce City Scope</Label>
                    <Switch checked={rolloutSettings.enforceCityScope} onCheckedChange={(checked) => setRolloutSettings((prev) => ({ ...prev, enforceCityScope: checked }))} />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <Label>Rentals Only</Label>
                    <Switch checked={rolloutSettings.rentalsOnly} onCheckedChange={(checked) => setRolloutSettings((prev) => ({ ...prev, rentalsOnly: checked }))} />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <Label>Enable Hotels</Label>
                    <Switch checked={rolloutSettings.hotelEnabled} onCheckedChange={(checked) => setRolloutSettings((prev) => ({ ...prev, hotelEnabled: checked }))} />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <Label>Enable Property Sales</Label>
                    <Switch checked={rolloutSettings.salesEnabled} onCheckedChange={(checked) => setRolloutSettings((prev) => ({ ...prev, salesEnabled: checked }))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveGeneralSettings} className="btn-primary" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save General Settings
            </Button>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment & Access Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Platform Fee (XAF)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={paymentSettings.platformFeeXaf}
                      onChange={(e) => setPaymentSettings((prev) => ({ ...prev, platformFeeXaf: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Mobile Service</Label>
                    <Input
                      value={paymentSettings.mesombDefaultService}
                      onChange={(e) => setPaymentSettings((prev) => ({ ...prev, mesombDefaultService: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <Label>Customer Booking Free Mode</Label>
                    <Switch checked={paymentSettings.customerBookingFreeMode} onCheckedChange={(checked) => setPaymentSettings((prev) => ({ ...prev, customerBookingFreeMode: checked }))} />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <Label>Enable Platform Access Fee</Label>
                    <Switch checked={paymentSettings.customerPlatformAccessFeeEnabled} onCheckedChange={(checked) => setPaymentSettings((prev) => ({ ...prev, customerPlatformAccessFeeEnabled: checked }))} />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <Label>MeSomb Live Mode</Label>
                    <Switch checked={paymentSettings.mesombLiveMode} onCheckedChange={(checked) => setPaymentSettings((prev) => ({ ...prev, mesombLiveMode: checked }))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>MeSomb Access Key</Label>
                  <Input value={paymentSettings.mesombAccessKey} onChange={(e) => setPaymentSettings((prev) => ({ ...prev, mesombAccessKey: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>MeSomb Application Key</Label>
                  <Input value={paymentSettings.mesombApplicationKey} onChange={(e) => setPaymentSettings((prev) => ({ ...prev, mesombApplicationKey: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>MeSomb Secret Key</Label>
                  <Input type="password" value={paymentSettings.mesombSecretKey} onChange={(e) => setPaymentSettings((prev) => ({ ...prev, mesombSecretKey: e.target.value }))} />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSavePaymentSettings} className="btn-primary" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Payment Settings
            </Button>
          </TabsContent>

          <TabsContent value="legal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Terms & Privacy (Dynamic)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  These fields publish directly to `/terms` and `/privacy`. HTML formatting is supported.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Terms (English)</Label>
                    <Textarea rows={10} value={legalSettings.termsEn} onChange={(e) => setLegalSettings((prev) => ({ ...prev, termsEn: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Terms (French)</Label>
                    <Textarea rows={10} value={legalSettings.termsFr} onChange={(e) => setLegalSettings((prev) => ({ ...prev, termsFr: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Privacy (English)</Label>
                    <Textarea rows={10} value={legalSettings.privacyEn} onChange={(e) => setLegalSettings((prev) => ({ ...prev, privacyEn: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Privacy (French)</Label>
                    <Textarea rows={10} value={legalSettings.privacyFr} onChange={(e) => setLegalSettings((prev) => ({ ...prev, privacyFr: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Terms Last Updated</Label>
                    <Input type="date" value={legalSettings.termsLastUpdated} onChange={(e) => setLegalSettings((prev) => ({ ...prev, termsLastUpdated: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Privacy Last Updated</Label>
                    <Input type="date" value={legalSettings.privacyLastUpdated} onChange={(e) => setLegalSettings((prev) => ({ ...prev, privacyLastUpdated: e.target.value }))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview (English)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Terms Preview</h4>
                  <div className="prose prose-gray max-w-none border rounded-lg p-4" dangerouslySetInnerHTML={{ __html: previewLegal.terms }} />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Privacy Preview</h4>
                  <div className="prose prose-gray max-w-none border rounded-lg p-4" dangerouslySetInnerHTML={{ __html: previewLegal.privacy }} />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveLegalSettings} className="btn-primary" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Publish Legal Content
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
