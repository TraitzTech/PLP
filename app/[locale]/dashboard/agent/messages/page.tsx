'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { 
  MessageSquare, 
  Send, 
  Search, 
  MoreVertical, 
  Paperclip, 
  Image as ImageIcon,
  Plus,
  X,
  FileIcon,
  Download,
  Volume2,
  Bell,
  BellOff,
  RefreshCw,
  Loader2,
  Star,
  Check,
  CheckCheck,
  Reply,
  Trash2
} from 'lucide-react';
import messageService, { 
  Conversation, 
  Message, 
  User,
  SendMessageData 
} from '@/services/messageService';
import { authService } from '@/services/authService';

const SWIPE_THRESHOLD_PX = 70;
const REPLY_META_REGEX = /^\[\[reply:(\d+)\]\]\n?/;

export default function AgentMessagesPage() {
  const resolveUserId = (value: any): number | null => {
    const candidates = [value?.id, value?.user_id, value?.data?.id, value?.user?.id];
    for (const candidate of candidates) {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return null;
  };

  const resolveMessageSenderId = (message: Message): number | null => {
    const parsed = Number(message.sender_id ?? message.sender?.id);
    return Number.isFinite(parsed) ? parsed : null;
  };

  // State for conversations and messages
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
  
  // Loading states
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  
  // Attachment state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // UI state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [starredConversations, setStarredConversations] = useState<Set<number>>(new Set());
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [showMediaOnly, setShowMediaOnly] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [deleteConfirmMessage, setDeleteConfirmMessage] = useState<Message | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<number>(0);
  const touchStartXRef = useRef<number | null>(null);
  const messageRefsRef = useRef<Record<number, HTMLDivElement | null>>({});
  const pendingDeletesRef = useRef<Record<number, { message: Message; index: number; timeoutId: ReturnType<typeof setTimeout> }>>({});
  const accessErrorRef = useRef<string | null>(null);
  
  const { toast } = useToast();

  const extractApiErrorMessage = useCallback((error: any, fallback: string) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallback
    );
  }, []);

  const notifyApiError = useCallback((error: any, fallback: string, onlyOnce = false) => {
    const message = extractApiErrorMessage(error, fallback);
    const status = Number(error?.response?.status || 0);

    if (onlyOnce && accessErrorRef.current === message) {
      return;
    }

    if (onlyOnce) {
      accessErrorRef.current = message;
    }

    const shouldShowToast = status === 401 || status === 403 || status === 422 || !onlyOnce;
    if (shouldShowToast) {
      toast({
        title: 'Action blocked',
        description: message,
        variant: 'destructive',
      });
    }
  }, [extractApiErrorMessage, toast]);

  const parseMessageContent = (rawMessage?: string) => {
    const original = rawMessage || '';
    const metaMatch = original.match(REPLY_META_REGEX);
    const replyToId = metaMatch ? Number(metaMatch[1]) : null;

    let bodyText = metaMatch ? original.replace(REPLY_META_REGEX, '') : original;
    bodyText = bodyText.replace(/^(\s*↪\s*)+/, '').trimStart();

    return { replyToId, bodyText };
  };

  const buildReplyMessage = (replyToId: number | null, bodyText: string) => {
    if (!replyToId) return bodyText;
    return `[[reply:${replyToId}]]\n${bodyText}`;
  };

  const scrollToReferencedMessage = (messageId: number) => {
    const element = messageRefsRef.current[messageId];
    if (!element) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add('ring-2', 'ring-plp-pink', 'ring-offset-2');
    setTimeout(() => {
      element.classList.remove('ring-2', 'ring-plp-pink', 'ring-offset-2');
    }, 1200);
  };

  // Initialize user + permissions
  useEffect(() => {
    const initializeCurrentUserId = async () => {
      let resolvedUserId: number | null = null;

      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          resolvedUserId = resolveUserId(JSON.parse(userData));
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      if (!resolvedUserId) {
        try {
          const user = await authService.getCurrentUser();
          resolvedUserId = resolveUserId(user);
        } catch (e) {
          console.error('Error fetching current user:', e);
        }
      }

      if (resolvedUserId) {
        setCurrentUserId(resolvedUserId);
      }
    };

    initializeCurrentUserId();
    
    // Load starred conversations from localStorage
    const savedStarred = localStorage.getItem('starredConversations');
    if (savedStarred) {
      try {
        setStarredConversations(new Set(JSON.parse(savedStarred)));
      } catch (e) {
        console.error('Error loading starred conversations:', e);
      }
    }
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const playTone = useCallback((frequency: number, duration = 0.12, gain = 0.02) => {
    if (!notificationsEnabled || typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = gain;

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.stop(context.currentTime + duration);

    setTimeout(() => {
      context.close().catch(() => {});
    }, duration * 1000 + 50);
  }, [notificationsEnabled]);

  const playIncomingSound = useCallback(() => {
    playTone(620, 0.13, 0.02);
    setTimeout(() => playTone(760, 0.1, 0.015), 65);
  }, [playTone]);

  const playOutgoingSound = useCallback(() => {
    playTone(520, 0.09, 0.015);
  }, [playTone]);

  // Show web notification
  const showWebNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted' && notificationsEnabled) {
      new Notification(title, {
        body,
        icon: '/logo-images/PlpLisitng-Fav-Icon-8.png',
        tag: 'message-notification',
      });
    }
  }, [notificationsEnabled]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await messageService.getConversations();
      setConversations(response.data.conversations);
      accessErrorRef.current = null;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
      notifyApiError(error, 'Failed to load conversations', true);
    } finally {
      setLoadingConversations(false);
    }
  }, [notifyApiError]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (userId: number, showLoading = true) => {
    if (showLoading) setLoadingMessages(true);
    try {
      const response = await messageService.getConversation(userId);
      const newMessages = response.data.messages;
      
      // Check for new messages and play sound
      if (!showLoading && newMessages.length > 0) {
        const latestMessage = newMessages[newMessages.length - 1];
        const latestSenderId = resolveMessageSenderId(latestMessage);
        if (latestMessage.id > lastMessageIdRef.current && latestSenderId !== currentUserId) {
          playIncomingSound();
          showWebNotification(
            'New Message from Client', 
            `${latestMessage.sender?.first_name || 'Client'}: ${messageService.getMessagePreview(latestMessage)}`
          );
        }
      }
      
      // Update last message ID
      if (newMessages.length > 0) {
        lastMessageIdRef.current = newMessages[newMessages.length - 1].id;
      }
      
      setMessages(newMessages);
      accessErrorRef.current = null;
      
      // Mark conversation as read
      await messageService.markConversationAsRead(userId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
      notifyApiError(error, 'Failed to load messages', true);
    } finally {
      setLoadingMessages(false);
    }
  }, [currentUserId, playIncomingSound, showWebNotification, notifyApiError]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await messageService.getUnreadCount();
      const newCount = response.data.unread_count;
      
      // If unread count increased, there might be a new message
      if (newCount > unreadCount && notificationsEnabled && !selectedConversation) {
        playIncomingSound();
        showWebNotification('New Client Message', 'You have unread messages from clients');
      }
      
      setUnreadCount(newCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      notifyApiError(error, 'Failed to load unread message count', true);
    }
  }, [unreadCount, notificationsEnabled, selectedConversation, playIncomingSound, showWebNotification, notifyApiError]);

  // Initial load
  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(pendingDeletesRef.current).forEach((entry) => {
        clearTimeout(entry.timeoutId);
      });
    };
  }, []);

  // Poll for new messages
  useEffect(() => {
    // Start polling
    pollingIntervalRef.current = setInterval(() => {
      fetchConversations();
      fetchUnreadCount();
      if (selectedConversation) {
        fetchMessages(selectedConversation.user.id, false);
      }
    }, 3000); // Poll every 3 seconds for better real-time feel

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedConversation, fetchConversations, fetchUnreadCount, fetchMessages]);

  // Toggle starred conversation
  const toggleStarred = (userId: number) => {
    setStarredConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      // Save to localStorage - convert Set to Array for JSON
      const arrayFromSet: number[] = [];
      newSet.forEach(id => arrayFromSet.push(id));
      localStorage.setItem('starredConversations', JSON.stringify(arrayFromSet));
      return newSet;
    });
  };

  // Handle conversation selection
  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    lastMessageIdRef.current = 0; // Reset last message ID
    await fetchMessages(conversation.user.id);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!selectedConversation || (!newMessage.trim() && !selectedFile)) return;

    setSendingMessage(true);
    try {
      const outgoingText = buildReplyMessage(replyToMessage?.id ?? null, newMessage.trim()).trim();

      const messageData: SendMessageData = {
        receiver_id: selectedConversation.user.id,
        message: outgoingText || undefined,
        attachment: selectedFile || undefined,
      };

      // Add optimistic message immediately to avoid "Invalid Date" flash
      const optimisticMsg: Message = {
        id: Date.now(),
        sender_id: currentUserId || 0,
        receiver_id: selectedConversation.user.id,
        message: outgoingText,
        message_type: 'text',
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimisticMsg]);
      setTimeout(scrollToBottom, 50);

      const response = await messageService.sendMessage(messageData);
      
      // Replace optimistic message with real one
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? response.data.message : m));
      lastMessageIdRef.current = response.data.message.id;
      playOutgoingSound();
      
      // Clear input
      setNewMessage('');
      setReplyToMessage(null);
      clearFileSelection();
      
      // Refresh conversations to update last message
      fetchConversations();
      
      // Scroll to bottom
      setTimeout(scrollToBottom, 100);
    } catch (error: any) {
      notifyApiError(error, 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const requestDeleteMessage = (message: Message) => {
    setDeleteConfirmMessage(message);
  };

  const undoDeleteMessage = (messageId: number) => {
    const pending = pendingDeletesRef.current[messageId];
    if (!pending) return;

    clearTimeout(pending.timeoutId);
    delete pendingDeletesRef.current[messageId];

    setMessages((prev) => {
      if (prev.some((msg) => msg.id === pending.message.id)) return prev;
      const restored = [...prev];
      const insertAt = Math.max(0, Math.min(pending.index, restored.length));
      restored.splice(insertAt, 0, pending.message);
      return restored;
    });

    toast({ title: 'Message restored' });
  };

  const confirmDeleteMessage = () => {
    if (!deleteConfirmMessage) return;

    const messageToDelete = deleteConfirmMessage;
    setDeleteConfirmMessage(null);

    const originalIndex = messages.findIndex((msg) => msg.id === messageToDelete.id);
    setMessages((prev) => prev.filter((msg) => msg.id !== messageToDelete.id));

    const timeoutId = setTimeout(async () => {
      try {
        await messageService.deleteMessage(messageToDelete.id);
      } catch (error: any) {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === messageToDelete.id)) return prev;
          const restored = [...prev];
          const insertAt = Math.max(0, Math.min(originalIndex, restored.length));
          restored.splice(insertAt, 0, messageToDelete);
          return restored;
        });
        toast({
          title: 'Delete failed',
          description: error?.response?.data?.message || 'Could not delete message',
          variant: 'destructive',
        });
      } finally {
        delete pendingDeletesRef.current[messageToDelete.id];
      }
    }, 5000);

    pendingDeletesRef.current[messageToDelete.id] = {
      message: messageToDelete,
      index: originalIndex,
      timeoutId,
    };

    sonnerToast('Message deleted', {
      description: 'Undo available for 5 seconds',
      action: {
        label: 'Undo',
        onClick: () => undoDeleteMessage(messageToDelete.id),
      },
    });
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // Clear file selection
  const clearFileSelection = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Load initial users when dialog opens
  const loadInitialUsers = useCallback(async () => {
    setSearchingUsers(true);
    try {
      const response = await messageService.searchUsers('');
      setSearchedUsers(response.data.users);
      accessErrorRef.current = null;
    } catch (error) {
      console.error('Error loading initial users:', error);
      notifyApiError(error, 'Failed to load users');
    } finally {
      setSearchingUsers(false);
    }
  }, [notifyApiError]);

  // Search users for new conversation
  const handleSearchUsers = async (search: string) => {
    setUserSearchTerm(search);
    if (search.length < 2) {
      loadInitialUsers();
      return;
    }

    setSearchingUsers(true);
    try {
      const response = await messageService.searchUsers(search);
      setSearchedUsers(response.data.users);
      accessErrorRef.current = null;
    } catch (error) {
      console.error('Error searching users:', error);
      notifyApiError(error, 'Failed to search users');
    } finally {
      setSearchingUsers(false);
    }
  };

  // Start new conversation with user
  const handleStartConversation = (user: User) => {
    const existingConversation = conversations.find(c => c.user.id === user.id);
    
    if (existingConversation) {
      handleSelectConversation(existingConversation);
    } else {
      // Create a temporary conversation object
      const newConversation: Conversation = {
        user,
        last_message: {
          id: 0,
          message: '',
          message_type: 'text',
          is_read: true,
          created_at: new Date().toISOString(),
          sender_id: currentUserId || 0,
        },
        unread_count: 0,
      };
      setSelectedConversation(newConversation);
      setMessages([]);
    }
    
    setShowNewChatDialog(false);
    setUserSearchTerm('');
    setSearchedUsers([]);
  };

  // Sort and filter conversations
  const filteredConversations = conversations
    .filter(conv => {
      const fullName = `${conv.user.first_name} ${conv.user.last_name}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      // Starred conversations first
      const aStarred = starredConversations.has(a.user.id);
      const bStarred = starredConversations.has(b.user.id);
      if (aStarred && !bStarred) return -1;
      if (!aStarred && bStarred) return 1;
      // Then by unread count
      if (a.unread_count > 0 && b.unread_count === 0) return -1;
      if (a.unread_count === 0 && b.unread_count > 0) return 1;
      // Then by date
      return new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime();
    });

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getApiOrigin = () => {
    const fallback = 'http://localhost:8000';
    const configured = process.env.NEXT_PUBLIC_API_URL || `${fallback}/api`;
    try {
      return new URL(configured).origin;
    } catch {
      return fallback;
    }
  };

  const normalizeAttachmentUrl = (rawUrl: string) => {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl;

    const origin = getApiOrigin();
    if (rawUrl.startsWith('/storage/')) return `${origin}${rawUrl}`;
    if (rawUrl.startsWith('storage/')) return `${origin}/${rawUrl}`;
    return `${origin}/storage/${rawUrl.replace(/^\/+/, '')}`;
  };

  const formatDateHeader = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const messageDay = messageDate.toDateString();
    if (messageDay === today.toDateString()) return 'Today';
    if (messageDay === yesterday.toDateString()) return 'Yesterday';
    return messageDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const visibleMessages = useMemo(() => {
    const query = chatSearchTerm.trim().toLowerCase();
    return messages.filter((msg) => {
      const isMedia = msg.message_type !== 'text' || !!msg.attachment_url;
      if (showMediaOnly && !isMedia) return false;

      if (!query) return true;
      const { bodyText } = parseMessageContent(msg.message);
      const content = `${bodyText} ${msg.attachment_name || ''}`.toLowerCase();
      return content.includes(query);
    });
  }, [messages, chatSearchTerm, showMediaOnly]);

  const groupedMessages = useMemo(() => {
    const groups: Array<{ label: string; items: Message[] }> = [];
    let currentLabel = '';

    visibleMessages.forEach((msg) => {
      const label = formatDateHeader(msg.created_at);
      if (label !== currentLabel) {
        groups.push({ label, items: [msg] });
        currentLabel = label;
      } else {
        groups[groups.length - 1].items.push(msg);
      }
    });

    return groups;
  }, [visibleMessages]);

  const onMessageTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onMessageTouchEnd = (e: React.TouchEvent<HTMLDivElement>, message: Message, isOwnMessage: boolean) => {
    const startX = touchStartXRef.current;
    if (startX === null) return;

    const endX = e.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;

    if (deltaX > SWIPE_THRESHOLD_PX && !isOwnMessage) {
      setReplyToMessage(message);
    } else if (deltaX < -SWIPE_THRESHOLD_PX && isOwnMessage) {
      requestDeleteMessage(message);
    }
  };

  // Render message attachment
  const renderAttachment = (message: Message) => {
    if (!message.attachment_url) return null;

    const attachmentUrl = normalizeAttachmentUrl(message.attachment_url);

    switch (message.message_type) {
      case 'image':
        return (
          <div className="mt-2">
            <img
              src={attachmentUrl}
              alt={message.attachment_name || 'Image'}
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
              onClick={() => window.open(attachmentUrl, '_blank')}
            />
          </div>
        );
      case 'video':
        return (
          <div className="mt-2">
            <video
              src={attachmentUrl}
              controls
              className="max-w-xs rounded-lg"
            >
              Your browser does not support video playback.
            </video>
          </div>
        );
      case 'audio':
        return (
          <div className="mt-2 flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Volume2 className="w-4 h-4" />
            <audio src={attachmentUrl} controls className="h-8" />
          </div>
        );
      case 'file':
        return (
          <a
            href={attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={message.attachment_name || true}
            className="mt-2 flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FileIcon className="w-4 h-4" />
            <span className="text-sm truncate max-w-[150px]">
              {message.attachment_name || 'File'}
            </span>
            <span className="text-xs text-gray-500">
              {messageService.formatFileSize(message.attachment_size)}
            </span>
            <Download className="w-4 h-4 ml-auto" />
          </a>
        );
      default:
        return null;
    }
  };

  // Get user initials
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  // Get priority badge color
  const getPriorityColor = (unreadCount: number, isStarred: boolean) => {
    if (isStarred) return 'text-yellow-500';
    if (unreadCount >= 3) return 'text-red-500';
    if (unreadCount >= 1) return 'text-orange-500';
    return 'text-gray-300';
  };

  return (
    <DashboardLayout userType="agent">
      <div className="h-[calc(100vh-200px)]">
        <div className="flex h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border overflow-hidden">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Client Messages
                  {unreadCount > 0 && (
                    <Badge className="ml-2 bg-plp-purple text-white">
                      {unreadCount}
                    </Badge>
                  )}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
                  >
                    {notificationsEnabled ? (
                      <Bell className="w-4 h-4" />
                    ) : (
                      <BellOff className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                  <Dialog open={showNewChatDialog} onOpenChange={(open) => {
                    setShowNewChatDialog(open);
                    if (open) {
                      loadInitialUsers();
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Start New Conversation</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Search clients or users..."
                          value={userSearchTerm}
                          onChange={(e) => handleSearchUsers(e.target.value)}
                        />
                        {searchingUsers ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                        ) : (
                          <ScrollArea className="h-64">
                            {searchedUsers.length > 0 ? (
                              searchedUsers.map((user) => (
                              <div
                                key={user.id}
                                onClick={() => handleStartConversation(user)}
                                className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                              >
                                <Avatar>
                                  <AvatarImage src={user.profile_image} />
                                  <AvatarFallback>
                                    {getInitials(user.first_name, user.last_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {user.first_name} {user.last_name}
                                  </p>
                                  <p className="text-sm text-gray-500 capitalize">
                                    {user.user_type}
                                  </p>
                                </div>
                              </div>
                              ))
                            ) : (
                              <p className="text-center text-gray-500 py-4">
                                {userSearchTerm.length >= 2 ? 'No users found' : 'No users available'}
                              </p>
                            )}
                          </ScrollArea>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              {loadingConversations ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No client messages yet</p>
                  <p className="text-sm mt-1">Messages from clients will appear here</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.user.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedConversation?.user.id === conversation.user.id 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                        : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation.user.profile_image} />
                        <AvatarFallback>
                          {getInitials(conversation.user.first_name, conversation.user.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {conversation.user.first_name} {conversation.user.last_name}
                          </h3>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStarred(conversation.user.id);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            >
                              <Star 
                                className={`w-4 h-4 ${getPriorityColor(conversation.unread_count, starredConversations.has(conversation.user.id))}`}
                                fill={starredConversations.has(conversation.user.id) ? 'currentColor' : 'none'}
                              />
                            </button>
                            {conversation.unread_count > 0 && (
                              <Badge className="bg-plp-purple text-white text-xs">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 capitalize mb-1">
                          {conversation.user.user_type}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {messageService.getMessagePreview(conversation.last_message)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(conversation.last_message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedConversation.user.profile_image} />
                        <AvatarFallback>
                          {getInitials(selectedConversation.user.first_name, selectedConversation.user.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {selectedConversation.user.first_name} {selectedConversation.user.last_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {selectedConversation.user.user_type} • {selectedConversation.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Search chat/media..."
                        value={chatSearchTerm}
                        onChange={(e) => setChatSearchTerm(e.target.value)}
                        className="w-44 h-8"
                      />
                      <Button
                        variant={showMediaOnly ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setShowMediaOnly(prev => !prev)}
                        title="Toggle media only"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStarred(selectedConversation.user.id)}
                        title={starredConversations.has(selectedConversation.user.id) ? 'Unstar' : 'Star'}
                      >
                        <Star 
                          className={`w-4 h-4 ${starredConversations.has(selectedConversation.user.id) ? 'text-yellow-500' : ''}`}
                          fill={starredConversations.has(selectedConversation.user.id) ? 'currentColor' : 'none'}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          fetchConversations();
                          if (selectedConversation) {
                            fetchMessages(selectedConversation.user.id);
                          }
                        }}
                        title="Refresh"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {loadingMessages ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                          <Skeleton className="h-16 w-48 rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : visibleMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No matching messages</p>
                        <p className="text-sm mt-1">Try clearing search/media filters.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {groupedMessages.map((group, groupIndex) => (
                        <div key={`${group.label}-${group.items[0]?.id ?? groupIndex}`} className="space-y-1">
                          <div className="flex justify-center py-2">
                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                              {group.label}
                            </span>
                          </div>
                          {group.items.map((message, index) => {
                            const senderId = resolveMessageSenderId(message);
                            const isOwnMessage = currentUserId !== null && senderId === currentUserId;
                            return (
                              <div
                                key={`msg-${message.id}-${index}`}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} w-full`}
                                onTouchStart={onMessageTouchStart}
                                onTouchEnd={(e) => onMessageTouchEnd(e, message, isOwnMessage)}
                                ref={(el) => {
                                  messageRefsRef.current[message.id] = el;
                                }}
                              >
                                <div
                                  className={`max-w-[75%] lg:max-w-[65%] px-3 py-1.5 rounded-lg ${
                                    isOwnMessage
                                      ? 'bg-plp-purple text-white rounded-br-none'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                                  }`}
                                >
                                  {(() => {
                                    const { replyToId, bodyText } = parseMessageContent(message.message);
                                    const repliedMessage = replyToId ? messages.find((msg) => msg.id === replyToId) : null;
                                    const repliedPreview = repliedMessage
                                      ? (parseMessageContent(repliedMessage.message).bodyText || repliedMessage.attachment_name || 'Media')
                                      : 'Original message';

                                    return (
                                      <>
                                        {replyToId && (
                                          <button
                                            type="button"
                                            onClick={() => scrollToReferencedMessage(replyToId)}
                                            className={`w-full text-left mb-1 rounded-md px-2 py-1 border-l-2 ${
                                              isOwnMessage
                                                ? 'bg-white/15 border-white/50 hover:bg-white/20'
                                                : 'bg-black/5 border-plp-purple/50 hover:bg-black/10'
                                            }`}
                                          >
                                            <div className="flex items-center gap-1 text-[10px] font-medium opacity-90">
                                              <Reply className="w-3 h-3" />
                                              Replied message
                                            </div>
                                            <div className="text-xs truncate opacity-80">{repliedPreview}</div>
                                          </button>
                                        )}
                                        {bodyText && (
                                          <p className="text-sm whitespace-pre-wrap break-words">{bodyText}</p>
                                        )}
                                      </>
                                    );
                                  })()}
                                  {renderAttachment(message)}
                                  <div className={`flex items-center gap-1 mt-0.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                    {!isOwnMessage && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 px-1"
                                        onClick={() => setReplyToMessage(message)}
                                      >
                                        <Reply className="w-3 h-3" />
                                      </Button>
                                    )}
                                    {isOwnMessage && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 px-1 text-red-300 hover:text-red-200"
                                        onClick={() => requestDeleteMessage(message)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                    <span className={`text-[10px] leading-none ${
                                      isOwnMessage ? 'text-purple-200' : 'text-gray-400'
                                    }`}>
                                      {formatMessageTime(message.created_at)}
                                    </span>
                                    {isOwnMessage && (
                                      message.is_read ? (
                                        <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                                      ) : (
                                        <Check className="w-3.5 h-3.5 text-purple-200" />
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* File Preview */}
                {selectedFile && (
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      {filePreview ? (
                        <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                          <FileIcon className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {messageService.formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={clearFileSelection}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  {replyToMessage && (
                    <div className="mb-2 p-2 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-between">
                      <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                        Replying to: {parseMessageContent(replyToMessage.message).bodyText || replyToMessage.attachment_name || 'Media'}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setReplyToMessage(null)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-end space-x-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                      onChange={handleFileSelect}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sendingMessage}
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.accept = 'image/*';
                          fileInputRef.current.click();
                          fileInputRef.current.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt';
                        }
                      }}
                      disabled={sendingMessage}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="min-h-[40px] max-h-32 resize-none"
                        disabled={sendingMessage}
                      />
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={(!newMessage.trim() && !selectedFile) || sendingMessage}
                      className="btn-primary"
                    >
                      {sendingMessage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm mt-1">Choose a client conversation from the list or start a new one</p>
                  <Button
                    className="mt-4"
                    onClick={() => setShowNewChatDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <AlertDialog open={!!deleteConfirmMessage} onOpenChange={(open) => !open && setDeleteConfirmMessage(null)}>
        <AlertDialogContent className="border-plp-purple/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-plp-purple">Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              This message will be removed. You can undo within 5 seconds after confirming.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-plp-pink hover:bg-plp-pink/90" onClick={confirmDeleteMessage}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
