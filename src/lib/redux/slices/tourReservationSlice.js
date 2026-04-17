// lib/redux/slices/tourReservationSlice.js
"use client";
import { createSlice } from "@reduxjs/toolkit";

const formatDateLocal = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

// ✅ حفظ الاختيارات في localStorage
const saveSelectionsToStorage = (state) => {
  if (typeof window === "undefined") return;
  try {
    const dataToSave = {
      tourId: state.tourId,
      // startDate: state.startDate,
      // endDate: state.endDate,
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

// ✅ استرجاع الاختيارات من localStorage
const loadSelectionsFromStorage = (tourId) => {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("tourReservation");
    if (!saved) return null;

    const parsed = JSON.parse(saved);

    // تحقق إن البيانات لنفس التور
    if (parsed.tourId && tourId && String(parsed.tourId) !== String(tourId)) {
      return null;
    }

    // تحقق إن البيانات مش أقدم من 24 ساعة
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

const extractDiscountPercentage = (offerPercentage) => {
  if (!offerPercentage) return 0;
  const match = offerPercentage.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
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

    // ✅ استرجاع الاختيارات المحفوظة
    restoreSavedSelections: (state, action) => {
      const tourId = action.payload;
      const saved = loadSelectionsFromStorage(tourId);

      if (!saved) return;

      console.log("✅ Restoring saved selections for tour:", tourId);

      if (saved.selectedByDay && Object.keys(saved.selectedByDay).length > 0) {
        state.selectedByDay = saved.selectedByDay;
      }
      if (
        saved.tourGuideByDay &&
        Object.keys(saved.tourGuideByDay).length > 0
      ) {
        state.tourGuideByDay = saved.tourGuideByDay;
      }
      // if (saved.startDate) state.startDate = saved.startDate;
      // if (saved.endDate) state.endDate = saved.endDate;
      if (saved.numAdults) state.numAdults = saved.numAdults;
      if (saved.numChildren !== undefined)
        state.numChildren = saved.numChildren;
      if (saved.numInfants !== undefined) state.numInfants = saved.numInfants;
      if (saved.totalAmount) state.totalAmount = saved.totalAmount;
      if (saved.subtotalAmount) state.subtotalAmount = saved.subtotalAmount;
      if (saved.discountPercentage)
        state.discountPercentage = saved.discountPercentage;
    },

    // ✅ حفظ يدوي
    saveSelections: (state) => {
      saveSelectionsToStorage(state);
    },

    initializeTourGuide: (state, action) => {
      const itinerary = action.payload;

      if (!itinerary || !Array.isArray(itinerary)) return;

      if (!state.tourGuideByDay) {
        state.tourGuideByDay = {};
      }

      // ✅ لو في بيانات محفوظة، متعيدش التهيئة
      if (Object.keys(state.tourGuideByDay).length > 0) {
        console.log("Tour guide already initialized, skipping...");
        return;
      }

      state.tourGuideByDay = {};

      itinerary.forEach((day) => {
        const dayNumber = String(day.day);
        const rawValue = day.isTourguide;
        const isAvailable = rawValue === "1" || rawValue === 1;

        state.tourGuideByDay[dayNumber] = {
          isAvailable: isAvailable,
          isSelected: isAvailable,
        };
      });

      // ✅ احفظ بعد التهيئة
      saveSelectionsToStorage(state);
    },

    toggleTourGuide: (state, action) => {
      const dayNumber = String(action.payload);

      if (!state.tourGuideByDay) return;
      if (!state.tourGuideByDay[dayNumber]) return;
      if (!state.tourGuideByDay[dayNumber].isAvailable) return;

      state.tourGuideByDay[dayNumber].isSelected =
        !state.tourGuideByDay[dayNumber].isSelected;

      // ✅ احفظ بعد التغيير
      saveSelectionsToStorage(state);
    },

    initializeActivities: (state, action) => {
      const itinerary = action.payload;
      if (!itinerary || !Array.isArray(itinerary)) return;

      // ✅ لو في activities محفوظة، متعيدش التهيئة
      const hasExistingActivities = Object.values(state.selectedByDay).some(
        (day) => day.activities && day.activities.length > 0
      );

      if (hasExistingActivities) {
        console.log("Activities already initialized, skipping...");
        return;
      }

      itinerary.forEach((day) => {
        const dayKey = String(day.day);

        if (!state.selectedByDay[dayKey]) {
          state.selectedByDay[dayKey] = { activities: [] };
        }

        // ✅ Reset activities لكل يوم
        state.selectedByDay[dayKey].activities = [];

        const activities = day.activities_options || [];

        // ✅ Deduplicate by activity_id قبل الإضافة
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
      if (!state.selectedByDay[dayKey]) {
        state.selectedByDay[dayKey] = { activities: [] };
      }
      state.selectedByDay[dayKey].hotel = hotel;

      saveSelectionsToStorage(state);
    },

    selectCar: (state, action) => {
      const { day, car } = action.payload;
      const dayKey = String(day);
      if (!state.selectedByDay[dayKey]) {
        state.selectedByDay[dayKey] = { activities: [] };
      }
      state.selectedByDay[dayKey].car = car;

      saveSelectionsToStorage(state);
    },

    selectActivity: (state, action) => {
      const { day, activity } = action.payload;
      const dayKey = String(day);
      if (!state.selectedByDay[dayKey]) {
        state.selectedByDay[dayKey] = { activities: [] };
      }
      if (!state.selectedByDay[dayKey].activities) {
        state.selectedByDay[dayKey].activities = [];
      }

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

        if (day.car) {
          subtotal += parseFloat(day.car.price_current || day.car.price || 0);
        }

        if (day.activities?.length > 0) {
          // ✅ Deduplicate activities before calculating
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
  const formatDayData = (key) => {
    return Object.entries(state.selectedByDay)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([day, data]) => {
        let itemId = null;
        if (key === "hotel" && data.hotel) {
          itemId = data.hotel.id || data.hotel.hotel_id;
        } else if (key === "car" && data.car) {
          itemId = data.car.id || data.car.car_id;
        }
        return itemId ? `${day}**${itemId}` : null;
      })
      .filter(Boolean)
      .join("**day**");
  };

  const formatActivities = () => {
    const allActivities = [];
    Object.entries(state.selectedByDay)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([day, data]) => {
        if (data.activities?.length > 0) {
          data.activities.forEach((activity) => {
            const activityId = activity.id || activity.activity_id;
            if (activityId) {
              allActivities.push(`${day}**${activityId}`);
            }
          });
        }
      });
    return allActivities.join("**day**");
  };

  const formatTourGuide = () => {
    if (
      !state.tourGuideByDay ||
      Object.keys(state.tourGuideByDay).length === 0
    ) {
      return "";
    }

    const tourGuideData = [];
    Object.entries(state.tourGuideByDay)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([dayKey, data]) => {
        const value = data.isAvailable && data.isSelected ? 1 : 0;
        tourGuideData.push(`${dayKey}**${value}`);
      });

    return tourGuideData.join("**day**");
  };

  return {
    tour_id: state.tourId?.toString(),
    user_id: state.userId?.toString(),
    num_adults: state.numAdults?.toString(),
    num_children: state.numChildren?.toString(),
    total_amount: state.totalAmount?.toString(),
    day_activities: formatActivities(),
    day_hotel: formatDayData("hotel"),
    day_car: formatDayData("car"),
    day_tour_guide: formatTourGuide(),
    start_date: state.startDate,
    end_date: state.endDate,
    invite_code: inviteCode,
  };
};

export default tourReservationSlice.reducer;
