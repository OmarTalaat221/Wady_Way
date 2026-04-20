"use client";
import { createSlice } from "@reduxjs/toolkit";

const getUserIdFromStorage = () => {
  if (typeof window !== "undefined") {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.id || parsed.user_id || null;
      }
      return localStorage.getItem("user_id") || null;
    } catch (error) {
      return null;
    }
  }
  return null;
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
      car: cars[0] || current.car || null, // fallback for old UI
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

// ✅ save in localStorage
const saveSelectionsToStorage = (state) => {
  if (typeof window === "undefined") return;

  try {
    const dataToSave = {
      tourId: state.tourId,
      startDate: state.startDate, // ✅ جديد
      endDate: state.endDate, // ✅ جديد
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

    localStorage.setItem("tourReservation", JSON.stringify(dataToSave));
  } catch (error) {
    console.error("Error saving selections:", error);
  }
};

// ✅ load from localStorage
const loadSelectionsFromStorage = (tourId) => {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem("tourReservation");
    if (!saved) return null;

    const parsed = JSON.parse(saved);

    if (parsed.tourId && tourId && String(parsed.tourId) !== String(tourId)) {
      return null;
    }

    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (parsed.savedAt && Date.now() - parsed.savedAt > ONE_DAY) {
      localStorage.removeItem("tourReservation");
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Error loading selections:", error);
    return null;
  }
};

const ensureDayState = (state, dayKey) => {
  if (!state.selectedByDay[dayKey]) {
    state.selectedByDay[dayKey] = {};
  }

  if (!Array.isArray(state.selectedByDay[dayKey].activities)) {
    state.selectedByDay[dayKey].activities = [];
  }

  if (!Array.isArray(state.selectedByDay[dayKey].cars)) {
    state.selectedByDay[dayKey].cars = [];
  }

  if (!Array.isArray(state.selectedByDay[dayKey].rooms)) {
    state.selectedByDay[dayKey].rooms = [];
  }
};

const getAllDayNumbers = (state) => {
  const itineraryDays = (state.tourData?.itinerary || []).map((d) =>
    Number(d.day)
  );
  const selectedDays = Object.keys(state.selectedByDay || {}).map(Number);
  const guideDays = Object.keys(state.tourGuideByDay || {}).map(Number);

  return [...new Set([...itineraryDays, ...selectedDays, ...guideDays])]
    .filter(Boolean)
    .sort((a, b) => a - b);
};

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

const tourReservationSlice = createSlice({
  name: "tourReservation",
  initialState,
  reducers: {
    setTourData: (state, action) => {
      state.tourData = action.payload;
      state.tourId = action.payload?.id;
      state.discountPercentage = extractDiscountPercentage(
        action.payload?.offer_percentage
      );
    },

    restoreSavedSelections: (state, action) => {
      const tourId = action.payload;
      const saved = loadSelectionsFromStorage(tourId);

      if (!saved) return;

      console.log("✅ Restoring saved selections for tour:", tourId);

      if (saved.selectedByDay) {
        state.selectedByDay = normalizeSelectedByDay(saved.selectedByDay);
      }

      if (saved.tourGuideByDay) {
        state.tourGuideByDay = normalizeTourGuideByDay(saved.tourGuideByDay);
      }

      if (saved.startDate) state.startDate = saved.startDate; // ✅ جديد
      if (saved.endDate) state.endDate = saved.endDate; // ✅ جديد
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
    },

    saveSelections: (state) => {
      saveSelectionsToStorage(state);
    },

    initializeTourGuide: (state, action) => {
      const itinerary = action.payload;
      if (!itinerary || !Array.isArray(itinerary)) return;

      if (!state.tourGuideByDay) {
        state.tourGuideByDay = {};
      }

      itinerary.forEach((day) => {
        const dayNumber = String(day.day);
        const isAvailable = day.isTourguide === "1" || day.isTourguide === 1;
        const guidePrice = parseFloat(day.guide_price || 0);

        if (state.tourGuideByDay[dayNumber]) {
          state.tourGuideByDay[dayNumber] = {
            ...state.tourGuideByDay[dayNumber],
            isAvailable,
            guidePrice,
          };
        } else {
          state.tourGuideByDay[dayNumber] = {
            isAvailable,
            isSelected: isAvailable,
            guidePrice,
          };
        }
      });

      saveSelectionsToStorage(state);
    },

    toggleTourGuide: (state, action) => {
      const dayNumber = String(action.payload);

      if (!state.tourGuideByDay) return;
      if (!state.tourGuideByDay[dayNumber]) return;
      if (!state.tourGuideByDay[dayNumber].isAvailable) return;

      state.tourGuideByDay[dayNumber].isSelected =
        !state.tourGuideByDay[dayNumber].isSelected;

      saveSelectionsToStorage(state);
    },

    initializeActivities: (state, action) => {
      const itinerary = action.payload;
      if (!itinerary || !Array.isArray(itinerary)) return;

      itinerary.forEach((day) => {
        const dayKey = String(day.day);
        ensureDayState(state, dayKey);

        const hasSavedActivities =
          Array.isArray(state.selectedByDay[dayKey].activities) &&
          state.selectedByDay[dayKey].activities.length > 0;

        if (hasSavedActivities) return;

        state.selectedByDay[dayKey].activities = [];

        const activities = day.activities_options || [];
        const seen = new Set();

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

    // ✅ legacy compatibility: set one single car
    selectCar: (state, action) => {
      const { day, car } = action.payload;
      const dayKey = String(day);

      ensureDayState(state, dayKey);

      const normalizedCar = normalizeCar(
        {
          ...car,
          withDriver: !!car?.withDriver,
        },
        dayKey,
        0
      );

      state.selectedByDay[dayKey].cars = [normalizedCar];
      state.selectedByDay[dayKey].car = normalizedCar;

      saveSelectionsToStorage(state);
    },

    // ✅ new structure: multiple cars per day
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

    // ✅ rooms per day
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
      if (state.selectedByDay[dayKey]) {
        delete state.selectedByDay[dayKey].hotel;
      }
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
        const perAdult = parseFloat(state.tourData.per_adult || 0);
        const perChild = parseFloat(state.tourData.per_child || 0);

        subtotal += perAdult * state.numAdults + perChild * state.numChildren;
      }

      Object.keys(state.selectedByDay).forEach((dayKey) => {
        const day = state.selectedByDay[dayKey];

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

        if (Array.isArray(day.activities) && day.activities.length > 0) {
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

      Object.values(state.tourGuideByDay || {}).forEach((guide) => {
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

    resetReservation: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("tourReservation");
      }

      return {
        ...initialState,
        userId: getUserIdFromStorage(),
      };
    },
  },
});

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
  initializeTourGuide,
  initializeActivities,
  restoreSavedSelections,
  saveSelections,
} = tourReservationSlice.actions;

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

export const formatReservationForAPI = (state, inviteCode = "") => {
  const allDays = getAllDayNumbers(state);

  const formatHotels = () => {
    return allDays
      .map((day) => {
        const hotel = state.selectedByDay?.[String(day)]?.hotel;
        const hotelId = hotel?.id || hotel?.hotel_id || 0;
        return `${day}**${hotelId}`;
      })
      .join("**day**");
  };

  const formatActivities = () => {
    return allDays
      .flatMap((day) => {
        const activities = state.selectedByDay?.[String(day)]?.activities || [];

        const seen = new Set();
        const ids = activities
          .map((activity) => activity.id || activity.activity_id)
          .filter(Boolean)
          .filter((id) => {
            const key = String(id);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

        if (!ids.length) return [];

        // One segment per activity id
        return ids.map((id) => `${day}**${id}`);
      })
      .join("**day**");
  };

  const formatCars = () => {
    return allDays
      .flatMap((day) => {
        const cars = state.selectedByDay?.[String(day)]?.cars || [];

        // keep empty day placeholder if backend still expects it
        if (!cars.length) {
          return [`${day}**0**0`];
        }

        return cars
          .map((car) => {
            // Important: send real car id, not instanceId
            const carId = car.car_id || car.id;
            if (!carId) return null;

            const withDriver = car.withDriver ? 1 : 0;

            // one segment per car
            return `${day}**${carId}**${withDriver}`;
          })
          .filter(Boolean);
      })
      .join("**day**");
  };

  const formatTourGuide = () => {
    return allDays
      .map((day) => {
        const guide = state.tourGuideByDay?.[String(day)];
        const isSelected = guide?.isAvailable && guide?.isSelected ? 1 : 0;
        const price = isSelected ? parseFloat(guide?.guidePrice || 0) : 0;

        return `${day}**${isSelected}**${price}`;
      })
      .join("**day**");
  };

  const formatRooms = () => {
    return allDays.flatMap((day) => {
      const rooms = state.selectedByDay?.[String(day)]?.rooms || [];

      return rooms.map((room) => ({
        day: Number(day),
        adults: Number(room.adults || 0),
        kids: Number(room.kids ?? room.children ?? 0),
        babies: Number(room.babies ?? room.infants ?? 0),
      }));
    });
  };

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

// ✅ Validate rooms for all days
export const validateRoomsForAllDays = (state) => {
  const { selectedByDay, numAdults, numChildren } = state.tourReservation;
  const totalTravelers = (numAdults || 1) + (numChildren || 0);

  const errors = [];

  Object.entries(selectedByDay || {}).forEach(([dayKey, dayData]) => {
    // لو مفيش فندق مختار، سكب
    if (!dayData?.hotel) return;

    const rooms = Array.isArray(dayData.rooms) ? dayData.rooms : [];

    // لو مفيش rooms خالص ولكن الـ travelers > 2، ده مشكلة
    if (rooms.length === 0 && totalTravelers >= 3) {
      errors.push({
        day: parseInt(dayKey),
        message: `Day ${dayKey}: Room distribution not set`,
        assigned: 0,
        required: totalTravelers,
      });
      return;
    }

    if (rooms.length === 0) return; // travelers <= 2 ومفيش rooms عادي

    const assignedTravelers = rooms.reduce(
      (sum, room) =>
        sum +
        Number(room.adults || 0) +
        Number(room.kids ?? room.children ?? 0),
      0
    );

    if (assignedTravelers !== totalTravelers) {
      errors.push({
        day: parseInt(dayKey),
        message: `Day ${dayKey}: ${assignedTravelers}/${totalTravelers} travelers assigned to rooms`,
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

export default tourReservationSlice.reducer;
