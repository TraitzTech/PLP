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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Camera } from "lucide-react";
import { toast } from "sonner";

export type AdminUser = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
    userType: "customer" | "owner" | "agent" | "admin";
    status: "active" | "pending" | "suspended";
    verified: boolean;
    location?: string;
    bio?: string;
    joinedDate?: string;
    sendWelcomeEmail?: boolean;
};

export function UserEditClient({ initialData }: { initialData: AdminUser }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState<AdminUser>(initialData);

    useEffect(() => setMounted(true), []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast.success("User updated successfully!");
            router.push("/admin/users");
        }, 1200);
    };

    const handleInputChange = <K extends keyof AdminUser>(field: K, value: AdminUser[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <DashboardLayout userType="admin">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Users
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
                        <p className="text-gray-600 mt-2">Update user information and settings.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Profile Picture */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Picture</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4">
                                <Avatar className="w-20 h-20">
                                    <AvatarImage src={formData.avatar} />
                                    <AvatarFallback className="text-lg">
                                        {formData.firstName?.[0]}
                                        {formData.lastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <Button variant="outline" type="button">
                                        <Camera className="w-4 h-4 mr-2" />
                                        Change Photo
                                    </Button>
                                    <p className="text-sm text-gray-500 mt-1">JPG, GIF or PNG. 1MB max.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input id="phone" value={formData.phone || ""} onChange={(e) => handleInputChange("phone", e.target.value)} className="pl-10" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="userType">User Type *</Label>
                                    <Select value={formData.userType} onValueChange={(value) => handleInputChange("userType", value as AdminUser["userType"])}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        {mounted && (
                                            <SelectContent>
                                                <SelectItem value="customer">Customer</SelectItem>
                                                <SelectItem value="owner">Property Owner</SelectItem>
                                                <SelectItem value="agent">Property Agent</SelectItem>
                                                <SelectItem value="admin">Administrator</SelectItem>
                                            </SelectContent>
                                        )}
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value as AdminUser["status"])}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        {mounted && (
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                            </SelectContent>
                                        )}
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="location"
                                        value={formData.location || ""}
                                        onChange={(e) => handleInputChange("location", e.target.value)}
                                        className="pl-10"
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea id="bio" value={formData.bio || ""} onChange={(e) => handleInputChange("bio", e.target.value)} placeholder="Brief description about the user..." rows={3} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Verified Account</Label>
                                    <p className="text-sm text-gray-500">Mark this account as verified</p>
                                </div>
                                <Switch checked={formData.verified} onCheckedChange={(checked) => handleInputChange("verified", checked)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Send Notification Email</Label>
                                    <p className="text-sm text-gray-500">Notify user about account changes</p>
                                </div>
                                <Switch
                                    checked={!!formData.sendWelcomeEmail}
                                    onCheckedChange={(checked) => handleInputChange("sendWelcomeEmail", checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" className="btn-primary" disabled={isLoading}>
                            <Save className="w-4 h-4 mr-2" />
                            {isLoading ? "Updating User..." : "Update User"}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}