'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CircleHelp as HelpCircle, Search, MessageSquare, Phone, Mail, Book, CreditCard, Chrome as Home, Users } from 'lucide-react';

export default function HelpPage() {
  const [language, setLanguage] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');

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
      title: "Help Center",
      subtitle: "Find answers to your questions and get the support you need",
      search: "Search for help...",
      categories: {
        title: "Browse by Category",
        items: [
          {
            icon: Book,
            title: "Getting Started",
            description: "Learn the basics of using PLP",
            count: "12 articles"
          },
          {
            icon: Home,
            title: "Booking Properties",
            description: "How to search, book, and manage reservations",
            count: "18 articles"
          },
          {
            icon: Users,
            title: "Host Resources",
            description: "Everything you need to know about hosting",
            count: "15 articles"
          },
          {
            icon: CreditCard,
            title: "Payments & Billing",
            description: "Payment methods, billing, and refunds",
            count: "10 articles"
          }
        ]
      },
      faq: {
        title: "Frequently Asked Questions",
        items: [
          {
            question: "How do I create an account?",
            answer: "Click 'Sign Up' in the top right corner, choose your account type (Guest or Host), and fill in your details. You'll receive a confirmation email to verify your account."
          },
          {
            question: "How do I book a property?",
            answer: "Use our search function to find properties, select your dates and number of guests, then click 'Book Now'. You'll be guided through the payment process."
          },
          {
            question: "What payment methods do you accept?",
            answer: "We accept major credit cards, PayPal, bank transfers, and mobile money payments in supported regions."
          },
          {
            question: "Can I cancel my booking?",
            answer: "Cancellation policies vary by property. Check the specific cancellation policy before booking. Most properties offer free cancellation within 24-48 hours."
          },
          {
            question: "How do I become a host?",
            answer: "Click 'Become a Host', create your host profile, add your property details and photos, set your pricing, and submit for review."
          },
          {
            question: "Is my personal information secure?",
            answer: "Yes, we use industry-standard encryption and security measures to protect your personal and payment information."
          }
        ]
      },
      support: {
        title: "Still Need Help?",
        description: "Our support team is here to help you 24/7",
        options: [
          {
            icon: MessageSquare,
            title: "Live Chat",
            description: "Chat with our support team",
            action: "Start Chat"
          },
          {
            icon: Phone,
            title: "Phone Support",
            description: "Call us at +1 (555) 123-4567",
            action: "Call Now"
          },
          {
            icon: Mail,
            title: "Email Support",
            description: "Send us an email",
            action: "Send Email"
          }
        ]
      }
    },
    fr: {
      title: "Centre d'Aide",
      subtitle: "Trouvez des réponses à vos questions et obtenez le support dont vous avez besoin",
      search: "Rechercher de l'aide...",
      categories: {
        title: "Parcourir par Catégorie",
        items: [
          {
            icon: Book,
            title: "Commencer",
            description: "Apprenez les bases de l'utilisation de PLP",
            count: "12 articles"
          },
          {
            icon: Home,
            title: "Réserver des Propriétés",
            description: "Comment rechercher, réserver et gérer les réservations",
            count: "18 articles"
          },
          {
            icon: Users,
            title: "Ressources Hôte",
            description: "Tout ce que vous devez savoir sur l'hébergement",
            count: "15 articles"
          },
          {
            icon: CreditCard,
            title: "Paiements et Facturation",
            description: "Méthodes de paiement, facturation et remboursements",
            count: "10 articles"
          }
        ]
      },
      faq: {
        title: "Questions Fréquemment Posées",
        items: [
          {
            question: "Comment créer un compte?",
            answer: "Cliquez sur 'S'inscrire' en haut à droite, choisissez votre type de compte (Client ou Hôte), et remplissez vos détails. Vous recevrez un email de confirmation pour vérifier votre compte."
          },
          {
            question: "Comment réserver une propriété?",
            answer: "Utilisez notre fonction de recherche pour trouver des propriétés, sélectionnez vos dates et le nombre d'invités, puis cliquez sur 'Réserver'. Vous serez guidé à travers le processus de paiement."
          },
          {
            question: "Quelles méthodes de paiement acceptez-vous?",
            answer: "Nous acceptons les principales cartes de crédit, PayPal, virements bancaires et paiements mobile money dans les régions supportées."
          },
          {
            question: "Puis-je annuler ma réservation?",
            answer: "Les politiques d'annulation varient selon la propriété. Vérifiez la politique d'annulation spécifique avant de réserver. La plupart des propriétés offrent une annulation gratuite dans les 24-48 heures."
          },
          {
            question: "Comment devenir hôte?",
            answer: "Cliquez sur 'Devenir Hôte', créez votre profil d'hôte, ajoutez les détails et photos de votre propriété, fixez vos prix, et soumettez pour révision."
          },
          {
            question: "Mes informations personnelles sont-elles sécurisées?",
            answer: "Oui, nous utilisons un cryptage et des mesures de sécurité standard de l'industrie pour protéger vos informations personnelles et de paiement."
          }
        ]
      },
      support: {
        title: "Besoin d'Aide Supplémentaire?",
        description: "Notre équipe de support est là pour vous aider 24h/24 et 7j/7",
        options: [
          {
            icon: MessageSquare,
            title: "Chat en Direct",
            description: "Chattez avec notre équipe de support",
            action: "Démarrer le Chat"
          },
          {
            icon: Phone,
            title: "Support Téléphonique",
            description: "Appelez-nous au +1 (555) 123-4567",
            action: "Appeler"
          },
          {
            icon: Mail,
            title: "Support Email",
            description: "Envoyez-nous un email",
            action: "Envoyer Email"
          }
        ]
      }
    }
  };

  const currentContent = content[language as keyof typeof content];

  const filteredFAQ = currentContent.faq.items.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-plp-purple via-plp-pink to-plp-yellow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                <HelpCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-white">
                {currentContent.title}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {currentContent.subtitle}
              </p>
              
              {/* Search Bar */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder={currentContent.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-white border-0 shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {currentContent.categories.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {currentContent.categories.items.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <CardContent className="p-8">
                      <div className="mx-auto w-16 h-16 bg-plp-purple/10 rounded-2xl flex items-center justify-center mb-6">
                        <IconComponent className="w-8 h-8 text-plp-purple" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {category.description}
                      </p>
                      <Badge variant="outline" className="text-plp-purple border-plp-purple">
                        {category.count}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {currentContent.faq.title}
                </h2>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {filteredFAQ.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg shadow-sm border">
                    <AccordionTrigger className="px-6 py-4 text-left font-semibold text-gray-900 hover:text-plp-purple">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-gray-700">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Support Options */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {currentContent.support.title}
              </h2>
              <p className="text-lg text-gray-600">
                {currentContent.support.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {currentContent.support.options.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <Card key={index} className="text-center shadow-lg">
                    <CardContent className="p-8">
                      <div className="mx-auto w-16 h-16 bg-plp-pink/10 rounded-2xl flex items-center justify-center mb-6">
                        <IconComponent className="w-8 h-8 text-plp-pink" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {option.title}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {option.description}
                      </p>
                      <Button className="btn-primary">
                        {option.action}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}