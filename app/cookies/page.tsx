'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Cookie, Settings, Shield, ChartBar as BarChart3, Target, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function CookiesPage() {
  const [language, setLanguage] = useState('en');
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always required
    analytics: true,
    marketing: false,
    personalization: true,
  });

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);

    const handleLanguageChange = () => {
      const currentLanguage = localStorage.getItem('language') || 'en';
      setLanguage(currentLanguage);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const content = {
    en: {
      title: "Cookie Policy",
      subtitle: "Learn how we use cookies to improve your experience on our platform",
      lastUpdated: "Last updated: February 15, 2024",
      intro: {
        title: "What are Cookies?",
        description: "Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our platform."
      },
      types: {
        title: "Types of Cookies We Use",
        items: [
          {
            icon: Shield,
            title: "Essential Cookies",
            description: "These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.",
            required: true,
            examples: "Login sessions, security tokens, load balancing"
          },
          {
            icon: BarChart3,
            title: "Analytics Cookies",
            description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
            required: false,
            examples: "Google Analytics, page views, user behavior"
          },
          {
            icon: Target,
            title: "Marketing Cookies",
            description: "These cookies are used to track visitors across websites to display relevant advertisements and measure campaign effectiveness.",
            required: false,
            examples: "Ad targeting, conversion tracking, retargeting"
          },
          {
            icon: Settings,
            title: "Personalization Cookies",
            description: "These cookies allow us to remember your preferences and provide customized content and features.",
            required: false,
            examples: "Language preferences, saved searches, recommendations"
          }
        ]
      },
      preferences: {
        title: "Cookie Preferences",
        description: "You can control which cookies we use. Essential cookies cannot be disabled as they are required for the website to function.",
        save: "Save Preferences",
        success: "Cookie preferences updated successfully!"
      },
      manage: {
        title: "Managing Cookies",
        description: "You can also manage cookies through your browser settings:",
        browsers: [
          "Chrome: Settings > Privacy and Security > Cookies",
          "Firefox: Options > Privacy & Security > Cookies",
          "Safari: Preferences > Privacy > Cookies",
          "Edge: Settings > Cookies and Site Permissions"
        ]
      }
    },
    fr: {
      title: "Politique des Cookies",
      subtitle: "Découvrez comment nous utilisons les cookies pour améliorer votre expérience sur notre plateforme",
      lastUpdated: "Dernière mise à jour: 15 février 2024",
      intro: {
        title: "Que sont les Cookies?",
        description: "Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez notre site web. Ils nous aident à vous offrir une meilleure expérience en mémorisant vos préférences et en analysant comment vous utilisez notre plateforme."
      },
      types: {
        title: "Types de Cookies que Nous Utilisons",
        items: [
          {
            icon: Shield,
            title: "Cookies Essentiels",
            description: "Ces cookies sont nécessaires au bon fonctionnement du site web. Ils permettent des fonctionnalités de base comme la sécurité, la gestion réseau et l'accessibilité.",
            required: true,
            examples: "Sessions de connexion, jetons de sécurité, équilibrage de charge"
          },
          {
            icon: BarChart3,
            title: "Cookies d'Analyse",
            description: "Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site web en collectant et rapportant des informations de manière anonyme.",
            required: false,
            examples: "Google Analytics, vues de page, comportement utilisateur"
          },
          {
            icon: Target,
            title: "Cookies Marketing",
            description: "Ces cookies sont utilisés pour suivre les visiteurs sur les sites web afin d'afficher des publicités pertinentes et mesurer l'efficacité des campagnes.",
            required: false,
            examples: "Ciblage publicitaire, suivi de conversion, reciblage"
          },
          {
            icon: Settings,
            title: "Cookies de Personnalisation",
            description: "Ces cookies nous permettent de mémoriser vos préférences et de fournir du contenu et des fonctionnalités personnalisés.",
            required: false,
            examples: "Préférences linguistiques, recherches sauvegardées, recommandations"
          }
        ]
      },
      preferences: {
        title: "Préférences des Cookies",
        description: "Vous pouvez contrôler quels cookies nous utilisons. Les cookies essentiels ne peuvent pas être désactivés car ils sont requis pour le fonctionnement du site web.",
        save: "Sauvegarder les Préférences",
        success: "Préférences des cookies mises à jour avec succès!"
      },
      manage: {
        title: "Gestion des Cookies",
        description: "Vous pouvez également gérer les cookies via les paramètres de votre navigateur:",
        browsers: [
          "Chrome: Paramètres > Confidentialité et Sécurité > Cookies",
          "Firefox: Options > Confidentialité et Sécurité > Cookies",
          "Safari: Préférences > Confidentialité > Cookies",
          "Edge: Paramètres > Cookies et Autorisations de Site"
        ]
      }
    }
  };

  const currentContent = content[language as keyof typeof content];

  const handleSavePreferences = () => {
    // Save preferences to localStorage
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    toast.success(currentContent.preferences.success);
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
                {currentContent.title}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {currentContent.subtitle}
              </p>
              <Badge className="bg-white/20 text-white border-white/30">
                {currentContent.lastUpdated}
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
                  {currentContent.intro.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {currentContent.intro.description}
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
                  {currentContent.types.title}
                </h2>
              </div>

              <div className="space-y-8">
                {currentContent.types.items.map((type, index) => {
                  const IconComponent = type.icon;
                  return (
                    <Card key={index} className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                          <div className="p-2 bg-plp-purple/10 rounded-lg">
                            <IconComponent className="w-5 h-5 text-plp-purple" />
                          </div>
                          {type.title}
                          {type.required && (
                            <Badge className="bg-red-100 text-red-800">
                              {language === 'fr' ? 'Requis' : 'Required'}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">
                          {type.description}
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>{language === 'fr' ? 'Exemples:' : 'Examples:'}</strong> {type.examples}
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
                  {currentContent.preferences.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  {currentContent.preferences.description}
                </p>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {language === 'fr' ? 'Cookies Essentiels' : 'Essential Cookies'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === 'fr' ? 'Requis pour le fonctionnement du site' : 'Required for website functionality'}
                      </p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {language === 'fr' ? 'Cookies d\'Analyse' : 'Analytics Cookies'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === 'fr' ? 'Nous aident à améliorer notre site' : 'Help us improve our website'}
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
                        {language === 'fr' ? 'Cookies Marketing' : 'Marketing Cookies'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === 'fr' ? 'Pour des publicités personnalisées' : 'For personalized advertisements'}
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
                        {language === 'fr' ? 'Cookies de Personnalisation' : 'Personalization Cookies'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === 'fr' ? 'Pour une expérience personnalisée' : 'For a personalized experience'}
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
                  {currentContent.preferences.save}
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
                  {currentContent.manage.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">
                  {currentContent.manage.description}
                </p>
                <ul className="space-y-3">
                  {currentContent.manage.browsers.map((browser, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-plp-purple rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{browser}</span>
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