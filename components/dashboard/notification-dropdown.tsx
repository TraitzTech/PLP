'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Check, CheckCheck, Trash2, Star, Calendar, Building2, UserPlus, MessageSquare, Shield, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { notificationService, type Notification, type NotificationType } from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  userType: 'customer' | 'owner' | 'agent' | 'admin';
}

const iconMap: Record<NotificationType, React.ReactNode> = {
  review: <Star className="w-4 h-4" />,
  booking: <Calendar className="w-4 h-4" />,
  property: <Building2 className="w-4 h-4" />,
  registration: <UserPlus className="w-4 h-4" />,
  message: <MessageSquare className="w-4 h-4" />,
  system: <Bell className="w-4 h-4" />,
  agent_approval: <Shield className="w-4 h-4" />,
  property_approval: <CheckCircle className="w-4 h-4" />,
};

export function NotificationDropdown({ userType }: NotificationDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasLoadedRef = useRef(false);
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  // Get locale from pathname
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] || 'en';

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        // Silently catch the "NotAllowedError" which happens if user hasn't interacted with page yet
        if (err.name !== 'NotAllowedError') {
          console.error('Error playing sound:', err);
        }
      });
    }
  }, []);

  const showWebNotification = useCallback((notification: Notification) => {
    if (!('Notification' in window)) return;
    
    // Check if we've already notified for this notification ID to avoid repeats on refresh
    if (notifiedIdsRef.current.has(notification.id.toString())) return;

    if (Notification.permission === 'granted') {
      const n = new window.Notification(notification.title, {
        body: notification.message,
        icon: '/logo-images/PlpLisitng-Fav-Icon.svg'
      });
      
      // Mark as notified
      notifiedIdsRef.current.add(notification.id.toString());
      
      n.onclick = () => {
        window.focus();
        handleNotificationClick(notification);
        n.close();
      };
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getRecentNotifications(7);
      const newNotifications = response.data.notifications;
      const newUnreadCount = response.data.unread_count;

      // Update notified list with current unread notifications so they aren't re-alerted on refresh
      if (!hasLoadedRef.current) {
        newNotifications.forEach(n => {
          if (!n.is_read) notifiedIdsRef.current.add(n.id.toString());
        });
        hasLoadedRef.current = true;
      } else {
        // If we have more unread notifications than before, play sound and show web notification
        if (newUnreadCount > unreadCount) {
          playNotificationSound();
          
          // Find the newest unread notification that hasn't been notified yet
          const latestUnread = newNotifications.find(n => !n.is_read && !notifiedIdsRef.current.has(n.id.toString()));
          if (latestUnread) {
            showWebNotification(latestUnread);
          }
        }
      }

      setNotifications(newNotifications);
      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [unreadCount, playNotificationSound, showWebNotification]);

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (notification.is_read) return;
    
    try {
      await notificationService.markAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.is_read) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    // Navigate to action URL if present
    if (notification.action_url) {
      setIsOpen(false);
      router.push(`/${locale}${notification.action_url}`);
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    return notificationService.getNotificationColor(type);
  };

  const getNotificationBgColor = (type: NotificationType) => {
    return notificationService.getNotificationBgColor(type);
  };

  const getNotificationsPageUrl = () => {
    switch (userType) {
      case 'admin':
        return `/${locale}/admin/notifications`;
      case 'agent':
        return `/${locale}/dashboard/agent/notifications`;
      case 'owner':
        return `/${locale}/dashboard/owner/notifications`;
      default:
        return `/${locale}/dashboard/notifications`;
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto py-1 px-2 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No notifications</p>
              <p className="text-sm">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-3 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-b-0 ${
                    !notification.is_read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationBgColor(notification.type)}`}>
                      <span className={getNotificationColor(notification.type)}>
                        {iconMap[notification.type]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 shrink-0"
                            onClick={(e) => handleMarkAsRead(notification, e)}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="justify-center cursor-pointer"
          onClick={() => {
            setIsOpen(false);
            router.push(getNotificationsPageUrl());
          }}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
}
