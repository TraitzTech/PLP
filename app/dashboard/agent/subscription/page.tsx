'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
import { ProgressSimple as Progress } from "@/components/ui/progress-simple"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Crown, Star, Building2, TrendingUp, Calendar, CreditCard, AlertTriangle, Check, ArrowRight, Smartphone, Phone } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Mock subscription data
const currentSubscription = {
    plan: 'professional',
    planName: 'Professional',
    price: 45000,
    status: 'active',
    nextBillingDate: '2024-03-15',
    daysRemaining: 12,
    propertiesUsed: 18,
    propertiesLimit: 25,
    commissionRate: 12,
    featuredSlotsUsed: 1,
    featuredSlotsLimit: 2,
};

const availablePlans = [
    {
        id: 'starter',
        name: 'Starter',
        price: 25000,
        features: ['5 propriétés', 'Analytics de base', 'Support email', 'Commission 15%'],
        current: false,
    },
    {
        id: 'professional',
        name: 'Professional',
        price: 45000,
        features: ['25 propriétés', 'Analytics avancées', 'Support prioritaire', 'Commission 12%'],
        current: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 75000,
        features: ['Propriétés illimitées', 'Analytics premium', 'Account manager', 'Commission 10%'],
        current: false,
    },
];

const billingHistory = [
    {
        id: '1',
        date: '2024-02-15',
        amount: 45000,
        plan: 'Professional',
        status: 'paid',
        method: 'Mobile Money (MTN)',
    },
    {
        id: '2',
        date: '2024-01-15',
        amount: 45000,
        plan: 'Professional',
        status: 'paid',
        method: 'Mobile Money (MTN)',
    },
    {
        id: '3',
        date: '2023-12-15',
        amount: 25000,
        plan: 'Starter',
        status: 'paid',
        method: 'Bank Transfer',
    },
];

export default function AgentSubscriptionPage() {
    const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-CM', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'expired':
                return 'bg-gray-100 text-gray-800';
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleUpgrade = (planId: string) => {
        toast.success('Redirection vers la page de paiement...');
        // Redirect to payment page
    };

    const handleCancelSubscription = () => {
        toast.success('Demande d\'annulation envoyée. Votre abonnement restera actif jusqu\'à la fin de la période.');
        setIsCancelDialogOpen(false);
    };

    const propertiesUsagePercentage = (currentSubscription.propertiesUsed / currentSubscription.propertiesLimit) * 100;
    const featuredUsagePercentage = (currentSubscription.featuredSlotsUsed / currentSubscription.featuredSlotsLimit) * 100;

    return (
        <DashboardLayout userType="agent">
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mon Abonnement</h1>
                    <p className="text-gray-600 mt-2">Gérez votre plan d'abonnement et votre facturation.</p>
                </div>

                {/* Current Plan */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-plp-pink" />
                            Plan Actuel
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-bold text-gray-900">{currentSubscription.planName}</h3>
                                    <Badge className={getStatusColor(currentSubscription.status)}>
                                        {currentSubscription.status}
                                    </Badge>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Prochaine facturation: {formatDate(currentSubscription.nextBillingDate)}
                                    ({currentSubscription.daysRemaining} jours restants)
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Propriétés utilisées</span>
                                            <span className="text-sm font-medium">
                        {currentSubscription.propertiesUsed}/{currentSubscription.propertiesLimit}
                      </span>
                                        </div>
                                        <Progress value={propertiesUsagePercentage} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Propriétés vedettes</span>
                                            <span className="text-sm font-medium">
                        {currentSubscription.featuredSlotsUsed}/{currentSubscription.featuredSlotsLimit}
                      </span>
                                        </div>
                                        <Progress value={featuredUsagePercentage} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-plp-purple">
                                                {currentSubscription.commissionRate}%
                                            </div>
                                            <div className="text-sm text-gray-600">Taux de commission</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-3xl font-bold text-plp-purple mb-2">
                                    {formatCurrency(currentSubscription.price)}
                                    <span className="text-lg text-gray-600 font-normal">/mois</span>
                                </div>
                                <div className="flex gap-2">
                                    <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="btn-primary">
                                                <TrendingUp className="w-4 h-4 mr-2" />
                                                Upgrade
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Changer de Plan</DialogTitle>
                                                <DialogDescription>
                                                    Choisissez un nouveau plan pour votre abonnement.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                {availablePlans.map((plan) => (
                                                    <div
                                                        key={plan.id}
                                                        className={`p-4 border rounded-lg ${
                                                            plan.current ? 'border-plp-purple bg-plp-purple/5' : 'border-gray-200'
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                                                                <p className="text-sm text-gray-600">
                                                                    {plan.features.slice(0, 2).join(', ')}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-bold text-plp-purple">
                                                                    {formatCurrency(plan.price)}/mois
                                                                </div>
                                                                {plan.current ? (
                                                                    <Badge className="bg-plp-purple text-white">Plan Actuel</Badge>
                                                                ) : (
                                                                    <Button
                                                                        size="sm"
                                                                        className="btn-primary mt-2"
                                                                        onClick={() => handleUpgrade(plan.id)}
                                                                    >
                                                                        Choisir
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <Button variant="outline">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Facturation
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Usage Alerts */}
                {propertiesUsagePercentage > 80 && (
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-yellow-800 mb-1">
                                        Limite de propriétés bientôt atteinte
                                    </h3>
                                    <p className="text-yellow-700 text-sm mb-3">
                                        Vous avez utilisé {currentSubscription.propertiesUsed} sur {currentSubscription.propertiesLimit} propriétés autorisées.
                                        Considérez un upgrade pour ajouter plus de propriétés.
                                    </p>
                                    <Button size="sm" className="btn-primary">
                                        Upgrader Maintenant
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Billing History */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Historique de Facturation</CardTitle>
                        <Button variant="outline" size="sm">
                            <Phone className="w-4 h-4 mr-2" />
                            Support Facturation
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {billingHistory.map((bill) => (
                                <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Plan {bill.plan}</h4>
                                        <p className="text-sm text-gray-600">{formatDate(bill.date)}</p>
                                        <p className="text-sm text-gray-600">{bill.method}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-gray-900">
                                            {formatCurrency(bill.amount)}
                                        </div>
                                        <Badge className={getStatusColor(bill.status)}>
                                            {bill.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Plan Comparison */}
                <Card>
                    <CardHeader>
                        <CardTitle>Comparer les Plans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {availablePlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`p-6 border rounded-lg ${
                                        plan.current ? 'border-plp-purple bg-plp-purple/5' : 'border-gray-200'
                                    }`}
                                >
                                    <div className="text-center mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                        <div className="text-2xl font-bold text-plp-purple">
                                            {formatCurrency(plan.price)}
                                            <span className="text-sm text-gray-600 font-normal">/mois</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        {plan.features.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm">
                                                <Check className="w-4 h-4 text-green-500" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    {plan.current ? (
                                        <Badge className="w-full justify-center bg-plp-purple text-white">
                                            Plan Actuel
                                        </Badge>
                                    ) : (
                                        <Link href={`/payment/subscribe?plan=${plan.id}`}>
                                            <Button className="w-full btn-primary">
                                                {plan.price > currentSubscription.price ? 'Upgrader' : 'Downgrader'}
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Cancel Subscription */}
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-600">Zone de Danger</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <h3 className="font-medium text-gray-900 mb-1">Annuler l'Abonnement</h3>
                                <p className="text-gray-600 text-sm">
                                    Votre abonnement restera actif jusqu'à la fin de la période de facturation actuelle.
                                </p>
                            </div>

                            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                        Annuler l'Abonnement
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Confirmer l'Annulation</DialogTitle>
                                        <DialogDescription>
                                            Êtes-vous sûr de vouloir annuler votre abonnement?
                                            Cette action prendra effet à la fin de votre période de facturation actuelle.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="bg-yellow-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-yellow-800 mb-2">Ce qui va se passer:</h4>
                                            <ul className="text-sm text-yellow-700 space-y-1">
                                                <li>• Votre abonnement reste actif jusqu'au {formatDate(currentSubscription.nextBillingDate)}</li>
                                                <li>• Vos propriétés seront désactivées après cette date</li>
                                                <li>• Vous perdrez l'accès aux fonctionnalités premium</li>
                                                <li>• Vous pouvez réactiver à tout moment</li>
                                            </ul>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setIsCancelDialogOpen(false)}
                                            >
                                                Garder l'Abonnement
                                            </Button>
                                            <Button
                                                className="flex-1 bg-red-600 hover:bg-red-700"
                                                onClick={handleCancelSubscription}
                                            >
                                                Confirmer l'Annulation
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}