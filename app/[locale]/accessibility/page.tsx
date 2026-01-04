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
import { Eye, Ear, Hand, Brain, Keyboard, Monitor, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function AccessibilityPage() {
  const [language, setLanguage] = useState('en');
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    assistiveTech: '',
    issue: '',
    suggestion: '',
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
      title: "Accessibility",
      subtitle: "We're committed to making our platform accessible to everyone",
      commitment: {
        title: "Our Commitment",
        description: "Property Listing Portal is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards."
      },
      features: {
        title: "Accessibility Features",
        items: [
          {
            icon: Eye,
            title: "Visual Accessibility",
            description: "High contrast colors, scalable fonts, and screen reader compatibility for users with visual impairments."
          },
          {
            icon: Ear,
            title: "Audio Accessibility",
            description: "Visual indicators for audio content and closed captions for video materials."
          },
          {
            icon: Hand,
            title: "Motor Accessibility",
            description: "Keyboard navigation support and large clickable areas for users with motor disabilities."
          },
          {
            icon: Brain,
            title: "Cognitive Accessibility",
            description: "Clear navigation, consistent layouts, and simple language to support users with cognitive disabilities."
          }
        ]
      },
      standards: {
        title: "Accessibility Standards",
        description: "We strive to conform to WCAG 2.1 Level AA standards and regularly audit our platform for compliance.",
        guidelines: [
          "WCAG 2.1 Level AA compliance",
          "Section 508 standards adherence",
          "ADA (Americans with Disabilities Act) compliance",
          "Regular accessibility audits and testing",
          "User feedback integration for improvements"
        ]
      },
      tools: {
        title: "Assistive Technology Support",
        description: "Our platform is designed to work with various assistive technologies:",
        items: [
          "Screen readers (JAWS, NVDA, VoiceOver)",
          "Voice recognition software",
          "Keyboard navigation tools",
          "Browser zoom and magnification",
          "High contrast and dark mode themes"
        ]
      },
      feedback: {
        title: "Accessibility Feedback",
        description: "Help us improve by sharing your accessibility experience",
        form: {
          name: "Name",
          email: "Email",
          assistiveTech: "Assistive Technology Used",
          issue: "Accessibility Issue",
          suggestion: "Suggestions for Improvement",
          submit: "Submit Feedback"
        },
        success: "Thank you for your feedback! We'll review your suggestions and work to improve accessibility."
      }
    },
    fr: {
      title: "Accessibilité",
      subtitle: "Nous nous engageons à rendre notre plateforme accessible à tous",
      commitment: {
        title: "Notre Engagement",
        description: "Property Listing Portal s'engage à assurer l'accessibilité numérique pour les personnes handicapées. Nous améliorons continuellement l'expérience utilisateur pour tous et appliquons les normes d'accessibilité pertinentes."
      },
      features: {
        title: "Fonctionnalités d'Accessibilité",
        items: [
          {
            icon: Eye,
            title: "Accessibilité Visuelle",
            description: "Couleurs à contraste élevé, polices évolutives et compatibilité avec les lecteurs d'écran pour les utilisateurs malvoyants."
          },
          {
            icon: Ear,
            title: "Accessibilité Audio",
            description: "Indicateurs visuels pour le contenu audio et sous-titres pour les matériaux vidéo."
          },
          {
            icon: Hand,
            title: "Accessibilité Motrice",
            description: "Support de navigation au clavier et grandes zones cliquables pour les utilisateurs avec des handicaps moteurs."
          },
          {
            icon: Brain,
            title: "Accessibilité Cognitive",
            description: "Navigation claire, mises en page cohérentes et langage simple pour soutenir les utilisateurs avec des handicaps cognitifs."
          }
        ]
      },
      standards: {
        title: "Normes d'Accessibilité",
        description: "Nous nous efforçons de nous conformer aux normes WCAG 2.1 Niveau AA et auditons régulièrement notre plateforme pour la conformité.",
        guidelines: [
          "Conformité WCAG 2.1 Niveau AA",
          "Adhésion aux normes Section 508",
          "Conformité ADA (Americans with Disabilities Act)",
          "Audits et tests d'accessibilité réguliers",
          "Intégration des commentaires utilisateurs pour les améliorations"
        ]
      },
      tools: {
        title: "Support de Technologie d'Assistance",
        description: "Notre plateforme est conçue pour fonctionner avec diverses technologies d'assistance:",
        items: [
          "Lecteurs d'écran (JAWS, NVDA, VoiceOver)",
          "Logiciel de reconnaissance vocale",
          "Outils de navigation au clavier",
          "Zoom et agrandissement du navigateur",
          "Thèmes à contraste élevé et mode sombre"
        ]
      },
      feedback: {
        title: "Commentaires d'Accessibilité",
        description: "Aidez-nous à nous améliorer en partageant votre expérience d'accessibilité",
        form: {
          name: "Nom",
          email: "Email",
          assistiveTech: "Technologie d'Assistance Utilisée",
          issue: "Problème d'Accessibilité",
          suggestion: "Suggestions d'Amélioration",
          submit: "Soumettre les Commentaires"
        },
        success: "Merci pour vos commentaires! Nous examinerons vos suggestions et travaillerons à améliorer l'accessibilité."
      }
    }
  };

  const currentContent = content[language as keyof typeof content];

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(currentContent.feedback.success);
      setFeedbackForm({
        name: '',
        email: '',
        assistiveTech: '',
        issue: '',
        suggestion: '',
      });
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFeedbackForm(prev => ({ ...prev, [field]: value }));
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
                <Eye className="w-10 h-10 text-white" />
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

        {/* Commitment */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {currentContent.commitment.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {currentContent.commitment.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Accessibility Features */}
        <section className="py-20 bg-gray-50">
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

        {/* Standards & Tools */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {currentContent.standards.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-6">
                    {currentContent.standards.description}
                  </p>
                  <ul className="space-y-3">
                    {currentContent.standards.guidelines.map((guideline, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-plp-purple rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{guideline}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {currentContent.tools.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-6">
                    {currentContent.tools.description}
                  </p>
                  <ul className="space-y-3">
                    {currentContent.tools.items.map((tool, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-plp-pink rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{tool}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Feedback Form */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-2xl mx-auto shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 text-center">
                  {currentContent.feedback.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-8">
                  {currentContent.feedback.description}
                </p>

                <form onSubmit={handleSubmitFeedback} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{currentContent.feedback.form.name}</Label>
                      <Input
                        id="name"
                        value={feedbackForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{currentContent.feedback.form.email}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={feedbackForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assistiveTech">{currentContent.feedback.form.assistiveTech}</Label>
                    <Input
                      id="assistiveTech"
                      value={feedbackForm.assistiveTech}
                      onChange={(e) => handleInputChange('assistiveTech', e.target.value)}
                      placeholder={language === 'fr' ? 'ex: Lecteur d\'écran NVDA' : 'e.g. NVDA Screen Reader'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issue">{currentContent.feedback.form.issue}</Label>
                    <Textarea
                      id="issue"
                      rows={3}
                      value={feedbackForm.issue}
                      onChange={(e) => handleInputChange('issue', e.target.value)}
                      placeholder={language === 'fr' 
                        ? 'Décrivez tout problème d\'accessibilité que vous avez rencontré...'
                        : 'Describe any accessibility issues you encountered...'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="suggestion">{currentContent.feedback.form.suggestion}</Label>
                    <Textarea
                      id="suggestion"
                      rows={3}
                      value={feedbackForm.suggestion}
                      onChange={(e) => handleInputChange('suggestion', e.target.value)}
                      placeholder={language === 'fr' 
                        ? 'Partagez vos suggestions pour améliorer l\'accessibilité...'
                        : 'Share your suggestions for improving accessibility...'}
                    />
                  </div>

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
                        {currentContent.feedback.form.submit}
                      </>
                    )}
                  </Button>
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