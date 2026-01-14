'use client'

import React, { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { SignInClient } from '../signin-client';

function SignInLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-plp-purple/5 via-white to-plp-pink/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-xl border-0 p-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                        <div className="space-y-3 mt-6">
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<SignInLoading />}>
            <SignInClient />
        </Suspense>
    );
}