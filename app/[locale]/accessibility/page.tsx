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
import { Badge } from '@/components/ui/badge';
import { Eye, Ear, Hand, Brain, Keyboard, Monitor, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

const featureIcons = [Eye, Ear, Hand, Brain];

export default function AccessibilityPage() {
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    assistiveTech: '',
    issue: '',
    suggestion: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations();

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(t('accessibility.feedback.success'));
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
                {t('accessibility.title')}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {t('accessibility.subtitle')}
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
                  {t('accessibility.commitment.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {t('accessibility.commitment.description')}
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
                {t('accessibility.features.title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[0, 1, 2, 3].map((i) => {
                const IconComponent = featureIcons[i];
                return (
                  <Card key={i} className="text-center shadow-lg">
                    <CardContent className="p-8">
                      <div className="mx-auto w-16 h-16 bg-plp-purple/10 rounded-2xl flex items-center justify-center mb-6">
                        <IconComponent className="w-8 h-8 text-plp-purple" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {t(`accessibility.features.${i}.title`)}
                      </h3>
                      <p className="text-gray-600">
                        {t(`accessibility.features.${i}.description`)}
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
                    {t('accessibility.standards.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-6">
                    {t('accessibility.standards.description')}
                  </p>
                  <ul className="space-y-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-plp-purple rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{t(`accessibility.standards.${i}`)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {t('accessibility.tools.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-6">
                    {t('accessibility.tools.description')}
                  </p>
                  <ul className="space-y-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-plp-pink rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{t(`accessibility.tools.${i}`)}</span>
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
                  {t('accessibility.feedback.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-8">
                  {t('accessibility.feedback.description')}
                </p>

                <form onSubmit={handleSubmitFeedback} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('accessibility.feedback.name')}</Label>
                      <Input
                        id="name"
                        value={feedbackForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('accessibility.feedback.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={feedbackForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assistiveTech">{t('accessibility.feedback.assistiveTech')}</Label>
                    <Input
                      id="assistiveTech"
                      value={feedbackForm.assistiveTech}
                      onChange={(e) => handleInputChange('assistiveTech', e.target.value)}
                      placeholder={t('accessibility.feedback.assistiveTechPlaceholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issue">{t('accessibility.feedback.issue')}</Label>
                    <Textarea
                      id="issue"
                      rows={3}
                      value={feedbackForm.issue}
                      onChange={(e) => handleInputChange('issue', e.target.value)}
                      placeholder={t('accessibility.feedback.issuePlaceholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="suggestion">{t('accessibility.feedback.suggestion')}</Label>
                    <Textarea
                      id="suggestion"
                      rows={3}
                      value={feedbackForm.suggestion}
                      onChange={(e) => handleInputChange('suggestion', e.target.value)}
                      placeholder={t('accessibility.feedback.suggestionPlaceholder')}
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
                        {t('accessibility.feedback.submitting')}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t('accessibility.feedback.submit')}
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