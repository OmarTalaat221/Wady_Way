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

const normalizeActivity = (activity) => ({
  ...activity,
  id: activity.id || activity.activity_id,
  activity_id: activity.activity_id || activity.id,
  for_children:
    activity.for_children === true ||
    activity.for_children === "1" ||
    activity.for_children === 1,
  num_adults: Number(activity.num_adults ?? 1),
  num_children: Number(activity.num_children ?? 0),
  price_current: parseFloat(activity.price_current || activity.price || 0),
  price: parseFloat(activity.price || activity.price_current || 0),
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
      activities: Array.isArray(current.activities)
        ? current.activities.map(normalizeActivity)
        : [],
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

const getValidDayNumbers = (state) => {
  const itinerary = state.tourData?.itinerary || [];
  if (!itinerary.length) return [];
  return itinerary
    .map((d) => Number(d.day))
    .filter(Boolean)
    .sort((a, b) => a - b);
};

const sanitizeDaysToItinerary = (state) => {
  if (!state.tourData?.itinerary?.length) return;
  const validDays = new Set(getValidDayNumbers(state).map(String));
  Object.keys(state.selectedByDay).forEach((key) => {
    if (!validDays.has(key)) delete state.selectedByDay[key];
  });
  Object.keys(state.tourGuideByDay).forEach((key) => {
    if (!validDays.has(key)) delete state.tourGuideByDay[key];
  });
};

const parseLocalDateString = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return isNaN(date.getTime()) ? null : date;
};

const formatLocalDateString = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildEndDateFromDuration = (startDate, durationDays) => {
  const normalizedDuration = Math.max(Number(durationDays || 1), 1);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + normalizedDuration - 1);
  return endDate;
};

// ✅ source of truth for dates = itinerary length
const syncDatesWithItinerary = (state) => {
  const itineraryLength = Array.isArray(state.tourData?.itinerary)
    ? state.tourData.itinerary.length
    : 0;

  if (!itineraryLength) return;

  const parsedStart = parseLocalDateString(state.startDate);
  if (!parsedStart) return;

  const expectedEnd = buildEndDateFromDuration(parsedStart, itineraryLength);
  const expectedEndStr = formatLocalDateString(expectedEnd);

  if (expectedEndStr && state.endDate !== expectedEndStr) {
    state.endDate = expectedEndStr;
  }
};

// ─── localStorage ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "tourReservations";
const LEGACY_KEY = "tourReservation";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const cleanLegacyKey = () => {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch {}
};

const loadAllReservations = () => {
  if (typeof window === "undefined") return {};
  cleanLegacyKey();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const now = Date.now();
    const cleaned = {};

    Object.entries(parsed).forEach(([tourId, data]) => {
      if (!tourId || !data?.tourId) return;
      if (data.savedAt && now - data.savedAt > ONE_DAY_MS) return;
      cleaned[String(tourId)] = data;
    });

    return cleaned;
  } catch {
    return {};
  }
};

const saveAllReservations = (all) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    cleanLegacyKey();
  } catch (err) {
    console.error("Error saving reservations:", err);
  }
};

const saveSelectionsToStorage = (state) => {
  if (typeof window === "undefined") return;
  if (!state.tourId || !state.tourData) return;
  try {
    const all = loadAllReservations();
    all[String(state.tourId)] = {
      tourId: state.tourId,
      tourData: state.tourData,
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
      savedAt: Date.now(),
    };
    saveAllReservations(all);
  } catch (err) {
    console.error("Error saving selections:", err);
  }
};

const loadSelectionsFromStorage = (tourId) => {
  if (!tourId) return null;
  try {
    const all = loadAllReservations();
    return all[String(tourId)] || null;
  } catch {
    return null;
  }
};

const removeSingleTourFromStorage = (tourId) => {
  if (typeof window === "undefined" || !tourId) return;
  try {
    const all = loadAllReservations();
    delete all[String(tourId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    cleanLegacyKey();
  } catch {}
};

// ─── Initial State ────────────────────────────────────────────────────────────
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

      if (
        state.tourId &&
        newTourId &&
        String(state.tourId) !== String(newTourId)
      ) {
        state.selectedByDay = {};
        state.tourGuideByDay = {};
        state.totalAmount = 0;
        state.subtotalAmount = 0;
        state.startDate = null;
        state.endDate = null;
        state.numAdults = 1;
        state.numChildren = 0;
        state.numInfants = 0;
      }

      state.tourData = action.payload;
      state.tourId = newTourId;
      state.discountPercentage = extractDiscountPercentage(
        action.payload?.offer_percentage
      );

      sanitizeDaysToItinerary(state);
      // ✅ لو فيه startDate محفوظ، endDate لازم يتظبط على عدد أيام الرحلة الحقيقي
      syncDatesWithItinerary(state);
      saveSelectionsToStorage(state);
    },

    restoreSavedSelections: (state, action) => {
      const targetTourId = action.payload;
      if (!targetTourId) return;

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

      state.tourId = targetTourId;

      const saved = loadSelectionsFromStorage(targetTourId);
      if (!saved) return;

      if (saved.tourData) state.tourData = saved.tourData;
      if (saved.selectedByDay)
        state.selectedByDay = normalizeSelectedByDay(saved.selectedByDay);
      if (saved.tourGuideByDay)
        state.tourGuideByDay = normalizeTourGuideByDay(saved.tourGuideByDay);
      if (saved.startDate !== undefined) state.startDate = saved.startDate;
      if (saved.endDate !== undefined) state.endDate = saved.endDate;
      if (saved.numAdults !== undefined) state.numAdults = saved.numAdults;
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
      syncDatesWithItinerary(state);
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

          const forChildren =
            activity.for_children === "1" || activity.for_children === 1;

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
            for_children: forChildren,
            num_adults: state.numAdults || 1,
            num_children: forChildren ? state.numChildren || 0 : 0,
            features: activity.features || [],
          });
        });
      });

      sanitizeDaysToItinerary(state);
      saveSelectionsToStorage(state);
    },

    selectActivity: (state, action) => {
      const { day, activity } = action.payload;
      const dayKey = String(day);
      ensureDayState(state, dayKey);

      const forChildren =
        activity.for_children === true ||
        activity.for_children === "1" ||
        activity.for_children === 1;

      const activityWithPeople = {
        ...activity,
        for_children: forChildren,
        num_adults: activity.num_adults ?? state.numAdults ?? 1,
        num_children:
          activity.num_children ?? (forChildren ? (state.numChildren ?? 0) : 0),
        price_current: parseFloat(
          activity.price_current || activity.price || 0
        ),
        price: parseFloat(activity.price || activity.price_current || 0),
      };

      const existingIndex = state.selectedByDay[dayKey].activities.findIndex(
        (a) => (a.id || a.activity_id) === (activity.id || activity.activity_id)
      );

      if (existingIndex === -1) {
        state.selectedByDay[dayKey].activities.push(activityWithPeople);
      } else {
        state.selectedByDay[dayKey].activities[existingIndex] =
          activityWithPeople;
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

    updateActivityPeople: (state, action) => {
      const { day, activityId, num_adults, num_children } = action.payload;
      const dayKey = String(day);
      if (!state.selectedByDay[dayKey]?.activities) return;

      const actIdx = state.selectedByDay[dayKey].activities.findIndex(
        (a) => a.id === activityId || a.activity_id === activityId
      );

      if (actIdx !== -1) {
        if (num_adults !== undefined) {
          state.selectedByDay[dayKey].activities[actIdx].num_adults =
            num_adults;
        }
        if (num_children !== undefined) {
          state.selectedByDay[dayKey].activities[actIdx].num_children =
            num_children;
        }
      }

      saveSelectionsToStorage(state);
    },

    selectHotel: (state, action) => {
      const { day, hotel } = action.payload;
      const dayKey = String(day);
      ensureDayState(state, dayKey);

      const previousHotelId =
        state.selectedByDay[dayKey].hotel?.id ||
        state.selectedByDay[dayKey].hotel?.hotel_id;
      const newHotelId = hotel?.id || hotel?.hotel_id;

      state.selectedByDay[dayKey].hotel = hotel;

      if (
        previousHotelId &&
        newHotelId &&
        String(previousHotelId) !== String(newHotelId)
      ) {
        state.selectedByDay[dayKey].rooms = [];
      }

      saveSelectionsToStorage(state);
    },

    removeHotel: (state, action) => {
      const dayKey = String(action.payload);
      if (state.selectedByDay[dayKey]) {
        delete state.selectedByDay[dayKey].hotel;
        state.selectedByDay[dayKey].rooms = [];
      }
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

    removeCar: (state, action) => {
      const dayKey = String(action.payload);
      if (state.selectedByDay[dayKey]) {
        state.selectedByDay[dayKey].cars = [];
        delete state.selectedByDay[dayKey].car;
      }
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

      // ✅ لو startDate اتغير، endDate لازم يبقى متوافق مع itinerary
      syncDatesWithItinerary(state);
      saveSelectionsToStorage(state);
    },

    setPeopleCount: (state, action) => {
      const { adults, children, infants } = action.payload;
      state.numAdults = adults || 1;
      state.numChildren = children || 0;
      state.numInfants = infants || 0;
      saveSelectionsToStorage(state);
    },

    calculateTotal: (state) => {
      let subtotal = 0;

      if (state.tourData) {
        subtotal +=
          parseFloat(state.tourData.per_adult || 0) * state.numAdults +
          parseFloat(state.tourData.per_child || 0) * state.numChildren;
      }

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

    resetReservation: (state) => {
      if (state.tourId) {
        removeSingleTourFromStorage(state.tourId);
      }
      return { ...initialState, userId: getUserIdFromStorage() };
    },

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
  updateActivityPeople,
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

// ─── Validation ───────────────────────────────────────────────────────────────
export const validateRoomsForAllDays = (state) => {
  const { selectedByDay, numAdults, numChildren, tourData } =
    state.tourReservation;
  const totalTravelers = (numAdults || 1) + (numChildren || 0);
  const validDayNumbers = (tourData?.itinerary || [])
    .map((d) => Number(d.day))
    .filter(Boolean);

  const errors = [];

  validDayNumbers.forEach((dayNum) => {
    const dayKey = String(dayNum);
    const dayData = selectedByDay?.[dayKey];
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

export const validateCarsForAllDays = (state) => {
  const { selectedByDay, numAdults, numChildren, tourData } =
    state.tourReservation;
  const validDayNumbers = (tourData?.itinerary || [])
    .map((d) => Number(d.day))
    .filter(Boolean);

  const errors = [];

  validDayNumbers.forEach((dayNum) => {
    const dayKey = String(dayNum);
    const dayData = selectedByDay?.[dayKey];

    const cars = Array.isArray(dayData?.cars)
      ? dayData.cars
      : dayData?.car
        ? [dayData.car]
        : [];

    if (cars.length === 0) {
      errors.push({
        day: dayNum,
        type: "no_cars",
        message: `Day ${dayNum}: No cars selected`,
        totalCapacity: 0,
        requiredSeats: (numAdults || 1) + (numChildren || 0),
      });
      return;
    }

    const driversCount = cars.filter((c) => c.withDriver).length;
    const totalPassengers =
      (numAdults || 1) + (numChildren || 0) + driversCount;

    const totalCapacity = cars.reduce(
      (sum, car) => sum + (parseInt(car.capacity || car.max_people) || 4),
      0
    );

    if (totalCapacity < totalPassengers) {
      errors.push({
        day: dayNum,
        type: "insufficient_capacity",
        message: `Day ${dayNum}: Cars capacity (${totalCapacity}) is less than passengers (${totalPassengers})`,
        totalCapacity,
        requiredSeats: totalPassengers,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    firstErrorDay: errors.length > 0 ? errors[0].day : null,
  };
};

// ─── API Formatter ────────────────────────────────────────────────────────────
export const formatReservationForAPI = (state, inviteCode = "") => {
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

      activities.forEach((a) => {
        const id = a.id || a.activity_id;
        if (!id) return;
        const key = String(id);
        if (seen.has(key)) return;
        seen.add(key);

        const numAdults = Number(a.num_adults ?? 1);
        const numChildren = Number(a.num_children ?? 0);

        segments.push(`${day}**${id}**${numAdults}**${numChildren}`);
      });
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
        segments.push(`${day}**${carId}**${car.withDriver ? 1 : 0}`);
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
