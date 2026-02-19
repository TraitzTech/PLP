'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
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
  Loader2
} from 'lucide-react';
import messageService, { 
  Conversation, 
  Message, 
  User,
  SendMessageData 
} from '@/services/messageService';

// Notification sound (base64 encoded short beep)
const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1zdHp7d29naGpucHRxbWVjYV9aWVZQTElGRENAPz09Ojo3NTMxLy0rKSglIyEfHRsZFxUTEQ8NCwkHBQMBAAIEBggKDA4QEhQWGBocHiAiJCYoKiwtLzEzNTc5Ozw+QEJESE1RVVpfZGltcnZ6foKGio2RlJeam52foaOlp6mqrK2ur7CxsbKysrKysrGwr62rqaelpKKgnp2bmZeVk5GQjo2LiomIh4aFhIOCgYCAf35+fn5+fn5+f4CBgoOEhYaIiYqLjI6PkJGSk5SVlpeYmJmam5ucnJ2dnZ6enp6enp6dnZ2cm5uamZmYl5aVlJOSkZCPjo2MioqIh4aFhIKBgH9+fXx7enl5eHh3d3d3d3d4eHh5enp7fH1+f4CBgoOEhYaHiImKi4yNjY6PkJCRkZKSk5OTlJSUlJSUlJSUlJSTk5OSkpKRkZCQj4+OjY2MjIuKiomIiIeGhYWEg4OCgYGAgH9/fn59fXx8fHx8fHx8fHx9fX1+fn9/gICBgoKDg4SFhYaGh4iIiYmKiouLjIyMjY2Ojo6Ojo+Pj4+Pj4+Pj4+Pjo6OjY2NjIyLi4uKiomJiIiHhoaFhYSEg4OCgoGBgIB/f35+fn19fX19fHx8fHx8fXx9fX1+fn5/f4CAgIGBgoKDg4SFhYaGh4eIiImJiYqKi4uLjIyMjIyNjY2NjY2NjY2NjY2NjIyMjIyLi4uKioqJiYiIh4eGhoWFhISEg4OCgoGBgICAf39/fn5+fn19fX19fX19fX19fn5+fn9/f4CAgICBgYKCgoODhISEhYWGhoaHh4eIiIiIiYmJiYmJiomJiYmJiYmJiYmJiYmIiIiIh4eHhoaGhYWEhIODgoKBgYGAgIB/f39+fn5+fn19fX19fX19fX19fn5+fn9/f39/gICAgYGBgYKCgoODg4SEhISFhYWFhoaGhoeHh4eHh4eHh4eHh4eHh4eHh4eGhoaGhYWFhYWEhIODg4KCgoGBgYCAgH9/f39+fn5+fn5+fn5+fn5+fn5+fn9/f39/gICAgICBgYGBgoKCgoODg4ODhISEhISFhYWFhYWFhYaGhoaGhoaGhoaGhoaGhoWFhYWFhYSEhISEg4ODg4KCgoKBgYGBgICAgH9/f39/fn5+fn5+fn5+fn5+fn9/f39/f39/gICAgIGBgYGBgYKCgoKCg4ODg4ODg4SEhISEhISEhISEhYWFhYWFhYWFhYWFhYWFhYWEhISEhISEg4ODg4OCgoKCgoGBgYGBgICAgIB/f39/f39/f39/fn5/f39/f39/f39/f3+AgICAgICAgYGBgYGBgoKCgoKCgoODg4ODg4ODg4SEhISEhISEhISEhISEhISEhISEhISEhIODg4ODg4ODgoKCgoKCgYGBgYGBgICAgICAgH9/f39/f39/f39/f39/f39/f39/gICAgICAgICAgYGBgYGBgYGBgoKCgoKCgoKCg4ODg4ODg4ODg4ODg4ODg4SDg4ODg4ODg4ODg4ODg4KCgoKCgoKCgoKBgYGBgYGBgYCAgICAgICAgH9/f39/f39/f39/f39/f4CAgICAgICAgICAgICAgIGBgYGBgYGBgYGBgYKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgYGBgYGBgYGBgYGBgYCAgICAgICAgICAgICAgICAgH+AgICAgICAgICAgICAgICAgICAgIGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';

export default function AdminMessagesPage() {
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
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<number>(0);
  
  const { toast } = useToast();

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
    audioRef.current.volume = 0.5;
    
    // Get current user ID from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUserId(Number(user.id));
      } catch (e) {
        console.error('Error parsing user data:', e);
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

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (audioRef.current && notificationsEnabled) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [notificationsEnabled]);

  // Show web notification
  const showWebNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted' && notificationsEnabled) {
      new Notification(title, {
        body,
        icon: '/logo.png',
        tag: 'admin-message-notification',
      });
    }
  }, [notificationsEnabled]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await messageService.getConversations();
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (userId: number, showLoading = true) => {
    if (showLoading) setLoadingMessages(true);
    try {
      const response = await messageService.getConversation(userId);
      const newMessages = response.data.messages;
      
      // Check for new messages and play sound
      if (!showLoading && newMessages.length > 0) {
        const latestMessage = newMessages[newMessages.length - 1];
        if (latestMessage.id > lastMessageIdRef.current && latestMessage.sender_id !== currentUserId) {
          playNotificationSound();
          showWebNotification(
            'New Message', 
            `${latestMessage.sender?.first_name || 'Someone'}: ${messageService.getMessagePreview(latestMessage)}`
          );
        }
      }
      
      // Update last message ID
      if (newMessages.length > 0) {
        lastMessageIdRef.current = newMessages[newMessages.length - 1].id;
      }
      
      setMessages(newMessages);
      
      // Mark conversation as read
      await messageService.markConversationAsRead(userId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [currentUserId, playNotificationSound, showWebNotification]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await messageService.getUnreadCount();
      const newCount = response.data.unread_count;
      
      if (newCount > unreadCount && notificationsEnabled && !selectedConversation) {
        playNotificationSound();
        showWebNotification('New Message', 'You have new unread messages');
      }
      
      setUnreadCount(newCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [unreadCount, notificationsEnabled, selectedConversation, playNotificationSound, showWebNotification]);

  // Initial load - also load initial users for new conversation dialog
  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
  }, []);

  // Poll for new messages
  useEffect(() => {
    pollingIntervalRef.current = setInterval(() => {
      fetchConversations();
      fetchUnreadCount();
      if (selectedConversation) {
        fetchMessages(selectedConversation.user.id, false);
      }
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedConversation, fetchConversations, fetchUnreadCount, fetchMessages]);

  // Handle conversation selection
  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    lastMessageIdRef.current = 0;
    await fetchMessages(conversation.user.id);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!selectedConversation || (!newMessage.trim() && !selectedFile)) return;

    setSendingMessage(true);
    try {
      const messageData: SendMessageData = {
        receiver_id: selectedConversation.user.id,
        message: newMessage.trim() || undefined,
        attachment: selectedFile || undefined,
      };

      const response = await messageService.sendMessage(messageData);
      
      setMessages(prev => [...prev, response.data.message]);
      lastMessageIdRef.current = response.data.message.id;
      
      setNewMessage('');
      clearFileSelection();
      fetchConversations();
      setTimeout(scrollToBottom, 100);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);

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
      // Use a space search to get all users (backend returns users for admin)
      const response = await messageService.searchUsers('  ');
      // If empty, try a broader search
      if (response.data.users.length === 0) {
        const resp2 = await messageService.searchUsers('a');
        setSearchedUsers(resp2.data.users);
      } else {
        setSearchedUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error loading initial users:', error);
    } finally {
      setSearchingUsers(false);
    }
  }, []);

  // Search users for new conversation
  const handleSearchUsers = async (search: string) => {
    setUserSearchTerm(search);
    if (search.length < 2) {
      // When search is cleared, load initial users
      if (search.length === 0) {
        loadInitialUsers();
      }
      return;
    }

    setSearchingUsers(true);
    try {
      const response = await messageService.searchUsers(search);
      setSearchedUsers(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
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

  // Filter conversations by search term
  const filteredConversations = conversations.filter(conv => {
    const fullName = `${conv.user.first_name} ${conv.user.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
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

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render message attachment
  const renderAttachment = (message: Message) => {
    if (!message.attachment_url) return null;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';
    const attachmentUrl = `${baseUrl}/storage/${message.attachment_url}`;

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
            <video src={attachmentUrl} controls className="max-w-xs rounded-lg">
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

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  return (
    <DashboardLayout userType="admin">
      <div className="h-[calc(100vh-200px)]">
        <div className="flex h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border overflow-hidden">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Messages
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
                        <DialogTitle>New Conversation</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Search users..."
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
                                {userSearchTerm.length >= 2 ? 'No users found' : 'Type to search users'}
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
                  <p>No conversations yet</p>
                  <p className="text-sm mt-1">Start a new conversation!</p>
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
                          {conversation.unread_count > 0 && (
                            <Badge className="bg-plp-purple text-white text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
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
                          {selectedConversation.user.user_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
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
                  ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No messages yet</p>
                        <p className="text-sm mt-1">Send a message to start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        const isOwnMessage = Number(message.sender_id) === Number(currentUserId);
                        return (
                          <div
                            key={`msg-${message.id}-${index}`}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwnMessage
                                  ? 'bg-plp-purple text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                              }`}
                            >
                              {message.message && (
                                <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                              )}
                              {renderAttachment(message)}
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <p className={`text-xs ${
                                  isOwnMessage ? 'text-purple-200' : 'text-gray-500'
                                }`}>
                                  {formatMessageTime(message.created_at)}
                                </p>
                                {isOwnMessage && message.is_read && (
                                  <span className="text-xs text-purple-200">&#10003;&#10003;</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                  <p className="text-sm mt-1">Choose a conversation from the list or start a new one</p>
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
    </DashboardLayout>
  );
}
