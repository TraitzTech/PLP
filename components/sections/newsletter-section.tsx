'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, CircleCheck as CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { newsletterService } from '@/services/newsletterService';
import { useTranslations } from '@/components/translation-provider';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error(t('newsletter.emailRequired', 'Please enter your email address'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await newsletterService.subscribe({ email });
      
      if (response.status === 'success') {
        setIsSubscribed(true);
        newsletterService.markAsSubscribed();
        toast.success('Subscribed successfully');
        setEmail('');
      } else if (response.status === 'info') {
        toast.info(response.message);
        newsletterService.markAsSubscribed();
      }
    } catch (error: any) {
      const message = error?.message || error?.data?.message || 'Failed to subscribe. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-4xl mx-auto shadow-xl border-0 dark:bg-gray-800">
          <CardContent className="p-12 text-center">
            <div className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-plp-purple rounded-2xl flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('newsletter.title', 'Stay Updated with the Best Deals')}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  {t('newsletter.subtitle', 'Get exclusive access to new properties, special offers, and travel tips delivered straight to your inbox.')}
                </p>
              </div>

              {!isSubscribed ? (
                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder={t('newsletter.emailPlaceholder', 'Enter your email address')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-12"
                      disabled={isLoading}
                    />
                    <Button 
                      type="submit" 
                      className="btn-primary h-12 px-8"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        t('newsletter.subscribeButton', 'Subscribe')
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                    {t('newsletter.privacyNote', "We respect your privacy. Unsubscribe at any time.")}
                  </p>
                </form>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{t('newsletter.successMessage', 'Successfully subscribed!')}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {t('newsletter.thankYouMessage', "Thank you! You'll receive our latest updates soon.")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}