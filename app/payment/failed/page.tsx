'use client'

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Circle as XCircle, ArrowLeft, RefreshCw, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function PaymentFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams?.get('plan') || 'professional';
  const error = searchParams?.get('error') || 'payment_failed';

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'insufficient_funds':
        return 'Fonds insuffisants sur votre compte.';
      case 'card_declined':
        return 'Votre carte a été refusée.';
      case 'network_error':
        return 'Erreur de réseau. Veuillez réessayer.';
      case 'mobile_money_failed':
        return 'Échec du paiement Mobile Money.';
      default:
        return 'Une erreur est survenue lors du traitement de votre paiement.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="text-center shadow-xl">
          <CardHeader className="pb-4">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Paiement Échoué
            </CardTitle>
            <p className="text-gray-600 text-lg">
              {getErrorMessage(error)}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="font-semibold text-red-800 mb-2">Que s'est-il passé?</h3>
              <p className="text-red-700 text-sm mb-4">
                Votre paiement pour le plan {plan} n'a pas pu être traité. 
                Aucun montant n'a été débité de votre compte.
              </p>
              <div className="text-left space-y-2 text-sm text-red-700">
                <p>• Vérifiez que vous avez suffisamment de fonds</p>
                <p>• Assurez-vous que vos informations de paiement sont correctes</p>
                <p>• Contactez votre banque si le problème persiste</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/payment/subscribe?plan=${plan}`} className="flex-1">
                <Button className="w-full btn-primary">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réessayer le Paiement
                </Button>
              </Link>
              <Link href="/pricing" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux Plans
                </Button>
              </Link>
            </div>

            {/* Support Options */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">
                Besoin d'Aide?
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Appeler le Support
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer un Email
                </Button>
              </div>
              <p className="text-sm text-blue-700 mt-3">
                Notre équipe support est disponible 24/7 pour vous aider avec vos paiements.
              </p>
            </div>

            <p className="text-sm text-gray-500">
              Référence de transaction: TXN-{Date.now().toString().slice(-8)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}