'use client'

import React, { useEffect, useState } from 'react';
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
import { Chrome as Home, Calendar, Heart, MessageSquare, Settings, User, LogOut, Menu, X, Building2, ChartBar as BarChart3, Plus, Users, Shield, Bell, Star } from 'lucide-react';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';

interface DashboardLayoutProps {
    children: React.ReactNode;
    userType: 'customer' | 'owner' | 'agent' | 'admin';
}

const customerNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Bookings', href: '/dashboard/bookings', icon: Calendar },
    { name: 'Saved Properties', href: '/dashboard/saved', icon: Heart },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const ownerNavItems = [
    { name: 'Dashboard', href: '/dashboard/owner', icon: Home },
    { name: 'My Properties', href: '/dashboard/owner/properties', icon: Building2 },
    { name: 'Add Property', href: '/dashboard/owner/properties/new', icon: Plus },
    { name: 'Bookings', href: '/dashboard/owner/bookings', icon: Calendar },
    { name: 'Analytics', href: '/dashboard/owner/analytics', icon: BarChart3 },
    { name: 'Messages', href: '/dashboard/owner/messages', icon: MessageSquare },
    { name: 'Profile', href: '/dashboard/owner/profile', icon: User },
    { name: 'Settings', href: '/dashboard/owner/settings', icon: Settings },
];

const agentNavItems = [
    { name: 'Dashboard', href: '/dashboard/agent', icon: Home },
    { 
        name: 'Properties',
        icon: Building2,
        submenu: [
            { name: 'My Properties', href: '/dashboard/agent/properties' },
        ]
    },
    { name: 'Add Property', href: '/dashboard/agent/properties/new', icon: Plus },
    { name: 'Bookings', href: '/dashboard/agent/bookings', icon: Calendar },
    { name: 'Clients', href: '/dashboard/agent/clients', icon: Users },
    { name: 'Analytics', href: '/dashboard/agent/analytics', icon: BarChart3 },
    { name: 'Messages', href: '/dashboard/agent/messages', icon: MessageSquare },
    { name: 'Subscription', href: '/dashboard/agent/subscription', icon: Star },
    { name: 'Profile', href: '/dashboard/agent/profile', icon: User },
    { name: 'Settings', href: '/dashboard/agent/settings', icon: Settings },
];

const adminNavItems = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Users', href: '/admin/users', icon: Users },
    {
        name: 'Agents',
        icon: Shield,
        submenu: [
            { name: 'All Agents', href: '/admin/agents' },
            { name: 'Pending Approvals', href: '/admin/agents/pending' },
        ]
    },
    { 
        name: 'Properties',
        icon: Building2,
        submenu: [
            { name: 'All Properties', href: '/admin/properties' },
            { name: 'Property Types', href: '/admin/property-types' },
            { name: 'Facilities', href: '/admin/facilities' },
        ]
    },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Blog', href: '/admin/blog', icon: FileText },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: Star },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function DashboardLayout({ children, userType }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const isAuthed = await authService.isAuthenticated();
                if (!isAuthed) {
                    const segments = pathname.split('/').filter(Boolean);
                    const locale = segments[0] || 'en';
                    router.replace(`/${locale}`);
                }
            } catch (e) {
                const segments = pathname.split('/').filter(Boolean);
                const locale = segments[0] || 'en';
                router.replace(`/${locale}`);
            }
        };
        checkAuth();
    }, [pathname]);

    const navItems = userType === 'customer' ? customerNavItems :
        userType === 'owner' ? ownerNavItems :
            userType === 'agent' ? agentNavItems : adminNavItems;

    const getUserTitle = () => {
        switch (userType) {
            case 'customer': return 'Customer Dashboard';
            case 'owner': return 'Owner Dashboard';
            case 'agent': return 'Agent Dashboard';
            case 'admin': return 'Admin Dashboard';
            default: return 'Dashboard';
        }
    };

    const getProfileRoute = () => {
        switch (userType) {
            case 'customer': return '/dashboard/profile';
            case 'owner': return '/dashboard/owner/profile';
            case 'agent': return '/dashboard/agent/profile';
            case 'admin': return '/admin/profile';
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
            toast.success('Logged out successfully');
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Failed to logout');
        }
    };

    const currentUser = {
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
    };

    const getUserInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

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
                    <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
                        <div onClick={() => setSidebarOpen(false)}>
                            <Logo />
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
                            const isActive = item.href ? (pathname === item.href || pathname.startsWith(item.href + '/')) : false;
                            const isSubmenuActive = hasSubmenu && item.submenu.some((subitem: any) => pathname === subitem.href || pathname.startsWith(subitem.href + '/'));

                            if (hasSubmenu) {
                                return (
                                    <div key={item.name}>
                                        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-default ${
                                            isSubmenuActive
                                                ? 'bg-plp-purple text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}>
                                            <Icon className="w-4 h-4" />
                                            {item.name}
                                        </div>
                                        <div className="ml-6 space-y-1 mt-1">
                                            {item.submenu.map((subitem: any) => {
                                                const isSubitemActive = pathname === subitem.href || pathname.startsWith(subitem.href + '/');
                                                return (
                                                    <Link
                                                        key={subitem.name}
                                                        href={subitem.href}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                            isSubitemActive
                                                                ? 'bg-plp-purple text-white'
                                                                : 'text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                        onClick={() => setSidebarOpen(false)}
                                                    >
                                                        {subitem.name}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-plp-purple text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.name}
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
                                        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                        <AvatarFallback>{getUserInitials(currentUser.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left">
                                        <p className="text-sm font-medium truncate max-w-[120px]">
                                            {currentUser.name}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {userType === 'agent' ? 'Property Agent' : userType}
                                        </p>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={getProfileRoute()} className="flex items-center cursor-pointer">
                                        <User className="w-4 h-4 mr-2" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={getSettingsRoute()} className="flex items-center cursor-pointer">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="text-red-600 cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
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
                            <Button variant="ghost" size="sm" className="relative" asChild>
                                <Link href={userType === 'customer' ? '/dashboard/notifications' :
                                    userType === 'owner' ? '/dashboard/owner/notifications' :
                                        userType === 'agent' ? '/dashboard/agent/notifications' : '/admin/notifications'}>
                                    <Bell className="w-4 h-4" />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </Link>
                            </Button>

                            <Link href="/">
                                <Button variant="outline" size="sm">
                                    Back to Site
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