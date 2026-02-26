'use client'

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Award, MessageSquare, CreditCard as Edit, Phone, Mail, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { profileService } from '@/services/profileService';
import { dashboardService } from '@/services/dashboardService';
import { listingService } from '@/services/listingService';
import { activityService } from '@/services/activityService';
import { agentBookingService } from '@/services/bookingService';
import type { ProfileData } from '@/services/profileService';
import type { DashboardStats, Listing } from '@/services/types';

export default function AgentProfilePage() {
  type AgentStats = Partial<DashboardStats & { pendingBookings?: number; confirmedBookings?: number; activeListings?: number; totalBookings?: number; monthlyRevenue?: number }>;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [profileData, statsRes, listingsRes, bookingsRes, activitiesRes] = await Promise.all([
          profileService.getProfile(),
          dashboardService.getStats('agent'),
          listingService.getAllListings({ per_page: 6 }),
          agentBookingService.getBookings({ per_page: 5 }),
          activityService.getAllActivities({ per_page: 5 }),
        ]);

        setProfile(profileData);
        setStats(statsRes.data);
        setListings(listingsRes.data || []);
        setBookings(bookingsRes.data?.data || bookingsRes.data || []);
        setActivities(activitiesRes.data?.data || []);
      } catch (error) {
        console.error('Failed to load agent profile data', error);
        toast.error('Failed to load agent profile');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const formatCurrency = (amount?: number | null) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const initials = (profile?.name || 'Agent')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (loading && !profile) {
    return (
      <DashboardLayout userType="agent">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center text-sm text-gray-500">Chargement du profil...</CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-8">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile?.avatar || undefined} />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile?.name || 'Agent'}
                  </h1>
                  <Badge className="bg-green-100 text-green-800">
                    <Award className="w-3 h-3 mr-1" />
                    Agent Vérifié
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  {profile?.company && (
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-1" />
                      {profile.company}
                    </div>
                  )}
                  {profile?.gender && (
                    <div className="flex items-center capitalize">
                      {profile.gender}
                    </div>
                  )}
                  {profile?.created_at && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Agent depuis {formatDate(profile.created_at)}
                    </div>
                  )}
                </div>
                
                {profile?.bio && (
                  <p className="text-gray-700 mb-4 max-w-2xl">{profile.bio}</p>
                )}
                
                <div className="flex gap-3">
                  <Button className="btn-primary" onClick={() => toast.info('Edit profile from Settings')}>
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier le Profil
                  </Button>
                  <Button variant="outline" onClick={() => toast.info('Manage contact info in Settings')}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Paramètres de Contact
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-plp-purple">{stats?.totalProperties ?? 0}</div>
              <div className="text-sm text-gray-600">Propriétés Gérées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-plp-pink">{stats?.totalBookings ?? 0}</div>
              <div className="text-sm text-gray-600">Réservations Totales</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-plp-yellow">{formatCurrency(stats?.monthlyRevenue)}</div>
              <div className="text-sm text-gray-600">Revenus du mois</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.pendingBookings ?? 0}</div>
              <div className="text-sm text-gray-600">Réservations en attente</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.confirmedBookings ?? 0}</div>
              <div className="text-sm text-gray-600">Confirmées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{stats?.activeListings ?? 0}</div>
              <div className="text-sm text-gray-600">Annonces actives</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="listings">Annonces</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activités Récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucune activité récente</p>
                  ) : (
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="p-2 bg-plp-purple/10 rounded-full">
                            <Building2 className="w-4 h-4 text-plp-purple" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(activity.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Réservations Récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucune réservation pour le moment</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900">{booking.listing?.title ?? 'Réservation'}</p>
                            <p className="text-xs text-gray-500">{booking.check_in_date} → {booking.check_out_date}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">{booking.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="listings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vos annonces</CardTitle>
              </CardHeader>
              <CardContent>
                {listings.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucune annonce pour l'instant</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {listings.map((listing) => (
                      <div key={listing.id} className="p-3 border rounded-lg">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{listing.title}</h3>
                        <p className="text-xs text-gray-600 mb-1">{listing.city || listing.address || ''}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-plp-purple">{formatCurrency(Number(listing.price))}</span>
                          <Badge variant={listing.is_approved ? 'default' : 'secondary'} className="text-xs">
                            {listing.is_approved ? 'Active' : 'En attente'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations de Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{profile?.email ?? 'Non renseigné'}</div>
                    <div className="text-sm text-gray-500">Email professionnel</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{profile?.phone ?? 'Non renseigné'}</div>
                    <div className="text-sm text-gray-500">Téléphone mobile</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{profile?.company ?? 'Entreprise non définie'}</div>
                    <div className="text-sm text-gray-500">Entreprise / localisation</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}