'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, Target, Award, Heart, Globe, Shield, ChevronRight } from 'lucide-react';
import {Navbar} from "@/components/navigation/navbar";
import {Footer} from "@/components/navigation/footer";
import { PlatformGuideSection } from '@/components/sections/platform-guide-section';
import { useTranslations } from '@/components/translation-provider';
import { settingsService, type PublicSettings } from '@/services/settingsService';

const valueIcons = [Heart, Globe, Shield, Award];

export default function AboutPage() {
  const t = useTranslations();
  const [aboutSettings, setAboutSettings] = useState<PublicSettings>({});

  useEffect(() => {
    const loadAboutSettings = async () => {
      const settings = await settingsService.getPublicSettings([
        'about_mission_title',
        'about_mission_description',
        'about_vision_title',
        'about_vision_description',
        'about_journey_title',
        'about_journey_items',
        'about_team_title',
        'about_team_description',
        'about_team_members',
        'about_stats_items',
        'about_cta_title',
        'about_cta_description',
        'about_cta_button_text',
        'about_cta_button_link',
      ]);
      setAboutSettings(settings || {});
    };

    loadAboutSettings();
  }, []);

  const statsItems = useMemo(() => {
    const fromSettings = Array.isArray(aboutSettings.about_stats_items)
      ? aboutSettings.about_stats_items
      : [];

    if (fromSettings.length > 0) {
      return fromSettings.map((item) => ({
        number: String(item?.number || ''),
        label: String(item?.label || ''),
      }));
    }

    return [0, 1, 2, 3].map((index) => ({
      number: t(`about.stats.${index}.number`),
      label: t(`about.stats.${index}.label`),
    }));
  }, [aboutSettings.about_stats_items, t]);

  const teamMembers = useMemo(() => {
    const fromSettings = Array.isArray(aboutSettings.about_team_members)
      ? aboutSettings.about_team_members
      : [];

    if (fromSettings.length > 0) {
      return fromSettings.map((member, index) => ({
        id: `${member?.name || 'member'}-${index}`,
        name: String(member?.name || `Team Member ${index + 1}`),
        role: String(member?.role || ''),
        description: String(member?.description || ''),
        image: String(member?.image || ''),
        link: String(member?.link || ''),
      }));
    }

    return [0, 1, 2, 3].map((index) => ({
      id: `fallback-${index}`,
      name: t(`about.team.${index}.name`),
      role: t(`about.team.${index}.role`),
      description: t(`about.team.${index}.bio`),
      image: '',
      link: '',
    }));
  }, [aboutSettings.about_team_members, t]);

  const journeyItems = useMemo(() => {
    const fromSettings = Array.isArray(aboutSettings.about_journey_items)
      ? aboutSettings.about_journey_items
      : [];

    if (fromSettings.length > 0) {
      return fromSettings.map((item, index) => ({
        id: `${item?.year || 'year'}-${index}`,
        year: String(item?.year || ''),
        title: String(item?.title || ''),
        description: String(item?.description || ''),
      }));
    }

    return [0, 1, 2, 3, 4].map((index) => ({
      id: `timeline-${index}`,
      year: t(`about.timeline.${index}.year`),
      title: t(`about.timeline.${index}.title`),
      description: t(`about.timeline.${index}.description`),
    }));
  }, [aboutSettings.about_journey_items, t]);

  const ctaLink = String(aboutSettings.about_cta_button_link || '/search');

  return (
    <div className="min-h-screen bg-white">
        <Navbar />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 text-white py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {t('about.title')}
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto opacity-90">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="text-center">
              <Target className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {aboutSettings.about_mission_title || t('about.mission.title')}
              </h2>
              <p className="text-lg text-gray-600">
                {aboutSettings.about_mission_description || t('about.mission.description')}
              </p>
            </div>
            <div className="text-center">
              <Users className="w-16 h-16 text-pink-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {aboutSettings.about_vision_title || t('about.vision.title')}
              </h2>
              <p className="text-lg text-gray-600">
                {aboutSettings.about_vision_description || t('about.vision.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            {t('about.values.title')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[0, 1, 2, 3].map((index) => {
              const IconComponent = valueIcons[index];
              return (
                <div key={index} className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <IconComponent className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t(`about.values.${index}.title`)}
                  </h3>
                  <p className="text-gray-600">
                    {t(`about.values.${index}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            {t('about.stats.title')}
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {statsItems.map((item, index) => (
              <div key={`stat-${index}`} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-yellow-500 mb-2">
                  {item.number}
                </div>
                <div className="text-lg text-gray-600">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {aboutSettings.about_team_title || t('about.team.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {aboutSettings.about_team_description || t('about.team.description')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => {
              const initials = member.name
                .split(' ')
                .map((n) => n?.[0] || '')
                .join('')
                .slice(0, 2)
                .toUpperCase();

              const content = (
                <div className="text-center bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow h-full">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                      {initials}
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-yellow-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              );

              if (member.link) {
                return (
                  <a key={member.id} href={member.link} target="_blank" rel="noreferrer" className="block">
                    {content}
                  </a>
                );
              }

              return <div key={member.id}>{content}</div>;
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            {aboutSettings.about_journey_title || t('about.timeline.title')}
          </h2>
          <div className="space-y-8">
            {journeyItems.map((item) => (
              <div key={item.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {item.year}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PlatformGuideSection />

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {aboutSettings.about_cta_title || t('about.cta.title')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {aboutSettings.about_cta_description || t('about.cta.description')}
          </p>
          <Link href={ctaLink} className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2">
            <span>{aboutSettings.about_cta_button_text || t('about.cta.button')}</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
        <Footer />
    </div>
  );
}