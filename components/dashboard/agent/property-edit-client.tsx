"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Building2, MapPin, DollarSign, Upload, X } from "lucide-react";
import { toast } from "sonner";

export type AgentProperty = {
    id: string;
    title: string;
    description: string;
    address: string;
    city: string;
    region: string;
    country: string;
    zipCode?: string;
    type: "villa" | "apartment" | "house" | "suite" | "studio";
    category: "luxury" | "business" | "family" | "budget";
    bedrooms: number;
    bathrooms: number;
    area: number;
    maxGuests: number;
    basePrice: number;
    priceUnit: "night" | "week" | "month";
    cleaningFee?: number;
    securityDeposit?: number;
    checkInTime?: string;
    checkOutTime?: string;
    amenities: string[];
    houseRules?: string;
    images: string[];
    status: "active" | "inactive" | "pending";
    featured: boolean;
};

const amenitiesList = [
    "WiFi Gratuit",
    "Climatisation",
    "Piscine",
    "Parking",
    "Cuisine Équipée",
    "Salle de Sport",
    "Spa",
    "Restaurant",
    "Service de Chambre",
    "Blanchisserie",
    "Sécurité 24h/24",
    "Jardin",
    "Terrasse",
    "Balcon",
    "Vue sur Mer",
];

export function AgentPropertyEditClient({ initialData }: { initialData: AgentProperty }) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<AgentProperty>(initialData);

    useEffect(() => setMounted(true), []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast.success("Propriété mise à jour avec succès!");
            router.push("/dashboard/agent/properties");
        }, 1200);
    };

    const handleInputChange = <K extends keyof AgentProperty>(field: K, value: AgentProperty[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAmenityToggle = (amenity: string) => {
        setFormData((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity) ? prev.amenities.filter((a) => a !== amenity) : [...prev.amenities, amenity],
        }));
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", minimumFractionDigits: 0 }).format(amount);

    return (
        <DashboardLayout userType="agent">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour aux Propriétés
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Modifier la Propriété</h1>
                        <p className="text-gray-600 mt-2">Mettre à jour les informations de la propriété.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Property Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Photos de la Propriété</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {formData.images.map((image, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                                        <img src={image} alt={`Propriété ${index + 1}`} className="w-full h-full object-cover" />
                                        <Button type="button" variant="ghost" size="sm" className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-plp-purple transition-colors">
                                    <Button variant="ghost" type="button" className="flex-col gap-2">
                                        <Upload className="w-6 h-6 text-gray-400" />
                                        <span className="text-sm text-gray-500">Ajouter Photo</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="w-5 h-5" />
                                Informations de Base
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Titre de la Propriété *</Label>
                                <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} rows={4} required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type de Propriété *</Label>
                                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value as AgentProperty["type"])}>
                                        <SelectTrigger>
                                            <SelectValue />
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
                                <div className="space-y-2">
                                    <Label htmlFor="category">Catégorie *</Label>
                                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value as AgentProperty["category"])}>
                                        <SelectTrigger>
                                            <SelectValue />
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
                        </CardContent>
                    </Card>

                    {/* Location */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Localisation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="address">Adresse Complète *</Label>
                                <Input id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">Ville *</Label>
                                    <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                                        <SelectTrigger>
                                            <SelectValue />
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
                                <div className="space-y-2">
                                    <Label htmlFor="region">Région *</Label>
                                    <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
                                        <SelectTrigger>
                                            <SelectValue />
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
                                <div className="space-y-2">
                                    <Label htmlFor="zipCode">Code Postal</Label>
                                    <Input id="zipCode" value={formData.zipCode || ""} onChange={(e) => handleInputChange("zipCode", e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Property Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Détails de la Propriété</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bedrooms">Chambres</Label>
                                    <Input id="bedrooms" type="number" value={formData.bedrooms} onChange={(e) => handleInputChange("bedrooms", parseInt(e.target.value || "0", 10))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bathrooms">Salles de Bain</Label>
                                    <Input id="bathrooms" type="number" value={formData.bathrooms} onChange={(e) => handleInputChange("bathrooms", parseInt(e.target.value || "0", 10))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="area">Superficie (m²)</Label>
                                    <Input id="area" type="number" value={formData.area} onChange={(e) => handleInputChange("area", parseInt(e.target.value || "0", 10))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxGuests">Invités Max</Label>
                                    <Input id="maxGuests" type="number" value={formData.maxGuests} onChange={(e) => handleInputChange("maxGuests", parseInt(e.target.value || "0", 10))} />
                                </div>
                            </div>

                            <div>
                                <Label>Équipements et Services</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                                    {amenitiesList.map((amenity) => (
                                        <div key={amenity} className="flex items-center space-x-2">
                                            <Checkbox id={amenity} checked={formData.amenities.includes(amenity)} onCheckedChange={() => handleAmenityToggle(amenity)} />
                                            <Label htmlFor={amenity} className="text-sm">
                                                {amenity}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Tarification
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="basePrice">Prix de Base *</Label>
                                    <div className="relative">
                                        <Input id="basePrice" type="number" value={formData.basePrice} onChange={(e) => handleInputChange("basePrice", parseInt(e.target.value || "0", 10))} required />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">XAF</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Actuel: {formatCurrency(formData.basePrice)}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priceUnit">Unité de Prix</Label>
                                    <Select value={formData.priceUnit} onValueChange={(value) => handleInputChange("priceUnit", value as AgentProperty["priceUnit"])}>
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
                                <div className="space-y-2">
                                    <Label htmlFor="cleaningFee">Frais de Ménage</Label>
                                    <div className="relative">
                                        <Input id="cleaningFee" type="number" value={formData.cleaningFee ?? 0} onChange={(e) => handleInputChange("cleaningFee", parseInt(e.target.value || "0", 10))} />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">XAF</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="securityDeposit">Caution</Label>
                                    <div className="relative">
                                        <Input id="securityDeposit" type="number" value={formData.securityDeposit ?? 0} onChange={(e) => handleInputChange("securityDeposit", parseInt(e.target.value || "0", 10))} />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">XAF</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="checkInTime">Heure d'Arrivée</Label>
                                    <Input id="checkInTime" type="time" value={formData.checkInTime || ""} onChange={(e) => handleInputChange("checkInTime", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="checkOutTime">Heure de Départ</Label>
                                    <Input id="checkOutTime" type="time" value={formData.checkOutTime || ""} onChange={(e) => handleInputChange("checkOutTime", e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* House Rules */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Règles de la Maison</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="houseRules">Règles et Restrictions</Label>
                                <Textarea id="houseRules" value={formData.houseRules || ""} onChange={(e) => handleInputChange("houseRules", e.target.value)} placeholder="ex: Pas de fête, pas d'animaux, pas de fumée..." rows={4} />
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
                            {isLoading ? "Mise à jour..." : "Mettre à Jour"}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}