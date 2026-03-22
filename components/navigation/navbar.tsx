'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Menu, X, User, Heart, MessageSquare, Settings, LogOut, Plus, Chrome as Home, Building2, MapPin, Star, ChevronDown, Loader2, Info, Mail, Search } from 'lucide-react';
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
import type { User } from '@/services/types';

interface StaticNavItem {
    nameKey: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const staticNavigationItems: StaticNavItem[] = [
    { nameKey: 'nav.home', href: '/', icon: Home },
    {nameKey: 'nav.search', href: '/search', icon: Search},
    { nameKey: 'nav.about', href: '/about', icon: Info },
    { nameKey: 'nav.contact', href: '/contact', icon: Mail },
    { nameKey: 'pricing.title', href: '/pricing', icon: Star },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations();

    const getRoutesByUserType = (userType?: User['user_type']) => {
        if (userType === 'admin') {
            return {
                dashboard: '/admin',
                profile: '/admin/settings',
                saved: '/admin/properties',
                messages: '/admin/notifications',
                settings: '/admin/settings',
                listProperty: '/admin/properties/new',
            };
        }

        if (userType === 'agent') {
            return {
                dashboard: '/dashboard/agent',
                profile: '/dashboard/agent/profile',
                saved: '/dashboard/agent/properties',
                messages: '/dashboard/agent/messages',
                settings: '/dashboard/agent/settings',
                listProperty: '/dashboard/agent/properties/new',
            };
        }

        return {
            dashboard: '/dashboard',
            profile: '/dashboard/profile',
            saved: '/dashboard/saved',
            messages: '/dashboard/messages',
            settings: '/dashboard/settings',
            listProperty: '/dashboard/agent/properties/new',
        };
    };

    const accountRoutes = getRoutesByUserType(currentUser?.user_type);
    const canListProperty = currentUser?.user_type === 'agent' || currentUser?.user_type === 'admin';

    // Check authentication status on mount and set up listener
    useEffect(() => {
        setMounted(true);
        const checkAuth = async () => {
            const authenticated = await authService.isAuthenticated();
            setIsAuthenticated(authenticated);
            if (authenticated) {
                const user = await authService.getCurrentUser();
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
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
                setPropertyTypes(types);
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
            setCurrentUser(null);
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

        if (currentUser?.user_type === 'customer') {
            toast.error('Only agent or admin accounts can list properties');
            router.push('/auth/signin?type=agent');
            return;
        }

        router.push(accountRoutes.listProperty);
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled
                ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
                : 'bg-transparent'
        }`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16 lg:h-16 xl:h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                              <Logo className="origin-left scale-75 sm:scale-90 lg:scale-90 xl:scale-100" />
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
                                {!mounted ? null : isLoadingTypes ? (
                                    <div className="flex items-center justify-center py-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-plp-purple" />
                                    </div>
                                ) : propertyTypes.length === 0 ? (
                                    <div className="px-2 py-2 text-sm text-gray-500">
                                        No property types available
                                    </div>
                                ) : (
                                    propertyTypes.map((type) => {
                                        const isActive = type.status === 1 || type.status === true;

                                        if (!isActive) {
                                            return (
                                                <DropdownMenuItem key={type.id} disabled>
                                                    <div className="flex items-center text-gray-400">
                                                        <Building2 className="w-4 h-4 mr-2" />
                                                        {type.name}
                                                        <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-600">Coming soon</span>
                                                    </div>
                                                </DropdownMenuItem>
                                            );
                                        }

                                        return (
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
                                        );
                                    })
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

                        {mounted && isAuthenticated ? (
                            <>
                                {canListProperty && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-plp-purple"
                                        onClick={handleListProperty}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        {t('footer.host.list', 'List Property')}
                                    </Button>
                                )}

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
                                            <Link href={accountRoutes.dashboard} className="flex items-center">
                                                <Home className="w-4 h-4 mr-2" />
                                                {t('nav.dashboard','Dashboard')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={accountRoutes.profile} className="flex items-center">
                                                <User className="w-4 h-4 mr-2" />
                                                {t('nav.profile','Profile')}
                                            </Link>
                                        </DropdownMenuItem>
                                        {currentUser?.user_type === 'customer' && (
                                            <DropdownMenuItem asChild>
                                                <Link href={accountRoutes.saved} className="flex items-center">
                                                    <Heart className="w-4 h-4 mr-2" />
                                                    {t('nav.saved','Saved Properties')}
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem asChild>
                                            <Link href={accountRoutes.messages} className="flex items-center">
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                {t('nav.messages','Messages')}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={accountRoutes.settings} className="flex items-center">
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
                        ) : mounted ? (
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
                        ) : null}
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
                                {!mounted ? null : isLoadingTypes ? (
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
                                {mounted && isAuthenticated ? (
                                    <>
                                        {canListProperty && (
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
                                        )}
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start"
                                            asChild
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Link href={accountRoutes.dashboard}>
                                                <User className="w-4 h-4 mr-2" />
                                                {t('nav.dashboard','Dashboard')}
                                            </Link>
                                        </Button>
                                        <div className="border-t pt-2 mt-2">
                                            <Link
                                                href={accountRoutes.profile}
                                                className="flex items-center px-3 py-2 text-gray-700 hover:text-plp-purple"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <User className="w-4 h-4 mr-2" />
                                                {t('nav.profile','Profile')}
                                            </Link>
                                            {currentUser?.user_type === 'customer' && (
                                                <Link
                                                    href={accountRoutes.saved}
                                                    className="flex items-center px-3 py-2 text-gray-700 hover:text-plp-purple"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <Heart className="w-4 h-4 mr-2" />
                                                    {t('nav.saved','Saved Properties')}
                                                </Link>
                                            )}
                                            <Link
                                                href={accountRoutes.messages}
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
                                ) : mounted ? (
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
                                ) : null}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}