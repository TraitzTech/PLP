'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText, Search, Plus, Pencil, Trash2, Eye, Star, Calendar,
  TrendingUp, Users, Globe, Loader2, MessageCircle, Heart, CheckCircle,
  Clock, AlertCircle, Upload, X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminBlogService, parseTags, type BlogPost, type BlogStats } from '@/services/blogService';

const categories = [
  { value: 'luxury', label: { en: 'Luxury', fr: 'Luxe' } },
  { value: 'investment', label: { en: 'Investment', fr: 'Investissement' } },
  { value: 'travel', label: { en: 'Travel', fr: 'Voyage' } },
  { value: 'hosting', label: { en: 'Hosting', fr: 'Hébergement' } },
  { value: 'sustainability', label: { en: 'Sustainability', fr: 'Durabilité' } },
  { value: 'general', label: { en: 'General', fr: 'Général' } },
];

interface PostFormData {
  title_en: string;
  title_fr: string;
  excerpt_en: string;
  excerpt_fr: string;
  content_en: string;
  content_fr: string;
  category: string;
  tags: string;
  is_featured: boolean;
  is_published: boolean;
  read_time: number;
  image: File | null;
}

const emptyForm: PostFormData = {
  title_en: '', title_fr: '', excerpt_en: '', excerpt_fr: '',
  content_en: '', content_fr: '', category: 'general', tags: '',
  is_featured: false, is_published: false, read_time: 5, image: null,
};

// Extracted outside the main component to prevent remounting on every keystroke
interface PostFormProps {
  form: PostFormData;
  setForm: React.Dispatch<React.SetStateAction<PostFormData>>;
  imagePreview: string | null;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saving: boolean;
  onSubmit: () => void;
  submitLabel: string;
  onClose: () => void;
}

const PostForm = React.memo(function PostForm({
  form, setForm, imagePreview, setImagePreview,
  handleImageChange, saving, onSubmit, submitLabel, onClose,
}: PostFormProps) {
  const handleInputChange = (field: keyof PostFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="en" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="en" className="flex items-center gap-2">
            <Globe className="w-4 h-4" /> English
          </TabsTrigger>
          <TabsTrigger value="fr" className="flex items-center gap-2">
            <Globe className="w-4 h-4" /> Français
          </TabsTrigger>
        </TabsList>

        <TabsContent value="en" className="space-y-4">
          <div className="space-y-2">
            <Label>Title (English) *</Label>
            <Input value={form.title_en} onChange={handleInputChange('title_en')} placeholder="Article title" />
          </div>
          <div className="space-y-2">
            <Label>Excerpt (English)</Label>
            <Textarea rows={2} value={form.excerpt_en} onChange={handleInputChange('excerpt_en')} placeholder="Brief description..." />
          </div>
          <div className="space-y-2">
            <Label>Content (English) *</Label>
            <Textarea rows={10} value={form.content_en} onChange={handleInputChange('content_en')} placeholder="Full article content (supports HTML)..." />
          </div>
        </TabsContent>

        <TabsContent value="fr" className="space-y-4">
          <div className="space-y-2">
            <Label>Titre (Français)</Label>
            <Input value={form.title_fr} onChange={handleInputChange('title_fr')} placeholder="Titre de l'article" />
          </div>
          <div className="space-y-2">
            <Label>Extrait (Français)</Label>
            <Textarea rows={2} value={form.excerpt_fr} onChange={handleInputChange('excerpt_fr')} placeholder="Brève description..." />
          </div>
          <div className="space-y-2">
            <Label>Contenu (Français)</Label>
            <Textarea rows={10} value={form.content_fr} onChange={handleInputChange('content_fr')} placeholder="Contenu complet (HTML supporté)..." />
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={form.category} onValueChange={(v: string) => setForm(p => ({ ...p, category: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label.en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tags (comma separated)</Label>
          <Input value={form.tags} onChange={handleInputChange('tags')} placeholder="luxury, travel" />
        </div>
        <div className="space-y-2">
          <Label>Read Time (minutes)</Label>
          <Input type="number" value={form.read_time} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, read_time: parseInt(e.target.value) || 5 }))} min={1} />
        </div>
      </div>

      {/* Image upload */}
      <div className="space-y-2">
        <Label>Cover Image</Label>
        <div className="flex items-start gap-4">
          {imagePreview && (
            <div className="relative w-32 h-20 rounded-lg overflow-hidden border">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button onClick={() => { setImagePreview(null); setForm(p => ({ ...p, image: null })); }} className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
          <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
            <Upload className="w-4 h-4" /> Choose Image
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={form.is_featured} onCheckedChange={(v: boolean) => setForm(p => ({ ...p, is_featured: v }))} />
          <Label>Featured</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.is_published} onCheckedChange={(v: boolean) => setForm(p => ({ ...p, is_published: v }))} />
          <Label>Published</Label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} disabled={saving} className="bg-plp-purple hover:bg-plp-purple/90">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  );
});

export default function AdminBlogPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<PostFormData>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, per_page: 15 };
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter === 'published') params.is_published = true;
      if (statusFilter === 'draft') params.is_published = false;

      const response = await adminBlogService.getPosts(params);
      if (response.success) {
        setPosts(response.data.data);
        setLastPage(response.data.last_page);
      }
    } catch {
      toast({ title: 'Error loading posts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, categoryFilter, statusFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await adminBlogService.getStatistics();
      if (response.success) setStats(response.data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);
  useEffect(() => { loadStats(); }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); loadPosts(); }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append('title_en', form.title_en);
    if (form.title_fr) fd.append('title_fr', form.title_fr);
    if (form.excerpt_en) fd.append('excerpt_en', form.excerpt_en);
    if (form.excerpt_fr) fd.append('excerpt_fr', form.excerpt_fr);
    fd.append('content_en', form.content_en);
    if (form.content_fr) fd.append('content_fr', form.content_fr);
    fd.append('category', form.category);
    fd.append('read_time', String(form.read_time));
    fd.append('is_featured', form.is_featured ? '1' : '0');
    fd.append('is_published', form.is_published ? '1' : '0');
    if (form.tags) {
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      tagsArray.forEach((tag, i) => fd.append(`tags[${i}]`, tag));
    }
    if (form.image) fd.append('image', form.image);
    return fd;
  };

  const handleCreate = async () => {
    if (!form.title_en || !form.content_en || !form.category) {
      toast({ title: 'Title (EN), content (EN), and category are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const response = await adminBlogService.createPost(buildFormData());
      if (response.success) {
        toast({ title: 'Blog post created!' });
        setIsCreateOpen(false);
        setForm({ ...emptyForm });
        setImagePreview(null);
        loadPosts();
        loadStats();
      }
    } catch (err: any) {
      toast({ title: err?.message || 'Failed to create post', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingPost) return;
    setSaving(true);
    try {
      const response = await adminBlogService.updatePost(editingPost.id, buildFormData());
      if (response.success) {
        toast({ title: 'Blog post updated!' });
        setIsEditOpen(false);
        setEditingPost(null);
        setForm({ ...emptyForm });
        setImagePreview(null);
        loadPosts();
        loadStats();
      }
    } catch (err: any) {
      toast({ title: err?.message || 'Failed to update post', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const response = await adminBlogService.deletePost(id);
      if (response.success) {
        toast({ title: 'Post deleted' });
        loadPosts();
        loadStats();
      }
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      const response = await adminBlogService.toggleFeatured(id);
      if (response.success) {
        toast({ title: response.message });
        loadPosts();
        loadStats();
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleTogglePublish = async (id: number) => {
    try {
      const response = await adminBlogService.togglePublish(id);
      if (response.success) {
        toast({ title: response.message });
        loadPosts();
        loadStats();
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title_en: post.title_en,
      title_fr: post.title_fr || '',
      excerpt_en: post.excerpt_en || '',
      excerpt_fr: post.excerpt_fr || '',
      content_en: post.content_en,
      content_fr: post.content_fr || '',
      category: post.category,
      tags: parseTags(post.tags).join(', '),
      is_featured: post.is_featured,
      is_published: post.is_published,
      read_time: post.read_time,
      image: null,
    });
    setImagePreview(post.image_url);
    setIsEditOpen(true);
  };

  const handleCloseDialog = useCallback(() => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
  }, []);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage blog posts in English and French.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={(v: boolean) => { setIsCreateOpen(v); if (v) { setForm({ ...emptyForm }); setImagePreview(null); } }}>
            <DialogTrigger asChild>
              <Button className="bg-plp-purple hover:bg-plp-purple/90"><Plus className="w-4 h-4 mr-2" />New Post</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
                <DialogDescription>Create a bilingual blog post.</DialogDescription>
              </DialogHeader>
              <PostForm form={form} setForm={setForm} imagePreview={imagePreview} setImagePreview={setImagePreview} handleImageChange={handleImageChange} saving={saving} onSubmit={handleCreate} submitLabel="Create Post" onClose={handleCloseDialog} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'Total', value: stats?.total_posts ?? '—', icon: FileText, color: 'text-plp-purple' },
            { label: 'Published', value: stats?.published_posts ?? '—', icon: CheckCircle, color: 'text-green-500' },
            { label: 'Drafts', value: stats?.draft_posts ?? '—', icon: Clock, color: 'text-yellow-500' },
            { label: 'Views', value: stats?.total_views?.toLocaleString() ?? '—', icon: Eye, color: 'text-blue-500' },
            { label: 'Comments', value: stats?.total_comments ?? '—', icon: MessageCircle, color: 'text-indigo-500' },
            { label: 'Pending', value: stats?.pending_comments ?? '—', icon: AlertCircle, color: 'text-orange-500' },
            { label: 'Featured', value: stats?.featured_posts ?? '—', icon: Star, color: 'text-yellow-500' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-6 h-6 mx-auto mb-1 ${stat.color}`} />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search posts..." value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={(v: string) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={(v: string) => { setCategoryFilter(v); setPage(1); }}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        <Card>
          <CardHeader>
            <CardTitle>All Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4 p-4 border rounded-lg">
                    <Skeleton className="w-20 h-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="flex flex-col lg:flex-row items-start lg:items-center gap-4 p-4 border rounded-xl hover:border-plp-purple/30 transition-colors">
                    <img
                      src={post.image_url || 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg'}
                      alt={post.title_en}
                      className="w-full lg:w-24 h-32 lg:h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{post.title_en}</h3>
                        {post.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
                      </div>
                      {post.excerpt_en && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{post.excerpt_en}</p>}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge className={post.is_published ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}>
                          {post.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{post.category}</Badge>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not published'}
                        </span>
                        <span className="text-xs text-gray-400">{post.author?.name}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <p className="font-bold text-gray-900 dark:text-white">{post.views}</p>
                        <p className="text-[10px]">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900 dark:text-white">{post.likes_count}</p>
                        <p className="text-[10px]">Likes</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900 dark:text-white">{post.comments_count}</p>
                        <p className="text-[10px]">Cmts</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5">
                      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleToggleFeatured(post.id)} title={post.is_featured ? 'Remove featured' : 'Mark featured'}>
                        <Star className={`w-4 h-4 ${post.is_featured ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                      </Button>
                      <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => openEdit(post)} title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-9 text-xs ${post.is_published ? 'text-yellow-600' : 'text-green-600'}`}
                        onClick={() => handleTogglePublish(post.id)}
                      >
                        {post.is_published ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button variant="outline" size="icon" className="h-9 w-9 text-red-500 hover:text-red-600" onClick={() => handleDelete(post.id)} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                    ? 'Try adjusting your filters.'
                    : 'Create your first blog post to get started.'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex justify-center gap-2 mt-6 pt-4 border-t">
                {Array.from({ length: lastPage }, (_, i) => i + 1).map(p => (
                  <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className={p === page ? 'bg-plp-purple' : ''}>
                    {p}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(v: boolean) => { setIsEditOpen(v); if (!v) setEditingPost(null); }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
              <DialogDescription>Update the blog post content.</DialogDescription>
            </DialogHeader>
            <PostForm form={form} setForm={setForm} imagePreview={imagePreview} setImagePreview={setImagePreview} handleImageChange={handleImageChange} saving={saving} onSubmit={handleUpdate} submitLabel="Save Changes" onClose={handleCloseDialog} />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
