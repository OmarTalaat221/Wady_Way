import React from "react";

const EmptyNotifications = ({ filter }) => {
  return (
    <div className="empty-notifications">
      <div className="empty-icon">🔔</div>
      <h3>No notifications</h3>
      <p>
        {filter === "all"
          ? "You don't have any notifications at the moment."
          : filter === "unread"
          ? "You don't have any unread notifications."
          : `You don't have any ${filter} notifications.`}
      </p>
    </div>
  );
};

export default EmptyNotifications;
