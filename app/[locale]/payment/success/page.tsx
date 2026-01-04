'use client'

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CircleCheck as CheckCircle, ArrowRight, Download, Calendar, Star } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams?.get('plan') || 'professional';
  const amount = searchParams?.get('amount') || '45000';

  const planDetails = {
    starter: { name: 'Starter', features: ['5 propriétés', 'Analytics de base', 'Commission 15%'] },
    professional: { name: 'Professional', features: ['25 propriétés', 'Analytics avancées', 'Commission 12%'] },
    enterprise: { name: 'Enterprise', features: ['Propriétés illimitées', 'Analytics premium', 'Commission 10%'] },
  };

  const selectedPlan = planDetails[plan as keyof typeof planDetails] || planDetails.professional;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    // Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard/agent');
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="text-center shadow-xl">
          <CardHeader className="pb-4">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Paiement Réussi!
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Bienvenue dans votre nouveau plan {selectedPlan.name}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Payment Details */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan souscrit:</span>
                  <Badge className="bg-plp-purple text-white">{selectedPlan.name}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Montant payé:</span>
                  <span className="font-bold text-green-600">{formatCurrency(parseInt(amount))}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date de paiement:</span>
                  <span className="font-medium">{new Date().toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Prochaine facturation:</span>
                  <span className="font-medium">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Fonctionnalités Activées
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Prochaines Étapes
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>✓ Votre compte agent a été activé</p>
                <p>✓ Vous pouvez maintenant ajouter des propriétés</p>
                <p>✓ Accès complet à votre tableau de bord</p>
                <p>✓ Support client disponible 24/7</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/app/[locale]/dashboard/agent" className="flex-1">
                <Button className="w-full btn-primary">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Accéder au Tableau de Bord
                </Button>
              </Link>
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Télécharger la Facture
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              Un email de confirmation a été envoyé à votre adresse. 
              Vous serez automatiquement redirigé dans quelques secondes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}