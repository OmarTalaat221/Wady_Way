import React from "react";
import { FaFilter } from "react-icons/fa";

const NotificationFilter = ({ filter, setFilter }) => {
  return (
    <>
      {/* Desktop Filter */}
      <div className="relative notification-filter">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm">
          <FaFilter className="text-gray-500" /> Filter
        </button>
        <div className="filter-dropdown">
          <div
            className={`filter-option ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All notifications
          </div>
          <div
            className={`filter-option ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread
          </div>
          <div
            className={`filter-option ${filter === "booking" ? "active" : ""}`}
            onClick={() => setFilter("booking")}
          >
            Bookings
          </div>
          <div
            className={`filter-option ${filter === "payment" ? "active" : ""}`}
            onClick={() => setFilter("payment")}
          >
            Payments
          </div>
          <div
            className={`filter-option ${
              filter === "promotion" ? "active" : ""
            }`}
            onClick={() => setFilter("promotion")}
          >
            Promotions
          </div>
          <div
            className={`filter-option ${filter === "reminder" ? "active" : ""}`}
            onClick={() => setFilter("reminder")}
          >
            Reminders
          </div>
          <div
            className={`filter-option ${filter === "update" ? "active" : ""}`}
            onClick={() => setFilter("update")}
          >
            Updates
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="mobile-filters">
        <div
          className={`mobile-filter-option ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </div>
        <div
          className={`mobile-filter-option ${
            filter === "unread" ? "active" : ""
          }`}
          onClick={() => setFilter("unread")}
        >
          Unread
        </div>
        <div
          className={`mobile-filter-option ${
            filter === "booking" ? "active" : ""
          }`}
          onClick={() => setFilter("booking")}
        >
          Bookings
        </div>
        <div
          className={`mobile-filter-option ${
            filter === "payment" ? "active" : ""
          }`}
          onClick={() => setFilter("payment")}
        >
          Payments
        </div>
        <div
          className={`mobile-filter-option ${
            filter === "promotion" ? "active" : ""
          }`}
          onClick={() => setFilter("promotion")}
        >
          Promos
        </div>
        <div
          className={`mobile-filter-option ${
            filter === "reminder" ? "active" : ""
          }`}
          onClick={() => setFilter("reminder")}
        >
          Reminders
        </div>
        <div
          className={`mobile-filter-option ${
            filter === "update" ? "active" : ""
          }`}
          onClick={() => setFilter("update")}
        >
          Updates
        </div>
      </div>
    </>
  );
};

export default NotificationFilter;
