'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Bell, Check, CheckCheck, Trash2, Filter, Search,
  Star, Calendar, Building2, UserPlus, MessageSquare, Shield, CheckCircle,
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { notificationService, type Notification, type NotificationType } from '@/services/notificationService';
import { formatDistanceToNow, format } from 'date-fns';

interface NotificationsPageProps {
  userType: 'customer' | 'owner' | 'agent' | 'admin';
}

const iconMap: Record<NotificationType, React.ReactNode> = {
  review: <Star className="w-5 h-5" />,
  booking: <Calendar className="w-5 h-5" />,
  property: <Building2 className="w-5 h-5" />,
  registration: <UserPlus className="w-5 h-5" />,
  message: <MessageSquare className="w-5 h-5" />,
  system: <Bell className="w-5 h-5" />,
  agent_approval: <Shield className="w-5 h-5" />,
  property_approval: <CheckCircle className="w-5 h-5" />,
};

const typeLabels: Record<NotificationType, string> = {
  review: 'Reviews',
  booking: 'Bookings',
  property: 'Properties',
  registration: 'Registrations',
  message: 'Messages',
  system: 'System',
  agent_approval: 'Agent Approvals',
  property_approval: 'Property Approvals',
};

export function NotificationsPage({ userType }: NotificationsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Get locale from pathname
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] || 'en';

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: any = {
        per_page: 15,
        page: currentPage,
      };
      
      if (selectedType !== 'all') {
        filters.type = selectedType as NotificationType;
      }
      
      if (showUnreadOnly) {
        filters.unread_only = true;
      }

      const response = await notificationService.getNotifications(filters);
      setNotifications(response.data.data);
      setTotalPages(response.data.last_page);
      setTotalNotifications(response.data.total);

      // Get unread count
      const countResponse = await notificationService.getUnreadCount();
      setUnreadCount(countResponse.data.unread_count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedType, showUnreadOnly]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.is_read) return;
    
    try {
      await notificationService.markAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (notification: Notification) => {
    try {
      await notificationService.deleteNotification(notification.id);
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setTotalNotifications(prev => prev - 1);
      if (!notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      await notificationService.deleteReadNotifications();
      fetchNotifications();
      toast.success('Read notifications deleted');
    } catch (error) {
      console.error('Failed to delete read notifications:', error);
      toast.error('Failed to delete read notifications');
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
      router.push(`/${locale}${notification.action_url}`);
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    return notificationService.getNotificationColor(type);
  };

  const getNotificationBgColor = (type: NotificationType) => {
    return notificationService.getNotificationBgColor(type);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'You\'re all caught up!'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear read
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete read notifications?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all read notifications. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllRead} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedType} onValueChange={(value) => { setSelectedType(value); setCurrentPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All notifications</SelectItem>
                  {Object.entries(typeLabels).map(([type, label]) => (
                    <SelectItem key={type} value={type}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant={showUnreadOnly ? "default" : "outline"} 
              onClick={() => { setShowUnreadOnly(!showUnreadOnly); setCurrentPage(1); }}
              className={showUnreadOnly ? 'bg-plp-purple hover:bg-plp-purple/90' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              Unread only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedType === 'all' ? 'All Notifications' : typeLabels[selectedType as NotificationType]}
          </CardTitle>
          <CardDescription>
            Showing {notifications.length} of {totalNotifications} notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-plp-purple" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
              <p className="text-gray-500">
                {showUnreadOnly ? 'You have no unread notifications' : 'You don\'t have any notifications yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`py-4 px-2 hover:bg-gray-50 transition-colors cursor-pointer rounded-lg ${
                    !notification.is_read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getNotificationBgColor(notification.type)}`}>
                      <span className={getNotificationColor(notification.type)}>
                        {iconMap[notification.type]}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                            {notification.read_at && (
                              <span>Read {formatDistanceToNow(new Date(notification.read_at), { addSuffix: true })}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification); }}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete notification?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this notification.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(notification)} 
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t mt-6">
              <p className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
