'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Download, Mail, Phone, Calendar, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function PressPage() {
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
      title: "Press & Media",
      subtitle: "Latest news, press releases, and media resources from Property Listing Portal",
      releases: {
        title: "Recent Press Releases",
        items: [
          {
            title: "PLP Expands to 100+ Countries Worldwide",
            date: "February 10, 2024",
            excerpt: "Property Listing Portal announces major expansion milestone, now serving over 100 countries with 50,000+ premium properties.",
            category: "Expansion"
          },
          {
            title: "AI-Powered Property Matching Launches",
            date: "January 25, 2024",
            excerpt: "Revolutionary AI technology helps travelers find their perfect property match based on preferences and behavior.",
            category: "Technology"
          },
          {
            title: "PLP Raises $50M Series B Funding",
            date: "December 15, 2023",
            excerpt: "Funding round led by top venture capital firms to accelerate global growth and technology development.",
            category: "Funding"
          }
        ]
      },
      mediaKit: {
        title: "Media Kit",
        description: "Download our media kit for logos, brand guidelines, and high-resolution images.",
        items: [
          {
            title: "Brand Guidelines",
            description: "Logo usage, colors, and brand standards",
            type: "PDF"
          },
          {
            title: "Company Logos",
            description: "High-resolution logos in various formats",
            type: "ZIP"
          },
          {
            title: "Product Screenshots",
            description: "Platform screenshots and product images",
            type: "ZIP"
          },
          {
            title: "Executive Photos",
            description: "High-resolution photos of leadership team",
            type: "ZIP"
          }
        ]
      },
      contact: {
        title: "Media Contact",
        description: "For press inquiries, interviews, and media requests",
        email: "press@propertylistingportal.com",
        phone: "+1 (555) 123-PRESS"
      },
      awards: {
        title: "Awards & Recognition",
        items: [
          "Best Travel Platform 2024 - Travel Tech Awards",
          "Innovation in Hospitality 2023 - Global Tourism Board",
          "Top Startup to Watch 2023 - Tech Crunch",
          "Customer Choice Award 2023 - Travel Weekly"
        ]
      }
    },
    fr: {
      title: "Presse et Médias",
      subtitle: "Dernières nouvelles, communiqués de presse et ressources médias de Property Listing Portal",
      releases: {
        title: "Communiqués de Presse Récents",
        items: [
          {
            title: "PLP S'Étend à Plus de 100 Pays dans le Monde",
            date: "10 février 2024",
            excerpt: "Property Listing Portal annonce une étape majeure d'expansion, desservant maintenant plus de 100 pays avec 50 000+ propriétés premium.",
            category: "Expansion"
          },
          {
            title: "Lancement de la Correspondance de Propriétés Alimentée par l'IA",
            date: "25 janvier 2024",
            excerpt: "La technologie révolutionnaire d'IA aide les voyageurs à trouver leur propriété parfaite basée sur les préférences et le comportement.",
            category: "Technologie"
          },
          {
            title: "PLP Lève 50M$ en Financement Série B",
            date: "15 décembre 2023",
            excerpt: "Tour de financement dirigé par des sociétés de capital-risque de premier plan pour accélérer la croissance mondiale et le développement technologique.",
            category: "Financement"
          }
        ]
      },
      mediaKit: {
        title: "Kit Média",
        description: "Téléchargez notre kit média pour les logos, directives de marque et images haute résolution.",
        items: [
          {
            title: "Directives de Marque",
            description: "Utilisation du logo, couleurs et standards de marque",
            type: "PDF"
          },
          {
            title: "Logos de l'Entreprise",
            description: "Logos haute résolution en divers formats",
            type: "ZIP"
          },
          {
            title: "Captures d'Écran Produit",
            description: "Captures d'écran de plateforme et images produit",
            type: "ZIP"
          },
          {
            title: "Photos des Dirigeants",
            description: "Photos haute résolution de l'équipe de direction",
            type: "ZIP"
          }
        ]
      },
      contact: {
        title: "Contact Média",
        description: "Pour les demandes de presse, interviews et demandes médias",
        email: "press@propertylistingportal.com",
        phone: "+1 (555) 123-PRESS"
      },
      awards: {
        title: "Prix et Reconnaissance",
        items: [
          "Meilleure Plateforme de Voyage 2024 - Travel Tech Awards",
          "Innovation en Hôtellerie 2023 - Conseil Mondial du Tourisme",
          "Top Startup à Surveiller 2023 - Tech Crunch",
          "Prix du Choix Client 2023 - Travel Weekly"
        ]
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
                <Newspaper className="w-10 h-10 text-white" />
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

        {/* Press Releases */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-12">
                {currentContent.releases.title}
              </h2>

              <div className="space-y-8">
                {currentContent.releases.items.map((release, index) => (
                  <Card key={index} className="shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-plp-purple/10 text-plp-purple">
                            {release.category}
                          </Badge>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            {release.date}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {language === 'fr' ? 'Lire Plus' : 'Read More'}
                        </Button>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {release.title}
                      </h3>
                      <p className="text-gray-600">
                        {release.excerpt}
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
                  {currentContent.mediaKit.title}
                </h2>
                <p className="text-lg text-gray-600">
                  {currentContent.mediaKit.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {currentContent.mediaKit.items.map((item, index) => (
                  <Card key={index} className="shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {item.description}
                          </p>
                          <Badge variant="outline" className="text-plp-purple border-plp-purple">
                            {item.type}
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
                  {currentContent.awards.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentContent.awards.items.map((award, index) => (
                  <div key={index} className="flex items-center gap-4 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <span className="text-gray-700 font-medium">{award}</span>
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
                  {currentContent.contact.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {currentContent.contact.description}
                </p>
                <div className="space-y-3">
                  <Button className="w-full btn-primary">
                    <Mail className="w-4 h-4 mr-2" />
                    {currentContent.contact.email}
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    {currentContent.contact.phone}
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