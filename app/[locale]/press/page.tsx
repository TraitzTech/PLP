'use client';

import React from 'react';
import { useTranslations } from '@/components/translation-provider';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Download, Mail, Phone, Calendar, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function PressPage() {
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
                <Newspaper className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-white">
                {t('press.title')}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {t('press.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Press Releases */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-12">
                {t('press.releases.title')}
              </h2>

              <div className="space-y-8">
                {[0, 1, 2].map((i) => (
                  <Card key={i} className="shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-plp-purple/10 text-plp-purple">
                            {t(`press.releases.${i}.category`)}
                          </Badge>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            {t(`press.releases.${i}.date`)}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {t('press.readMore')}
                        </Button>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {t(`press.releases.${i}.title`)}
                      </h3>
                      <p className="text-gray-600">
                        {t(`press.releases.${i}.excerpt`)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Media Kit */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {t('press.mediaKit.title')}
                </h2>
                <p className="text-lg text-gray-600">
                  {t('press.mediaKit.description')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[0, 1, 2, 3].map((i) => (
                  <Card key={i} className="shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {t(`press.mediaKit.${i}.title`)}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {t(`press.mediaKit.${i}.description`)}
                          </p>
                          <Badge variant="outline" className="text-plp-purple border-plp-purple">
                            {t(`press.mediaKit.${i}.type`)}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Awards */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {t('press.awards.title')}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <span className="text-gray-700 font-medium">{t(`press.awards.${i}`)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Media Contact */}
        <section className="py-20 bg-plp-purple">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-2xl mx-auto shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-plp-purple/10 rounded-2xl flex items-center justify-center mb-6">
                  <Mail className="w-8 h-8 text-plp-purple" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('press.contact.title')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('press.contact.description')}
                </p>
                <div className="space-y-3">
                  <Button className="w-full btn-primary">
                    <Mail className="w-4 h-4 mr-2" />
                    {t('press.contact.email')}
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    {t('press.contact.phone')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}