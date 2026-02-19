'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Heart, MessageCircle, Eye, Calendar, User, Clock, ArrowLeft,
  Share2, Copy, Facebook, Twitter, Linkedin, Send, Reply,
  Trash2, ChevronDown, ChevronUp, Star, BookOpen, Tag,
  Loader2, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { blogService, parseTags, type BlogPost, type BlogComment } from '@/services/blogService';
import { getToken } from '@/lib/authToken';

export default function BlogDetailPage() {
  const pathname = usePathname();
  const params = useParams();
  const locale = pathname?.startsWith('/fr') ? 'fr' : 'en';
  const slug = params?.slug as string;
  const { toast } = useToast();
  const commentsRef = useRef<HTMLDivElement>(null);

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [liking, setLiking] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAuthenticated = !!getToken();

  const t = {
    en: {
      back: 'Back to Blog',
      by: 'By',
      minRead: 'min read',
      views: 'views',
      likes: 'likes',
      like: 'Like',
      liked: 'Liked',
      share: 'Share',
      comments: 'Comments',
      writeComment: 'Write a comment...',
      yourName: 'Your name',
      yourEmail: 'Your email',
      postComment: 'Post Comment',
      reply: 'Reply',
      replyTo: 'Reply to',
      postReply: 'Post Reply',
      cancel: 'Cancel',
      delete: 'Delete',
      showReplies: 'Show replies',
      hideReplies: 'Hide replies',
      noComments: 'No comments yet. Be the first to share your thoughts!',
      loginToLike: 'Login to like posts',
      loginToComment: 'Login for instant comments, or comment as guest',
      commentPosted: 'Comment posted!',
      commentPending: 'Comment submitted for review',
      replyPosted: 'Reply posted!',
      replyPending: 'Reply submitted for review',
      deleted: 'Comment deleted',
      relatedPosts: 'Related Articles',
      tags: 'Tags',
      copyLink: 'Copy Link',
      linkCopied: 'Link copied!',
      featured: 'Featured',
      shareOn: 'Share on',
      tableOfContents: 'Contents',
    },
    fr: {
      back: 'Retour au Blog',
      by: 'Par',
      minRead: 'min de lecture',
      views: 'vues',
      likes: 'j\'aime',
      like: 'J\'aime',
      liked: 'Aimé',
      share: 'Partager',
      comments: 'Commentaires',
      writeComment: 'Écrire un commentaire...',
      yourName: 'Votre nom',
      yourEmail: 'Votre email',
      postComment: 'Publier',
      reply: 'Répondre',
      replyTo: 'Répondre à',
      postReply: 'Publier la Réponse',
      cancel: 'Annuler',
      delete: 'Supprimer',
      showReplies: 'Voir les réponses',
      hideReplies: 'Masquer les réponses',
      noComments: 'Aucun commentaire. Soyez le premier à partager vos pensées !',
      loginToLike: 'Connectez-vous pour aimer les posts',
      loginToComment: 'Connectez-vous pour un commentaire instant, ou commentez en tant qu\'invité',
      commentPosted: 'Commentaire publié !',
      commentPending: 'Commentaire soumis pour examen',
      replyPosted: 'Réponse publiée !',
      replyPending: 'Réponse soumise pour examen',
      deleted: 'Commentaire supprimé',
      relatedPosts: 'Articles Connexes',
      tags: 'Étiquettes',
      copyLink: 'Copier le lien',
      linkCopied: 'Lien copié !',
      featured: 'En Vedette',
      shareOn: 'Partager sur',
      tableOfContents: 'Contenu',
    },
  }[locale];

  // Load post
  useEffect(() => {
    if (!slug) return;
    const loadPost = async () => {
      try {
        setLoading(true);
        const response = await blogService.getPost(slug);
        if (response.success) {
          setPost(response.data);
          setLiked(response.data.is_liked || false);
          setLikesCount(response.data.likes_count);
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to load blog post', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [slug]);

  // Load related posts
  useEffect(() => {
    if (!slug) return;
    const loadRelated = async () => {
      try {
        const response = await blogService.getRelatedPosts(slug);
        if (response.success) {
          setRelatedPosts(response.data);
        }
      } catch {
        // silently fail
      }
    };
    loadRelated();
  }, [slug]);

  const getTitle = (p: BlogPost) => locale === 'fr' && p.title_fr ? p.title_fr : p.title_en;
  const getExcerpt = (p: BlogPost) => locale === 'fr' && p.excerpt_fr ? p.excerpt_fr : p.excerpt_en;
  const getContent = (p: BlogPost) => locale === 'fr' && p.content_fr ? p.content_fr : p.content_en;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return locale === 'fr' ? 'À l\'instant' : 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return formatDate(dateString);
  };

  // Like
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({ title: t.loginToLike, variant: 'destructive' });
      return;
    }
    if (!post || liking) return;
    setLiking(true);
    try {
      const response = await blogService.toggleLike(post.id);
      if (response.success) {
        setLiked(response.data.liked);
        setLikesCount(response.data.likes_count);
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setLiking(false);
    }
  };

  // Comment
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentText.trim()) return;
    if (!isAuthenticated && (!guestName.trim() || !guestEmail.trim())) {
      toast({ title: locale === 'fr' ? 'Nom et email requis' : 'Name and email required', variant: 'destructive' });
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await blogService.addComment(post.id, {
        content: commentText,
        ...(isAuthenticated ? {} : { guest_name: guestName, guest_email: guestEmail }),
      });
      if (response.success) {
        // Add to local comments if approved
        if (response.data.is_approved && post.approved_comments) {
          setPost({
            ...post,
            approved_comments: [response.data, ...post.approved_comments],
            comments_count: post.comments_count + 1,
          });
        }
        setCommentText('');
        toast({
          title: response.data.is_approved ? t.commentPosted : t.commentPending,
          description: response.data.is_approved ? '' : (locale === 'fr' ? 'Votre commentaire sera visible après approbation.' : 'Your comment will be visible after approval.'),
        });
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setSubmittingComment(false);
    }
  };

  // Reply
  const handleReply = async (parentId: number) => {
    if (!post || !replyText.trim()) return;
    if (!isAuthenticated && (!guestName.trim() || !guestEmail.trim())) {
      toast({ title: locale === 'fr' ? 'Nom et email requis' : 'Name and email required', variant: 'destructive' });
      return;
    }

    setSubmittingReply(true);
    try {
      const response = await blogService.addComment(post.id, {
        content: replyText,
        parent_id: parentId,
        ...(isAuthenticated ? {} : { guest_name: guestName, guest_email: guestEmail }),
      });
      if (response.success) {
        // Add reply to parent comment locally
        if (response.data.is_approved && post.approved_comments) {
          const updatedComments = post.approved_comments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), response.data],
              };
            }
            return comment;
          });
          setPost({ ...post, approved_comments: updatedComments });
          setExpandedReplies(prev => { const next = new Set(prev); next.add(parentId); return next; });
        }
        setReplyText('');
        setReplyingTo(null);
        toast({
          title: response.data.is_approved ? t.replyPosted : t.replyPending,
        });
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setSubmittingReply(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: number) => {
    if (!post) return;
    try {
      const response = await blogService.deleteComment(commentId);
      if (response.success) {
        // Remove from local state
        if (post.approved_comments) {
          const updatedComments = post.approved_comments
            .filter(c => c.id !== commentId)
            .map(c => ({
              ...c,
              replies: c.replies?.filter(r => r.id !== commentId) || [],
            }));
          setPost({ ...post, approved_comments: updatedComments, comments_count: post.comments_count - 1 });
        }
        toast({ title: t.deleted });
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  // Share
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: t.linkCopied });
    } catch {
      // fallback
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post ? getTitle(post) : '')}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  const toggleReplies = (commentId: number) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  const scrollToComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <div className="pt-20">
          <Skeleton className="h-[400px] w-full" />
          <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <div className="pt-20 container mx-auto px-4 py-20 text-center">
          <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {locale === 'fr' ? 'Article non trouvé' : 'Post not found'}
          </h1>
          <p className="text-gray-500 mb-8">
            {locale === 'fr' ? 'L\'article que vous cherchez n\'existe pas.' : 'The article you\'re looking for doesn\'t exist.'}
          </p>
          <Link href={`/${locale}/blog`}>
            <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />{t.back}</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const comments = post.approved_comments || [];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      
      <div className="pt-20">
        {/* Hero Image */}
        <section className="relative h-[400px] sm:h-[500px] overflow-hidden">
          <img
            src={post.image_url || 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'}
            alt={getTitle(post)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          
          {/* Back button */}
          <Link href={`/${locale}/blog`} className="absolute top-6 left-6 z-10">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 backdrop-blur-sm bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.back}
            </Button>
          </Link>
          
          {/* Post info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12">
            <div className="container mx-auto max-w-4xl">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-plp-purple text-white">{post.category}</Badge>
                {post.is_featured && (
                  <Badge className="bg-yellow-500 text-black font-semibold">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {t.featured}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                {getTitle(post)}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {t.by} {post.author?.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {post.published_at ? formatDate(post.published_at) : ''}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {post.read_time} {t.minRead}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {post.views} {t.views}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Interaction Bar (Sticky) */}
        <div className="sticky top-16 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b dark:border-gray-800">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                {/* Like */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={liking}
                  className={`gap-1.5 ${liked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'}`}
                >
                  <Heart className={`w-5 h-5 transition-all ${liked ? 'fill-current scale-110' : ''}`} />
                  <span className="font-medium">{likesCount}</span>
                </Button>

                {/* Comments count */}
                <Button variant="ghost" size="sm" onClick={scrollToComments} className="gap-1.5 text-gray-500 hover:text-plp-purple">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">{post.comments_count}</span>
                </Button>
              </div>

              {/* Share */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="gap-1.5 text-gray-500 hover:text-plp-purple"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="hidden sm:inline">{t.share}</span>
                </Button>
                
                {showShareMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 p-3 z-50 min-w-[200px]">
                      <p className="text-xs font-medium text-gray-400 mb-2 px-2">{t.shareOn}</p>
                      <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                      >
                        {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                        {copied ? t.linkCopied : t.copyLink}
                      </button>
                      <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                        <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                      </a>
                      <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                        <Twitter className="w-4 h-4 text-sky-500" /> Twitter
                      </a>
                      <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                        <Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="container mx-auto max-w-4xl px-4 sm:px-6 py-12">
          {/* Excerpt */}
          {getExcerpt(post) && (
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8 font-medium border-l-4 border-plp-purple pl-6 italic">
              {getExcerpt(post)}
            </p>
          )}

          {/* Main content */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-plp-purple prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-lg
              prose-blockquote:border-plp-purple prose-blockquote:bg-purple-50 dark:prose-blockquote:bg-purple-900/20 prose-blockquote:rounded-r-lg prose-blockquote:py-1
              prose-code:text-plp-purple prose-code:bg-purple-50 dark:prose-code:bg-purple-900/30 prose-code:px-2 prose-code:py-0.5 prose-code:rounded
              prose-strong:text-gray-900 dark:prose-strong:text-white"
            dangerouslySetInnerHTML={{ __html: getContent(post) }}
          />

          {/* Tags */}
          {(() => {
            const tags = parseTags(post.tags);
            return tags.length > 0 ? (
              <div className="mt-12 pt-8 border-t dark:border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{t.tags}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1.5 text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* Author card */}
          <div className="mt-12 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16 ring-4 ring-white dark:ring-gray-800 shadow">
                <AvatarFallback className="bg-plp-purple text-white text-xl font-bold">
                  {post.author?.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{locale === 'fr' ? 'Écrit par' : 'Written by'}</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{post.author?.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {locale === 'fr' 
                    ? 'Discover more articles from this author on our blog.'
                    : 'Discover more articles from this author on our blog.'}
                </p>
              </div>
            </div>
          </div>

          {/* Like & Share section */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 py-8 border-t border-b dark:border-gray-800">
            <Button
              onClick={handleLike}
              disabled={liking}
              size="lg"
              variant={liked ? 'default' : 'outline'}
              className={`gap-2 px-8 ${liked ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              {liked ? t.liked : t.like} · {likesCount}
            </Button>
            <Button onClick={scrollToComments} variant="outline" size="lg" className="gap-2 px-8">
              <MessageCircle className="w-5 h-5" />
              {t.comments} · {post.comments_count}
            </Button>
          </div>
        </article>

        {/* Comments Section */}
        <section ref={commentsRef} className="bg-gray-50 dark:bg-gray-900 py-12">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-plp-purple" />
              {t.comments} ({post.comments_count})
            </h2>

            {/* Comment Form */}
            <Card className="mb-8 shadow-sm">
              <CardContent className="p-6">
                <form onSubmit={handleComment}>
                  {!isAuthenticated && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <Input
                        placeholder={t.yourName}
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required={!isAuthenticated}
                      />
                      <Input
                        type="email"
                        placeholder={t.yourEmail}
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        required={!isAuthenticated}
                      />
                    </div>
                  )}
                  <Textarea
                    placeholder={t.writeComment}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    className="resize-none mb-4"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {isAuthenticated ? '' : t.loginToComment}
                    </p>
                    <Button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="bg-plp-purple hover:bg-plp-purple/90"
                    >
                      {submittingComment ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {t.postComment}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id} className="shadow-sm">
                    <CardContent className="p-5">
                      {/* Comment header */}
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          {comment.author_avatar && <AvatarImage src={comment.author_avatar} />}
                          <AvatarFallback className="bg-plp-purple/10 text-plp-purple text-sm font-semibold">
                            {comment.author_name?.charAt(0) || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                {comment.author_name}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatTimeAgo(comment.created_at)}
                              </span>
                            </div>
                            {comment.user_id && isAuthenticated && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                          
                          {/* Comment body */}
                          <p className="text-gray-700 dark:text-gray-300 mt-1.5 text-sm leading-relaxed">
                            {comment.content}
                          </p>

                          {/* Comment actions */}
                          <div className="flex items-center gap-3 mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(replyingTo === comment.id ? null : comment.id);
                                setReplyText('');
                              }}
                              className="text-xs text-gray-500 hover:text-plp-purple h-7 px-2"
                            >
                              <Reply className="w-3.5 h-3.5 mr-1" />
                              {t.reply}
                            </Button>
                            {comment.replies && comment.replies.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleReplies(comment.id)}
                                className="text-xs text-gray-500 hover:text-plp-purple h-7 px-2"
                              >
                                {expandedReplies.has(comment.id) ? (
                                  <><ChevronUp className="w-3.5 h-3.5 mr-1" />{t.hideReplies} ({comment.replies.length})</>
                                ) : (
                                  <><ChevronDown className="w-3.5 h-3.5 mr-1" />{t.showReplies} ({comment.replies.length})</>
                                )}
                              </Button>
                            )}
                          </div>

                          {/* Reply form */}
                          {replyingTo === comment.id && (
                            <div className="mt-3 pl-4 border-l-2 border-plp-purple/30">
                              {!isAuthenticated && (
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  <Input
                                    placeholder={t.yourName}
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    className="h-8 text-sm"
                                  />
                                  <Input
                                    type="email"
                                    placeholder={t.yourEmail}
                                    value={guestEmail}
                                    onChange={(e) => setGuestEmail(e.target.value)}
                                    className="h-8 text-sm"
                                  />
                                </div>
                              )}
                              <Textarea
                                placeholder={`${t.replyTo} ${comment.author_name}...`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={2}
                                className="resize-none text-sm mb-2"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleReply(comment.id)}
                                  disabled={submittingReply || !replyText.trim()}
                                  className="bg-plp-purple hover:bg-plp-purple/90 h-8 text-xs"
                                >
                                  {submittingReply ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
                                  {t.postReply}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                  className="h-8 text-xs"
                                >
                                  {t.cancel}
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Replies */}
                          {expandedReplies.has(comment.id) && comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start gap-2.5">
                                  <Avatar className="w-7 h-7">
                                    {reply.author_avatar && <AvatarImage src={reply.author_avatar} />}
                                    <AvatarFallback className="bg-indigo-50 dark:bg-indigo-900/30 text-plp-purple text-xs">
                                      {reply.author_name?.charAt(0) || 'A'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900 dark:text-white text-xs">
                                        {reply.author_name}
                                      </span>
                                      <span className="text-[10px] text-gray-400">
                                        {formatTimeAgo(reply.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-0.5">
                                      {reply.content}
                                    </p>
                                  </div>
                                  {reply.user_id && isAuthenticated && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteComment(reply.id)}
                                      className="text-gray-400 hover:text-red-500 h-6 w-6 p-0"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">{t.noComments}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-12 bg-white dark:bg-gray-950">
            <div className="container mx-auto max-w-4xl px-4 sm:px-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{t.relatedPosts}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((rp) => (
                  <Link key={rp.id} href={`/${locale}/blog/${rp.slug}`}>
                    <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={rp.image_url || 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'}
                          alt={getTitle(rp)}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <Badge className="absolute top-3 left-3 bg-plp-purple/90 text-white text-xs">{rp.category}</Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-plp-purple transition-colors mb-2">
                          {getTitle(rp)}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{rp.likes_count}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{rp.comments_count}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{rp.views}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
