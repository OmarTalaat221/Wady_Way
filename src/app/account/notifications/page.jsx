// Notifications.jsx (Main Component)
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
      <div className="notifications-page">
        <NotificationHeader markAllAsRead={markAllAsRead} hasUnread={false} />
        <div className="notifications-container">
          {/* Skeleton Loading */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="notification-skeleton">
              <div className="skeleton-content">
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
                <div className="skeleton-time"></div>
              </div>
              <div className="skeleton-action"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
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
