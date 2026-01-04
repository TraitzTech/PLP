'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Search, Filter, Plus, CreditCard as Edit, Trash2, Eye, Star, Calendar, TrendingUp, Users, Globe } from 'lucide-react';
import { toast } from 'sonner';

// Mock blog posts data
const mockBlogPosts = [
  {
    id: '1',
    title: {
      en: 'Top 10 Luxury Properties for Your Next Vacation',
      fr: 'Top 10 des Propriétés de Luxe pour Vos Prochaines Vacances'
    },
    excerpt: {
      en: 'Discover the most exclusive and luxurious properties around the world...',
      fr: 'Découvrez les propriétés les plus exclusives et luxueuses du monde...'
    },
    content: {
      en: 'Full article content in English...',
      fr: 'Contenu complet de l\'article en français...'
    },
    author: 'Sarah Johnson',
    category: 'luxury',
    status: 'published',
    featured: true,
    publishDate: '2024-02-15',
    views: 2450,
    likes: 89,
    comments: 23,
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
      en: 'Learn about profitable real estate investment opportunities...',
      fr: 'Apprenez sur les opportunités d\'investissement immobilier rentables...'
    },
    content: {
      en: 'Full article content in English...',
      fr: 'Contenu complet de l\'article en français...'
    },
    author: 'Michael Chen',
    category: 'investment',
    status: 'draft',
    featured: false,
    publishDate: '2024-02-20',
    views: 0,
    likes: 0,
    comments: 0,
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
      en: 'Expert tips for getting the best experience from your property rental...',
      fr: 'Conseils d\'experts pour obtenir la meilleure expérience de votre location...'
    },
    content: {
      en: 'Full article content in English...',
      fr: 'Contenu complet de l\'article en français...'
    },
    author: 'Emma Rodriguez',
    category: 'travel',
    status: 'published',
    featured: false,
    publishDate: '2024-02-12',
    views: 1820,
    likes: 67,
    comments: 15,
    image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
    tags: ['travel', 'tips', 'guide'],
  },
];

const categories = [
  { value: 'luxury', label: { en: 'Luxury', fr: 'Luxe' } },
  { value: 'investment', label: { en: 'Investment', fr: 'Investissement' } },
  { value: 'travel', label: { en: 'Travel', fr: 'Voyage' } },
  { value: 'guides', label: { en: 'Guides', fr: 'Guides' } },
  { value: 'news', label: { en: 'News', fr: 'Actualités' } },
];

export default function AdminBlogPage() {
  const [posts, setPosts] = useState(mockBlogPosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: { en: '', fr: '' },
    excerpt: { en: '', fr: '' },
    content: { en: '', fr: '' },
    category: '',
    featured: false,
    tags: '',
  });

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.title.fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreatePost = () => {
    const post = {
      id: Date.now().toString(),
      title: newPost.title,
      excerpt: newPost.excerpt,
      content: newPost.content,
      author: 'Admin User',
      category: newPost.category,
      status: 'draft',
      featured: newPost.featured,
      publishDate: new Date().toISOString().split('T')[0],
      views: 0,
      likes: 0,
      comments: 0,
      image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
      tags: newPost.tags.split(',').map(tag => tag.trim()),
    };
    
    setPosts(prev => [post, ...prev]);
    setIsCreateDialogOpen(false);
    setNewPost({
      title: { en: '', fr: '' },
      excerpt: { en: '', fr: '' },
      content: { en: '', fr: '' },
      category: '',
      featured: false,
      tags: '',
    });
    toast.success('Article créé avec succès!');
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    toast.success('Article supprimé avec succès!');
  };

  const handlePublishPost = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, status: p.status === 'published' ? 'draft' : 'published' }
        : p
    ));
    toast.success('Statut de l\'article mis à jour!');
  };

  const totalPosts = posts.length;
  const publishedPosts = posts.filter(p => p.status === 'published').length;
  const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
  const totalEngagement = posts.reduce((sum, post) => sum + post.likes + post.comments, 0);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion du Blog</h1>
            <p className="text-gray-600 mt-2">Créez et gérez les articles de blog en français et anglais.</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Nouvel Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un Nouvel Article</DialogTitle>
                <DialogDescription>Créez un article de blog bilingue.</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="en" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="en" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    English
                  </TabsTrigger>
                  <TabsTrigger value="fr" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Français
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="en" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titleEn">Title (English)</Label>
                    <Input
                      id="titleEn"
                      value={newPost.title.en}
                      onChange={(e) => setNewPost(prev => ({ 
                        ...prev, 
                        title: { ...prev.title, en: e.target.value }
                      }))}
                      placeholder="Enter article title in English"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excerptEn">Excerpt (English)</Label>
                    <Textarea
                      id="excerptEn"
                      rows={3}
                      value={newPost.excerpt.en}
                      onChange={(e) => setNewPost(prev => ({ 
                        ...prev, 
                        excerpt: { ...prev.excerpt, en: e.target.value }
                      }))}
                      placeholder="Brief description in English..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contentEn">Content (English)</Label>
                    <Textarea
                      id="contentEn"
                      rows={8}
                      value={newPost.content.en}
                      onChange={(e) => setNewPost(prev => ({ 
                        ...prev, 
                        content: { ...prev.content, en: e.target.value }
                      }))}
                      placeholder="Full article content in English..."
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="fr" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titleFr">Titre (Français)</Label>
                    <Input
                      id="titleFr"
                      value={newPost.title.fr}
                      onChange={(e) => setNewPost(prev => ({ 
                        ...prev, 
                        title: { ...prev.title, fr: e.target.value }
                      }))}
                      placeholder="Entrez le titre de l'article en français"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excerptFr">Extrait (Français)</Label>
                    <Textarea
                      id="excerptFr"
                      rows={3}
                      value={newPost.excerpt.fr}
                      onChange={(e) => setNewPost(prev => ({ 
                        ...prev, 
                        excerpt: { ...prev.excerpt, fr: e.target.value }
                      }))}
                      placeholder="Brève description en français..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contentFr">Contenu (Français)</Label>
                    <Textarea
                      id="contentFr"
                      rows={8}
                      value={newPost.content.fr}
                      onChange={(e) => setNewPost(prev => ({ 
                        ...prev, 
                        content: { ...prev.content, fr: e.target.value }
                      }))}
                      placeholder="Contenu complet de l'article en français..."
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select value={newPost.category} onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label.fr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (séparés par virgule)</Label>
                  <Input
                    id="tags"
                    value={newPost.tags}
                    onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="luxe, voyage, guide"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newPost.featured}
                    onCheckedChange={(checked) => setNewPost(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label>Article en vedette</Label>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreatePost} className="btn-primary">
                    Créer l'Article
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Articles</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
                </div>
                <FileText className="w-8 h-8 text-plp-purple" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Publiés</p>
                  <p className="text-2xl font-bold text-gray-900">{publishedPosts}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-plp-pink" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vues Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-plp-yellow" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engagement</p>
                  <p className="text-2xl font-bold text-gray-900">{totalEngagement}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher des articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les Statuts</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les Catégories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label.fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Blog Posts List */}
        <Card>
          <CardHeader>
            <CardTitle>Tous les Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <img
                    src={post.image}
                    alt={post.title.fr}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{post.title.fr}</h3>
                      {post.featured && (
                        <Star className="w-4 h-4 text-plp-yellow fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{post.excerpt.fr}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                      <span>Par: {post.author}</span>
                      <span>Catégorie: {categories.find(c => c.value === post.category)?.label.fr}</span>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {post.publishDate}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{post.views}</p>
                        <p className="text-gray-600">Vues</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{post.likes}</p>
                        <p className="text-gray-600">Likes</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{post.comments}</p>
                        <p className="text-gray-600">Commentaires</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedPost(post);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublishPost(post.id)}
                        className={post.status === 'published' ? 'text-yellow-600' : 'text-green-600'}
                      >
                        {post.status === 'published' ? 'Dépublier' : 'Publier'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {filteredPosts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun article trouvé</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Essayez d\'ajuster vos critères de recherche.'
                  : 'Commencez par créer votre premier article de blog.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}