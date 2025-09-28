'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, Smartphone, Building2, Shield, Check, Phone } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const plans = {
  starter: {
    name: 'Starter',
    price: 25000,
    features: ['5 propriétés', 'Analytics de base', 'Support email', 'Commission 15%'],
  },
  professional: {
    name: 'Professional',
    price: 45000,
    features: ['25 propriétés', 'Analytics avancées', 'Support prioritaire', 'Commission 12%'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 75000,
    features: ['Propriétés illimitées', 'Analytics premium', 'Account manager', 'Commission 10%'],
  },
};

export default function SubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams?.get('plan') || 'professional';
  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Mobile Money
    mobileProvider: 'mtn',
    mobileNumber: '',
    
    // Bank Transfer
    bankName: '',
    accountNumber: '',
    accountName: '',
    
    // Card
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedPlan = plans[planId as keyof typeof plans] || plans.professional;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Paiement traité avec succès! Bienvenue dans votre nouveau plan.');
      router.push('/dashboard/agent?welcome=true');
    }, 3000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'mobile_money':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Opérateur Mobile</Label>
              <RadioGroup
                value={formData.mobileProvider}
                onValueChange={(value) => handleInputChange('mobileProvider', value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mtn" id="mtn" />
                  <Label htmlFor="mtn">MTN Mobile Money</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="orange" id="orange" />
                  <Label htmlFor="orange">Orange Money</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Numéro de Téléphone</Label>
              <Input
                id="mobileNumber"
                placeholder="+237 6XX XXX XXX"
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                required
              />
            </div>
          </div>
        );

      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Nom de la Banque</Label>
              <Input
                id="bankName"
                placeholder="ex: Afriland First Bank"
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Numéro de Compte</Label>
              <Input
                id="accountNumber"
                placeholder="Numéro de compte bancaire"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName">Nom du Titulaire</Label>
              <Input
                id="accountName"
                placeholder="Nom complet du titulaire du compte"
                value={formData.accountName}
                onChange={(e) => handleInputChange('accountName', e.target.value)}
                required
              />
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Numéro de Carte</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Date d'Expiration</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName">Nom sur la Carte</Label>
              <Input
                id="cardName"
                placeholder="Nom complet"
                value={formData.cardName}
                onChange={(e) => handleInputChange('cardName', e.target.value)}
                required
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/pricing">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux Plans
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finaliser l'Abonnement</h1>
            <p className="text-gray-600 mt-2">Complétez votre inscription au plan {selectedPlan.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations Personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      placeholder="+237 6XX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Méthode de Paiement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="mobile_money" id="mobile_money" />
                      <div className="flex items-center gap-3 flex-1">
                        <Smartphone className="w-5 h-5 text-plp-pink" />
                        <div>
                          <Label htmlFor="mobile_money" className="font-medium">Mobile Money</Label>
                          <p className="text-sm text-gray-600">MTN Mobile Money, Orange Money</p>
                        </div>
                      </div>
                      <Badge className="bg-plp-pink/10 text-plp-pink">Populaire</Badge>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <div className="flex items-center gap-3 flex-1">
                        <Building2 className="w-5 h-5 text-gray-600" />
                        <div>
                          <Label htmlFor="bank_transfer" className="font-medium">Virement Bancaire</Label>
                          <p className="text-sm text-gray-600">Transfert direct depuis votre banque</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <div className="flex items-center gap-3 flex-1">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <div>
                          <Label htmlFor="card" className="font-medium">Carte Bancaire</Label>
                          <p className="text-sm text-gray-600">Visa, Mastercard</p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Payment Form */}
                  <div className="pt-4">
                    {renderPaymentForm()}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full btn-primary h-12 text-lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Confirmer le Paiement - {formatCurrency(selectedPlan.price)}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Résumé de la Commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    Plan {selectedPlan.name}
                  </h3>
                  <div className="space-y-2">
                    {selectedPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Abonnement mensuel</span>
                    <span className="font-medium">{formatCurrency(selectedPlan.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais de traitement</span>
                    <span className="font-medium text-green-600">Gratuit</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-plp-purple">{formatCurrency(selectedPlan.price)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Paiement Sécurisé</h4>
                      <p className="text-sm text-blue-700">
                        Vos informations de paiement sont protégées par un cryptage SSL 256-bit.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    En confirmant, vous acceptez nos{' '}
                    <Link href="/terms" className="text-plp-purple hover:underline">
                      Conditions d'Utilisation
                    </Link>{' '}
                    et notre{' '}
                    <Link href="/privacy" className="text-plp-purple hover:underline">
                      Politique de Confidentialité
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}