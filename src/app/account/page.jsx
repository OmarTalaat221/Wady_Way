// Account.jsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import BookingCard from "./../../components/cards/BookingCard";
import axios from "axios";
import { baseUrl } from "../../Constants/Const";
import { IoGridOutline } from "react-icons/io5";
import { MdTour, MdLocalActivity, MdHotel } from "react-icons/md";
import { IoCarSport } from "react-icons/io5";
import {
  FiFilter,
  FiCalendar,
  FiPlay,
  FiCheck,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const CAMP_SEPARATOR = "//CAMP//";

const Account = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam) : 1;
  });

  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const limitParam = searchParams.get("limit");
    return limitParam ? parseInt(limitParam) : 6;
  });

  const [statusFilter, setStatusFilter] = useState(() => {
    return searchParams.get("status") || "all";
  });

  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get("tab") || "all";
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  // ─── Image helpers ─────────────────────────────────────────────────────────
  const splitCampImages = (value) => {
    if (Array.isArray(value)) {
      return value.flatMap((item) => splitCampImages(item)).filter(Boolean);
    }
    if (!value || typeof value !== "string") return [];
    return value
      .split(CAMP_SEPARATOR)
      .map((img) => img?.trim())
      .filter(Boolean);
  };

  const getFirstImage = (value) => splitCampImages(value)[0] || "";

  // ─── Normalize a single media entity (hotel / car / activity object) ───────
  const normalizeMediaEntity = (entity) => {
    if (!entity || typeof entity !== "object") return entity;

    const imageCandidates = [
      entity.image,
      entity.background_image,
      entity.cover_image,
      entity.main_image,
    ].filter(Boolean);

    const allImages = imageCandidates.flatMap((img) => splitCampImages(img));
    const firstImage = allImages[0] || "";

    return {
      ...entity,
      image: firstImage || entity.image || "",
      background_image:
        getFirstImage(entity.background_image || entity.image) ||
        entity.background_image ||
        "",
      cover_image:
        getFirstImage(entity.cover_image || entity.image) ||
        entity.cover_image ||
        entity.image ||
        "",
      images:
        Array.isArray(entity.images) && entity.images.length > 0
          ? entity.images.flatMap((img) => splitCampImages(img)).filter(Boolean)
          : allImages,
    };
  };

  // ─── Normalize car_reserved — supports object OR array ────────────────────
  const normalizeCarReserved = (value) => {
    if (!value) return null;

    // Array (new API shape)
    if (Array.isArray(value)) {
      if (value.length === 0) return [];
      return value.map((car) => normalizeMediaEntity(car));
    }

    // Object (old API shape) → wrap into array for uniform access
    if (typeof value === "object") {
      return [normalizeMediaEntity(value)];
    }

    return null;
  };

  // ─── Normalize activity_reserved — supports object OR array ──────────────
  const normalizeActivitiesCollection = (value) => {
    if (!value) return [];

    // Array (new API shape)
    if (Array.isArray(value)) {
      return value.map((activity) => normalizeMediaEntity(activity));
    }

    // JSON string
    if (typeof value === "string") {
      const parsed = parseMaybeJsonArray(value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((activity) => normalizeMediaEntity(activity));
      }
      return [];
    }

    // Single object (old API shape)
    if (typeof value === "object") {
      return [normalizeMediaEntity(value)];
    }

    return [];
  };

  // ─── Normalize one itinerary day ──────────────────────────────────────────
  const normalizeItineraryDay = (day) => {
    if (!day || typeof day !== "object") return day;

    const normalizedCars = normalizeCarReserved(day.car_reserved);
    const normalizedActivities = normalizeActivitiesCollection(
      day.activity_reserved
    );

    return {
      ...day,
      hotel_reserved: day.hotel_reserved
        ? normalizeMediaEntity(day.hotel_reserved)
        : day.hotel_reserved,
      // Always stored as array (empty [] if none)
      car_reserved: normalizedCars ?? [],
      // Always stored as array (empty [] if none)
      activity_reserved: normalizedActivities,
      day_activities: normalizeActivitiesCollection(day.day_activities),
    };
  };

  // ─── Date helpers ──────────────────────────────────────────────────────────
  const normalizeDate = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const getInclusiveDaysCount = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
    const diffInDays = Math.round((end - start) / MS_PER_DAY);
    return diffInDays >= 0 ? diffInDays + 1 : 1;
  };

  const getCurrentRunningDayNumber = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const today = normalizeDate(new Date());
    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    if (today < start) return 0;
    const totalDays = getInclusiveDaysCount(start, end);
    if (today > end) return totalDays;
    const diffFromStart = Math.round((today - start) / MS_PER_DAY);
    return Math.min(diffFromStart + 1, totalDays);
  };

  const getCompletedDaysCount = (startDate, endDate, status) => {
    const totalDays = getInclusiveDaysCount(startDate, endDate);
    if (status === "completed") return totalDays;
    if (
      [
        "upcoming",
        "pending",
        "rejected",
        "cancelled_by_user",
        "cancelled",
      ].includes(status)
    )
      return 0;
    if (status === "in_progress") {
      const today = normalizeDate(new Date());
      const start = normalizeDate(startDate);
      const end = normalizeDate(endDate);
      if (today <= start) return 0;
      if (today > end) return totalDays;
      return Math.min(Math.floor((today - start) / MS_PER_DAY), totalDays);
    }
    return 0;
  };

  const calculateProgress = (startDate, endDate, status) => {
    if (status === "completed") return 100;
    if (
      [
        "upcoming",
        "pending",
        "rejected",
        "cancelled_by_user",
        "cancelled",
      ].includes(status)
    )
      return 0;
    if (status === "in_progress") {
      const totalDays = getInclusiveDaysCount(startDate, endDate);
      const completedDays = getCompletedDaysCount(startDate, endDate, status);
      if (totalDays <= 0) return 0;
      return Math.min(
        Math.max(Math.round((completedDays / totalDays) * 100), 0),
        100
      );
    }
    return 0;
  };

  // ─── URL params ────────────────────────────────────────────────────────────
  const updateURLParams = (updates = {}) => {
    const params = new URLSearchParams(searchParams.toString());

    const page = updates.page !== undefined ? updates.page : currentPage;
    if (page && page !== 1) params.set("page", page.toString());
    else params.delete("page");

    const limit = updates.limit !== undefined ? updates.limit : itemsPerPage;
    if (limit && limit !== 6) params.set("limit", limit.toString());
    else params.delete("limit");

    const status = updates.status !== undefined ? updates.status : statusFilter;
    if (status && status !== "all") params.set("status", status);
    else params.delete("status");

    const tab = updates.tab !== undefined ? updates.tab : activeTab;
    if (tab && tab !== "all") params.set("tab", tab);
    else params.delete("tab");

    const newURL = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.push(newURL, { scroll: false });
  };

  useEffect(() => {
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const statusParam = searchParams.get("status");
    const tabParam = searchParams.get("tab");

    const newPage = pageParam ? parseInt(pageParam) : 1;
    const newLimit = limitParam ? parseInt(limitParam) : 6;
    const newStatus = statusParam || "all";
    const newTab = tabParam || "all";

    if (newPage !== currentPage) setCurrentPage(newPage);
    if (newLimit !== itemsPerPage) setItemsPerPage(newLimit);
    if (newStatus !== statusFilter) setStatusFilter(newStatus);
    if (newTab !== activeTab) setActiveTab(newTab);
  }, [searchParams]);

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUserId(userData.id || userData.user_id);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // ─── Status config ─────────────────────────────────────────────────────────
  const getStatusConfig = (bookingType, apiStatus) => {
    const statusConfigs = {
      pending: {
        tour: {
          label: "Pending",
          icon: <FiClock className="w-3 h-3" />,
          classes: "bg-amber-50 text-amber-600 border-amber-200",
        },
        activity: {
          label: "Pending",
          icon: <FiClock className="w-3 h-3" />,
          classes: "bg-amber-50 text-amber-600 border-amber-200",
        },
        hotel: {
          label: "Pending",
          icon: <FiClock className="w-3 h-3" />,
          classes: "bg-amber-50 text-amber-600 border-amber-200",
        },
        transportation: {
          label: "Pending",
          icon: <FiClock className="w-3 h-3" />,
          classes: "bg-amber-50 text-amber-600 border-amber-200",
        },
      },
      rejected: {
        tour: {
          label: "Rejected",
          icon: <FiX className="w-3 h-3" />,
          classes: "bg-red-50 text-red-600 border-red-200",
        },
        activity: {
          label: "Rejected",
          icon: <FiX className="w-3 h-3" />,
          classes: "bg-red-50 text-red-600 border-red-200",
        },
        hotel: {
          label: "Rejected",
          icon: <FiX className="w-3 h-3" />,
          classes: "bg-red-50 text-red-600 border-red-200",
        },
        transportation: {
          label: "Rejected",
          icon: <FiX className="w-3 h-3" />,
          classes: "bg-red-50 text-red-600 border-red-200",
        },
      },
      cancelled_by_user: {
        tour: {
          label: "Cancelled",
          icon: <FiX className="w-3 h-3" />,
          classes: "bg-gray-50 text-gray-500 border-gray-200",
        },
        activity: {
          label: "Cancelled",
          icon: <FiX className="w-3 h-3" />,
          classes: "bg-gray-50 text-gray-500 border-gray-200",
        },
        hotel: {
          label: "Cancelled",
          icon: <FiX className="w-3 h-3" />,
          classes: "bg-gray-50 text-gray-500 border-gray-200",
        },
        transportation: {
          label: "Cancelled",
          icon: <FiX className="w-3 h-3" />,
          classes: "bg-gray-50 text-gray-500 border-gray-200",
        },
      },
      cancelled: {
        tour: {
          label: "Cancelled",
          icon: <FiX className="w-3 h-3" />,
          classes: "bg-gray-50 text-gray-500 border-gray-200",
        },
        activity: {
          label: "Cancelled",
          icon: <FiX className="w-3 h-3" />,
          classes: "bg-gray-50 text-gray-500 border-gray-200",
        },
        hotel: {
          label: "Cancelled",
          icon: <FiX className="w-3 h-3" />,
          classes: "bg-gray-50 text-gray-500 border-gray-200",
        },
        transportation: {
          label: "Cancelled",
          icon: <FiX className="w-3 h-3" />,
          classes: "bg-gray-50 text-gray-500 border-gray-200",
        },
      },
      upcoming: {
        tour: {
          label: "Upcoming Trip",
          icon: <FiCalendar className="w-3 h-3" />,
          classes: "bg-blue-50 text-blue-600 border-blue-200",
        },
        activity: {
          label: "Scheduled",
          icon: <FiCalendar className="w-3 h-3" />,
          classes: "bg-blue-50 text-blue-600 border-blue-200",
        },
        hotel: {
          label: "Upcoming Stay",
          icon: <FiCalendar className="w-3 h-3" />,
          classes: "bg-blue-50 text-blue-600 border-blue-200",
        },
        transportation: {
          label: "Reserved",
          icon: <IoCarSport className="w-3 h-3" />,
          classes: "bg-blue-50 text-blue-600 border-blue-200",
        },
      },
      in_progress: {
        tour: {
          label: "On Trip",
          icon: <FiPlay className="w-3 h-3" />,
          classes: "bg-emerald-50 text-emerald-600 border-emerald-200",
        },
        activity: {
          label: "Active",
          icon: <FiPlay className="w-3 h-3" />,
          classes: "bg-emerald-50 text-emerald-600 border-emerald-200",
        },
        hotel: {
          label: "Checked In",
          icon: <FiPlay className="w-3 h-3" />,
          classes: "bg-emerald-50 text-emerald-600 border-emerald-200",
        },
        transportation: {
          label: "Active Rental",
          icon: <FiPlay className="w-3 h-3" />,
          classes: "bg-emerald-50 text-emerald-600 border-emerald-200",
        },
      },
      completed: {
        tour: {
          label: "Completed",
          icon: <FiCheck className="w-3 h-3" />,
          classes: "bg-purple-50 text-purple-600 border-purple-200",
        },
        activity: {
          label: "Completed",
          icon: <FiCheck className="w-3 h-3" />,
          classes: "bg-purple-50 text-purple-600 border-purple-200",
        },
        hotel: {
          label: "Checked Out",
          icon: <FiCheck className="w-3 h-3" />,
          classes: "bg-purple-50 text-purple-600 border-purple-200",
        },
        transportation: {
          label: "Returned",
          icon: <FiCheck className="w-3 h-3" />,
          classes: "bg-purple-50 text-purple-600 border-purple-200",
        },
      },
    };
    return (
      statusConfigs[apiStatus]?.[bookingType] || statusConfigs.pending.tour
    );
  };

  // ─── Fetch bookings ────────────────────────────────────────────────────────
  const fetchAllBookings = useCallback(async () => {
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
            { user_id: userId }
          ),
          axios.post(`${baseUrl}/my_account/select_my_hotels_list.php`, {
            user_id: userId,
          }),
        ]);

      let allBookings = [];

      // ── Tours ──────────────────────────────────────────────────────────────
      if (toursRes?.data?.status === "success") {
        const mappedTours = toursRes.data.message.map((item) => {
          const reservation = item.reservation;
          const tour = item.tour_details;
          const routeLocations = tour.route
            ? tour.route.split("-").map((loc) => loc.trim())
            : [];

          const normalizedItinerary = Array.isArray(tour.itinerary)
            ? tour.itinerary.map(normalizeItineraryDay)
            : parseMaybeJsonArray(tour.itinerary).map(normalizeItineraryDay);

          const galleryImages =
            Array.isArray(tour.gallery) && tour.gallery.length > 0
              ? tour.gallery
                  .flatMap((g) => splitCampImages(g?.image))
                  .filter(Boolean)
              : [];

          const fallbackTourImages = splitCampImages(
            tour.image || tour.background_image
          );
          const images =
            galleryImages.length > 0 ? galleryImages : fallbackTourImages;

          const apiStatus = reservation.status || "pending";
          const totalDays = getInclusiveDaysCount(
            reservation.start_date,
            reservation.end_date
          );
          const currentDayNumber = getCurrentRunningDayNumber(
            reservation.start_date,
            reservation.end_date
          );
          const completedDays = getCompletedDaysCount(
            reservation.start_date,
            reservation.end_date,
            apiStatus
          );
          const progress = calculateProgress(
            reservation.start_date,
            reservation.end_date,
            apiStatus
          );
          const statusConfig = getStatusConfig("tour", apiStatus);

          const firstImage =
            getFirstImage(
              reservation.background_image ||
                tour.background_image ||
                tour.image
            ) ||
            reservation.background_image ||
            tour.background_image ||
            tour.image;

          return {
            id: reservation.reservation_id,
            reservation_id: reservation.reservation_id,
            bookingType: "tour",
            tour_id: reservation.tour_id,
            tourId: reservation.tour_id,
            title: tour.title || reservation.tour_title,
            duration:
              tour.duration ||
              `${totalDays} ${totalDays === 1 ? "Day" : "Days"}`,
            totalDays,
            currentDayNumber,
            completedDays,
            status: apiStatus,
            apiStatus,
            statusConfig,
            images,
            image: firstImage,
            backgroundImage: firstImage,
            mainLocations: routeLocations.slice(0, 2),
            additionalLocations: routeLocations,
            price: parseFloat(reservation.total_amount),
            priceCurrency: tour.price_currency || "$",
            numAdults: parseInt(reservation.num_adults),
            numChildren: parseInt(reservation.num_children),
            startDate: reservation.start_date,
            endDate: reservation.end_date,
            progress,
            category: tour.category,
            countryName: tour.country_name,
            itinerary: normalizedItinerary,
            highlights: tour.highlights,
            includes: tour.includes,
            excludes: tour.excludes,
            dayTourGuide: reservation.day_tour_guide,
            max_persons: tour.max_persons,
            day_hotel: reservation.day_hotel,
            day_car: reservation.day_car,
            day_activities: reservation.day_activities,
            day_tour_guide: reservation.day_tour_guide,
            _rawApiItem: {
              ...item,
              reservation: {
                ...reservation,
                background_image: firstImage,
              },
              tour_details: {
                ...tour,
                image:
                  getFirstImage(tour.image || tour.background_image) ||
                  tour.image,
                background_image:
                  getFirstImage(tour.background_image || tour.image) ||
                  tour.background_image,
                gallery: Array.isArray(tour.gallery)
                  ? tour.gallery.map((g) => ({
                      ...g,
                      image: getFirstImage(g?.image) || g?.image,
                    }))
                  : tour.gallery,
                itinerary: normalizedItinerary,
              },
            },
          };
        });
        allBookings = [...allBookings, ...mappedTours];
      }

      // ── Activities ─────────────────────────────────────────────────────────
      if (activitiesRes?.data?.status === "success") {
        const mappedActivities = activitiesRes.data.message.map((item) => {
          const apiStatus = item.status || "pending";
          const totalDays = getInclusiveDaysCount(item.date, item.date);
          const currentDayNumber = getCurrentRunningDayNumber(
            item.date,
            item.date
          );
          const completedDays = getCompletedDaysCount(
            item.date,
            item.date,
            apiStatus
          );
          const progress = calculateProgress(item.date, item.date, apiStatus);
          const statusConfig = getStatusConfig("activity", apiStatus);
          const normalizedItem = normalizeMediaEntity(item);
          const activityImages = splitCampImages(
            item.background_image || item.image
          );

          return {
            id: item.reserving_id,
            bookingType: "activity",
            activity_id: item.activity_id,
            title: item.title,
            duration: "1 Day",
            totalDays,
            currentDayNumber,
            completedDays,
            status: apiStatus,
            apiStatus,
            statusConfig,
            image:
              getFirstImage(item.background_image || item.image) ||
              item.background_image ||
              item.image,
            images: activityImages,
            backgroundImage:
              getFirstImage(item.background_image || item.image) ||
              item.background_image ||
              item.image,
            price: parseFloat(item.total_amount),
            priceCurrency: "$",
            numAdults: parseInt(item.adults_num),
            numChildren: parseInt(item.childs_num),
            startDate: item.date,
            endDate: item.date,
            progress,
            features: item.activity_features,
            ratings: item.activity_ratings,
            countryId: item.country_id,
            _rawApiItem: normalizedItem,
          };
        });
        allBookings = [...allBookings, ...mappedActivities];
      }

      // ── Transportation ─────────────────────────────────────────────────────
      if (transportationRes?.data?.status === "success") {
        const mappedTransportation = transportationRes.data.message.map(
          (item) => {
            const apiStatus = item.status || "pending";
            const totalDays = getInclusiveDaysCount(
              item.start_date,
              item.end_date
            );
            const currentDayNumber = getCurrentRunningDayNumber(
              item.start_date,
              item.end_date
            );
            const completedDays = getCompletedDaysCount(
              item.start_date,
              item.end_date,
              apiStatus
            );
            const progress = calculateProgress(
              item.start_date,
              item.end_date,
              apiStatus
            );
            const statusConfig = getStatusConfig("transportation", apiStatus);
            const transportationImages = splitCampImages(
              item.background_image || item.image
            );
            const normalizedItem = normalizeMediaEntity(item);

            return {
              id: item.reserving_id,
              bookingType: "transportation",
              car_id: item.car_id,
              title: item.title,
              duration: `${totalDays} ${totalDays === 1 ? "Day" : "Days"}`,
              totalDays,
              currentDayNumber,
              completedDays,
              status: apiStatus,
              apiStatus,
              statusConfig,
              image:
                getFirstImage(item.background_image || item.image) ||
                item.background_image ||
                item.image,
              images: transportationImages,
              backgroundImage:
                getFirstImage(item.background_image || item.image) ||
                item.background_image ||
                item.image,
              price: parseFloat(item.total_amount),
              priceCurrency: "$",
              type: item.type,
              driverId: item.driver_id,
              startDate: item.start_date,
              endDate: item.end_date,
              progress,
              features: item.car_features,
              ratings: item.car_ratings,
              countryId: item.country_id,
              _rawApiItem: normalizedItem,
            };
          }
        );
        allBookings = [...allBookings, ...mappedTransportation];
      }

      // ── Hotels ─────────────────────────────────────────────────────────────
      if (hotelsRes?.data?.status === "success") {
        const mappedHotels = hotelsRes.data.message.map((item) => {
          const apiStatus = item.status || "pending";
          const totalDays = getInclusiveDaysCount(
            item.start_date,
            item.end_date
          );
          const currentDayNumber = getCurrentRunningDayNumber(
            item.start_date,
            item.end_date
          );
          const completedDays = getCompletedDaysCount(
            item.start_date,
            item.end_date,
            apiStatus
          );
          const progress = calculateProgress(
            item.start_date,
            item.end_date,
            apiStatus
          );
          const statusConfig = getStatusConfig("hotel", apiStatus);
          const additionalServices = item.aditional_services
            ? item.aditional_services.split("**").filter(Boolean)
            : [];
          const nights = Math.max(totalDays - 1, 1);
          const parsedRooms = [
            ...(Array.isArray(item.rooms) ? item.rooms : []),
            ...(Array.isArray(item.hotel_reserved?.rooms)
              ? item.hotel_reserved.rooms
              : []),
            ...(parseMaybeJsonArray(item.rooms_json) || []),
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
          const hotelImages = splitCampImages(
            item.background_image || item.image
          );
          const normalizedItem = normalizeMediaEntity(item);

          return {
            id: item.reserving_id,
            bookingType: "hotel",
            hotel_id: item.hotel_id,
            title: item.title,
            subtitle: item.subtitle,
            description: item.description,
            duration:
              item.duration || `${nights} ${nights === 1 ? "Night" : "Nights"}`,
            totalDays,
            currentDayNumber,
            completedDays,
            status: apiStatus,
            apiStatus,
            statusConfig,
            image:
              getFirstImage(item.background_image || item.image) ||
              item.background_image ||
              item.image,
            images: hotelImages,
            backgroundImage:
              getFirstImage(item.background_image || item.image) ||
              item.background_image ||
              item.image,
            mainLocations: item.location ? [item.location] : [],
            price: parseFloat(item.total_amount),
            priceCurrency: item.price_currency || "$",
            pricePerNight: parseFloat(item.price_current),
            originalPrice: parseFloat(item.price_original),
            numAdults: parseInt(item.adults_num),
            numChildren: 0,
            startDate: item.start_date,
            endDate: item.end_date,
            progress,
            category: item.category,
            location: item.location,
            countryId: item.country_id,
            amenities: item.hotel_amenities || [],
            ratings: item.hotel_ratings || [],
            additionalServices,
            priceNote: item.price_note,
            rooms: uniqueRooms,
            _rawApiItem: {
              ...normalizedItem,
              hotel_reserved: item.hotel_reserved
                ? {
                    ...normalizeMediaEntity(item.hotel_reserved),
                    rooms: Array.isArray(item.hotel_reserved?.rooms)
                      ? item.hotel_reserved.rooms
                      : [],
                  }
                : item.hotel_reserved,
            },
          };
        });
        allBookings = [...allBookings, ...mappedHotels];
      }

      allBookings.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      setBookings(allBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load your bookings. Please try again.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchAllBookings();
  }, [userId, fetchAllBookings]);

  const tabs = [
    {
      id: "all",
      label: "All",
      fullLabel: "All Bookings",
      icon: <IoGridOutline className="w-4 h-4" />,
      color: "#295557",
    },
    {
      id: "schedule",
      label: "Schedule",
      fullLabel: "My Schedule",
      icon: <FiCalendar className="w-4 h-4" />,
      color: "#295557",
    },
    {
      id: "tour",
      label: "Tours",
      fullLabel: "Tours",
      icon: <MdTour className="w-4 h-4" />,
      color: "#295557",
    },
    {
      id: "hotel",
      label: "Hotels",
      fullLabel: "Hotels",
      icon: <MdHotel className="w-4 h-4" />,
      color: "#295557",
    },
    {
      id: "activity",
      label: "Activities",
      fullLabel: "Activities",
      icon: <MdLocalActivity className="w-4 h-4" />,
      color: "#295557",
    },
    {
      id: "transportation",
      label: "Cars",
      fullLabel: "Transportation",
      icon: <IoCarSport className="w-4 h-4" />,
      color: "#295557",
    },
  ];

  const getStatusFilters = () => [
    {
      value: "all",
      label: "All",
      fullLabel: "All Status",
      icon: <FiFilter className="w-3.5 h-3.5" />,
    },
    {
      value: "pending",
      label: "Pending",
      fullLabel: "Pending",
      icon: <FiClock className="w-3.5 h-3.5" />,
    },
    {
      value: "rejected",
      label: "Rejected",
      fullLabel: "Rejected",
      icon: <FiX className="w-3.5 h-3.5" />,
    },
    {
      value: "cancelled_by_user",
      label: "Cancelled",
      fullLabel: "Cancelled",
      icon: <FiX className="w-3.5 h-3.5" />,
    },
    {
      value: "upcoming",
      label: "Upcoming",
      fullLabel: "Upcoming",
      icon: <FiCalendar className="w-3.5 h-3.5" />,
    },
    {
      value: "in_progress",
      label: "Active",
      fullLabel: "In Progress",
      icon: <FiPlay className="w-3.5 h-3.5" />,
    },
    {
      value: "completed",
      label: "Done",
      fullLabel: "Completed",
      icon: <FiCheck className="w-3.5 h-3.5" />,
    },
  ];

  const getTabCount = (tabId) => {
    if (tabId === "all") return bookings.length;
    return bookings.filter((b) => b.bookingType === tabId).length;
  };

  const getStatusCount = (statusValue) => {
    let filtered = bookings;
    if (activeTab !== "all")
      filtered = filtered.filter((b) => b.bookingType === activeTab);
    if (statusValue === "all") return filtered.length;
    return filtered.filter((b) => b.status === statusValue).length;
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const tabMatch = activeTab === "all" || booking.bookingType === activeTab;
      const statusMatch =
        statusFilter === "all" || booking.status === statusFilter;
      return tabMatch && statusMatch;
    });
  }, [bookings, activeTab, statusFilter]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
    setStatusFilter("all");
    updateURLParams({ tab: tabId, page: 1, status: "all" });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      updateURLParams({ page });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    setShowMobileFilters(false);
    updateURLParams({ page: 1, status });
  };

  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const getEmptyStateMessage = () => {
    const messages = {
      all: {
        title: "No bookings found",
        description: "You haven't made any bookings yet.",
        icon: <FiCalendar className="w-16 h-16 text-gray-300" />,
      },
      tour: {
        title: "No tours booked",
        description:
          "Start exploring amazing destinations with our tour packages.",
        icon: <MdTour className="w-16 h-16 text-gray-300" />,
      },
      hotel: {
        title: "No hotels booked",
        description: "Find and book your perfect accommodation.",
        icon: <MdHotel className="w-16 h-16 text-gray-300" />,
      },
      activity: {
        title: "No activities booked",
        description: "Discover exciting activities and experiences.",
        icon: <MdLocalActivity className="w-16 h-16 text-gray-300" />,
      },
      transportation: {
        title: "No transportation booked",
        description: "Book a car or transportation for your travels.",
        icon: <IoCarSport className="w-16 h-16 text-gray-300" />,
      },
    };
    return messages[activeTab] || messages.all;
  };

  const statusFilters = getStatusFilters();
  const emptyState = getEmptyStateMessage();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <FiLoader className="w-10 h-10 text-[#295557] animate-spin mb-4" />
        <p className="text-gray-600 text-center">Loading your bookings...</p>
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <FiAlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h4 className="text-lg font-semibold text-gray-800 mb-2">
          Oops! Something went wrong
        </h4>
        <p className="text-gray-500 text-center mb-4">{error}</p>
        <button
          onClick={fetchAllBookings}
          className="inline-flex items-center gap-2 bg-[#295557] hover:bg-[#1e3d3f] text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 lg:px-0">
      <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-1 sm:gap-2 min-w-max sm:min-w-0">
          {tabs.map((tab) => {
            const count = getTabCount(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all duration-300 whitespace-nowrap ${isActive ? "bg-[#295557] text-white shadow-lg" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <span className="hidden sm:inline-flex">{tab.icon}</span>
                <span className="sm:hidden">{tab.label}</span>
                <span className="hidden sm:inline">{tab.fullLabel}</span>
                <span
                  className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? "bg-white/20 text-white" : "bg-[#295557]/10 text-[#295557]"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 flex-wrap mb-4">
        <span className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
          <FiFilter className="w-4 h-4" />
          Filter:
        </span>
        {statusFilters.map((filter) => {
          const count = getStatusCount(filter.value);
          const isActive = statusFilter === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => handleStatusFilterChange(filter.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${isActive ? "bg-[#295557] border-[#295557] text-white" : "bg-white border-gray-200 text-gray-600 hover:border-[#295557] hover:text-[#295557]"}`}
            >
              {filter.icon}
              {filter.fullLabel}
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${isActive ? "bg-white/20" : "bg-gray-100"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700"
        >
          <span className="flex items-center gap-2">
            <FiFilter className="w-4 h-4" />
            Filter:{" "}
            {statusFilters.find((f) => f.value === statusFilter)?.fullLabel}
          </span>
          <FiChevronRight
            className={`w-4 h-4 transition-transform ${showMobileFilters ? "rotate-90" : ""}`}
          />
        </button>

        {showMobileFilters && (
          <div className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
            {statusFilters.map((filter) => {
              const count = getStatusCount(filter.value);
              const isActive = statusFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  onClick={() => handleStatusFilterChange(filter.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm border-b border-gray-100 last:border-b-0 transition-colors ${isActive ? "bg-[#295557]/5 text-[#295557] font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <span className="flex items-center gap-2">
                    {filter.icon}
                    {filter.fullLabel}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? "bg-[#295557] text-white" : "bg-gray-100"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {filteredBookings.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-700">
              {startIndex + 1}-{Math.min(endIndex, filteredBookings.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-700">
              {filteredBookings.length}
            </span>{" "}
            bookings
            {totalPages > 1 && (
              <span className="hidden sm:inline ml-1">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </p>
        </div>
      )}

      {paginatedBookings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {paginatedBookings.map((booking) => (
            <div key={`${booking.bookingType}-${booking.id}`}>
              <BookingCard data={booking} refetchTours={fetchAllBookings} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          {emptyState.icon}
          <h4 className="mt-4 text-lg font-semibold text-gray-800">
            {emptyState.title}
          </h4>
          <p className="mt-2 text-gray-500 text-center max-w-md">
            {statusFilter !== "all"
              ? `No ${statusFilters.find((f) => f.value === statusFilter)?.fullLabel} bookings found.`
              : emptyState.description}
          </p>
          {statusFilter !== "all" && (
            <button
              onClick={() => handleStatusFilterChange("all")}
              className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-[#295557] hover:text-[#295557] transition-colors"
            >
              View All{" "}
              {activeTab !== "all"
                ? tabs.find((t) => t.id === activeTab)?.fullLabel
                : "Bookings"}
            </button>
          )}
        </div>
      )}

      {totalPages > 1 && paginatedBookings.length > 0 && (
        <div className="mt-6 sm:mt-8 flex justify-center">
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 sm:p-2.5 rounded-lg border transition-colors ${currentPage === 1 ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-200 text-gray-600 hover:border-[#295557] hover:text-[#295557]"}`}
            >
              <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex items-center gap-1">
              {getPaginationNumbers().map((page, index) =>
                page === "..." ? (
                  <span
                    key={index}
                    className="px-2 sm:px-3 py-1 text-gray-400 text-sm"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={index}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-sm font-medium transition-colors ${page === currentPage ? "bg-[#295557] text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 sm:p-2.5 rounded-lg border transition-colors ${currentPage === totalPages ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-200 text-gray-600 hover:border-[#295557] hover:text-[#295557]"}`}
            >
              <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Account;
