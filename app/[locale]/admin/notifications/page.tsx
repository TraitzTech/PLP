"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  Filter,
  MoreVertical,
  Trash2,
  User,
  Home,
  DollarSign,
  AlertCircle,
  Info,
  Star,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type NotificationType = "success" | "info" | "warning" | "error" | "message";
type NotificationCategory = "all" | "property" | "booking" | "payment" | "system" | "message";

interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: {
    propertyName?: string;
    amount?: number;
    userName?: string;
  };
}

interface NotificationsPageProps {
  userType: "admin" | "agent" | "customer";
}

// Mock notifications data
const generateMockNotifications = (userType: string): Notification[] => {
  const baseNotifications: Notification[] = [
    {
      id: "1",
      type: "success",
      category: "property",
      title: "Property Approved",
      message: "Your property 'Modern Villa in Bamenda' has been approved and is now live.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      isRead: false,
      metadata: { propertyName: "Modern Villa in Bamenda" },
    },
    {
      id: "2",
      type: "info",
      category: "booking",
      title: "New Booking Request",
      message: "John Doe has requested to book 'Luxury Apartment' for 3 nights.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: false,
      metadata: { userName: "John Doe", propertyName: "Luxury Apartment" },
    },
    {
      id: "3",
      type: "success",
      category: "payment",
      title: "Payment Received",
      message: "Payment of 500,000 XAF received for booking #BK-2024-001.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      isRead: true,
      metadata: { amount: 500000 },
    },
    {
      id: "4",
      type: "warning",
      category: "property",
      title: "Property Requires Attention",
      message: "Your property listing is missing some required photos. Please update.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: true,
    },
    {
      id: "5",
      type: "message",
      category: "message",
      title: "New Message",
      message: "Sarah Williams sent you a message about 'Beachfront Property'.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      isRead: false,
      metadata: { userName: "Sarah Williams" },
    },
    {
      id: "6",
      type: "info",
      category: "system",
      title: "System Update",
      message: "New features have been added to the dashboard. Check them out!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isRead: true,
    },
    {
      id: "7",
      type: "success",
      category: "booking",
      title: "Booking Confirmed",
      message: "Booking #BK-2024-002 has been confirmed by the customer.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      isRead: true,
    },
    {
      id: "8",
      type: "error",
      category: "payment",
      title: "Payment Failed",
      message: "Payment for booking #BK-2024-003 was declined. Please contact customer.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      isRead: true,
    },
  ];

  if (userType === "admin") {
    return [
      ...baseNotifications,
      {
        id: "9",
        type: "warning",
        category: "system",
        title: "Pending Agent Approvals",
        message: "5 new agent registration requests are pending your review.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        isRead: false,
      },
      {
        id: "10",
        type: "info",
        category: "property",
        title: "Property Pending Review",
        message: "3 new properties are waiting for admin approval.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        isRead: false,
      },
    ];
  }

  return baseNotifications;
};

export default function NotificationsPage({ userType }: NotificationsPageProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(
    generateMockNotifications(userType)
  );
  const [filter, setFilter] = useState<NotificationCategory>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [swipedNotification, setSwipedNotification] = useState<string | null>(null);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCheck className="h-5 w-5 text-green-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-purple-600" />;
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "property":
        return <Home className="h-4 w-4" />;
      case "booking":
        return <Calendar className="h-4 w-4" />;
      case "payment":
        return <DollarSign className="h-4 w-4" />;
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      case "system":
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    toast.success("Notification marked as read");
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("All notifications marked as read");
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
    setDeleteDialogOpen(false);
    setNotificationToDelete(null);
  };

  const deleteAllRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));
    toast.success("All read notifications deleted");
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === "all" ? true : n.category === filter
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSwipeStart = (id: string) => {
    setSwipedNotification(id);
  };

  const handleSwipeEnd = () => {
    setTimeout(() => setSwipedNotification(null), 300);
  };

  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Bell className="h-8 w-8" />
                Notifications
              </h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setFilter("all")}>
                  <Bell className="h-4 w-4 mr-2" />
                  All Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("property")}>
                  <Home className="h-4 w-4 mr-2" />
                  Properties
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("booking")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Bookings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("payment")}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payments
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("message")}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("system")}>
                  <Info className="h-4 w-4 mr-2" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
            <Button variant="outline" onClick={deleteAllRead}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Read
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === "property" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("property")}
          >
            <Home className="h-4 w-4 mr-1" />
            Properties
          </Button>
          <Button
            variant={filter === "booking" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("booking")}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Bookings
          </Button>
          <Button
            variant={filter === "payment" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("payment")}
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Payments
          </Button>
          <Button
            variant={filter === "message" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("message")}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Messages
          </Button>
          <Button
            variant={filter === "system" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("system")}
          >
            <Info className="h-4 w-4 mr-1" />
            System
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    {filter === "all"
                      ? "You're all caught up!"
                      : `No ${filter} notifications at the moment`}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-200 hover:shadow-md",
                  !notification.isRead && "border-l-4 border-l-plp-purple bg-purple-50/30",
                  swipedNotification === notification.id && "translate-x-[-80px]"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                        notification.type === "success" && "bg-green-100",
                        notification.type === "info" && "bg-blue-100",
                        notification.type === "warning" && "bg-yellow-100",
                        notification.type === "error" && "bg-red-100",
                        notification.type === "message" && "bg-purple-100"
                      )}
                    >
                      {getIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="h-2 w-2 rounded-full bg-plp-purple" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {getCategoryIcon(notification.category)}
                              {notification.category}
                            </span>
                            <span>•</span>
                            <span>{getTimeAgo(notification.timestamp)}</span>
                          </div>
                        </div>

                        {/* Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="flex-shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.isRead && (
                              <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                <Check className="h-4 w-4 mr-2" />
                                Mark as read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setNotificationToDelete(notification.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Swipe Action Button */}
                <div
                  className={cn(
                    "absolute right-0 top-0 h-full flex items-center transition-all duration-200",
                    swipedNotification === notification.id ? "translate-x-0" : "translate-x-full"
                  )}
                >
                  {!notification.isRead && (
                    <Button
                      size="sm"
                      className="h-full rounded-none bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        markAsRead(notification.id);
                        handleSwipeEnd();
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="h-full rounded-none bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      deleteNotification(notification.id);
                      handleSwipeEnd();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-none">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-plp-purple flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Swipe to interact</h4>
                <p className="text-sm text-muted-foreground">
                  Swipe left on notifications to quickly mark as read or delete them. You can also use the menu button for more options.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => notificationToDelete && deleteNotification(notificationToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}