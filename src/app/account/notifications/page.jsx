"use client";

import React from "react";
import NotificationHeader from "./_components/NotificationHeader";
import NotificationFilter from "./_components/NotificationFilter";
import NotificationItem from "./_components/NotificationItem";
import EmptyNotifications from "./_components/EmptyNotifications";
import useNotifications from "../../../hooks/useNotifications";
import "./style.css";

const Notifications = () => {
  const {
    filter,
    setFilter,
    filteredNotifications,
    hasUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    toggleReadStatus,
  } = useNotifications();

  return (
    <div className="w-full pt-4">
      {/* Header */}
      <NotificationHeader
        markAllAsRead={markAllAsRead}
        hasUnread={hasUnreadNotifications}
      />

      <div className="flex items-center justify-end mb-4">
        <NotificationFilter filter={filter} setFilter={setFilter} />
      </div>

      {/* Notifications List */}
      <div className="notifications-container">
        {filteredNotifications.length === 0 ? (
          <EmptyNotifications filter={filter} />
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              markAsRead={markAsRead}
              deleteNotification={deleteNotification}
              toggleReadStatus={toggleReadStatus}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
