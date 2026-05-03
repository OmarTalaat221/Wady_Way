"use client";

import React, { useMemo, useState } from "react";
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
  FiX,
  FiEdit2,
  FiPaperclip,
  FiDownload,
  FiExternalLink,
} from "react-icons/fi";
import { Modal } from "antd";

import TourDetailsModal from "../modals/TourDetailsModal";
import ActivityDetailsModal from "../modals/ActivityDetailsModal";
import HotelDetailsModal from "../modals/HotelDetailsModal";
import TransportationDetailsModal from "../modals/TransportationDetailsModal";
import EditTourBookingModal from "../modals/EditTourBookingModal";
import EditHotelBookingModal from "../modals/EditHotelBookingModal";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const splitCampImage = (value) => {
  if (!value || typeof value !== "string") return "";
  return value.split("//CAMP//")[0] || value;
};

const normalizeHotelRoomsForEdit = (...sources) => {
  const firstValidSource = sources.find(
    (source) => Array.isArray(source) && source.length > 0
  );

  if (!firstValidSource) return [];

  return firstValidSource.map((room, index) => ({
    room_id: room?.room_id || room?.id || null,
    id: room?.room_id || room?.id || index + 1,
    adults: Math.max(0, toNumber(room?.adults, 0)),
    kids: Math.max(0, toNumber(room?.kids ?? room?.children, 0)),
    babies: Math.max(0, toNumber(room?.babies ?? room?.infants, 0)),
  }));
};

const sumHotelRooms = (rooms = []) => {
  return rooms.reduce(
    (acc, room) => ({
      adults: acc.adults + toNumber(room?.adults, 0),
      kids: acc.kids + toNumber(room?.kids ?? room?.children, 0),
      babies: acc.babies + toNumber(room?.babies ?? room?.infants, 0),
    }),
    { adults: 0, kids: 0, babies: 0 }
  );
};

const BookingCard = ({ data, refetchTours }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [attachmentsModalOpen, setAttachmentsModalOpen] = useState(false);

  const mainImage =
    data?.backgroundImage ||
    data?.image ||
    data?.images?.[0]?.split("//CAMP//")[0];

  const isCancelledByUser =
    data?.apiStatus === "cancelled_by_user" ||
    data?.status === "cancelled_by_user";

  const attachments =
    data?._rawApiItem?.tour_details?.attachments ||
    data?._rawApiItem?.attachments ||
    data?.attachments ||
    [];

  const hasAttachments =
    data?.bookingType === "tour" &&
    Array.isArray(attachments) &&
    attachments.length > 0;

  const isPendingBooking =
    data?.apiStatus === "pending" || data?.status === "pending";

  const showEditButton =
    isPendingBooking &&
    (data?.bookingType === "tour" || data?.bookingType === "hotel");

  const hasActionButtons = showEditButton || hasAttachments;

  const hotelRoomTotals = useMemo(() => {
    if (data?.bookingType !== "hotel") {
      return { adults: 0, kids: 0, babies: 0 };
    }

    const raw = data?._rawApiItem || {};
    const rawReservation = raw?.reservation || raw;

    const rooms = normalizeHotelRoomsForEdit(
      data?.rooms,
      rawReservation?.rooms,
      raw?.rooms,
      raw?.hotel_reserved?.rooms
    );

    return sumHotelRooms(rooms);
  }, [data]);

  const displayAdults =
    data?.bookingType === "hotel" && hotelRoomTotals.adults > 0
      ? hotelRoomTotals.adults
      : data?.numAdults;

  const displayChildren =
    data?.bookingType === "hotel" && hotelRoomTotals.kids > 0
      ? hotelRoomTotals.kids
      : data?.numChildren;

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return `$${parseFloat(price).toLocaleString()}`;
  };

  const formatDate = (dateString, includeYear = false) => {
    if (!dateString) return "";
    const options = includeYear
      ? { month: "short", day: "numeric", year: "numeric" }
      : { month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

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

  const getStatusConfig = () => {
    const { status, bookingType, apiStatus } = data;

    const apiConfigs = {
      pending: {
        label: "Pending",
        icon: <FiClock className="w-3 h-3" />,
        classes: "bg-amber-50 text-amber-600 border-amber-200",
      },
      rejected: {
        label: "Rejected",
        icon: <FiX className="w-3 h-3" />,
        classes: "bg-red-50 text-red-600 border-red-200",
      },
      cancelled: {
        label: "Cancelled",
        icon: <FiX className="w-3 h-3" />,
        classes: "bg-gray-50 text-gray-500 border-gray-200",
      },
      cancelled_by_user: {
        label: "Cancelled",
        icon: <FiX className="w-3 h-3" />,
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

  const getFileName = (url) => {
    try {
      const parts = url.split("/");
      const fullName = parts[parts.length - 1];
      const decoded = decodeURIComponent(fullName);
      if (decoded.length > 35) {
        const ext = decoded.split(".").pop();
        return decoded.substring(0, 30) + "..." + ext;
      }
      return decoded;
    } catch {
      return "Document";
    }
  };

  const getFileExtension = (url) => {
    try {
      return url.split(".").pop().toUpperCase();
    } catch {
      return "FILE";
    }
  };

  const buildTourEditModalData = () => {
    if (data?._rawApiItem) return data._rawApiItem;

    return {
      reservation: {
        reservation_id: data?.reservation_id || data?.id,
        tour_id: data?.tour_id || data?.tourId,
        user_id: null,
        num_adults: data?.numAdults || 1,
        num_children: data?.numChildren || 0,
        total_amount: data?.price,
        day_hotel: data?.day_hotel || "",
        day_car: data?.day_car || "",
        day_activities: data?.day_activities || "",
        day_tour_guide: data?.day_tour_guide || "",
        start_date: data?.startDate,
        end_date: data?.endDate,
        status: data?.status,
      },
      tour_details: {
        id: data?.tour_id || data?.tourId,
        title: data?.title,
        background_image: data?.backgroundImage || data?.image,
        duration: data?.duration,
        route: data?.additionalLocations?.join(" - "),
        max_persons: data?.max_persons,
        itinerary: data?.itinerary || [],
      },
    };
  };

  const buildHotelEditModalData = () => {
    const raw = data?._rawApiItem || {};
    const rawReservation = raw?.reservation || raw;
    const rawHotelDetails = raw?.hotel_details || raw?.hotel || raw;

    const normalizedRooms = normalizeHotelRoomsForEdit(
      data?.rooms,
      rawReservation?.rooms,
      raw?.rooms,
      raw?.hotel_reserved?.rooms
    );

    const roomTotals = sumHotelRooms(normalizedRooms);

    const resolvedAdults =
      roomTotals.adults > 0
        ? roomTotals.adults
        : toNumber(
            rawReservation?.adults ||
              rawReservation?.num_adults ||
              rawReservation?.adults_num ||
              data?.adults ||
              data?.numAdults ||
              data?.adults_num,
            1
          );

    const resolvedKids =
      normalizedRooms.length > 0
        ? roomTotals.kids
        : toNumber(
            rawReservation?.kids ||
              rawReservation?.num_children ||
              rawReservation?.childs_num ||
              data?.kids ||
              data?.numChildren ||
              data?.childs_num,
            0
          );

    const resolvedBabies =
      normalizedRooms.length > 0
        ? roomTotals.babies
        : toNumber(
            rawReservation?.babies ||
              rawReservation?.num_infants ||
              rawReservation?.babies_num ||
              data?.babies ||
              data?.numInfants ||
              data?.babies_num,
            0
          );

    const reservationId =
      rawReservation?.reservation_id ||
      rawReservation?.reserving_id ||
      data?.reservation_id ||
      data?.reserving_id ||
      data?.id;

    const hotelId =
      rawReservation?.hotel_id ||
      rawHotelDetails?.hotel_id ||
      rawHotelDetails?.id ||
      data?.hotel_id ||
      data?.hotelId;

    const resolvedImage =
      splitCampImage(
        rawHotelDetails?.background_image ||
          rawHotelDetails?.backgroundImage ||
          rawHotelDetails?.image ||
          data?.backgroundImage ||
          data?.background_image ||
          data?.image
      ) || mainImage;

    return {
      ...raw,

      reservation: {
        ...(typeof rawReservation === "object" ? rawReservation : {}),

        reservation_id: reservationId,
        reserving_id: reservationId,
        user_id:
          rawReservation?.user_id ||
          rawReservation?.userId ||
          data?.user_id ||
          data?.userId ||
          null,
        hotel_id: hotelId,

        aditional_services:
          rawReservation?.aditional_services ||
          rawReservation?.additional_services ||
          data?.aditional_services ||
          data?.additional_services ||
          "",

        total_amount:
          rawReservation?.total_amount ||
          data?.total_amount ||
          data?.price ||
          0,

        start_date:
          rawReservation?.start_date ||
          rawReservation?.startDate ||
          data?.start_date ||
          data?.startDate ||
          "",

        end_date:
          rawReservation?.end_date ||
          rawReservation?.endDate ||
          data?.end_date ||
          data?.endDate ||
          "",

        invite_code:
          rawReservation?.invite_code ||
          rawReservation?.inviteCode ||
          data?.invite_code ||
          data?.inviteCode ||
          "",

        day: rawReservation?.day || data?.day || "",
        adults: String(resolvedAdults || 1),
        kids: String(resolvedKids || 0),
        babies: String(resolvedBabies || 0),
        status: rawReservation?.status || data?.status || data?.apiStatus,

        rooms: normalizedRooms,
      },

      hotel_details: {
        ...(typeof rawHotelDetails === "object" ? rawHotelDetails : {}),

        id: rawHotelDetails?.id || hotelId,
        hotel_id: hotelId,

        title:
          rawHotelDetails?.title ||
          rawHotelDetails?.name ||
          data?.title ||
          data?.hotel_name ||
          "Hotel",

        name:
          rawHotelDetails?.name ||
          rawHotelDetails?.title ||
          data?.title ||
          data?.hotel_name ||
          "Hotel",

        background_image: resolvedImage,
        image: resolvedImage,

        location:
          rawHotelDetails?.location ||
          data?.mainLocations?.[0] ||
          data?.location ||
          data?.city ||
          "",

        city: rawHotelDetails?.city || data?.city || "",
        address: rawHotelDetails?.address || data?.address || "",

        price_per_night:
          rawHotelDetails?.price_per_night ||
          rawHotelDetails?.price_current ||
          rawHotelDetails?.adult_price ||
          data?.price_per_night ||
          data?.pricePerNight ||
          data?.price_current ||
          data?.adult_price ||
          0,

        price_current:
          rawHotelDetails?.price_current ||
          data?.price_current ||
          data?.pricePerNight ||
          0,

        adult_price:
          rawHotelDetails?.adult_price ||
          data?.adult_price ||
          data?.price_current ||
          data?.pricePerNight ||
          0,

        child_price: rawHotelDetails?.child_price || data?.child_price || 0,

        per_room:
          rawHotelDetails?.per_room || data?.per_room || raw?.per_room || 4,

        max_persons:
          rawHotelDetails?.max_persons ||
          data?.max_persons ||
          data?.maxPersons ||
          50,

        rooms: normalizedRooms,
      },

      rooms: normalizedRooms,
    };
  };

  const renderModal = () => {
    switch (data?.bookingType) {
      case "tour":
        return (
          <TourDetailsModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            data={data}
            refetchBookings={refetchTours}
          />
        );
      case "activity":
        return (
          <ActivityDetailsModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            data={data}
            refetchBookings={refetchTours}
          />
        );
      case "hotel":
        return (
          <HotelDetailsModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            data={data}
            refetchBookings={refetchTours}
          />
        );
      case "transportation":
        return (
          <TransportationDetailsModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            data={data}
            refetchBookings={refetchTours}
          />
        );
      default:
        return null;
    }
  };

  const renderEditModal = () => {
    if (!editModalOpen) return null;

    if (data?.bookingType === "tour") {
      return (
        <EditTourBookingModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
          }}
          onSaved={() => {
            setEditModalOpen(false);
            refetchTours?.();
          }}
          data={buildTourEditModalData()}
          tourId={data?.tourId || data?.tour_id}
        />
      );
    }

    if (data?.bookingType === "hotel") {
      return (
        <EditHotelBookingModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
          }}
          onSaved={() => {
            setEditModalOpen(false);
            refetchTours?.();
          }}
          data={buildHotelEditModalData()}
        />
      );
    }

    return null;
  };

  return (
    <>
      <div
        className={`h-full group bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 overflow-hidden ${
          isCancelledByUser ? "opacity-60" : ""
        }`}
      >
        <div className="flex flex-col sm:flex-row h-full">
          <div className="relative w-full sm:w-2/5 flex-shrink-0 overflow-hidden">
            <div
              onClick={() => setModalOpen(true)}
              className="block cursor-pointer"
            >
              <img
                src={mainImage}
                alt={data?.title || "Booking"}
                className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                  isCancelledByUser ? "grayscale" : ""
                }`}
                style={{ height: "260px" }}
              />
            </div>

            <span
              className={`absolute top-2.5 left-2.5 sm:top-3 sm:left-3 ${typeConfig.color} text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 shadow-md z-[2]`}
            >
              {typeConfig.icon}
              {typeConfig.label}
            </span>

            {data?.status === "started" && (
              <div className="absolute bottom-0 inset-x-0 z-[1]">
                <div className="bg-black/50 backdrop-blur-sm px-3 py-2">
                  <div className="flex justify-between items-center text-white text-[11px] sm:text-xs mb-1">
                    <span>{data?.progress || 0}% complete</span>
                    {daysInfo && <span>{daysInfo.text}</span>}
                  </div>
                  <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all"
                      style={{ width: `${data?.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 p-3 sm:p-4 flex flex-col min-w-0">
            <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
              <h5
                onClick={() => setModalOpen(true)}
                className={`font-semibold text-sm sm:text-base leading-snug line-clamp-2 flex-1 min-w-0 cursor-pointer transition-colors ${
                  isCancelledByUser
                    ? "text-gray-400"
                    : "text-[#295557] hover:text-[#1e3d3f]"
                }`}
              >
                {data?.title}
              </h5>

              <span
                className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold border ${statusConfig.classes}`}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
              <span className="inline-flex items-center gap-1">
                <FiClock className="w-3.5 h-3.5 text-teal-600" />
                {data?.duration}
              </span>

              {data?.mainLocations?.[0] && (
                <span className="inline-flex items-center gap-1 truncate max-w-[120px] sm:max-w-none">
                  <FiMapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                  <span className="truncate">{data.mainLocations[0]}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 bg-gray-50 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">
              <FiCalendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 flex-shrink-0" />
              <span className="truncate">
                {formatDate(data?.startDate)} —{" "}
                {formatDate(data?.endDate, true)}
              </span>
            </div>

            {hasActionButtons && (
              <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
                {showEditButton && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#295557]/5 hover:bg-[#295557] text-[#295557] hover:text-white border border-[#295557]/20 hover:border-[#295557] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" />
                    Edit Booking
                  </button>
                )}

                {hasAttachments && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttachmentsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#e8a355]/5 hover:bg-[#e8a355] text-[#e8a355] hover:text-white border border-[#e8a355]/20 hover:border-[#e8a355] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                  >
                    <FiPaperclip className="w-3.5 h-3.5" />
                    Attachments ({attachments.length})
                  </button>
                )}
              </div>
            )}

            <div className="mt-auto flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 gap-2 flex-wrap">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                  {displayAdults > 0 && (
                    <span className="flex items-center gap-0.5 sm:gap-1">
                      <FiUser className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      {displayAdults}
                    </span>
                  )}

                  {displayChildren > 0 && (
                    <span className="flex items-center gap-0.5 sm:gap-1">
                      <FiUsers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      {displayChildren}
                    </span>
                  )}
                </div>

                <span
                  className={`text-sm sm:text-lg font-bold ${
                    isCancelledByUser
                      ? "text-gray-400 line-through"
                      : "text-teal-600"
                  }`}
                >
                  {formatPrice(data?.price)}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex-shrink-0"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {renderModal()}
      {renderEditModal()}

      <Modal
        open={attachmentsModalOpen}
        onCancel={() => setAttachmentsModalOpen(false)}
        footer={null}
        centered
        destroyOnClose
        width={500}
        title={
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#e8a355]/10 flex items-center justify-center flex-shrink-0">
              <FiPaperclip
                className="w-[18px] h-[18px]"
                style={{ color: "#e8a355" }}
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 m-0">
                Tour Attachments
              </h3>
              <p className="text-xs text-gray-400 m-0 mt-0.5">
                {attachments.length} file
                {attachments.length !== 1 ? "s" : ""} available for download
              </p>
            </div>
          </div>
        }
      >
        <div className="py-2">
          <div className="flex items-center gap-3 px-1 py-3 mb-4 border-b border-gray-100">
            <img
              src={mainImage}
              alt={data?.title}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#295557] truncate m-0">
                {data?.title}
              </p>
              <p className="text-xs text-gray-400 m-0 mt-0.5">
                {data?.duration} • {formatDate(data?.startDate)} —{" "}
                {formatDate(data?.endDate, true)}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {attachments.map((url, idx) => {
              const fileName = getFileName(url);
              const ext = getFileExtension(url);

              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#295557]/20 hover:bg-[#295557]/[0.02] transition-all duration-200 group/file"
                >
                  <div className="w-11 h-11 rounded-xl bg-red-50 flex flex-col items-center justify-center flex-shrink-0 group-hover/file:bg-red-100 transition-colors">
                    <svg
                      className="w-5 h-5 text-red-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span className="text-[8px] font-bold text-red-500 mt-0.5">
                      {ext}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate m-0 group-hover/file:text-[#295557] transition-colors">
                      {fileName}
                    </p>
                    <p className="text-[11px] text-gray-400 m-0 mt-0.5">
                      {ext} Document • File {idx + 1} of {attachments.length}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-[#295557] text-gray-400 hover:text-white transition-all duration-200"
                      title="Open in new tab"
                    >
                      <FiExternalLink className="w-4 h-4" />
                    </a>
                    <a
                      href={url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-[#e8a355] text-gray-400 hover:text-white transition-all duration-200"
                      title="Download"
                    >
                      <FiDownload className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {attachments.length > 1 && (
            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <p className="text-[11px] text-gray-400 m-0">
                Click on any file to open or download it
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default BookingCard;
