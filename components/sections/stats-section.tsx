'use client'

import { useTranslations } from '@/components/translation-provider';

export function StatsSection() {
  const t = useTranslations();

  return (
    <section className="py-20 bg-gradient-to-r from-plp-purple via-plp-pink to-plp-yellow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="mx-auto max-w-4xl text-3xl sm:text-5xl font-bold text-white">
          {t('stats.title')}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-xl text-white/90">
          {t('stats.subtitle')}
        </p>
      </div>
    </section>
  );
}
