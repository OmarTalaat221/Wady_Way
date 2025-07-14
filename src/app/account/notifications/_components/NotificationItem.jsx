import React, { useState, useRef, useEffect } from "react";
import {
  FaEllipsisH,
  FaTrash,
  FaCheck,
  FaBell,
  FaBellSlash,
} from "react-icons/fa";

const NotificationItem = ({
  notification,
  markAsRead,
  deleteNotification,
  toggleReadStatus,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking":
        return <div className="notification-icon booking-icon">🏨</div>;
      case "payment":
        return <div className="notification-icon payment-icon">💰</div>;
      case "reminder":
        return <div className="notification-icon reminder-icon">⏰</div>;
      case "promotion":
        return <div className="notification-icon promotion-icon">🎁</div>;
      case "update":
        return <div className="notification-icon update-icon">📝</div>;
      default:
        return <div className="notification-icon default-icon">📣</div>;
    }
  };

  const handleItemClick = (e) => {
    // Don't mark as read when clicking the menu button or menu items
    if (
      !e.target.closest(".notification-action-btn") &&
      !e.target.closest(".notification-dropdown")
    ) {
      markAsRead(notification.id);
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleToggleRead = (e) => {
    e.stopPropagation();
    toggleReadStatus(notification.id);
    setShowMenu(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteNotification(notification.id);
    setShowMenu(false);
  };

  return (
    <div
      className={`notification-item ${!notification.isRead ? "unread" : ""}`}
      onClick={handleItemClick}
    >
      {getNotificationIcon(notification.type)}
      <div className="notification-content">
        <div className="notification-header">
          <h3 className="notification-title">{notification.title}</h3>
          <span className="notification-time">{notification.time}</span>
        </div>
        <p className="notification-message">{notification.message}</p>
      </div>
      <div className="notification-actions" ref={menuRef}>
        <button className="notification-action-btn" onClick={handleMenuClick}>
          <FaEllipsisH />
        </button>
        {!notification.isRead && <span className="unread-indicator"></span>}
        {showMenu && (
          <div className="notification-dropdown">
            {!notification.isRead ? (
              <button
                onClick={handleToggleRead}
                className="notification-dropdown-item"
              >
                <FaCheck /> Mark as read
              </button>
            ) : (
              <button
                onClick={handleToggleRead}
                className="notification-dropdown-item"
              >
                <FaBellSlash /> Mark as unread
              </button>
            )}
            <button
              onClick={handleDelete}
              className="notification-dropdown-item delete"
            >
              <FaTrash /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
