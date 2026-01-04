'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Shield, FileText, Calendar, Mail } from 'lucide-react';

export default function TermsPage() {
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
      title: "Terms of Service",
      subtitle: "Please read these terms carefully before using our platform",
      lastUpdated: "Last updated: February 15, 2024",
      sections: [
        {
          title: "1. Acceptance of Terms",
          content: "By accessing and using Property Listing Portal (PLP), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
        },
        {
          title: "2. Use License",
          content: "Permission is granted to temporarily download one copy of the materials on PLP's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to reverse engineer any software contained on the website; remove any copyright or other proprietary notations from the materials."
        },
        {
          title: "3. User Accounts",
          content: "When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account."
        },
        {
          title: "4. Property Listings",
          content: "Property owners are responsible for the accuracy of their listings. PLP reserves the right to remove any listing that violates our community standards or contains false information."
        },
        {
          title: "5. Booking and Payments",
          content: "All bookings are subject to availability and confirmation. Payment processing is handled securely through our trusted payment partners. Cancellation policies vary by property."
        },
        {
          title: "6. Prohibited Uses",
          content: "You may not use our service for any illegal or unauthorized purpose, to violate any international, federal, provincial, or state laws, to transmit any worms or viruses or any code of a destructive nature."
        },
        {
          title: "7. Privacy Policy",
          content: "Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices."
        },
        {
          title: "8. Limitation of Liability",
          content: "In no event shall PLP or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PLP's website."
        },
        {
          title: "9. Governing Law",
          content: "These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which PLP operates."
        },
        {
          title: "10. Changes to Terms",
          content: "PLP may revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service."
        }
      ],
      contact: {
        title: "Questions About These Terms?",
        description: "If you have any questions about these Terms of Service, please contact our legal team.",
        email: "legal@propertylistingportal.com"
      }
    },
    fr: {
      title: "Conditions d'Utilisation",
      subtitle: "Veuillez lire attentivement ces conditions avant d'utiliser notre plateforme",
      lastUpdated: "Dernière mise à jour: 15 février 2024",
      sections: [
        {
          title: "1. Acceptation des Conditions",
          content: "En accédant et en utilisant Property Listing Portal (PLP), vous acceptez et convenez d'être lié par les termes et dispositions de cet accord. Si vous n'acceptez pas de respecter ce qui précède, veuillez ne pas utiliser ce service."
        },
        {
          title: "2. Licence d'Utilisation",
          content: "L'autorisation est accordée de télécharger temporairement une copie des matériaux sur le site Web de PLP pour un usage personnel, non commercial et transitoire uniquement. Il s'agit de l'octroi d'une licence, non d'un transfert de titre."
        },
        {
          title: "3. Comptes Utilisateur",
          content: "Lorsque vous créez un compte chez nous, vous devez fournir des informations exactes, complètes et à jour en permanence. Vous êtes responsable de la protection du mot de passe et de toutes les activités qui se produisent sous votre compte."
        },
        {
          title: "4. Annonces de Propriétés",
          content: "Les propriétaires sont responsables de l'exactitude de leurs annonces. PLP se réserve le droit de supprimer toute annonce qui viole nos normes communautaires ou contient de fausses informations."
        },
        {
          title: "5. Réservations et Paiements",
          content: "Toutes les réservations sont soumises à disponibilité et confirmation. Le traitement des paiements est géré de manière sécurisée par nos partenaires de paiement de confiance."
        },
        {
          title: "6. Utilisations Interdites",
          content: "Vous ne pouvez pas utiliser notre service à des fins illégales ou non autorisées, pour violer des lois internationales, fédérales, provinciales ou d'État."
        },
        {
          title: "7. Politique de Confidentialité",
          content: "Votre vie privée est importante pour nous. Veuillez consulter notre Politique de Confidentialité qui régit également votre utilisation du service."
        },
        {
          title: "8. Limitation de Responsabilité",
          content: "En aucun cas PLP ou ses fournisseurs ne seront responsables de tout dommage découlant de l'utilisation ou de l'incapacité d'utiliser les matériaux sur le site Web de PLP."
        },
        {
          title: "9. Loi Applicable",
          content: "Ces termes et conditions sont régis et interprétés conformément aux lois de la juridiction dans laquelle PLP opère."
        },
        {
          title: "10. Modifications des Conditions",
          content: "PLP peut réviser ces conditions d'utilisation à tout moment sans préavis. En utilisant ce site Web, vous acceptez d'être lié par la version actuelle de ces conditions."
        }
      ],
      contact: {
        title: "Questions sur ces Conditions?",
        description: "Si vous avez des questions sur ces Conditions d'Utilisation, veuillez contacter notre équipe juridique.",
        email: "legal@propertylistingportal.com"
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
                <Scale className="w-10 h-10 text-white" />
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

        {/* Terms Content */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="space-y-8">
              {currentContent.sections.map((section, index) => (
                <Card key={index} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {section.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-gray-50">
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
                <a 
                  href={`mailto:${currentContent.contact.email}`}
                  className="inline-flex items-center px-6 py-3 bg-plp-purple text-white rounded-lg hover:bg-plp-purple/90 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {currentContent.contact.email}
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