// components/schedule/SchedulePage.jsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { baseUrl } from "../../Constants/Const";
import { MdTour, MdLocalActivity, MdHotel } from "react-icons/md";
import { IoCarSport } from "react-icons/io5";
import {
  FiCalendar,
  FiClock,
  FiCheck,
  FiPlay,
  FiX,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiMapPin,
  FiUser,
  FiUsers,
  FiTrendingUp,
} from "react-icons/fi";
import { BsCircleFill } from "react-icons/bs";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return "N/A";
  const defaultOptions = { month: "short", day: "numeric", year: "numeric" };
  return new Date(dateStr).toLocaleDateString("en-US", {
    ...defaultOptions,
    ...options,
  });
};

const formatDateShort = (dateStr) =>
  formatDate(dateStr, { month: "short", day: "numeric" });

const formatPrice = (price, currency = "$") => {
  if (!price && price !== 0) return "N/A";
  return `${currency}${parseFloat(price).toLocaleString()}`;
};

const getDaysDiff = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  da.setHours(0, 0, 0, 0);
  db.setHours(0, 0, 0, 0);
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
};

const getTodayMidnight = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// ─── Status helpers ───────────────────────────────────────────────────────────

const getBookingTimeStatus = (startDate, endDate, apiStatus) => {
  // API-driven statuses take priority
  if (["cancelled_by_user", "cancelled", "rejected"].includes(apiStatus)) {
    return "cancelled";
  }

  const today = getTodayMidnight();
  const start = new Date(startDate);
  const end = new Date(endDate || startDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (apiStatus === "completed") return "completed";
  if (apiStatus === "in_progress") return "active";
  if (apiStatus === "upcoming") return "upcoming";
  if (apiStatus === "pending") return "pending";

  // Fallback: auto-calculate from dates
  if (today > end) return "completed";
  if (today >= start && today <= end) return "active";
  return "upcoming";
};

const getProgress = (startDate, endDate, apiStatus) => {
  if (apiStatus === "completed") return 100;
  if (
    ["cancelled_by_user", "cancelled", "rejected", "pending"].includes(
      apiStatus
    )
  )
    return 0;

  const today = getTodayMidnight();
  const start = new Date(startDate);
  const end = new Date(endDate || startDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (today < start) return 0;
  if (today > end) return 100;

  const total = end - start;
  if (total === 0) return 100;
  const elapsed = today - start;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};

// ─── Type config ──────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  tour: {
    icon: <MdTour className="w-4 h-4" />,
    label: "Tour",
    color: "bg-teal-600",
    textColor: "text-teal-700",
    borderColor: "border-teal-200",
    bgColor: "bg-teal-50",
    dotColor: "text-teal-500",
    timelineLine: "bg-teal-200",
  },
  hotel: {
    icon: <MdHotel className="w-4 h-4" />,
    label: "Hotel",
    color: "bg-purple-600",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    bgColor: "bg-purple-50",
    dotColor: "text-purple-500",
    timelineLine: "bg-purple-200",
  },
  activity: {
    icon: <MdLocalActivity className="w-4 h-4" />,
    label: "Activity",
    color: "bg-orange-500",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    bgColor: "bg-orange-50",
    dotColor: "text-orange-500",
    timelineLine: "bg-orange-200",
  },
  transportation: {
    icon: <IoCarSport className="w-4 h-4" />,
    label: "Car",
    color: "bg-blue-500",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    bgColor: "bg-blue-50",
    dotColor: "text-blue-500",
    timelineLine: "bg-blue-200",
  },
};

// Time status visual config
const TIME_STATUS_CONFIG = {
  active: {
    label: "On Going",
    icon: <FiPlay className="w-3 h-3" />,
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500 animate-pulse",
    ring: "ring-2 ring-emerald-200",
  },
  upcoming: {
    label: "Upcoming",
    icon: <FiCalendar className="w-3 h-3" />,
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    ring: "ring-2 ring-blue-100",
  },
  completed: {
    label: "Completed",
    icon: <FiCheck className="w-3 h-3" />,
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    dot: "bg-purple-400",
    ring: "",
  },
  pending: {
    label: "Pending",
    icon: <FiClock className="w-3 h-3" />,
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    ring: "ring-2 ring-amber-100",
  },
  cancelled: {
    label: "Cancelled",
    icon: <FiX className="w-3 h-3" />,
    badge: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-300",
    ring: "",
  },
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ progress, timeStatus, startDate, endDate }) => {
  const today = getTodayMidnight();
  const start = new Date(startDate);
  const end = new Date(endDate || startDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const totalDays = Math.max(getDaysDiff(start, end), 0) + 1;
  const daysPassed =
    timeStatus === "active"
      ? Math.max(getDaysDiff(start, today), 0) + 1
      : timeStatus === "completed"
        ? totalDays
        : 0;

  const barColor =
    timeStatus === "active"
      ? "bg-emerald-500"
      : timeStatus === "completed"
        ? "bg-purple-500"
        : timeStatus === "upcoming"
          ? "bg-blue-400"
          : "bg-gray-300";

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-gray-500">
          {timeStatus === "active" && `Day ${daysPassed} of ${totalDays}`}
          {timeStatus === "completed" && `All ${totalDays} days completed`}
          {timeStatus === "upcoming" &&
            `${getDaysDiff(today, start)} days to go`}
          {timeStatus === "pending" && "Awaiting confirmation"}
          {timeStatus === "cancelled" && "Reservation cancelled"}
        </span>
        <span className="text-xs font-semibold text-gray-600">{progress}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// ─── Timeline Item ────────────────────────────────────────────────────────────

const TimelineItem = ({ booking, isLast, isFirst }) => {
  const [expanded, setExpanded] = useState(false);

  const typeConfig = TYPE_CONFIG[booking.bookingType] || TYPE_CONFIG.tour;
  const timeStatus = getBookingTimeStatus(
    booking.startDate,
    booking.endDate,
    booking.apiStatus
  );
  const progress = getProgress(
    booking.startDate,
    booking.endDate,
    booking.apiStatus
  );
  const statusConfig = TIME_STATUS_CONFIG[timeStatus];

  const isCancelled = timeStatus === "cancelled";
  const isActive = timeStatus === "active";
  const isCompleted = timeStatus === "completed";

  const today = getTodayMidnight();
  const startD = new Date(booking.startDate);
  startD.setHours(0, 0, 0, 0);
  const daysUntil = getDaysDiff(today, startD);

  return (
    <div className="flex gap-4 group">
      {/* ── Timeline column ── */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Dot */}
        <div
          className={`
            relative z-10 w-10 h-10 rounded-full flex items-center justify-center
            text-white flex-shrink-0 shadow-sm transition-all duration-300
            ${typeConfig.color} ${statusConfig.ring}
            ${isCancelled ? "opacity-50 grayscale" : ""}
            ${isActive ? "shadow-md scale-110" : ""}
          `}
        >
          {isCompleted ? <FiCheck className="w-4 h-4" /> : typeConfig.icon}

          {/* Live pulse for active */}
          {isActive && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          )}
        </div>

        {/* Vertical line */}
        {!isLast && (
          <div
            className={`
              w-0.5 flex-1 mt-1 min-h-[40px] transition-all
              ${isActive ? "bg-emerald-300" : isCompleted ? "bg-purple-200" : "bg-gray-150"}
            `}
            style={{
              background: isActive
                ? "#6ee7b7"
                : isCompleted
                  ? "#e9d5ff"
                  : "#e5e7eb",
            }}
          />
        )}
      </div>

      {/* ── Card ── */}
      <div
        className={`
          flex-1 mb-6 rounded-2xl border transition-all duration-300
          ${
            isCancelled
              ? "opacity-60 grayscale border-gray-200 bg-gray-50"
              : isActive
                ? "border-emerald-200 bg-white shadow-md hover:shadow-lg"
                : isCompleted
                  ? "border-purple-100 bg-white hover:shadow-sm"
                  : "border-gray-200 bg-white hover:shadow-sm"
          }
        `}
      >
        {/* Card top — image + info */}
        <div className="flex gap-0 overflow-hidden rounded-2xl">
          {/* Image */}
          <div className="relative w-28 sm:w-36 flex-shrink-0">
            <img
              src={
                booking.backgroundImage ||
                booking.image ||
                "https://via.placeholder.com/140x120?text=Booking"
              }
              alt={booking.title}
              className={`
                w-full h-full object-cover min-h-[110px]
                ${isCancelled ? "grayscale" : ""}
              `}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/140x120?text=No+Image";
              }}
            />
            {/* Type badge */}
            <span
              className={`
                absolute top-2 left-2 ${typeConfig.color} text-white
                text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow
              `}
            >
              {typeConfig.icon}
              <span className="hidden xs:inline">{typeConfig.label}</span>
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 p-3 sm:p-4 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4
                className={`
                  font-bold text-sm sm:text-base leading-snug line-clamp-2 mb-0
                  ${isCancelled ? "text-gray-400 line-through" : "text-gray-800"}
                `}
              >
                {booking.title}
              </h4>

              {/* Time status badge */}
              <span
                className={`
                  flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5
                  rounded-full text-[10px] sm:text-xs font-semibold border
                  ${statusConfig.badge}
                `}
              >
                {statusConfig.icon}
                <span className="hidden xs:inline">{statusConfig.label}</span>
              </span>
            </div>

            {/* Date row */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
              <FiCalendar className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
              <span>
                {formatDateShort(booking.startDate)}
                {booking.endDate && booking.endDate !== booking.startDate && (
                  <> → {formatDateShort(booking.endDate)}</>
                )}
              </span>
              {booking.duration && (
                <>
                  <span className="text-gray-300">·</span>
                  <FiClock className="w-3 h-3 text-gray-400" />
                  <span>{booking.duration}</span>
                </>
              )}
            </div>

            {/* Quick info row */}
            <div className="flex items-center gap-3 flex-wrap">
              {booking.numAdults > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <FiUser className="w-3 h-3" />
                  {booking.numAdults}
                  {booking.numChildren > 0 && (
                    <>
                      <FiUsers className="w-3 h-3 ml-1" />
                      {booking.numChildren}
                    </>
                  )}
                </span>
              )}
              {booking.mainLocations?.[0] && (
                <span className="flex items-center gap-1 text-xs text-gray-500 truncate max-w-[120px]">
                  <FiMapPin className="w-3 h-3 flex-shrink-0" />
                  {booking.mainLocations[0]}
                </span>
              )}
              <span
                className={`
                  text-xs font-bold ml-auto
                  ${isCancelled ? "text-gray-400 line-through" : "text-teal-600"}
                `}
              >
                {formatPrice(booking.price, booking.priceCurrency)}
              </span>
            </div>

            {/* Progress bar — always show for non-cancelled */}
            {!isCancelled && (
              <ProgressBar
                progress={progress}
                timeStatus={timeStatus}
                startDate={booking.startDate}
                endDate={booking.endDate}
              />
            )}
          </div>
        </div>

        {/* Expand toggle */}
        {booking.bookingType === "tour" &&
          booking.itinerary &&
          booking.itinerary.length > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className={`
                w-full flex items-center justify-center gap-1.5 py-2 border-t
                text-xs font-medium transition-colors
                ${
                  expanded
                    ? "bg-gray-50 text-gray-600 border-gray-200"
                    : `${typeConfig.bgColor} ${typeConfig.textColor} ${typeConfig.borderColor}`
                }
                rounded-b-2xl
              `}
            >
              {expanded ? (
                <>
                  <FiChevronUp className="w-3.5 h-3.5" />
                  Hide Itinerary
                </>
              ) : (
                <>
                  <FiChevronDown className="w-3.5 h-3.5" />
                  View {booking.itinerary.length}-Day Itinerary
                </>
              )}
            </button>
          )}

        {/* ── Expanded itinerary ── */}
        {expanded && booking.itinerary && (
          <div className="border-t border-gray-100 rounded-b-2xl overflow-hidden">
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto schedule-scroll">
              {booking.itinerary.map((dayData, idx) => {
                const dayDate = new Date(booking.startDate);
                dayDate.setDate(dayDate.getDate() + idx);
                const dayDateMidnight = new Date(dayDate);
                dayDateMidnight.setHours(0, 0, 0, 0);
                const isToday =
                  getDaysDiff(getTodayMidnight(), dayDateMidnight) === 0;
                const isPast = dayDateMidnight < getTodayMidnight();

                return (
                  <div
                    key={dayData.day || idx}
                    className={`
                      flex gap-3 p-3 rounded-xl border transition-all
                      ${
                        isToday
                          ? "border-emerald-200 bg-emerald-50"
                          : isPast
                            ? "border-gray-100 bg-gray-50 opacity-70"
                            : "border-blue-100 bg-blue-50/40"
                      }
                    `}
                  >
                    {/* Day number */}
                    <div
                      className={`
                        w-9 h-9 rounded-xl flex-shrink-0 flex flex-col items-center
                        justify-center text-white font-bold text-xs shadow-sm
                        ${
                          isToday
                            ? "bg-emerald-500"
                            : isPast
                              ? "bg-gray-400"
                              : "bg-[#295557]"
                        }
                      `}
                    >
                      <span className="text-[8px] leading-none opacity-80">
                        Day
                      </span>
                      <span className="text-sm leading-none">
                        {dayData.day}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-xs text-gray-800 truncate mb-0">
                          {dayData.title}
                        </p>
                        {isToday && (
                          <span className="flex-shrink-0 text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                            TODAY
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mb-1.5">
                        {formatDate(dayDate, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>

                      {/* Day pills */}
                      <div className="flex flex-wrap gap-1">
                        {dayData.hotel_reserved && (
                          <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md font-medium">
                            {dayData.hotel_reserved.title}
                          </span>
                        )}
                        {dayData.car_reserved && (
                          <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-medium">
                            🚗 {dayData.car_reserved.title}
                          </span>
                        )}
                        {dayData.activities_reserved &&
                          dayData.activities_reserved.length > 0 && (
                            <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md font-medium">
                              ⚡ {dayData.activities_reserved.length} Act
                              {dayData.activities_reserved.length !== 1
                                ? "s"
                                : ""}
                            </span>
                          )}
                        {dayData.tour_guide?.has_guide && (
                          <span className="text-[9px] bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded-md font-medium">
                            👤 Guide
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const StatsBar = ({ bookings }) => {
  const stats = useMemo(() => {
    const counts = {
      active: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
      pending: 0,
    };
    bookings.forEach((b) => {
      const ts = getBookingTimeStatus(b.startDate, b.endDate, b.apiStatus);
      counts[ts] = (counts[ts] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  const items = [
    {
      key: "active",
      label: "On Going",
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
      dot: "bg-emerald-500",
    },
    {
      key: "upcoming",
      label: "Upcoming",
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
      dot: "bg-blue-500",
    },
    {
      key: "completed",
      label: "Completed",
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-200",
      dot: "bg-purple-500",
    },
    {
      key: "pending",
      label: "Pending",
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      dot: "bg-amber-500",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      color: "text-gray-500",
      bg: "bg-gray-50 border-gray-200",
      dot: "bg-gray-400",
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 mb-6">
      {items.map((item) => (
        <div
          key={item.key}
          className={`flex flex-col items-center p-2 sm:p-3 rounded-xl border ${item.bg}`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-2 h-2 rounded-full ${item.dot}`} />
            <span className={`text-lg font-bold ${item.color}`}>
              {stats[item.key] || 0}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-gray-500 font-medium text-center">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Month Group Header ───────────────────────────────────────────────────────

const MonthGroupHeader = ({ label, count, isCurrentMonth }) => (
  <div className="flex items-center gap-3 mb-4 mt-2">
    <div
      className={`
        flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-bold
        ${
          isCurrentMonth
            ? "bg-[#295557] text-white shadow-sm"
            : "bg-gray-100 text-gray-600"
        }
      `}
    >
      {label}
    </div>
    <div className="flex-1 h-px bg-gray-200" />
    <span className="text-xs text-gray-400 font-medium flex-shrink-0">
      {count} booking{count !== 1 ? "s" : ""}
    </span>
  </div>
);

// ─── View Toggle ──────────────────────────────────────────────────────────────

const ViewToggle = ({ view, setView }) => (
  <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
    {[
      {
        id: "timeline",
        label: "Timeline",
        icon: <FiTrendingUp className="w-3.5 h-3.5" />,
      },
      {
        id: "list",
        label: "List",
        icon: <FiCalendar className="w-3.5 h-3.5" />,
      },
    ].map((v) => (
      <button
        key={v.id}
        onClick={() => setView(v.id)}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
          ${view === v.id ? "bg-white text-[#295557] shadow-sm" : "text-gray-500 hover:text-gray-700"}
        `}
      >
        {v.icon}
        {v.label}
      </button>
    ))}
  </div>
);

// ─── List View Item (compact) ─────────────────────────────────────────────────

const ListViewItem = ({ booking }) => {
  const typeConfig = TYPE_CONFIG[booking.bookingType] || TYPE_CONFIG.tour;
  const timeStatus = getBookingTimeStatus(
    booking.startDate,
    booking.endDate,
    booking.apiStatus
  );
  const progress = getProgress(
    booking.startDate,
    booking.endDate,
    booking.apiStatus
  );
  const statusConfig = TIME_STATUS_CONFIG[timeStatus];
  const isCancelled = timeStatus === "cancelled";

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm
        ${isCancelled ? "opacity-60 grayscale bg-gray-50 border-gray-200" : "bg-white border-gray-200"}
      `}
    >
      {/* Type icon */}
      <div
        className={`
          w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm
          ${typeConfig.color} ${isCancelled ? "opacity-50" : ""}
        `}
      >
        {typeConfig.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p
            className={`
              text-sm font-semibold truncate mb-0
              ${isCancelled ? "text-gray-400 line-through" : "text-gray-800"}
            `}
          >
            {booking.title}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <FiCalendar className="w-3 h-3" />
            {formatDateShort(booking.startDate)}
            {booking.endDate && booking.endDate !== booking.startDate && (
              <> → {formatDateShort(booking.endDate)}</>
            )}
          </span>
          {!isCancelled && (
            <div className="flex items-center gap-1.5 flex-1 max-w-[120px]">
              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    timeStatus === "active"
                      ? "bg-emerald-500"
                      : timeStatus === "completed"
                        ? "bg-purple-500"
                        : "bg-blue-400"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400">{progress}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: status + price */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span
          className={`
            inline-flex items-center gap-1 px-2 py-0.5 rounded-full
            text-[10px] font-semibold border ${statusConfig.badge}
          `}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </span>
        <span
          className={`
            text-xs font-bold
            ${isCancelled ? "text-gray-400 line-through" : "text-teal-600"}
          `}
        >
          {formatPrice(booking.price, booking.priceCurrency)}
        </span>
      </div>
    </div>
  );
};

// ─── Main SchedulePage ────────────────────────────────────────────────────────

const SchedulePage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [view, setView] = useState("timeline");
  const [filterStatus, setFilterStatus] = useState("all");

  // ── Get userId ──────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setUserId(userData.id || userData.user_id || null);
    } catch {
      setUserId(null);
    }
  }, []);

  // ── Fetch all bookings ───────────────────────────────────────────────────────
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const [toursRes, activitiesRes, transportationRes, hotelsRes] =
        await Promise.all([
          axios.post(`${baseUrl}/my_tours/select_my_tours_list.php`, {
            user_id: userId,
          }),
          axios.post(`${baseUrl}/my_account/select_my_activity_list.php`, {
            user_id: userId,
          }),
          axios.post(
            `${baseUrl}/my_account/select_my_transportation_list.php`,
            {
              user_id: userId,
            }
          ),
          axios.post(`${baseUrl}/my_account/select_my_hotels_list.php`, {
            user_id: userId,
          }),
        ]);

      let all = [];

      // ── Tours ──
      if (toursRes?.data?.status === "success") {
        toursRes.data.message.forEach((item) => {
          const reservation = item.reservation;
          const tour = item.tour_details;
          const routeLocations = tour.route
            ? tour.route.split("-").map((l) => l.trim())
            : [];
          const images =
            tour.gallery?.length > 0
              ? tour.gallery.map((g) => g.image)
              : [tour.image];

          all.push({
            id: reservation.reservation_id,
            bookingType: "tour",
            title: tour.title || reservation.tour_title,
            duration: tour.duration,
            image:
              reservation.background_image ||
              tour.background_image ||
              tour.image,
            backgroundImage:
              reservation.background_image || tour.background_image,
            images,
            price: parseFloat(reservation.total_amount),
            priceCurrency: tour.price_currency || "$",
            numAdults: parseInt(reservation.num_adults),
            numChildren: parseInt(reservation.num_children),
            startDate: reservation.start_date,
            endDate: reservation.end_date,
            apiStatus: reservation.status || "pending",
            mainLocations: routeLocations.slice(0, 2),
            itinerary: tour.itinerary || [],
            _rawApiItem: item,
          });
        });
      }

      // ── Activities ──
      if (activitiesRes?.data?.status === "success") {
        activitiesRes.data.message.forEach((item) => {
          all.push({
            id: item.reserving_id,
            bookingType: "activity",
            title: item.title,
            duration: "1 Day",
            image: item.background_image,
            backgroundImage: item.background_image,
            price: parseFloat(item.total_amount),
            priceCurrency: "$",
            numAdults: parseInt(item.adults_num),
            numChildren: parseInt(item.childs_num),
            startDate: item.date,
            endDate: item.date,
            apiStatus: item.status || "pending",
            _rawApiItem: item,
          });
        });
      }

      // ── Transportation ──
      if (transportationRes?.data?.status === "success") {
        transportationRes.data.message.forEach((item) => {
          all.push({
            id: item.reserving_id,
            bookingType: "transportation",
            title: item.title,
            duration: (() => {
              const d = Math.ceil(
                (new Date(item.end_date) - new Date(item.start_date)) /
                  (1000 * 60 * 60 * 24)
              );
              return `${d} ${d === 1 ? "Day" : "Days"}`;
            })(),
            image: item.background_image,
            backgroundImage: item.background_image,
            price: parseFloat(item.total_amount),
            priceCurrency: "$",
            numAdults: 1,
            numChildren: 0,
            startDate: item.start_date,
            endDate: item.end_date,
            apiStatus: item.status || "pending",
            _rawApiItem: item,
          });
        });
      }

      // ── Hotels ──
      if (hotelsRes?.data?.status === "success") {
        hotelsRes.data.message.forEach((item) => {
          const nights = Math.ceil(
            (new Date(item.end_date) - new Date(item.start_date)) /
              (1000 * 60 * 60 * 24)
          );
          all.push({
            id: item.reserving_id,
            bookingType: "hotel",
            title: item.title,
            duration:
              item.duration || `${nights} ${nights === 1 ? "Night" : "Nights"}`,
            image: item.background_image || item.image,
            backgroundImage: item.background_image,
            price: parseFloat(item.total_amount),
            priceCurrency: item.price_currency || "$",
            numAdults: parseInt(item.adults_num),
            numChildren: 0,
            startDate: item.start_date,
            endDate: item.end_date,
            apiStatus: item.status || "pending",
            mainLocations: item.location ? [item.location] : [],
            _rawApiItem: item,
          });
        });
      }

      // Sort by startDate ASC (chronological for timeline)
      all.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      setBookings(all);
    } catch (err) {
      console.error("Schedule fetch error:", err);
      setError("Failed to load schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchBookings();
  }, [userId]);

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    if (filterStatus === "all") return bookings;
    return bookings.filter((b) => {
      const ts = getBookingTimeStatus(b.startDate, b.endDate, b.apiStatus);
      return ts === filterStatus;
    });
  }, [bookings, filterStatus]);

  // ── Group by month ────────────────────────────────────────────────────────────
  const groupedByMonth = useMemo(() => {
    const groups = {};
    filteredBookings.forEach((b) => {
      const key = new Date(b.startDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    });
    return groups;
  }, [filteredBookings]);

  const currentMonthKey = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  // ── Status filter bar ─────────────────────────────────────────────────────────
  const STATUS_FILTERS = [
    { id: "all", label: "All" },
    { id: "active", label: "On Going" },
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" },
    { id: "pending", label: "Pending" },
    { id: "cancelled", label: "Cancelled" },
  ];

  // ── Loading / Error ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FiLoader className="w-10 h-10 text-[#295557] animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Loading your schedule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <FiAlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-gray-600 mb-4 text-center">{error}</p>
        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-2 bg-[#295557] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#1e3d3f] transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <FiCalendar className="w-16 h-16 text-gray-300 mb-4" />
        <h4 className="text-lg font-semibold text-gray-700 mb-2">
          No bookings yet
        </h4>
        <p className="text-gray-400 text-sm text-center max-w-sm">
          Your travel schedule will appear here once you make your first
          booking.
        </p>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 lg:px-0">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-0.5">
            My Schedule
          </h3>
          <p className="text-xs text-gray-400">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <ViewToggle view={view} setView={setView} />
      </div>

      {/* ── Stats ── */}
      <StatsBar bookings={bookings} />

      {/* ── Status Filter Pills ── */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
        {STATUS_FILTERS.map((f) => {
          const count =
            f.id === "all"
              ? bookings.length
              : bookings.filter(
                  (b) =>
                    getBookingTimeStatus(
                      b.startDate,
                      b.endDate,
                      b.apiStatus
                    ) === f.id
                ).length;

          return (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`
                flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5
                rounded-full text-xs font-medium border transition-all
                ${
                  filterStatus === f.id
                    ? "bg-[#295557] border-[#295557] text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-[#295557] hover:text-[#295557]"
                }
              `}
            >
              {f.label}
              <span
                className={`
                  px-1.5 py-0.5 rounded-full text-[10px] font-bold
                  ${filterStatus === f.id ? "bg-white/20" : "bg-gray-100"}
                `}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <FiCalendar className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium text-sm">
            No {filterStatus !== "all" ? filterStatus : ""} bookings found
          </p>
          <button
            onClick={() => setFilterStatus("all")}
            className="mt-3 text-xs text-[#295557] hover:underline"
          >
            Show all bookings
          </button>
        </div>
      ) : view === "timeline" ? (
        /* ── Timeline View ── */
        <div>
          {Object.entries(groupedByMonth).map(([month, items]) => (
            <div key={month} className="mb-2">
              <MonthGroupHeader
                label={month}
                count={items.length}
                isCurrentMonth={month === currentMonthKey}
              />
              <div>
                {items.map((booking, idx) => (
                  <TimelineItem
                    key={`${booking.bookingType}-${booking.id}`}
                    booking={booking}
                    isFirst={idx === 0}
                    isLast={idx === items.length - 1}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── List View ── */
        <div className="space-y-2">
          {filteredBookings.map((booking) => (
            <ListViewItem
              key={`${booking.bookingType}-${booking.id}`}
              booking={booking}
            />
          ))}
        </div>
      )}

      {/* ── Scroll style ── */}
      <style jsx>{`
        .schedule-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .schedule-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .schedule-scroll::-webkit-scrollbar-thumb {
          background: #295557;
          border-radius: 4px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default SchedulePage;
