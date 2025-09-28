'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Eye, Lock, Database, Mail, Settings } from 'lucide-react';

export default function PrivacyPage() {
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
      title: "Privacy Policy",
      subtitle: "Your privacy is important to us. Learn how we collect, use, and protect your information.",
      lastUpdated: "Last updated: February 15, 2024",
      sections: [
        {
          icon: Database,
          title: "Information We Collect",
          content: "We collect information you provide directly to us, such as when you create an account, make a booking, or contact us. This includes your name, email address, phone number, payment information, and any other information you choose to provide."
        },
        {
          icon: Eye,
          title: "How We Use Your Information",
          content: "We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and promotional offers."
        },
        {
          icon: Shield,
          title: "Information Sharing",
          content: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with trusted partners who assist us in operating our platform."
        },
        {
          icon: Lock,
          title: "Data Security",
          content: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. We use SSL encryption for data transmission and secure servers for data storage."
        },
        {
          icon: Settings,
          title: "Your Rights and Choices",
          content: "You have the right to access, update, or delete your personal information. You can also opt out of certain communications and control how your information is used for marketing purposes."
        },
        {
          icon: Mail,
          title: "Contact Us",
          content: "If you have any questions about this Privacy Policy or our data practices, please contact our privacy team at privacy@propertylistingportal.com."
        }
      ],
      dataTypes: {
        title: "Types of Data We Collect",
        items: [
          "Account information (name, email, phone)",
          "Booking and payment details",
          "Property preferences and search history",
          "Communication records",
          "Device and usage information",
          "Location data (with permission)"
        ]
      },
      rights: {
        title: "Your Privacy Rights",
        items: [
          "Right to access your personal data",
          "Right to correct inaccurate information",
          "Right to delete your account and data",
          "Right to data portability",
          "Right to opt-out of marketing communications",
          "Right to withdraw consent"
        ]
      },
        contact: {
            title: "Need more help?",
            description: "Our privacy team will be happy to answer any questions you may have.",
            email: "privacy@propertylistingportal.com"
        }
    },
    fr: {
      title: "Politique de Confidentialité",
      subtitle: "Votre vie privée est importante pour nous. Découvrez comment nous collectons, utilisons et protégeons vos informations.",
      lastUpdated: "Dernière mise à jour: 15 février 2024",
      sections: [
        {
          icon: Database,
          title: "Informations que Nous Collectons",
          content: "Nous collectons les informations que vous nous fournissez directement, comme lorsque vous créez un compte, effectuez une réservation ou nous contactez. Cela inclut votre nom, adresse email, numéro de téléphone, informations de paiement et toute autre information que vous choisissez de fournir."
        },
        {
          icon: Eye,
          title: "Comment Nous Utilisons Vos Informations",
          content: "Nous utilisons les informations que nous collectons pour fournir, maintenir et améliorer nos services, traiter les transactions, vous envoyer des avis techniques et des messages de support, et communiquer avec vous sur les produits, services et offres promotionnelles."
        },
        {
          icon: Shield,
          title: "Partage d'Informations",
          content: "Nous ne vendons, n'échangeons ou ne transférons pas vos informations personnelles à des tiers sans votre consentement, sauf comme décrit dans cette politique. Nous pouvons partager vos informations avec des partenaires de confiance qui nous aident à exploiter notre plateforme."
        },
        {
          icon: Lock,
          title: "Sécurité des Données",
          content: "Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles contre l'accès non autorisé, l'altération, la divulgation ou la destruction. Nous utilisons le cryptage SSL pour la transmission de données et des serveurs sécurisés pour le stockage."
        },
        {
          icon: Settings,
          title: "Vos Droits et Choix",
          content: "Vous avez le droit d'accéder, de mettre à jour ou de supprimer vos informations personnelles. Vous pouvez également vous désinscrire de certaines communications et contrôler comment vos informations sont utilisées à des fins marketing."
        },
        {
          icon: Mail,
          title: "Nous Contacter",
          content: "Si vous avez des questions sur cette Politique de Confidentialité ou nos pratiques de données, veuillez contacter notre équipe de confidentialité à privacy@propertylistingportal.com."
        }
      ],
      dataTypes: {
        title: "Types de Données que Nous Collectons",
        items: [
          "Informations de compte (nom, email, téléphone)",
          "Détails de réservation et de paiement",
          "Préférences de propriété et historique de recherche",
          "Enregistrements de communication",
          "Informations d'appareil et d'utilisation",
          "Données de localisation (avec permission)"
        ]
      },
      rights: {
        title: "Vos Droits de Confidentialité",
        items: [
          "Droit d'accéder à vos données personnelles",
          "Droit de corriger les informations inexactes",
          "Droit de supprimer votre compte et vos données",
          "Droit à la portabilité des données",
          "Droit de se désinscrire des communications marketing",
          "Droit de retirer le consentement"
        ]
      },
        contact: {
            title: "Besoin d'aide supplémentaire ?",
            description: "Notre équipe confidentialité se fera un plaisir de répondre à vos questions.",
            email: "privacy@propertylistingportal.com"
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
              <Badge className="bg-white/20 text-white border-white/30">
                {currentContent.lastUpdated}
              </Badge>
            </div>
          </div>
        </section>

        {/* Privacy Sections */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="space-y-8">
              {currentContent.sections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <Card key={index} className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                        <div className="p-2 bg-plp-purple/10 rounded-lg">
                          <IconComponent className="w-5 h-5 text-plp-purple" />
                        </div>
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {section.content}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Data Types & Rights */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {currentContent.dataTypes.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {currentContent.dataTypes.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-plp-purple rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {currentContent.rights.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {currentContent.rights.items.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-plp-pink rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-2xl mx-auto shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-plp-purple/10 rounded-2xl flex items-center justify-center mb-6">
                  <Mail className="w-8 h-8 text-plp-purple" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {currentContent.contact.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {currentContent.contact.description}
                </p>
                <Button className="btn-primary">
                  <Mail className="w-4 h-4 mr-2" />
                  {currentContent.contact.email}
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