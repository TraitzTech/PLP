'use client'

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, MapPin, Star } from 'lucide-react';
import { useTranslations } from '@/components/translation-provider';

const statIcons = [Building2, Users, MapPin, Star];
const statValues = ['50,000+', '25,000+', '100+', '4.8'];
const statKeys = ['properties', 'customers', 'cities', 'rating'];

export function StatsSection() {
  const t = useTranslations();

  return (
    <section className="py-20 bg-gradient-to-r from-plp-purple via-plp-pink to-plp-yellow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            {t('stats.title')}
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {t('stats.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statKeys.map((key, index) => {
            const Icon = statIcons[index];
            return (
              <Card key={key} className="bg-white/10 backdrop-blur-md border-white/20 text-center">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white/20 p-4 rounded-2xl">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-white">{statValues[index]}</div>
                      <div className="text-lg font-semibold text-white">{t(`stats.${key}.label`)}</div>
                      <div className="text-sm text-white/80">{t(`stats.${key}.description`)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}