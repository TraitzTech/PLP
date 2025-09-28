'use client';

import React, { useState, useEffect } from 'react';
import { Users, Target, Award, Heart, Globe, Shield, ChevronRight, Mail, Phone, MapPin } from 'lucide-react';
import {Navbar} from "@/components/navigation/navbar";
import {Footer} from "@/components/navigation/footer";

export default function AboutPage() {
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

  const content = {
    en: {
      title: "About PLP",
      subtitle: "Revolutionizing the way you find and book premium properties worldwide",
      mission: {
        title: "Our Mission",
        description: "To connect travelers with exceptional properties while empowering hosts to share their unique spaces with the world."
      },
      vision: {
        title: "Our Vision",
        description: "To become the world's most trusted platform for premium property rentals, creating unforgettable experiences for guests and sustainable income for hosts."
      },
      values: {
        title: "Our Values",
        items: [
          {
            icon: Heart,
            title: "Trust & Safety",
            description: "We prioritize the safety and security of our community above all else."
          },
          {
            icon: Globe,
            title: "Global Community",
            description: "We celebrate diversity and foster connections across cultures and borders."
          },
          {
            icon: Shield,
            title: "Quality Assurance",
            description: "We maintain the highest standards for properties and user experiences."
          },
          {
            icon: Award,
            title: "Excellence",
            description: "We strive for excellence in everything we do, from technology to customer service."
          }
        ]
      },
      stats: {
        title: "Our Impact",
        items: [
          { number: "50K+", label: "Properties Listed" },
          { number: "2M+", label: "Happy Guests" },
          { number: "100+", label: "Countries" },
          { number: "4.9", label: "Average Rating" }
        ]
      },
      team: {
        title: "Meet Our Team",
        description: "Passionate professionals dedicated to creating exceptional experiences",
        members: [
          {
            name: "Sarah Johnson",
            role: "CEO & Founder",
            bio: "Former hospitality executive with 15+ years of experience in luxury travel."
          },
          {
            name: "Michael Chen",
            role: "CTO",
            bio: "Tech visionary who previously led engineering teams at major travel platforms."
          },
          {
            name: "Emma Rodriguez",
            role: "Head of Operations",
            bio: "Operations expert focused on scaling quality experiences globally."
          },
          {
            name: "David Kim",
            role: "Head of Design",
            bio: "Award-winning designer passionate about creating intuitive user experiences."
          }
        ]
      },
      timeline: {
        title: "Our Journey",
        events: [
          {
            year: "2020",
            title: "Company Founded",
            description: "PLP was born from a vision to revolutionize property rentals."
          },
          {
            year: "2021",
            title: "First 1,000 Properties",
            description: "Reached our first milestone with premium properties across 20 countries."
          },
          {
            year: "2022",
            title: "Series A Funding",
            description: "Secured $50M in Series A funding to accelerate global expansion."
          },
          {
            year: "2023",
            title: "AI Integration",
            description: "Launched AI-powered matching system for personalized recommendations."
          },
          {
            year: "2024",
            title: "Global Expansion",
            description: "Now serving 100+ countries with 50,000+ premium properties."
          }
        ]
      },
      cta: {
        title: "Ready to Experience PLP?",
        description: "Join millions of travelers who trust PLP for their accommodation needs.",
        button: "Start Your Journey"
      }
    },
    fr: {
      title: "À Propos de PLP",
      subtitle: "Révolutionner la façon dont vous trouvez et réservez des propriétés premium dans le monde entier",
      mission: {
        title: "Notre Mission",
        description: "Connecter les voyageurs avec des propriétés exceptionnelles tout en permettant aux hôtes de partager leurs espaces uniques avec le monde."
      },
      vision: {
        title: "Notre Vision",
        description: "Devenir la plateforme la plus fiable au monde pour les locations de propriétés premium, créant des expériences inoubliables pour les clients et des revenus durables pour les hôtes."
      },
      values: {
        title: "Nos Valeurs",
        items: [
          {
            icon: Heart,
            title: "Confiance & Sécurité",
            description: "Nous priorisons la sécurité de notre communauté avant tout."
          },
          {
            icon: Globe,
            title: "Communauté Mondiale",
            description: "Nous célébrons la diversité et favorisons les connexions entre cultures et frontières."
          },
          {
            icon: Shield,
            title: "Assurance Qualité",
            description: "Nous maintenons les plus hauts standards pour les propriétés et expériences utilisateur."
          },
          {
            icon: Award,
            title: "Excellence",
            description: "Nous visons l'excellence dans tout ce que nous faisons, de la technologie au service client."
          }
        ]
      },
      stats: {
        title: "Notre Impact",
        items: [
          { number: "50K+", label: "Propriétés Listées" },
          { number: "2M+", label: "Clients Satisfaits" },
          { number: "100+", label: "Pays" },
          { number: "4.9", label: "Note Moyenne" }
        ]
      },
      team: {
        title: "Rencontrez Notre Équipe",
        description: "Des professionnels passionnés dédiés à créer des expériences exceptionnelles",
        members: [
          {
            name: "Sarah Johnson",
            role: "PDG & Fondatrice",
            bio: "Ancienne dirigeante de l'hôtellerie avec plus de 15 ans d'expérience dans le voyage de luxe."
          },
          {
            name: "Michael Chen",
            role: "Directeur Technique",
            bio: "Visionnaire technologique qui a dirigé des équipes d'ingénierie sur de grandes plateformes de voyage."
          },
          {
            name: "Emma Rodriguez",
            role: "Directrice des Opérations",
            bio: "Experte en opérations axée sur la mise à l'échelle d'expériences de qualité à l'échelle mondiale."
          },
          {
            name: "David Kim",
            role: "Directeur du Design",
            bio: "Designer primé passionné par la création d'expériences utilisateur intuitives."
          }
        ]
      },
      timeline: {
        title: "Notre Parcours",
        events: [
          {
            year: "2020",
            title: "Fondation de l'Entreprise",
            description: "PLP est né d'une vision de révolutionner les locations de propriétés."
          },
          {
            year: "2021",
            title: "Premières 1 000 Propriétés",
            description: "Atteint notre premier jalon avec des propriétés premium dans 20 pays."
          },
          {
            year: "2022",
            title: "Financement Série A",
            description: "Sécurisé 50M$ en financement Série A pour accélérer l'expansion mondiale."
          },
          {
            year: "2023",
            title: "Intégration IA",
            description: "Lancé un système de correspondance alimenté par l'IA pour des recommandations personnalisées."
          },
          {
            year: "2024",
            title: "Expansion Mondiale",
            description: "Maintenant présent dans 100+ pays avec 50 000+ propriétés premium."
          }
        ]
      },
      cta: {
        title: "Prêt à Découvrir PLP ?",
        description: "Rejoignez des millions de voyageurs qui font confiance à PLP pour leurs besoins d'hébergement.",
        button: "Commencez Votre Voyage"
      }
    }
  };

  const currentContent = content[language as keyof typeof content];

  return (
    <div className="min-h-screen bg-white">
        <Navbar />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 text-white py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {currentContent.title}
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto opacity-90">
            {currentContent.subtitle}
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
                {currentContent.mission.title}
              </h2>
              <p className="text-lg text-gray-600">
                {currentContent.mission.description}
              </p>
            </div>
            <div className="text-center">
              <Users className="w-16 h-16 text-pink-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {currentContent.vision.title}
              </h2>
              <p className="text-lg text-gray-600">
                {currentContent.vision.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            {currentContent.values.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {currentContent.values.items.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <IconComponent className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
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
            {currentContent.stats.title}
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {currentContent.stats.items.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-yellow-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg text-gray-600">
                  {stat.label}
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
              {currentContent.team.title}
            </h2>
            <p className="text-xl text-gray-600">
              {currentContent.team.description}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {currentContent.team.members.map((member, index) => (
              <div key={index} className="text-center bg-white p-6 rounded-xl shadow-lg">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-yellow-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            {currentContent.timeline.title}
          </h2>
          <div className="space-y-8">
            {currentContent.timeline.events.map((event, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {event.year}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {currentContent.cta.title}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {currentContent.cta.description}
          </p>
          <button className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2">
            <span>{currentContent.cta.button}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>
        <Footer />
    </div>
  );
}