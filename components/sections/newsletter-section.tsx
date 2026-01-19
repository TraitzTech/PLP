"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "@/components/translation-provider";
import { Mail, CircleCheck as CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const t = useTranslations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(t("newsletter.error", "Please enter your email address"));
      return;
    }

    // Simulate subscription
    setIsSubscribed(true);
    toast.success(t("newsletter.success", "Thank you for subscribing!"));
    setEmail("");
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-4xl mx-auto shadow-xl border-0">
          <CardContent className="p-12 text-center">
            <div className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-plp-purple rounded-2xl flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  {t("newsletter.title", "Stay Updated with the Best Deals")}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {t(
                    "newsletter.subtitle",
                    "Subscribe to our newsletter and never miss out on exclusive offers, latest property listings, and expert tips."
                  )}
                </p>
              </div>

              {!isSubscribed ? (
                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-12"
                    />
                    <Button type="submit" className="btn-primary h-12 px-8">
                      {t("newsletter.subscribeButton", "Subscribe")}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    {t(
                      "newsletter.privacyNote",
                      "We respect your privacy. Unsubscribe at any time."
                    )}
                  </p>
                </form>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      {t(
                        "newsletter.successMessage",
                        "Successfully subscribed!"
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {t(
                      "newsletter.thankYouMessage",
                      "Thank you! You'll receive our latest updates soon."
                    )}
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
