"use client";

import React from "react";
import NotificationHeader from "./_components/NotificationHeader";
import NotificationItem from "./_components/NotificationItem";
import EmptyNotifications from "./_components/EmptyNotifications";
import useNotifications from "../../../hooks/useNotifications";
import "./style.css";

const Notifications = () => {
  const {
    notifications,
    loading,
    hasUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  if (loading) {
    return (
      <div className="w-full pt-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading notifications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-4">
      {/* Header */}
      <NotificationHeader
        markAllAsRead={markAllAsRead}
        hasUnread={hasUnreadNotifications}
      />

      {/* Notifications List */}
      <div className="notifications-container">
        {notifications.length === 0 ? (
          <EmptyNotifications />
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              markAsRead={markAsRead}
              deleteNotification={deleteNotification}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
