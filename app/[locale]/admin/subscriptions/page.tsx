'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Crown, Star, Building2, Search, Filter, Plus, CreditCard as Edit, Trash2, DollarSign, Users, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';

// Mock subscription plans data
const mockPlans = [
  {
    id: '1',
    name: 'Starter',
    description: 'Perfect for new agents getting started',
    price: 25000,
    period: 'month',
    propertiesLimit: 5,
    featuredSlots: 0,
    commissionRate: 15,
    features: ['Basic analytics', 'Email support', 'Mobile money payments'],
    active: true,
    subscribers: 45,
    revenue: 1125000,
  },
  {
    id: '2',
    name: 'Professional',
    description: 'Most popular for growing agents',
    price: 45000,
    period: 'month',
    propertiesLimit: 25,
    featuredSlots: 2,
    commissionRate: 12,
    features: ['Advanced analytics', 'Priority support', 'All payment methods', 'Marketing tools'],
    active: true,
    subscribers: 128,
    revenue: 5760000,
  },
  {
    id: '3',
    name: 'Enterprise',
    description: 'For established agencies',
    price: 75000,
    period: 'month',
    propertiesLimit: -1, // unlimited
    featuredSlots: -1, // unlimited
    commissionRate: 10,
    features: ['Premium analytics', 'Dedicated manager', 'API access', 'White-label options'],
    active: true,
    subscribers: 32,
    revenue: 2400000,
  },
];

// Mock subscriptions data
const mockSubscriptions = [
  {
    id: '1',
    agent: 'Pierre Mballa',
    agentId: 'agent-001',
    email: 'pierre.mballa@email.com',
    plan: 'Professional',
    planId: '2',
    status: 'active',
    startDate: '2024-01-15',
    nextBilling: '2024-03-15',
    amount: 45000,
    paymentMethod: 'Mobile Money (MTN)',
    propertiesUsed: 18,
    propertiesLimit: 25,
  },
  {
    id: '2',
    agent: 'Marie Fotso',
    agentId: 'agent-002',
    email: 'marie.fotso@email.com',
    plan: 'Enterprise',
    planId: '3',
    status: 'active',
    startDate: '2023-11-20',
    nextBilling: '2024-03-20',
    amount: 75000,
    paymentMethod: 'Bank Transfer',
    propertiesUsed: 45,
    propertiesLimit: -1,
  },
  {
    id: '3',
    agent: 'Jean Kamga',
    agentId: 'agent-003',
    email: 'jean.kamga@email.com',
    plan: 'Starter',
    planId: '1',
    status: 'cancelled',
    startDate: '2024-02-01',
    nextBilling: '2024-03-01',
    amount: 25000,
    paymentMethod: 'Mobile Money (Orange)',
    propertiesUsed: 3,
    propertiesLimit: 5,
  },
];

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState(mockPlans);
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isEditPlanDialogOpen, setIsEditPlanDialogOpen] = useState(false);
  const [isCreatePlanDialogOpen, setIsCreatePlanDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: '',
    propertiesLimit: '',
    featuredSlots: '',
    commissionRate: '',
    features: '',
  });

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.plan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCreatePlan = () => {
    const plan = {
      id: Date.now().toString(),
      name: newPlan.name,
      description: newPlan.description,
      price: parseInt(newPlan.price),
      period: 'month',
      propertiesLimit: parseInt(newPlan.propertiesLimit),
      featuredSlots: parseInt(newPlan.featuredSlots),
      commissionRate: parseInt(newPlan.commissionRate),
      features: newPlan.features.split(',').map(f => f.trim()),
      active: true,
      subscribers: 0,
      revenue: 0,
    };
    
    setPlans(prev => [...prev, plan]);
    setIsCreatePlanDialogOpen(false);
    setNewPlan({
      name: '',
      description: '',
      price: '',
      propertiesLimit: '',
      featuredSlots: '',
      commissionRate: '',
      features: '',
    });
    toast.success('Plan créé avec succès!');
  };

  const handleDeletePlan = (planId: string) => {
    setPlans(prev => prev.filter(p => p.id !== planId));
    toast.success('Plan supprimé avec succès!');
  };

  const totalRevenue = plans.reduce((sum, plan) => sum + plan.revenue, 0);
  const totalSubscribers = plans.reduce((sum, plan) => sum + plan.subscribers, 0);
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Abonnements</h1>
            <p className="text-gray-600 mt-2">Gérez les plans d'abonnement et les souscriptions des agents.</p>
          </div>
          
          <Dialog open={isCreatePlanDialogOpen} onOpenChange={setIsCreatePlanDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un Nouveau Plan</DialogTitle>
                <DialogDescription>Ajoutez un nouveau plan d'abonnement pour les agents.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="planName">Nom du Plan</Label>
                  <Input
                    id="planName"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex: Premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planDescription">Description</Label>
                  <Textarea
                    id="planDescription"
                    value={newPlan.description}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du plan..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="planPrice">Prix (XAF)</Label>
                    <Input
                      id="planPrice"
                      type="number"
                      value={newPlan.price}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commissionRate">Commission (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      value={newPlan.commissionRate}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, commissionRate: e.target.value }))}
                      placeholder="12"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="propertiesLimit">Limite Propriétés</Label>
                    <Input
                      id="propertiesLimit"
                      type="number"
                      value={newPlan.propertiesLimit}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, propertiesLimit: e.target.value }))}
                      placeholder="25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="featuredSlots">Slots Vedettes</Label>
                    <Input
                      id="featuredSlots"
                      type="number"
                      value={newPlan.featuredSlots}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, featuredSlots: e.target.value }))}
                      placeholder="2"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features">Fonctionnalités (séparées par virgule)</Label>
                  <Textarea
                    id="features"
                    value={newPlan.features}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, features: e.target.value }))}
                    placeholder="Analytics avancées, Support prioritaire, ..."
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 btn-primary" onClick={handleCreatePlan}>
                    Créer le Plan
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsCreatePlanDialogOpen(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-plp-purple" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Abonnés Totaux</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSubscribers}</p>
                </div>
                <Users className="w-8 h-8 text-plp-pink" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Abonnements Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{activeSubscriptions}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-plp-yellow" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Plans Disponibles</p>
                  <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
                </div>
                <Star className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Plans Management */}
        <Card>
          <CardHeader>
            <CardTitle>Plans d'Abonnement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-600 text-sm">{plan.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-2xl font-bold text-plp-purple mb-4">
                    {formatCurrency(plan.price)}
                    <span className="text-sm text-gray-600 font-normal">/{plan.period}</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Propriétés:</span>
                      <span className="font-medium">
                        {plan.propertiesLimit === -1 ? 'Illimitées' : plan.propertiesLimit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Commission:</span>
                      <span className="font-medium">{plan.commissionRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Abonnés:</span>
                      <span className="font-medium">{plan.subscribers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Revenus:</span>
                      <span className="font-medium">{formatCurrency(plan.revenue)}</span>
                    </div>
                  </div>
                  
                  <Badge className={plan.active ? getStatusColor('active') : getStatusColor('cancelled')}>
                    {plan.active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Abonnements Actifs</CardTitle>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSubscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{subscription.agent}</h3>
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{subscription.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Plan: {subscription.plan}</span>
                      <span>Propriétés: {subscription.propertiesUsed}/{subscription.propertiesLimit === -1 ? '∞' : subscription.propertiesLimit}</span>
                      <span>Prochaine facturation: {formatDate(subscription.nextBilling)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-plp-purple">
                      {formatCurrency(subscription.amount)}/mois
                    </div>
                    <p className="text-sm text-gray-600">{subscription.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}