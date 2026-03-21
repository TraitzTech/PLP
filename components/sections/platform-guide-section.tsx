'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarCheck2, CreditCard, LocateFixed, MessagesSquare, ShieldCheck, Wand2 } from 'lucide-react';
import { settingsService, type PublicSettings } from '@/services/settingsService';
import { searchAnalyticsService, type PopularSearchItem } from '@/services/searchAnalyticsService';

const stepIcons = [LocateFixed, CalendarCheck2, CreditCard, MessagesSquare];

type GuideStep = {
  title: string;
  description: string;
  accent?: string;
};

type PopularSearch = {
  label: string;
  link?: string;
  count?: number;
};

function toStep(item: any, index: number): GuideStep {
  return {
    title: String(item?.title || `Step ${index + 1}`),
    description: String(item?.description || ''),
    accent: String(item?.accent || `Step ${index + 1}`),
  };
}

function toSearch(item: any): PopularSearch {
  return {
    label: String(item?.label || ''),
    link: String(item?.link || ''),
    count: Number(item?.count || 0),
  };
}

export function PlatformGuideSection({ showPopularSearches = false }: { showPopularSearches?: boolean }) {
  const [settings, setSettings] = useState<PublicSettings>({});
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await settingsService.getPublicSettings([
        'platform_how_steps_title',
        'platform_how_steps_description',
        'platform_how_steps_items',
        'platform_popular_searches_title',
      ]);
      setSettings(data || {});

      if (showPopularSearches) {
        const popular = await searchAnalyticsService.getPopularSearches(5);
        const normalized = Array.isArray(popular)
          ? popular.map((item: PopularSearchItem) => toSearch(item)).filter((item) => item.label)
          : [];
        setPopularSearches(normalized.slice(0, 5));
      }
    };

    load();
  }, []);

  const steps = useMemo(() => {
    const source = Array.isArray(settings.platform_how_steps_items)
      ? settings.platform_how_steps_items
      : [];

    if (source.length > 0) {
      return source.map((item, index) => toStep(item, index));
    }

    return [
      { title: 'Search', description: 'Use filters for city, price, and property type to quickly find the right listing.', accent: 'Step 1' },
      { title: 'Identify', description: 'Open the listing details, verify photos and features, and compare options.', accent: 'Step 2' },
      { title: 'Contact Agent', description: 'Reach out instantly through WhatsApp or direct contact details on the listing.', accent: 'Step 3' },
      { title: 'Book or Proceed', description: 'Confirm your booking or continue the deal process safely with the provider.', accent: 'Step 4' },
    ];
  }, [settings.platform_how_steps_items]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-16 text-white sm:px-6 lg:px-12">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, #6366f1, transparent 25%), radial-gradient(circle at 80% 0%, #a855f7, transparent 20%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">How It Works</p>
            <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              {String(settings.platform_how_steps_title || 'How the Platform Works')}
            </h2>
            <p className="mt-3 max-w-2xl text-indigo-100">
              {String(
                settings.platform_how_steps_description ||
                  'From search to booking, discover properties with a simple and transparent process.'
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <span className="text-sm text-indigo-100">Trusted and transparent process</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = stepIcons[index] || Wand2;
            return (
              <div key={`${step.title}-${index}`} className="group relative h-full rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wide text-indigo-200">{step.accent || `Step ${index + 1}`}</span>
                  <Wand2 className="h-4 w-4 text-indigo-200 opacity-70" />
                </div>
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-indigo-500/20 p-3 text-indigo-100">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-indigo-100">{step.description}</p>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-emerald-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              </div>
            );
          })}
        </div>

        {showPopularSearches && (
          <div className="mt-12 rounded-2xl border border-white/15 bg-white/5 p-6">
            <h3 className="text-2xl font-bold text-white">
              {String(settings.platform_popular_searches_title || 'Popular Searches')}
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {popularSearches.length > 0 ? (
                popularSearches.map((item, index) => (
                  <Link
                    key={`${item.label}-${index}`}
                    href={item.link || '/search'}
                    className="group flex items-center justify-between rounded-xl border border-white/15 bg-white/10 px-4 py-3 transition hover:border-white/30 hover:bg-white/15"
                  >
                    <span className="text-sm font-medium text-indigo-50">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-indigo-200">{item.count || 0} searches</span>
                      <ArrowRight className="h-4 w-4 text-indigo-200 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-indigo-100">
                  Popular searches will appear automatically after users start searching.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
