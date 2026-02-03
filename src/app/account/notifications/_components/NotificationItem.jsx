// NotificationItem.jsx
import React, { useState, useRef, useEffect } from "react";
import { FaEllipsisH, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

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

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowMenu(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleItemClick = (e) => {
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
    <>
      <div
        className={`notification-item ${!notification.isRead ? "unread" : ""}`}
        onClick={handleItemClick}
      >
        {/* Unread Indicator - Left Side */}
        {!notification.isRead && (
          <span className="unread-indicator-left"></span>
        )}

        <div className="notification-content">
          <p
            className="notification-message"
            dangerouslySetInnerHTML={{ __html: notification.message }}
          />
          <span className="notification-time">
            <svg
              className="time-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <polyline points="12,6 12,12 16,14" strokeWidth="2" />
            </svg>
            {`${notification.date} • ${notification.time}`}
          </span>
        </div>

        <div className="notification-actions" ref={menuRef}>
          {/* <button
            className="notification-action-btn"
            onClick={handleMenuClick}
            aria-label="More options"
          >
            <FaEllipsisH />
          </button> */}

          {/* Desktop Dropdown */}
          {showMenu && (
            <div className="notification-dropdown desktop-dropdown">
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

      {/* Mobile Bottom Sheet */}
      {showMenu && (
        <>
          <div
            className="mobile-sheet-overlay"
            onClick={() => setShowMenu(false)}
          />
          <div className="mobile-bottom-sheet">
            <div className="mobile-sheet-header">
              <span className="mobile-sheet-title">Options</span>
              <button
                className="mobile-sheet-close"
                onClick={() => setShowMenu(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="mobile-sheet-content">
              {!notification.isRead && (
                <button
                  onClick={handleMarkAsRead}
                  className="mobile-sheet-item"
                >
                  <div className="mobile-sheet-icon read">
                    <FaCheck />
                  </div>
                  <span>Mark as read</span>
                </button>
              )}
              <button
                onClick={handleDelete}
                className="mobile-sheet-item delete"
              >
                <div className="mobile-sheet-icon delete">
                  <FaTrash />
                </div>
                <span>Delete notification</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NotificationItem;
