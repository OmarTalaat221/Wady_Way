import { useState, useMemo } from "react";

// Sample notifications data - in a real app this would come from an API
const initialNotifications = [
  {
    id: 1,
    title: "Booking Confirmed",
    message: "Your booking for Maldives Island Tour has been confirmed.",
    time: "Just now",
    type: "booking",
    isRead: false,
  },
  {
    id: 2,
    title: "Payment Successful",
    message:
      "Your payment of $1,250 for Maldives Island Tour has been processed successfully.",
    time: "2 hours ago",
    type: "payment",
    isRead: false,
  },
  {
    id: 3,
    title: "Trip Reminder",
    message:
      "Your trip to Bangkok starts tomorrow. Don't forget to check-in online!",
    time: "Yesterday",
    type: "reminder",
    isRead: true,
  },
  {
    id: 4,
    title: "New Promotion",
    message: "Exclusive 20% discount on all Europe tours. Limited time offer!",
    time: "2 days ago",
    type: "promotion",
    isRead: true,
  },
  {
    id: 5,
    title: "Itinerary Updated",
    message:
      "The itinerary for your upcoming Bali trip has been updated. Please review the changes.",
    time: "3 days ago",
    type: "update",
    isRead: true,
  },
  {
    id: 6,
    title: "Flight Schedule Changed",
    message:
      "Your flight to Paris on June 15 has been rescheduled. New departure time: 10:30 AM.",
    time: "4 days ago",
    type: "update",
    isRead: true,
  },
  {
    id: 7,
    title: "Hotel Booking Confirmed",
    message:
      "Your reservation at Grand Plaza Hotel has been confirmed for July 10-15.",
    time: "1 week ago",
    type: "booking",
    isRead: true,
  },
];

export default function useNotifications() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(initialNotifications);

  // Filter notifications based on selected filter
  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread")
      return notifications.filter((notification) => !notification.isRead);
    return notifications.filter((notification) => notification.type === filter);
  }, [filter, notifications]);

  // Check if there are any unread notifications
  const hasUnreadNotifications = useMemo(() => {
    return notifications.some((notification) => !notification.isRead);
  }, [notifications]);

  // Get unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.isRead).length;
  }, [notifications]);

  // Toggle notification read status
  const toggleReadStatus = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: !notification.isRead }
          : notification
      )
    );
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Mark notification as unread
  const markAsUnread = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: false }
          : notification
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Add new notification
  const addNotification = (notification) => {
    setNotifications((prev) => [
      {
        id: prev.length > 0 ? Math.max(...prev.map((n) => n.id)) + 1 : 1,
        isRead: false,
        time: "Just now",
        ...notification,
      },
      ...prev,
    ]);
  };

  return {
    notifications,
    filter,
    setFilter,
    filteredNotifications,
    hasUnreadNotifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    toggleReadStatus,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
  };
}
