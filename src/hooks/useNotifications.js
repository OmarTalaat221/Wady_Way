import { useState, useEffect, useMemo } from "react";
import { base_url } from "../uitils/base_url";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = JSON.parse(localStorage.getItem("user"))?.user_id; // You can get this from your auth context or props

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${base_url}/admin/notifications/select_notifications.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        // Transform API data to match our component structure
        const transformedNotifications = data.message.map((notif) => ({
          id: parseInt(notif.id),
          message: notif.notification_body,
          time: notif.time,
          isRead: notif.notification_seen === "1",
        }));
        setNotifications(transformedNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Check if there are any unread notifications
  const hasUnreadNotifications = useMemo(() => {
    return notifications.some((notification) => !notification.isRead);
  }, [notifications]);

  // Get unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.isRead).length;
  }, [notifications]);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const response = await fetch(
        `${base_url}/admin/notifications/mark_as_seen.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notification_id: id }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        // Update local state
        setNotifications(
          notifications.map((notification) =>
            notification.id === id
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      // Call API for each unread notification
      await Promise.all(
        unreadNotifications.map((notification) =>
          fetch("/admin/notifications/mark_as_seen.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ notification_id: notification.id }),
          })
        )
      );

      // Update local state
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
  };

  return {
    notifications,
    loading,
    hasUnreadNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications,
  };
}
