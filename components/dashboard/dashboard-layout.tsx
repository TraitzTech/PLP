'use client'

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Chrome as Home, Calendar, Heart, MessageSquare, Settings, User, LogOut, Menu, X, Building2, ChartBar as BarChart3, Plus, Users, Shield, Bell, Star, Globe, Check } from 'lucide-react';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { NotificationDropdown } from './notification-dropdown';
import { useTranslations } from '@/components/translation-provider';

interface DashboardLayoutProps {
    children: React.ReactNode;
    userType: 'customer' | 'owner' | 'agent' | 'admin';
}

const customerNavItems = [
    { nameKey: 'dashboard.customer.navigation.dashboard', href: '/dashboard', icon: Home },
    { nameKey: 'dashboard.customer.navigation.myBookings', href: '/dashboard/bookings', icon: Calendar },
    { nameKey: 'dashboard.customer.navigation.savedProperties', href: '/dashboard/saved', icon: Heart },
    { nameKey: 'dashboard.customer.navigation.messages', href: '/dashboard/messages', icon: MessageSquare },
    { nameKey: 'dashboard.customer.navigation.notifications', href: '/dashboard/notifications', icon: Bell },
    { nameKey: 'dashboard.customer.navigation.profile', href: '/dashboard/profile', icon: User },
    { nameKey: 'dashboard.customer.navigation.settings', href: '/dashboard/settings', icon: Settings },
];

const ownerNavItems = [
    { nameKey: 'dashboard.owner.navigation.dashboard', href: '/dashboard/owner', icon: Home },
    { nameKey: 'dashboard.owner.navigation.myProperties', href: '/dashboard/owner/properties', icon: Building2 },
    { nameKey: 'dashboard.owner.navigation.addProperty', href: '/dashboard/owner/properties/new', icon: Plus },
    { nameKey: 'dashboard.owner.navigation.reservations', href: '/dashboard/owner/bookings', icon: Calendar },
    { nameKey: 'dashboard.owner.navigation.analytics', href: '/dashboard/owner/analytics', icon: BarChart3 },
    { nameKey: 'dashboard.owner.navigation.messages', href: '/dashboard/owner/messages', icon: MessageSquare },
    { nameKey: 'dashboard.owner.navigation.notifications', href: '/dashboard/owner/notifications', icon: Bell },
    { nameKey: 'dashboard.owner.navigation.profile', href: '/dashboard/owner/profile', icon: User },
    { nameKey: 'dashboard.owner.navigation.settings', href: '/dashboard/owner/settings', icon: Settings },
];

const agentNavItems = [
    { nameKey: 'dashboard.agent.navigation.dashboard', href: '/dashboard/agent', icon: Home },
    { 
        nameKey: 'dashboard.agent.navigation.properties',
        icon: Building2,
        submenu: [
            { nameKey: 'dashboard.agent.navigation.myProperties', href: '/dashboard/agent/properties' },
        ]
    },
    { nameKey: 'dashboard.agent.navigation.addProperty', href: '/dashboard/agent/properties/new', icon: Plus },
    { nameKey: 'dashboard.agent.navigation.reservations', href: '/dashboard/agent/reservations', icon: Calendar },
    { nameKey: 'dashboard.agent.navigation.clients', href: '/dashboard/agent/clients', icon: Users },
    { nameKey: 'dashboard.agent.navigation.analytics', href: '/dashboard/agent/analytics', icon: BarChart3 },
    { nameKey: 'dashboard.agent.navigation.messages', href: '/dashboard/agent/messages', icon: MessageSquare },
    { nameKey: 'dashboard.agent.navigation.notifications', href: '/dashboard/agent/notifications', icon: Bell },
    { nameKey: 'dashboard.agent.navigation.subscription', href: '/dashboard/agent/subscription', icon: Star },
    { nameKey: 'dashboard.agent.navigation.profile', href: '/dashboard/agent/profile', icon: User },
    { nameKey: 'dashboard.agent.navigation.settings', href: '/dashboard/agent/settings', icon: Settings },
];

const adminNavItems = [
    { nameKey: 'dashboard.admin.navigation.dashboard', href: '/admin', icon: Home },
    { nameKey: 'dashboard.admin.navigation.users', href: '/admin/users', icon: Users },
    {
        nameKey: 'dashboard.admin.navigation.agents',
        icon: Shield,
        submenu: [
            { nameKey: 'dashboard.admin.navigation.allAgents', href: '/admin/agents' },
            { nameKey: 'dashboard.admin.navigation.pendingApprovals', href: '/admin/agents/pending' },
        ]
    },
    { 
        nameKey: 'dashboard.admin.navigation.properties',
        icon: Building2,
        submenu: [
            { nameKey: 'dashboard.admin.navigation.allProperties', href: '/admin/properties' },
            { nameKey: 'dashboard.admin.navigation.propertyTypes', href: '/admin/property-types' },
            { nameKey: 'dashboard.admin.navigation.facilities', href: '/admin/facilities' },
        ]
    },
    { nameKey: 'dashboard.admin.navigation.reservations', href: '/admin/reservations', icon: Calendar },
    { nameKey: 'dashboard.admin.navigation.messages', href: '/admin/messages', icon: MessageSquare },
    { nameKey: 'dashboard.admin.navigation.reviews', href: '/admin/reviews', icon: Star },
    { nameKey: 'dashboard.admin.navigation.notifications', href: '/admin/notifications', icon: Bell },
    { nameKey: 'dashboard.admin.navigation.blog', href: '/admin/blog', icon: FileText },
    { nameKey: 'dashboard.admin.navigation.subscriptions', href: '/admin/subscriptions', icon: Star },
    { nameKey: 'dashboard.admin.navigation.analytics', href: '/admin/analytics', icon: BarChart3 },
    { nameKey: 'dashboard.admin.navigation.profile', href: '/admin/profile', icon: User },
    { nameKey: 'dashboard.admin.navigation.settings', href: '/admin/settings', icon: Settings },
];

type Language = {
  code: string;
  name: string;
  flag: string;
};

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export function DashboardLayout({ children, userType }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const pathnameRef = useRef(pathname);
    const t = useTranslations();

    // Extract locale from pathname
    const parts = pathname.split('/').filter(Boolean);
    const currentLocale = parts.length > 0 && ['en', 'fr'].includes(parts[0]) ? parts[0] : 'en';
    const localizedPath = (path: string) => {
        if (path.startsWith(`/${currentLocale}/`) || path === `/${currentLocale}`) return path;
        return `/${currentLocale}${path.startsWith('/') ? path : `/${path}`}`;
    };
    const normalizedPath = pathname.replace(/^\/(en|fr)(?=\/|$)/, '') || '/';

    // Keep ref in sync so redirects use the latest pathname
    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    // Only check auth once on mount (not on every route change within the dashboard)
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentPath = pathnameRef.current;
                const segments = currentPath.split('/').filter(Boolean);
                const locale = segments[0] || 'en';
                
                const isAuthed = await authService.isAuthenticated();
                if (!isAuthed) {
                    router.replace(`/${locale}/auth/signin?redirect=${encodeURIComponent(currentPath)}`);
                    return;
                }
                
                // Fetch current user details
                const user = await authService.getCurrentUser?.();

                if (user) {
                    setCurrentUser(user);
                    
                    // Check role-based access
                    const actualUserType = user.user_type;
                    
                    // Map expected userType to actual user_type values
                    const expectedUserTypes: Record<string, string[]> = {
                        'admin': ['admin'],
                        'agent': ['agent'],
                        'customer': ['customer'],
                        'owner': ['customer', 'agent'] // owners can be customers or agents
                    };
                    
                    const allowedTypes = expectedUserTypes[userType] || [];
                    
                    if (!actualUserType || !allowedTypes.includes(actualUserType)) {
                        // Redirect to the user's appropriate dashboard
                        if (actualUserType === 'admin') {
                            router.replace(`/${locale}/admin`);
                        } else if (actualUserType === 'agent') {
                            router.replace(`/${locale}/dashboard/agent`);
                        } else {
                            router.replace(`/${locale}/dashboard`);
                        }
                        return;
                    }
                    
                    setIsAuthorized(true);
                } else {
                    router.replace(`/${locale}/auth/signin`);
                }
            } catch (e) {
                const currentPath = pathnameRef.current;
                const segments = currentPath.split('/').filter(Boolean);
                const locale = segments[0] || 'en';
                router.replace(`/${locale}/auth/signin`);
            }
        };
        checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userType, router]);

    const navItems = userType === 'customer' ? customerNavItems :
        userType === 'owner' ? ownerNavItems :
            userType === 'agent' ? agentNavItems : adminNavItems;

    const getUserTitle = () => {
        switch (userType) {
            case 'customer': return t('dashboard.customer.title');
            case 'owner': return t('dashboard.owner.title');
            case 'agent': return t('dashboard.agent.title');
            case 'admin': return t('dashboard.admin.title');
            default: return t('nav.dashboard');
        }
    };

    const getProfileRoute = () => {
        switch (userType) {
            case 'customer': return '/dashboard/profile';
            case 'owner': return '/dashboard/owner/profile';
            case 'agent': return '/dashboard/agent/profile';
            case 'admin': return '/admin/settings';
            default: return '/dashboard/profile';
        }
    };

    const getSettingsRoute = () => {
        switch (userType) {
            case 'customer': return '/dashboard/settings';
            case 'owner': return '/dashboard/owner/settings';
            case 'agent': return '/dashboard/agent/settings';
            case 'admin': return '/admin/settings';
            default: return '/dashboard/settings';
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            toast.success(t('auth.loggedOut'));
            router.push(`/${currentLocale}`);
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error(t('dashboard.messages.unauthorized'));
        }
    };

    const handleLanguageChange = (lang: Language) => {
        // Preserve current path but change locale prefix
        const rest = parts.length > 0 && ['en', 'fr'].includes(parts[0]) ? parts.slice(1) : parts;
        const newPath = `/${lang.code}/${rest.join('/')}`.replace(/\/\/$/, '/');
        router.push(newPath === '/' ? `/${lang.code}` : newPath);
    };

    const getUserInitials = (name?: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const currentLang = languages.find((l) => l.code === currentLocale) ?? languages[0];

    // Show shimmer skeleton while checking authorization (only on initial load)
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar skeleton */}
                <div className="hidden lg:block w-64 bg-white shadow-lg border-r flex-shrink-0">
                    <div className="p-6 border-b">
                        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="px-4 py-6 space-y-3">
                        {[75, 60, 85, 70, 90, 65, 80].map((w, i) => (
                            <div key={i} className="flex items-center gap-3 px-3 py-2">
                                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${w}%` }} />
                            </div>
                        ))}
                    </div>
                    <div className="absolute bottom-0 left-0 w-64 p-4 border-t">
                        <div className="flex items-center gap-3 p-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                            <div className="space-y-1.5 flex-1">
                                <div className="h-3.5 w-24 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Main content skeleton */}
                <div className="flex-1">
                    <header className="bg-white shadow-sm border-b">
                        <div className="flex items-center justify-between px-6 py-4">
                            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                    </header>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3" />
                                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <style jsx global>{`
                /* Custom purple scrollbar styles */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f3f4f6;
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #7c3aed 0%, #a855f7 100%);
                    border-radius: 10px;
                    transition: background 0.3s ease;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #6d28d9 0%, #9333ea 100%);
                }
                
                /* Firefox scrollbar */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #7c3aed #f3f4f6;
                }
            `}</style>

            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex flex-col h-full">
                    {/* Logo - Fixed at top */}
                    <div className="flex items-center justify-between p-2 border-b flex-shrink-0">
                        <div onClick={() => setSidebarOpen(false)}>
                            <Logo showText={false} />
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Navigation - Scrollable */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                        {navItems.map((item: any) => {
                            const Icon = item.icon;
                            const hasSubmenu = item.submenu && item.submenu.length > 0;
                            const exactOnlyRoots = ['/dashboard', '/dashboard/owner', '/dashboard/agent', '/admin'];
                            const isActive = item.href
                                ? (exactOnlyRoots.includes(item.href)
                                    ? normalizedPath === item.href
                                    : (normalizedPath === item.href || normalizedPath.startsWith(item.href + '/')))
                                : false;
                            const isSubmenuActive = hasSubmenu && item.submenu.some((subitem: any) => normalizedPath === subitem.href || normalizedPath.startsWith(subitem.href + '/'));

                            if (hasSubmenu) {
                                return (
                                    <div key={item.nameKey}>
                                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-default ${
                                            isSubmenuActive
                                                ? 'bg-plp-purple text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}>
                                            <Icon className="w-4 h-4" />
                                            {t(item.nameKey)}
                                        </div>
                                        <div className="ml-6 space-y-1 mt-1">
                                            {item.submenu.map((subitem: any) => {
                                                const isSubitemActive = normalizedPath === subitem.href || normalizedPath.startsWith(subitem.href + '/');
                                                return (
                                                    <Link
                                                        key={subitem.nameKey}
                                                        href={localizedPath(subitem.href)}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                            isSubitemActive
                                                                ? 'bg-plp-purple text-white'
                                                                : 'text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                        onClick={() => setSidebarOpen(false)}
                                                    >
                                                        {t(subitem.nameKey)}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.nameKey}
                                    href={localizedPath(item.href)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-plp-purple text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className="w-4 h-4" />
                                    {t(item.nameKey)}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile - Fixed at bottom */}
                    <div className="p-4 border-t flex-shrink-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start p-2 hover:bg-gray-100">
                                    <Avatar className="w-8 h-8 mr-3">
                                        <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                                        <AvatarFallback>{getUserInitials(currentUser?.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left">
                                        <p className="text-sm font-medium truncate max-w-[120px]">
                                            {currentUser?.name || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {userType === 'agent' ? t('nav.propertyAgent') : t(`nav.${userType}`)}
                                        </p>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>{t('dashboard.common.myAccount')}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={localizedPath(getProfileRoute())} className="flex items-center cursor-pointer">
                                        <User className="w-4 h-4 mr-2" />
                                        {t('dashboard.common.profile')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={localizedPath(getSettingsRoute())} className="flex items-center cursor-pointer">
                                        <Settings className="w-4 h-4 mr-2" />
                                        {t('dashboard.common.settings')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="text-red-600 cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    {t('auth.signOut')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:ml-64">
                {/* Top bar */}
                <header className="bg-white shadow-sm border-b">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden"
                            >
                                <Menu className="w-4 h-4" />
                            </Button>
                            <h1 className="text-xl font-semibold text-gray-900">
                                {getUserTitle()}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <NotificationDropdown userType={userType} />
                            
                            {/* Language Switcher */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2">
                                  <span className="mr-2">{currentLang.flag}</span>
                                  <Globe className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>{t('nav.selectLanguage')}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {languages.map((language) => (
                                  <DropdownMenuItem
                                    key={language.code}
                                    onClick={() => handleLanguageChange(language)}
                                    className="flex items-center justify-between cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{language.flag}</span>
                                      <span>{language.name}</span>
                                    </div>
                                    {currentLang.code === language.code && (
                                      <Check className="w-4 h-4 text-plp-purple" />
                                    )}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <Link href={`/${currentLocale}`}>
                                <Button variant="outline" size="sm">
                                    {t('dashboard.common.backToSite')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}