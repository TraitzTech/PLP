"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ReviewForm } from "@/components/reviews/review-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";

type BookingSummary = {
    id: string;
    property: {
        id: string;
        title: string;
        location: string;
        image: string;
    };
    checkIn: string;
    checkOut: string;
    status: "completed" | "upcoming" | "canceled";
};

export function ReviewWriteClient({ booking }: { booking: BookingSummary }) {
    const router = useRouter();
    const [language, setLanguage] = useState<"en" | "fr">("en");

    useEffect(() => {
        const saved = (localStorage.getItem("language") as "en" | "fr") || "en";
        setLanguage(saved);
        const onChange = () => {
            const current = (localStorage.getItem("language") as "en" | "fr") || "en";
            setLanguage(current);
        };
        window.addEventListener("languageChanged", onChange);
        return () => window.removeEventListener("languageChanged", onChange);
    }, []);

    const content = {
        en: {
            back: "Back",
            title: "Write a Review",
            subtitle: "Share your experience to help other travelers",
            bookingDetails: "Booking Details",
            stayDates: "Stay Dates",
        },
        fr: {
            back: "Retour",
            title: "Écrire un Avis",
            subtitle: "Partagez votre expérience pour aider d'autres voyageurs",
            bookingDetails: "Détails de la Réservation",
            stayDates: "Dates de Séjour",
        },
    } as const;

    const t = content[language];

    const handleReviewSubmit = (reviewData: any) => {
        // submit...
        router.push("/dashboard/bookings");
    };

    const handleCancel = () => router.back();

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    return (
        <DashboardLayout userType="customer">
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t.back}
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
                        <p className="text-gray-600 mt-2">{t.subtitle}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <ReviewForm
                            propertyTitle={booking.property.title}
                            language={language}
                            onSubmit={handleReviewSubmit}
                            onCancel={handleCancel}
                        />
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="sticky top-8">
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-900">{t.bookingDetails}</h3>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <img
                                    src={booking.property.image}
                                    alt={booking.property.title}
                                    className="w-full h-48 rounded-lg object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">{booking.property.title}</h4>
                                    <div className="flex items-center text-gray-600 text-sm">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {booking.property.location}
                                    </div>
                                </div>
                                <div className="border-t pt-4">
                                    <h5 className="font-medium text-gray-900 mb-2">{t.stayDates}</h5>
                                    <p className="text-gray-600 text-sm">
                                        {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}