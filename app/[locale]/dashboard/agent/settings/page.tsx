'use client'

import React, { useState, useEffect, useRef } from 'react';
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
import { User, Bell, Shield, DollarSign, Globe, Camera, Save, Eye, EyeOff, Building2, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { profileService } from '@/services/profileService';

export default function AgentSettingsPage() {
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
    bio: '',
    company: '',
    licenseNumber: '',
    avatar: null as string | null,
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [businessSettings, setBusinessSettings] = useState({
    commissionRate: 15,
    autoAcceptBookings: false,
    requireDeposit: true,
    depositPercentage: 30,
    cancellationPolicy: 'moderate',
    minimumStay: 1,
    maximumStay: 30,
    checkInTime: '15:00',
    checkOutTime: '11:00',
  });

  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailMessages: true,
    emailReviews: true,
    emailPromotions: false,
    pushBookings: true,
    pushMessages: true,
    pushReviews: true,
    smsBookings: true,
    smsMessages: false,
    smsUrgent: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: true,
    showCompany: true,
    allowDirectContact: true,
    showPerformanceStats: true,
    allowReviews: true,
  });

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
          company: data.company || '',
          licenseNumber: data.license_number || '',
          avatar: data.avatar,
        });
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Photo must be less than 2MB');
        return;
      }
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await profileService.updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        bio: profileData.bio,
        profile_photo: selectedPhoto || undefined,
      });
      setProfileData(prev => ({ ...prev, avatar: updated.avatar }));
      setSelectedPhoto(null);
      setPhotoPreview(null);
      // Update localStorage so sidebar avatar refreshes
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const user = JSON.parse(stored);
          user.name = updated.name || profileData.name;
          user.avatar = updated.avatar;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch {}
      toast.success('Profil mis à jour avec succès!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBusinessSettings = () => {
    toast.success('Paramètres commerciaux mis à jour!');
  };

  const handleSaveNotifications = () => {
    toast.success('Préférences de notification mises à jour!');
  };

  const handleSavePrivacy = () => {
    toast.success('Paramètres de confidentialité mis à jour!');
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
      toast.success('Mot de passe modifié avec succès!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres du Compte</h1>
          <p className="text-gray-600 mt-2">Gérez vos paramètres de profil et préférences commerciales.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Commercial
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Confidentialité
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Préférences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du Profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  </div>
                ) : (
                  <>
                    {/* Avatar Section */}
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={photoPreview || profileData.avatar || undefined} />
                        <AvatarFallback className="text-lg">{getInitials(profileData.name || 'U')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="hidden"
                          onChange={handlePhotoSelect}
                        />
                        <Button variant="outline" className="mb-2" onClick={() => fileInputRef.current?.click()}>
                          <Camera className="w-4 h-4 mr-2" />
                          Changer la Photo
                        </Button>
                        <p className="text-sm text-gray-500">JPG, GIF ou PNG. 2MB max.</p>
                        {selectedPhoto && (
                          <p className="text-sm text-green-600 mt-1">Photo sélectionnée: {selectedPhoto.name}</p>
                        )}
                      </div>
                    </div>

                    {/* Profile Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom Complet</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                        <p className="text-xs text-gray-500">L&apos;email ne peut pas être modifié</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Entreprise</Label>
                        <Input
                          id="company"
                          value={profileData.company}
                          disabled
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="licenseNumber">Numéro de Licence</Label>
                        <Input
                          id="licenseNumber"
                          value={profileData.licenseNumber}
                          disabled
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Biographie Professionnelle</Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Décrivez votre expérience et expertise..."
                          rows={4}
                        />
                      </div>
                    </div>

                    <Button onClick={handleSaveProfile} className="btn-primary" disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      {saving ? 'Enregistrement...' : 'Sauvegarder les Modifications'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>Changer le Mot de Passe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de Passe Actuel</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="pr-10"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-0 top-0 h-full px-3"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau Mot de Passe</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      className="pr-10"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-0 top-0 h-full px-3"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le Nouveau Mot de Passe</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="pr-10"
                      value={passwordData.new_password_confirmation}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, new_password_confirmation: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-0 h-full px-3"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button onClick={handleChangePassword} className="btn-primary" disabled={changingPassword}>
                  {changingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {changingPassword ? 'Modification...' : 'Changer le Mot de Passe'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Settings Tab */}
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres Commerciaux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="commissionRate">Taux de Commission (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      value={businessSettings.commissionRate}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, commissionRate: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="depositPercentage">Pourcentage d'Acompte (%)</Label>
                    <Input
                      id="depositPercentage"
                      type="number"
                      value={businessSettings.depositPercentage}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, depositPercentage: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumStay">Séjour Minimum (nuits)</Label>
                    <Input
                      id="minimumStay"
                      type="number"
                      value={businessSettings.minimumStay}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, minimumStay: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maximumStay">Séjour Maximum (nuits)</Label>
                    <Input
                      id="maximumStay"
                      type="number"
                      value={businessSettings.maximumStay}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, maximumStay: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkInTime">Heure d'Arrivée</Label>
                    <Input
                      id="checkInTime"
                      type="time"
                      value={businessSettings.checkInTime}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, checkInTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkOutTime">Heure de Départ</Label>
                    <Input
                      id="checkOutTime"
                      type="time"
                      value={businessSettings.checkOutTime}
                      onChange={(e) => setBusinessSettings(prev => ({ ...prev, checkOutTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Acceptation Automatique des Réservations</Label>
                      <p className="text-sm text-gray-500">Accepter automatiquement les nouvelles réservations</p>
                    </div>
                    <Switch
                      checked={businessSettings.autoAcceptBookings}
                      onCheckedChange={(checked) => setBusinessSettings(prev => ({ ...prev, autoAcceptBookings: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Exiger un Acompte</Label>
                      <p className="text-sm text-gray-500">Demander un acompte pour confirmer les réservations</p>
                    </div>
                    <Switch
                      checked={businessSettings.requireDeposit}
                      onCheckedChange={(checked) => setBusinessSettings(prev => ({ ...prev, requireDeposit: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellationPolicy">Politique d'Annulation</Label>
                  <Select
                    value={businessSettings.cancellationPolicy}
                    onValueChange={(value) => setBusinessSettings(prev => ({ ...prev, cancellationPolicy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flexible">Flexible</SelectItem>
                      <SelectItem value="moderate">Modérée</SelectItem>
                      <SelectItem value="strict">Stricte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSaveBusinessSettings} className="btn-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder les Paramètres
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nouvelles Réservations</Label>
                    <p className="text-sm text-gray-500">Recevoir un email pour chaque nouvelle réservation</p>
                  </div>
                  <Switch
                    checked={notifications.emailBookings}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailBookings: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Messages Clients</Label>
                    <p className="text-sm text-gray-500">Recevoir les nouveaux messages des clients</p>
                  </div>
                  <Switch
                    checked={notifications.emailMessages}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailMessages: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Avis et Évaluations</Label>
                    <p className="text-sm text-gray-500">Notifications des nouveaux avis clients</p>
                  </div>
                  <Switch
                    checked={notifications.emailReviews}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailReviews: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Promotions et Offres</Label>
                    <p className="text-sm text-gray-500">Offres spéciales et promotions de la plateforme</p>
                  </div>
                  <Switch
                    checked={notifications.emailPromotions}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailPromotions: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications SMS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Réservations Urgentes</Label>
                    <p className="text-sm text-gray-500">SMS pour les réservations de dernière minute</p>
                  </div>
                  <Switch
                    checked={notifications.smsBookings}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, smsBookings: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Messages Urgents</Label>
                    <p className="text-sm text-gray-500">SMS pour les messages clients urgents</p>
                  </div>
                  <Switch
                    checked={notifications.smsUrgent}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, smsUrgent: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveNotifications} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder les Préférences
            </Button>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Confidentialité du Profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Visibilité du Profil</Label>
                  <Select
                    value={privacy.profileVisibility}
                    onValueChange={(value) => setPrivacy(prev => ({ ...prev, profileVisibility: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="clients">Clients Seulement</SelectItem>
                      <SelectItem value="private">Privé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Afficher l'Email</Label>
                    <p className="text-sm text-gray-500">Permettre aux clients de voir votre email</p>
                  </div>
                  <Switch
                    checked={privacy.showEmail}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showEmail: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Afficher le Téléphone</Label>
                    <p className="text-sm text-gray-500">Permettre aux clients de voir votre numéro</p>
                  </div>
                  <Switch
                    checked={privacy.showPhone}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showPhone: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Afficher l'Entreprise</Label>
                    <p className="text-sm text-gray-500">Afficher le nom de votre entreprise</p>
                  </div>
                  <Switch
                    checked={privacy.showCompany}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showCompany: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Contact Direct</Label>
                    <p className="text-sm text-gray-500">Permettre aux clients de vous contacter directement</p>
                  </div>
                  <Switch
                    checked={privacy.allowDirectContact}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, allowDirectContact: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Statistiques de Performance</Label>
                    <p className="text-sm text-gray-500">Afficher vos statistiques publiquement</p>
                  </div>
                  <Switch
                    checked={privacy.showPerformanceStats}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showPerformanceStats: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSavePrivacy} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder les Paramètres
            </Button>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences Régionales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select defaultValue="fr">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select defaultValue="XAF">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XAF">XAF (Franc CFA)</SelectItem>
                      <SelectItem value="USD">USD (Dollar US)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fuseau Horaire</Label>
                  <Select defaultValue="Africa/Douala">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Douala">Africa/Douala (WAT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Button className="btn-primary" onClick={() => toast.success('Préférences sauvegardées!')}>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder les Préférences
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}