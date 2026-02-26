'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { messageService } from '@/services/messageService';
import { notificationService } from '@/services/notificationService';
import { authService } from '@/services/authService';

/**
 * Global Web Push Notification Provider for all real-time notifications.
 * Runs across all pages, polls for new unread messages AND notifications,
 * and fires browser Notification API alerts with sound when new items arrive.
 *
 * Features:
 * - Requests notification permission on mount
 * - Polls unread message count every 15 seconds
 * - Polls unread notification count every 15 seconds
 * - Shows native browser notification when counts increase
 * - Plays a notification sound
 * - Only active when the user is authenticated
 */

// Notification beep sound (base64-encoded WAV)
const NOTIFICATION_SOUND_URL =
  'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1zdHp7d29naGpucHRxbWVjYV9aWVZQTElGRENAPz09Ojo3NTMxLy0rKSglIyEfHRsZFxUTEQ8NCwkHBQMBAAIEBggKDA4QEhQWGBocHiAiJCYoKiwtLzEzNTc5Ozw+QEJESE1RVVpfZGltcnZ6foKGio2RlJeam52foaOlp6mqrK2ur7CxsbKysrKysrGwr62rqaelpKKgnp2bmZeVk5GQjo2LiomIh4aFhIOCgYCAf35+fn5+fn5+f4CBgoOEhYaIiYqLjI6PkJGSk5SVlpeYmJmam5ucnJ2dnZ6enp6enp6dnZ2cm5uamZmYl5aVlJOSkZCPjo2MioqIh4aFhIKBgH9+fXx7enl5eHh3d3d3d3d4eHh5enp7fH1+f4CBgoOEhYaHiImKi4yNjY6PkJCRkZKSk5OTlJSUlJSUlJSUlJSTk5OSkpKRkZCQj4+OjY2MjIuKiomIiIeGhYWEg4OCgYGAgH9/fn59fXx8fHx8fHx8fHx9fX1+fn9/gICBgoKDg4SFhYaGh4iIiYmKiouLjIyMjY2Ojo6Ojo+Pj4+Pj4+Pj4+Pjo6OjY2NjIyLi4uKiomJiIiHhoaFhYSEg4OCgoGBgIB/f35+fn19fX19fHx8fHx8fXx9fX1+fn5/f4CAgIGBgoKDg4SFhYaGh4eIiImJiYqKi4uLjIyMjIyNjY2NjY2NjY2NjY2NjIyMjIyLi4uKioqJiYiIh4eGhoWFhISEg4OCgoGBgICAf39/fn5+fn19fX19fX19fX19fn5+fn9/f4CAgICBgYKCgoODhISEhYWGhoaHh4eIiIiIiYmJiYmJiomJiYmJiYmJiYmJiYmIiIiIh4eHhoaGhYWEhIODgoKBgYGAgIB/f39+fn5+fn5+fn5+fn5+fn5+fn9/f39/gICAgICBgYGBgoKCgoODg4ODhISEhISFhYWFhYWFhYaGhoaGhoaGhoaGhoaGhoWFhYWFhYSEhISEg4ODg4KCgoKBgYGBgICAgH9/f39/fn5+fn5+fn5+fn5+fn9/f39/f39/gICAgIGBgYGBgYKCgoKCg4ODg4ODg4SEhISEhISEhISEhYWFhYWFhYWFhYWFhYWFhYWEhISEhISEg4ODg4OCgoKCgoGBgYGBgICAgIB/f39/f39/f39/fn5/f39/f39/f39/f3+AgICAgICAgYGBgYGBgoKCgoKCgoODg4ODg4ODg4SEhISEhISEhISEhISEhISEhISEhISEhIODg4ODg4ODgoKCgoKCgYGBgYGBgICAgICAgH9/f39/f39/f39/f39/f39/f39/gICAgICAgICAgYGBgYGBgYGBgoKCgoKCgoKCg4ODg4ODg4ODg4ODg4ODg4SDg4ODg4ODg4ODg4ODg4KCgoKCgoKCgoKBgYGBgYGBgYCAgICAgICAgH9/f39/f39/f39/f39/f4CAgICAgICAgICAgICAgIGBgYGBgYGBgYGBgYKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgYGBgYGBgYGBgYGBgYCAgICAgICAgICAgICAgICAgH+AgICAgICAgICAgICAgICAgICAgIGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';

interface PushNotificationProviderProps {
  children: React.ReactNode;
}

export function PushNotificationProvider({ children }: PushNotificationProviderProps) {
  const prevUnreadMsgRef = useRef<number | null>(null);
  const prevUnreadNotifRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
      audioRef.current.volume = 0.5;
    }
    return () => {
      audioRef.current = null;
    };
  }, []);

  // Check auth & request notification permission
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authed = await authService.isAuthenticated();
        setIsAuthenticated(authed);
        if (authed && typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'default') {
            Notification.requestPermission();
          }
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // ignore – user may not have interacted with the page yet
      });
    }
  }, []);

  const showBrowserNotification = useCallback(
    (title: string, body: string, url?: string) => {
      if (
        typeof window === 'undefined' ||
        !('Notification' in window) ||
        Notification.permission !== 'granted'
      ) {
        return;
      }
      const notification = new window.Notification(title, {
        body,
        icon: '/logo-images/PlpLisitng-Fav-Icon-8.png',
        badge: '/logo-images/PlpLisitng-Fav-Icon-8.png',
        tag: `plp-notification-${Date.now()}`,
      });

      notification.onclick = () => {
        window.focus();
        if (url) {
          window.location.href = url;
        }
        notification.close();
      };

      // Auto-close after 6 seconds
      setTimeout(() => notification.close(), 6000);
    },
    [],
  );

  // Poll for new unread messages and notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const poll = async () => {
      try {
        // Poll messages
        const msgRes = await messageService.getUnreadCount();
        const msgCount = msgRes.data?.unread_count ?? 0;

        if (prevUnreadMsgRef.current !== null && msgCount > prevUnreadMsgRef.current) {
          const diff = msgCount - prevUnreadMsgRef.current;
          playSound();
          showBrowserNotification(
            'New Message',
            diff === 1
              ? 'You have a new unread message'
              : `You have ${diff} new unread messages`,
            '/dashboard/messages',
          );
        }
        prevUnreadMsgRef.current = msgCount;
      } catch {
        // Silently ignore
      }

      try {
        // Poll notifications (property approvals, agent approvals, etc.)
        const notifRes = await notificationService.getUnreadCount();
        const notifCount = notifRes.data?.unread_count ?? 0;

        if (prevUnreadNotifRef.current !== null && notifCount > prevUnreadNotifRef.current) {
          // Fetch latest notification to show its content
          try {
            const recentRes = await notificationService.getRecentNotifications(1);
            const latestNotif = recentRes.data?.notifications?.[0];
            
            if (latestNotif && !latestNotif.is_read) {
              playSound();
              showBrowserNotification(
                latestNotif.title || 'New Notification',
                latestNotif.message || 'You have a new notification',
                latestNotif.action_url || '/dashboard',
              );
            } else {
              playSound();
              const diff = notifCount - (prevUnreadNotifRef.current ?? 0);
              showBrowserNotification(
                'New Notification',
                diff === 1
                  ? 'You have a new notification'
                  : `You have ${diff} new notifications`,
                '/dashboard',
              );
            }
          } catch {
            playSound();
            showBrowserNotification(
              'New Notification',
              'You have new notifications',
              '/dashboard',
            );
          }
        }
        prevUnreadNotifRef.current = notifCount;
      } catch {
        // Silently ignore
      }
    };

    // Initial fetch (don't alert on first load)
    const initFetch = async () => {
      try {
        const msgRes = await messageService.getUnreadCount();
        prevUnreadMsgRef.current = msgRes.data?.unread_count ?? 0;
      } catch {
        prevUnreadMsgRef.current = 0;
      }
      try {
        const notifRes = await notificationService.getUnreadCount();
        prevUnreadNotifRef.current = notifRes.data?.unread_count ?? 0;
      } catch {
        prevUnreadNotifRef.current = 0;
      }
    };

    initFetch();

    // Start polling every 15 seconds
    pollingRef.current = setInterval(poll, 15000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isAuthenticated, playSound, showBrowserNotification]);

  return <>{children}</>;
}
