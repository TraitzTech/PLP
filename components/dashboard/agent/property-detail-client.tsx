"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft,
    CreditCard as Edit,
    Trash2,
    Star,
    MapPin,
    Bed,
    Bath,
    Square,
    Users,
    Calendar,
    DollarSign,
    TrendingUp,
    Eye,
    MessageSquare,
    Award,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

type Booking = {
    id: string;
    client: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    status: "confirmed" | "completed" | "pending" | "cancelled";
    amount: number;
};

type Review = {
    id: number;
    client: string;
    avatar: string;
    rating: number;
    date: string;
    comment: string;
};

export type AgentPropertyDetails = {
    id: string;
    title: string;
    description: string;
    location: string;
    address: string;
    price: number;
    priceUnit: "night" | "week" | "month" | "total";
    rating: number;
    reviews: number;
    images: string[];
    amenities: string[];
    type: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    maxGuests: number;
    status: "active" | "inactive" | "pending";
    featured: boolean;
    totalBookings: number;
    totalRevenue: number;
    occupancyRate: number;
    averageStay: number;
    houseRules: string[];
};

export function AgentPropertyDetailClient({
                                              property,
                                              recentBookings,
                                              reviews,
                                          }: {
    property: AgentPropertyDetails;
    recentBookings: Booking[];
    reviews: Review[];
}) {
    const router = useRouter();
    const params = useParams();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", minimumFractionDigits: 0 }).format(amount);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "confirmed":
                return "bg-green-100 text-green-800";
            case "completed":
                return "bg-blue-100 text-blue-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            case "active":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleDeleteProperty = () => {
        toast.success("Propriété supprimée avec succès");
        router.push("/dashboard/agent/properties");
    };

    return (
        <DashboardLayout userType="agent">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.back()}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour aux Propriétés
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                            <div className="flex items-center gap-4 text-gray-600 mt-2">
                                <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                    <span className="font-medium">{property.rating}</span>
                                    <span className="ml-1">({property.reviews} avis)</span>
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {property.location}
                                </div>
                                <Badge className={getStatusColor(property.status)}>{property.status}</Badge>
                                {property.featured && (
                                    <Badge className="bg-plp-yellow text-black">
                                        <Award className="w-3 h-3 mr-1" />
                                        Vedette
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => router.push(`/dashboard/agent/properties/${params.id}/edit`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                        </Button>
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Supprimer la Propriété</DialogTitle>
                                    <DialogDescription>Êtes-vous sûr de vouloir supprimer cette propriété? Cette action est irréversible.</DialogDescription>
                                </DialogHeader>
                                <div className="flex gap-2 pt-4">
                                    <Button variant="outline" className="flex-1" onClick={() => setIsDeleteDialogOpen(false)}>
                                        Annuler
                                    </Button>
                                    <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleDeleteProperty}>
                                        Supprimer
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Property Images */}
                <Card>
                    <CardContent className="p-0">
                        <div className="relative h-96 rounded-lg overflow-hidden">
                            <Image src={property.images[currentImageIndex]} alt={property.title} fill className="object-cover" />
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                {property.images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Property Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations de la Propriété</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-6">
                                    <Badge variant="secondary" className="bg-plp-purple/10 text-plp-purple">
                                        {property.type}
                                    </Badge>
                                    <div className="flex items-center text-gray-600">
                                        <Bed className="w-4 h-4 mr-1" />
                                        {property.bedrooms} chambres
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Bath className="w-4 h-4 mr-1" />
                                        {property.bathrooms} salles de bain
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Square className="w-4 h-4 mr-1" />
                                        {property.area} m²
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Users className="w-4 h-4 mr-1" />
                                        {property.maxGuests} invités max
                                    </div>
                                </div>

                                <p className="text-gray-700 leading-relaxed">{property.description}</p>

                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Adresse</h4>
                                    <p className="text-gray-600">{property.address}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Amenities */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Équipements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {property.amenities.map((amenity) => (
                                        <div key={amenity} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tabs */}
                        <Tabs defaultValue="bookings" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="bookings">Réservations</TabsTrigger>
                                <TabsTrigger value="reviews">Avis</TabsTrigger>
                                <TabsTrigger value="rules">Règles</TabsTrigger>
                            </TabsList>

                            <TabsContent value="bookings" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Réservations Récentes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {recentBookings.map((booking) => (
                                                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{booking.client}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                                                        </p>
                                                        <p className="text-sm text-gray-600">{booking.guests} invités</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-plp-purple">{formatCurrency(booking.amount)}</div>
                                                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="reviews" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Avis Clients</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {reviews.map((review) => (
                                                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                                                    <div className="flex items-start gap-4">
                                                        <Image src={review.avatar} alt={review.client} width={48} height={48} className="rounded-full" />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h4 className="font-semibold">{review.client}</h4>
                                                                <div className="flex items-center">
                                                                    {Array.from({ length: review.rating }).map((_, i) => (
                                                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                                                    ))}
                                                                </div>
                                                                <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                                                            </div>
                                                            <p className="text-gray-700">{review.comment}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="rules" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Règles de la Maison</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {property.houseRules.map((rule, index) => (
                                                <li key={index} className="text-gray-700">
                                                    {rule}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Performance Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Performance Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center p-4 bg-plp-purple/5 rounded-lg">
                                    <div className="text-2xl font-bold text-plp-purple">{formatCurrency(property.totalRevenue)}</div>
                                    <div className="text-sm text-gray-600">Revenus Totaux</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="text-xl font-bold text-gray-900">{property.totalBookings}</div>
                                        <div className="text-sm text-gray-600">Réservations</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-gray-900">{property.occupancyRate}%</div>
                                        <div className="text-sm text-gray-600">Occupation</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-gray-900">{property.averageStay}</div>
                                        <div className="text-sm text-gray-600">Séjour Moyen</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-gray-900">{property.rating}</div>
                                        <div className="text-sm text-gray-600">Note Moyenne</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions Rapides</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full btn-primary" onClick={() => router.push(`/dashboard/agent/properties/${params.id}/edit`)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Modifier la Propriété
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Voir sur le Site
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Gérer le Calendrier
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Messages Clients
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Pricing Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Tarification
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Prix de base:</span>
                                        <span className="font-semibold">
                      {formatCurrency(property.price)}/{property.priceUnit}
                    </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Commission (15%):</span>
                                        <span className="font-semibold text-plp-pink">{formatCurrency(property.price * 0.15)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}