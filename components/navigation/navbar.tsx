'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Menu, X, User, Heart, MessageSquare, Settings, LogOut, Plus, Chrome as Home, Building2, MapPin, Star, ChevronDown, Loader2, Info, Mail } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {authService} from "@/services/authService";
import {toast} from "sonner";
import { useTranslations } from '@/components/translation-provider';
import { propertyTypeService } from '@/services/propertyTypeService';
import type { PropertyType } from '@/services/types';

interface StaticNavItem {
    nameKey: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const staticNavigationItems: StaticNavItem[] = [
    { nameKey: 'nav.home', href: '/', icon: Home },
    { nameKey: 'nav.about', href: '/about', icon: Info },
    { nameKey: 'nav.contact', href: '/contact', icon: Mail },
    { nameKey: 'pricing.title', href: '/pricing', icon: Star },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations();

    // Check authentication status on mount and set up listener
    useEffect(() => {
        const checkAuth = async () => {
            const authenticated = await authService.isAuthenticated();
            setIsAuthenticated(authenticated);
        };

        checkAuth();

        // Listen for storage changes (for multi-tab support)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token') {
                checkAuth();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Fetch property types
    useEffect(() => {
        const fetchPropertyTypes = async () => {
            try {
                setIsLoadingTypes(true);
                const types = await propertyTypeService.getAllPropertyTypes();
                // Filter only active property types
                const activeTypes = types.filter(type => type.status === 1);
                setPropertyTypes(activeTypes);
            } catch (error) {
                console.error('Error fetching property types:', error);
                setPropertyTypes([]);
            } finally {
                setIsLoadingTypes(false);
            }
        };

        fetchPropertyTypes();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await authService.logout();
            setIsAuthenticated(false); // Update state immediately
            toast.success(t('auth.loggedOut', 'Logged out successfully.'));
            router.push('/');
            // No need for window.location.reload() anymore
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error('Logout failed. Please try again.');
        }
    };

    const handleListProperty = () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to list a property');
            router.push('/auth/signin?type=agent');
            return;
        }
        // If you need user type check, you'll need to add getCurrentUser to authService
        router.push('/dashboard/agent/properties/create');
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled
                ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
                : 'bg-transparent'
        }`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 lg:h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <Logo />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {/* Property Types Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex items-center gap-1 font-medium text-gray-700 hover:text-plp-purple"
                                >
                                    <Building2 className="w-4 h-4" />
                                    {t('nav.propertyTypes','Property Types')}
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>Browse Properties</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {isLoadingTypes ? (
                                    <div className="flex items-center justify-center py-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-plp-purple" />
                                    </div>
                                ) : propertyTypes.length === 0 ? (
                                    <div className="px-2 py-2 text-sm text-gray-500">
                                        No property types available
                                    </div>
                                ) : (
                                    propertyTypes.map((type) => (
                                        <DropdownMenuItem key={type.id} asChild>
                                            <Link href={`/search?type=${type.name.toLowerCase()}`} className="flex items-center cursor-pointer">
                                                <Building2 className="w-4 h-4 mr-2" />
                                                {type.name}
                                                {type.description && (
                                                    <span className="ml-2 text-xs text-gray-500">
                                                        • {type.description.substring(0, 20)}...
                                                    </span>
                                                )}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Static Navigation Items */}
                        {staticNavigationItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.nameKey}
                                    href={item.href}
                                    className={`flex items-center gap-2 font-medium transition-colors hover:text-plp-purple ${
                                        pathname.startsWith(item.href.split('?')[0])
                                            ? 'text-plp-purple'
                                            : 'text-gray-700'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {t(item.nameKey)}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Desktop Auth & Actions */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <ThemeToggle />
                        <LanguageSwitcher />

                        {isAuthenticated ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-plp-purple"
                                    onClick={handleListProperty}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('footer.host.list', 'List Property')}
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="relative">
                                            <User className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>{t('nav.myAccount','My Account')}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/profile" className="flex items-center">
                                                <User className="w-4 h-4 mr-2" />
                                                {t('nav.profile','Profile')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/saved" className="flex items-center">
                                                <Heart className="w-4 h-4 mr-2" />
                                                {t('nav.saved','Saved Properties')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/messages" className="flex items-center">
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                {t('nav.messages','Messages')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/settings" className="flex items-center">
                                                <Settings className="w-4 h-4 mr-2" />
                                                {t('nav.settings','Settings')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="text-red-600 cursor-pointer"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            {t('auth.signOut','Sign Out')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost">{t('auth.signIn','Sign In')}</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>{t('auth.signInAs','Sign In As')}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/auth/signin?type=customer" className="flex items-center">
                                                <User className="w-4 h-4 mr-2" />
                                                {t('nav.customer','Customer')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/auth/signin?type=agent" className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                {t('nav.propertyAgent','Property Agent')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/auth/signin?type=admin" className="flex items-center">
                                                <User className="w-4 h-4 mr-2" />
                                                {t('nav.admin','Admin')}
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button className="btn-primary" asChild>
                                    <Link href="/auth/signup">{t('auth.signUp','Sign Up')}</Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="lg:hidden flex items-center space-x-2">
                        <ThemeToggle />
                        <LanguageSwitcher />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700"
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="lg:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100 shadow-lg">
                            {/* Mobile Property Types */}
                            <div className="px-3 py-2">
                                <p className="text-sm font-semibold text-gray-900 mb-2">Property Types</p>
                                {isLoadingTypes ? (
                                    <div className="flex items-center justify-center py-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-plp-purple" />
                                    </div>
                                ) : propertyTypes.length === 0 ? (
                                    <p className="text-xs text-gray-500">No property types available</p>
                                ) : (
                                    <div className="space-y-1">
                                        {propertyTypes.map((type) => (
                                            <Link
                                                key={type.id}
                                                href={`/search?type=${type.name.toLowerCase()}`}
                                                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-700 hover:text-plp-purple hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Building2 className="w-4 h-4" />
                                                {type.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="border-t pt-2 my-2" />

                            {/* Static Navigation Items */}
                            {staticNavigationItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.nameKey}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                            pathname.startsWith(item.href.split('?')[0])
                                                ? 'text-plp-purple bg-plp-purple/10'
                                                : 'text-gray-700 hover:text-plp-purple hover:bg-gray-50'
                                        }`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {t(item.nameKey)}
                                    </Link>
                                );
                            })}

                            <div className="pt-4 space-y-2">
                                {isAuthenticated ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-plp-purple"
                                            onClick={() => {
                                                handleListProperty();
                                                setIsOpen(false);
                                            }}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            {t('footer.host.list','List Property')}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start"
                                            asChild
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Link href="/dashboard">
                                                <User className="w-4 h-4 mr-2" />
                                                {t('nav.dashboard','Dashboard')}
                                            </Link>
                                        </Button>
                                        <div className="border-t pt-2 mt-2">
                                            <Link
                                                href="/dashboard/profile"
                                                className="flex items-center px-3 py-2 text-gray-700 hover:text-plp-purple"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <User className="w-4 h-4 mr-2" />
                                                {t('nav.profile','Profile')}
                                            </Link>
                                            <Link
                                                href="/dashboard/saved"
                                                className="flex items-center px-3 py-2 text-gray-700 hover:text-plp-purple"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Heart className="w-4 h-4 mr-2" />
                                                {t('nav.saved','Saved Properties')}
                                            </Link>
                                            <Link
                                                href="/dashboard/messages"
                                                className="flex items-center px-3 py-2 text-gray-700 hover:text-plp-purple"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                {t('nav.messages','Messages')}
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsOpen(false);
                                                }}
                                                className="flex items-center px-3 py-2 text-red-600 w-full text-left"
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                {t('auth.signOut','Sign Out')}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-700 px-3">{t('auth.signInAs','Sign In As:')}</p>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start"
                                                asChild
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Link href="/auth/signin?type=customer">
                                                    <User className="w-4 h-4 mr-2" />
                                                    {t('nav.customer','Customer')}
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start"
                                                asChild
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Link href="/auth/signin?type=agent">
                                                    <MapPin className="w-4 h-4 mr-2" />
                                                    {t('nav.propertyAgent','Property Agent')}
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start"
                                                asChild
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Link href="/auth/signin?type=admin">
                                                    <User className="w-4 h-4 mr-2" />
                                                    {t('nav.admin','Admin')}
                                                </Link>
                                            </Button>
                                        </div>
                                        <Button
                                            className="w-full btn-primary"
                                            asChild
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Link href="/auth/signup">{t('auth.signUp','Sign Up')}</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}