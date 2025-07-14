import React from "react";
import { FaBell, FaCheck } from "react-icons/fa";

const NotificationHeader = ({ markAllAsRead, hasUnread }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
          <FaBell className="text-[#295557] text-xl" />
        </div>
        <h2 className="text-2xl mb-0 font-bold text-[#295557]">
          Notifications
        </h2>
      </div>
      {hasUnread && (
        <button
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm"
        >
          <FaCheck className="text-green-500" /> Mark all as read
        </button>
      )}
    </div>
  );
};

export default NotificationHeader;
