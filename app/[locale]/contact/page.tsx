'use client';

import React, { useState } from 'react';
import { useTranslations } from '@/components/translation-provider';
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
  const t = useTranslations();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name) {
      toast.error(t('contact.validation.nameRequired'));
      return;
    }
    if (!formData.email) {
      toast.error(t('contact.validation.emailRequired'));
      return;
    }
    if (!formData.message) {
      toast.error(t('contact.validation.messageRequired'));
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(t('contact.success'));
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
              {t('contact.title')}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              {t('contact.subtitle')}
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
                    {t('contact.form.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('contact.form.name')} *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('contact.form.email')} *</Label>
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
                        <Label htmlFor="phone">{t('contact.form.phone')}</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">{t('contact.form.category')}</Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('contact.form.selectCategory')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">{t('contact.form.categories.general')}</SelectItem>
                            <SelectItem value="booking">{t('contact.form.categories.booking')}</SelectItem>
                            <SelectItem value="property">{t('contact.form.categories.property')}</SelectItem>
                            <SelectItem value="technical">{t('contact.form.categories.technical')}</SelectItem>
                            <SelectItem value="billing">{t('contact.form.categories.billing')}</SelectItem>
                            <SelectItem value="partnership">{t('contact.form.categories.partnership')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">{t('contact.form.subject')}</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t('contact.form.message')} *</Label>
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
                          {t('contact.form.sending')}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {t('contact.form.submit')}
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
                    {t('contact.contact.title')}
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
                            {t('contact.contact.phone.title')}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {t('contact.contact.phone.description')}
                          </p>
                          <p className="font-medium text-plp-purple">
                            {t('contact.contact.phone.number')}
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
                            {t('contact.contact.email.title')}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {t('contact.contact.email.description')}
                          </p>
                          <p className="font-medium text-plp-pink">
                            {t('contact.contact.email.address')}
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
                            {t('contact.contact.address.title')}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {t('contact.contact.address.description')}
                          </p>
                          <p className="font-medium text-gray-700 whitespace-pre-line">
                            {t('contact.contact.address.location')}
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
                            {t('contact.hours.title')}
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-700">{t('contact.hours.weekdays')}</p>
                            <p className="text-gray-700">{t('contact.hours.weekend')}</p>
                            <p className="text-gray-500">{t('contact.hours.timezone')}</p>
                            <p className="text-green-600 font-medium">{t('contact.hours.emergency')}</p>
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
                {t('contact.faq.title')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('contact.faq.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[0, 1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {t(`contact.faq.${i}.question`)}
                    </h3>
                    <p className="text-gray-600">
                      {t(`contact.faq.${i}.answer`)}
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