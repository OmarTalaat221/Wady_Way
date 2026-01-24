"use client";

import React, { useState } from "react";
import { IoCarSport } from "react-icons/io5";
import { MdTour, MdLocalActivity, MdHotel } from "react-icons/md";
import {
  FiClock,
  FiMapPin,
  FiUser,
  FiUsers,
  FiCalendar,
  FiCheck,
  FiPlay,
} from "react-icons/fi";

// Import modals
import TourDetailsModal from "../modals/TourDetailsModal";
import ActivityDetailsModal from "../modals/ActivityDetailsModal";
import HotelDetailsModal from "../modals/HotelDetailsModal";
import TransportationDetailsModal from "../modals/TransportationDetailsModal";

const BookingCard = ({ data }) => {
  const [modalOpen, setModalOpen] = useState(false);

  // Get main image - prioritize backgroundImage
  const mainImage =
    data?.backgroundImage ||
    data?.image ||
    data?.images?.[0]?.split("//CAMP//")[0] ||
    "https://via.placeholder.com/400x300?text=Booking";

  // Format price with currency
  const formatPrice = (price, currency = "$") => {
    if (!price) return "N/A";
    return `${currency}${parseFloat(price).toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString, includeYear = false) => {
    if (!dateString) return "";
    const options = includeYear
      ? { month: "short", day: "numeric", year: "numeric" }
      : { month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Get days info
  const getDaysInfo = () => {
    if (!data?.startDate || !data?.endDate) return null;

    const now = new Date();
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const daysUntilStart = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    const daysUntilEnd = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    if (daysUntilStart > 0) {
      return { text: `${daysUntilStart}d to go`, type: "upcoming" };
    } else if (daysUntilEnd >= 0) {
      return { text: `${daysUntilEnd}d left`, type: "active" };
    } else {
      return { text: "Ended", type: "ended" };
    }
  };

  const daysInfo = getDaysInfo();

  // Status configurations based on booking type
  const getStatusConfig = () => {
    const { status, bookingType, apiStatus } = data;

    // API status overrides
    const apiConfigs = {
      pending: {
        label: "Pending",
        icon: <FiClock className="w-3 h-3" />,
        classes: "bg-amber-50 text-amber-600 border-amber-200",
      },
      rejected: {
        label: "Rejected",
        icon: <FiCheck className="w-3 h-3" />,
        classes: "bg-red-50 text-red-600 border-red-200",
      },
      cancelled: {
        label: "Cancelled",
        icon: <FiCheck className="w-3 h-3" />,
        classes: "bg-gray-50 text-gray-500 border-gray-200",
      },
    };

    if (apiStatus && apiConfigs[apiStatus]) {
      return apiConfigs[apiStatus];
    }

    const configs = {
      tour: {
        noStarted: {
          label: "Upcoming",
          icon: <FiCalendar className="w-3 h-3" />,
          classes: "bg-blue-50 text-blue-600 border-blue-200",
        },
        started: {
          label: "On Trip",
          icon: <FiPlay className="w-3 h-3" />,
          classes: "bg-emerald-50 text-emerald-600 border-emerald-200",
        },
        finished: {
          label: "Completed",
          icon: <FiCheck className="w-3 h-3" />,
          classes: "bg-purple-50 text-purple-600 border-purple-200",
        },
      },
      activity: {
        noStarted: {
          label: "Scheduled",
          icon: <FiClock className="w-3 h-3" />,
          classes: "bg-orange-50 text-orange-600 border-orange-200",
        },
        started: {
          label: "Active",
          icon: <FiPlay className="w-3 h-3" />,
          classes: "bg-emerald-50 text-emerald-600 border-emerald-200",
        },
        finished: {
          label: "Done",
          icon: <FiCheck className="w-3 h-3" />,
          classes: "bg-purple-50 text-purple-600 border-purple-200",
        },
      },
      transportation: {
        noStarted: {
          label: "Reserved",
          icon: <IoCarSport className="w-3 h-3" />,
          classes: "bg-cyan-50 text-cyan-600 border-cyan-200",
        },
        started: {
          label: "Active",
          icon: <IoCarSport className="w-3 h-3" />,
          classes: "bg-emerald-50 text-emerald-600 border-emerald-200",
        },
        finished: {
          label: "Returned",
          icon: <FiCheck className="w-3 h-3" />,
          classes: "bg-purple-50 text-purple-600 border-purple-200",
        },
      },
      hotel: {
        noStarted: {
          label: "Upcoming",
          icon: <FiCalendar className="w-3 h-3" />,
          classes: "bg-purple-50 text-purple-600 border-purple-200",
        },
        started: {
          label: "Checked In",
          icon: <FiPlay className="w-3 h-3" />,
          classes: "bg-emerald-50 text-emerald-600 border-emerald-200",
        },
        finished: {
          label: "Checked Out",
          icon: <FiCheck className="w-3 h-3" />,
          classes: "bg-purple-50 text-purple-600 border-purple-200",
        },
      },
    };

    return configs[bookingType]?.[status] || configs.tour.noStarted;
  };

  const statusConfig = getStatusConfig();

  const typeConfigs = {
    tour: {
      icon: <MdTour className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: "Tour",
      color: "bg-teal-600",
    },
    hotel: {
      icon: <MdHotel className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: "Hotel",
      color: "bg-purple-600",
    },
    activity: {
      icon: <MdLocalActivity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: "Activity",
      color: "bg-orange-500",
    },
    transportation: {
      icon: <IoCarSport className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
      label: data?.type === "self_riding" ? "Self Drive" : "With Driver",
      color: "bg-blue-500",
    },
  };

  const typeConfig = typeConfigs[data?.bookingType] || typeConfigs.tour;

  // Render appropriate modal
  const renderModal = () => {
    switch (data?.bookingType) {
      case "tour":
        return (
          <TourDetailsModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            data={data}
          />
        );
      case "activity":
        return (
          <ActivityDetailsModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            data={data}
          />
        );
      case "hotel":
        return (
          <HotelDetailsModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            data={data}
          />
        );
      case "transportation":
        return (
          <TransportationDetailsModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            data={data}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="h-full group bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 overflow-hidden">
        {/* Mobile: Stacked Layout, Desktop: Horizontal Layout */}
        <div className="flex flex-col sm:flex-row h-full">
          {/* Image Section */}
          <div className="relative w-full sm:w-2/5 h-40 sm:h-auto sm:min-h-[180px] lg:min-h-[200px]">
            <div
              onClick={() => setModalOpen(true)}
              className="block h-full cursor-pointer"
            >
              <img
                src={mainImage}
                alt={data?.title || "Booking"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
            </div>

            {/* Type Badge */}
            <span
              className={`absolute top-2 left-2 sm:top-3 sm:left-3 ${typeConfig.color} text-white px-2 py-1 sm:px-2.5 rounded-lg text-[10px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 shadow-md`}
            >
              {typeConfig.icon}
              <span className="hidden xs:inline">{typeConfig.label}</span>
            </span>

            {/* Progress Overlay - Only for started bookings */}
            {data?.status === "started" && (
              <div className="absolute bottom-0 inset-x-0">
                <div className="bg-black/50 backdrop-blur-sm px-2 py-1.5 sm:px-3 sm:py-2">
                  <div className="flex justify-between items-center text-white text-[10px] sm:text-xs mb-1">
                    <span>{data?.progress || 0}% complete</span>
                    {daysInfo && <span>{daysInfo.text}</span>}
                  </div>
                  <div className="w-full h-1 sm:h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all"
                      style={{ width: `${data?.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-3 sm:p-4 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
              <h5
                onClick={() => setModalOpen(true)}
                className="text-[#295557] font-semibold text-sm sm:text-base leading-snug line-clamp-2 flex-1 min-w-0 cursor-pointer hover:text-[#1e3d3f] transition-colors"
              >
                {data?.title}
              </h5>

              {/* Status Badge */}
              <span
                className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold border ${statusConfig.classes}`}
              >
                {statusConfig.icon}
                <span className="hidden xs:inline">{statusConfig.label}</span>
              </span>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
              {/* Duration */}
              <span className="inline-flex items-center gap-1">
                <FiClock className="w-3.5 h-3.5 text-teal-600" />
                {data?.duration}
              </span>

              {/* Location */}
              {data?.mainLocations?.[0] && (
                <span className="inline-flex items-center gap-1 truncate max-w-[120px] sm:max-w-none">
                  <FiMapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                  <span className="truncate">{data.mainLocations[0]}</span>
                </span>
              )}
            </div>

            {/* Dates */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 bg-gray-50 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">
              <FiCalendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 flex-shrink-0" />
              <span className="truncate">
                {formatDate(data?.startDate)} —{" "}
                {formatDate(data?.endDate, true)}
              </span>
            </div>

            {/* Footer */}
            <div className="mt-auto flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 gap-2">
              {/* Guests & Price */}
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                {/* Guests */}
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                  {data?.numAdults > 0 && (
                    <span className="flex items-center gap-0.5 sm:gap-1">
                      <FiUser className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      {data.numAdults}
                    </span>
                  )}
                  {data?.numChildren > 0 && (
                    <span className="flex items-center gap-0.5 sm:gap-1">
                      <FiUsers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      {data.numChildren}
                    </span>
                  )}
                </div>

                {/* Price */}
                <span className="text-sm sm:text-lg font-bold text-teal-600">
                  {formatPrice(data?.price, data?.priceCurrency)}
                </span>
              </div>

              {/* View Button */}
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1 sm:gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all group/btn flex-shrink-0"
              >
                <span>View Details</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Render Modal */}
      {renderModal()}
    </>
  );
};

export default BookingCard;
