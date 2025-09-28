'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, Heart, Globe, TrendingUp, Mail, Upload, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function CareersPage() {
  const [language, setLanguage] = useState('en');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      title: "Careers at PLP",
      subtitle: "Join our mission to revolutionize the property rental industry",
      noOpenings: {
        title: "No Current Openings",
        description: "We don't have any open positions at the moment, but we're always looking for talented individuals to join our team.",
        futureTitle: "Future Opportunities",
        futureDescription: "Leave your information below and we'll reach out when positions that match your skills become available."
      },
      culture: {
        title: "Why Work With Us?",
        values: [
          {
            icon: Heart,
            title: "Passion-Driven",
            description: "We're passionate about creating exceptional experiences for travelers and hosts worldwide."
          },
          {
            icon: Users,
            title: "Collaborative Team",
            description: "Work with talented individuals from diverse backgrounds in a supportive environment."
          },
          {
            icon: TrendingUp,
            title: "Growth Opportunities",
            description: "Advance your career with learning opportunities and professional development programs."
          },
          {
            icon: Globe,
            title: "Global Impact",
            description: "Make a difference in the lives of millions of travelers and property owners worldwide."
          }
        ]
      },
      benefits: {
        title: "Benefits & Perks",
        items: [
          "Competitive salary and equity packages",
          "Comprehensive health, dental, and vision insurance",
          "Flexible work arrangements and remote options",
          "Generous vacation and personal time off",
          "Professional development budget",
          "Free travel credits for platform properties",
          "Wellness programs and mental health support",
          "Catered meals and office amenities"
        ]
      },
      form: {
        title: "Join Our Talent Pool",
        name: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        position: "Position of Interest",
        experience: "Years of Experience",
        message: "Tell us about yourself",
        submit: "Submit Application",
        success: "Thank you for your interest! We'll contact you when relevant positions become available."
      }
    },
    fr: {
      title: "Carrières chez PLP",
      subtitle: "Rejoignez notre mission de révolutionner l'industrie de la location immobilière",
      noOpenings: {
        title: "Aucun Poste Actuellement Disponible",
        description: "Nous n'avons aucun poste ouvert pour le moment, mais nous recherchons toujours des personnes talentueuses pour rejoindre notre équipe.",
        futureTitle: "Opportunités Futures",
        futureDescription: "Laissez vos informations ci-dessous et nous vous contacterons lorsque des postes correspondant à vos compétences seront disponibles."
      },
      culture: {
        title: "Pourquoi Travailler Avec Nous?",
        values: [
          {
            icon: Heart,
            title: "Passion",
            description: "Nous sommes passionnés par la création d'expériences exceptionnelles pour les voyageurs et hôtes du monde entier."
          },
          {
            icon: Users,
            title: "Équipe Collaborative",
            description: "Travaillez avec des personnes talentueuses de divers horizons dans un environnement de soutien."
          },
          {
            icon: TrendingUp,
            title: "Opportunités de Croissance",
            description: "Faites progresser votre carrière avec des opportunités d'apprentissage et des programmes de développement professionnel."
          },
          {
            icon: Globe,
            title: "Impact Mondial",
            description: "Faites une différence dans la vie de millions de voyageurs et propriétaires dans le monde entier."
          }
        ]
      },
      benefits: {
        title: "Avantages et Bénéfices",
        items: [
          "Salaire compétitif et packages d'actions",
          "Assurance santé, dentaire et vision complète",
          "Arrangements de travail flexibles et options à distance",
          "Congés généreux et temps personnel",
          "Budget de développement professionnel",
          "Crédits de voyage gratuits pour les propriétés de la plateforme",
          "Programmes de bien-être et soutien en santé mentale",
          "Repas fournis et commodités de bureau"
        ]
      },
      form: {
        title: "Rejoignez Notre Réserve de Talents",
        name: "Nom Complet",
        email: "Adresse Email",
        phone: "Numéro de Téléphone",
        position: "Poste d'Intérêt",
        experience: "Années d'Expérience",
        message: "Parlez-nous de vous",
        submit: "Soumettre la Candidature",
        success: "Merci pour votre intérêt! Nous vous contacterons lorsque des postes pertinents seront disponibles."
      }
    }
  };

  const currentContent = content[language as keyof typeof content];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(currentContent.form.success);
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        message: '',
      });
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                <Briefcase className="w-10 h-10 text-white" />
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

        {/* No Current Openings */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-3xl mx-auto shadow-xl text-center">
              <CardContent className="p-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-8">
                  <Briefcase className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {currentContent.noOpenings.title}
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  {currentContent.noOpenings.description}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">
                    {currentContent.noOpenings.futureTitle}
                  </h3>
                  <p className="text-blue-700">
                    {currentContent.noOpenings.futureDescription}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Company Culture */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {currentContent.culture.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {currentContent.culture.values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card key={index} className="text-center shadow-lg">
                    <CardContent className="p-8">
                      <div className="mx-auto w-16 h-16 bg-plp-purple/10 rounded-2xl flex items-center justify-center mb-6">
                        <IconComponent className="w-8 h-8 text-plp-purple" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {value.title}
                      </h3>
                      <p className="text-gray-600">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {currentContent.benefits.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentContent.benefits.items.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-plp-yellow rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Talent Pool Form */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-2xl mx-auto shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 text-center">
                  {currentContent.form.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{currentContent.form.name} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{currentContent.form.email} *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{currentContent.form.phone}</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">{currentContent.form.experience}</Label>
                      <Input
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">{currentContent.form.position}</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      placeholder={language === 'fr' ? 'ex: Développeur Frontend' : 'e.g. Frontend Developer'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{currentContent.form.message} *</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder={language === 'fr' 
                        ? 'Parlez-nous de votre expérience et de vos intérêts...'
                        : 'Tell us about your experience and interests...'}
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <Button variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      {language === 'fr' ? 'Télécharger CV (Optionnel)' : 'Upload Resume (Optional)'}
                    </Button>

                    <Button 
                      type="submit" 
                      className="w-full btn-primary" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {language === 'fr' ? 'Envoi...' : 'Submitting...'}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {currentContent.form.submit}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}