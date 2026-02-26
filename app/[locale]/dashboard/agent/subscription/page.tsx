'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, CreditCard, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { subscriptionService, type AgentSubscription, type SubscriptionPlan } from '@/services/subscriptionService';

export default function AgentSubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [current, setCurrent] = useState<AgentSubscription | null>(null);
  const [canManageListings, setCanManageListings] = useState(false);
  const [restrictionMessage, setRestrictionMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<AgentSubscription[]>([]);

  const [loading, setLoading] = useState(true);
  const [subscribingPlanId, setSubscribingPlanId] = useState<number | null>(null);
  const [paymentChannel, setPaymentChannel] = useState('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, currentRes, historyRes] = await Promise.all([
        subscriptionService.getPublicPlans(),
        subscriptionService.getCurrentAgentSubscription(),
        subscriptionService.getAgentSubscriptionHistory({ per_page: 20 }),
      ]);

      setPlans(plansRes.data || []);
      setCurrent(currentRes.data.subscription);
      setCanManageListings(currentRes.data.can_manage_listings);
      setRestrictionMessage(currentRes.data.restriction_message);
      setHistory(historyRes.data?.data || []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount: number, currency = 'XAF') =>
    new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const statusClass = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trialing': return 'bg-blue-100 text-blue-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const currentPlanId = current?.subscription_plan_id;

  const sortedPlans = useMemo(() => [...plans].sort((a, b) => Number(a.price) - Number(b.price)), [plans]);

  const startSubscribe = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setConfirmDialogOpen(true);
  };

  const confirmSubscribe = async () => {
    if (!selectedPlan) return;

    setSubscribingPlanId(selectedPlan.id);
    try {
      const response = await subscriptionService.subscribe({
        plan_id: selectedPlan.id,
        payment_channel: paymentChannel,
        phone_number: phoneNumber || undefined,
      });
      toast.success(response?.message || 'Subscription updated successfully');
      setConfirmDialogOpen(false);
      setSelectedPlan(null);
      setPhoneNumber('');
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Subscription payment failed');
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const cancelSubscription = async () => {
    try {
      await subscriptionService.cancelCurrent();
      toast.success('Subscription cancelled');
      loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to cancel subscription');
    }
  };

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Subscription</h1>
            <p className="text-gray-600 mt-1">Choose a plan, manage renewals, and keep your listing privileges active.</p>
          </div>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-gray-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
            ) : current ? (
              <>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{current.plan?.name || 'Plan'}</h3>
                  <Badge className={statusClass(current.status)}>{current.status}</Badge>
                </div>
                <p className="text-gray-600">
                  {formatCurrency(current.price_paid, current.currency)}
                  {current.plan?.billing_period ? ` / ${current.plan.billing_period}` : ''}
                </p>
                <p className="text-sm text-gray-500">
                  Starts: {current.starts_at ? new Date(current.starts_at).toLocaleDateString() : '-'}
                  {' | '}
                  Ends: {current.ends_at ? new Date(current.ends_at).toLocaleDateString() : 'N/A'}
                </p>
                {current.trial_ends_at && (
                  <p className="text-sm text-blue-700">Trial ends: {new Date(current.trial_ends_at).toLocaleDateString()}</p>
                )}
                <Button variant="outline" className="text-red-600" onClick={cancelSubscription}>Cancel Subscription</Button>
              </>
            ) : (
              <p className="text-gray-600">No active subscription yet.</p>
            )}

            <div className={`mt-2 p-3 rounded-md text-sm ${canManageListings ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
              {canManageListings
                ? 'You can create and manage listings.'
                : restrictionMessage || 'Listing creation is currently restricted.'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {sortedPlans.map((plan) => {
              const isCurrent = currentPlanId === plan.id && ['active', 'trialing', 'past_due'].includes(current?.status || '');
              return (
                <div key={plan.id} className={`border rounded-lg p-4 ${isCurrent ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    {isCurrent && <Badge className="bg-blue-100 text-blue-800">Current</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  <p className="text-xl font-bold mt-3">{formatCurrency(plan.price, plan.currency)}</p>
                  <p className="text-sm text-gray-500">{plan.billing_period} billing</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Trial: {plan.free_trial_days} day(s) | Properties: {plan.property_limit ?? 'Unlimited'} | Featured: {plan.featured_limit ?? 'Unlimited'}
                  </p>
                  <div className="mt-4">
                    <Button
                      disabled={subscribingPlanId !== null || isCurrent}
                      onClick={() => startSubscribe(plan)}
                      className="w-full"
                    >
                      {subscribingPlanId === plan.id ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                      ) : isCurrent ? (
                        'Current Plan'
                      ) : (
                        <><CreditCard className="w-4 h-4 mr-2" />Choose Plan</>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.length === 0 ? (
              <p className="text-gray-500">No subscription history yet.</p>
            ) : history.map((item) => (
              <div key={item.id} className="border rounded-md p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="font-medium">{item.plan?.name || 'Plan'} - {formatCurrency(item.price_paid, item.currency)}</p>
                  <p className="text-xs text-gray-500">{item.starts_at ? new Date(item.starts_at).toLocaleDateString() : '-'} to {item.ends_at ? new Date(item.ends_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <Badge className={statusClass(item.status)}>{item.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Subscription</DialogTitle>
              <DialogDescription>
                {selectedPlan ? `Subscribe to ${selectedPlan.name} for ${formatCurrency(selectedPlan.price, selectedPlan.currency)}.` : 'Choose plan'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Payment Channel</Label>
                <Input value={paymentChannel} onChange={(e) => setPaymentChannel(e.target.value)} placeholder="MTN / Orange" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number (optional)</Label>
                <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+2376xxxxxxxx" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
                <Button onClick={confirmSubscribe} disabled={!selectedPlan || subscribingPlanId !== null}>
                  {subscribingPlanId !== null ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Confirm
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
