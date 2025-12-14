import React, { useState, useRef, useEffect } from "react";
import { FaEllipsisH, FaTrash, FaCheck } from "react-icons/fa";

const NotificationItem = ({ notification, markAsRead, deleteNotification }) => {
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

  const handleItemClick = (e) => {
    // Don't mark as read when clicking the menu button or menu items
    if (
      !e.target.closest(".notification-action-btn") &&
      !e.target.closest(".notification-dropdown")
    ) {
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    markAsRead(notification.id);
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
      <div className="notification-content">
        <div className="notification-header">
          <p className="notification-message">{notification.message}</p>
          <span className="notification-time">{notification.time}</span>
        </div>
      </div>
      <div className="notification-actions" ref={menuRef}>
        <button className="notification-action-btn" onClick={handleMenuClick}>
          <FaEllipsisH />
        </button>
        {!notification.isRead && <span className="unread-indicator"></span>}
        {showMenu && (
          <div className="notification-dropdown">
            {!notification.isRead && (
              <button
                onClick={handleMarkAsRead}
                className="notification-dropdown-item"
              >
                <FaCheck /> Mark as read
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
