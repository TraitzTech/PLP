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
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Building2, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";

type Property = {
    id: string;
    title: string;
    description: string;
    location: string;
    price: number;
    priceUnit: string;
    type: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    maxGuests: number;
    status: "active" | "pending" | "suspended" | "rejected";
    featured: boolean;
    owner: string;
    ownerId: string;
    amenities: string[];
    images: string[];
};

export function PropertyEditClient({ initialData }: { initialData: Property }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState<Property>(initialData);

    useEffect(() => setMounted(true), []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast.success("Property updated successfully!");
            router.push("/admin/properties");
        }, 1500);
    };

    const handleInputChange = <K extends keyof Property>(field: K, value: Property[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", minimumFractionDigits: 0 }).format(amount);

    return (
        <DashboardLayout userType="admin">
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Properties
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
                        <p className="text-gray-600 mt-2">Update property information and settings.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Property Images</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {formData.images.map((image, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                        <img src={image} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                    <Button variant="ghost" type="button">
                                        <Building2 className="w-6 h-6 text-gray-400" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="w-5 h-5" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Property Title *</Label>
                                <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Property Type *</Label>
                                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value as Property["type"])}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        {mounted && (
                                            <SelectContent>
                                                <SelectItem value="villa">Villa</SelectItem>
                                                <SelectItem value="apartment">Apartment</SelectItem>
                                                <SelectItem value="house">House</SelectItem>
                                                <SelectItem value="land">Land</SelectItem>
                                                <SelectItem value="resort">Resort</SelectItem>
                                            </SelectContent>
                                        )}
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleInputChange("status", value as Property["status"])}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        {mounted && (
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectContent>
                                        )}
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange("location", e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Property Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bedrooms">Bedrooms</Label>
                                    <Input
                                        id="bedrooms"
                                        type="number"
                                        value={formData.bedrooms}
                                        onChange={(e) => handleInputChange("bedrooms", parseInt(e.target.value || "0", 10))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bathrooms">Bathrooms</Label>
                                    <Input
                                        id="bathrooms"
                                        type="number"
                                        value={formData.bathrooms}
                                        onChange={(e) => handleInputChange("bathrooms", parseInt(e.target.value || "0", 10))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="area">Area (sq ft)</Label>
                                    <Input id="area" type="number" value={formData.area} onChange={(e) => handleInputChange("area", parseInt(e.target.value || "0", 10))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxGuests">Max Guests</Label>
                                    <Input
                                        id="maxGuests"
                                        type="number"
                                        value={formData.maxGuests}
                                        onChange={(e) => handleInputChange("maxGuests", parseInt(e.target.value || "0", 10))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Pricing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price *</Label>
                                    <div className="relative">
                                        <Input
                                            id="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => handleInputChange("price", parseInt(e.target.value || "0", 10))}
                                            required
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">XAF</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Current: {formatCurrency(formData.price)}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priceUnit">Price Unit</Label>
                                    <Select value={formData.priceUnit} onValueChange={(value) => handleInputChange("priceUnit", value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        {mounted && (
                                            <SelectContent>
                                                <SelectItem value="night">Per Night</SelectItem>
                                                <SelectItem value="week">Per Week</SelectItem>
                                                <SelectItem value="month">Per Month</SelectItem>
                                                <SelectItem value="total">Total Price</SelectItem>
                                            </SelectContent>
                                        )}
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Property Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Featured Property</Label>
                                    <p className="text-sm text-gray-500">Display this property in featured sections</p>
                                </div>
                                <Switch checked={formData.featured} onCheckedChange={(checked) => handleInputChange("featured", checked)} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" className="btn-primary" disabled={isLoading}>
                            <Save className="w-4 h-4 mr-2" />
                            {isLoading ? "Updating Property..." : "Update Property"}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}