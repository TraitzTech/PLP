'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, Phone, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Users, FileText } from 'lucide-react';

export default function SafetyPage() {
  const [language, setLanguage] = useState('en');

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
      title: "Safety & Security",
      subtitle: "Your safety is our top priority. Learn about our comprehensive safety measures.",
      features: {
        title: "Safety Features",
        items: [
          {
            icon: Shield,
            title: "Verified Hosts",
            description: "All hosts undergo identity verification and background checks before listing properties."
          },
          {
            icon: Lock,
            title: "Secure Payments",
            description: "All transactions are processed through encrypted, PCI-compliant payment systems."
          },
          {
            icon: Eye,
            title: "Property Verification",
            description: "Our team verifies property details and photos to ensure accuracy and authenticity."
          },
          {
            icon: Phone,
            title: "24/7 Support",
            description: "Round-the-clock emergency support available for urgent safety concerns."
          }
        ]
      },
      guidelines: {
        title: "Safety Guidelines",
        guest: {
          title: "For Guests",
          items: [
            "Verify property details and host information before booking",
            "Read reviews from previous guests",
            "Communicate through our platform messaging system",
            "Report any safety concerns immediately",
            "Keep emergency contact information handy",
            "Trust your instincts and prioritize your safety"
          ]
        },
        host: {
          title: "For Hosts",
          items: [
            "Verify guest identity before check-in",
            "Provide accurate property descriptions and photos",
            "Maintain safety equipment (smoke detectors, first aid)",
            "Share emergency procedures with guests",
            "Report suspicious activity to our team",
            "Keep property insurance up to date"
          ]
        }
      },
      emergency: {
        title: "Emergency Procedures",
        description: "In case of emergency, follow these steps:",
        steps: [
          "Ensure immediate safety - call local emergency services if needed",
          "Contact PLP emergency support: +1 (555) 911-HELP",
          "Document the incident with photos if safe to do so",
          "Cooperate with local authorities and PLP investigation",
          "Follow up with our safety team for resolution"
        ]
      },
      reporting: {
        title: "Report Safety Concerns",
        description: "Help us maintain a safe community by reporting any safety issues or concerns.",
        button: "Report an Issue"
      }
    },
    fr: {
      title: "Sécurité et Sûreté",
      subtitle: "Votre sécurité est notre priorité absolue. Découvrez nos mesures de sécurité complètes.",
      features: {
        title: "Fonctionnalités de Sécurité",
        items: [
          {
            icon: Shield,
            title: "Hôtes Vérifiés",
            description: "Tous les hôtes subissent une vérification d'identité et des vérifications d'antécédents avant de lister des propriétés."
          },
          {
            icon: Lock,
            title: "Paiements Sécurisés",
            description: "Toutes les transactions sont traitées via des systèmes de paiement cryptés et conformes PCI."
          },
          {
            icon: Eye,
            title: "Vérification des Propriétés",
            description: "Notre équipe vérifie les détails et photos des propriétés pour assurer l'exactitude et l'authenticité."
          },
          {
            icon: Phone,
            title: "Support 24h/24",
            description: "Support d'urgence disponible 24h/24 pour les préoccupations de sécurité urgentes."
          }
        ]
      },
      guidelines: {
        title: "Directives de Sécurité",
        guest: {
          title: "Pour les Clients",
          items: [
            "Vérifiez les détails de la propriété et les informations de l'hôte avant de réserver",
            "Lisez les avis des clients précédents",
            "Communiquez via notre système de messagerie de plateforme",
            "Signalez immédiatement toute préoccupation de sécurité",
            "Gardez les informations de contact d'urgence à portée de main",
            "Faites confiance à votre instinct et priorisez votre sécurité"
          ]
        },
        host: {
          title: "Pour les Hôtes",
          items: [
            "Vérifiez l'identité des clients avant l'enregistrement",
            "Fournissez des descriptions et photos précises de la propriété",
            "Maintenez l'équipement de sécurité (détecteurs de fumée, premiers secours)",
            "Partagez les procédures d'urgence avec les clients",
            "Signalez toute activité suspecte à notre équipe",
            "Gardez l'assurance de propriété à jour"
          ]
        }
      },
      emergency: {
        title: "Procédures d'Urgence",
        description: "En cas d'urgence, suivez ces étapes:",
        steps: [
          "Assurez la sécurité immédiate - appelez les services d'urgence locaux si nécessaire",
          "Contactez le support d'urgence PLP: +1 (555) 911-HELP",
          "Documentez l'incident avec des photos si c'est sûr de le faire",
          "Coopérez avec les autorités locales et l'enquête PLP",
          "Suivez avec notre équipe de sécurité pour la résolution"
        ]
      },
      reporting: {
        title: "Signaler des Préoccupations de Sécurité",
        description: "Aidez-nous à maintenir une communauté sûre en signalant tout problème ou préoccupation de sécurité.",
        button: "Signaler un Problème"
      }
    }
  };

  const currentContent = content[language as keyof typeof content];

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
                {currentContent.title}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {currentContent.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Safety Features */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {currentContent.features.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {currentContent.features.items.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="text-center shadow-lg">
                    <CardContent className="p-8">
                      <div className="mx-auto w-16 h-16 bg-plp-purple/10 rounded-2xl flex items-center justify-center mb-6">
                        <IconComponent className="w-8 h-8 text-plp-purple" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
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
                {currentContent.guidelines.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Users className="w-6 h-6 text-plp-pink" />
                    {currentContent.guidelines.guest.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {currentContent.guidelines.guest.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-plp-purple" />
                    {currentContent.guidelines.host.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {currentContent.guidelines.host.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
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
                  {currentContent.emergency.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">
                  {currentContent.emergency.description}
                </p>
                <ol className="space-y-4">
                  {currentContent.emergency.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 pt-1">{step}</span>
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
                  {currentContent.reporting.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {currentContent.reporting.description}
                </p>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {currentContent.reporting.button}
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