"use client";
import { createSlice } from "@reduxjs/toolkit";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getUserIdFromStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.id || parsed.user_id || null;
    }
    return localStorage.getItem("user_id") || null;
  } catch {
    return null;
  }
};

const extractDiscountPercentage = (offerPercentage) => {
  if (!offerPercentage) return 0;
  const match = String(offerPercentage).match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

const normalizeRoom = (room) => ({
  adults: Number(room?.adults || 0),
  kids: Number(room?.kids ?? room?.children ?? 0),
  babies: Number(room?.babies ?? room?.infants ?? 0),
});

const normalizeCar = (car, dayKey = "0", index = 0) => ({
  ...car,
  withDriver: !!car?.withDriver,
  instanceId:
    car?.instanceId ||
    `${dayKey}-${car?.id || car?.car_id || "car"}-${index}-${Date.now()}`,
});

const normalizeSelectedByDay = (selectedByDay = {}) => {
  const normalized = {};
  Object.entries(selectedByDay).forEach(([dayKey, dayData]) => {
    const current = dayData || {};
    const cars = Array.isArray(current.cars)
      ? current.cars.map((car, index) => normalizeCar(car, dayKey, index))
      : current.car
        ? [normalizeCar(current.car, dayKey, 0)]
        : [];

    normalized[String(dayKey)] = {
      ...current,
      activities: Array.isArray(current.activities) ? current.activities : [],
      cars,
      car: cars[0] || current.car || null,
      rooms: Array.isArray(current.rooms)
        ? current.rooms.map(normalizeRoom)
        : [],
    };
  });
  return normalized;
};

const normalizeTourGuideByDay = (tourGuideByDay = {}) => {
  const normalized = {};
  Object.entries(tourGuideByDay).forEach(([dayKey, guide]) => {
    normalized[String(dayKey)] = {
      isAvailable: !!guide?.isAvailable,
      isSelected: !!guide?.isSelected,
      guidePrice: parseFloat(guide?.guidePrice || 0),
    };
  });
  return normalized;
};

const ensureDayState = (state, dayKey) => {
  if (!state.selectedByDay[dayKey]) state.selectedByDay[dayKey] = {};
  if (!Array.isArray(state.selectedByDay[dayKey].activities))
    state.selectedByDay[dayKey].activities = [];
  if (!Array.isArray(state.selectedByDay[dayKey].cars))
    state.selectedByDay[dayKey].cars = [];
  if (!Array.isArray(state.selectedByDay[dayKey].rooms))
    state.selectedByDay[dayKey].rooms = [];
};

// ─── KEY FIX: Only use itinerary days, never stale selectedByDay keys ─────────
const getValidDayNumbers = (state) => {
  const itinerary = state.tourData?.itinerary || [];
  if (itinerary.length === 0) return [];
  return itinerary
    .map((d) => Number(d.day))
    .filter(Boolean)
    .sort((a, b) => a - b);
};

// ─── Sanitize: remove days that don't exist in current itinerary ──────────────
const sanitizeDaysToItinerary = (state) => {
  // لو لسه معندناش داتا الرحلة من الـ API، منقدرش نفلتر، فهنستنى لحد ما تيجي
  if (
    !state.tourData ||
    !Array.isArray(state.tourData.itinerary) ||
    state.tourData.itinerary.length === 0
  ) {
    return;
  }

  const validDays = new Set(getValidDayNumbers(state).map(String));

  // مسح أي أيام في selectedByDay مش موجودة في الرحلة الحالية
  Object.keys(state.selectedByDay).forEach((key) => {
    if (!validDays.has(key)) {
      delete state.selectedByDay[key];
    }
  });

  // مسح أي أيام في tourGuideByDay مش موجودة في الرحلة الحالية
  Object.keys(state.tourGuideByDay).forEach((key) => {
    if (!validDays.has(key)) {
      delete state.tourGuideByDay[key];
    }
  });
};

// ─── localStorage: per-tour keying ───────────────────────────────────────────
const STORAGE_KEY = "tourReservations"; // NOTE: plural now
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const loadAllReservations = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
};

const saveAllReservations = (all) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error("Error saving reservations:", err);
  }
};

const saveSelectionsToStorage = (state) => {
  if (!state.tourId) return;

  const all = loadAllReservations();

  // Prune expired entries while we're at it
  const now = Date.now();
  Object.keys(all).forEach((tid) => {
    if (all[tid]?.savedAt && now - all[tid].savedAt > ONE_DAY_MS) {
      delete all[tid];
    }
  });

  all[String(state.tourId)] = {
    tourId: state.tourId,
    startDate: state.startDate,
    endDate: state.endDate,
    numAdults: state.numAdults,
    numChildren: state.numChildren,
    numInfants: state.numInfants,
    selectedByDay: state.selectedByDay,
    tourGuideByDay: state.tourGuideByDay,
    totalAmount: state.totalAmount,
    subtotalAmount: state.subtotalAmount,
    discountPercentage: state.discountPercentage,
    savedAt: now,
  };

  saveAllReservations(all);
};

const loadSelectionsFromStorage = (tourId) => {
  if (!tourId) return null;
  const all = loadAllReservations();
  const saved = all[String(tourId)];
  if (!saved) return null;

  if (saved.savedAt && Date.now() - saved.savedAt > ONE_DAY_MS) {
    delete all[String(tourId)];
    saveAllReservations(all);
    return null;
  }

  return saved;
};

const clearAllReservationsFromStorage = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    // Also clear old single-key format if it exists
    localStorage.removeItem("tourReservation");
  } catch {
    /* ignore */
  }
};

// ─── Initial state ────────────────────────────────────────────────────────────
const initialState = {
  tourId: null,
  userId: getUserIdFromStorage(),
  startDate: null,
  endDate: null,
  numAdults: 1,
  numChildren: 0,
  numInfants: 0,
  tourData: null,
  selectedByDay: {},
  tourGuideByDay: {},
  totalAmount: 0,
  discountPercentage: 0,
  subtotalAmount: 0,
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const tourReservationSlice = createSlice({
  name: "tourReservation",
  initialState,
  reducers: {
    setTourData: (state, action) => {
      const newTourId = action.payload?.id;

      // If switching to a different tour, reset day selections first
      if (
        state.tourId &&
        newTourId &&
        String(state.tourId) !== String(newTourId)
      ) {
        state.selectedByDay = {};
        state.tourGuideByDay = {};
        state.totalAmount = 0;
        state.subtotalAmount = 0;
      }

      state.tourData = action.payload;
      state.tourId = newTourId;
      state.discountPercentage = extractDiscountPercentage(
        action.payload?.offer_percentage
      );

      // Sanitize immediately after setting tourData
      sanitizeDaysToItinerary(state);
    },

    restoreSavedSelections: (state, action) => {
      const targetTourId = action.payload;

      // 🔥 الحل الجذري: لو الـ Redux شايل داتا رحلة تانية، امسحه بالكامل قبل أي حاجة
      if (state.tourId && String(state.tourId) !== String(targetTourId)) {
        state.selectedByDay = {};
        state.tourGuideByDay = {};
        state.tourData = null;
        state.totalAmount = 0;
        state.subtotalAmount = 0;
        state.numAdults = 1;
        state.numChildren = 0;
        state.numInfants = 0;
      }

      state.tourId = targetTourId; // تثبيت الـ ID الجديد فوراً

      const saved = loadSelectionsFromStorage(targetTourId);

      // لو مفيش حاجة محفوظة للرحلة دي، اقفل على كده بذاكرة نظيفة
      if (!saved) return;

      // لو فيه داتا محفوظة، رجعها
      if (saved.selectedByDay)
        state.selectedByDay = normalizeSelectedByDay(saved.selectedByDay);
      if (saved.tourGuideByDay)
        state.tourGuideByDay = normalizeTourGuideByDay(saved.tourGuideByDay);

      if (saved.startDate) state.startDate = saved.startDate;
      if (saved.endDate) state.endDate = saved.endDate;
      if (saved.numAdults) state.numAdults = saved.numAdults;
      if (saved.numChildren !== undefined)
        state.numChildren = saved.numChildren;
      if (saved.numInfants !== undefined) state.numInfants = saved.numInfants;
      if (saved.totalAmount !== undefined)
        state.totalAmount = saved.totalAmount;
      if (saved.subtotalAmount !== undefined)
        state.subtotalAmount = saved.subtotalAmount;
      if (saved.discountPercentage !== undefined)
        state.discountPercentage = saved.discountPercentage;

      sanitizeDaysToItinerary(state);
    },

    saveSelections: (state) => {
      saveSelectionsToStorage(state);
    },

    initializeTourGuide: (state, action) => {
      const itinerary = action.payload;
      if (!Array.isArray(itinerary)) return;
      if (!state.tourGuideByDay) state.tourGuideByDay = {};

      itinerary.forEach((day) => {
        const dayNumber = String(day.day);
        const isAvailable = day.isTourguide === "1" || day.isTourguide === 1;
        const guidePrice = parseFloat(day.guide_price || 0);

        if (state.tourGuideByDay[dayNumber]) {
          state.tourGuideByDay[dayNumber].isAvailable = isAvailable;
          state.tourGuideByDay[dayNumber].guidePrice = guidePrice;
        } else {
          state.tourGuideByDay[dayNumber] = {
            isAvailable,
            isSelected: isAvailable,
            guidePrice,
          };
        }
      });

      // Remove stale guide days
      sanitizeDaysToItinerary(state);
      saveSelectionsToStorage(state);
    },

    toggleTourGuide: (state, action) => {
      const dayNumber = String(action.payload);
      if (!state.tourGuideByDay?.[dayNumber]) return;
      if (!state.tourGuideByDay[dayNumber].isAvailable) return;
      state.tourGuideByDay[dayNumber].isSelected =
        !state.tourGuideByDay[dayNumber].isSelected;
      saveSelectionsToStorage(state);
    },

    initializeActivities: (state, action) => {
      const itinerary = action.payload;
      if (!Array.isArray(itinerary)) return;

      itinerary.forEach((day) => {
        const dayKey = String(day.day);
        ensureDayState(state, dayKey);

        const hasSaved =
          Array.isArray(state.selectedByDay[dayKey].activities) &&
          state.selectedByDay[dayKey].activities.length > 0;
        if (hasSaved) return;

        const activities = day.activities_options || [];
        const seen = new Set();

        state.selectedByDay[dayKey].activities = [];

        activities.forEach((activity) => {
          const activityId = String(activity.activity_id || activity.id);
          if (!activityId || seen.has(activityId)) return;
          seen.add(activityId);

          state.selectedByDay[dayKey].activities.push({
            id: parseInt(activityId),
            activity_id: parseInt(activityId),
            tour_activity_id: activity.tour_activity_id,
            title: activity.title,
            name: activity.title,
            image:
              typeof activity.image === "string"
                ? activity.image.split("//CAMP//")[0]
                : activity.image,
            price: parseFloat(activity.price_current || activity.price || 0),
            price_current: parseFloat(
              activity.price_current || activity.price || 0
            ),
            features: activity.features || [],
          });
        });
      });

      // Remove stale day entries
      sanitizeDaysToItinerary(state);
      saveSelectionsToStorage(state);
    },

    setUserId: (state, action) => {
      state.userId = action.payload;
    },

    refreshUserId: (state) => {
      state.userId = getUserIdFromStorage();
    },

    setTourInfo: (state, action) => {
      const { userId, startDate, endDate, numAdults, numChildren, numInfants } =
        action.payload;
      if (userId !== undefined) state.userId = userId;
      if (startDate !== undefined) state.startDate = startDate;
      if (endDate !== undefined) state.endDate = endDate;
      if (numAdults !== undefined) state.numAdults = numAdults;
      if (numChildren !== undefined) state.numChildren = numChildren;
      if (numInfants !== undefined) state.numInfants = numInfants;
      saveSelectionsToStorage(state);
    },

    setPeopleCount: (state, action) => {
      const { adults, children, infants } = action.payload;
      state.numAdults = adults || 1;
      state.numChildren = children || 0;
      state.numInfants = infants || 0;
      saveSelectionsToStorage(state);
    },

    selectHotel: (state, action) => {
      const { day, hotel } = action.payload;
      const dayKey = String(day);
      ensureDayState(state, dayKey);
      state.selectedByDay[dayKey].hotel = hotel;
      saveSelectionsToStorage(state);
    },

    selectCar: (state, action) => {
      const { day, car } = action.payload;
      const dayKey = String(day);
      ensureDayState(state, dayKey);
      const normalizedCar = normalizeCar(
        { ...car, withDriver: !!car?.withDriver },
        dayKey,
        0
      );
      state.selectedByDay[dayKey].cars = [normalizedCar];
      state.selectedByDay[dayKey].car = normalizedCar;
      saveSelectionsToStorage(state);
    },

    setDayCars: (state, action) => {
      const { day, cars } = action.payload;
      const dayKey = String(day);
      ensureDayState(state, dayKey);
      const normalizedCars = Array.isArray(cars)
        ? cars.map((car, index) => normalizeCar(car, dayKey, index))
        : [];
      state.selectedByDay[dayKey].cars = normalizedCars;
      state.selectedByDay[dayKey].car = normalizedCars[0] || null;
      saveSelectionsToStorage(state);
    },

    setDayRooms: (state, action) => {
      const { day, rooms } = action.payload;
      const dayKey = String(day);
      ensureDayState(state, dayKey);
      state.selectedByDay[dayKey].rooms = Array.isArray(rooms)
        ? rooms.map(normalizeRoom)
        : [];
      saveSelectionsToStorage(state);
    },

    selectActivity: (state, action) => {
      const { day, activity } = action.payload;
      const dayKey = String(day);
      ensureDayState(state, dayKey);
      const existingIndex = state.selectedByDay[dayKey].activities.findIndex(
        (a) => (a.id || a.activity_id) === (activity.id || activity.activity_id)
      );
      if (existingIndex === -1) {
        state.selectedByDay[dayKey].activities.push(activity);
      } else {
        state.selectedByDay[dayKey].activities[existingIndex] = activity;
      }
      saveSelectionsToStorage(state);
    },

    removeHotel: (state, action) => {
      const dayKey = String(action.payload);
      if (state.selectedByDay[dayKey]) delete state.selectedByDay[dayKey].hotel;
      saveSelectionsToStorage(state);
    },

    removeCar: (state, action) => {
      const dayKey = String(action.payload);
      if (state.selectedByDay[dayKey]) {
        state.selectedByDay[dayKey].cars = [];
        delete state.selectedByDay[dayKey].car;
      }
      saveSelectionsToStorage(state);
    },

    removeActivity: (state, action) => {
      const { day, activityId } = action.payload;
      const dayKey = String(day);
      if (state.selectedByDay[dayKey]?.activities) {
        state.selectedByDay[dayKey].activities = state.selectedByDay[
          dayKey
        ].activities.filter(
          (a) => a.id !== activityId && a.activity_id !== activityId
        );
      }
      saveSelectionsToStorage(state);
    },

    calculateTotal: (state) => {
      let subtotal = 0;

      if (state.tourData) {
        subtotal +=
          parseFloat(state.tourData.per_adult || 0) * state.numAdults +
          parseFloat(state.tourData.per_child || 0) * state.numChildren;
        // Infants: FREE
      }

      // Only iterate over VALID days (from itinerary)
      const validDays = getValidDayNumbers(state);

      validDays.forEach((dayNum) => {
        const dayKey = String(dayNum);
        const day = state.selectedByDay[dayKey];
        if (!day) return;

        if (day.hotel) {
          subtotal += parseFloat(
            day.hotel.adult_price || day.hotel.price_per_night || 0
          );
        }

        const cars = Array.isArray(day.cars)
          ? day.cars
          : day.car
            ? [day.car]
            : [];
        cars.forEach((car) => {
          subtotal += parseFloat(car.price_current || car.price || 0);
          if (car.withDriver) {
            subtotal += parseFloat(
              state.tourData?.driver_price || car.driver_price || 0
            );
          }
        });

        if (Array.isArray(day.activities)) {
          const seen = new Set();
          day.activities.forEach((activity) => {
            const actId = String(activity.id || activity.activity_id);
            if (seen.has(actId)) return;
            seen.add(actId);
            subtotal += parseFloat(
              activity.price_current || activity.price || 0
            );
          });
        }
      });

      // Tour guides — only valid days
      validDays.forEach((dayNum) => {
        const guide = state.tourGuideByDay[String(dayNum)];
        if (guide?.isAvailable && guide?.isSelected) {
          subtotal += parseFloat(guide.guidePrice || 0);
        }
      });

      state.subtotalAmount = Math.round(subtotal * 100) / 100;
      const discountAmount = (subtotal * (state.discountPercentage || 0)) / 100;
      state.totalAmount = Math.round((subtotal - discountAmount) * 100) / 100;

      saveSelectionsToStorage(state);
    },

    setTotalAmount: (state, action) => {
      state.totalAmount = action.payload;
    },

    // Called after successful booking — clears everything
    resetReservation: () => {
      clearAllReservationsFromStorage();
      return { ...initialState, userId: getUserIdFromStorage() };
    },

    // Called when leaving a tour without booking — keeps other tours intact
    clearCurrentTourData: (state) => {
      state.selectedByDay = {};
      state.tourGuideByDay = {};
      state.tourData = null;
      state.tourId = null;
      state.totalAmount = 0;
      state.subtotalAmount = 0;
    },
  },
});

// ─── Exports ──────────────────────────────────────────────────────────────────
export const {
  setTourData,
  setUserId,
  refreshUserId,
  setTourInfo,
  setPeopleCount,
  selectHotel,
  selectCar,
  setDayCars,
  setDayRooms,
  selectActivity,
  toggleTourGuide,
  removeHotel,
  removeCar,
  removeActivity,
  calculateTotal,
  setTotalAmount,
  resetReservation,
  clearCurrentTourData,
  initializeTourGuide,
  initializeActivities,
  restoreSavedSelections,
  saveSelections,
} = tourReservationSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectPriceDetails = (state) => {
  const { subtotalAmount, discountPercentage, totalAmount } =
    state.tourReservation;
  const discountAmount = (subtotalAmount * discountPercentage) / 100;
  return {
    subtotal: subtotalAmount,
    discountPercentage,
    discountAmount: Math.round(discountAmount * 100) / 100,
    total: totalAmount,
  };
};

// ─── Validation (only valid itinerary days) ───────────────────────────────────
export const validateRoomsForAllDays = (state) => {
  const { selectedByDay, numAdults, numChildren, tourData } =
    state.tourReservation;
  const totalTravelers = (numAdults || 1) + (numChildren || 0);

  // Get only the days that actually exist in the current itinerary
  const validDayNumbers = (tourData?.itinerary || [])
    .map((d) => Number(d.day))
    .filter(Boolean);

  const errors = [];

  validDayNumbers.forEach((dayNum) => {
    const dayKey = String(dayNum);
    const dayData = selectedByDay?.[dayKey];

    // No hotel selected for this day → skip room validation
    if (!dayData?.hotel) return;

    const rooms = Array.isArray(dayData.rooms) ? dayData.rooms : [];

    if (rooms.length === 0 && totalTravelers >= 3) {
      errors.push({
        day: dayNum,
        message: `Day ${dayNum}: Room distribution not set`,
        assigned: 0,
        required: totalTravelers,
      });
      return;
    }

    if (rooms.length === 0) return;

    const assignedTravelers = rooms.reduce(
      (sum, room) =>
        sum +
        Number(room.adults || 0) +
        Number(room.kids ?? room.children ?? 0),
      0
    );

    if (assignedTravelers !== totalTravelers) {
      errors.push({
        day: dayNum,
        message: `Day ${dayNum}: ${assignedTravelers}/${totalTravelers} travelers assigned`,
        assigned: assignedTravelers,
        required: totalTravelers,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    firstErrorDay: errors.length > 0 ? errors[0].day : null,
  };
};

// ─── API Formatter (only valid itinerary days) ────────────────────────────────
export const formatReservationForAPI = (state, inviteCode = "") => {
  // Use ONLY itinerary days — never stale selectedByDay keys
  const validDays = (state.tourData?.itinerary || [])
    .map((d) => Number(d.day))
    .filter(Boolean)
    .sort((a, b) => a - b);

  const formatHotels = () =>
    validDays
      .map((day) => {
        const hotel = state.selectedByDay?.[String(day)]?.hotel;
        const hotelId = hotel?.id || hotel?.hotel_id || 0;
        return `${day}**${hotelId}`;
      })
      .join("**day**");

  const formatActivities = () => {
    const segments = [];
    validDays.forEach((day) => {
      const activities = state.selectedByDay?.[String(day)]?.activities || [];
      const seen = new Set();
      const ids = activities
        .map((a) => a.id || a.activity_id)
        .filter(Boolean)
        .filter((id) => {
          const k = String(id);
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
      if (ids.length) ids.forEach((id) => segments.push(`${day}**${id}`));
    });
    return segments.join("**day**");
  };

  const formatCars = () => {
    const segments = [];
    validDays.forEach((day) => {
      const cars = state.selectedByDay?.[String(day)]?.cars || [];
      if (!cars.length) {
        segments.push(`${day}**0**0`);
        return;
      }
      cars.forEach((car) => {
        const carId = car.car_id || car.id;
        if (!carId) return;
        const withDriver = car.withDriver ? 1 : 0;
        segments.push(`${day}**${carId}**${withDriver}`);
      });
    });
    return segments.join("**day**");
  };

  const formatTourGuide = () =>
    validDays
      .map((day) => {
        const guide = state.tourGuideByDay?.[String(day)];
        const isSelected = guide?.isAvailable && guide?.isSelected ? 1 : 0;
        const price = isSelected ? parseFloat(guide?.guidePrice || 0) : 0;
        return `${day}**${isSelected}**${price}`;
      })
      .join("**day**");

  const formatRooms = () =>
    validDays.flatMap((day) => {
      const rooms = state.selectedByDay?.[String(day)]?.rooms || [];
      return rooms.map((room) => ({
        day: Number(day),
        adults: Number(room.adults || 0),
        kids: Number(room.kids ?? room.children ?? 0),
        babies: Number(room.babies ?? room.infants ?? 0),
      }));
    });

  return {
    tour_id: state.tourId?.toString(),
    user_id: state.userId?.toString(),
    num_adults: state.numAdults?.toString(),
    num_children: state.numChildren?.toString(),
    num_infants: state.numInfants?.toString(),
    total_amount: state.totalAmount?.toString(),
    day_activities: formatActivities(),
    day_hotel: formatHotels(),
    day_car: formatCars(),
    day_tour_guide: formatTourGuide(),
    start_date: state.startDate,
    end_date: state.endDate,
    invite_code: inviteCode,
    rooms: formatRooms(),
  };
};

export default tourReservationSlice.reducer;
