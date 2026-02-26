'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Mail } from 'lucide-react';
import { publicSettingsService } from '@/services/publicSettingsService';

const fallbackPrivacy = {
  en: '<h2>Privacy Policy</h2><p>Our latest privacy policy is being updated. Please check back shortly.</p>',
  fr: '<h2>Politique de confidentialite</h2><p>Notre politique est en cours de mise a jour. Veuillez revenir plus tard.</p>',
};

export default function PrivacyPage() {
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale || 'en').toLowerCase() === 'fr' ? 'fr' : 'en';
  const [contentEn, setContentEn] = useState(fallbackPrivacy.en);
  const [contentFr, setContentFr] = useState(fallbackPrivacy.fr);
  const [lastUpdated, setLastUpdated] = useState('');
  const [contactEmail, setContactEmail] = useState('info@plplistings.com');

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await publicSettingsService.getLegalContent();
        setContentEn(response.data.privacy.content_en || fallbackPrivacy.en);
        setContentFr(response.data.privacy.content_fr || fallbackPrivacy.fr);
        setLastUpdated(response.data.privacy.last_updated || '');
        setContactEmail(response.data.contact_email || 'info@plplistings.com');
      } catch {
        // fallback content already set
      }
    };

    loadContent();
  }, []);

  const content = useMemo(() => (locale === 'fr' ? contentFr : contentEn), [locale, contentEn, contentFr]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20">
        <section className="py-20 bg-gradient-to-r from-plp-purple via-plp-pink to-plp-yellow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-white">
                {locale === 'fr' ? 'Politique de confidentialite' : 'Privacy Policy'}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {locale === 'fr'
                  ? 'Comprenez comment nous collectons, utilisons et protegeons vos donnees.'
                  : 'Understand how we collect, use, and protect your data.'}
              </p>
              <Badge className="bg-white/20 text-white border-white/30">
                {lastUpdated
                  ? `${locale === 'fr' ? 'Derniere mise a jour' : 'Last updated'}: ${lastUpdated}`
                  : locale === 'fr'
                    ? 'Mise a jour dynamique'
                    : 'Dynamic update enabled'}
              </Badge>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>{locale === 'fr' ? 'Version publiee par l\'administration' : 'Admin Published Version'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-2xl mx-auto shadow-xl">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {locale === 'fr' ? 'Questions sur vos donnees ?' : 'Questions About Your Data?'}
                </h3>
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center px-6 py-3 bg-plp-purple text-white rounded-lg hover:bg-plp-purple/90 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {contactEmail}
                </a>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
