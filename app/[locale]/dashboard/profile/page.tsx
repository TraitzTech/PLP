"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Award, MessageSquare, CreditCard as Edit, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { profileService } from "@/services/profileService";
import { dashboardService } from "@/services/dashboardService";
import { bookingService, type Booking } from "@/services/bookingService";
import { activityService } from "@/services/activityService";
import type { ProfileData } from "@/services/profileService";
import type { DashboardStats } from "@/services/types";
export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [profileData, statsRes, bookingsRes, activitiesRes] = await Promise.all([
          profileService.getProfile(),
          dashboardService.getStats("customer"),
          bookingService.getMyBookings(),
          activityService.getAllActivities({ per_page: 5 }),
        ]);

        setProfile(profileData);
        setStats(statsRes.data);
        setBookings(bookingsRes.data || []);
        setActivities(activitiesRes.data?.data || []);
      } catch (error) {
        console.error("Failed to load profile page data", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatCurrency = (amount: number | undefined | null) => {
    const numeric = Number(amount || 0);
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(numeric);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = useMemo(() => {
    const name = profile?.name || "User";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile]);

  return (
    <DashboardLayout userType="customer">
      <div className="space-y-8">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile?.avatar || undefined} />
                  <AvatarFallback className="text-2xl">{getInitials}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile?.name || "User"}
                  </h1>
                  <Badge className="bg-green-100 text-green-800 flex items-center">
                    <Award className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  {profile?.created_at && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {formatDate(profile.created_at)}
                    </div>
                  )}
                  {profile?.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {profile.phone}
                    </div>
                  )}
                  {profile?.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {profile.email}
                    </div>
                  )}
                </div>

                {profile?.bio && (
                  <p className="text-gray-700 mb-4 max-w-2xl">{profile.bio}</p>
                )}

                <div className="flex gap-3">
                  <Button className="btn-primary" onClick={() => toast.info("Edit profile in Settings")}> 
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" onClick={() => toast.info("Manage contact info in Settings")}> 
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Info
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-plp-purple">{stats?.totalBookings ?? 0}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-plp-pink">{stats?.activeBookings ?? 0}</div>
              <div className="text-sm text-gray-600">Active Bookings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-plp-yellow">{formatCurrency(stats?.totalSpent)}</div>
              <div className="text-sm text-gray-600">Total Spent (XAF)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.savedProperties ?? 0}</div>
              <div className="text-sm text-gray-600">Saved Properties</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.completedBookings ?? 0}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{stats?.cancelledBookings ?? 0}</div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.created_at)}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">{activity.action}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-sm text-gray-500">No bookings yet</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{booking.listing?.title ?? "Booking"}</h3>
                          <p className="text-sm text-gray-600">
                            {booking.check_in_date} → {booking.check_out_date}
                          </p>
                          <p className="text-xs text-gray-500">{booking.listing?.city || booking.listing?.region || ""}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-plp-purple">{formatCurrency(booking.total_price)}</div>
                          <Badge className="mt-1 capitalize" variant="outline">{booking.status}</Badge>
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
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{profile?.email ?? "Not set"}</div>
                    <div className="text-sm text-gray-500">Primary email</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{profile?.phone ?? "Not set"}</div>
                    <div className="text-sm text-gray-500">Mobile phone</div>
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