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
      const userId = localStorage.getItem("user_id");
      return userId || null;
    } catch (error) {
      console.error("Error getting user_id from localStorage:", error);
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
  totalAmount: 0,
  discountPercentage: 0,
  subtotalAmount: 0,
  activitiesInitialized: false,
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

    initializeTourGuides: (state, action) => {
      const numberOfDays = action.payload;

      for (let i = 1; i <= numberOfDays; i++) {
        const dayKey = String(i);
        if (!state.selectedByDay[dayKey]) {
          state.selectedByDay[dayKey] = {};
        }
        if (state.selectedByDay[dayKey].tour_guide === undefined) {
          state.selectedByDay[dayKey].tour_guide = true;
        }
      }
    },

    initializeActivitiesFromDays: (state, action) => {
      const days = action.payload;

      if (!days || !Array.isArray(days)) {
        return;
      }

      days.forEach((day, index) => {
        const dayKey = String(index + 1);

        if (!state.selectedByDay[dayKey]) {
          state.selectedByDay[dayKey] = {
            activities: [],
            tour_guide: true,
          };
        }

        state.selectedByDay[dayKey].activities = [];

        if (state.selectedByDay[dayKey].tour_guide === undefined) {
          state.selectedByDay[dayKey].tour_guide = true;
        }

        const activitiesList = day.activities_options || day.activities || [];

        if (activitiesList.length > 0) {
          activitiesList.forEach((activity) => {
            const activityId = activity.activity_id || activity.id;

            if (!activityId) {
              return;
            }

            const activityTitle =
              typeof activity.title === "object"
                ? activity.title?.en || activity.title?.ar || "Activity"
                : activity.title || "Activity";

            const activityPrice = parseFloat(
              activity.price_current || activity.price || 0
            );

            const newActivity = {
              id: activityId,
              activity_id: activityId,
              tour_activity_id: activity.tour_activity_id,
              title: activityTitle,
              name: activityTitle,
              image:
                typeof activity.image === "string"
                  ? activity.image.split("//CAMP//")[0]
                  : activity.image,
              price: activityPrice,
              price_current: activityPrice,
              duration: activity.duration,
              difficulty: activity.difficulty,
              isDefault: true,
            };

            state.selectedByDay[dayKey].activities.push(newActivity);
          });
        } else {
        }
      });

      state.activitiesInitialized = true;
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
        state.selectedByDay[dayKey] = { tour_guide: true, activities: [] };
      }
      state.selectedByDay[dayKey].hotel = hotel;
    },

    selectCar: (state, action) => {
      const { day, car } = action.payload;
      const dayKey = String(day);

      if (!state.selectedByDay[dayKey]) {
        state.selectedByDay[dayKey] = { tour_guide: true, activities: [] };
      }
      state.selectedByDay[dayKey].car = car;
    },

    selectActivity: (state, action) => {
      const { day, activity } = action.payload;
      const dayKey = String(day);

      if (!state.selectedByDay[dayKey]) {
        state.selectedByDay[dayKey] = { activities: [], tour_guide: true };
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

    setTourGuide: (state, action) => {
      const { day, value } = action.payload;
      const dayKey = String(day);

      if (!state.selectedByDay[dayKey]) {
        state.selectedByDay[dayKey] = { activities: [] };
      }
      state.selectedByDay[dayKey].tour_guide = value;
    },

    toggleTourGuide: (state, action) => {
      const day = action.payload;
      const dayKey = String(day);

      if (!state.selectedByDay[dayKey]) {
        state.selectedByDay[dayKey] = { tour_guide: true, activities: [] };
      }

      state.selectedByDay[dayKey].tour_guide =
        !state.selectedByDay[dayKey].tour_guide;
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
        const numAdults = state.numAdults;
        const numChildren = state.numChildren;

        const adultsTotal = perAdult * numAdults;
        const childrenTotal = perChild * numChildren;

        subtotal += adultsTotal + childrenTotal;
      }

      const sortedDays = Object.keys(state.selectedByDay).sort(
        (a, b) => parseInt(a) - parseInt(b)
      );

      sortedDays.forEach((dayKey) => {
        const day = state.selectedByDay[dayKey];
        let dayTotal = 0;

        if (day.hotel) {
          const hotelPrice = parseFloat(
            day.hotel.adult_price || day.hotel.price_per_night || 0
          );
          dayTotal += hotelPrice;
          subtotal += hotelPrice;

          const hotelName = day.hotel.title || day.hotel.name || "Hotel";
        } else {
        }

        if (day.car) {
          const carPrice = parseFloat(
            day.car.price_current || day.car.price || 0
          );
          dayTotal += carPrice;
          subtotal += carPrice;

          const carName = day.car.title || day.car.name || "Car";
        } else {
        }

        if (
          day.activities &&
          Array.isArray(day.activities) &&
          day.activities.length > 0
        ) {
          day.activities.forEach((activity, index) => {
            const activityPrice = parseFloat(
              activity.price_current || activity.price || 0
            );
            dayTotal += activityPrice;
            subtotal += activityPrice;

            const activityName = activity.title || activity.name || "Activity";
          });
        }
      });

      const roundedSubtotal = Math.round(subtotal * 100) / 100;
      state.subtotalAmount = roundedSubtotal;

      const discountPercentage = state.discountPercentage || 0;
      const discountAmount = (subtotal * discountPercentage) / 100;
      const roundedDiscount = Math.round(discountAmount * 100) / 100;

      const total = subtotal - discountAmount;
      const roundedTotal = Math.round(total * 100) / 100;

      state.totalAmount = roundedTotal;
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
  setTourGuide,
  toggleTourGuide,
  initializeTourGuides,
  removeHotel,
  removeCar,
  removeActivity,
  calculateTotal,
  setTotalAmount,
  resetReservation,
  initializeActivitiesFromDays,
} = tourReservationSlice.actions;

export const selectTourGuideForDay = (state, day) => {
  const dayKey = String(day);
  return state.tourReservation.selectedByDay[dayKey]?.tour_guide ?? true;
};

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

export const formatReservationForAPI = (state) => {
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

    const sortedDays = Object.entries(state.selectedByDay).sort(
      ([a], [b]) => parseInt(a) - parseInt(b)
    );

    sortedDays.forEach(([day, data]) => {
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
    const numberOfDays =
      state.tourData?.itinerary?.length ||
      state.tourData?.days?.length ||
      Object.keys(state.selectedByDay).length;

    const tourGuideData = [];

    for (let i = 1; i <= numberOfDays; i++) {
      const dayKey = String(i);
      const hasTourGuide =
        state.selectedByDay[dayKey]?.tour_guide !== false ? 1 : 0;
      tourGuideData.push(`${i}**${hasTourGuide}`);
    }

    const result = tourGuideData.join("**day**");

    return result;
  };

  const result = {
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
  };

  return result;
};

export default tourReservationSlice.reducer;
