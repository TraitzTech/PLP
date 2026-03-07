'use client'

import Link from 'next/link';
import { useTranslations } from '@/components/translation-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { helpArticles } from '@/lib/help/articles';
import { Search, BookOpen, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import React, { useMemo, useState } from 'react';

export default function HelpCenterPage() {
  const t = useTranslations();
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return helpArticles;
    return helpArticles.filter(a => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q));
  }, [query]);

  const categories = Array.from(new Set(helpArticles.map(a => a.category)));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-sm text-plp-purple bg-plp-purple/10 px-3 py-1 rounded-full">
          <HelpCircle className="w-4 h-4" /> {t('help.badge')}
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">{t('help.title')}</h1>
        <p className="mt-2 text-gray-600">{t('help.subtitle')}</p>
      </div>

      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={t('help.searchPlaceholder')} className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {categories.map(cat => (
          <Card key={cat}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <BookOpen className="w-5 h-5 text-plp-pink" /> {cat}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {helpArticles.filter(a => a.category === cat).slice(0,4).map(a => (
                <div key={a.slug} className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`${a.slug}`} className="font-medium text-gray-900 hover:underline">{a.title}</Link>
                    <p className="text-sm text-gray-600 line-clamp-2">{a.summary}</p>
                  </div>
                  <Badge className="bg-plp-yellow/20 text-gray-900">{t('help.updated')} {new Date(a.updatedAt).toLocaleDateString()}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-900 font-medium">{t('help.notFound')}</p>
          <p className="text-gray-600">{t('help.notFoundSub')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
