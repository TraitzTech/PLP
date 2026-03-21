'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from "@/services/authService";
import { AuthGuard } from '@/components/auth/auth-guard';

type ValidationErrors = {
    email?: string;
    password?: string;
    [key: string]: string | undefined;
};

function mapApiErrorsToFields(rawErrors: any): ValidationErrors {
    if (!rawErrors) return {};

    const next: ValidationErrors = {};

    if (Array.isArray(rawErrors)) {
        if (rawErrors[0]) {
            next.email = String(rawErrors[0]);
        }
        return next;
    }

    if (typeof rawErrors === 'object') {
        Object.entries(rawErrors).forEach(([key, value]) => {
            if (Array.isArray(value) && value[0]) {
                next[key] = String(value[0]);
            } else if (typeof value === 'string') {
                next[key] = value;
            }
        });
    }

    return next;
}

export function SignInClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const userType = searchParams?.get('type') || 'customer';
    const redirectUrl = searchParams?.get('redirect');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });

    const locale = pathname?.split('/').filter(Boolean)[0] || 'en';
    const withLocale = (path: string) => `/${locale}${path}`;

    const getDashboardPathByRole = (role?: string | null) => {
        switch (role) {
            case 'admin':
                return withLocale('/admin');
            case 'agent':
                return withLocale('/dashboard/agent');
            default:
                return withLocale('/dashboard');
        }
    };

    const isRedirectAllowedForRole = (path: string, role?: string | null) => {
        const cleanedPath = path.startsWith('/') ? path : `/${path}`;
        const segments = cleanedPath.split('/').filter(Boolean);
        const pathWithoutLocale = segments[0]?.length === 2
            ? `/${segments.slice(1).join('/')}`
            : cleanedPath;

        if (role === 'admin') {
            return pathWithoutLocale.startsWith('/admin');
        }

        if (role === 'agent') {
            return pathWithoutLocale.startsWith('/dashboard/agent');
        }

        return pathWithoutLocale.startsWith('/dashboard')
            && !pathWithoutLocale.startsWith('/dashboard/agent')
            && !pathWithoutLocale.startsWith('/dashboard/owner');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setErrors({});

        setIsLoading(true);

        try {
            const loginResponse = await authService.login({
                email: formData.email,
                password: formData.password,
                remember: formData.rememberMe,
                expected_user_type: userType as 'admin' | 'agent' | 'customer',
            });
            const currentUser = await authService.getCurrentUser();
            const resolvedUserType =
                currentUser?.user_type
                || (loginResponse as any)?.user?.user_type
                || (loginResponse as any)?.data?.user?.user_type
                || null;

            toast.success('Welcome back!');

            if (redirectUrl && isRedirectAllowedForRole(redirectUrl, resolvedUserType)) {
                router.push(redirectUrl);
                return;
            }

            if (redirectUrl) {
                toast.info('Redirect updated for your account role.');
            }

            router.push(getDashboardPathByRole(resolvedUserType));
        } catch (error: any) {
            console.error("Login failed:", error);
            const errorMessage = error?.data?.message || error?.message || 'Login failed. Please try again.';
            toast.error(errorMessage);

            // Set validation errors if available
            setErrors(mapApiErrorsToFields(error?.data?.errors || error?.errors));
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    return (
        <AuthGuard redirectAuthenticated>
        <div className="min-h-screen bg-gradient-to-br from-plp-purple/5 via-white to-plp-pink/5 flex flex-col">
            {/* Header */}
            <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Logo />
                    <Link href="/" className="flex items-center gap-1 text-gray-600 hover:text-plp-purple transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Card className="shadow-xl border-0">
                        <CardHeader className="space-y-2 pb-6">
                            <CardTitle className="text-2xl font-bold text-center">
                                Sign In
                            </CardTitle>
                            <CardDescription className="text-center">
                                Sign in as{' '}
                                <span className="font-semibold capitalize text-gray-900">
                                    {userType === 'admin' ? 'Administrator' : userType}
                                </span>
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-plp-purple" />
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className={errors.email ? 'border-red-500' : ''}
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-plp-purple" />
                                            Password
                                        </Label>
                                        <Link
                                            href="/auth/forgot-password"
                                            className="text-sm text-plp-purple hover:underline"
                                        >
                                            Forgot?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className={errors.password ? 'border-red-500' : ''}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={isLoading}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="rememberMe"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onCheckedChange={(checked) =>
                                            setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                                        }
                                        disabled={isLoading}
                                    />
                                    <label
                                        htmlFor="rememberMe"
                                        className="text-sm text-gray-600 cursor-pointer hover:text-gray-900"
                                    >
                                        Remember me
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full btn-primary"
                                >
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="my-6 flex items-center gap-4">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-sm text-gray-500">or</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            {/* Sign Up Link */}
                            <p className="text-center text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link
                                    href={`/auth/signup?type=${userType}`}
                                    className="font-semibold text-plp-purple hover:underline"
                                >
                                    Sign up here
                                </Link>
                            </p>

                            {/* Type Selector */}
                            <div className="mt-6 pt-6 border-t space-y-2">
                                <p className="text-xs text-gray-500 font-medium">Sign in as different user type:</p>
                                <div className="flex gap-2">
                                    <Link
                                        href="/auth/signin?type=customer"
                                        className={`flex-1 text-xs py-2 px-3 rounded-md text-center transition-colors ${
                                            userType === 'customer'
                                                ? 'bg-plp-purple text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Customer
                                    </Link>
                                    <Link
                                        href="/auth/signin?type=agent"
                                        className={`flex-1 text-xs py-2 px-3 rounded-md text-center transition-colors ${
                                            userType === 'agent'
                                                ? 'bg-plp-purple text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <MapPin className="w-3 h-3 inline mr-1" />
                                        Agent
                                    </Link>
                                    <Link
                                        href="/auth/signin?type=admin"
                                        className={`flex-1 text-xs py-2 px-3 rounded-md text-center transition-colors ${
                                            userType === 'admin'
                                                ? 'bg-plp-purple text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Admin
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        </AuthGuard>
    );
}
