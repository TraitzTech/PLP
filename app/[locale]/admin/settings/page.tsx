'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Globe, DollarSign, Shield, Mail, Bell, Save, Database, Users, Building2 } from 'lucide-react';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [platformSettings, setPlatformSettings] = useState({
    siteName: 'Property Listing Portal',
    siteDescription: 'The trusted bridge for seamless property listing, booking, and discovery.',
    defaultCurrency: 'XAF',
    defaultLanguage: 'en',
    timezone: 'Africa/Douala',
    commissionRate: 10,
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    autoApproveProperties: false,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: 'noreply@propertylistingportal.com',
    smtpPassword: '••••••••',
    fromEmail: 'noreply@propertylistingportal.com',
    fromName: 'Property Listing Portal',
  });

  const [paymentSettings, setPaymentSettings] = useState({
    stripePublishableKey: 'pk_test_••••••••',
    stripeSecretKey: 'sk_test_••••••••',
    paypalClientId: '••••••••',
    paypalClientSecret: '••••••••',
    enableStripe: true,
    enablePaypal: true,
    enableBankTransfer: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    requireTwoFactor: false,
    passwordMinLength: 8,
    enableCaptcha: true,
    allowGuestBooking: false,
  });

  const handleSavePlatformSettings = () => {
    toast.success('Platform settings updated successfully!');
  };

  const handleSaveEmailSettings = () => {
    toast.success('Email settings updated successfully!');
  };

  const handleSavePaymentSettings = () => {
    toast.success('Payment settings updated successfully!');
  };

  const handleSaveSecuritySettings = () => {
    toast.success('Security settings updated successfully!');
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-2">Configure platform-wide settings and preferences.</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={platformSettings.siteName}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <Select
                      value={platformSettings.defaultCurrency}
                      onValueChange={(value) => setPlatformSettings(prev => ({ ...prev, defaultCurrency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XAF">XAF (Central African CFA Franc)</SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultLanguage">Default Language</Label>
                    <Select
                      value={platformSettings.defaultLanguage}
                      onValueChange={(value) => setPlatformSettings(prev => ({ ...prev, defaultLanguage: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      value={platformSettings.commissionRate}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, commissionRate: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={platformSettings.siteDescription}
                    onChange={(e) => setPlatformSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Temporarily disable the platform for maintenance</p>
                  </div>
                  <Switch
                    checked={platformSettings.maintenanceMode}
                    onCheckedChange={(checked) => setPlatformSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow User Registration</Label>
                    <p className="text-sm text-gray-500">Enable new user signups</p>
                  </div>
                  <Switch
                    checked={platformSettings.allowRegistration}
                    onCheckedChange={(checked) => setPlatformSettings(prev => ({ ...prev, allowRegistration: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-approve Properties</Label>
                    <p className="text-sm text-gray-500">Automatically approve new property listings</p>
                  </div>
                  <Switch
                    checked={platformSettings.autoApproveProperties}
                    onCheckedChange={(checked) => setPlatformSettings(prev => ({ ...prev, autoApproveProperties: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSavePlatformSettings} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Platform Settings
            </Button>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SMTP Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input
                      id="smtpUsername"
                      value={emailSettings.smtpUsername}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={emailSettings.fromName}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveEmailSettings} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Email Settings
            </Button>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Gateway Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Stripe</Label>
                      <p className="text-sm text-gray-500">Accept credit card payments via Stripe</p>
                    </div>
                    <Switch
                      checked={paymentSettings.enableStripe}
                      onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, enableStripe: checked }))}
                    />
                  </div>
                  
                  {paymentSettings.enableStripe && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-gray-200">
                      <div className="space-y-2">
                        <Label htmlFor="stripePublishableKey">Stripe Publishable Key</Label>
                        <Input
                          id="stripePublishableKey"
                          value={paymentSettings.stripePublishableKey}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripePublishableKey: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                        <Input
                          id="stripeSecretKey"
                          type="password"
                          value={paymentSettings.stripeSecretKey}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable PayPal</Label>
                      <p className="text-sm text-gray-500">Accept payments via PayPal</p>
                    </div>
                    <Switch
                      checked={paymentSettings.enablePaypal}
                      onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, enablePaypal: checked }))}
                    />
                  </div>
                  
                  {paymentSettings.enablePaypal && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-gray-200">
                      <div className="space-y-2">
                        <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                        <Input
                          id="paypalClientId"
                          value={paymentSettings.paypalClientId}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypalClientId: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paypalClientSecret">PayPal Client Secret</Label>
                        <Input
                          id="paypalClientSecret"
                          type="password"
                          value={paymentSettings.paypalClientSecret}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypalClientSecret: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Bank Transfer</Label>
                    <p className="text-sm text-gray-500">Allow direct bank transfers</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableBankTransfer}
                    onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, enableBankTransfer: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSavePaymentSettings} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Payment Settings
            </Button>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Force 2FA for all admin accounts</p>
                    </div>
                    <Switch
                      checked={securitySettings.requireTwoFactor}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireTwoFactor: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable CAPTCHA</Label>
                      <p className="text-sm text-gray-500">Require CAPTCHA for login and registration</p>
                    </div>
                    <Switch
                      checked={securitySettings.enableCaptcha}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableCaptcha: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Guest Booking</Label>
                      <p className="text-sm text-gray-500">Allow bookings without registration</p>
                    </div>
                    <Switch
                      checked={securitySettings.allowGuestBooking}
                      onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, allowGuestBooking: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveSecuritySettings} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Security Settings
            </Button>
          </TabsContent>

          {/* Database Settings */}
          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Users className="w-12 h-12 text-plp-purple mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Users</h3>
                      <p className="text-2xl font-bold text-gray-900">12,450</p>
                      <p className="text-sm text-gray-500">Total registered users</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Building2 className="w-12 h-12 text-plp-pink mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Properties</h3>
                      <p className="text-2xl font-bold text-gray-900">3,280</p>
                      <p className="text-sm text-gray-500">Total property listings</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="w-12 h-12 text-plp-yellow mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Bookings</h3>
                      <p className="text-2xl font-bold text-gray-900">8,920</p>
                      <p className="text-sm text-gray-500">Total bookings made</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Database Backup</h4>
                      <p className="text-sm text-gray-500">Last backup: 2 hours ago</p>
                    </div>
                    <Button variant="outline">Create Backup</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Database Optimization</h4>
                      <p className="text-sm text-gray-500">Optimize database performance</p>
                    </div>
                    <Button variant="outline">Optimize Now</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Clear Cache</h4>
                      <p className="text-sm text-gray-500">Clear application cache</p>
                    </div>
                    <Button variant="outline">Clear Cache</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}