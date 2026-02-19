'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Bell, Home, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { newsletterService } from '@/services/newsletterService';

interface NewsletterPopupProps {
  delay?: number;
}

export function NewsletterPopup({ delay = 3000 }: NewsletterPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Increment visit count on mount
    newsletterService.incrementVisitCount();

    // Check if popup should be shown
    const shouldShow = newsletterService.shouldShowPopup();
    
    if (shouldShow) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  const handleClose = () => {
    setIsVisible(false);
    newsletterService.markPopupAsSeen();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await newsletterService.subscribe({ email, name: name || undefined });
      
      if (response.status === 'success') {
        setIsSubscribed(true);
        newsletterService.markAsSubscribed();
        newsletterService.markPopupAsSeen();
        toast.success(response.message);
        
        // Close popup after showing success
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      } else if (response.status === 'info') {
        toast.info(response.message);
        newsletterService.markAsSubscribed();
        newsletterService.markPopupAsSeen();
        setIsVisible(false);
      }
    } catch (error: any) {
      const message = error?.message || 'Failed to subscribe. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          
          {/* Popup wrapper - flex centering */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto pointer-events-auto rounded-2xl shadow-2xl"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-br from-plp-purple via-purple-600 to-indigo-700 p-8 text-white">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Close popup"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Home className="w-8 h-8" />
                    </div>
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    Never Miss a Perfect Property!
                  </h2>
                  <p className="text-white/90 text-sm sm:text-base">
                    Join our newsletter and be the first to discover new listings, 
                    exclusive deals, and property market insights.
                  </p>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 sm:p-8">
                {!isSubscribed ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Benefits */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Bell className="w-4 h-4 text-plp-purple" />
                        <span>New Listings Alerts</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Sparkles className="w-4 h-4 text-plp-purple" />
                        <span>Exclusive Deals</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Mail className="w-4 h-4 text-plp-purple" />
                        <span>Market Insights</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Home className="w-4 h-4 text-plp-purple" />
                        <span>Featured Properties</span>
                      </div>
                    </div>
                    
                    {/* Form fields */}
                    <div className="space-y-3">
                      <Input
                        type="text"
                        placeholder="Your name (optional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12"
                      />
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-plp-purple to-indigo-600 hover:from-plp-purple/90 hover:to-indigo-600/90 text-white font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Subscribe Now
                        </>
                      )}
                    </Button>
                    
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                      We respect your privacy. Unsubscribe at any time.
                    </p>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      You're All Set!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Thank you for subscribing! Check your email for a welcome message.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
