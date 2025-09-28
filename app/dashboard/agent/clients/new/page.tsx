'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Star } from 'lucide-react';
import { toast } from 'sonner';

const propertyPreferences = [
  'Villa de Luxe',
  'Appartement Moderne',
  'Suite Executive',
  'Maison Familiale',
  'Studio',
  'Propriété avec Piscine',
  'Vue sur Mer',
  'Centre Ville',
];

export default function AddClientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    status: 'active',
    preferredProperties: [] as string[],
    budget: '',
    notes: '',
    sendWelcomeEmail: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Client ajouté avec succès!');
      router.push('/dashboard/agent/clients');
    }, 1500);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceToggle = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      preferredProperties: prev.preferredProperties.includes(preference)
        ? prev.preferredProperties.filter(p => p !== preference)
        : [...prev.preferredProperties, preference]
    }));
  };

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux Clients
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ajouter un Nouveau Client</h1>
            <p className="text-gray-600 mt-2">Créer un profil client pour un meilleur suivi.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations de Base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                      placeholder="+237 6XX XXX XXX"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localisation</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="pl-10"
                    placeholder="Ville, Région"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Description</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Informations sur le client..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Préférences Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (XAF par nuit)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="500000"
                />
              </div>

              <div>
                <Label>Types de Propriétés Préférées</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {propertyPreferences.map((preference) => (
                    <div key={preference} className="flex items-center space-x-2">
                      <Checkbox
                        id={preference}
                        checked={formData.preferredProperties.includes(preference)}
                        onCheckedChange={() => handlePreferenceToggle(preference)}
                      />
                      <Label htmlFor={preference} className="text-sm">{preference}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes Personnelles</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notes sur les préférences du client, demandes spéciales, etc..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" className="btn-primary" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Ajout en cours...' : 'Ajouter le Client'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}