'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, Search, Filter, Calendar, User, Star, 
  Heart, MessageCircle, Eye
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { blogService, parseTags, type BlogPost } from '@/services/blogService';

const categories = [
  { value: 'all', label: { en: 'All Categories', fr: 'Toutes les Catégories' } },
  { value: 'luxury', label: { en: 'Luxury', fr: 'Luxe' } },
  { value: 'investment', label: { en: 'Investment', fr: 'Investissement' } },
  { value: 'travel', label: { en: 'Travel', fr: 'Voyage' } },
  { value: 'hosting', label: { en: 'Hosting', fr: 'Hébergement' } },
  { value: 'sustainability', label: { en: 'Sustainability', fr: 'Durabilité' } },
  { value: 'general', label: { en: 'General', fr: 'Général' } },
];

export default function BlogPage() {
  const pathname = usePathname();
  const locale = pathname?.startsWith('/fr') ? 'fr' : 'en';

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const content = {
    en: {
      title: "Property Insights & Travel Blog",
      subtitle: "Discover expert insights, travel tips, and property investment guides",
      search: "Search articles...",
      sortBy: "Sort by",
      filterBy: "Filter by category",
      readTime: "min read",
      featured: "Featured",
      noResults: "No articles found",
      noResultsHint: "Try adjusting your search criteria.",
      articles: "articles",
      sortOptions: {
        newest: "Newest First",
        oldest: "Oldest First",
        popular: "Most Popular",
        trending: "Trending",
      },
    },
    fr: {
      title: "Blog Immobilier & Voyage",
      subtitle: "Découvrez des conseils d'experts, astuces de voyage et guides d'investissement immobilier",
      search: "Rechercher des articles...",
      sortBy: "Trier par",
      filterBy: "Filtrer par catégorie",
      readTime: "min de lecture",
      featured: "En Vedette",
      noResults: "Aucun article trouvé",
      noResultsHint: "Essayez d'ajuster vos critères de recherche.",
      articles: "articles",
      sortOptions: {
        newest: "Plus Récent",
        oldest: "Plus Ancien",
        popular: "Plus Populaire",
        trending: "Tendance",
      },
    },
  };

  const t = content[locale as keyof typeof content];

  const loadPosts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await blogService.getPosts({
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sort: sortBy as any,
        page: pageNum,
        per_page: 12,
      });
      
      if (response.success) {
        setPosts(response.data.data);
        setPage(response.data.current_page);
        setLastPage(response.data.last_page);
        setTotal(response.data.total);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, sortBy]);

  const loadFeatured = useCallback(async () => {
    try {
      const response = await blogService.getPosts({ featured: true, per_page: 4 });
      if (response.success) {
        setFeaturedPosts(response.data.data);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPosts(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTitle = (post: BlogPost) => locale === 'fr' && post.title_fr ? post.title_fr : post.title_en;
  const getExcerpt = (post: BlogPost) => locale === 'fr' && post.excerpt_fr ? post.excerpt_fr : post.excerpt_en;

  const PostSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-52 w-full" />
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      
      <div className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-plp-purple via-purple-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-plp-pink/10 rounded-full blur-3xl" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight">{t.title}</h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">{t.subtitle}</p>
              {total > 0 && <p className="text-white/60 text-sm">{total} {t.articles}</p>}
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-11" />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-52 h-11">
                  <Filter className="w-4 h-4 mr-2 text-gray-400" />
                  <SelectValue placeholder={t.filterBy} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label[locale as keyof typeof c.label]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 h-11">
                  <SelectValue placeholder={t.sortBy} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.sortOptions).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Featured */}
        {featuredPosts.length > 0 && !searchTerm && selectedCategory === 'all' && (
          <section className="py-12 bg-white dark:bg-gray-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 mb-8">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.featured}</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.slice(0, 2).map((post) => (
                  <Link key={post.id} href={`/${locale}/blog/${post.slug}`}>
                    <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer h-full">
                      <div className="relative h-64 overflow-hidden">
                        <img src={post.image_url || 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'} alt={getTitle(post)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <Badge className="absolute top-4 left-4 bg-yellow-500 text-black font-semibold">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          {t.featured}
                        </Badge>
                        <h3 className="absolute bottom-4 left-4 right-4 text-xl font-bold text-white line-clamp-2">{getTitle(post)}</h3>
                      </div>
                      <CardContent className="p-6">
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">{getExcerpt(post)}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{post.author?.name}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{post.published_at ? formatDate(post.published_at) : ''}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{post.likes_count}</span>
                            <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{post.comments_count}</span>
                            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.views}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Posts Grid */}
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => <PostSkeleton key={i} />)}
              </div>
            ) : posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map((post) => (
                    <Link key={post.id} href={`/${locale}/blog/${post.slug}`}>
                      <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col">
                        <div className="relative h-52 overflow-hidden">
                          <img src={post.image_url || 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'} alt={getTitle(post)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <Badge className="absolute top-4 left-4 bg-plp-purple/90 text-white text-xs">
                            {categories.find(c => c.value === post.category)?.label[locale as keyof typeof categories[0]['label']] || post.category}
                          </Badge>
                          {post.is_featured && <Star className="absolute top-4 right-4 w-5 h-5 text-yellow-400 fill-current drop-shadow" />}
                        </div>
                        <CardContent className="p-5 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-plp-purple transition-colors">{getTitle(post)}</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 flex-1">{getExcerpt(post)}</p>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author?.name}</span>
                              <span>{post.read_time} {t.readTime}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes_count}</span>
                                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.comments_count}</span>
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views}</span>
                              </div>
                              <span className="text-xs text-gray-400">{post.published_at ? formatDate(post.published_at) : ''}</span>
                            </div>
                            {(() => {
                              const tags = parseTags(post.tags);
                              return tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0">{tag}</Badge>
                                  ))}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                {lastPage > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                      <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => loadPosts(p)} className={p === page ? 'bg-plp-purple' : ''}>
                        {p}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.noResults}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{t.noResultsHint}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
