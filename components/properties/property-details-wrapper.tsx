"use client";

import { PropertyDetailsClient } from '@/components/properties/property-details-client';
import { useState, useEffect } from 'react';

interface PropertyDetailsWrapperProps {
    property: any;
    similarProperties: any[];
    reviews: any[];
}

export function PropertyDetailsWrapper({
                                           property,
                                           similarProperties,
                                           reviews
                                       }: PropertyDetailsWrapperProps) {
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language') || 'en';
        setLanguage(savedLanguage);

        const handleLanguageChange = () => {
            const currentLanguage = localStorage.getItem('language') || 'en';
            setLanguage(currentLanguage);
        };

        window.addEventListener('languageChanged', handleLanguageChange);
        return () => window.removeEventListener('languageChanged', handleLanguageChange);
    }, []);

    return (
        <PropertyDetailsClient
            property={property}
            similarProperties={similarProperties}
            reviews={reviews}
            language={language}
        />
    );
}