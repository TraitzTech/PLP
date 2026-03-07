'use client';

import React, { useState } from 'react';
import { useTranslations } from '@/components/translation-provider';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Cookie, Settings, Shield, ChartBar as BarChart3, Target, Save } from 'lucide-react';
import { toast } from 'sonner';

const cookieTypeIcons = [Shield, BarChart3, Target, Settings];
const cookieTypeRequired = [true, false, false, false];

export default function CookiesPage() {
  const t = useTranslations();
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always required
    analytics: true,
    marketing: false,
    personalization: true,
  });

  const handleSavePreferences = () => {
    // Save preferences to localStorage
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    toast.success(t('cookies.preferences.success'));
  };

  const handlePreferenceChange = (type: string, value: boolean) => {
    setCookiePreferences(prev => ({ ...prev, [type]: value }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-plp-purple via-plp-pink to-plp-yellow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                <Cookie className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-white">
                {t('cookies.title')}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {t('cookies.subtitle')}
              </p>
              <Badge className="bg-white/20 text-white border-white/30">
                {t('cookies.lastUpdated')}
              </Badge>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {t('cookies.intro.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {t('cookies.intro.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cookie Types */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {t('cookies.types.title')}
                </h2>
              </div>

              <div className="space-y-8">
                {[0, 1, 2, 3].map((i) => {
                  const IconComponent = cookieTypeIcons[i];
                  return (
                    <Card key={i} className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                          <div className="p-2 bg-plp-purple/10 rounded-lg">
                            <IconComponent className="w-5 h-5 text-plp-purple" />
                          </div>
                          {t(`cookies.types.${i}.title`)}
                          {cookieTypeRequired[i] && (
                            <Badge className="bg-red-100 text-red-800">
                              {t('cookies.required')}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">
                          {t(`cookies.types.${i}.description`)}
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>{t('cookies.examples')}</strong> {t(`cookies.types.${i}.examples`)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Cookie Preferences */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-2xl mx-auto shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {t('cookies.preferences.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  {t('cookies.preferences.description')}
                </p>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {t('cookies.preferences.essential')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t('cookies.preferences.essentialDesc')}
                      </p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {t('cookies.preferences.analytics')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t('cookies.preferences.analyticsDesc')}
                      </p>
                    </div>
                    <Switch 
                      checked={cookiePreferences.analytics}
                      onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {t('cookies.preferences.marketing')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t('cookies.preferences.marketingDesc')}
                      </p>
                    </div>
                    <Switch 
                      checked={cookiePreferences.marketing}
                      onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {t('cookies.preferences.personalization')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t('cookies.preferences.personalizationDesc')}
                      </p>
                    </div>
                    <Switch 
                      checked={cookiePreferences.personalization}
                      onCheckedChange={(checked) => handlePreferenceChange('personalization', checked)}
                    />
                  </div>
                </div>

                <Button onClick={handleSavePreferences} className="w-full btn-primary mt-6">
                  <Save className="w-4 h-4 mr-2" />
                  {t('cookies.preferences.save')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Browser Management */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-4xl mx-auto shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {t('cookies.manage.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">
                  {t('cookies.manage.description')}
                </p>
                <ul className="space-y-3">
                  {[0, 1, 2, 3].map((i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-plp-purple rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{t(`cookies.manage.${i}`)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}