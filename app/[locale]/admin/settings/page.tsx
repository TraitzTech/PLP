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
import { Save, Settings, DollarSign, FileText, User, Users, Camera, Eye, EyeOff, Loader2 } from 'lucide-react';
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

  const [contactSettings, setContactSettings] = useState({
    primaryPhone: '+237680090360',
    secondaryPhone: '+237659471779',
    whatsappPhone: '+237680090360',
    supportEmail: 'support@plplistings.com',
    contactEmail: 'info@plplistings.com',
    officeAddress: 'ENS Street Bambili, Bamenda, Cameroon',
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

  const [homepageSettings, setHomepageSettings] = useState({
    whyUsePoints: [
      'Verified Property Listings',
      'Direct Contact with Trusted Agents and Landlords',
      'Simple and Fast Property Search',
      'Safe and Transparent Property Discovery',
    ].join('\n'),
    citiesCovered: 'Douala, Bamenda',
    numbersPropertiesListed: '50000',
    numbersVerifiedAgents: '25000',
    numbersCitiesCovered: '100',
    numbersMonthlyVisitors: '1200',
    featuredAgentId: '',
    recentPropertiesLimit: '8',
  });

  const [aboutPageSettings, setAboutPageSettings] = useState({
    missionTitle: 'Our Mission',
    missionDescription: 'To make finding and listing properties in Cameroon simple, trusted, and transparent for everyone.',
    visionTitle: 'Our Vision',
    visionDescription: 'To become the most trusted property discovery platform in Cameroon and beyond.',
    journeyTitle: 'Our Journey',
    journeyItemsJson: JSON.stringify([
      { year: '2020', title: 'Platform Idea', description: 'PLP started with a mission to simplify property discovery.' },
      { year: '2021', title: 'Early Listings', description: 'Our first partner agents listed properties in key cities.' },
    ], null, 2),
    teamTitle: 'Meet Our Team',
    teamDescription: 'The people building a better property platform for Cameroon.',
    teamMembersJson: JSON.stringify([
      { name: 'Team Member 1', role: 'Founder', image: '', description: 'Leads product and strategy.', link: '' },
    ], null, 2),
    statsItemsJson: JSON.stringify([
      { label: 'Properties Listed', number: '50000+' },
      { label: 'Cities Covered', number: '100+' },
      { label: 'Countries Reached', number: '10+' },
      { label: 'Trusted Agents', number: '25000+' },
    ], null, 2),
    ctaTitle: 'Start Your Property Journey Today',
    ctaDescription: 'Explore listings, connect with providers, and find your next property with PLP.',
    ctaButtonText: 'Start Your Journey',
    ctaButtonLink: '/search',
    howStepsTitle: 'How the Platform Works',
    howStepsDescription: 'From search to booking, discover properties with a simple and transparent process.',
    howStepsJson: JSON.stringify([
      { accent: 'Step 1', title: 'Search', description: 'Use filters for city, price, and property type to find what fits.' },
      { accent: 'Step 2', title: 'Identify', description: 'Open listing details and compare options with confidence.' },
      { accent: 'Step 3', title: 'Contact Agent', description: 'Reach the agent directly through WhatsApp or listed contact channels.' },
      { accent: 'Step 4', title: 'Book or Proceed', description: 'Confirm booking or continue the purchase/rental process safely.' },
    ], null, 2),
    popularSearchesTitle: 'Popular Searches',
    popularSearchesJson: JSON.stringify([
      { label: '2 Bedroom Apartments in Douala', link: '/search?type=apartment&location=Douala&purpose=rent' },
      { label: 'Affordable Rooms in Bamenda', link: '/search?location=Bamenda&purpose=rent' },
    ], null, 2),
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
        saveSetting('site_phone', contactSettings.primaryPhone, 'string', 'general'),
        saveSetting('support_phone_secondary', contactSettings.secondaryPhone, 'string', 'general'),
        saveSetting('support_whatsapp_phone', contactSettings.whatsappPhone, 'string', 'general'),
        saveSetting('support_email', contactSettings.supportEmail, 'string', 'general'),
        saveSetting('contact_email', contactSettings.contactEmail, 'string', 'general'),
        saveSetting('site_email', contactSettings.contactEmail, 'string', 'general'),
        saveSetting('site_address', contactSettings.officeAddress, 'string', 'general'),
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

  const handleSaveHomepageSettings = async () => {
    try {
      setSaving(true);

      const whyUsePoints = homepageSettings.whyUsePoints
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const citiesCovered = homepageSettings.citiesCovered
        .split(',')
        .map((city) => city.trim())
        .filter(Boolean);

      await Promise.all([
        saveSetting('homepage_why_use_points', whyUsePoints, 'json', 'homepage'),
        saveSetting('homepage_cities_covered', citiesCovered, 'json', 'homepage'),
        saveSetting('homepage_numbers_properties_listed', Number(homepageSettings.numbersPropertiesListed || 0), 'integer', 'homepage'),
        saveSetting('homepage_numbers_verified_agents', Number(homepageSettings.numbersVerifiedAgents || 0), 'integer', 'homepage'),
        saveSetting('homepage_numbers_cities_covered', Number(homepageSettings.numbersCitiesCovered || 0), 'integer', 'homepage'),
        saveSetting('homepage_numbers_monthly_visitors', Number(homepageSettings.numbersMonthlyVisitors || 0), 'integer', 'homepage'),
        saveSetting('homepage_featured_agent_id', Number(homepageSettings.featuredAgentId || 0), 'integer', 'homepage'),
        saveSetting('homepage_recent_properties_limit', Number(homepageSettings.recentPropertiesLimit || 8), 'integer', 'homepage'),
      ]);

      toast.success('Homepage content settings updated.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save homepage settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAboutPageSettings = async () => {
    try {
      setSaving(true);

      const parseJsonArray = (raw: string, fieldName: string) => {
        const parsed = JSON.parse(raw || '[]');
        if (!Array.isArray(parsed)) {
          throw new Error(`${fieldName} must be a JSON array.`);
        }
        return parsed;
      };

      const journeyItems = parseJsonArray(aboutPageSettings.journeyItemsJson, 'Journey items');
      const teamMembers = parseJsonArray(aboutPageSettings.teamMembersJson, 'Team members');
      const statsItems = parseJsonArray(aboutPageSettings.statsItemsJson, 'Stats items');
      const howSteps = parseJsonArray(aboutPageSettings.howStepsJson, 'How it works steps');

      await Promise.all([
        saveSetting('about_mission_title', aboutPageSettings.missionTitle, 'string', 'about'),
        saveSetting('about_mission_description', aboutPageSettings.missionDescription, 'string', 'about'),
        saveSetting('about_vision_title', aboutPageSettings.visionTitle, 'string', 'about'),
        saveSetting('about_vision_description', aboutPageSettings.visionDescription, 'string', 'about'),
        saveSetting('about_journey_title', aboutPageSettings.journeyTitle, 'string', 'about'),
        saveSetting('about_journey_items', journeyItems, 'json', 'about'),
        saveSetting('about_team_title', aboutPageSettings.teamTitle, 'string', 'about'),
        saveSetting('about_team_description', aboutPageSettings.teamDescription, 'string', 'about'),
        saveSetting('about_team_members', teamMembers, 'json', 'about'),
        saveSetting('about_stats_items', statsItems, 'json', 'about'),
        saveSetting('about_cta_title', aboutPageSettings.ctaTitle, 'string', 'about'),
        saveSetting('about_cta_description', aboutPageSettings.ctaDescription, 'string', 'about'),
        saveSetting('about_cta_button_text', aboutPageSettings.ctaButtonText, 'string', 'about'),
        saveSetting('about_cta_button_link', aboutPageSettings.ctaButtonLink, 'string', 'about'),
        saveSetting('platform_how_steps_title', aboutPageSettings.howStepsTitle, 'string', 'about'),
        saveSetting('platform_how_steps_description', aboutPageSettings.howStepsDescription, 'string', 'about'),
        saveSetting('platform_how_steps_items', howSteps, 'json', 'about'),
        saveSetting('platform_popular_searches_title', aboutPageSettings.popularSearchesTitle, 'string', 'about'),
      ]);

      toast.success('About page settings updated.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save about page settings');
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

        setContactSettings((prev) => ({
          ...prev,
          primaryPhone: String(settings.site_phone ?? prev.primaryPhone),
          secondaryPhone: String(settings.support_phone_secondary ?? prev.secondaryPhone),
          whatsappPhone: String(settings.support_whatsapp_phone ?? settings.site_phone ?? prev.whatsappPhone),
          supportEmail: String(settings.support_email ?? settings.site_email ?? prev.supportEmail),
          contactEmail: String(settings.contact_email ?? settings.site_email ?? prev.contactEmail),
          officeAddress: String(settings.site_address ?? prev.officeAddress),
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

        setHomepageSettings((prev) => ({
          ...prev,
          whyUsePoints: Array.isArray(settings.homepage_why_use_points)
            ? settings.homepage_why_use_points.join('\n')
            : prev.whyUsePoints,
          citiesCovered: Array.isArray(settings.homepage_cities_covered)
            ? settings.homepage_cities_covered.join(', ')
            : prev.citiesCovered,
          numbersPropertiesListed: String(settings.homepage_numbers_properties_listed ?? prev.numbersPropertiesListed),
          numbersVerifiedAgents: String(settings.homepage_numbers_verified_agents ?? prev.numbersVerifiedAgents),
          numbersCitiesCovered: String(settings.homepage_numbers_cities_covered ?? prev.numbersCitiesCovered),
          numbersMonthlyVisitors: String(settings.homepage_numbers_monthly_visitors ?? prev.numbersMonthlyVisitors),
          featuredAgentId: String(settings.homepage_featured_agent_id ?? prev.featuredAgentId),
          recentPropertiesLimit: String(settings.homepage_recent_properties_limit ?? prev.recentPropertiesLimit),
        }));

        setAboutPageSettings((prev) => ({
          ...prev,
          missionTitle: String(settings.about_mission_title ?? prev.missionTitle),
          missionDescription: String(settings.about_mission_description ?? prev.missionDescription),
          visionTitle: String(settings.about_vision_title ?? prev.visionTitle),
          visionDescription: String(settings.about_vision_description ?? prev.visionDescription),
          journeyTitle: String(settings.about_journey_title ?? prev.journeyTitle),
          journeyItemsJson: Array.isArray(settings.about_journey_items)
            ? JSON.stringify(settings.about_journey_items, null, 2)
            : prev.journeyItemsJson,
          teamTitle: String(settings.about_team_title ?? prev.teamTitle),
          teamDescription: String(settings.about_team_description ?? prev.teamDescription),
          teamMembersJson: Array.isArray(settings.about_team_members)
            ? JSON.stringify(settings.about_team_members, null, 2)
            : prev.teamMembersJson,
          statsItemsJson: Array.isArray(settings.about_stats_items)
            ? JSON.stringify(settings.about_stats_items, null, 2)
            : prev.statsItemsJson,
          ctaTitle: String(settings.about_cta_title ?? prev.ctaTitle),
          ctaDescription: String(settings.about_cta_description ?? prev.ctaDescription),
          ctaButtonText: String(settings.about_cta_button_text ?? prev.ctaButtonText),
          ctaButtonLink: String(settings.about_cta_button_link ?? prev.ctaButtonLink),
          howStepsTitle: String(settings.platform_how_steps_title ?? prev.howStepsTitle),
          howStepsDescription: String(settings.platform_how_steps_description ?? prev.howStepsDescription),
          howStepsJson: Array.isArray(settings.platform_how_steps_items)
            ? JSON.stringify(settings.platform_how_steps_items, null, 2)
            : prev.howStepsJson,
          popularSearchesTitle: String(settings.platform_popular_searches_title ?? prev.popularSearchesTitle),
          popularSearchesJson: Array.isArray(settings.platform_popular_searches_items)
            ? JSON.stringify(settings.platform_popular_searches_items, null, 2)
            : prev.popularSearchesJson,
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
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="profile" className="flex h-auto w-full items-center justify-center gap-2 whitespace-normal px-2 py-2 text-center">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="general" className="flex h-auto w-full items-center justify-center gap-2 whitespace-normal px-2 py-2 text-center">
              <Settings className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex h-auto w-full items-center justify-center gap-2 whitespace-normal px-2 py-2 text-center">
              <DollarSign className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="homepage" className="flex h-auto w-full items-center justify-center gap-2 whitespace-normal px-2 py-2 text-center">
              <Settings className="w-4 h-4" />
              Homepage
            </TabsTrigger>
            <TabsTrigger value="about" className="flex h-auto w-full items-center justify-center gap-2 whitespace-normal px-2 py-2 text-center">
              <Users className="w-4 h-4" />
              About
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex h-auto w-full items-center justify-center gap-2 whitespace-normal px-2 py-2 text-center">
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

            <Card>
              <CardHeader>
                <CardTitle>Contact & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Phone (MTN)</Label>
                    <Input
                      value={contactSettings.primaryPhone}
                      onChange={(e) => setContactSettings((prev) => ({ ...prev, primaryPhone: e.target.value }))}
                      placeholder="+237680090360"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Phone (Orange)</Label>
                    <Input
                      value={contactSettings.secondaryPhone}
                      onChange={(e) => setContactSettings((prev) => ({ ...prev, secondaryPhone: e.target.value }))}
                      placeholder="+237659471779"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp Support Phone</Label>
                    <Input
                      value={contactSettings.whatsappPhone}
                      onChange={(e) => setContactSettings((prev) => ({ ...prev, whatsappPhone: e.target.value }))}
                      placeholder="+237680090360"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input
                      type="email"
                      value={contactSettings.supportEmail}
                      onChange={(e) => setContactSettings((prev) => ({ ...prev, supportEmail: e.target.value }))}
                      placeholder="support@plplistings.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input
                      type="email"
                      value={contactSettings.contactEmail}
                      onChange={(e) => setContactSettings((prev) => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="info@plplistings.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Office Address</Label>
                  <Textarea
                    rows={3}
                    value={contactSettings.officeAddress}
                    onChange={(e) => setContactSettings((prev) => ({ ...prev, officeAddress: e.target.value }))}
                    placeholder="ENS Street Bambili, Bamenda, Cameroon"
                  />
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

          <TabsContent value="homepage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Homepage Dynamic Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Why Use PLP Points (one per line)</Label>
                  <Textarea
                    rows={6}
                    value={homepageSettings.whyUsePoints}
                    onChange={(e) => setHomepageSettings((prev) => ({ ...prev, whyUsePoints: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cities Covered (comma separated)</Label>
                  <Input
                    value={homepageSettings.citiesCovered}
                    onChange={(e) => setHomepageSettings((prev) => ({ ...prev, citiesCovered: e.target.value }))}
                    placeholder="Douala, Bamenda"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Properties Listed</Label>
                    <Input
                      type="number"
                      min="0"
                      value={homepageSettings.numbersPropertiesListed}
                      onChange={(e) => setHomepageSettings((prev) => ({ ...prev, numbersPropertiesListed: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Happy Customers</Label>
                    <Input
                      type="number"
                      min="0"
                      value={homepageSettings.numbersVerifiedAgents}
                      onChange={(e) => setHomepageSettings((prev) => ({ ...prev, numbersVerifiedAgents: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cities Covered (Number)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={homepageSettings.numbersCitiesCovered}
                      onChange={(e) => setHomepageSettings((prev) => ({ ...prev, numbersCitiesCovered: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Visitors</Label>
                    <Input
                      type="number"
                      min="0"
                      value={homepageSettings.numbersMonthlyVisitors}
                      onChange={(e) => setHomepageSettings((prev) => ({ ...prev, numbersMonthlyVisitors: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Featured Agent ID (optional)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={homepageSettings.featuredAgentId}
                      onChange={(e) => setHomepageSettings((prev) => ({ ...prev, featuredAgentId: e.target.value }))}
                      placeholder="0 = auto-select top agent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Recent Properties Limit</Label>
                    <Input
                      type="number"
                      min="1"
                      max="24"
                      value={homepageSettings.recentPropertiesLimit}
                      onChange={(e) => setHomepageSettings((prev) => ({ ...prev, recentPropertiesLimit: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveHomepageSettings} className="btn-primary" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Homepage Settings
            </Button>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mission & Vision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mission Title</Label>
                    <Input value={aboutPageSettings.missionTitle} onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, missionTitle: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Vision Title</Label>
                    <Input value={aboutPageSettings.visionTitle} onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, visionTitle: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Mission Description</Label>
                    <Textarea rows={4} value={aboutPageSettings.missionDescription} onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, missionDescription: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Vision Description</Label>
                    <Textarea rows={4} value={aboutPageSettings.visionDescription} onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, visionDescription: e.target.value }))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Journey & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Journey Section Title</Label>
                  <Input value={aboutPageSettings.journeyTitle} onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, journeyTitle: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Journey Items (JSON Array)</Label>
                  <Textarea
                    rows={8}
                    value={aboutPageSettings.journeyItemsJson}
                    onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, journeyItemsJson: e.target.value }))}
                    placeholder='[{"year":"2020","title":"Platform Idea","description":"..."}]'
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Team Section Title</Label>
                    <Input value={aboutPageSettings.teamTitle} onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, teamTitle: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Team Section Description</Label>
                    <Input value={aboutPageSettings.teamDescription} onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, teamDescription: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Team Members (JSON Array)</Label>
                  <Textarea
                    rows={10}
                    value={aboutPageSettings.teamMembersJson}
                    onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, teamMembersJson: e.target.value }))}
                    placeholder='[{"name":"Jane Doe","role":"Founder","image":"https://...","description":"...","link":"https://..."}]'
                  />
                  <p className="text-xs text-gray-500">Each item supports: name, role, image, description, link (portfolio/social/WhatsApp).</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stats & CTA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Stats Items (JSON Array)</Label>
                  <Textarea
                    rows={7}
                    value={aboutPageSettings.statsItemsJson}
                    onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, statsItemsJson: e.target.value }))}
                    placeholder='[{"label":"Properties Listed","number":"50000+"}]'
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CTA Title</Label>
                    <Input value={aboutPageSettings.ctaTitle} onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, ctaTitle: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Button Text</Label>
                    <Input value={aboutPageSettings.ctaButtonText} onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, ctaButtonText: e.target.value }))} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>CTA Description</Label>
                    <Textarea rows={3} value={aboutPageSettings.ctaDescription} onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, ctaDescription: e.target.value }))} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>CTA Button Link</Label>
                    <Input value={aboutPageSettings.ctaButtonLink} onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, ctaButtonLink: e.target.value }))} placeholder="/search" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works (Shared Section)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={aboutPageSettings.howStepsTitle}
                      onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, howStepsTitle: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Description</Label>
                    <Input
                      value={aboutPageSettings.howStepsDescription}
                      onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, howStepsDescription: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Steps Items (JSON Array)</Label>
                  <Textarea
                    rows={10}
                    value={aboutPageSettings.howStepsJson}
                    onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, howStepsJson: e.target.value }))}
                    placeholder='[{"accent":"Step 1","title":"Search","description":"..."}]'
                  />
                  <p className="text-xs text-gray-500">Each step supports: accent, title, description.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Searches (Homepage Section)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={aboutPageSettings.popularSearchesTitle}
                    onChange={(e) => setAboutPageSettings((prev) => ({ ...prev, popularSearchesTitle: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Popular Searches (JSON Array)</Label>
                  <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Popular searches are now generated automatically from real user queries. The homepage shows the live top 5 queries.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveAboutPageSettings} className="btn-primary" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save About Settings
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
