'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, CircleHelp as HelpCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [language, setLanguage] = useState('en');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
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
      title: "Contact Us",
      subtitle: "Get in touch with our team. We're here to help you with any questions or concerns.",
      form: {
        title: "Send us a Message",
        name: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        subject: "Subject",
        category: "Category",
        message: "Message",
        submit: "Send Message",
        categories: {
          general: "General Inquiry",
          booking: "Booking Support",
          property: "Property Listing",
          technical: "Technical Issue",
          billing: "Billing Question",
          partnership: "Partnership"
        }
      },
      contact: {
        title: "Contact Information",
        phone: {
          title: "Phone Support",
          description: "Speak with our support team",
          number: "+1 (555) 123-4567"
        },
        email: {
          title: "Email Support",
          description: "Send us an email anytime",
          address: "support@propertylistingportal.com"
        },
        address: {
          title: "Office Address",
          description: "Visit our headquarters",
          location: "123 Business Ave, Suite 100\nCity, ST 12345\nUnited States"
        }
      },
      hours: {
        title: "Business Hours",
        weekdays: "Monday - Friday: 9:00 AM - 6:00 PM",
        weekend: "Saturday - Sunday: 10:00 AM - 4:00 PM",
        timezone: "Eastern Time (ET)",
        emergency: "24/7 Emergency Support Available"
      },
      success: "Thank you for your message! We'll get back to you within 24 hours.",
      validation: {
        nameRequired: "Name is required",
        emailRequired: "Email is required",
        emailInvalid: "Please enter a valid email",
        messageRequired: "Message is required"
      }
    },
    fr: {
      title: "Nous Contacter",
      subtitle: "Contactez notre équipe. Nous sommes là pour vous aider avec toutes vos questions ou préoccupations.",
      form: {
        title: "Envoyez-nous un Message",
        name: "Nom Complet",
        email: "Adresse Email",
        phone: "Numéro de Téléphone",
        subject: "Sujet",
        category: "Catégorie",
        message: "Message",
        submit: "Envoyer le Message",
        categories: {
          general: "Demande Générale",
          booking: "Support Réservation",
          property: "Inscription Propriété",
          technical: "Problème Technique",
          billing: "Question Facturation",
          partnership: "Partenariat"
        }
      },
      contact: {
        title: "Informations de Contact",
        phone: {
          title: "Support Téléphonique",
          description: "Parlez avec notre équipe support",
          number: "+1 (555) 123-4567"
        },
        email: {
          title: "Support Email",
          description: "Envoyez-nous un email à tout moment",
          address: "support@propertylistingportal.com"
        },
        address: {
          title: "Adresse du Bureau",
          description: "Visitez notre siège social",
          location: "123 Business Ave, Suite 100\nCity, ST 12345\nÉtats-Unis"
        }
      },
      hours: {
        title: "Heures d'Ouverture",
        weekdays: "Lundi - Vendredi: 9h00 - 18h00",
        weekend: "Samedi - Dimanche: 10h00 - 16h00",
        timezone: "Heure de l'Est (ET)",
        emergency: "Support d'Urgence 24h/24 Disponible"
      },
      success: "Merci pour votre message! Nous vous répondrons dans les 24 heures.",
      validation: {
        nameRequired: "Le nom est requis",
        emailRequired: "L'email est requis",
        emailInvalid: "Veuillez entrer un email valide",
        messageRequired: "Le message est requis"
      }
    }
  };

  const currentContent = content[language as keyof typeof content];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name) {
      toast.error(currentContent.validation.nameRequired);
      return;
    }
    if (!formData.email) {
      toast.error(currentContent.validation.emailRequired);
      return;
    }
    if (!formData.message) {
      toast.error(currentContent.validation.messageRequired);
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(currentContent.success);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: '',
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
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              {currentContent.title}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              {currentContent.subtitle}
            </p>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
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
                        <Label htmlFor="category">{currentContent.form.category}</Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">{currentContent.form.categories.general}</SelectItem>
                            <SelectItem value="booking">{currentContent.form.categories.booking}</SelectItem>
                            <SelectItem value="property">{currentContent.form.categories.property}</SelectItem>
                            <SelectItem value="technical">{currentContent.form.categories.technical}</SelectItem>
                            <SelectItem value="billing">{currentContent.form.categories.billing}</SelectItem>
                            <SelectItem value="partnership">{currentContent.form.categories.partnership}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">{currentContent.form.subject}</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{currentContent.form.message} *</Label>
                      <Textarea
                        id="message"
                        rows={6}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        required
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
                          {language === 'fr' ? 'Envoi...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {currentContent.form.submit}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">
                    {currentContent.contact.title}
                  </h2>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-plp-purple/10 rounded-lg">
                          <Phone className="w-6 h-6 text-plp-purple" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {currentContent.contact.phone.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {currentContent.contact.phone.description}
                          </p>
                          <p className="font-medium text-plp-purple">
                            {currentContent.contact.phone.number}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-plp-pink/10 rounded-lg">
                          <Mail className="w-6 h-6 text-plp-pink" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {currentContent.contact.email.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {currentContent.contact.email.description}
                          </p>
                          <p className="font-medium text-plp-pink">
                            {currentContent.contact.email.address}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-plp-yellow/10 rounded-lg">
                          <MapPin className="w-6 h-6 text-plp-yellow" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {currentContent.contact.address.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {currentContent.contact.address.description}
                          </p>
                          <p className="font-medium text-gray-700 whitespace-pre-line">
                            {currentContent.contact.address.location}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Clock className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {currentContent.hours.title}
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-700">{currentContent.hours.weekdays}</p>
                            <p className="text-gray-700">{currentContent.hours.weekend}</p>
                            <p className="text-gray-500">{currentContent.hours.timezone}</p>
                            <p className="text-green-600 font-medium">{currentContent.hours.emergency}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {language === 'fr' ? 'Questions Fréquentes' : 'Frequently Asked Questions'}
              </h2>
              <p className="text-lg text-gray-600">
                {language === 'fr' 
                  ? 'Trouvez des réponses rapides aux questions les plus courantes'
                  : 'Find quick answers to the most common questions'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {(language === 'fr' ? [
                {
                  question: "Comment puis-je réserver une propriété?",
                  answer: "Utilisez notre formulaire de recherche pour trouver des propriétés, sélectionnez vos dates et suivez le processus de réservation."
                },
                {
                  question: "Quelles sont vos politiques d'annulation?",
                  answer: "Les politiques d'annulation varient selon la propriété. Consultez les détails spécifiques lors de la réservation."
                },
                {
                  question: "Comment devenir hôte?",
                  answer: "Cliquez sur 'Devenir Hôte' et suivez notre processus d'inscription simple en 3 étapes."
                },
                {
                  question: "Le support client est-il disponible 24h/24?",
                  answer: "Oui, notre équipe de support d'urgence est disponible 24h/24 pour les problèmes urgents."
                }
              ] : [
                {
                  question: "How do I book a property?",
                  answer: "Use our search form to find properties, select your dates, and follow the booking process."
                },
                {
                  question: "What are your cancellation policies?",
                  answer: "Cancellation policies vary by property. Check the specific details when booking."
                },
                {
                  question: "How do I become a host?",
                  answer: "Click 'Become a Host' and follow our simple 3-step registration process."
                },
                {
                  question: "Is customer support available 24/7?",
                  answer: "Yes, our emergency support team is available 24/7 for urgent issues."
                }
              ]).map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}