'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, Calendar, Star, Award, MessageSquare, CreditCard as Edit, Camera, Phone, Mail, Globe, DollarSign, Clock, Building2, Users } from 'lucide-react';

// Mock agent profile data
const agentProfile = {
  id: 'agent-001',
  firstName: 'Pierre',
  lastName: 'Mballa',
  email: 'pierre.mballa@propertyagent.cm',
  phone: '+237 6XX XXX XXX',
  avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
  bio: 'Agent immobilier professionnel avec plus de 8 ans d\'expérience dans le marché camerounais. Spécialisé dans les propriétés de luxe à Yaoundé et Douala.',
  location: 'Yaoundé, Cameroun',
  joinedDate: '2020-03-15',
  verified: true,
  licenseNumber: 'AGENT-CM-2020-1547',
  company: 'Mballa Properties & Associates',
  stats: {
    totalProperties: 12,
    totalBookings: 156,
    totalRevenue: 85000000, // XAF
    totalCommission: 12750000, // 15% commission
    totalClients: 45,
    averageRating: 4.8,
    completedDeals: 142,
    responseTime: 12, // minutes
  },
  badges: [
    { id: 1, name: 'Agent Vérifié', icon: '✓', color: 'bg-green-100 text-green-800' },
    { id: 2, name: 'Top Performer', icon: '🏆', color: 'bg-yellow-100 text-yellow-800' },
    { id: 3, name: 'Expert Luxe', icon: '💎', color: 'bg-purple-100 text-purple-800' },
    { id: 4, name: 'Service Client Excellence', icon: '⭐', color: 'bg-blue-100 text-blue-800' },
  ],
  specializations: [
    'Propriétés de Luxe',
    'Villas Résidentielles',
    'Appartements Modernes',
    'Investissement Immobilier',
    'Location Courte Durée'
  ],
  languages: ['Français', 'Anglais', 'Ewondo'],
  certifications: [
    {
      name: 'Certification Agent Immobilier Cameroun',
      issuer: 'Ministère de l\'Habitat',
      date: '2020-03-15',
      valid: true,
    },
    {
      name: 'Formation Gestion Hôtelière',
      issuer: 'Institut Supérieur de Commerce',
      date: '2019-11-20',
      valid: true,
    },
  ],
};

// Mock recent activities
const recentActivities = [
  {
    id: '1',
    type: 'property_added',
    message: 'Nouvelle propriété ajoutée: Villa Moderne Bastos',
    date: '2024-02-15',
    icon: Building2,
  },
  {
    id: '2',
    type: 'booking_confirmed',
    message: 'Réservation confirmée pour Marie Dubois',
    date: '2024-02-14',
    icon: Calendar,
  },
  {
    id: '3',
    type: 'client_review',
    message: 'Nouvel avis 5 étoiles de Jean-Paul Kamga',
    date: '2024-02-13',
    icon: Star,
  },
  {
    id: '4',
    type: 'commission_earned',
    message: 'Commission de 360,000 XAF reçue',
    date: '2024-02-12',
    icon: DollarSign,
  },
];

// Mock client testimonials
const clientTestimonials = [
  {
    id: '1',
    client: 'Marie Dubois',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    rating: 5,
    comment: 'Service exceptionnel! Pierre a trouvé exactement ce que je cherchais. Très professionnel et réactif.',
    date: '2024-02-10',
    property: 'Villa Bastos',
  },
  {
    id: '2',
    client: 'Jean-Paul Kamga',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    rating: 5,
    comment: 'Excellent agent! Communication parfaite et propriétés de qualité. Je recommande vivement.',
    date: '2024-02-08',
    property: 'Appartement Bonanjo',
  },
  {
    id: '3',
    client: 'Fatima Nkomo',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    rating: 4,
    comment: 'Très satisfaite de mon séjour. Pierre est disponible et à l\'écoute de ses clients.',
    date: '2024-02-05',
    property: 'Suite Executive Akwa',
  },
];

export default function AgentProfilePage() {
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

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={agentProfile.avatar} />
                  <AvatarFallback className="text-2xl">
                    {agentProfile.firstName[0]}{agentProfile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {agentProfile.firstName} {agentProfile.lastName}
                  </h1>
                  {agentProfile.verified && (
                    <Badge className="bg-green-100 text-green-800">
                      <Award className="w-3 h-3 mr-1" />
                      Agent Vérifié
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-1" />
                    {agentProfile.company}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {agentProfile.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Agent depuis {formatDate(agentProfile.joinedDate)}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                    {agentProfile.stats.averageRating} ({agentProfile.stats.totalClients} clients)
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 max-w-2xl">{agentProfile.bio}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {agentProfile.badges.map((badge) => (
                    <Badge key={badge.id} className={badge.color}>
                      <span className="mr-1">{badge.icon}</span>
                      {badge.name}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <Button className="btn-primary">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier le Profil
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Paramètres de Contact
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="lg:col-span-2">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-plp-purple">{agentProfile.stats.totalProperties}</div>
              <div className="text-sm text-gray-600">Propriétés Gérées</div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-plp-pink">{agentProfile.stats.totalBookings}</div>
              <div className="text-sm text-gray-600">Réservations Totales</div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-plp-yellow">
                {formatCurrency(agentProfile.stats.totalCommission)}
              </div>
              <div className="text-sm text-gray-600">Commissions (XAF)</div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{agentProfile.stats.averageRating}</div>
              <div className="text-sm text-gray-600">Note Moyenne</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="specializations">Spécialisations</TabsTrigger>
            <TabsTrigger value="testimonials">Témoignages</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activités Récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="p-2 bg-plp-purple/10 rounded-full">
                            <Icon className="w-4 h-4 text-plp-purple" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(activity.date)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistiques de Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taux de Conversion</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Temps de Réponse</span>
                      <span className="font-semibold text-plp-purple">{agentProfile.stats.responseTime} min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Deals Complétés</span>
                      <span className="font-semibold text-plp-pink">{agentProfile.stats.completedDeals}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Revenus Générés</span>
                      <span className="font-semibold text-plp-yellow">
                        {formatCurrency(agentProfile.stats.totalRevenue)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Specializations */}
          <TabsContent value="specializations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Domaines d'Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agentProfile.specializations.map((spec, index) => (
                    <div key={index} className="p-4 border rounded-lg text-center">
                      <Building2 className="w-8 h-8 text-plp-purple mx-auto mb-2" />
                      <h3 className="font-medium text-gray-900">{spec}</h3>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Langues Parlées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {agentProfile.languages.map((language, index) => (
                    <Badge key={index} variant="outline" className="text-plp-purple border-plp-purple">
                      <Globe className="w-3 h-3 mr-1" />
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials */}
          <TabsContent value="testimonials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Témoignages Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {clientTestimonials.map((testimonial) => (
                    <div key={testimonial.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={testimonial.avatar} />
                          <AvatarFallback>
                            {testimonial.client.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{testimonial.client}</h3>
                              <p className="text-sm text-gray-600">{testimonial.property}</p>
                            </div>
                            <div className="flex items-center">
                              {Array.from({ length: testimonial.rating }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">{testimonial.comment}</p>
                          <p className="text-sm text-gray-500">{formatDate(testimonial.date)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certifications */}
          <TabsContent value="certifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Certifications Professionnelles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agentProfile.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Award className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                          <p className="text-sm text-gray-600">{cert.issuer}</p>
                          <p className="text-xs text-gray-500">Obtenu le {formatDate(cert.date)}</p>
                        </div>
                      </div>
                      <Badge className={cert.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {cert.valid ? 'Valide' : 'Expiré'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Licence Professionnelle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Licence Agent Immobilier</h3>
                      <p className="text-sm text-gray-600">Numéro: {agentProfile.licenseNumber}</p>
                      <p className="text-xs text-gray-500">Valide et à jour</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations de Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{agentProfile.email}</div>
                    <div className="text-sm text-gray-500">Email professionnel</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{agentProfile.phone}</div>
                    <div className="text-sm text-gray-500">Téléphone mobile</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{agentProfile.location}</div>
                    <div className="text-sm text-gray-500">Localisation actuelle</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{agentProfile.company}</div>
                    <div className="text-sm text-gray-500">Entreprise</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">Lun-Ven: 8h-18h, Sam: 9h-15h</div>
                    <div className="text-sm text-gray-500">Heures de disponibilité</div>
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