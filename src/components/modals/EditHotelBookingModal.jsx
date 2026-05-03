"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Modal } from "antd";
import axios from "axios";
import toast from "react-hot-toast";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiHome,
  FiMapPin,
  FiMinus,
  FiPlus,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { MdHotel } from "react-icons/md";
import { base_url } from "@/uitils/base_url";

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const splitCampImage = (value) => {
  if (!value || typeof value !== "string") return "";
  return value.split("//CAMP//")[0] || value;
};

const parseDateInput = (value) => {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (typeof value !== "string") return null;
  const clean = value.includes("T") ? value.split("T")[0] : value;
  const [year, month, day] = clean.split("-").map(Number);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateInput = (value) => {
  const date = parseDateInput(value);
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const addDaysToDateString = (dateString, daysToAdd) => {
  const base = parseDateInput(dateString);
  if (!base) return "";
  const next = new Date(base);
  next.setDate(next.getDate() + Math.max(toNumber(daysToAdd, 0), 0));
  return formatDateInput(next);
};

const getNightsBetween = (startDate, endDate) => {
  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate);
  if (!start || !end) return 0;
  const diff = end.getTime() - start.getTime();
  return Math.max(Math.round(diff / (1000 * 60 * 60 * 24)), 0);
};

const formatDisplayDate = (value) => {
  const date = parseDateInput(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatMoney = (value) => {
  const amount = toNumber(value, 0);
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getStoredUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return String(user?.id || user?._id || "");
  } catch {
    return "";
  }
};

const pickText = (...values) => {
  for (const value of values) {
    if (!value) continue;
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "object") {
      const nested =
        value?.en ||
        value?.ar ||
        value?.title ||
        value?.name ||
        value?.label ||
        value?.value;
      if (typeof nested === "string" && nested.trim()) return nested.trim();
    }
  }
  return "";
};

const getReservationSource = (data) => {
  if (data?.reservation) return data.reservation;
  if (data?._rawApiItem?.reservation) return data._rawApiItem.reservation;
  if (data?._rawApiItem) return data._rawApiItem;
  return data || {};
};

const getHotelSource = (data) => {
  if (data?.hotel_details) return data.hotel_details;
  if (data?._rawApiItem?.hotel_details) return data._rawApiItem.hotel_details;
  if (data?.hotel) return data.hotel;
  if (data?._rawApiItem?.hotel) return data._rawApiItem.hotel;
  return null;
};

const createLocalRoomId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeIncomingRooms = (rooms = []) => {
  if (!Array.isArray(rooms) || rooms.length === 0) return [];
  return rooms.map((room) => ({
    localId: createLocalRoomId(),
    room_id: room?.room_id || room?.id || null,
    adults: Math.max(1, toNumber(room?.adults, 1)),
    kids: Math.max(0, toNumber(room?.kids ?? room?.children, 0)),
    babies: Math.max(0, toNumber(room?.babies ?? room?.infants, 0)),
  }));
};

const sumRooms = (rooms = []) =>
  rooms.reduce(
    (acc, room) => ({
      adults: acc.adults + toNumber(room?.adults, 0),
      kids: acc.kids + toNumber(room?.kids, 0),
      babies: acc.babies + toNumber(room?.babies, 0),
    }),
    { adults: 0, kids: 0, babies: 0 }
  );

const reconcileRoomsAfterTravelerChange = (
  currentRooms,
  newAdults,
  newKids,
  newBabies
) => {
  if (currentRooms.length === 0) {
    return [
      {
        localId: createLocalRoomId(),
        room_id: null,
        adults: newAdults,
        kids: newKids,
        babies: newBabies,
      },
    ];
  }

  let rooms = currentRooms.map((r) => ({ ...r }));

  while (rooms.length > Math.max(1, newAdults)) {
    const last = rooms.pop();
    if (last) {
      rooms[0] = {
        ...rooms[0],
        adults: rooms[0].adults + last.adults,
        kids: rooms[0].kids + last.kids,
        babies: rooms[0].babies + last.babies,
      };
    }
  }

  const totalRoomAdults = rooms.reduce((s, r) => s + r.adults, 0);
  if (totalRoomAdults > newAdults) {
    let excess = totalRoomAdults - newAdults;
    for (let i = rooms.length - 1; i >= 0 && excess > 0; i--) {
      const canReduce = rooms[i].adults - 1;
      const reduce = Math.min(canReduce, excess);
      rooms[i] = { ...rooms[i], adults: rooms[i].adults - reduce };
      excess -= reduce;
    }
  }

  const totalRoomKids = rooms.reduce((s, r) => s + r.kids, 0);
  if (totalRoomKids > newKids) {
    let excess = totalRoomKids - newKids;
    for (let i = rooms.length - 1; i >= 0 && excess > 0; i--) {
      const reduce = Math.min(rooms[i].kids, excess);
      rooms[i] = { ...rooms[i], kids: rooms[i].kids - reduce };
      excess -= reduce;
    }
  }

  const totalRoomBabies = rooms.reduce((s, r) => s + r.babies, 0);
  if (totalRoomBabies > newBabies) {
    let excess = totalRoomBabies - newBabies;
    for (let i = rooms.length - 1; i >= 0 && excess > 0; i--) {
      const reduce = Math.min(rooms[i].babies, excess);
      rooms[i] = { ...rooms[i], babies: rooms[i].babies - reduce };
      excess -= reduce;
    }
  }

  return rooms;
};

/* ═══════════════════════════════════════════════════════════════════════════
   Small UI Components
   ═══════════════════════════════════════════════════════════════════════════ */

const CounterCard = ({
  label,
  icon,
  value,
  onIncrease,
  onDecrease,
  min = 0,
}) => (
  <div className="flex items-center justify-between bg-[#f8f9fb] border border-gray-100 rounded-xl px-3 h-11">
    <span className="flex items-center gap-1.5 text-xs text-gray-600">
      {icon}
      {label}
    </span>
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onDecrease}
        disabled={value <= min}
        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#295557] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FiMinus size={12} />
      </button>
      <span className="w-6 text-center text-sm font-semibold text-gray-800">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#295557] transition-colors"
      >
        <FiPlus size={12} />
      </button>
    </div>
  </div>
);

const RoomCounter = ({
  label,
  value,
  onIncrease,
  onDecrease,
  min = 0,
  disabledIncrease = false,
}) => (
  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-2">
    <span className="text-xs font-medium text-gray-600">{label}</span>
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onDecrease}
        disabled={value <= min}
        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#295557] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FiMinus size={11} />
      </button>
      <span className="w-5 text-center text-sm font-semibold text-gray-800">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabledIncrease}
        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-[#295557] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FiPlus size={11} />
      </button>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   Calendar Picker Component
   ═══════════════════════════════════════════════════════════════════════════ */

const CalendarPicker = ({ label, value, minDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const dateObj = parseDateInput(value);
  const minDateObj = parseDateInput(minDate) || new Date();

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative" ref={wrapperRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full h-11 rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-left text-sm text-gray-700 outline-none hover:border-[#295557] focus:border-[#295557] transition-colors"
        >
          <FiCalendar
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#295557]"
            size={15}
          />
          <span className={dateObj ? "text-gray-800" : "text-gray-400"}>
            {dateObj
              ? formatDisplayDate(value)
              : `Select ${label.toLowerCase()}`}
          </span>
        </button>

        {isOpen && (
          <div className="ehbm-calendar-dropdown absolute top-full left-0 mt-2 z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#295557]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {label}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <FiX size={12} />
              </button>
            </div>

            <Calendar
              value={dateObj || null}
              minDate={minDateObj}
              onChange={(date) => {
                onChange(formatDateInput(date));
                setIsOpen(false);
              }}
              locale="en-US"
              next2Label={null}
              prev2Label={null}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

const EditHotelBookingModal = ({ open, onClose, onSaved, data }) => {
  const [saving, setSaving] = useState(false);

  const [userId, setUserId] = useState("");
  const [reservationId, setReservationId] = useState("");
  const [hotelId, setHotelId] = useState("");

  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [babies, setBabies] = useState(0);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [rooms, setRooms] = useState([]);

  const preservedAdditionalServicesRef = useRef("");
  const preservedInviteCodeRef = useRef("");
  const fallbackTotalRef = useRef(0);
  const initialHydratedRef = useRef(false);

  const reservationSource = useMemo(() => getReservationSource(data), [data]);
  const hotelSource = useMemo(() => getHotelSource(data), [data]);

  console.log(hotelSource, "hotelSource");

  const hotelTitle = useMemo(
    () =>
      pickText(
        hotelSource?.title,
        hotelSource?.name,
        data?.title,
        data?.hotel_name,
        data?.name
      ) || "Hotel Booking",
    [hotelSource, data]
  );

  const hotelImage = useMemo(
    () =>
      splitCampImage(
        hotelSource?.background_image ||
          hotelSource?.backgroundImage ||
          hotelSource?.image ||
          data?.backgroundImage ||
          data?.background_image ||
          data?.image
      ) || "https://via.placeholder.com/1200x400",
    [hotelSource, data]
  );

  const hotelLocation = useMemo(
    () =>
      pickText(
        hotelSource?.location,
        hotelSource?.city,
        hotelSource?.address,
        data?.location,
        data?.city,
        data?.mainLocations?.[0]
      ),
    [hotelSource, data]
  );

  const perRoomMax = useMemo(
    () =>
      Math.max(1, toNumber(hotelSource?.per_room || data?.per_room || 4, 4)),
    [hotelSource, data]
  );

  const adultPrice = useMemo(
    () =>
      toNumber(
        hotelSource?.adult_price ||
          data?.adult_price ||
          hotelSource?.price_current ||
          data?.price_current ||
          0,
        0
      ),
    [hotelSource, data]
  );

  const childPrice = useMemo(
    () => toNumber(hotelSource?.child_price || data?.child_price || 0, 0),
    [hotelSource, data]
  );

  const maxPersons = useMemo(
    () =>
      toNumber(
        hotelSource?.max_persons ||
          hotelSource?.maxPersons ||
          data?.max_persons ||
          data?.maxPersons ||
          50,
        50
      ),
    [hotelSource, data]
  );

  const nights = useMemo(
    () => getNightsBetween(startDate, endDate),
    [startDate, endDate]
  );

  const maxRoomsAllowed = useMemo(() => Math.max(1, adults), [adults]);

  const assignedTotals = useMemo(() => sumRooms(rooms), [rooms]);

  const estimatedTotal = useMemo(() => {
    if (nights > 0) {
      const calculated = (adults * adultPrice + kids * childPrice) * nights;
      if (calculated > 0) return Number(calculated.toFixed(2));
    }
    return Number(toNumber(fallbackTotalRef.current, 0).toFixed(2));
  }, [nights, adults, kids, adultPrice, childPrice]);

  const canAddRoom = useMemo(() => {
    if (rooms.length >= maxRoomsAllowed) return false;
    const unassignedAdults = adults - assignedTotals.adults;
    return unassignedAdults >= 1;
  }, [rooms.length, maxRoomsAllowed, adults, assignedTotals.adults]);

  /* ── Traveler change handlers ──────────────────────────────────────────── */

  const handleAdultsChange = useCallback(
    (newVal) => {
      const next = Math.max(1, newVal);
      setAdults(next);
      setRooms((prev) =>
        reconcileRoomsAfterTravelerChange(prev, next, kids, babies)
      );
    },
    [kids, babies]
  );

  const handleKidsChange = useCallback(
    (newVal) => {
      const next = Math.max(0, newVal);
      setKids(next);
      setRooms((prev) =>
        reconcileRoomsAfterTravelerChange(prev, adults, next, babies)
      );
    },
    [adults, babies]
  );

  const handleBabiesChange = useCallback(
    (newVal) => {
      const next = Math.max(0, newVal);
      setBabies(next);
      setRooms((prev) =>
        reconcileRoomsAfterTravelerChange(prev, adults, kids, next)
      );
    },
    [adults, kids]
  );

  /* ── Date change handlers ──────────────────────────────────────────────── */

  const handleStartDateChange = useCallback(
    (newStart) => {
      setStartDate(newStart);
      if (!endDate || getNightsBetween(newStart, endDate) < 1) {
        setEndDate(addDaysToDateString(newStart, Math.max(nights, 1)));
      }
    },
    [endDate, nights]
  );

  const handleEndDateChange = useCallback((newEnd) => {
    setEndDate(newEnd);
  }, []);

  /* ── Hydration ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!open) {
      initialHydratedRef.current = false;
      return;
    }

    if (initialHydratedRef.current) return;
    initialHydratedRef.current = true;

    const incomingRoomsRaw =
      reservationSource?.rooms || hotelSource?.rooms || data?.rooms || [];

    const normalizedRooms = normalizeIncomingRooms(incomingRoomsRaw);
    const roomTotals = sumRooms(normalizedRooms);

    const nextAdults =
      normalizedRooms.length > 0 && roomTotals.adults > 0
        ? roomTotals.adults
        : Math.max(
            1,
            toNumber(
              reservationSource?.adults ||
                reservationSource?.num_adults ||
                reservationSource?.adults_num ||
                data?.adults ||
                data?.adults_num ||
                data?.numAdults ||
                1,
              1
            )
          );

    const nextKids =
      normalizedRooms.length > 0
        ? roomTotals.kids
        : Math.max(
            0,
            toNumber(
              reservationSource?.kids ||
                reservationSource?.num_children ||
                data?.kids ||
                data?.numChildren ||
                0,
              0
            )
          );

    const nextBabies =
      normalizedRooms.length > 0
        ? roomTotals.babies
        : Math.max(
            0,
            toNumber(
              reservationSource?.babies ||
                reservationSource?.num_infants ||
                data?.babies ||
                data?.numInfants ||
                data?.numBabies ||
                0,
              0
            )
          );

    const nextReservationId = String(
      reservationSource?.reservation_id ||
        reservationSource?.reserving_id ||
        reservationSource?.reservationId ||
        data?.reservation_id ||
        data?.reserving_id ||
        data?.id ||
        ""
    );

    const nextUserId = String(
      reservationSource?.user_id ||
        reservationSource?.userId ||
        data?.user_id ||
        data?.userId ||
        getStoredUserId()
    );

    const nextHotelId = String(
      reservationSource?.hotel_id ||
        reservationSource?.hotelId ||
        hotelSource?.hotel_id ||
        hotelSource?.id ||
        data?.hotel_id ||
        data?.hotelId ||
        data?.id ||
        ""
    );

    const nextStartDate = formatDateInput(
      reservationSource?.start_date ||
        reservationSource?.startDate ||
        data?.start_date ||
        data?.startDate
    );

    const fallbackDays = Math.max(
      1,
      toNumber(
        reservationSource?.day || reservationSource?.days || data?.day || 1,
        1
      )
    );

    const nextEndDate =
      formatDateInput(
        reservationSource?.end_date ||
          reservationSource?.endDate ||
          data?.end_date ||
          data?.endDate
      ) ||
      (nextStartDate ? addDaysToDateString(nextStartDate, fallbackDays) : "");

    preservedAdditionalServicesRef.current = String(
      reservationSource?.aditional_services ||
        reservationSource?.additional_services ||
        data?.aditional_services ||
        data?.additional_services ||
        ""
    );

    preservedInviteCodeRef.current = String(
      reservationSource?.invite_code ||
        reservationSource?.inviteCode ||
        data?.invite_code ||
        data?.inviteCode ||
        ""
    );

    fallbackTotalRef.current = toNumber(
      reservationSource?.total_amount || data?.total_amount || data?.price || 0,
      0
    );

    setReservationId(nextReservationId);
    setUserId(nextUserId);
    setHotelId(nextHotelId);
    setAdults(nextAdults);
    setKids(nextKids);
    setBabies(nextBabies);
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);

    if (normalizedRooms.length > 0) {
      setRooms(normalizedRooms);
    } else {
      setRooms([
        {
          localId: createLocalRoomId(),
          room_id: null,
          adults: nextAdults,
          kids: nextKids,
          babies: nextBabies,
        },
      ]);
    }
  }, [open, data, reservationSource, hotelSource]);

  /* ── Cancel ────────────────────────────────────────────────────────────── */

  const handleCancel = useCallback(() => {
    if (saving) return;
    onClose?.();
  }, [saving, onClose]);

  /* ── Add room ──────────────────────────────────────────────────────────── */

  const handleAddRoom = useCallback(() => {
    if (!canAddRoom) {
      if (rooms.length >= maxRoomsAllowed) {
        toast.error(`Maximum ${maxRoomsAllowed} rooms allowed (1 per adult)`);
      } else {
        toast.error(
          "All adults are already distributed. Increase adults count first, then add a new room."
        );
      }
      return;
    }

    setRooms((prev) => [
      ...prev,
      {
        localId: createLocalRoomId(),
        room_id: null,
        adults: 1,
        kids: 0,
        babies: 0,
      },
    ]);
  }, [canAddRoom, rooms.length, maxRoomsAllowed]);

  /* ── Remove room ───────────────────────────────────────────────────────── */

  const handleRemoveRoom = useCallback((roomLocalId) => {
    setRooms((prev) => {
      if (prev.length <= 1) {
        toast.error("At least 1 room is required");
        return prev;
      }

      const removedRoom = prev.find((r) => r.localId === roomLocalId);
      const remaining = prev.filter((r) => r.localId !== roomLocalId);

      if (!removedRoom) return remaining;

      return remaining.map((room, idx) => {
        if (idx === 0) {
          return {
            ...room,
            adults: room.adults + (removedRoom.adults || 0),
            kids: room.kids + (removedRoom.kids || 0),
            babies: room.babies + (removedRoom.babies || 0),
          };
        }
        return room;
      });
    });
  }, []);

  /* ── Room value change ─────────────────────────────────────────────────── */

  const handleRoomValueChange = useCallback(
    (roomLocalId, field, action) => {
      setRooms((prev) => {
        const totals = sumRooms(prev);

        return prev.map((room) => {
          if (room.localId !== roomLocalId) return room;

          if (action === "increase") {
            if (field === "adults") {
              if (totals.adults >= adults) {
                toast.error("All adults are already assigned to rooms");
                return room;
              }
              if (room.adults + room.kids >= perRoomMax) {
                toast.error(`Maximum ${perRoomMax} persons in this room`);
                return room;
              }
              return { ...room, adults: room.adults + 1 };
            }

            if (field === "kids") {
              if (totals.kids >= kids) {
                toast.error("All children are already assigned to rooms");
                return room;
              }
              if (room.adults + room.kids >= perRoomMax) {
                toast.error(`Maximum ${perRoomMax} persons in this room`);
                return room;
              }
              return { ...room, kids: room.kids + 1 };
            }

            if (field === "babies") {
              if (totals.babies >= babies) {
                toast.error("All babies are already assigned to rooms");
                return room;
              }
              return { ...room, babies: room.babies + 1 };
            }
          }

          if (action === "decrease") {
            if (field === "adults") {
              if (room.adults <= 1) {
                toast.error("Each room must have at least 1 adult");
                return room;
              }
              return { ...room, adults: room.adults - 1 };
            }

            if (field === "kids") {
              if (room.kids <= 0) return room;
              return { ...room, kids: room.kids - 1 };
            }

            if (field === "babies") {
              if (room.babies <= 0) return room;
              return { ...room, babies: room.babies - 1 };
            }
          }

          return room;
        });
      });
    },
    [adults, kids, babies, perRoomMax]
  );

  /* ── Validate ──────────────────────────────────────────────────────────── */

  const validateBeforeSave = useCallback(() => {
    if (!reservationId) {
      toast.error("Reservation ID not found");
      return false;
    }
    if (!hotelId) {
      toast.error("Hotel ID not found");
      return false;
    }
    if (!userId) {
      toast.error("User ID not found");
      return false;
    }
    if (!startDate) {
      toast.error("Please select a check-in date");
      return false;
    }
    if (!endDate) {
      toast.error("Please select a check-out date");
      return false;
    }
    if (nights < 1) {
      toast.error("Check-out date must be after check-in date");
      return false;
    }
    if (adults < 1) {
      toast.error("At least 1 adult is required");
      return false;
    }
    if (adults + kids + babies > maxPersons) {
      toast.error(`Maximum ${maxPersons} travelers allowed`);
      return false;
    }

    const totals = sumRooms(rooms);

    if (totals.adults !== adults) {
      toast.error(
        `Adults in rooms (${totals.adults}) must equal total adults (${adults}). Please adjust room distribution.`
      );
      return false;
    }
    if (totals.kids !== kids) {
      toast.error(
        `Children in rooms (${totals.kids}) must equal total children (${kids}). Please adjust room distribution.`
      );
      return false;
    }
    if (totals.babies !== babies) {
      toast.error(
        `Babies in rooms (${totals.babies}) must equal total babies (${babies}). Please adjust room distribution.`
      );
      return false;
    }

    const invalidRoom = rooms.find(
      (room) =>
        toNumber(room.adults, 0) < 1 ||
        toNumber(room.adults, 0) + toNumber(room.kids, 0) > perRoomMax
    );

    if (invalidRoom) {
      toast.error(
        `Each room must have at least 1 adult and max ${perRoomMax} persons`
      );
      return false;
    }

    return true;
  }, [
    reservationId,
    hotelId,
    userId,
    startDate,
    endDate,
    nights,
    adults,
    kids,
    babies,
    maxPersons,
    rooms,
    perRoomMax,
  ]);

  /* ── Save ──────────────────────────────────────────────────────────────── */

  const handleSave = useCallback(async () => {
    if (!validateBeforeSave()) return;

    try {
      setSaving(true);

      const payload = {
        reservation_id: String(reservationId),
        user_id: String(userId),
        hotel_id: String(hotelId),
        aditional_services: preservedAdditionalServicesRef.current || "",
        total_amount: Number(estimatedTotal || 0).toFixed(2),
        start_date: startDate,
        end_date: endDate,
        invite_code: preservedInviteCodeRef.current || "",
        day: String(nights),
        adults: String(adults),
        kids: String(kids),
        babies: String(babies),
        rooms: rooms.map((room) => ({
          ...(room.room_id ? { room_id: room.room_id } : {}),
          adults: Number(room.adults),
          kids: Number(room.kids),
          babies: Number(room.babies),
        })),
      };

      const response = await axios.post(
        `${base_url}/user/hotels/update_hotel.php`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response?.data?.status === "success" || response?.data?.success) {
        toast.success(
          response?.data?.message || "Hotel booking updated successfully! 🎉"
        );
        onSaved?.(response.data, payload);
        return;
      }

      throw new Error(
        response?.data?.message || "Failed to update hotel booking"
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update hotel booking"
      );
    } finally {
      setSaving(false);
    }
  }, [
    validateBeforeSave,
    reservationId,
    userId,
    hotelId,
    estimatedTotal,
    startDate,
    endDate,
    nights,
    adults,
    kids,
    babies,
    rooms,
    onSaved,
  ]);

  /* ── Derived ───────────────────────────────────────────────────────────── */

  const allAdultsAssigned = assignedTotals.adults >= adults;
  const allKidsAssigned = assignedTotals.kids >= kids;
  const allBabiesAssigned = assignedTotals.babies >= babies;
  const allAssigned = allAdultsAssigned && allKidsAssigned && allBabiesAssigned;

  const unassignedAdults = Math.max(0, adults - assignedTotals.adults);
  const unassignedKids = Math.max(0, kids - assignedTotals.kids);
  const unassignedBabies = Math.max(0, babies - assignedTotals.babies);

  const todayStr = formatDateInput(new Date());
  const checkoutMinStr = startDate
    ? addDaysToDateString(startDate, 1)
    : todayStr;

  /* ═════════════════════════════════════════════════════════════════════════
     Render
     ═════════════════════════════════════════════════════════════════════════ */

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      width={940}
      title={null}
      footer={null}
      destroyOnClose
      maskClosable={!saving}
      closable={!saving}
      closeIcon={null}
      styles={{
        body: { padding: 0 },
        content: { borderRadius: 20, overflow: "hidden", padding: 0 },
      }}
    >
      {/* ── Scoped calendar styles ─────────────────────────────────────── */}
      <style>{`
        .ehbm-calendar-dropdown {
          width: 320px;
        }
        .ehbm-calendar-dropdown .react-calendar {
          border: none;
          width: 100%;
          font-family: inherit;
          padding: 8px;
        }
        .ehbm-calendar-dropdown .react-calendar__navigation {
          margin-bottom: 4px;
        }
        .ehbm-calendar-dropdown .react-calendar__navigation button {
          font-size: 13px;
          font-weight: 700;
          color: #295557;
          min-width: 36px;
          border-radius: 8px;
        }
        .ehbm-calendar-dropdown .react-calendar__navigation button:hover {
          background: #f0f7f7;
        }
        .ehbm-calendar-dropdown .react-calendar__navigation button:disabled {
          background: transparent;
          color: #ccc;
        }
        .ehbm-calendar-dropdown .react-calendar__month-view__weekdays {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #999;
        }
        .ehbm-calendar-dropdown .react-calendar__month-view__weekdays abbr {
          text-decoration: none;
        }
        .ehbm-calendar-dropdown .react-calendar__tile {
          font-size: 13px;
          padding: 8px 4px;
          border-radius: 10px;
          color: #333;
          transition: all 0.15s;
        }
        .ehbm-calendar-dropdown .react-calendar__tile:hover {
          background: #f0f7f7;
          color: #295557;
        }
        .ehbm-calendar-dropdown .react-calendar__tile--now {
          background: #e8a35520;
          color: #b8862d;
          font-weight: 700;
        }
        .ehbm-calendar-dropdown .react-calendar__tile--now:hover {
          background: #e8a35535;
        }
        .ehbm-calendar-dropdown .react-calendar__tile--active,
        .ehbm-calendar-dropdown .react-calendar__tile--active:enabled:hover,
        .ehbm-calendar-dropdown .react-calendar__tile--active:enabled:focus {
          background: #295557;
          color: #fff;
          font-weight: 700;
        }
        .ehbm-calendar-dropdown .react-calendar__tile:disabled {
          color: #ccc;
          background: transparent;
          cursor: not-allowed;
        }
        .ehbm-calendar-dropdown .react-calendar__month-view__days__day--neighboringMonth {
          color: #ddd;
        }
      `}</style>

      <div className="flex flex-col h-[90vh] bg-white">
        {/* ── Header Image ─────────────────────────────────────────────── */}
        <div className="relative h-44 shrink-0 overflow-hidden">
          <img
            src={hotelImage}
            alt={hotelTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/1200x400";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 bg-white text-[#295557] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              <MdHotel className="w-4 h-4" />
              Edit Hotel Booking
            </span>
          </div>

          <div className="absolute bottom-4 left-5 right-5">
            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
              {hotelTitle}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-white/75">
              {hotelLocation && (
                <span className="inline-flex items-center gap-1">
                  <FiMapPin size={12} />
                  {hotelLocation}
                </span>
              )}
              {nights > 0 && (
                <span className="inline-flex items-center gap-1">
                  <FiClock size={12} />
                  {nights} night{nights > 1 ? "s" : ""}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <FiHome size={12} />
                Max {perRoomMax} per room
              </span>
            </div>
          </div>
        </div>

        {/* ── Scrollable Content ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-[#f8f9fb] p-5 space-y-4">
          {/* ── Stay Details ───────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-[#295557] rounded-full" />
              <h4 className="text-sm font-bold text-gray-800 mb-0">
                Stay Details
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CalendarPicker
                label="Check-in"
                value={startDate}
                minDate={todayStr}
                onChange={handleStartDateChange}
              />
              <CalendarPicker
                label="Check-out"
                value={endDate}
                minDate={checkoutMinStr}
                onChange={handleEndDateChange}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#295557]/5 rounded-xl px-4 py-3 border border-[#295557]/10">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
                  Stay
                </p>
                <p className="text-sm font-bold text-[#295557] mb-0">
                  {nights > 0 ? `${nights} night${nights > 1 ? "s" : ""}` : "—"}
                </p>
              </div>
              <div className="bg-[#295557]/5 rounded-xl px-4 py-3 border border-[#295557]/10">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
                  Check-in
                </p>
                <p className="text-sm font-bold text-[#295557] mb-0">
                  {formatDisplayDate(startDate)}
                </p>
              </div>
              <div className="bg-[#295557]/5 rounded-xl px-4 py-3 border border-[#295557]/10">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
                  Check-out
                </p>
                <p className="text-sm font-bold text-[#295557] mb-0">
                  {formatDisplayDate(endDate)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Travelers ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-[#295557] rounded-full" />
              <h4 className="text-sm font-bold text-gray-800 mb-0">
                Travelers
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <CounterCard
                label="Adults"
                icon={<FiUser size={13} />}
                value={adults}
                min={1}
                onDecrease={() => handleAdultsChange(adults - 1)}
                onIncrease={() => handleAdultsChange(adults + 1)}
              />
              <CounterCard
                label="Children"
                icon={<FiUsers size={13} />}
                value={kids}
                min={0}
                onDecrease={() => handleKidsChange(kids - 1)}
                onIncrease={() => handleKidsChange(kids + 1)}
              />
              <CounterCard
                label="Babies"
                icon={<FiUsers size={13} />}
                value={babies}
                min={0}
                onDecrease={() => handleBabiesChange(babies - 1)}
                onIncrease={() => handleBabiesChange(babies + 1)}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[12px] bg-[#295557]/10 text-[#295557] px-3 py-1 rounded-full font-semibold">
                <FiUsers size={12} />
                {adults + kids + babies} travelers total
              </span>
              <span className="inline-flex items-center gap-1.5 text-[12px] bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                <FiHome size={12} />
                Up to {maxRoomsAllowed} room{maxRoomsAllowed > 1 ? "s" : ""}
              </span>
              {!allAssigned && (
                <span className="inline-flex items-center gap-1.5 text-[12px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-semibold">
                  ⚠ Distribute travelers in rooms below
                </span>
              )}
            </div>
          </div>

          {/* ── Room Distribution ──────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#295557] rounded-full" />
                <h4 className="text-sm font-bold text-gray-800 mb-0">
                  Room Distribution
                </h4>
              </div>

              <button
                type="button"
                onClick={handleAddRoom}
                disabled={!canAddRoom}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 h-10 bg-[#295557] text-white text-sm font-semibold hover:bg-[#1e3d3f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiPlus size={15} />
                Add Room
              </button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl border border-gray-100 bg-[#f8f9fb] px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                  Rooms
                </p>
                <p className="text-base font-bold text-[#295557] mb-0">
                  {rooms.length} / {maxRoomsAllowed}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-[#f8f9fb] px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                  Assigned Adults
                </p>
                <p
                  className={`text-base font-bold mb-0 ${
                    allAdultsAssigned ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {assignedTotals.adults} / {adults}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-[#f8f9fb] px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                  Assigned Children
                </p>
                <p
                  className={`text-base font-bold mb-0 ${
                    allKidsAssigned ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {assignedTotals.kids} / {kids}
                </p>
              </div>
            </div>

            {/* Room cards */}
            <div className="space-y-3">
              {rooms.map((room, idx) => {
                const occupancy = room.adults + room.kids;

                return (
                  <div
                    key={room.localId}
                    className="rounded-2xl border border-gray-100 bg-[#f8f9fb] p-4"
                  >
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div>
                        <p className="text-sm font-bold text-[#295557] mb-0">
                          Room {idx + 1}
                        </p>
                        <p
                          className={`text-[11px] mb-0 mt-1 ${
                            occupancy >= perRoomMax
                              ? "text-amber-600 font-semibold"
                              : "text-gray-400"
                          }`}
                        >
                          Occupancy: {occupancy}/{perRoomMax}
                          {occupancy >= perRoomMax && " (Full)"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveRoom(room.localId)}
                        disabled={rooms.length <= 1}
                        className="inline-flex items-center justify-center rounded-lg px-3 h-9 border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <RoomCounter
                        label="Adults"
                        value={room.adults}
                        min={1}
                        disabledIncrease={
                          allAdultsAssigned || occupancy >= perRoomMax
                        }
                        onIncrease={() =>
                          handleRoomValueChange(
                            room.localId,
                            "adults",
                            "increase"
                          )
                        }
                        onDecrease={() =>
                          handleRoomValueChange(
                            room.localId,
                            "adults",
                            "decrease"
                          )
                        }
                      />
                      <RoomCounter
                        label="Children"
                        value={room.kids}
                        min={0}
                        disabledIncrease={
                          allKidsAssigned || occupancy >= perRoomMax
                        }
                        onIncrease={() =>
                          handleRoomValueChange(
                            room.localId,
                            "kids",
                            "increase"
                          )
                        }
                        onDecrease={() =>
                          handleRoomValueChange(
                            room.localId,
                            "kids",
                            "decrease"
                          )
                        }
                      />
                      <RoomCounter
                        label="Babies"
                        value={room.babies}
                        min={0}
                        disabledIncrease={allBabiesAssigned}
                        onIncrease={() =>
                          handleRoomValueChange(
                            room.localId,
                            "babies",
                            "increase"
                          )
                        }
                        onDecrease={() =>
                          handleRoomValueChange(
                            room.localId,
                            "babies",
                            "decrease"
                          )
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Assignment status pills */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  allAdultsAssigned
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {allAdultsAssigned ? (
                  <FiCheck size={12} />
                ) : (
                  <FiMinus size={12} />
                )}
                Adults: {assignedTotals.adults}/{adults}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  allKidsAssigned
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {allKidsAssigned ? (
                  <FiCheck size={12} />
                ) : (
                  <FiMinus size={12} />
                )}
                Children: {assignedTotals.kids}/{kids}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  allBabiesAssigned
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {allBabiesAssigned ? (
                  <FiCheck size={12} />
                ) : (
                  <FiMinus size={12} />
                )}
                Babies: {assignedTotals.babies}/{babies}
              </span>
            </div>

            {/* Warning if mismatch */}
            {!allAssigned && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs text-amber-800 font-semibold mb-1">
                  ⚠ Distribution Incomplete
                </p>
                <p className="text-[11px] text-amber-700 mb-0">
                  Please make sure all travelers are assigned to rooms before
                  saving.
                  {unassignedAdults > 0 &&
                    ` ${unassignedAdults} adult(s) not assigned.`}
                  {unassignedKids > 0 &&
                    ` ${unassignedKids} child(ren) not assigned.`}
                  {unassignedBabies > 0 &&
                    ` ${unassignedBabies} baby/babies not assigned.`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="shrink-0 bg-white border-t border-gray-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
              Estimated Total
            </p>
            <p className="text-xl font-bold text-[#295557] mb-0">
              {formatMoney(estimatedTotal)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="rounded-xl px-6 h-11 border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#295557] text-white hover:bg-[#1e3d3f] rounded-xl px-8 h-11 font-semibold shadow-sm text-sm transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditHotelBookingModal;
