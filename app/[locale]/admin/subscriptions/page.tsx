'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { subscriptionService, type AgentSubscription, type SubscriptionPlan } from '@/services/subscriptionService';
import { Loader2, Plus, RefreshCw, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const initialForm = {
  id: null as number | null,
  name: '',
  plan_category: 'basic' as 'basic' | 'premium' | 'featured' | 'custom',
  target_audience: 'both' as 'agent' | 'landlord' | 'both',
  description: '',
  price: '0',
  billing_period: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
  billing_interval: '1',
  free_trial_days: '0',
  property_limit: '',
  featured_limit: '',
  virtual_tour_limit: '',
  benefits: '',
  is_active: true,
  sort_order: '0',
};

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<AgentSubscription[]>([]);
  const [stats, setStats] = useState<{ active_plans: number; total_subscribers: number; monthly_revenue: number; platform_fee_xaf: number } | null>(null);
  const [subscriptionStats, setSubscriptionStats] = useState<Record<string, number>>({});

  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await subscriptionService.getAdminPlans();
      setPlans(response.data || []);
      setStats(response.stats || null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load subscription plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const loadSubscriptions = async () => {
    setLoadingSubscriptions(true);
    try {
      const response = await subscriptionService.getAdminSubscriptions({ per_page: 100 });
      setSubscriptions(response.data?.data || []);
      setSubscriptionStats(response.stats || {});
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load subscriptions');
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  useEffect(() => {
    loadPlans();
    loadSubscriptions();
  }, []);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        sub.agent?.user?.name?.toLowerCase().includes(q) ||
        sub.agent?.user?.email?.toLowerCase().includes(q) ||
        sub.plan?.name?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, search, statusFilter]);

  const resetForm = () => setForm(initialForm);

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setForm({
      id: plan.id,
      name: plan.name,
      plan_category: plan.plan_category || 'basic',
      target_audience: plan.target_audience || 'both',
      description: plan.description || '',
      price: String(plan.price ?? 0),
      billing_period: plan.billing_period || 'monthly',
      billing_interval: String(plan.billing_interval ?? 1),
      free_trial_days: String(plan.free_trial_days ?? 0),
      property_limit: plan.property_limit === null ? '' : String(plan.property_limit),
      featured_limit: plan.featured_limit === null ? '' : String(plan.featured_limit),
      virtual_tour_limit: plan.virtual_tour_limit == null ? '' : String(plan.virtual_tour_limit),
      benefits: (plan.benefits || []).join(', '),
      is_active: plan.is_active,
      sort_order: String(plan.sort_order ?? 0),
    });
    setDialogOpen(true);
  };

  const savePlan = async () => {
    if (!form.name.trim()) {
      toast.error('Plan name is required');
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      plan_category: form.plan_category,
      target_audience: form.target_audience,
      description: form.description.trim() || null,
      price: Number(form.price),
      billing_period: form.billing_period,
      billing_interval: Number(form.billing_interval || 1),
      free_trial_days: Number(form.free_trial_days || 0),
      property_limit: form.property_limit === '' ? null : Number(form.property_limit),
      featured_limit: form.featured_limit === '' ? null : Number(form.featured_limit),
      virtual_tour_limit: form.virtual_tour_limit === '' ? null : Number(form.virtual_tour_limit),
      benefits: form.benefits
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      is_active: form.is_active,
      sort_order: Number(form.sort_order || 0),
      currency: 'XAF',
    };

    try {
      if (form.id) {
        await subscriptionService.updatePlan(form.id, payload);
        toast.success('Plan updated');
      } else {
        await subscriptionService.createPlan(payload);
        toast.success('Plan created');
      }
      setDialogOpen(false);
      resetForm();
      loadPlans();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);
    try {
      await subscriptionService.deletePlan(planToDelete.id);
      toast.success('Plan deleted/deactivated');
      setPlanToDelete(null);
      loadPlans();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete plan');
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePlanStatus = async (plan: SubscriptionPlan) => {
    try {
      const res = await subscriptionService.togglePlanStatus(plan.id);
      toast.success(res.message || 'Plan status toggled');
      loadPlans();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to toggle plan status');
    }
  };

  const updateSubscriptionStatus = async (subscription: AgentSubscription, status: AgentSubscription['status']) => {
    try {
      await subscriptionService.updateAdminSubscriptionStatus(subscription.id, { status });
      toast.success('Subscription status updated');
      loadSubscriptions();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update status');
    }
  };

  const formatCurrency = (amount: number, currency = 'XAF') =>
    new Intl.NumberFormat('fr-CM', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount || 0);

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trialing': return 'bg-blue-100 text-blue-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
            <p className="text-gray-600 mt-1">Manage agent plans, active subscriptions, and billing access.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { loadPlans(); loadSubscriptions(); }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary" onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>{form.id ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
                  <DialogDescription>
                    Configure pricing in XAF, limits, and optional free-trial period.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-1 -mr-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Name</Label>
                      <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="e.g. Premium Plan" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tier Category</Label>
                      <Select value={form.plan_category} onValueChange={(value: any) => setForm((prev) => ({ ...prev, plan_category: value }))}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="featured">Featured</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <Select value={form.target_audience} onValueChange={(value: any) => setForm((prev) => ({ ...prev, target_audience: value }))}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="both">Agents + Landlords</SelectItem>
                          <SelectItem value="agent">Agents only</SelectItem>
                          <SelectItem value="landlord">Landlords only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea rows={3} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Describe the plan benefits..." />
                    </div>

                    {/* Pricing section */}
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500 mb-3 border-b pb-1">Pricing & Billing</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Price (XAF)</Label>
                      <Input type="number" min="0" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Billing Period</Label>
                      <Select value={form.billing_period} onValueChange={(value: any) => setForm((prev) => ({ ...prev, billing_period: value }))}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Billing Interval</Label>
                      <Input type="number" min="1" value={form.billing_interval} onChange={(e) => setForm((prev) => ({ ...prev, billing_interval: e.target.value }))} placeholder="1" />
                    </div>
                    <div className="space-y-2">
                      <Label>Free Trial Days</Label>
                      <Input type="number" min="0" value={form.free_trial_days} onChange={(e) => setForm((prev) => ({ ...prev, free_trial_days: e.target.value }))} placeholder="0" />
                    </div>

                    {/* Limits section */}
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500 mb-3 border-b pb-1">Limits</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Property Limit</Label>
                      <Input type="number" min="0" value={form.property_limit} onChange={(e) => setForm((prev) => ({ ...prev, property_limit: e.target.value }))} placeholder="Unlimited" />
                    </div>
                    <div className="space-y-2">
                      <Label>Featured Limit</Label>
                      <Input type="number" min="0" value={form.featured_limit} onChange={(e) => setForm((prev) => ({ ...prev, featured_limit: e.target.value }))} placeholder="Unlimited" />
                    </div>
                    <div className="space-y-2">
                      <Label>Virtual Tour Limit</Label>
                      <Input type="number" min="0" value={form.virtual_tour_limit} onChange={(e) => setForm((prev) => ({ ...prev, virtual_tour_limit: e.target.value }))} placeholder="Unlimited" />
                    </div>

                    {/* Benefits section */}
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500 mb-3 border-b pb-1">Extras</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Benefits (comma separated)</Label>
                      <Input value={form.benefits} onChange={(e) => setForm((prev) => ({ ...prev, benefits: e.target.value }))} placeholder="Priority support, Analytics dashboard, ..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Sort Order</Label>
                      <Input type="number" min="0" value={form.sort_order} onChange={(e) => setForm((prev) => ({ ...prev, sort_order: e.target.value }))} placeholder="0" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={savePlan} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {form.id ? 'Update Plan' : 'Create Plan'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Active Plans</p><p className="text-2xl font-bold">{stats?.active_plans ?? 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Total Subscribers</p><p className="text-2xl font-bold">{stats?.total_subscribers ?? 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Monthly Revenue</p><p className="text-2xl font-bold">{formatCurrency(stats?.monthly_revenue ?? 0)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Platform Fee</p><p className="text-2xl font-bold">{formatCurrency(stats?.platform_fee_xaf ?? 1000)}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingPlans ? (
              <div className="flex items-center gap-2 text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading plans...</div>
            ) : plans.length === 0 ? (
              <p className="text-gray-500">No plans configured yet.</p>
            ) : plans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{plan.name}</h3>
                    <Badge className={plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 capitalize">
                      {plan.plan_category || 'basic'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                  <p className="text-sm mt-1">
                    {formatCurrency(plan.price, plan.currency)} / {plan.billing_period} | Trial: {plan.free_trial_days} days | Properties: {plan.property_limit ?? 'Unlimited'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    Audience: {plan.target_audience || 'both'} | Virtual tours: {plan.virtual_tour_limit ?? 'Unlimited'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Active subscribers: {plan.active_subscribers ?? 0} | Total: {plan.total_subscribers ?? 0}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePlanStatus(plan)}
                    title={plan.is_active ? 'Deactivate plan' : 'Activate plan'}
                  >
                    {plan.is_active ? (
                      <><ToggleRight className="w-4 h-4 mr-1 text-green-600" /> Visible</>
                    ) : (
                      <><ToggleLeft className="w-4 h-4 mr-1 text-gray-400" /> Hidden</>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => openEdit(plan)}>Edit</Button>
                  <Button variant="outline" className="text-red-600" onClick={() => setPlanToDelete(plan)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Search agent/plan" value={search} onChange={(e) => setSearch(e.target.value)} />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-500 flex items-center">Active: {subscriptionStats.active ?? 0}, Trialing: {subscriptionStats.trialing ?? 0}</div>
            </div>

            {loadingSubscriptions ? (
              <div className="flex items-center gap-2 text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading subscriptions...</div>
            ) : filteredSubscriptions.length === 0 ? (
              <p className="text-gray-500">No subscriptions found.</p>
            ) : filteredSubscriptions.map((sub) => (
              <div key={sub.id} className="border rounded-lg p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <p className="font-medium">{sub.agent?.user?.name || 'Unknown Agent'}</p>
                  <p className="text-sm text-gray-500">{sub.agent?.user?.email}</p>
                  <p className="text-sm mt-1">{sub.plan?.name} - {formatCurrency(sub.price_paid, sub.currency)}</p>
                  <p className="text-xs text-gray-500">Start: {sub.starts_at ? new Date(sub.starts_at).toLocaleDateString() : '-'} | End: {sub.ends_at ? new Date(sub.ends_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusBadgeClass(sub.status)}>{sub.status}</Badge>
                  <Select value={sub.status} onValueChange={(value: any) => updateSubscriptionStatus(sub, value)}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trialing">trialing</SelectItem>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="past_due">past_due</SelectItem>
                      <SelectItem value="cancelled">cancelled</SelectItem>
                      <SelectItem value="expired">expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={planToDelete !== null}
        onOpenChange={(open) => !open && setPlanToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the plan &ldquo;{planToDelete?.name}&rdquo;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlan}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
