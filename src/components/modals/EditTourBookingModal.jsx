"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Modal, Button, DatePicker, InputNumber, Spin } from "antd";
import {
  FiClock,
  FiMapPin,
  FiUser,
  FiUsers,
  FiX,
  FiCheck,
  FiChevronDown,
  FiAlertCircle,
} from "react-icons/fi";
import { FaBed, FaUserTie, FaHiking } from "react-icons/fa";
import { MdEmojiTransportation } from "react-icons/md";
import dayjs from "dayjs";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeTourGuide,
  selectHotel,
  selectCar,
  toggleTourGuide,
  selectActivity,
} from "@/lib/redux/slices/tourReservationSlice";
import { base_url } from "@/uitils/base_url";
import AccommodationCard from "../../app/package/package-details/[packageId]/_components/AccommodationCard";
import TransferCard from "../../app/package/package-details/[packageId]/_components/TransferCard";
import ActivityCard from "../../app/package/package-details/[packageId]/_components/ActivityCard";
import "./modals.css";
import toast from "react-hot-toast";

// ─── Mapping Helpers ───
const mapHotelFromAPI = (hotel) => ({
  id: parseInt(hotel.hotel_id || hotel.id),
  tour_hotel_id: hotel.tour_hotel_id,
  hotel_id: String(hotel.hotel_id || hotel.id),
  image: hotel.image?.split("//CAMP//")[0],
  name: { en: hotel.title, ar: hotel.title },
  title: hotel.title,
  category: { en: "Hotel", ar: "فندق" },
  check_in_out: "15:00 / 11:00",
  location: { en: "City center", ar: "مركز المدينة" },
  parking: { en: "Available", ar: "متوفر" },
  price_per_night: parseFloat(hotel.adult_price || 0),
  adult_price: parseFloat(hotel.adult_price || 0),
  child_price: parseFloat(hotel.child_price || 0),
  rating: 4.5,
  reviews: 100,
  amenities: hotel.amenities || [],
  rooms: hotel.rooms || [],
});

const mapCarFromAPI = (car) => ({
  id: parseInt(car.car_id || car.id),
  tour_car_id: car.tour_car_id,
  car_id: String(car.car_id || car.id),
  image: car.image?.split("//CAMP//")[0],
  name: { en: car.title, ar: car.title },
  title: car.title,
  category: { en: "Car", ar: "سيارة" },
  price: parseFloat(car.price_current || 0),
  price_current: parseFloat(car.price_current || 0),
  capacity: car.capacity || 4,
  features: car.features || [],
});

const mapActivityFromAPI = (act) => ({
  id: parseInt(act.activity_id || act.id),
  tour_activity_id: act.tour_activity_id,
  activity_id: String(act.activity_id || act.id),
  title: { en: act.title, ar: act.title },
  name: act.title,
  image: act.image?.split("//CAMP//")[0],
  price: parseFloat(act.price_current || 0),
  price_current: parseFloat(act.price_current || 0),
  features: act.features || [],
});

// ─── Summary Pill ───
const SummaryPill = ({ icon, label, isSelected }) => (
  <span
    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full transition-all ${
      isSelected ? "bg-white/25 text-white" : "bg-white/10 text-white/50"
    }`}
  >
    {icon} {label}
    {isSelected && <FiCheck size={9} />}
  </span>
);

// ════════════════════════════════════════════════════════
// DAY ITINERARY CARD
// ════════════════════════════════════════════════════════
const DayItineraryCard = ({
  dayData,
  index,
  activeAccommodations,
  activeTransfers,
  selectedTours,
  setSelectedTours,
  handleAccommodationClick,
  handleTransferClick,
  people,
  calculatePriceDifference,
}) => {
  const [openSections, setOpenSections] = useState(new Set());
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [localRooms, setLocalRooms] = useState([
    { id: 1, adults: 1, children: 0, infants: 0 },
  ]);

  const dispatch = useDispatch();
  const dayNumber = index + 1;

  const selectedHotel = activeAccommodations?.[index];
  const selectedTransfer = activeTransfers?.[index];

  const tourGuideData = useSelector(
    (state) => state.tourReservation.tourGuideByDay?.[dayNumber]
  );
  const selectedByDay = useSelector(
    (state) => state.tourReservation?.selectedByDay
  );

  const dayKey = String(dayNumber);
  // ✅ deduplicate activities بالـ id
  const selectedActivitiesRaw = selectedByDay?.[dayKey]?.activities || [];
  const selectedActivities = selectedActivitiesRaw.filter(
    (act, idx, arr) =>
      arr.findIndex((a) => String(a.id) === String(act.id)) === idx
  );

  const isGuideAvailable = tourGuideData?.isAvailable || false;
  const isGuideSelected = tourGuideData?.isSelected || false;

  const toggle = (key) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const dayTotal = useMemo(() => {
    const h = parseFloat(
      selectedHotel?.price_per_night || selectedHotel?.adult_price || 0
    );
    const t = parseFloat(
      selectedTransfer?.price || selectedTransfer?.price_current || 0
    );
    const a = selectedActivities.reduce(
      (sum, act) => sum + parseFloat(act.price_current || act.price || 0),
      0
    );
    return h + t + a;
  }, [selectedHotel, selectedTransfer, selectedActivities]);

  const handleFlip = (cardIndex) => {
    const hotel = activeAccommodations?.[cardIndex];
    if (hotel) {
      setSelectedAccommodation(hotel);
      setIsFlipped(true);
    }
  };

  const handleRoomChange = (action, roomId, type) => {
    setLocalRooms((prev) =>
      prev.map((room) => {
        if (room.id !== roomId) return room;
        if (action === "increase") {
          const currentTotal = prev.reduce((sum, r) => sum + r[type], 0);
          const maxAllowed =
            type === "adults"
              ? people.adults
              : type === "children"
                ? people.children
                : people.infants || 0;
          if (currentTotal >= maxAllowed) {
            toast.error(
              `All ${type} are already assigned (${maxAllowed} total)`
            );
            return room;
          }
          return { ...room, [type]: room[type] + 1 };
        } else if (action === "decrease") {
          const minVal = type === "adults" ? 1 : 0;
          if (room[type] <= minVal) return room;
          return { ...room, [type]: room[type] - 1 };
        }
        return room;
      })
    );
  };

  const addRoom = () => {
    if (localRooms.length >= 5) {
      toast.error("Maximum 5 rooms allowed");
      return;
    }
    const assignedAdults = localRooms.reduce((sum, r) => sum + r.adults, 0);
    if (people.adults - assignedAdults <= 0) {
      toast.error("No remaining adults to assign");
      return;
    }
    setLocalRooms((prev) => [
      ...prev,
      {
        id: Math.max(...prev.map((r) => r.id)) + 1,
        adults: 1,
        children: 0,
        infants: 0,
      },
    ]);
  };

  const confirmRoomSelection = () => {
    const assignedAdults = localRooms.reduce((sum, r) => sum + r.adults, 0);
    if (assignedAdults !== people.adults) {
      toast.error(`${people.adults - assignedAdults} adult(s) not assigned`);
    }
    setIsFlipped(false);
    setSelectedAccommodation(null);
  };

  const removeRoom = (roomId) => {
    if (localRooms.length > 1)
      setLocalRooms((prev) => prev.filter((r) => r.id !== roomId));
  };

  const cancelRoomSelection = () => {
    setIsFlipped(false);
    setSelectedAccommodation(null);
    setLocalRooms([{ id: 1, adults: 1, children: 0, infants: 0 }]);
  };

  const sections = [
    {
      key: "accommodation",
      label: "Accommodation",
      count: dayData.accommodation?.length || 0,
      selectedName: selectedHotel?.name?.en || selectedHotel?.title || null,
      price: selectedHotel?.price_per_night || selectedHotel?.adult_price,
    },
    {
      key: "transfer",
      label: "Transfer",
      count: dayData.transfers?.length || 0,
      selectedName:
        selectedTransfer?.name?.en || selectedTransfer?.title || null,
      price: selectedTransfer?.price || selectedTransfer?.price_current,
    },
    ...(dayData.activities?.length > 0
      ? [
          {
            key: "activities",
            label: "Activities",
            count: dayData.activities.length,
            selectedName: `${selectedActivities.length} of ${dayData.activities.length} added`,
            price:
              selectedActivities.reduce(
                (sum, a) => sum + parseFloat(a.price_current || a.price || 0),
                0
              ) || null,
          },
        ]
      : []),
  ];

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-[#295557] via-[#2f6163] to-[#3a7274] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white text-[#295557] font-bold text-xs w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
              {dayNumber}
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                {dayData.title || `Day ${dayNumber}`}
              </p>
              {dayData.description?.en && (
                <p
                  className="text-white/60 text-[11px] mt-0.5 line-clamp-1 max-w-[300px] !mb-0"
                  dangerouslySetInnerHTML={{ __html: dayData.description.en }}
                />
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {isGuideAvailable && (
              <SummaryPill
                icon={<FaUserTie size={9} />}
                label="Guide"
                isSelected={isGuideSelected}
              />
            )}
            <SummaryPill
              icon={<FaBed size={9} />}
              label="Hotel"
              isSelected={!!selectedHotel}
            />
            <SummaryPill
              icon={<MdEmojiTransportation size={9} />}
              label="Car"
              isSelected={!!selectedTransfer}
            />
            {dayData.activities?.length > 0 && (
              <SummaryPill
                icon={<FaHiking size={9} />}
                label={`${selectedActivities.length} Acts`}
                isSelected={selectedActivities.length > 0}
              />
            )}
            {dayTotal > 0 && (
              <span className="text-[11px] text-white/90 bg-white/15 px-2 py-0.5 rounded-full font-medium ml-1">
                ${dayTotal.toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tour Guide */}
      {isGuideAvailable && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-[#295557]/5 to-transparent border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-700">Tour Guide</p>
              <p className="text-[10px] text-gray-400">
                Professional local guide
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isGuideSelected}
                onChange={() => dispatch(toggleTourGuide(dayNumber))}
              />
              <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#295557] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 shadow-inner" />
            </label>
          </div>
        </div>
      )}

      {/* ✅ Selected Activities Preview */}
      {selectedActivities.length > 0 && (
        <div className="px-4 py-2.5 bg-green-50/50 border-b border-gray-100">
          <p className="text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
            Included Activities ({selectedActivities.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selectedActivities.map((act, i) => (
              <span
                key={`${act.id}-${i}`}
                className="inline-flex items-center gap-1 text-[11px] bg-[#295557]/10 text-[#295557] px-2 py-0.5 rounded-full font-medium"
              >
                <FaHiking size={9} />
                {act.title?.en || act.title?.ar || act.name || "Activity"}
                {parseFloat(act.price_current || act.price || 0) > 0 && (
                  <span className="text-[#295557]/60">
                    · ${parseFloat(act.price_current || act.price).toFixed(0)}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="divide-y divide-gray-50">
        {sections.map((section) => {
          const isOpen = openSections.has(section.key);
          return (
            <div key={section.key}>
              <button
                onClick={() => toggle(section.key)}
                className={`w-full flex items-center justify-between px-4 py-2.5 transition-all duration-200 ${
                  isOpen ? "bg-gray-50" : "hover:bg-gray-50/50"
                }`}
              >
                <div className="text-left">
                  <p className="text-[13px] font-semibold text-gray-800">
                    {section.label}
                  </p>
                  <p
                    className={`text-[11px] ${section.selectedName ? "text-[#295557] font-medium" : "text-gray-400"}`}
                  >
                    {section.selectedName || "Not selected"}
                    {section.price != null && section.price > 0 && (
                      <span className="text-gray-400 ml-1">
                        · ${parseFloat(section.price).toFixed(0)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {section.count > 1 && (
                    <span className="text-[10px] bg-[#295557]/10 text-[#295557] px-2 py-0.5 rounded-full font-medium">
                      {section.count} options
                    </span>
                  )}
                  <FiChevronDown
                    size={14}
                    className={`text-gray-300 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#295557]" : ""}`}
                  />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="px-4 pb-4 pt-2">
                  {section.key === "accommodation" && (
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar cards-container-parent">
                      {dayData.accommodation?.length > 0 ? (
                        dayData.accommodation.map((item) => (
                          <div
                            key={item.tour_hotel_id || item.hotel_id}
                            className="flex-shrink-0"
                            style={{ minWidth: "280px", height: "420px" }}
                          >
                            <AccommodationCard
                              item={item}
                              index={index}
                              activeAccommodations={activeAccommodations}
                              isFlipped={isFlipped}
                              selectedAccommodation={selectedAccommodation}
                              selectedTours={selectedTours}
                              setSelectedTours={setSelectedTours}
                              handleAccommodationClick={
                                handleAccommodationClick
                              }
                              handleFlip={handleFlip}
                              setMapModal={() => {}}
                              people={people}
                              calculatePriceDifference={
                                calculatePriceDifference
                              }
                              rooms={localRooms}
                              handleRoomChange={handleRoomChange}
                              addRoom={addRoom}
                              removeRoom={removeRoom}
                              confirmRoomSelection={confirmRoomSelection}
                              cancelRoomSelection={cancelRoomSelection}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="w-full text-center py-6 text-gray-300 text-sm">
                          No accommodation options
                        </div>
                      )}
                    </div>
                  )}

                  {section.key === "transfer" && (
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar cards-container-parent">
                      {dayData.transfers?.length > 0 ? (
                        dayData.transfers.map((item) => (
                          <div
                            key={item.tour_car_id || item.car_id}
                            className="flex-shrink-0"
                            style={{ minWidth: "280px", height: "420px" }}
                          >
                            <TransferCard
                              item={item}
                              index={index}
                              activeTransfers={activeTransfers}
                              selectedTours={selectedTours}
                              setSelectedTours={setSelectedTours}
                              handleTransferClick={handleTransferClick}
                              calculatePriceDifference={
                                calculatePriceDifference
                              }
                            />
                          </div>
                        ))
                      ) : (
                        <div className="w-full text-center py-6 text-gray-300 text-sm">
                          No transfer options
                        </div>
                      )}
                    </div>
                  )}

                  {section.key === "activities" && (
                    <div>
                      <p className="text-[11px] text-gray-400 mb-2">
                        Click <strong>Add</strong> to include more activities
                      </p>
                      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar cards-container-parent">
                        {dayData.activities.map((item) => (
                          <div
                            key={item.tour_activity_id || item.activity_id}
                            className="flex-shrink-0"
                            style={{ minWidth: "280px", height: "420px" }}
                          >
                            <ActivityCard item={item} dayIndex={index} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// MAIN MODAL
// ════════════════════════════════════════════════════════
const EditTourBookingModal = ({ open, onClose, data, tourId: propTourId }) => {
  const dispatch = useDispatch();

  const tourGuideByDay = useSelector(
    (state) => state.tourReservation.tourGuideByDay || {}
  );
  const selectedByDay = useSelector(
    (state) => state.tourReservation?.selectedByDay || {}
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [tourDetails, setTourDetails] = useState(null);
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeAccommodations, setActiveAccommodations] = useState({});
  const [activeTransfers, setActiveTransfers] = useState({});
  const [selectedTours, setSelectedTours] = useState({
    title: "",
    hotels: [],
    transfers: [],
    activities: [],
  });

  // ══════════════════════════════════════════
  // Fetch tour_details from API
  // ══════════════════════════════════════════
  const fetchTourDetails = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `${base_url}/user/tours/tour_details.php`,
        { id: id.toString() },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.status === "success" && response.data.message?.[0]) {
        const tour = response.data.message[0];
        setTourDetails(tour);
        return tour;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch tour details"
        );
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to load tour options";
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const parseReservedFromString = useCallback((str) => {
    if (!str) return {};
    const result = {};
    const entries = str.split("**day**");
    entries.forEach((entry) => {
      const parts = entry.split("**");
      if (parts.length >= 2) {
        const id = parts[0];
        const dayNum = parts[1];
        result[dayNum] = id;
      }
    });
    return result;
  }, []);

  const parseActivitiesFromString = useCallback((str) => {
    if (!str) return {};
    const result = {};
    const entries = str.split("**day**");
    entries.forEach((entry) => {
      const parts = entry.split("**");
      if (parts.length >= 2) {
        const actId = parts[0];
        const dayNum = parts[1];
        if (!result[dayNum]) result[dayNum] = new Set();
        result[dayNum].add(actId);
      }
    });
    // Convert Sets to Arrays
    const final = {};
    Object.entries(result).forEach(([day, set]) => {
      final[day] = [...set];
    });
    return final;
  }, []);

  const parseTourGuideFromString = useCallback((str) => {
    if (!str) return {};
    const result = {};
    const entries = str.split("**day**");
    entries.forEach((entry) => {
      const parts = entry.split("**");
      if (parts.length >= 2) {
        const isSelected = parts[0];
        const dayNum = parts[1];
        result[dayNum] = isSelected === "1";
      }
    });
    return result;
  }, []);

  const matchSelectionsWithOptions = useCallback(
    (fullTourData, reservationData) => {
      if (!fullTourData?.itinerary) return;

      // ── Form values ──
      setAdults(parseInt(reservationData.num_adults || 1));
      setChildrenCount(parseInt(reservationData.num_children || 0));
      setStartDate(
        reservationData.start_date ? dayjs(reservationData.start_date) : null
      );
      setEndDate(
        reservationData.end_date ? dayjs(reservationData.end_date) : null
      );

      // ── Parse all reservation strings ──
      const reservedHotels = parseReservedFromString(reservationData.day_hotel);
      const reservedCars = parseReservedFromString(reservationData.day_car);
      const reservedActivities = parseActivitiesFromString(
        reservationData.day_activities
      );
      const reservedGuides = parseTourGuideFromString(
        reservationData.day_tour_guide
      );

      console.log("🏨 Reserved Hotels:", reservedHotels);
      console.log("🚗 Reserved Cars:", reservedCars);
      console.log("🎯 Reserved Activities:", reservedActivities);
      console.log("🧑‍🏫 Reserved Guides:", reservedGuides);

      // ── Tour Guide ──
      const guideData = fullTourData.itinerary.map((day) => {
        const dayNum = String(day.day);
        const isAvailableFromAPI =
          day.isTourguide === "1" || day.isTourguide === 1;
        // لو الـ API بيقول مش available بس الـ reservation فيها قيمة - خليه available
        const hasReservedGuide = reservedGuides.hasOwnProperty(dayNum);

        return {
          day: day.day,
          isTourguide: isAvailableFromAPI || hasReservedGuide ? "1" : "0",
          // ✅ لو فيه reserved guide value, استخدمها
          _forceSelected: hasReservedGuide ? reservedGuides[dayNum] : undefined,
        };
      });
      dispatch(initializeTourGuide(guideData));

      // ✅ بعد initializeTourGuide - لو فيه reserved guide values مختلفة
      // هنا ممكن نحتاج toggle
      guideData.forEach((gd) => {
        if (gd._forceSelected !== undefined) {
          const dayNum = String(gd.day);
          const currentState = tourGuideByDay[dayNum];
          // لو الـ default selected مختلف عن الـ reserved
          // هنعمل toggle
          // بس ده صعب مع Redux - فالأسهل نعدل initializeTourGuide
        }
      });

      const initAcc = {};
      const initTra = {};
      const initHotels = [];
      const initTransfers = [];

      fullTourData.itinerary.forEach((fullDay, index) => {
        const dayNumber = String(fullDay.day);
        const dayIndex = index;

        // ═══════════════════════════════
        // ✅ HOTEL MATCHING
        // reservedHotels = { "1": "22", "2": "5" }
        // tour_details hotel_options:
        //   Day 1: hotel_id "3" (tour_hotel_id "488"), hotel_id "22" (tour_hotel_id "489")
        //   Day 2: hotel_id "22" (tour_hotel_id "490"), hotel_id "5" (tour_hotel_id "491"), ...
        // ═══════════════════════════════
        const reservedHotelId = reservedHotels[dayNumber];
        const hotelOptions = fullDay.hotel_options || [];

        if (hotelOptions.length > 0) {
          let hotelToSelect = null;

          if (reservedHotelId) {
            hotelToSelect = hotelOptions.find(
              (h) => String(h.hotel_id) === String(reservedHotelId)
            );
            console.log(
              `Day ${dayNumber}: hotel_id=${reservedHotelId} → ${hotelToSelect?.title || "NOT FOUND"}`
            );
          }

          if (!hotelToSelect) {
            hotelToSelect = hotelOptions[0];
            console.log(`Day ${dayNumber}: fallback → ${hotelToSelect.title}`);
          }

          const mapped = mapHotelFromAPI(hotelToSelect);
          initAcc[dayIndex] = mapped;
          initHotels.push({
            day: parseInt(dayNumber),
            name: mapped.name,
            id: mapped.id,
            price: mapped.price_per_night,
          });
          dispatch(selectHotel({ day: parseInt(dayNumber), hotel: mapped }));
        }

        // ═══════════════════════════════
        // ✅ CAR MATCHING
        // reservedCars = { "1": "4", "2": "1" }
        // ═══════════════════════════════
        const reservedCarId = reservedCars[dayNumber];
        const carOptions = fullDay.cars_options || [];

        if (carOptions.length > 0) {
          let carToSelect = null;

          if (reservedCarId) {
            carToSelect = carOptions.find(
              (c) => String(c.car_id) === String(reservedCarId)
            );
            console.log(
              `Day ${dayNumber}: car_id=${reservedCarId} → ${carToSelect?.title || "NOT FOUND"}`
            );
          }

          if (!carToSelect) {
            carToSelect = carOptions[0];
            console.log(
              `Day ${dayNumber}: car fallback → ${carToSelect.title}`
            );
          }

          const mapped = mapCarFromAPI(carToSelect);
          initTra[dayIndex] = mapped;
          initTransfers.push({
            day: parseInt(dayNumber),
            name: mapped.name,
            id: mapped.id,
            price: mapped.price,
          });
          dispatch(selectCar({ day: parseInt(dayNumber), car: mapped }));
        }

        // ═══════════════════════════════
        // ✅ ACTIVITIES MATCHING
        // reservedActivities = { "1": ["5","4","2"], "2": ["5","4"] }
        // activities_options Day 1: activity_id "5", "4"
        // activities_options Day 2: activity_id "5", "4"
        // ═══════════════════════════════
        const reservedActIds = reservedActivities[dayNumber] || [];
        const activityOptions = fullDay.activities_options || [];

        if (activityOptions.length > 0) {
          let actsToSelect;

          if (reservedActIds.length > 0) {
            // ✅ بس الـ activities اللي هي reserved AND موجودة في options
            actsToSelect = activityOptions.filter((act) =>
              reservedActIds.includes(String(act.activity_id))
            );
            console.log(
              `Day ${dayNumber}: Reserved acts [${reservedActIds}] → matched ${actsToSelect.length} of ${activityOptions.length}`
            );
          } else {
            // لو مفيش reserved - خد كلهم by default
            actsToSelect = [...activityOptions];
          }

          // ✅ Deduplicate by activity_id
          const seen = new Set();
          actsToSelect.forEach((act) => {
            const actId = String(act.activity_id);
            if (seen.has(actId)) return;
            seen.add(actId);

            dispatch(
              selectActivity({
                day: parseInt(dayNumber),
                activity: {
                  id: parseInt(act.activity_id),
                  tour_activity_id: act.tour_activity_id,
                  activity_id: String(act.activity_id),
                  title: { en: act.title, ar: act.title },
                  name: act.title,
                  image: act.image?.split("//CAMP//")[0],
                  price: parseFloat(act.price_current || 0),
                  price_current: parseFloat(act.price_current || 0),
                  features: act.features || [],
                },
              })
            );
          });
        }
      });

      setActiveAccommodations(initAcc);
      setActiveTransfers(initTra);
      setSelectedTours({
        title: fullTourData.title,
        hotels: initHotels,
        transfers: initTransfers,
        activities: [],
      });

      console.log("✅ Final activeAccommodations:", initAcc);
      console.log("✅ Final activeTransfers:", initTra);
    },
    [
      dispatch,
      parseReservedFromString,
      parseActivitiesFromString,
      parseTourGuideFromString,
    ]
  );

  useEffect(() => {
    if (open && data) {
      // ✅ Reset Redux state أول حاجة عشان منتجمعش مع القديم
      // بنأخد الـ tour_id من data
      const id = propTourId || data.tour_id || data.tourId || data.id;
      console.log("🔍 Tour ID:", id);
      console.log("🔍 Data:", data);

      if (id) {
        fetchTourDetails(id).then((fullTour) => {
          if (fullTour) {
            // ✅ بنبعت الـ reservation data كامل
            const reservationData = {
              num_adults: data.numAdults || data.num_adults,
              num_children: data.numChildren || data.num_children,
              start_date: data.startDate || data.start_date,
              end_date: data.endDate || data.end_date,
              day_hotel: data.day_hotel || "", // ✅ "22**1**day**5**2"
              day_car: data.day_car || "", // ✅ "4**1**day**1**2"
              day_activities: data.day_activities || "", // ✅
              day_tour_guide: data.day_tour_guide || data.dayTourGuide || "",
            };

            console.log("📋 day_hotel:", reservationData.day_hotel);
            console.log("📋 day_car:", reservationData.day_car);
            console.log("📋 day_activities:", reservationData.day_activities);

            matchSelectionsWithOptions(fullTour, reservationData);
          }
        });
      } else {
        setError("No tour ID found.");
      }
    }
  }, [open, data, propTourId, fetchTourDetails, matchSelectionsWithOptions]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTourDetails(null);
      setError(null);
      setLoading(false);
      setSaving(false);
      setActiveAccommodations({});
      setActiveTransfers({});
      setSelectedTours({
        title: "",
        hotels: [],
        transfers: [],
        activities: [],
      });
    }
  }, [open]);

  // ── Handlers ──
  const handleAccommodationClick = (accommodation, dayIndex) => {
    if (activeAccommodations[dayIndex]?.id === accommodation.id) return;
    const dayNumber = dayIndex + 1;
    setActiveAccommodations((prev) => ({ ...prev, [dayIndex]: accommodation }));
    setSelectedTours((prev) => ({
      ...prev,
      hotels: [
        ...prev.hotels.filter((h) => h.day !== dayNumber),
        {
          day: dayNumber,
          name: accommodation.name,
          id: accommodation.id,
          price: accommodation.price_per_night,
        },
      ],
    }));
    dispatch(selectHotel({ day: dayNumber, hotel: accommodation }));
  };

  const handleTransferClick = (transfer, dayIndex) => {
    if (activeTransfers[dayIndex]?.id === transfer.id) return;
    const dayNumber = dayIndex + 1;
    setActiveTransfers((prev) => ({ ...prev, [dayIndex]: transfer }));
    setSelectedTours((prev) => ({
      ...prev,
      transfers: [
        ...prev.transfers.filter((t) => t.day !== dayNumber),
        {
          day: dayNumber,
          name: transfer.name,
          id: transfer.id,
          price: transfer.price,
        },
      ],
    }));
    dispatch(selectCar({ day: dayNumber, car: transfer }));
  };

  const calculatePriceDifference = (selectedPrice, defaultPrice) =>
    defaultPrice - (selectedPrice || defaultPrice);

  // ══════════════════════════════════════════
  // HANDLE SAVE
  // ══════════════════════════════════════════
  const handleSave = async () => {
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }
    if (!endDate) {
      toast.error("Please select an end date");
      return;
    }
    if (endDate.isBefore(startDate)) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      setSaving(true);

      const reservationId =
        data?.reservation_id || data?.reservationId || data?.id;
      if (!reservationId) {
        toast.error("Reservation ID not found");
        return;
      }

      // ── day_hotel ──
      // Format: "hotel_id**dayNum**day**hotel_id**dayNum"
      const day_hotel = mappedDays
        .map((dayData) => {
          const hotel = activeAccommodations[dayData.day - 1];
          if (!hotel) return null;
          const hotel_id = hotel.hotel_id || String(hotel.id);
          return `${hotel_id}**${dayData.day}`;
        })
        .filter(Boolean)
        .join("**day**");

      // ── day_car ──
      const day_car = mappedDays
        .map((dayData) => {
          const car = activeTransfers[dayData.day - 1];
          if (!car) return null;
          const car_id = car.car_id || String(car.id);
          return `${car_id}**${dayData.day}`;
        })
        .filter(Boolean)
        .join("**day**");

      // ── day_activities ──
      // ✅ بناخد من Redux مع deduplication
      const day_activities = mappedDays
        .flatMap((dayData) => {
          const dayKey = String(dayData.day);
          const rawActs = selectedByDay?.[dayKey]?.activities || [];
          // ✅ deduplicate
          const uniqueActs = rawActs.filter(
            (act, idx, arr) =>
              arr.findIndex((a) => String(a.id) === String(act.id)) === idx
          );
          return uniqueActs.map((act) => {
            const activity_id = act.activity_id || String(act.id);
            return `${activity_id}**${dayData.day}`;
          });
        })
        .filter(Boolean)
        .join("**day**");

      // ── day_tour_guide ──
      const day_tour_guide = mappedDays
        .map((dayData) => {
          const guideData = tourGuideByDay[dayData.day];
          if (!guideData?.isAvailable) return null;
          return `${guideData.isSelected ? 1 : 0}**${dayData.day}`;
        })
        .filter(Boolean)
        .join("**day**");

      const payload = {
        reservation_id: String(reservationId),
        num_adults: String(adults),
        num_children: String(childrenCount),
        total_amount: String(totalPrice.toFixed(0)),
        start_date: startDate.format("YYYY-MM-DD"),
        end_date: endDate.format("YYYY-MM-DD"),
        day_hotel,
        day_car,
        day_activities,
        day_tour_guide,
      };

      console.log("💾 Payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${base_url}/user/tours/update_tour.php`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === "success" || response.data.success) {
        toast.success("Booking updated successfully! 🎉");
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to update booking");
      }
    } catch (err) {
      console.error("❌ Save error:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to save changes"
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Map days ──
  const mappedDays = useMemo(() => {
    const source = tourDetails || data;
    if (!source?.itinerary) return [];
    return source.itinerary.map((day) => ({
      day: parseInt(day.day),
      day_id: day.day_id,
      title: day.title,
      description: { en: day.description, ar: day.description },
      activityTags: day.activities || [],
      accommodation: (day.hotel_options || []).map(mapHotelFromAPI),
      transfers: (day.cars_options || []).map(mapCarFromAPI),
      activities: (day.activities_options || []).map(mapActivityFromAPI),
    }));
  }, [tourDetails, data]);

  // ── Total ──
  const totalPrice = useMemo(() => {
    let total = 0;
    Object.values(activeAccommodations).forEach((h) => {
      total += parseFloat(h.price_per_night || h.adult_price || 0);
    });
    Object.values(activeTransfers).forEach((t) => {
      total += parseFloat(t.price || t.price_current || 0);
    });
    // ✅ إضافة الـ activities price
    Object.entries(selectedByDay).forEach(([, dayData]) => {
      const uniqueActs = (dayData.activities || []).filter(
        (act, idx, arr) =>
          arr.findIndex((a) => String(a.id) === String(act.id)) === idx
      );
      uniqueActs.forEach((act) => {
        total += parseFloat(act.price_current || act.price || 0);
      });
    });
    return total;
  }, [activeAccommodations, activeTransfers, selectedByDay]);

  const displayData = tourDetails || data;
  if (!data) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={880}
      className="edit-tour-modal"
      styles={{
        body: { padding: 0 },
        content: { borderRadius: 16, overflow: "hidden", padding: 0 },
      }}
      title={null}
      footer={null}
      closeIcon={null}
      destroyOnClose
    >
      <div className="flex flex-col h-[90vh]">
        {/* Header */}
        <div className="relative h-40 shrink-0 overflow-hidden">
          <img
            src={
              displayData?.background_image ||
              displayData?.backgroundImage ||
              displayData?.image ||
              data?.image
            }
            alt={displayData?.title || "Tour"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white rounded-full p-2 transition-all z-10"
          >
            <FiX size={16} />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
              {displayData?.title || data?.title}
            </h3>
            <div className="flex gap-3 text-[11px] text-white/70">
              {displayData?.duration && (
                <span className="flex items-center gap-1">
                  <FiClock size={11} /> {displayData.duration}
                </span>
              )}
              {displayData?.route && (
                <span className="flex items-center gap-1">
                  <FiMapPin size={11} />{" "}
                  {displayData.route.split("-")[0]?.trim()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-[#f8f9fb]">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Spin size="large" />
              <p className="text-gray-400 text-sm">Loading tour options...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <FiAlertCircle size={32} className="text-red-400" />
              </div>
              <p className="text-red-600 font-semibold">Failed to Load</p>
              <p className="text-gray-400 text-sm">{error}</p>
              <Button
                onClick={() => {
                  const id = propTourId || data?.tour_id || data?.id;
                  if (id) fetchTourDetails(id);
                }}
                className="rounded-lg"
              >
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && (
            <div className="p-5 space-y-4">
              {/* Booking Config */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#295557] rounded-full" />
                  <h4 className="text-sm font-bold text-gray-800">
                    Booking Configuration
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Travel Dates
                    </label>
                    <div className="flex items-center gap-2">
                      <DatePicker
                        value={startDate}
                        onChange={setStartDate}
                        className="flex-1 rounded-xl h-10"
                        format="MMM DD, YYYY"
                        placeholder="Start"
                        disabledDate={(current) =>
                          current && current < dayjs().startOf("day")
                        }
                      />
                      <div className="w-6 h-[1px] bg-gray-300" />
                      <DatePicker
                        value={endDate}
                        onChange={setEndDate}
                        className="flex-1 rounded-xl h-10"
                        format="MMM DD, YYYY"
                        placeholder="End"
                        disabledDate={(current) =>
                          current &&
                          startDate &&
                          current < startDate.startOf("day")
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Travelers
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center justify-between bg-[#f8f9fb] border border-gray-100 rounded-xl px-3 h-10">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <FiUser size={13} /> Adults
                        </span>
                        <InputNumber
                          min={1}
                          max={displayData?.max_persons || 20}
                          value={adults}
                          onChange={setAdults}
                          size="small"
                          className="w-14 bg-white"
                        />
                      </div>
                      <div className="flex-1 flex items-center justify-between bg-[#f8f9fb] border border-gray-100 rounded-xl px-3 h-10">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <FiUsers size={13} /> Children
                        </span>
                        <InputNumber
                          min={0}
                          max={displayData?.max_persons || 20}
                          value={childrenCount}
                          onChange={setChildrenCount}
                          size="small"
                          className="w-14 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itinerary */}
              {mappedDays.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#295557] rounded-full" />
                      <h4 className="text-sm font-bold text-gray-800">
                        Itinerary
                      </h4>
                      <span className="text-[10px] bg-[#295557]/10 text-[#295557] px-2 py-0.5 rounded-full font-medium">
                        {mappedDays.length} days
                      </span>
                    </div>
                    {totalPrice > 0 && (
                      <span className="text-[#295557] text-xs font-semibold bg-[#295557]/5 px-3 py-1 rounded-full">
                        ${totalPrice.toFixed(0)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {mappedDays.map((dayData, index) => (
                      <DayItineraryCard
                        key={dayData.day_id || index}
                        dayData={dayData}
                        index={index}
                        activeAccommodations={activeAccommodations}
                        activeTransfers={activeTransfers}
                        selectedTours={selectedTours}
                        setSelectedTours={setSelectedTours}
                        handleAccommodationClick={handleAccommodationClick}
                        handleTransferClick={handleTransferClick}
                        people={{ adults, children: childrenCount, infants: 0 }}
                        calculatePriceDifference={calculatePriceDifference}
                      />
                    ))}
                  </div>
                </div>
              )}

              {mappedDays.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg mb-2">No itinerary data available</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && (
          <div className="shrink-0 bg-white border-t border-gray-100 px-5 py-3 flex items-center justify-between">
            <div>
              {totalPrice > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">
                    Estimated Total
                  </p>
                  <p className="text-lg font-bold text-[#295557]">
                    ${totalPrice.toFixed(0)}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onClose}
                size="large"
                disabled={saving}
                className="rounded-xl px-6 h-10 border-gray-200 text-gray-600"
              >
                Cancel
              </Button>
              <button
                // type="primary"
                onClick={handleSave}
                // size="large"
                loading={saving}
                disabled={saving}
                className="bg-[#295557] text-white hover:bg-[#1e3d3f] border-[#295557] rounded-xl px-8 h-10 font-medium shadow-sm"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EditTourBookingModal;
