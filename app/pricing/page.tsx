'use client'

import React from 'react';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Building2, Users, TrendingUp, Shield, Phone, CreditCard, Smartphone } from 'lucide-react';
import Link from 'next/link';

const pricingPlans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for new agents getting started',
    price: 25000,
    period: 'month',
    popular: false,
    features: [
      'Up to 5 property listings',
      'Basic analytics dashboard',
      'Email support',
      'Mobile money payments',
      'Standard commission rate (15%)',
      'Basic client management',
    ],
    limitations: [
      'Limited to 5 properties',
      'Basic support only',
      'No priority listing',
    ],
    icon: Building2,
    color: 'plp-purple',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Most popular for growing agents',
    price: 45000,
    period: 'month',
    popular: true,
    features: [
      'Up to 25 property listings',
      'Advanced analytics & reports',
      'Priority email & phone support',
      'All payment methods',
      'Reduced commission rate (12%)',
      'Advanced client management',
      'Featured property slots (2/month)',
      'Marketing tools',
    ],
    limitations: [],
    icon: Star,
    color: 'plp-pink',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For established agencies and top performers',
    price: 75000,
    period: 'month',
    popular: false,
    features: [
      'Unlimited property listings',
      'Premium analytics & insights',
      'Dedicated account manager',
      'All payment methods + priority processing',
      'Lowest commission rate (10%)',
      'Complete client CRM',
      'Unlimited featured listings',
      'Advanced marketing suite',
      'API access',
      'White-label options',
    ],
    limitations: [],
    icon: Crown,
    color: 'plp-yellow',
  },
];

const paymentMethods = [
  {
    name: 'Mobile Money',
    description: 'MTN Mobile Money, Orange Money',
    icon: Smartphone,
    popular: true,
  },
  {
    name: 'Bank Transfer',
    description: 'Direct bank transfer (local banks)',
    icon: Building2,
    popular: false,
  },
  {
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard',
    icon: CreditCard,
    popular: false,
  },
];

const faqs = [
  {
    question: 'Puis-je changer de plan à tout moment?',
    answer: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.',
  },
  {
    question: 'Y a-t-il des frais cachés?',
    answer: 'Non, tous nos prix sont transparents. Vous ne payez que l\'abonnement mensuel et les commissions sur les réservations.',
  },
  {
    question: 'Comment fonctionne le paiement mobile money?',
    answer: 'Nous acceptons MTN Mobile Money et Orange Money. Le paiement est sécurisé et instantané.',
  },
  {
    question: 'Que se passe-t-il si j\'annule mon abonnement?',
    answer: 'Vos propriétés restent actives jusqu\'à la fin de votre période de facturation, puis elles sont désactivées.',
  },
];

export default function PricingPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-plp-purple via-plp-pink to-plp-yellow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-6xl font-bold text-white">
                Plans d&#39;Abonnement
                <span className="block text-plp-yellow">pour Agents</span>
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Choisissez le plan parfait pour développer votre activité immobilière. 
                Commissions réduites, outils avancés, support dédié.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">3</div>
                  <div className="text-white/80">Plans Flexibles</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-white/80">Support Client</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">10%</div>
                  <div className="text-white/80">Commission Min</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choisissez Votre Plan
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Tous les plans incluent l&#39;accès à notre plateforme,
                la gestion des clients et les outils de base.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <Card 
                    key={plan.id} 
                    className={`relative overflow-hidden ${
                      plan.popular 
                        ? 'border-2 border-plp-pink shadow-2xl scale-105' 
                        : 'border border-gray-200 shadow-lg'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-0 right-0 bg-plp-pink text-white text-center py-2 text-sm font-medium">
                        Plan le Plus Populaire
                      </div>
                    )}
                    
                    <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-8'}`}>
                      <div className={`mx-auto w-16 h-16 bg-${plan.color} rounded-2xl flex items-center justify-center mb-4`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {plan.name}
                      </CardTitle>
                      <p className="text-gray-600">{plan.description}</p>
                      <div className="pt-4">
                        <div className="text-4xl font-bold text-gray-900">
                          {formatCurrency(plan.price)}
                          <span className="text-lg text-gray-600 font-normal">/{plan.period}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Link href={`/payment/subscribe?plan=${plan.id}`}>
                        <Button 
                          className={`w-full ${
                            plan.popular 
                              ? 'btn-secondary' 
                              : 'btn-primary'
                          }`}
                        >
                          Choisir ce Plan
                        </Button>
                      </Link>
                      
                      <p className="text-xs text-gray-500 text-center">
                        Annulation possible à tout moment
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Méthodes de Paiement
              </h2>
              <p className="text-lg text-gray-600">
                Payez facilement avec vos méthodes préférées
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card key={method.name} className="text-center">
                    <CardContent className="p-8">
                      <div className={`mx-auto w-16 h-16 ${
                        method.popular ? 'bg-plp-pink' : 'bg-gray-100'
                      } rounded-2xl flex items-center justify-center mb-4`}>
                        <Icon className={`w-8 h-8 ${
                          method.popular ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {method.name}
                      </h3>
                      <p className="text-gray-600">{method.description}</p>
                      {method.popular && (
                        <Badge className="mt-3 bg-plp-pink/10 text-plp-pink">
                          Plus Populaire
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Questions Fréquentes
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-plp-purple">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">
                Prêt à Commencer?
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Rejoignez des centaines d&#39;agents qui font confiance à notre plateforme
                pour développer leur activité immobilière.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/signup?type=agent">
                  <Button className="btn-accent">
                    Devenir Agent
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-plp-purple">
                    <Phone className="w-4 h-4 mr-2" />
                    Nous Contacter
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}