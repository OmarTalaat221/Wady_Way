"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Modal, Spin } from "antd";
import Calendar from "react-calendar";
import axios from "axios";
import {
  FiClock,
  FiMapPin,
  FiUser,
  FiUsers,
  FiAlertCircle,
  FiChevronDown,
  FiCheck,
} from "react-icons/fi";
import { FaBed, FaUserTie, FaHiking, FaPlus, FaMinus } from "react-icons/fa";
import { MdEmojiTransportation } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  clearCurrentTourData,
  setTourData,
  setTourInfo,
  setPeopleCount,
  initializeTourGuide,
  selectHotel,
  setDayCars,
  setDayRooms,
  selectActivity,
  toggleTourGuide,
  calculateTotal,
  selectPriceDetails,
  formatReservationForAPI,
  validateRoomsForAllDays,
  validateCarsForAllDays,
  setDisableLocalStorageSync,
} from "@/lib/redux/slices/tourReservationSlice";
import { base_url } from "@/uitils/base_url";
import AccommodationCard from "../../app/package/package-details/[packageId]/_components/AccommodationCard";
import TransferCard from "../../app/package/package-details/[packageId]/_components/TransferCard";
import ActivityCard from "../../app/package/package-details/[packageId]/_components/ActivityCard";
import toast from "react-hot-toast";
import "./modals.css";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDateLocal = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const parseDateString = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const buildEndDate = (startDate, durationDays) => {
  const duration = Math.max(Number(durationDays || 1), 1);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + duration - 1);
  return endDate;
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

const getReservationSource = (data) => {
  if (data?.reservation) return data.reservation;
  return data || {};
};

const getReservedTourSnapshot = (data) => {
  return data?.tour_details || null;
};

// ─── Reservation string parsers ──────────────────────────────────────────────

const parseHotelsPerDay = (str) => {
  if (!str) return {};
  const result = {};
  str.split("**day**").forEach((entry) => {
    const parts = entry.split("**");
    if (parts.length >= 2) result[String(parts[0])] = parts[1];
  });
  return result;
};

const parseCarsPerDay = (str) => {
  if (!str) return {};
  const result = {};
  str.split("**day**").forEach((entry) => {
    const parts = entry.split("**");
    if (parts.length >= 3) {
      const dayNum = String(parts[0]);
      const carId = parts[1];
      const withDriver = parts[2] === "1";
      if (!result[dayNum]) result[dayNum] = [];
      if (carId && carId !== "0") result[dayNum].push({ carId, withDriver });
    }
  });
  return result;
};

const parseActivitiesPerDay = (str) => {
  if (!str) return {};
  const result = {};
  str.split("**day**").forEach((entry) => {
    const parts = entry.split("**");
    if (parts.length >= 4) {
      const dayNum = String(parts[0]);
      const actId = parts[1];
      const numAdults = parseInt(parts[2] || "1");
      const numChildren = parseInt(parts[3] || "0");
      if (!result[dayNum]) result[dayNum] = [];
      result[dayNum].push({ actId, numAdults, numChildren });
    }
  });
  return result;
};

const parseGuidesPerDay = (str) => {
  if (!str) return {};
  const result = {};
  str.split("**day**").forEach((entry) => {
    const parts = entry.split("**");
    if (parts.length >= 2) result[String(parts[0])] = parts[1] === "1";
  });
  return result;
};

// ─── Mappers ─────────────────────────────────────────────────────────────────

const mapHotelFromAPI = (hotel) => ({
  id: parseInt(hotel.hotel_id || hotel.id),
  tour_hotel_id: hotel.tour_hotel_id,
  hotel_id: String(hotel.hotel_id || hotel.id),
  image: hotel.image?.split("//CAMP//")[0] || hotel.image,
  name: { en: hotel.title, ar: hotel.title },
  title: hotel.title,
  category: { en: "Hotel", ar: "فندق" },
  price_per_night: parseFloat(hotel.adult_price || 0),
  adult_price: parseFloat(hotel.adult_price || 0),
  child_price: parseFloat(hotel.child_price || 0),
  per_room: parseInt(hotel.per_room || 6),
  amenities: hotel.amenities || [],
  rooms: hotel.rooms || [],
  originalData: hotel,
});

const mapCarFromAPI = (car) => ({
  id: parseInt(car.car_id || car.id),
  tour_car_id: car.tour_car_id,
  car_id: String(car.car_id || car.id),
  image: car.image?.split("//CAMP//")[0] || car.image,
  name: { en: car.title, ar: car.title },
  title: car.title,
  category: { en: "Car", ar: "سيارة" },
  price: parseFloat(car.price_current || 0),
  price_current: parseFloat(car.price_current || 0),
  capacity: car.max_people || car.capacity || "4",
  max_people: car.max_people || car.capacity || "4",
  features: car.features || [],
  originalData: car,
});

const mapActivityFromAPI = (act) => ({
  id: parseInt(act.activity_id || act.id),
  tour_activity_id: act.tour_activity_id,
  activity_id: parseInt(act.activity_id || act.id),
  title: { en: act.title, ar: act.title },
  name: act.title,
  image: act.image?.split("//CAMP//")[0] || act.image,
  price: parseFloat(act.price_current || 0),
  price_current: parseFloat(act.price_current || 0),
  for_children: act.for_children === "1" || act.for_children === 1,
  features: act.features || [],
  originalData: act,
});

const normalizeTourOptions = (tour) => {
  if (!tour) return null;
  return { ...tour, attachments: parseMaybeJsonArray(tour.attachments) };
};

// ─── Rooms normalizer ─────────────────────────────────────────────────────────

const normalizeRoomsFromBackend = (backendRooms) => {
  if (!Array.isArray(backendRooms) || backendRooms.length === 0) return [];
  return backendRooms.map((room, idx) => ({
    id: idx + 1,
    adults: Number(room.adults || 0),
    children: Number(room.kids ?? room.children ?? 0),
    babies: Number(room.babies ?? room.infants ?? 0),
  }));
};

// ─── clamp rooms to current people ────────────────────────────────────────────

const clampRoomsToCurrentPeople = (
  rooms,
  maxAdults,
  maxChildren,
  maxBabies
) => {
  if (!Array.isArray(rooms) || rooms.length === 0) return rooms;

  let remainingAdults = maxAdults;
  let remainingChildren = maxChildren;
  let remainingBabies = maxBabies;

  const clamped = rooms.map((room) => {
    const clampedAdults = Math.min(Number(room.adults || 0), remainingAdults);
    remainingAdults -= clampedAdults;

    const clampedChildren = Math.min(
      Number(room.children || 0),
      remainingChildren
    );
    remainingChildren -= clampedChildren;

    const clampedBabies = Math.min(Number(room.babies || 0), remainingBabies);
    remainingBabies -= clampedBabies;

    return {
      ...room,
      adults: clampedAdults,
      children: clampedChildren,
      babies: clampedBabies,
    };
  });

  const validRooms = clamped.filter((r) => r.adults > 0);

  if (validRooms.length === 0) {
    return [
      {
        id: clamped[0]?.id || 1,
        adults: Math.max(maxAdults, 1),
        children: 0,
        babies: 0,
      },
    ];
  }

  return validRooms;
};

// ─── UI helper ────────────────────────────────────────────────────────────────

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

// ─── Day Card ─────────────────────────────────────────────────────────────────

const EditDayCard = ({
  dayData,
  index,
  people,
  activeAccommodations,
  setActiveAccommodations,
  selectedCarsPerDay,
  setSelectedCarsPerDay,
  initialRooms,
}) => {
  const dispatch = useDispatch();
  const dayNumber = index + 1;
  const dayKey = String(dayNumber);

  const selectedByDay = useSelector(
    (state) => state.tourReservation?.selectedByDay || {}
  );
  const savedDayData = useSelector(
    (state) => state.tourReservation?.selectedByDay?.[dayKey] || {}
  );
  const tourGuideData = useSelector(
    (state) => state.tourReservation?.tourGuideByDay?.[dayKey]
  );

  const [openSections, setOpenSections] = useState(new Set());
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);

  const [localRooms, setLocalRooms] = useState(() => {
    if (initialRooms && initialRooms.length > 0) return initialRooms;
    return [{ id: 1, adults: 1, children: 0, babies: 0 }];
  });

  const roomsHydratedRef = useRef(false);
  const prevHotelIdRef = useRef(null);
  const lastSyncedCarsRef = useRef("");
  const lastSyncedRoomsRef = useRef("");
  const draftsRef = useRef({});
  const prevPeopleRef = useRef({
    adults: people.adults,
    children: people.children,
    infants: people.infants || 0,
  });

  const selectedHotel = activeAccommodations[index];
  const selectedCars = selectedCarsPerDay[dayKey] || [];

  const isGuideAvailable = tourGuideData?.isAvailable || false;
  const isGuideSelected = tourGuideData?.isSelected || false;

  const totalAdults = people.adults;
  const totalChildren = people.children;
  const totalInfants = people.infants || 0;
  const totalTravelers = totalAdults + totalChildren;
  const maxRooms = Math.max(totalAdults, 1);
  const numAdults = totalAdults;

  const perRoomMax = useMemo(() => {
    const activeHotel = activeAccommodations[index];
    return parseInt(
      activeHotel?.originalData?.per_room || activeHotel?.per_room || 6
    );
  }, [activeAccommodations, index]);

  const assignedCounts = useMemo(() => {
    return localRooms.reduce(
      (acc, room) => ({
        adults: acc.adults + Number(room.adults || 0),
        children: acc.children + Number(room.children || 0),
        babies: acc.babies + Number(room.babies || 0),
      }),
      { adults: 0, children: 0, babies: 0 }
    );
  }, [localRooms]);

  const confirmedRoomsCount = useMemo(() => {
    const rooms = Array.isArray(savedDayData?.rooms) ? savedDayData.rooms : [];
    return rooms.length;
  }, [savedDayData?.rooms]);

  useEffect(() => {
    if (roomsHydratedRef.current) return;

    if (initialRooms && initialRooms.length > 0) {
      roomsHydratedRef.current = true;
      return;
    }

    const savedRooms = Array.isArray(savedDayData?.rooms)
      ? savedDayData.rooms
      : [];

    if (savedRooms.length > 0) {
      roomsHydratedRef.current = true;
      setLocalRooms(
        savedRooms.map((room, idx) => ({
          id: idx + 1,
          adults: Number(room.adults || 0),
          children: Number(room.kids ?? room.children ?? 0),
          babies: Number(room.babies ?? room.infants ?? 0),
        }))
      );
    }
  }, [savedDayData?.rooms, initialRooms]);

  useEffect(() => {
    const prev = prevPeopleRef.current;
    const adultsChanged = prev.adults !== totalAdults;
    const childrenChanged = prev.children !== totalChildren;
    const infantsChanged = prev.infants !== totalInfants;

    if (!adultsChanged && !childrenChanged && !infantsChanged) return;

    prevPeopleRef.current = {
      adults: totalAdults,
      children: totalChildren,
      infants: totalInfants,
    };

    setLocalRooms((prevRooms) => {
      const clamped = clampRoomsToCurrentPeople(
        prevRooms,
        totalAdults,
        totalChildren,
        totalInfants
      );

      const trimmed =
        clamped.length > Math.max(totalAdults, 1)
          ? clamped.slice(0, Math.max(totalAdults, 1))
          : clamped;

      return trimmed;
    });
  }, [totalAdults, totalChildren, totalInfants]);

  useEffect(() => {
    const key = JSON.stringify(localRooms);
    if (key === lastSyncedRoomsRef.current) return;
    lastSyncedRoomsRef.current = key;

    const currentHotelId = selectedHotel?.id || selectedHotel?.hotel_id || null;
    if (currentHotelId) {
      draftsRef.current[currentHotelId] = localRooms;
    }

    dispatch(
      setDayRooms({
        day: dayNumber,
        hotelId: currentHotelId,
        rooms: localRooms.map((r) => ({
          adults: r.adults,
          kids: r.children,
          babies: r.babies,
        })),
      })
    );
  }, [localRooms, dayNumber, selectedHotel, dispatch]);

  useEffect(() => {
    const currentHotelId = selectedHotel?.id || selectedHotel?.hotel_id || null;

    if (
      prevHotelIdRef.current !== null &&
      currentHotelId !== null &&
      String(prevHotelIdRef.current) !== String(currentHotelId)
    ) {
      const savedDraft = draftsRef.current[currentHotelId];

      if (savedDraft && savedDraft.length > 0) {
        setLocalRooms(savedDraft);
      } else {
        const defaultRooms =
          totalTravelers <= 2
            ? [
                {
                  id: 1,
                  adults: Math.max(totalAdults, 1),
                  children: totalChildren,
                  babies: totalInfants,
                },
              ]
            : [{ id: 1, adults: 1, children: 0, babies: 0 }];

        setLocalRooms(defaultRooms);
      }
    }

    prevHotelIdRef.current = currentHotelId;
  }, [selectedHotel, totalAdults, totalChildren, totalInfants, totalTravelers]);

  useEffect(() => {
    const carsPayload = selectedCars.map((car) => ({
      id: car.carData?.id || car.carData?.car_id,
      car_id: car.carData?.car_id || car.carData?.id,
      title: car.carData?.title || car.carData?.name?.en,
      name: car.carData?.name,
      image: car.carData?.image,
      price_current: car.carData?.price_current || car.carData?.price,
      price: car.carData?.price || car.carData?.price_current,
      capacity: car.carData?.capacity || car.carData?.max_people || "4",
      max_people: car.carData?.max_people || car.carData?.capacity || "4",
      features: car.carData?.features || [],
      instanceId: String(car.id),
      withDriver: !!car.withDriver,
    }));

    const carsKey = JSON.stringify(
      carsPayload.map((c) => `${c.id}-${c.withDriver}-${c.instanceId}`)
    );

    if (carsKey === lastSyncedCarsRef.current) return;
    lastSyncedCarsRef.current = carsKey;

    dispatch(setDayCars({ day: dayNumber, cars: carsPayload }));
    setTimeout(() => dispatch(calculateTotal()), 50);
  }, [selectedCars, dayNumber, dispatch]);

  const toggleSection = (key) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleAccommodationClick = useCallback(
    (accommodation) => {
      if (activeAccommodations[index]?.id === accommodation.id) return;

      setActiveAccommodations((prev) => ({
        ...prev,
        [index]: accommodation,
      }));

      dispatch(selectHotel({ day: dayNumber, hotel: accommodation }));
      dispatch(calculateTotal());

      if (totalTravelers > 2) {
        setSelectedAccommodation({ ...accommodation, dayIndex: index });
        setIsFlipped(true);
      } else {
        setSelectedAccommodation(null);
        setIsFlipped(false);
      }
    },
    [
      activeAccommodations,
      index,
      dayNumber,
      dispatch,
      setActiveAccommodations,
      totalTravelers,
    ]
  );

  const handleFlip = useCallback(() => {
    if (activeAccommodations[index]) {
      setSelectedAccommodation({
        ...activeAccommodations[index],
        dayIndex: index,
      });
      setIsFlipped(true);
    }
  }, [activeAccommodations, index]);

  const handleRoomChange = useCallback(
    (action, roomId, type) => {
      setLocalRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;

          if (action === "increase") {
            const currentTotal = prev.reduce(
              (sum, r) =>
                sum +
                (type === "adults"
                  ? r.adults
                  : type === "children"
                    ? r.children
                    : r.babies),
              0
            );

            const maxAllowed =
              type === "adults"
                ? totalAdults
                : type === "children"
                  ? totalChildren
                  : totalInfants;

            if (currentTotal >= maxAllowed) {
              toast.error(`All ${type} are already assigned`);
              return room;
            }

            if (type === "adults" || type === "children") {
              const occ = room.adults + room.children;
              if (occ >= perRoomMax) {
                toast.error(`Maximum ${perRoomMax} persons per room`);
                return room;
              }
            }

            return { ...room, [type]: room[type] + 1 };
          }

          if (action === "decrease") {
            if (type === "adults" && room.adults <= 1) {
              toast.error("Each room needs at least 1 adult");
              return room;
            }
            if (type === "children" && room.children <= 0) return room;
            if (type === "babies" && room.babies <= 0) return room;
            return { ...room, [type]: room[type] - 1 };
          }

          return room;
        })
      );
    },
    [totalAdults, totalChildren, totalInfants, perRoomMax]
  );

  const addRoom = useCallback(() => {
    if (localRooms.length >= maxRooms) {
      toast.error(`Maximum ${maxRooms} rooms allowed (1 per adult)`);
      return;
    }

    const assignedAdults = localRooms.reduce((s, r) => s + r.adults, 0);
    if (totalAdults - assignedAdults <= 0) {
      toast.error("No remaining adults to assign");
      return;
    }

    setLocalRooms((prev) => [
      ...prev,
      {
        id: Math.max(...prev.map((r) => r.id)) + 1,
        adults: 1,
        children: 0,
        babies: 0,
      },
    ]);
  }, [localRooms, maxRooms, totalAdults]);

  const removeRoom = useCallback(
    (roomId) => {
      if (localRooms.length <= 1) {
        toast.error("At least 1 room is required");
        return;
      }
      setLocalRooms((prev) => prev.filter((r) => r.id !== roomId));
    },
    [localRooms.length]
  );

  const confirmRoomSelection = useCallback(() => {
    if (!selectedHotel?.id && !selectedHotel?.hotel_id) {
      toast.error("Please select a hotel first");
      return;
    }

    const assignedTravelers = localRooms.reduce(
      (s, r) => s + r.adults + r.children,
      0
    );

    if (assignedTravelers !== totalTravelers) {
      toast.error(
        `Please assign all ${totalTravelers} travelers. Currently: ${assignedTravelers}`
      );
      return;
    }

    if (assignedCounts.adults !== totalAdults) {
      toast.error(
        `${totalAdults - assignedCounts.adults} adult(s) not assigned`
      );
      return;
    }

    if (totalChildren > 0 && assignedCounts.children !== totalChildren) {
      toast.error(
        `${totalChildren - assignedCounts.children} child(ren) not assigned`
      );
      return;
    }

    const childAlone = localRooms.find((r) => r.adults === 0 && r.children > 0);
    if (childAlone) {
      toast.error("Children can't stay alone in a room");
      return;
    }

    dispatch(
      setDayRooms({
        day: dayNumber,
        hotelId: selectedHotel?.id || selectedHotel?.hotel_id || null,
        rooms: localRooms.map((r) => ({
          adults: r.adults,
          kids: r.children,
          babies: r.babies,
        })),
      })
    );

    setTimeout(() => dispatch(calculateTotal()), 50);
    setIsFlipped(false);
    setSelectedAccommodation(null);
    toast.success("Room selection confirmed!");
  }, [
    localRooms,
    totalTravelers,
    dayNumber,
    dispatch,
    selectedHotel,
    assignedCounts,
    totalAdults,
    totalChildren,
  ]);

  const cancelRoomSelection = useCallback(() => {
    setIsFlipped(false);
    setSelectedAccommodation(null);

    const currentHotelId = selectedHotel?.id || selectedHotel?.hotel_id || null;
    const savedDraft = currentHotelId
      ? draftsRef.current[currentHotelId]
      : null;

    if (savedDraft && savedDraft.length > 0) {
      setLocalRooms(savedDraft);
      return;
    }

    const savedRooms = Array.isArray(savedDayData?.rooms)
      ? savedDayData.rooms
      : [];

    if (savedRooms.length > 0) {
      setLocalRooms(
        savedRooms.map((room, idx) => ({
          id: idx + 1,
          adults: Number(room.adults || 0),
          children: Number(room.kids ?? room.children ?? 0),
          babies: Number(room.babies ?? room.infants ?? 0),
        }))
      );
      return;
    }

    if (totalTravelers <= 2) {
      setLocalRooms([
        {
          id: 1,
          adults: Math.max(totalAdults, 1),
          children: totalChildren,
          babies: totalInfants,
        },
      ]);
    } else {
      setLocalRooms([{ id: 1, adults: 1, children: 0, babies: 0 }]);
    }
  }, [
    selectedHotel,
    savedDayData?.rooms,
    totalAdults,
    totalChildren,
    totalInfants,
    totalTravelers,
  ]);

  const addCar = useCallback(
    (carItem) => {
      if (selectedCars.length >= numAdults) {
        toast.error(
          `Maximum ${numAdults} car${numAdults > 1 ? "s" : ""} allowed (1 per adult)`,
          { icon: "🚗" }
        );
        return;
      }

      const newCar = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        carData: {
          ...carItem,
          capacity: carItem.capacity || carItem.max_people || "4",
        },
        withDriver: false,
      };

      setSelectedCarsPerDay((prev) => ({
        ...prev,
        [dayKey]: [...(prev[dayKey] || []), newCar],
      }));
    },
    [selectedCars.length, numAdults, setSelectedCarsPerDay, dayKey]
  );

  const removeCar = useCallback(
    (carId) => {
      setSelectedCarsPerDay((prev) => ({
        ...prev,
        [dayKey]: (prev[dayKey] || []).filter((c) => c.id !== carId),
      }));
    },
    [setSelectedCarsPerDay, dayKey]
  );

  const toggleDriver = useCallback(
    (carId) => {
      setSelectedCarsPerDay((prev) => ({
        ...prev,
        [dayKey]: (prev[dayKey] || []).map((c) =>
          c.id === carId ? { ...c, withDriver: !c.withDriver } : c
        ),
      }));
    },
    [setSelectedCarsPerDay, dayKey]
  );

  const totalPassengers = useMemo(() => {
    const driversCount = selectedCars.filter((c) => c.withDriver).length;
    return totalAdults + totalChildren + driversCount;
  }, [selectedCars, totalAdults, totalChildren]);

  const totalCarCapacity = useMemo(
    () =>
      selectedCars.reduce(
        (sum, c) =>
          sum + (parseInt(c.carData?.capacity || c.carData?.max_people) || 4),
        0
      ),
    [selectedCars]
  );

  const isCapacitySufficient = totalCarCapacity >= totalPassengers;
  const isMaxCarsReached = selectedCars.length >= numAdults;
  const isDayFlipped = isFlipped && selectedAccommodation?.dayIndex === index;

  const selectedActivitiesRaw = selectedByDay?.[dayKey]?.activities || [];
  const selectedActivities = selectedActivitiesRaw.filter(
    (act, idx, arr) =>
      arr.findIndex(
        (a) =>
          String(a.id || a.activity_id) === String(act.id || act.activity_id)
      ) === idx
  );

  const dayTotal = useMemo(() => {
    const hotelTotal = parseFloat(
      selectedHotel?.price_per_night || selectedHotel?.adult_price || 0
    );
    const carsTotal = selectedCars.reduce(
      (sum, c) =>
        sum + parseFloat(c.carData?.price_current || c.carData?.price || 0),
      0
    );
    const actsTotal = selectedActivities.reduce(
      (sum, act) => sum + parseFloat(act.price_current || act.price || 0),
      0
    );
    return hotelTotal + carsTotal + actsTotal;
  }, [selectedHotel, selectedCars, selectedActivities]);

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
        selectedCars.length > 0
          ? `${selectedCars.length} car(s) selected`
          : null,
      price:
        selectedCars.reduce(
          (sum, c) =>
            sum + parseFloat(c.carData?.price_current || c.carData?.price || 0),
          0
        ) || null,
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
      <div className="bg-gradient-to-r from-[#295557] via-[#2f6163] to-[#3a7274] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white text-[#295557] font-bold text-xs w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
              {dayNumber}
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight mb-0">
                {dayData.title || `Day ${dayNumber}`}
              </p>
              {!!dayData.description && (
                <p
                  className="text-white/60 text-[11px] mt-0.5 line-clamp-1 max-w-[300px] !mb-0"
                  dangerouslySetInnerHTML={{
                    __html:
                      typeof dayData.description === "string"
                        ? dayData.description
                        : dayData.description?.en || "",
                  }}
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
              isSelected={selectedCars.length > 0}
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

      {isGuideAvailable && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-[#295557]/5 to-transparent border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-0">
                Tour Guide
              </p>
              <p className="text-[10px] text-gray-400 mb-0">
                Professional local guide
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isGuideSelected}
                onChange={() => {
                  dispatch(toggleTourGuide(dayNumber));
                  setTimeout(() => dispatch(calculateTotal()), 50);
                }}
              />
              <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#295557] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 shadow-inner" />
            </label>
          </div>
        </div>
      )}

      {selectedActivities.length > 0 && (
        <div className="px-4 py-2.5 bg-green-50/50 border-b border-gray-100">
          <p className="text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
            Included Activities ({selectedActivities.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selectedActivities.map((act, i) => (
              <span
                key={`${act.id || act.activity_id}-${i}`}
                className="inline-flex items-center gap-1 text-[11px] bg-[#295557]/10 text-[#295557] px-2 py-0.5 rounded-full font-medium"
              >
                <FaHiking size={9} />
                {act.title?.en || act.title?.ar || act.name || "Activity"}
                {parseFloat(act.price_current || act.price || 0) > 0 && (
                  <span className="text-[#295557]/60">
                    ·${parseFloat(act.price_current || act.price).toFixed(0)}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-50">
        {sections.map((section) => {
          const isOpen = openSections.has(section.key);

          return (
            <div key={section.key}>
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className={`w-full flex items-center justify-between px-4 py-2.5 transition-all duration-200 ${
                  isOpen ? "bg-gray-50" : "hover:bg-gray-50/50"
                }`}
              >
                <div className="text-left">
                  <p className="text-[13px] font-semibold text-gray-800 mb-0">
                    {section.label}
                  </p>
                  <p
                    className={`text-[11px] mb-0 ${
                      section.selectedName
                        ? "text-[#295557] font-medium"
                        : "text-gray-400"
                    }`}
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
                    className={`text-gray-300 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#295557]" : ""
                    }`}
                  />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-4 pb-4 pt-2">
                  {section.key === "accommodation" && (
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar cards-container-parent">
                      {dayData.accommodation?.length > 0 ? (
                        dayData.accommodation.map((item) => (
                          <div
                            key={item.tour_hotel_id || item.hotel_id || item.id}
                            className="flex-shrink-0"
                            style={{ minWidth: "280px", height: "420px" }}
                          >
                            <AccommodationCard
                              item={item}
                              index={index}
                              activeAccommodations={activeAccommodations}
                              isFlipped={isDayFlipped}
                              selectedAccommodation={selectedAccommodation}
                              handleAccommodationClick={
                                handleAccommodationClick
                              }
                              handleFlip={handleFlip}
                              setMapModal={() => {}}
                              people={people}
                              calculatePriceDifference={(
                                selectedPrice,
                                defaultPrice
                              ) =>
                                defaultPrice - (selectedPrice || defaultPrice)
                              }
                              rooms={localRooms}
                              handleRoomChange={handleRoomChange}
                              addRoom={addRoom}
                              removeRoom={removeRoom}
                              confirmRoomSelection={confirmRoomSelection}
                              cancelRoomSelection={cancelRoomSelection}
                              assignedCounts={assignedCounts}
                              perRoomMax={perRoomMax}
                              maxRooms={maxRooms}
                              hasRoomsConfigured={
                                String(item.id || item.hotel_id || "") ===
                                  String(
                                    selectedHotel?.id ||
                                      selectedHotel?.hotel_id ||
                                      ""
                                  ) && confirmedRoomsCount > 0
                              }
                              savedRoomsCount={
                                String(item.id || item.hotel_id || "") ===
                                String(
                                  selectedHotel?.id ||
                                    selectedHotel?.hotel_id ||
                                    ""
                                )
                                  ? confirmedRoomsCount
                                  : 0
                              }
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
                    <div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg mb-3 bg-gray-50 border border-gray-200">
                        <span className="text-gray-500 text-sm">🚗</span>
                        <span className="text-xs text-gray-600">
                          {selectedCars.length}/{numAdults} cars selected (max 1
                          per adult)
                        </span>
                      </div>

                      {totalInfants > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg mb-3 bg-blue-50 border border-blue-200">
                          <span className="text-blue-500 text-sm">👶</span>
                          <span className="text-xs text-blue-700">
                            {totalInfants} infant
                            {totalInfants > 1 ? "s" : ""} — not counted for car
                            seats
                          </span>
                        </div>
                      )}

                      {selectedCars.length > 0 && (
                        <div
                          className={`flex items-center justify-between px-4 py-3 rounded-xl mb-4 border ${
                            isCapacitySufficient
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div className="text-sm">
                            <span className="font-semibold">
                              {selectedCars.length}{" "}
                              {selectedCars.length === 1 ? "car" : "cars"}
                            </span>
                            <span className="text-gray-500 mx-1">•</span>
                            <span>Capacity: {totalCarCapacity} seats</span>
                          </div>

                          <div className="text-sm">
                            <span
                              className={`font-semibold ${
                                isCapacitySufficient
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
                              {totalPassengers} people
                              {selectedCars.filter((c) => c.withDriver).length >
                                0 &&
                                ` (incl. ${
                                  selectedCars.filter((c) => c.withDriver)
                                    .length
                                } driver${
                                  selectedCars.filter((c) => c.withDriver)
                                    .length > 1
                                    ? "s"
                                    : ""
                                })`}
                            </span>
                            {!isCapacitySufficient && (
                              <span className="text-red-600 text-xs block">
                                Need {totalPassengers - totalCarCapacity} more
                                seat(s)
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedCars.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {selectedCars.map((car, carIdx) => (
                            <div
                              key={car.id}
                              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    car.carData?.image ||
                                    "https://via.placeholder.com/60x40"
                                  }
                                  alt={
                                    car.carData?.name?.en ||
                                    car.carData?.title ||
                                    `Car ${carIdx + 1}`
                                  }
                                  className="w-[60px] h-[40px] object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://via.placeholder.com/60x40";
                                  }}
                                />
                                <div>
                                  <p className="text-sm font-semibold mb-0">
                                    {car.carData?.name?.en ||
                                      car.carData?.title ||
                                      `Car ${carIdx + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500 mb-0">
                                    Capacity:{" "}
                                    {parseInt(
                                      car.carData?.capacity ||
                                        car.carData?.max_people ||
                                        0
                                    )}{" "}
                                    seats
                                    {car.withDriver && " (1 seat for driver)"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => toggleDriver(car.id)}
                                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                                    car.withDriver
                                      ? "bg-[#295557] text-white border-[#295557]"
                                      : "bg-white text-gray-600 border-gray-300 hover:border-[#295557]"
                                  }`}
                                >
                                  <FaUserTie size={10} />
                                  Driver
                                </button>

                                <button
                                  type="button"
                                  onClick={() => removeCar(car.id)}
                                  className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-sm"
                                >
                                  &times;
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar cards-container-parent">
                        {dayData.transfers?.length > 0 ? (
                          dayData.transfers.map((item) => (
                            <div
                              key={item.tour_car_id || item.car_id || item.id}
                              className="flex-shrink-0 relative"
                              style={{ minWidth: "280px", height: "420px" }}
                            >
                              <TransferCard
                                item={item}
                                index={index}
                                activeTransfers={{}}
                                handleTransferClick={() => addCar(item)}
                                calculatePriceDifference={(
                                  selectedPrice,
                                  defaultPrice
                                ) =>
                                  defaultPrice - (selectedPrice || defaultPrice)
                                }
                              />

                              <button
                                type="button"
                                onClick={() => addCar(item)}
                                disabled={isMaxCarsReached}
                                className={`absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full shadow-lg transition-colors ${
                                  isMaxCarsReached
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-[#295557] text-white hover:bg-[#1e3e40]"
                                }`}
                                title={
                                  isMaxCarsReached
                                    ? `Maximum ${numAdults} cars allowed`
                                    : "Add this car"
                                }
                              >
                                <FaPlus size={12} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="w-full text-center py-6 text-gray-300 text-sm">
                            No transfer options
                          </div>
                        )}
                      </div>
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
                            key={
                              item.tour_activity_id ||
                              item.activity_id ||
                              item.id
                            }
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

// ─── MAIN MODAL ───────────────────────────────────────────────────────────────

const EditTourBookingModal = ({
  open,
  onClose,
  onSaved,
  data,
  tourId: propTourId,
}) => {
  const dispatch = useDispatch();

  const rootState = useSelector((state) => state);
  const reservationState = useSelector((state) => state.tourReservation);
  const priceDetails = useSelector(selectPriceDetails);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [tourDetails, setTourDetails] = useState(null);
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [activeAccommodations, setActiveAccommodations] = useState({});
  const [selectedCarsPerDay, setSelectedCarsPerDay] = useState({});
  const [initialRoomsPerDay, setInitialRoomsPerDay] = useState({});

  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (open) {
      dispatch(setDisableLocalStorageSync(true));
    } else {
      dispatch(setDisableLocalStorageSync(false));
    }
    return () => {
      dispatch(setDisableLocalStorageSync(false));
    };
  }, [open, dispatch]);

  const fetchTourDetails = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${base_url}/user/tours/tour_details.php`,
        { id: String(id) },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === "success" && response.data.message?.[0]) {
        const tour = normalizeTourOptions(response.data.message[0]);
        setTourDetails(tour);
        return tour;
      }

      throw new Error(response.data.message || "Failed to fetch tour details");
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

  const hydrateReservationIntoNewSystem = useCallback(
    (fullTour, reservationData, reservedTourSnapshot = null) => {
      if (!fullTour?.itinerary?.length) return;

      const reservation = reservationData || {};

      const snapshotByDay = Object.fromEntries(
        (reservedTourSnapshot?.itinerary || []).map((day) => [
          String(day.day),
          day,
        ])
      );

      const numAdults = parseInt(
        reservation.num_adults || reservation.numAdults || 1
      );
      const numChildren = parseInt(
        reservation.num_children || reservation.numChildren || 0
      );

      const parsedStart =
        parseDateString(reservation.start_date || reservation.startDate) ||
        (() => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return today;
        })();

      const computedEnd = buildEndDate(parsedStart, fullTour.itinerary.length);

      const reservedHotels = parseHotelsPerDay(reservation.day_hotel || "");
      const reservedCars = parseCarsPerDay(reservation.day_car || "");
      const reservedActivities = parseActivitiesPerDay(
        reservation.day_activities || ""
      );
      const reservedGuides = parseGuidesPerDay(
        reservation.day_tour_guide || reservation.dayTourGuide || ""
      );

      dispatch(clearCurrentTourData());
      dispatch(setTourData(fullTour));
      dispatch(
        setPeopleCount({ adults: numAdults, children: numChildren, infants: 0 })
      );
      dispatch(
        setTourInfo({
          startDate: formatDateLocal(parsedStart),
          endDate: formatDateLocal(computedEnd),
          numAdults,
          numChildren,
          numInfants: 0,
        })
      );

      setAdults(numAdults);
      setChildrenCount(numChildren);
      setStartDate(parsedStart);
      setEndDate(computedEnd);

      dispatch(initializeTourGuide(fullTour.itinerary));

      fullTour.itinerary.forEach((day) => {
        const dayNum = String(day.day);
        const isGuideAvailable =
          day.isTourguide === "1" || day.isTourguide === 1;
        if (!isGuideAvailable) return;
        if (reservedGuides[dayNum] === false) {
          dispatch(toggleTourGuide(Number(dayNum)));
        }
      });

      const nextActiveHotels = {};
      const nextCarsPerDay = {};
      const nextInitialRoomsPerDay = {};

      fullTour.itinerary.forEach((day, index) => {
        const dayNum = String(day.day);
        const snapshotDay = snapshotByDay[dayNum] || {};

        const hotelOptions = Array.isArray(day.hotel_options)
          ? day.hotel_options
          : [];
        const reservedHotelId =
          reservedHotels[dayNum] || snapshotDay?.hotel_reserved?.id;

        let mappedHotel = null;

        if (hotelOptions.length > 0) {
          let hotelRaw = null;

          if (reservedHotelId) {
            hotelRaw = hotelOptions.find(
              (h) => String(h.hotel_id) === String(reservedHotelId)
            );
          }

          if (!hotelRaw) hotelRaw = hotelOptions[0];

          if (hotelRaw) {
            mappedHotel = mapHotelFromAPI(hotelRaw);
            nextActiveHotels[index] = mappedHotel;
            dispatch(selectHotel({ day: Number(dayNum), hotel: mappedHotel }));

            const snapshotRooms = Array.isArray(
              snapshotDay?.hotel_reserved?.rooms
            )
              ? snapshotDay.hotel_reserved.rooms
              : [];

            const normalizedRooms = normalizeRoomsFromBackend(snapshotRooms);

            if (normalizedRooms.length > 0) {
              nextInitialRoomsPerDay[dayNum] = normalizedRooms;
              dispatch(
                setDayRooms({
                  day: Number(dayNum),
                  hotelId: mappedHotel.id || mappedHotel.hotel_id,
                  rooms: snapshotRooms.map((room) => ({
                    adults: Number(room.adults || 0),
                    kids: Number(room.kids || 0),
                    babies: Number(room.babies || 0),
                  })),
                })
              );
            } else {
              dispatch(
                setDayRooms({
                  day: Number(dayNum),
                  hotelId: mappedHotel.id || mappedHotel.hotel_id,
                  rooms: [],
                })
              );
            }
          }
        }

        const carOptions = Array.isArray(day.cars_options)
          ? day.cars_options
          : [];

        let reservedDayCars = reservedCars[dayNum] || [];

        if (!reservedDayCars.length && snapshotDay?.car_reserved?.id) {
          reservedDayCars = [
            { carId: String(snapshotDay.car_reserved.id), withDriver: false },
          ];
        }

        let dayCarsToRestore = [];

        if (carOptions.length > 0) {
          if (reservedDayCars.length > 0) {
            reservedDayCars.forEach(({ carId, withDriver }, idx) => {
              const matchedCar = carOptions.find(
                (car) => String(car.car_id) === String(carId)
              );
              if (matchedCar) {
                dayCarsToRestore.push({
                  id: `restored-${dayNum}-${carId}-${idx}-${Date.now()}`,
                  carData: mapCarFromAPI(matchedCar),
                  withDriver: !!withDriver,
                });
              }
            });
          }

          if (!dayCarsToRestore.length && carOptions[0]) {
            dayCarsToRestore = [
              {
                id: `default-${dayNum}-0-${Date.now()}`,
                carData: mapCarFromAPI(carOptions[0]),
                withDriver: false,
              },
            ];
          }

          dayCarsToRestore = dayCarsToRestore.slice(0, numAdults);
          nextCarsPerDay[dayNum] = dayCarsToRestore;

          dispatch(
            setDayCars({
              day: Number(dayNum),
              cars: dayCarsToRestore.map((car) => ({
                id: car.carData?.id || car.carData?.car_id,
                car_id: car.carData?.car_id || car.carData?.id,
                title: car.carData?.title || car.carData?.name?.en,
                name: car.carData?.name,
                image: car.carData?.image,
                price_current: car.carData?.price_current || car.carData?.price,
                price: car.carData?.price || car.carData?.price_current,
                capacity:
                  car.carData?.capacity || car.carData?.max_people || "4",
                max_people:
                  car.carData?.max_people || car.carData?.capacity || "4",
                features: car.carData?.features || [],
                instanceId: String(car.id),
                withDriver: !!car.withDriver,
              })),
            })
          );
        }

        const activityOptions = Array.isArray(day.activities_options)
          ? day.activities_options
          : [];

        let reservedDayActivities = reservedActivities[dayNum] || [];

        if (
          !reservedDayActivities.length &&
          snapshotDay?.activity_reserved?.id
        ) {
          reservedDayActivities = [
            {
              actId: String(snapshotDay.activity_reserved.id),
              numAdults,
              numChildren,
            },
          ];
        }

        if (activityOptions.length > 0 && reservedDayActivities.length > 0) {
          const seen = new Set();

          reservedDayActivities.forEach(
            ({ actId, numAdults: na, numChildren: nc }) => {
              const matchedAct = activityOptions.find(
                (act) => String(act.activity_id) === String(actId)
              );
              if (!matchedAct) return;

              const dedupeKey = String(matchedAct.activity_id);
              if (seen.has(dedupeKey)) return;
              seen.add(dedupeKey);

              const forChildren =
                matchedAct.for_children === "1" ||
                matchedAct.for_children === 1;

              dispatch(
                selectActivity({
                  day: Number(dayNum),
                  activity: {
                    id: parseInt(matchedAct.activity_id),
                    activity_id: parseInt(matchedAct.activity_id),
                    tour_activity_id: matchedAct.tour_activity_id,
                    title: { en: matchedAct.title, ar: matchedAct.title },
                    name: matchedAct.title,
                    image: matchedAct.image?.split("//CAMP//")[0],
                    price: parseFloat(matchedAct.price_current || 0),
                    price_current: parseFloat(matchedAct.price_current || 0),
                    for_children: forChildren,
                    num_adults: Number(na ?? numAdults),
                    num_children: forChildren ? Number(nc ?? numChildren) : 0,
                    features: matchedAct.features || [],
                  },
                })
              );
            }
          );
        }
      });

      setActiveAccommodations(nextActiveHotels);
      setSelectedCarsPerDay(nextCarsPerDay);
      setInitialRoomsPerDay(nextInitialRoomsPerDay);

      setTimeout(() => dispatch(calculateTotal()), 150);
    },
    [dispatch]
  );

  useEffect(() => {
    if (!open || !data || hasHydratedRef.current) return;

    const reservationSource = getReservationSource(data);
    const reservedTourSnapshot = getReservedTourSnapshot(data);

    const targetTourId =
      propTourId ||
      reservationSource.tour_id ||
      reservationSource.tourId ||
      reservedTourSnapshot?.id ||
      data?.tour_id ||
      data?.tourId ||
      data?.id;

    if (!targetTourId) {
      setError("No tour ID found.");
      return;
    }

    hasHydratedRef.current = true;

    fetchTourDetails(targetTourId).then((fullTour) => {
      if (!fullTour) return;
      hydrateReservationIntoNewSystem(
        fullTour,
        reservationSource,
        reservedTourSnapshot
      );
    });
  }, [
    open,
    data,
    propTourId,
    fetchTourDetails,
    hydrateReservationIntoNewSystem,
  ]);

  useEffect(() => {
    if (!open || !tourDetails) return;

    dispatch(setPeopleCount({ adults, children: childrenCount, infants: 0 }));
    dispatch(
      setTourInfo({
        startDate: startDate ? formatDateLocal(startDate) : null,
        endDate: endDate ? formatDateLocal(endDate) : null,
        numAdults: adults,
        numChildren: childrenCount,
        numInfants: 0,
      })
    );

    const timer = setTimeout(() => dispatch(calculateTotal()), 50);
    return () => clearTimeout(timer);
  }, [open, tourDetails, adults, childrenCount, startDate, endDate, dispatch]);

  useEffect(() => {
    if (!open) {
      hasHydratedRef.current = false;
      setTourDetails(null);
      setError(null);
      setLoading(false);
      setSaving(false);
      setActiveAccommodations({});
      setSelectedCarsPerDay({});
      setInitialRoomsPerDay({});
      setCalendarOpen(false);
      setAdults(1);
      setChildrenCount(0);
      setStartDate(null);
      setEndDate(null);
    }
  }, [open]);

  useEffect(() => {
    if (adults < 1) return;

    let wasTrimmed = false;

    setSelectedCarsPerDay((prev) => {
      const next = { ...prev };

      Object.keys(next).forEach((dayKey) => {
        const cars = Array.isArray(next[dayKey]) ? next[dayKey] : [];
        if (cars.length > adults) {
          next[dayKey] = cars.slice(0, adults);
          wasTrimmed = true;
        }
      });

      return next;
    });

    if (wasTrimmed) {
      toast.error("Cars were trimmed to match the new adults count");
    }
  }, [adults]);

  const handleDateChange = useCallback(
    (selectedDate) => {
      if (
        !selectedDate ||
        !(selectedDate instanceof Date) ||
        isNaN(selectedDate.getTime())
      ) {
        return;
      }

      const duration = tourDetails?.itinerary?.length || 1;
      const nextStart = new Date(selectedDate);
      nextStart.setHours(0, 0, 0, 0);
      const nextEnd = buildEndDate(nextStart, duration);

      setStartDate(nextStart);
      setEndDate(nextEnd);
      setCalendarOpen(false);
    },
    [tourDetails]
  );

  const mappedDays = useMemo(() => {
    if (!tourDetails?.itinerary) return [];
    return tourDetails.itinerary.map((day) => ({
      day: parseInt(day.day),
      day_id: day.day_id,
      title: day.title,
      description: day.description || "",
      accommodation: (day.hotel_options || []).map(mapHotelFromAPI),
      transfers: (day.cars_options || []).map(mapCarFromAPI),
      activities: (day.activities_options || []).map(mapActivityFromAPI),
    }));
  }, [tourDetails]);

  const totalPrice = useMemo(
    () => Number(priceDetails?.total || 0),
    [priceDetails]
  );

  const displayData =
    tourDetails ||
    getReservedTourSnapshot(data) ||
    getReservationSource(data) ||
    data;

  const maxPersons = parseInt(
    displayData?.max_persons || tourDetails?.max_persons || 20
  );
  const totalCountable = adults + childrenCount;
  const canAddMore = totalCountable < maxPersons;

  const validateChildrenNotAlone = useCallback(() => {
    for (const dayData of mappedDays) {
      const dayKey = String(dayData.day);
      const rooms = Array.isArray(
        reservationState.selectedByDay?.[dayKey]?.rooms
      )
        ? reservationState.selectedByDay[dayKey].rooms
        : [];

      const childAlone = rooms.find(
        (r) =>
          Number(r.adults || 0) === 0 && Number(r.kids ?? r.children ?? 0) > 0
      );

      if (childAlone) {
        toast.error(`Day ${dayData.day}: Children can't stay alone in a room`);
        return false;
      }
    }

    return true;
  }, [mappedDays, reservationState.selectedByDay]);

  const validateBeforeSave = useCallback(() => {
    if (!startDate) {
      toast.error("Please select a start date");
      return false;
    }

    if (!endDate) {
      toast.error("End date could not be calculated");
      return false;
    }

    if (totalCountable > maxPersons) {
      toast.error(`Maximum ${maxPersons} travelers allowed`);
      return false;
    }

    for (const [dayKey, cars] of Object.entries(selectedCarsPerDay)) {
      if ((cars || []).length > adults) {
        toast.error(
          `Day ${dayKey}: Selected cars (${cars.length}) exceed adults count (${adults})`
        );
        return false;
      }
    }

    const carsValidation = validateCarsForAllDays(rootState);
    if (!carsValidation.isValid) {
      const firstError = carsValidation.errors[0];

      if (firstError?.type === "no_cars") {
        toast.error(`Day ${firstError.day}: No cars selected`);
      } else {
        toast.error(
          `Day ${firstError.day}: Car capacity (${firstError.totalCapacity}) is less than passengers (${firstError.requiredSeats})`
        );
      }

      return false;
    }

    if (adults + childrenCount > 2) {
      const roomsValidation = validateRoomsForAllDays(rootState);

      if (!roomsValidation.isValid) {
        const firstError = roomsValidation.errors[0];
        toast.error(
          `Day ${firstError.day}: ${firstError.assigned}/${firstError.required} travelers assigned to rooms. Please distribute rooms first.`
        );
        return false;
      }

      if (!validateChildrenNotAlone()) {
        return false;
      }
    }

    return true;
  }, [
    startDate,
    endDate,
    totalCountable,
    maxPersons,
    selectedCarsPerDay,
    adults,
    childrenCount,
    rootState,
    validateChildrenNotAlone,
  ]);

  const handleSave = async () => {
    if (!validateBeforeSave()) return;

    const reservationSource = getReservationSource(data);
    const reservationId =
      reservationSource?.reservation_id ||
      reservationSource?.reservationId ||
      reservationSource?.id;

    if (!reservationId) {
      toast.error("Reservation ID not found");
      return;
    }

    try {
      setSaving(true);

      const formattedPayload = formatReservationForAPI(reservationState);
      const payload = {
        reservation_id: String(reservationId),
        ...formattedPayload,
      };

      const response = await axios.post(
        `${base_url}/user/tours/update_tour.php`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === "success" || response.data.success) {
        toast.success("Booking updated successfully! 🎉");
        if (typeof onSaved === "function") {
          onSaved();
        } else {
          onClose();
        }
      } else {
        throw new Error(response.data.message || "Failed to update booking");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to save changes"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={900}
      className="edit-tour-modal"
      styles={{
        body: { padding: 0 },
        content: { borderRadius: 16, overflow: "hidden", padding: 0 },
      }}
      title={null}
      footer={null}
      closeIcon={null}
      destroyOnClose
      maskClosable={!saving}
      closable={!saving}
    >
      <div className="flex flex-col h-[90vh]">
        <div className="relative h-40 shrink-0 overflow-hidden">
          <img
            src={
              displayData?.background_image ||
              displayData?.backgroundImage ||
              displayData?.image ||
              "https://via.placeholder.com/1200x400"
            }
            alt={displayData?.title || "Tour"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

          <div className="absolute bottom-4 left-5 right-5">
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
              {displayData?.title || "Tour"}
            </h3>
            <div className="flex gap-3 text-[11px] text-white/70">
              {displayData?.duration && (
                <span className="flex items-center gap-1">
                  <FiClock size={11} /> {displayData.duration}
                </span>
              )}
              {displayData?.route && (
                <span className="flex items-center gap-1">
                  <FiMapPin size={11} />
                  {String(displayData.route).split("-")[0]?.trim()}
                </span>
              )}
            </div>
          </div>
        </div>

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
              <button
                onClick={() => {
                  const reservationSource = getReservationSource(data);
                  const reservedTourSnapshot = getReservedTourSnapshot(data);
                  const targetTourId =
                    propTourId ||
                    reservationSource.tour_id ||
                    reservedTourSnapshot?.id ||
                    data?.tour_id ||
                    data?.id;

                  if (!targetTourId) return;

                  hasHydratedRef.current = false;

                  fetchTourDetails(targetTourId).then((fullTour) => {
                    if (!fullTour) return;
                    hydrateReservationIntoNewSystem(
                      fullTour,
                      reservationSource,
                      reservedTourSnapshot
                    );
                  });
                }}
                className="rounded-lg bg-[#295557] text-white px-4 py-2 text-sm hover:bg-[#1e3d3f] transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="p-5 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#295557] rounded-full" />
                  <h4 className="text-sm font-bold text-gray-800 mb-0">
                    Booking Configuration
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Travel Dates
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setCalendarOpen((p) => !p)}
                        className="w-full flex items-center justify-between px-3 h-10 rounded-xl border border-gray-200 bg-white hover:border-[#295557] transition-colors text-sm"
                      >
                        <span className="truncate text-gray-700">
                          {startDate && endDate
                            ? `${formatDateLocal(startDate)} → ${formatDateLocal(endDate)}`
                            : "Select start date"}
                        </span>
                        <FiChevronDown
                          size={14}
                          className={`transition-transform ${calendarOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {calendarOpen && (
                        <div className="absolute top-full left-0 mt-2 z-50 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                          <div className="p-2">
                            <Calendar
                              onChange={handleDateChange}
                              value={startDate}
                              minDate={new Date()}
                            />
                          </div>
                          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500">
                            End date synced with itinerary ({mappedDays.length}{" "}
                            day{mappedDays.length !== 1 ? "s" : ""})
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Travelers
                      {maxPersons < 9999 && (
                        <span className="ml-1 font-normal text-gray-400">
                          (max {maxPersons})
                        </span>
                      )}
                    </label>

                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center justify-between bg-[#f8f9fb] border border-gray-100 rounded-xl px-3 h-10">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <FiUser size={13} /> Adults
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAdults((p) => Math.max(1, p - 1))}
                            disabled={adults <= 1}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#295557] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <FaMinus size={9} />
                          </button>
                          <span className="w-5 text-center text-sm font-semibold">
                            {adults}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (!canAddMore) {
                                toast.error(
                                  `Maximum ${maxPersons} travelers allowed`
                                );
                                return;
                              }
                              setAdults((p) => p + 1);
                            }}
                            disabled={!canAddMore}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#295557] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <FaPlus size={9} />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 flex items-center justify-between bg-[#f8f9fb] border border-gray-100 rounded-xl px-3 h-10">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                          <FiUsers size={13} /> Children
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setChildrenCount((p) => Math.max(0, p - 1))
                            }
                            disabled={childrenCount <= 0}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#295557] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <FaMinus size={9} />
                          </button>
                          <span className="w-5 text-center text-sm font-semibold">
                            {childrenCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (!canAddMore) {
                                toast.error(
                                  `Maximum ${maxPersons} travelers allowed`
                                );
                                return;
                              }
                              setChildrenCount((p) => p + 1);
                            }}
                            disabled={!canAddMore}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#295557] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <FaPlus size={9} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500 mb-0">
                      {totalCountable}/{maxPersons} travelers
                    </p>
                  </div>
                </div>
              </div>

              {mappedDays.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#295557] rounded-full" />
                      <h4 className="text-sm font-bold text-gray-800 mb-0">
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
                    {mappedDays.map((dayData, index) => {
                      const dayNum = String(dayData.day);
                      return (
                        <EditDayCard
                          key={dayData.day_id || index}
                          dayData={dayData}
                          index={index}
                          people={{
                            adults,
                            children: childrenCount,
                            infants: 0,
                          }}
                          activeAccommodations={activeAccommodations}
                          setActiveAccommodations={setActiveAccommodations}
                          selectedCarsPerDay={selectedCarsPerDay}
                          setSelectedCarsPerDay={setSelectedCarsPerDay}
                          initialRooms={initialRoomsPerDay[dayNum] || []}
                        />
                      );
                    })}
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

        {!loading && !error && (
          <div className="shrink-0 bg-white border-t border-gray-100 px-5 py-3 flex items-center justify-between">
            <div>
              {totalPrice > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase mb-0">
                    Estimated Total
                  </p>
                  <p className="text-lg font-bold text-[#295557] mb-0">
                    ${totalPrice.toFixed(0)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={saving}
                className="rounded-xl px-6 h-10 border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#295557] text-white hover:bg-[#1e3d3f] rounded-xl px-8 h-10 font-medium shadow-sm text-sm transition-colors disabled:opacity-50"
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
