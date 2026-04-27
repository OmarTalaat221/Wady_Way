// components/account/SchedulePageClient.jsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { baseUrl } from "@/Constants/Const";
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
  FiArrowRight,
} from "react-icons/fi";

import TourDetailsModal from "@/components/modals/TourDetailsModal";
import ActivityDetailsModal from "@/components/modals/ActivityDetailsModal";
import HotelDetailsModal from "@/components/modals/HotelDetailsModal";
import TransportationDetailsModal from "@/components/modals/TransportationDetailsModal";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const KNOWN_STATUSES = new Set([
  "accepted",
  "pending",
  "rejected",
  "cancelled_by_user",
  "cancelled",
  "upcoming",
  "in_progress",
  "completed",
]);

const normalizeImage = (image) => {
  if (!image || typeof image !== "string") {
    return "https://via.placeholder.com/500x350?text=Booking";
  }
  return image.split("//CAMP//")[0].trim();
};

const parseMaybeJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const toMidnight = (dateInput) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const getTodayMidnight = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const formatDate = (dateString, options = {}) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
};

const formatPrice = (price, currency = "$") => {
  const num = Number(price || 0);
  return `${currency}${num.toLocaleString()}`;
};

const getInclusiveDays = (startDate, endDate) => {
  const start = toMidnight(startDate);
  const end = toMidnight(endDate || startDate);
  if (!start || !end) return 1;
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(diff + 1, 1);
};

const getDiffDays = (fromDate, toDate) => {
  const from = toMidnight(fromDate);
  const to = toMidnight(toDate);
  if (!from || !to) return 0;
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
};

const buildRouteLocations = (route) => {
  if (!route || typeof route !== "string") return [];
  return route
    .split(/-|\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
};

const normalizeReservationStatus = (
  topLevelStatus,
  detailedStatus,
  startDate,
  endDate
) => {
  if (KNOWN_STATUSES.has(detailedStatus)) {
    if (detailedStatus === "accepted") {
      const today = getTodayMidnight();
      const start = toMidnight(startDate);
      const end = toMidnight(endDate || startDate);
      if (!start || !end) return "upcoming";
      if (today < start) return "upcoming";
      if (today > end) return "completed";
      return "in_progress";
    }
    return detailedStatus;
  }
  if (KNOWN_STATUSES.has(topLevelStatus)) {
    return topLevelStatus;
  }
  const today = getTodayMidnight();
  const start = toMidnight(startDate);
  const end = toMidnight(endDate || startDate);
  if (!start || !end) return "pending";
  if (today < start) return "upcoming";
  if (today > end) return "completed";
  return "in_progress";
};

const getTimelinePhase = (status) => {
  if (status === "in_progress") return "active";
  if (status === "upcoming") return "upcoming";
  if (status === "completed") return "completed";
  if (status === "pending") return "pending";
  if (
    status === "rejected" ||
    status === "cancelled" ||
    status === "cancelled_by_user"
  )
    return "cancelled";
  return "upcoming";
};

const getCompletedDaysCount = (startDate, endDate, normalizedStatus) => {
  const totalDays = getInclusiveDays(startDate, endDate);
  const phase = getTimelinePhase(normalizedStatus);
  if (phase === "completed") return totalDays;
  if (phase === "cancelled" || phase === "pending" || phase === "upcoming")
    return 0;
  const today = getTodayMidnight();
  const start = toMidnight(startDate);
  if (!start) return 0;
  const completed = getDiffDays(start, today);
  return Math.max(0, Math.min(completed, totalDays));
};

const getCurrentRunningDayNumber = (startDate, endDate) => {
  const totalDays = getInclusiveDays(startDate, endDate);
  const today = getTodayMidnight();
  const start = toMidnight(startDate);
  if (!start) return 1;
  const current = getDiffDays(start, today) + 1;
  return Math.max(1, Math.min(current, totalDays));
};

const getProgressPercent = (startDate, endDate, normalizedStatus) => {
  const totalDays = getInclusiveDays(startDate, endDate);
  const completedDays = getCompletedDaysCount(
    startDate,
    endDate,
    normalizedStatus
  );
  return Math.round((completedDays / totalDays) * 100);
};

const getDaysUntilStart = (startDate) => {
  const today = getTodayMidnight();
  const start = toMidnight(startDate);
  if (!start) return 0;
  return Math.max(getDiffDays(today, start), 0);
};

const prepareTourItineraryForModal = (itinerary = []) => {
  return itinerary.map((day) => {
    const reservedActivities = Array.isArray(day.activities_reserved)
      ? day.activities_reserved
      : [];
    const compatibleActivitiesOptions =
      Array.isArray(day.activities_options) && day.activities_options.length > 0
        ? day.activities_options
        : reservedActivities.map((activity) => ({
            ...activity,
            activity_id: activity.activity_id || activity.id,
          }));
    return {
      ...day,
      activity_reserved: day.activity_reserved || reservedActivities[0] || null,
      activities_options: compatibleActivitiesOptions,
    };
  });
};

const getPhaseConfig = (phase) => {
  const map = {
    active: {
      label: "On Going",
      icon: <FiPlay className="w-3 h-3" />,
      badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-200",
      dotBg: "bg-emerald-500",
      lineBg: "bg-emerald-200",
    },
    upcoming: {
      label: "Upcoming",
      icon: <FiCalendar className="w-3 h-3" />,
      badgeClass: "bg-blue-50 text-blue-600 border-blue-200",
      dotBg: "bg-blue-500",
      lineBg: "bg-blue-200",
    },
    completed: {
      label: "Completed",
      icon: <FiCheck className="w-3 h-3" />,
      badgeClass: "bg-[#295557]/10 text-[#295557] border-[#295557]/20",
      dotBg: "bg-[#295557]",
      lineBg: "bg-[#295557]/20",
    },
    pending: {
      label: "Pending",
      icon: <FiClock className="w-3 h-3" />,
      badgeClass: "bg-amber-50 text-amber-600 border-amber-200",
      dotBg: "bg-amber-500",
      lineBg: "bg-amber-200",
    },
    cancelled: {
      label: "Cancelled",
      icon: <FiX className="w-3 h-3" />,
      badgeClass: "bg-gray-50 text-gray-500 border-gray-200",
      dotBg: "bg-gray-400",
      lineBg: "bg-gray-200",
    },
  };
  return map[phase] || map.upcoming;
};

const buildTimelineSummaryText = (booking) => {
  const totalDays = getInclusiveDays(booking.startDate, booking.endDate);
  const phase = getTimelinePhase(booking.apiStatus);

  if (phase === "active") {
    const completedDays = getCompletedDaysCount(
      booking.startDate,
      booking.endDate,
      booking.apiStatus
    );
    const runningDay = getCurrentRunningDayNumber(
      booking.startDate,
      booking.endDate
    );
    if (totalDays === 1) return "Happening today";
    return `Day ${runningDay} of ${totalDays} • ${completedDays} completed`;
  }
  if (phase === "upcoming") {
    const d = getDaysUntilStart(booking.startDate);
    if (d === 0) return "Starts today";
    if (d === 1) return "Starts tomorrow";
    return `Starts in ${d} days`;
  }
  if (phase === "completed") return `${totalDays}/${totalDays} days completed`;
  if (phase === "pending") return "Waiting for confirmation";
  return "Reservation cancelled";
};

const getSectionMeta = (sectionKey) => {
  const map = {
    active: {
      title: "Happening Now",
      description: "Bookings currently running",
    },
    pending: {
      title: "Pending Approval",
      description: "Waiting for review or confirmation",
    },
    upcoming: {
      title: "Coming Up",
      description: "Your next scheduled bookings",
    },
    completed: {
      title: "Finished",
      description: "Finished bookings from your history",
    },
    cancelled: {
      title: "Cancelled / Rejected",
      description: "Cancelled or rejected reservations",
    },
  };
  return map[sectionKey] || { title: sectionKey, description: "" };
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

const ProgressBar = ({ percent }) => (
  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
    <div
      className="h-full rounded-full bg-[#295557] transition-all duration-500"
      style={{ width: `${percent}%` }}
    />
  </div>
);

const SummaryStats = ({ bookings }) => {
  const stats = useMemo(() => {
    return bookings.reduce(
      (acc, b) => {
        const phase = getTimelinePhase(b.apiStatus);
        acc[phase] += 1;
        return acc;
      },
      { active: 0, pending: 0, upcoming: 0, completed: 0, cancelled: 0 }
    );
  }, [bookings]);

  const items = [
    {
      key: "active",
      label: "On Going",
      value: stats.active,
      classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      key: "pending",
      label: "Pending",
      value: stats.pending,
      classes: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      key: "upcoming",
      label: "Upcoming",
      value: stats.upcoming,
      classes: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      key: "completed",
      label: "Completed",
      value: stats.completed,
      classes: "bg-[#295557]/10 text-[#295557] border-[#295557]/20",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value: stats.cancelled,
      classes: "bg-gray-50 text-gray-600 border-gray-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      {items.map((item) => (
        <div
          key={item.key}
          className={`rounded-2xl border px-4 py-3 ${item.classes}`}
        >
          <div className="text-2xl font-bold mb-1">{item.value}</div>
          <div className="text-xs font-semibold">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

const NextReminderCard = ({ booking, onOpen }) => {
  if (!booking) return null;

  const phase = getTimelinePhase(booking.apiStatus);
  const phaseConfig = getPhaseConfig(phase);
  const progress = getProgressPercent(
    booking.startDate,
    booking.endDate,
    booking.apiStatus
  );
  const summaryText = buildTimelineSummaryText(booking);
  const isCancelled =
    booking.apiStatus === "cancelled_by_user" ||
    booking.apiStatus === "cancelled";

  return (
    <div className="mb-6 rounded-2xl border border-[#295557]/15 bg-[#295557]/10 overflow-hidden shadow-sm">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#295557]/10 text-[#295557] text-xs font-semibold mb-3">
              <FiTrendingUp className="w-3.5 h-3.5" />
              Your Next Reminder
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-snug mb-1">
              {booking.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-white bg-[#295557]">
                <FiCalendar className="w-3 h-3" />
                Schedule
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${phaseConfig.badgeClass}`}
              >
                {phaseConfig.icon}
                {phaseConfig.label}
              </span>
              <span className="inline-flex items-center gap-1">
                <FiCalendar className="w-3.5 h-3.5" />
                {formatDate(booking.startDate)}
                {booking.endDate && booking.endDate !== booking.startDate && (
                  <> → {formatDate(booking.endDate)}</>
                )}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-0">{summaryText}</p>
          </div>

          <button
            onClick={() => onOpen(booking)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#295557] text-white text-sm font-semibold hover:bg-[#1f4345] transition-colors shadow-sm"
          >
            View Details
            <FiArrowRight className="w-4 h-4" />
          </button>
        </div>

        {!isCancelled && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>Progress</span>
              <span className="font-semibold text-[#295557]">{progress}%</span>
            </div>
            <ProgressBar percent={progress} />
          </div>
        )}
      </div>
    </div>
  );
};

const SectionHeader = ({ title, description, count }) => (
  <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
    <div>
      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-0.5">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-gray-500 mb-0">{description}</p>
    </div>
    <div className="px-3 py-1.5 rounded-xl bg-[#295557]/10 text-[#295557] text-xs sm:text-sm font-semibold">
      {count} booking{count === 1 ? "" : "s"}
    </div>
  </div>
);

const ScheduleTimelineItem = ({ booking, isLast, onOpen }) => {
  const [expanded, setExpanded] = useState(false);

  const phase = getTimelinePhase(booking.apiStatus);
  const phaseConfig = getPhaseConfig(phase);
  const progress = getProgressPercent(
    booking.startDate,
    booking.endDate,
    booking.apiStatus
  );
  const totalDays = getInclusiveDays(booking.startDate, booking.endDate);
  const summaryText = buildTimelineSummaryText(booking);
  const isCancelled =
    booking.apiStatus === "cancelled_by_user" ||
    booking.apiStatus === "cancelled" ||
    booking.apiStatus === "rejected";
  const showProgress =
    !isCancelled &&
    booking.apiStatus !== "pending" &&
    (booking.bookingType === "tour" || totalDays > 1 || phase === "completed");

  const typeLabel =
    booking.bookingType === "tour"
      ? "Tour"
      : booking.bookingType === "hotel"
        ? "Hotel"
        : booking.bookingType === "activity"
          ? "Activity"
          : booking.type === "self_riding"
            ? "Self Drive"
            : "Car";

  const typeIcon =
    booking.bookingType === "tour" ? (
      <MdTour className="w-4 h-4" />
    ) : booking.bookingType === "hotel" ? (
      <MdHotel className="w-4 h-4" />
    ) : booking.bookingType === "activity" ? (
      <MdLocalActivity className="w-4 h-4" />
    ) : (
      <IoCarSport className="w-4 h-4" />
    );

  return (
    <div className="flex gap-4">
      {/* ── Timeline dot + line ── */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`
            relative w-11 h-11 rounded-full flex items-center justify-center text-white shadow-sm bg-[#295557]
            ${isCancelled ? "opacity-60 grayscale" : ""}
          `}
        >
          {phase === "completed" ? <FiCheck className="w-4 h-4" /> : typeIcon}
          {phase === "active" && (
            <span className="absolute -right-0.5 -top-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
          )}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 flex-1 min-h-[48px] mt-1 ${phaseConfig.lineBg}`}
          />
        )}
      </div>

      {/* ── Card ── */}
      <div
        className={`
          flex-1 mb-6 rounded-2xl border bg-white overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md
          ${isCancelled ? "opacity-60 border-gray-200" : "border-gray-200 hover:border-[#295557]/30"}
        `}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative w-full md:w-[220px] h-[180px] md:h-auto md:min-h-[220px] flex-shrink-0">
            <img
              src={booking.mainImage}
              alt={booking.title}
              className={`w-full h-full object-cover ${isCancelled ? "grayscale" : ""}`}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/500x350?text=Booking";
              }}
            />
            <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-white shadow-sm bg-[#295557]">
                {typeIcon}
                {typeLabel}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border backdrop-blur-sm bg-white/90 ${phaseConfig.badgeClass}`}
              >
                {phaseConfig.icon}
                {phaseConfig.label}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-5 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
              <div className="min-w-0">
                <h4
                  className={`
                    text-base sm:text-lg font-bold leading-snug mb-1
                    ${isCancelled ? "text-gray-400 line-through" : "text-gray-800"}
                  `}
                >
                  {booking.title}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
                    {formatDate(booking.startDate)}
                    {booking.endDate &&
                      booking.endDate !== booking.startDate && (
                        <> → {formatDate(booking.endDate)}</>
                      )}
                  </span>
                  {booking.duration && (
                    <span className="inline-flex items-center gap-1">
                      <FiClock className="w-3.5 h-3.5 text-gray-400" />
                      {booking.duration}
                    </span>
                  )}
                  {booking.mainLocations?.[0] && (
                    <span className="inline-flex items-center gap-1 truncate max-w-[220px]">
                      <FiMapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {booking.mainLocations[0]}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`
                    text-lg sm:text-xl font-bold
                    ${isCancelled ? "text-gray-400 line-through" : "text-[#295557]"}
                  `}
                >
                  {formatPrice(booking.price, booking.priceCurrency)}
                </div>
                <div className="flex items-center justify-end gap-2 text-xs text-gray-500 mt-1">
                  {booking.numAdults > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <FiUser className="w-3.5 h-3.5" />
                      {booking.numAdults}
                    </span>
                  )}
                  {booking.numChildren > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <FiUsers className="w-3.5 h-3.5" />
                      {booking.numChildren}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 mb-3">
              <p className="text-sm text-gray-600 mb-0">{summaryText}</p>
            </div>

            {/* Progress */}
            {showProgress && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>Progress</span>
                  <span className="font-semibold text-[#295557]">
                    {progress}%
                  </span>
                </div>
                <ProgressBar percent={progress} />
              </div>
            )}

            {/* Expand itinerary */}
            {booking.bookingType === "tour" &&
              booking.itinerary?.length > 0 && (
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setExpanded((prev) => !prev)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#295557] hover:text-[#295557] transition-colors"
                  >
                    {expanded ? (
                      <>
                        <FiChevronUp className="w-4 h-4" />
                        Hide Itinerary
                      </>
                    ) : (
                      <>
                        <FiChevronDown className="w-4 h-4" />
                        View {booking.itinerary.length}-Day Itinerary
                      </>
                    )}
                  </button>
                </div>
              )}

            {/* Itinerary expanded */}
            {expanded &&
              booking.bookingType === "tour" &&
              booking.itinerary?.length > 0 && (
                <div className="mb-4 space-y-3 max-h-[320px] overflow-y-auto schedule-page-scroll pr-1">
                  {booking.itinerary.map((dayData, index) => {
                    const dayDate = new Date(booking.startDate);
                    dayDate.setDate(dayDate.getDate() + index);
                    dayDate.setHours(0, 0, 0, 0);

                    const today = getTodayMidnight();
                    const isDayPast = dayDate < today;
                    const isDayToday = dayDate.getTime() === today.getTime();

                    return (
                      <div
                        key={`${booking.id}-day-${dayData.day || index + 1}`}
                        className={`
                          rounded-xl border p-3
                          ${
                            isDayToday
                              ? "bg-emerald-50 border-emerald-200"
                              : isDayPast
                                ? "bg-gray-50 border-gray-200"
                                : "bg-[#295557]/5 border-[#295557]/10"
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`
                              w-10 h-10 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0 font-bold shadow-sm
                              ${
                                isDayToday
                                  ? "bg-emerald-500"
                                  : isDayPast
                                    ? "bg-gray-400"
                                    : "bg-[#295557]"
                              }
                            `}
                          >
                            <span className="text-[8px] leading-none opacity-90">
                              Day
                            </span>
                            <span className="text-sm leading-none">
                              {dayData.day || index + 1}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h5 className="text-sm font-semibold text-gray-800 mb-0">
                                {dayData.title}
                              </h5>
                              {isDayToday && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                  TODAY
                                </span>
                              )}
                              {isDayPast && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-600">
                                  DONE
                                </span>
                              )}
                              {!isDayToday && !isDayPast && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#295557]/10 text-[#295557]">
                                  UPCOMING
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
                            <div className="flex flex-wrap gap-1.5">
                              {dayData.hotel_reserved && (
                                <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-[#295557]/10 text-[#295557]">
                                  🏨 Hotel
                                </span>
                              )}
                              {dayData.car_reserved && (
                                <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-[#295557]/10 text-[#295557]">
                                  🚗 Car
                                </span>
                              )}
                              {Array.isArray(dayData.activities_reserved) &&
                                dayData.activities_reserved.length > 0 && (
                                  <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-[#e8a355]/15 text-[#b07a2e]">
                                    ⚡ {dayData.activities_reserved.length}{" "}
                                    Activit
                                    {dayData.activities_reserved.length === 1
                                      ? "y"
                                      : "ies"}
                                  </span>
                                )}
                              {dayData.tour_guide?.has_guide && (
                                <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-[#e8a355]/15 text-[#b07a2e]">
                                  👤 Guide
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            {/* View Details button */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => onOpen(booking)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#295557] text-white text-sm font-semibold hover:bg-[#1f4345] transition-colors"
              >
                View Details
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const SchedulePageClient = () => {
  const [userId, setUserId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setUserId(userData.id || userData.user_id || null);
    } catch {
      setUserId(null);
    }
  }, []);

  const mapReservationToBooking = useCallback((reservationItem) => {
    const itemType = reservationItem?.type;
    const details = reservationItem?.details || {};

    if (itemType === "package") {
      const reservation = details?.reservation || {};
      const tour = details?.tour_details || {};
      const normalizedStatus = normalizeReservationStatus(
        reservationItem?.status,
        reservation?.status,
        reservation?.start_date || reservationItem?.date_from,
        reservation?.end_date || reservationItem?.date_to
      );
      const routeLocations = buildRouteLocations(tour.route);
      const preparedItinerary = prepareTourItineraryForModal(
        Array.isArray(tour.itinerary) ? tour.itinerary : []
      );

      return {
        id: String(
          reservation.reservation_id || reservationItem.reservation_id
        ),
        reservation_id: String(
          reservation.reservation_id || reservationItem.reservation_id
        ),
        bookingType: "tour",
        title: tour.title || reservationItem.title || reservation.tour_title,
        duration: tour.duration || "Trip",
        mainImage:
          normalizeImage(reservationItem.image) ||
          normalizeImage(tour.background_image),
        image: normalizeImage(reservationItem.image),
        backgroundImage: normalizeImage(
          reservation.background_image ||
            tour.background_image ||
            reservationItem.image
        ),
        price: Number(reservation.total_amount || 0),
        priceCurrency: tour.price_currency || "$",
        numAdults: Number(reservation.num_adults || 0),
        numChildren: Number(reservation.num_children || 0),
        startDate: reservation.start_date || reservationItem.date_from,
        endDate: reservation.end_date || reservationItem.date_to,
        apiStatus: normalizedStatus,
        mainLocations: routeLocations.slice(0, 2),
        allLocations: routeLocations,
        itinerary: preparedItinerary,
        highlights: Array.isArray(tour.highlights) ? tour.highlights : [],
        includes: Array.isArray(tour.includes) ? tour.includes : [],
        excludes: Array.isArray(tour.excludes) ? tour.excludes : [],
        day_hotel: reservation.day_hotel || "",
        day_car: reservation.day_car || "",
        day_activities: reservation.day_activities || "",
        day_tour_guide: reservation.day_tour_guide || "",
        dayTourGuide: reservation.day_tour_guide || "",
        max_persons: tour.max_persons,
        _rawApiItem: reservationItem,
      };
    }

    if (itemType === "car") {
      const normalizedStatus = normalizeReservationStatus(
        reservationItem?.status,
        details?.status,
        details?.start_date || reservationItem?.date_from,
        details?.end_date || reservationItem?.date_to
      );
      const days = getInclusiveDays(
        details?.start_date || reservationItem?.date_from,
        details?.end_date || reservationItem?.date_to
      );

      return {
        id: String(details.reserving_id || reservationItem.reservation_id),
        reservation_id: String(
          details.reserving_id || reservationItem.reservation_id
        ),
        bookingType: "transportation",
        title: details.title || reservationItem.title,
        duration: `${days} ${days === 1 ? "Day" : "Days"}`,
        mainImage: normalizeImage(reservationItem.image || details.image),
        image: normalizeImage(reservationItem.image || details.image),
        backgroundImage: normalizeImage(
          details.background_image || reservationItem.image || details.image
        ),
        price: Number(details.total_amount || 0),
        priceCurrency: details.price_currency || "$",
        numAdults: 1,
        numChildren: 0,
        startDate: details.start_date || reservationItem.date_from,
        endDate: details.end_date || reservationItem.date_to,
        apiStatus: normalizedStatus,
        type: details.type,
        driverId: details.driver_id,
        features: Array.isArray(details.car_features)
          ? details.car_features
          : [],
        ratings: Array.isArray(details.car_ratings) ? details.car_ratings : [],
        mainLocations: details.location ? [details.location] : [],
        _rawApiItem: reservationItem,
      };
    }

    if (itemType === "activity") {
      const normalizedStatus = normalizeReservationStatus(
        reservationItem?.status,
        details?.status,
        details?.date || reservationItem?.date_from,
        details?.date || reservationItem?.date_from
      );

      return {
        id: String(details.reserving_id || reservationItem.reservation_id),
        reservation_id: String(
          details.reserving_id || reservationItem.reservation_id
        ),
        bookingType: "activity",
        title: details.title || reservationItem.title,
        duration: details.duration || "1 Day",
        mainImage: normalizeImage(reservationItem.image || details.image),
        image: normalizeImage(reservationItem.image || details.image),
        backgroundImage: normalizeImage(
          details.background_image || reservationItem.image || details.image
        ),
        price: Number(details.total_amount || 0),
        priceCurrency: details.price_currency || "$",
        numAdults: Number(details.adults_num || 0),
        numChildren: Number(details.childs_num || 0),
        startDate: details.date || reservationItem.date_from,
        endDate: details.date || reservationItem.date_from,
        apiStatus: normalizedStatus,
        features: Array.isArray(details.activity_features)
          ? details.activity_features
          : [],
        ratings: Array.isArray(details.activity_ratings)
          ? details.activity_ratings
          : [],
        mainLocations: details.route ? [details.route] : [],
        _rawApiItem: reservationItem,
      };
    }

    if (itemType === "hotel") {
      const normalizedStatus = normalizeReservationStatus(
        reservationItem?.status,
        details?.status,
        details?.start_date || reservationItem?.date_from,
        details?.end_date || reservationItem?.date_to
      );
      const parsedRooms = [
        ...(Array.isArray(details.rooms) ? details.rooms : []),
        ...(Array.isArray(details.hotel_reserved?.rooms)
          ? details.hotel_reserved.rooms
          : []),
        ...(parseMaybeJsonArray(details.rooms_json) || []),
      ];
      const uniqueRooms = parsedRooms.filter(
        (room, index, arr) =>
          arr.findIndex(
            (r) =>
              String(r.id || index) === String(room.id || index) &&
              String(r.adults || 0) === String(room.adults || 0) &&
              String(r.kids ?? r.children ?? 0) ===
                String(room.kids ?? room.children ?? 0) &&
              String(r.babies ?? r.infants ?? 0) ===
                String(room.babies ?? room.infants ?? 0)
          ) === index
      );
      const nights = Math.max(
        getInclusiveDays(
          details?.start_date || reservationItem?.date_from,
          details?.end_date || reservationItem?.date_to
        ) - 1,
        1
      );

      return {
        id: String(details.reserving_id || reservationItem.reservation_id),
        reservation_id: String(
          details.reserving_id || reservationItem.reservation_id
        ),
        bookingType: "hotel",
        title: details.title || reservationItem.title,
        duration:
          details.duration || `${nights} ${nights === 1 ? "Night" : "Nights"}`,
        mainImage: normalizeImage(reservationItem.image || details.image),
        image: normalizeImage(reservationItem.image || details.image),
        backgroundImage: normalizeImage(
          details.background_image || reservationItem.image || details.image
        ),
        price: Number(details.total_amount || 0),
        priceCurrency: details.price_currency || "$",
        numAdults: Number(details.adults_num || 0),
        numChildren: 0,
        startDate: details.start_date || reservationItem.date_from,
        endDate: details.end_date || reservationItem.date_to,
        apiStatus: normalizedStatus,
        mainLocations: details.location ? [details.location] : [],
        amenities: Array.isArray(details.hotel_amenities)
          ? details.hotel_amenities
          : [],
        ratings: Array.isArray(details.hotel_ratings)
          ? details.hotel_ratings
          : [],
        rooms: uniqueRooms,
        _rawApiItem: reservationItem,
      };
    }

    return null;
  }, []);

  const fetchSchedule = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError("");

      const response = await axios.post(`${baseUrl}/my_account/my_list.php`, {
        user_id: userId,
      });

      if (response?.data?.status !== "success") {
        throw new Error(response?.data?.message || "Failed to fetch schedule");
      }

      const reservations = Array.isArray(response?.data?.reservations)
        ? response.data.reservations
        : [];

      const mapped = reservations.map(mapReservationToBooking).filter(Boolean);

      setBookings(mapped);
    } catch (err) {
      console.error("Schedule fetch error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load schedule."
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [userId, mapReservationToBooking]);

  useEffect(() => {
    if (userId) fetchSchedule();
  }, [userId, fetchSchedule]);

  const filteredBookings = useMemo(() => {
    if (typeFilter === "all") return bookings;
    return bookings.filter((b) => b.bookingType === typeFilter);
  }, [bookings, typeFilter]);

  const sortedSections = useMemo(() => {
    const sections = {
      active: [],
      pending: [],
      upcoming: [],
      completed: [],
      cancelled: [],
    };

    filteredBookings.forEach((b) => {
      const phase = getTimelinePhase(b.apiStatus);
      if (sections[phase]) sections[phase].push(b);
      else sections.upcoming.push(b);
    });

    sections.active.sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );
    sections.pending.sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );
    sections.upcoming.sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );
    sections.completed.sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );
    sections.cancelled.sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );

    return sections;
  }, [filteredBookings]);

  const nextReminderBooking = useMemo(() => {
    return (
      sortedSections.active[0] ||
      sortedSections.pending[0] ||
      sortedSections.upcoming[0] ||
      null
    );
  }, [sortedSections]);

  const openDetails = useCallback((booking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  }, []);

  const closeDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedBooking(null);
  }, []);

  const renderModal = () => {
    if (!selectedBooking) return null;

    const modalProps = {
      open: detailsOpen,
      onClose: closeDetails,
      data: selectedBooking,
      refetchBookings: fetchSchedule,
    };

    if (selectedBooking.bookingType === "tour")
      return <TourDetailsModal {...modalProps} />;
    if (selectedBooking.bookingType === "activity")
      return <ActivityDetailsModal {...modalProps} />;
    if (selectedBooking.bookingType === "hotel")
      return <HotelDetailsModal {...modalProps} />;
    if (selectedBooking.bookingType === "transportation")
      return <TransportationDetailsModal {...modalProps} />;
    return null;
  };

  const typeFilters = [
    {
      id: "all",
      label: "All",
      count: bookings.length,
      icon: <FiCalendar className="w-3.5 h-3.5" />,
    },
    {
      id: "tour",
      label: "Tours",
      count: bookings.filter((b) => b.bookingType === "tour").length,
      icon: <MdTour className="w-3.5 h-3.5" />,
    },
    {
      id: "hotel",
      label: "Hotels",
      count: bookings.filter((b) => b.bookingType === "hotel").length,
      icon: <MdHotel className="w-3.5 h-3.5" />,
    },
    {
      id: "activity",
      label: "Activities",
      count: bookings.filter((b) => b.bookingType === "activity").length,
      icon: <MdLocalActivity className="w-3.5 h-3.5" />,
    },
    {
      id: "transportation",
      label: "Cars",
      count: bookings.filter((b) => b.bookingType === "transportation").length,
      icon: <IoCarSport className="w-3.5 h-3.5" />,
    },
  ];

  if (!userId && !loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <FiAlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-800 mb-2">Login Required</h3>
        <p className="text-sm text-gray-500 mb-0">
          Please log in to view your travel schedule.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-10 flex flex-col items-center justify-center min-h-[300px]">
        <FiLoader className="w-10 h-10 text-[#295557] animate-spin mb-4" />
        <p className="text-sm text-gray-500 mb-0">Loading your schedule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
        <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          Failed to load schedule
        </h3>
        <p className="text-sm text-gray-500 mb-5">{error}</p>
        <button
          type="button"
          onClick={fetchSchedule}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#295557] text-white text-sm font-semibold hover:bg-[#1f4345] transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-10 text-center">
        <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-700 mb-2">
          No bookings yet
        </h3>
        <p className="text-sm text-gray-400 mb-0">
          Your travel schedule will appear here once you make your first
          booking.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#295557] mb-2">
            My Schedule
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mb-0">
            A timeline of all your tours, hotels, cars, and activities — sorted
            by time so you always know what's next.
          </p>
        </div>

        {/* Stats */}
        <SummaryStats bookings={bookings} />

        {/* Next Reminder */}
        <NextReminderCard booking={nextReminderBooking} onOpen={openDetails} />

        {/* Type Filters */}
        <div className="mb-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {typeFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setTypeFilter(filter.id)}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all
                  ${
                    typeFilter === filter.id
                      ? "bg-[#295557] text-white border-[#295557]"
                      : "bg-white text-gray-600 border-gray-200 hover:text-[#295557] hover:border-[#295557]"
                  }
                `}
              >
                {filter.icon}
                {filter.label}
                <span
                  className={`
                    px-2 py-0.5 rounded-full text-[11px] font-bold
                    ${
                      typeFilter === filter.id
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        {filteredBookings.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-10 text-center">
            <FiCalendar className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              No schedule items found
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              There are no bookings under this filter right now.
            </p>
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className="text-sm text-[#295557] hover:underline font-medium"
            >
              Show all bookings
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(sortedSections).map(([sectionKey, items]) => {
              if (!items.length) return null;
              const meta = getSectionMeta(sectionKey);

              return (
                <div key={sectionKey} className="mb-8">
                  <SectionHeader
                    title={meta.title}
                    description={meta.description}
                    count={items.length}
                  />
                  <div>
                    {items.map((booking, index) => (
                      <ScheduleTimelineItem
                        key={`${booking.bookingType}-${booking.id}`}
                        booking={booking}
                        isLast={index === items.length - 1}
                        onOpen={openDetails}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {renderModal()}

      <style jsx>{`
        .schedule-page-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .schedule-page-scroll::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 9999px;
        }
        .schedule-page-scroll::-webkit-scrollbar-thumb {
          background: #295557;
          border-radius: 9999px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default SchedulePageClient;
