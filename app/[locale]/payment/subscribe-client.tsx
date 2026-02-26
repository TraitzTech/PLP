'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { subscriptionService, type SubscriptionPlan } from '@/services/subscriptionService';

export function SubscribeClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedPlanSlug = searchParams?.get('plan') || '';

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  const [paymentChannel, setPaymentChannel] = useState('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [planId, setPlanId] = useState<number | null>(null);

  // Get locale from pathname
  const locale = pathname?.split('/').filter(Boolean)[0] || 'en';

  useEffect(() => {
    const bootstrap = async () => {
      setLoadingPlans(true);
      try {
        const [plansRes, authed, user] = await Promise.all([
          subscriptionService.getPublicPlans(),
          authService.isAuthenticated(),
          authService.getCurrentUser(),
        ]);

        const loadedPlans = plansRes.data || [];
        setPlans(loadedPlans);
        setIsAuthenticated(authed);
        setIsAgent((user as any)?.user_type === 'agent');

        // If not authenticated, redirect to agent signin
        if (!authed) {
          setTimeout(() => {
            router.push(`/${locale}/auth/signin?type=agent&redirect=${encodeURIComponent(`/${locale}/payment/subscribe`)}`);
          }, 500);
          return;
        }

        // If authenticated but not an agent, show error message
        if (authed && (user as any)?.user_type !== 'agent') {
          toast.error('Only agents can subscribe to plans. Please sign in with your agent account.');
          setTimeout(() => {
            router.push(`/${locale}/auth/signin?type=agent&redirect=${encodeURIComponent(`/${locale}/payment/subscribe`)}`);
          }, 2000);
          return;
        }

        if (loadedPlans.length > 0) {
          const selected = loadedPlans.find((p) => p.slug === selectedPlanSlug || p.name.toLowerCase() === selectedPlanSlug.toLowerCase());
          setPlanId(selected?.id || loadedPlans[0].id);
        }
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load plans');
      } finally {
        setLoadingPlans(false);
        setAuthCheckComplete(true);
      }
    };

    bootstrap();
  }, [selectedPlanSlug, router, locale]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === planId) || null,
    [plans, planId]
  );

  const formatCurrency = (amount: number, currency = 'XAF') =>
    new Intl.NumberFormat('fr-CM', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) {
      toast.error('Select a plan first');
      return;
    }

    if (!isAuthenticated || !isAgent) {
      toast.error('You must be signed in as an agent to subscribe');
      router.push(`/${locale}/auth/signin?type=agent&redirect=${encodeURIComponent(`/${locale}/payment/subscribe`)}`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await subscriptionService.subscribe({
        plan_id: selectedPlan.id,
        payment_channel: paymentChannel,
        phone_number: phoneNumber || undefined,
      });

      toast.success(response?.message || 'Subscription updated');
      router.push('/dashboard/agent/subscription');
    } catch (error: any) {
      toast.error(error?.message || 'Subscription payment failed');
      router.push('/payment/failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (!authCheckComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Verifying your agent account...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Authentication Required</h3>
                <p className="text-sm text-gray-600 mb-4">
                  You must be signed in as an agent to subscribe to a plan. Please sign in to continue.
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => router.push(`/${locale}/auth/signin?type=agent&redirect=${encodeURIComponent(`/${locale}/payment/subscribe`)}`)}
                >
                  Sign In as Agent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if authenticated but not an agent
  if (!isAgent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Agent Account Required</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Only agent accounts can subscribe to plans. Please sign in with your agent account.
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => router.push(`/${locale}/auth/signin?type=agent&redirect=${encodeURIComponent(`/${locale}/payment/subscribe`)}`)}
                >
                  Sign In as Agent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/pricing">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to pricing
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Complete Agent Subscription</h1>
        </div>

        {loadingPlans ? (
          <Card><CardContent className="p-6 flex items-center gap-2 text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading plans...</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label>Plan</Label>
                    <Select value={String(planId || '')} onValueChange={(value) => setPlanId(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={String(plan.id)}>
                            {plan.name} - {formatCurrency(plan.price, plan.currency)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Channel</Label>
                    <Input value={paymentChannel} onChange={(e) => setPaymentChannel(e.target.value)} placeholder="MTN / Orange / Bank" />
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number (optional)</Label>
                    <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+2376xxxxxxxx" />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting || !selectedPlan}>
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                    {submitting ? 'Processing...' : `Pay ${selectedPlan ? formatCurrency(selectedPlan.price, selectedPlan.currency) : ''}`}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><span className="text-gray-500">Plan:</span> <span className="font-medium">{selectedPlan?.name || '-'}</span></p>
                <p><span className="text-gray-500">Price:</span> <span className="font-medium">{selectedPlan ? formatCurrency(selectedPlan.price, selectedPlan.currency) : '-'}</span></p>
                <p><span className="text-gray-500">Trial:</span> <span className="font-medium">{selectedPlan?.free_trial_days || 0} day(s)</span></p>
                <p><span className="text-gray-500">Property limit:</span> <span className="font-medium">{selectedPlan?.property_limit ?? 'Unlimited'}</span></p>
                <p><span className="text-gray-500">Featured limit:</span> <span className="font-medium">{selectedPlan?.featured_limit ?? 'Unlimited'}</span></p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
