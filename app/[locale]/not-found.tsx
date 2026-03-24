"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { ArrowLeft, Home, LayoutGrid, HelpCircle } from "lucide-react";
import { useTranslations } from '@/components/translation-provider';
import { authService } from '@/services/authService';

export default function NotFound() {
    const router = useRouter();
    const params = useParams<{ locale: string }>();
    const locale = (params?.locale || 'en').toLowerCase() === 'fr' ? 'fr' : 'en';
    const t = useTranslations();
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [userType, setUserType] = React.useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const authenticated = await authService.isAuthenticated();
                setIsAuthenticated(authenticated);
                if (authenticated) {
                    const user = await authService.getCurrentUser();
                    setUserType(user?.user_type ?? null);
                }
            } catch (err) {
                setIsAuthenticated(false);
            }
        };
        checkAuth();
    }, []);

    const getDashboardLink = () => {
        switch (userType) {
            case 'admin':
                return `/${locale}/admin`;
            case 'agent':
                return `/${locale}/dashboard/agent`;
            default:
                return `/${locale}/dashboard`;
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-plp-purple via-plp-pink to-plp-yellow p-6">
            {/* Animated gradient orbs */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-black/10 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
            </div>

            <Card className="relative z-10 w-full max-w-4xl border-0 shadow-2xl bg-white/95 backdrop-blur">
                {/* Header with Logo */}
                <div className="border-b border-gray-200 p-6 flex items-center justify-between">
                    <Link href={`/${locale}`} className="transition-transform hover:scale-110">
                        <Logo showText={false} className="w-8 h-8" disableLink />
                    </Link>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t('errors.pageNotFound', 'Page Not Found')}
                    </p>
                </div>

                <CardContent className="p-0 md:p-10">
                    <div className="grid md:grid-cols-2">
                        {/* Illustration */}
                        <div className="relative order-2 md:order-1 p-6 md:p-8">
                            <div className="relative rounded-xl overflow-hidden shadow-lg">
                                <img
                                    src="https://images.pexels.com/photos/7031401/pexels-photo-7031401.jpeg"
                                    alt="Modern property exterior"
                                    className="w-full h-64 md:h-80 object-cover scale-100 transition-transform duration-700 ease-out hover:scale-105"
                                />
                                {/* Floating badge */}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow">
                                    {t('notFound.brand')}
                                </div>
                                {/* Animated marker */}
                                <div className="absolute -bottom-4 left-10 w-10 h-10 bg-gradient-to-tr from-plp-purple to-plp-pink rounded-full shadow-lg animate-bounce" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="order-1 md:order-2 p-6 md:p-10 flex flex-col justify-center">
                            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-gray-600 bg-gray-100 rounded-full px-3 py-1 w-max">
                                <span className="w-2 h-2 rounded-full bg-plp-pink animate-pulse" />
                                {t('notFound.error')} 404
                            </p>
                            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                                {t('notFound.title')}
                            </h1>
                            <p className="mt-3 text-gray-600">
                                {t('notFound.description')}
                            </p>

                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Button onClick={() => router.back()} variant="outline" className="justify-center">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    {t('notFound.goBack')}
                                </Button>
                                <Button asChild className="w-full btn-primary justify-center">
                                    <Link href={`/${locale}`}>
                                        <Home className="w-4 h-4 mr-2" />
                                        {t('notFound.home')}
                                    </Link>
                                </Button>
                                {isAuthenticated && (
                                    <Button asChild variant="secondary" className="w-full justify-center">
                                        <Link href={getDashboardLink()}>
                                            <LayoutGrid className="w-4 h-4 mr-2" />
                                            {t('nav.dashboard')}
                                        </Link>
                                    </Button>
                                )}
                                <Button asChild variant="ghost" className="w-full justify-center">
                                    <Link href={`/${locale}/help`}>
                                        <HelpCircle className="w-4 h-4 mr-2" />
                                        {t('notFound.helpCenter')}
                                    </Link>
                                </Button>
                            </div>

                            {/* Tips / links */}
                            <div className="mt-6 text-sm text-gray-500">
                                {t('notFound.tip')}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Decorative shapes */}
            <svg
                className="pointer-events-none absolute -z-0 bottom-10 left-10 w-24 h-24 text-white/20 animate-[spin_18s_linear_infinite]"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="currentColor" />
            </svg>
        </div>
    );
}