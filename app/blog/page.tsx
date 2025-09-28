'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Filter, Calendar, User, ArrowRight, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';

// Mock blog posts data
const mockBlogPosts = [
  {
    id: '1',
    title: {
      en: 'Top 10 Luxury Properties for Your Next Vacation',
      fr: 'Top 10 des Propriétés de Luxe pour Vos Prochaines Vacances'
    },
    excerpt: {
      en: 'Discover the most exclusive and luxurious properties around the world that will make your vacation unforgettable.',
      fr: 'Découvrez les propriétés les plus exclusives et luxueuses du monde qui rendront vos vacances inoubliables.'
    },
    author: 'Sarah Johnson',
    category: 'luxury',
    publishDate: '2024-02-15',
    readTime: 8,
    views: 2450,
    featured: true,
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
    tags: ['luxury', 'vacation', 'travel'],
  },
  {
    id: '2',
    title: {
      en: 'Investment Guide: Real Estate in Emerging Markets',
      fr: 'Guide d\'Investissement: Immobilier dans les Marchés Émergents'
    },
    excerpt: {
      en: 'Learn about profitable real estate investment opportunities in emerging markets and how to maximize your returns.',
      fr: 'Apprenez sur les opportunités d\'investissement immobilier rentables dans les marchés émergents et comment maximiser vos rendements.'
    },
    author: 'Michael Chen',
    category: 'investment',
    publishDate: '2024-02-12',
    readTime: 12,
    views: 1890,
    featured: false,
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
    tags: ['investment', 'real estate', 'finance'],
  },
  {
    id: '3',
    title: {
      en: 'Travel Tips: Making the Most of Your Property Stay',
      fr: 'Conseils de Voyage: Profiter au Maximum de Votre Séjour'
    },
    excerpt: {
      en: 'Expert tips for getting the best experience from your property rental and creating lasting memories.',
      fr: 'Conseils d\'experts pour obtenir la meilleure expérience de votre location et créer des souvenirs durables.'
    },
    author: 'Emma Rodriguez',
    category: 'travel',
    publishDate: '2024-02-10',
    readTime: 6,
    views: 1650,
    featured: false,
    image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
    tags: ['travel', 'tips', 'guide'],
  },
  {
    id: '4',
    title: {
      en: 'Sustainable Tourism: Eco-Friendly Property Choices',
      fr: 'Tourisme Durable: Choix de Propriétés Écologiques'
    },
    excerpt: {
      en: 'Explore how to make environmentally conscious choices when booking properties for your travels.',
      fr: 'Explorez comment faire des choix respectueux de l\'environnement lors de la réservation de propriétés pour vos voyages.'
    },
    author: 'David Kim',
    category: 'sustainability',
    publishDate: '2024-02-08',
    readTime: 10,
    views: 1320,
    featured: true,
    image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
    tags: ['sustainability', 'eco-friendly', 'travel'],
  },
  {
    id: '5',
    title: {
      en: 'Host Success Stories: Building a Profitable Property Business',
      fr: 'Histoires de Succès d\'Hôtes: Construire une Entreprise Immobilière Rentable'
    },
    excerpt: {
      en: 'Learn from successful hosts who have built thriving property rental businesses on our platform.',
      fr: 'Apprenez des hôtes qui ont réussi à construire des entreprises de location immobilière prospères sur notre plateforme.'
    },
    author: 'Lisa Wang',
    category: 'hosting',
    publishDate: '2024-02-05',
    readTime: 15,
    views: 2100,
    featured: false,
    image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
    tags: ['hosting', 'business', 'success'],
  },
];

const categories = [
  { value: 'all', label: { en: 'All Categories', fr: 'Toutes les Catégories' } },
  { value: 'luxury', label: { en: 'Luxury', fr: 'Luxe' } },
  { value: 'investment', label: { en: 'Investment', fr: 'Investissement' } },
  { value: 'travel', label: { en: 'Travel', fr: 'Voyage' } },
  { value: 'hosting', label: { en: 'Hosting', fr: 'Hébergement' } },
  { value: 'sustainability', label: { en: 'Sustainability', fr: 'Durabilité' } },
];

export default function BlogPage() {
  const [language, setLanguage] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

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
      title: "Property Insights & Travel Blog",
      subtitle: "Discover expert insights, travel tips, and property investment guides",
      search: "Search articles...",
      sortBy: "Sort by",
      filterBy: "Filter by category",
      readMore: "Read More",
      readTime: "min read",
      views: "views",
      featured: "Featured",
      author: "By",
      sortOptions: {
        newest: "Newest First",
        oldest: "Oldest First",
        popular: "Most Popular",
        trending: "Trending"
      },
      newsletter: {
        title: "Stay Updated",
        description: "Get the latest articles and insights delivered to your inbox",
        placeholder: "Enter your email",
        button: "Subscribe"
      }
    },
    fr: {
      title: "Blog Immobilier & Voyage",
      subtitle: "Découvrez des conseils d'experts, astuces de voyage et guides d'investissement immobilier",
      search: "Rechercher des articles...",
      sortBy: "Trier par",
      filterBy: "Filtrer par catégorie",
      readMore: "Lire Plus",
      readTime: "min de lecture",
      views: "vues",
      featured: "En Vedette",
      author: "Par",
      sortOptions: {
        newest: "Plus Récent",
        oldest: "Plus Ancien",
        popular: "Plus Populaire",
        trending: "Tendance"
      },
      newsletter: {
        title: "Restez Informé",
        description: "Recevez les derniers articles et conseils dans votre boîte mail",
        placeholder: "Entrez votre email",
        button: "S'abonner"
      }
    }
  };

  const currentContent = content[language as keyof typeof content];

  // Filter and sort posts
  const filteredPosts = mockBlogPosts.filter(post => {
    const matchesSearch = post.title[language as keyof typeof post.title].toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt[language as keyof typeof post.excerpt].toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
      case 'popular':
        return b.views - a.views;
      case 'trending':
        return (b.views + b.readTime) - (a.views + a.readTime);
      default: // newest
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    }
  });

  const featuredPosts = sortedPosts.filter(post => post.featured);
  const regularPosts = sortedPosts.filter(post => !post.featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-plp-purple via-plp-pink to-plp-yellow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-white">
                {currentContent.title}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {currentContent.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder={currentContent.search}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder={currentContent.filterBy} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label[language as keyof typeof category.label]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={currentContent.sortBy} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currentContent.sortOptions).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 mb-8">
                <Star className="w-5 h-5 text-plp-yellow fill-current" />
                <h2 className="text-2xl font-bold text-gray-900">{currentContent.featured}</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.slice(0, 2).map((post) => (
                  <Card key={post.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    <div className="relative h-64">
                      <img
                        src={post.image}
                        alt={post.title[language as keyof typeof post.title]}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-plp-yellow text-black">
                          <Star className="w-3 h-3 mr-1" />
                          {currentContent.featured}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                            {post.title[language as keyof typeof post.title]}
                          </h3>
                          <p className="text-gray-600 line-clamp-3">
                            {post.excerpt[language as keyof typeof post.excerpt]}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {currentContent.author} {post.author}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(post.publishDate)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>{post.readTime} {currentContent.readTime}</span>
                            <span>•</span>
                            <span>{post.views} {currentContent.views}</span>
                          </div>
                        </div>
                        
                        <Link href={`/blog/${post.id}`}>
                          <Button className="w-full btn-primary group">
                            {currentContent.readMore}
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Regular Posts */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
                  <div className="relative h-48">
                    <img
                      src={post.image}
                      alt={post.title[language as keyof typeof post.title]}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-plp-purple/90 text-white">
                        {categories.find(c => c.value === post.category)?.label[language as keyof typeof categories[0]['label']]}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-plp-purple transition-colors">
                          {post.title[language as keyof typeof post.title]}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {post.excerpt[language as keyof typeof post.excerpt]}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{post.readTime} {currentContent.readTime}</span>
                          <span>•</span>
                          <span>{formatDate(post.publishDate)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Link href={`/blog/${post.id}`}>
                        <Button variant="outline" className="w-full group-hover:bg-plp-purple group-hover:text-white transition-colors">
                          {currentContent.readMore}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-plp-purple">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-2xl mx-auto shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-plp-yellow/20 rounded-2xl flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8 text-plp-yellow" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {currentContent.newsletter.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {currentContent.newsletter.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder={currentContent.newsletter.placeholder}
                    className="flex-1"
                  />
                  <Button className="btn-primary">
                    {currentContent.newsletter.button}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* No Results */}
        {sortedPosts.length === 0 && (
          <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'fr' ? 'Aucun article trouvé' : 'No articles found'}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'fr' 
                      ? 'Essayez d\'ajuster vos critères de recherche.'
                      : 'Try adjusting your search criteria.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}