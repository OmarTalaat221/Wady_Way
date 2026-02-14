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

    // ✅ تهيئة Tour Guide - مع التأكد من الـ object موجود
    initializeTourGuide: (state, action) => {
      const itinerary = action.payload;

      console.log("========== TOUR GUIDE INIT ==========");
      console.log("Received itinerary:", itinerary);
      console.log("Current state.tourGuideByDay:", state.tourGuideByDay);

      if (!itinerary || !Array.isArray(itinerary)) {
        console.log("❌ No valid itinerary");
        return;
      }

      // ✅ تأكد إن الـ object موجود
      if (!state.tourGuideByDay) {
        console.log("⚠️ tourGuideByDay was undefined, initializing...");
        state.tourGuideByDay = {};
      }

      // ✅ نظف البيانات القديمة ونبدأ من جديد
      state.tourGuideByDay = {};

      itinerary.forEach((day) => {
        const dayNumber = String(day.day);
        const rawValue = day.isTourguide;
        const isAvailable = rawValue === "1" || rawValue === 1;

        console.log(
          `Day ${dayNumber}: isTourguide = "${rawValue}" => available = ${isAvailable}`
        );

        state.tourGuideByDay[dayNumber] = {
          isAvailable: isAvailable,
          isSelected: isAvailable,
        };
      });

      console.log(
        "Final tourGuideByDay:",
        JSON.stringify(state.tourGuideByDay)
      );
      console.log("=====================================");
    },

    toggleTourGuide: (state, action) => {
      const dayNumber = String(action.payload);

      console.log(`Toggle day ${dayNumber}`);

      // ✅ تأكد إن الـ object موجود
      if (!state.tourGuideByDay) {
        console.log("⚠️ tourGuideByDay is undefined!");
        return;
      }

      if (!state.tourGuideByDay[dayNumber]) {
        console.log("Day not found!");
        return;
      }

      if (!state.tourGuideByDay[dayNumber].isAvailable) {
        console.log("Tour guide not available for this day");
        return;
      }

      state.tourGuideByDay[dayNumber].isSelected =
        !state.tourGuideByDay[dayNumber].isSelected;

      console.log("New state:", state.tourGuideByDay[dayNumber]);
    },

    initializeActivities: (state, action) => {
      const itinerary = action.payload;

      if (!itinerary || !Array.isArray(itinerary)) return;

      itinerary.forEach((day) => {
        const dayKey = String(day.day);

        if (!state.selectedByDay[dayKey]) {
          state.selectedByDay[dayKey] = { activities: [] };
        }

        state.selectedByDay[dayKey].activities = [];

        const activities = day.activities_options || [];
        activities.forEach((activity) => {
          const activityId = activity.activity_id || activity.id;
          if (!activityId) return;

          state.selectedByDay[dayKey].activities.push({
            id: activityId,
            activity_id: activityId,
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
          });
        });
      });
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
    },

    setPeopleCount: (state, action) => {
      const { adults, children, infants } = action.payload;
      state.numAdults = adults || 1;
      state.numChildren = children || 0;
      state.numInfants = infants || 0;
    },

    selectHotel: (state, action) => {
      const { day, hotel } = action.payload;
      const dayKey = String(day);
      if (!state.selectedByDay[dayKey]) {
        state.selectedByDay[dayKey] = { activities: [] };
      }
      state.selectedByDay[dayKey].hotel = hotel;
    },

    selectCar: (state, action) => {
      const { day, car } = action.payload;
      const dayKey = String(day);
      if (!state.selectedByDay[dayKey]) {
        state.selectedByDay[dayKey] = { activities: [] };
      }
      state.selectedByDay[dayKey].car = car;
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
    },

    removeHotel: (state, action) => {
      const dayKey = String(action.payload);
      if (state.selectedByDay[dayKey]) {
        delete state.selectedByDay[dayKey].hotel;
      }
    },

    removeCar: (state, action) => {
      const dayKey = String(action.payload);
      if (state.selectedByDay[dayKey]) {
        delete state.selectedByDay[dayKey].car;
      }
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
          day.activities.forEach((activity) => {
            subtotal += parseFloat(
              activity.price_current || activity.price || 0
            );
          });
        }
      });

      state.subtotalAmount = Math.round(subtotal * 100) / 100;

      const discountAmount = (subtotal * (state.discountPercentage || 0)) / 100;
      state.totalAmount = Math.round((subtotal - discountAmount) * 100) / 100;
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
    // ✅ تأكد إن الـ object موجود
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
