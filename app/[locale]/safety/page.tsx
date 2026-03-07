'use client';

import React from 'react';
import { useTranslations } from '@/components/translation-provider';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, Phone, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Users, FileText } from 'lucide-react';

const featureIcons = [Shield, Lock, Eye, Phone];

export default function SafetyPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-plp-purple via-plp-pink to-plp-yellow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-white">
                {t('safety.title')}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {t('safety.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Safety Features */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('safety.features.title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[0, 1, 2, 3].map((i) => {
                const IconComponent = featureIcons[i];
                return (
                  <Card key={i} className="text-center shadow-lg">
                    <CardContent className="p-8">
                      <div className="mx-auto w-16 h-16 bg-plp-purple/10 rounded-2xl flex items-center justify-center mb-6">
                        <IconComponent className="w-8 h-8 text-plp-purple" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {t(`safety.features.${i}.title`)}
                      </h3>
                      <p className="text-gray-600">
                        {t(`safety.features.${i}.description`)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Safety Guidelines */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('safety.guidelines.title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Users className="w-6 h-6 text-plp-pink" />
                    {t('safety.guidelines.guest.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{t(`safety.guidelines.guest.${i}`)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-plp-purple" />
                    {t('safety.guidelines.host.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{t(`safety.guidelines.host.${i}`)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Emergency Procedures */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-4xl mx-auto shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  {t('safety.emergency.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">
                  {t('safety.emergency.description')}
                </p>
                <ol className="space-y-4">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-gray-700 pt-1">{t(`safety.emergency.${i}`)}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Report Issues */}
        <section className="py-20 bg-red-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-2xl mx-auto shadow-xl border-red-200">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('safety.reporting.title')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('safety.reporting.description')}
                </p>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {t('safety.reporting.button')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}