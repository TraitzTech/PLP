'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Search, Filter, MessageSquare, Phone, Mail, Calendar, Eye } from 'lucide-react';
import agentDashboardService, { AgentClient, AgentClientsSummary } from '@/services/agentDashboardService';
import { useRouter } from 'next/navigation';

export default function AgentClientsPage() {
  const [clients, setClients] = useState<AgentClient[]>([]);
  const [summary, setSummary] = useState<AgentClientsSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<AgentClient | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await agentDashboardService.getClients({
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setClients(response.data.clients);
      setSummary(response.data.summary);
    } catch (err: any) {
      console.error('Failed to fetch clients:', err);
      setError(err?.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  const handleMessageClient = (client: AgentClient) => {
    router.push(`/dashboard/agent/messages?userId=${client.id}`);
  };

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Client Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your client relationships and booking history.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Total Clients</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? <Skeleton className="h-7 w-12" /> : summary?.total_clients ?? 0}
                  </p>
                </div>
                <Users className="w-7 h-7 md:w-8 md:h-8 text-plp-purple" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Active Clients</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? <Skeleton className="h-7 w-12" /> : summary?.active_clients ?? 0}
                  </p>
                </div>
                <Users className="w-7 h-7 md:w-8 md:h-8 text-plp-pink" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Client Revenue</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? <Skeleton className="h-7 w-20" /> : formatCurrency(summary?.total_revenue ?? 0)}
                  </p>
                </div>
                <Calendar className="w-7 h-7 md:w-8 md:h-8 text-plp-yellow" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Average Spend</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? <Skeleton className="h-7 w-20" /> : formatCurrency(summary?.average_spending ?? 0)}
                  </p>
                </div>
                <Calendar className="w-7 h-7 md:w-8 md:h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Clients List */}
        <Card>
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="w-12 h-12 md:w-16 md:h-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                <p>{error}</p>
                <Button variant="outline" className="mt-4" onClick={fetchClients}>
                  Retry
                </Button>
              </div>
            ) : clients.length === 0 ? (
              <div className="p-8 md:p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No clients found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search criteria.'
                    : 'You don\'t have any clients yet. Clients will appear here when users book your listings.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg">
                    <Avatar className="w-12 h-12 md:w-16 md:h-16">
                      <AvatarImage src={client.profile_image || undefined} />
                      <AvatarFallback>
                        {getInitials(client.first_name, client.last_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {client.first_name} {client.last_name}
                        </h3>
                        <Badge className={getStatusColor(client.status)}>
                          {client.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center text-gray-600 dark:text-gray-400 text-sm gap-x-3 gap-y-1 mb-1">
                        <span className="flex items-center">
                          <Mail className="w-3.5 h-3.5 mr-1 shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </span>
                        {client.phone && (
                          <span className="flex items-center">
                            <Phone className="w-3.5 h-3.5 mr-1 shrink-0" />
                            {client.phone}
                          </span>
                        )}
                      </div>
                      {client.last_booking_date && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          <Calendar className="w-3.5 h-3.5 mr-1 inline" />
                          Last booking: {formatDate(client.last_booking_date)}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="grid grid-cols-3 gap-3 text-sm text-center">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{client.total_bookings}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Bookings</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(client.total_spent)}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Spent</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{client.completed_bookings}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClient(client);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMessageClient(client)}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Client Profile</DialogTitle>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 md:w-20 md:h-20">
                    <AvatarImage src={selectedClient.profile_image || undefined} />
                    <AvatarFallback>
                      {getInitials(selectedClient.first_name, selectedClient.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedClient.first_name} {selectedClient.last_name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedClient.email}</p>
                    {selectedClient.phone && <p className="text-gray-600 dark:text-gray-400">{selectedClient.phone}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(selectedClient.status)}>
                        {selectedClient.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600 dark:text-gray-400">Member since:</span> {formatDate(selectedClient.joined_date)}</p>
                      <p><span className="text-gray-600 dark:text-gray-400">Last booking:</span> {formatDate(selectedClient.last_booking_date)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600 dark:text-gray-400">Total bookings:</span> {selectedClient.total_bookings}</p>
                      <p><span className="text-gray-600 dark:text-gray-400">Completed:</span> {selectedClient.completed_bookings}</p>
                      <p><span className="text-gray-600 dark:text-gray-400">Cancelled:</span> {selectedClient.cancelled_bookings}</p>
                      <p><span className="text-gray-600 dark:text-gray-400">Active:</span> {selectedClient.active_bookings}</p>
                      <p><span className="text-gray-600 dark:text-gray-400">Total spent:</span> {formatCurrency(selectedClient.total_spent)}</p>
                    </div>
                  </div>
                </div>

                {selectedClient.booked_listings.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Booked Properties</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedClient.booked_listings.map((listing) => (
                        <Badge key={listing} variant="outline">{listing}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button className="flex-1" onClick={() => {
                    setIsViewDialogOpen(false);
                    handleMessageClient(selectedClient);
                  }}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}