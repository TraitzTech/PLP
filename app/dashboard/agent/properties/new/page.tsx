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
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Upload, X, MapPin, Chrome as Home, DollarSign, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Informations de Base', description: 'Détails principaux de la propriété' },
  { id: 2, title: 'Localisation', description: 'Adresse et emplacement' },
  { id: 3, title: 'Détails', description: 'Chambres, équipements et services' },
  { id: 4, title: 'Prix et Disponibilité', description: 'Tarification et calendrier' },
  { id: 5, title: 'Photos', description: 'Images de la propriété' },
  { id: 6, title: 'Révision', description: 'Vérification finale' },
];

const amenitiesList = [
  'WiFi Gratuit', 'Climatisation', 'Piscine', 'Parking', 'Cuisine Équipée',
  'Salle de Sport', 'Spa', 'Restaurant', 'Service de Chambre', 'Blanchisserie',
  'Sécurité 24h/24', 'Jardin', 'Terrasse', 'Balcon', 'Vue sur Mer'
];

export default function AddPropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    type: '',
    category: '',
    
    // Location
    address: '',
    city: '',
    region: '',
    country: 'Cameroun',
    zipCode: '',
    latitude: '',
    longitude: '',
    
    // Details
    bedrooms: '',
    bathrooms: '',
    maxGuests: '',
    area: '',
    amenities: [] as string[],
    
    // Pricing
    basePrice: '',
    currency: 'XAF',
    priceUnit: 'night',
    cleaningFee: '',
    securityDeposit: '',
    
    // Photos
    photos: [] as string[],
    
    // Additional
    houseRules: '',
    checkInTime: '15:00',
    checkOutTime: '11:00',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast.success('Propriété ajoutée avec succès! En attente d\'approbation.');
    router.push('/dashboard/agent/properties');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Titre de la Propriété *</Label>
              <Input
                id="title"
                placeholder="ex: Villa Luxueuse avec Vue sur Mer"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre propriété en détail..."
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type de Propriété *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  {mounted && (
                    <SelectContent>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="apartment">Appartement</SelectItem>
                      <SelectItem value="house">Maison</SelectItem>
                      <SelectItem value="suite">Suite</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                    </SelectContent>
                  )}
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category">Catégorie *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la catégorie" />
                  </SelectTrigger>
                  {mounted && (
                    <SelectContent>
                      <SelectItem value="luxury">Luxe</SelectItem>
                      <SelectItem value="business">Affaires</SelectItem>
                      <SelectItem value="family">Familial</SelectItem>
                      <SelectItem value="budget">Économique</SelectItem>
                    </SelectContent>
                  )}
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="address">Adresse Complète *</Label>
              <Input
                id="address"
                placeholder="123 Rue de la Paix"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ville *</Label>
                <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la ville" />
                  </SelectTrigger>
                  {mounted && (
                    <SelectContent>
                      <SelectItem value="yaounde">Yaoundé</SelectItem>
                      <SelectItem value="douala">Douala</SelectItem>
                      <SelectItem value="bamenda">Bamenda</SelectItem>
                      <SelectItem value="bafoussam">Bafoussam</SelectItem>
                      <SelectItem value="garoua">Garoua</SelectItem>
                    </SelectContent>
                  )}
                </Select>
              </div>
              
              <div>
                <Label htmlFor="region">Région *</Label>
                <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la région" />
                  </SelectTrigger>
                  {mounted && (
                    <SelectContent>
                      <SelectItem value="centre">Centre</SelectItem>
                      <SelectItem value="littoral">Littoral</SelectItem>
                      <SelectItem value="ouest">Ouest</SelectItem>
                      <SelectItem value="nord-ouest">Nord-Ouest</SelectItem>
                      <SelectItem value="nord">Nord</SelectItem>
                    </SelectContent>
                  )}
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="zipCode">Code Postal</Label>
              <Input
                id="zipCode"
                placeholder="00000"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedrooms">Chambres *</Label>
                <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange('bedrooms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="0" />
                  </SelectTrigger>
                  {mounted && (
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  )}
                </Select>
              </div>
              
              <div>
                <Label htmlFor="bathrooms">Salles de Bain *</Label>
                <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange('bathrooms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="0" />
                  </SelectTrigger>
                  {mounted && (
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  )}
                </Select>
              </div>
              
              <div>
                <Label htmlFor="maxGuests">Invités Max *</Label>
                <Select value={formData.maxGuests} onValueChange={(value) => handleInputChange('maxGuests', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="1" />
                  </SelectTrigger>
                  {mounted && (
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  )}
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="area">Superficie (m²)</Label>
              <Input
                id="area"
                type="number"
                placeholder="120"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
              />
            </div>
            
            <div>
              <Label>Équipements et Services</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {amenitiesList.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={() => handleAmenityToggle(amenity)}
                    />
                    <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">Prix de Base *</Label>
                <div className="relative">
                  <Input
                    id="basePrice"
                    type="number"
                    placeholder="150000"
                    value={formData.basePrice}
                    onChange={(e) => handleInputChange('basePrice', e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    XAF
                  </span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="priceUnit">Unité de Prix *</Label>
                <Select value={formData.priceUnit} onValueChange={(value) => handleInputChange('priceUnit', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  {mounted && (
                    <SelectContent>
                      <SelectItem value="night">Par Nuit</SelectItem>
                      <SelectItem value="week">Par Semaine</SelectItem>
                      <SelectItem value="month">Par Mois</SelectItem>
                    </SelectContent>
                  )}
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cleaningFee">Frais de Ménage</Label>
                <div className="relative">
                  <Input
                    id="cleaningFee"
                    type="number"
                    placeholder="25000"
                    value={formData.cleaningFee}
                    onChange={(e) => handleInputChange('cleaningFee', e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    XAF
                  </span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="securityDeposit">Caution</Label>
                <div className="relative">
                  <Input
                    id="securityDeposit"
                    type="number"
                    placeholder="100000"
                    value={formData.securityDeposit}
                    onChange={(e) => handleInputChange('securityDeposit', e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    XAF
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkInTime">Heure d'Arrivée</Label>
                <Input
                  id="checkInTime"
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="checkOutTime">Heure de Départ</Label>
                <Input
                  id="checkOutTime"
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ajoutez des Photos de Votre Propriété
                </h3>
                <p className="text-gray-600 mb-4">
                  Téléchargez au moins 5 photos de haute qualité
                </p>
                <Button className="btn-primary">
                  <Upload className="w-4 h-4 mr-2" />
                  Télécharger des Photos
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="houseRules">Règles de la Maison</Label>
              <Textarea
                id="houseRules"
                placeholder="ex: Pas de fête, pas d'animaux, pas de fumée..."
                rows={4}
                value={formData.houseRules}
                onChange={(e) => handleInputChange('houseRules', e.target.value)}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Révision Finale
              </h3>
              <p className="text-green-700">
                Vérifiez toutes les informations avant de soumettre votre propriété pour approbation.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Informations de Base</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Titre:</span> {formData.title}</p>
                  <p><span className="text-gray-600">Type:</span> {formData.type}</p>
                  <p><span className="text-gray-600">Catégorie:</span> {formData.category}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Localisation</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Ville:</span> {formData.city}</p>
                  <p><span className="text-gray-600">Région:</span> {formData.region}</p>
                  <p><span className="text-gray-600">Adresse:</span> {formData.address}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Détails</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Chambres:</span> {formData.bedrooms}</p>
                  <p><span className="text-gray-600">Salles de bain:</span> {formData.bathrooms}</p>
                  <p><span className="text-gray-600">Invités max:</span> {formData.maxGuests}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Prix</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-600">Prix de base:</span> {formData.basePrice} XAF/{formData.priceUnit}</p>
                  <p><span className="text-gray-600">Frais de ménage:</span> {formData.cleaningFee} XAF</p>
                  <p><span className="text-gray-600">Caution:</span> {formData.securityDeposit} XAF</p>
                </div>
              </div>
            </div>
            
            {formData.amenities.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Équipements</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity) => (
                    <Badge key={amenity} variant="outline">{amenity}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ajouter une Nouvelle Propriété</h1>
            <p className="text-gray-600 mt-2">Étape {currentStep} sur {steps.length}</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-plp-purple border-plp-purple text-white' 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {step.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  currentStep > step.id ? 'bg-plp-purple' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <p className="text-gray-600">{steps[currentStep - 1].description}</p>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>
          
          {currentStep === steps.length ? (
            <Button onClick={handleSubmit} className="btn-primary">
              Soumettre pour Approbation
            </Button>
          ) : (
            <Button onClick={nextStep} className="btn-primary">
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}