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
};

const tourReservationSlice = createSlice({
  name: "tourReservation",
  initialState,
  reducers: {
    setTourData: (state, action) => {
      state.tourData = action.payload;
      state.tourId = action.payload?.id;
    },

    //
    initializeActivitiesFromDays: (state, action) => {
      const days = action.payload;

      if (!days || !Array.isArray(days)) return;

      days.forEach((day, index) => {
        const dayKey = String(index + 1);

        // Initialize day structure
        if (!state.selectedByDay[dayKey]) {
          state.selectedByDay[dayKey] = { activities: [] };
        }
        if (!state.selectedByDay[dayKey].activities) {
          state.selectedByDay[dayKey].activities = [];
        }

        // ✅ Check both 'activities' and 'activities_options' (raw API data)
        const activitiesList =
          day.activities?.length > 0
            ? day.activities
            : day.activities_options || [];

        if (activitiesList.length > 0) {
          activitiesList.forEach((activity) => {
            // Get the correct ID
            const activityId = activity.id || parseInt(activity.activity_id);

            // Check if already exists in this day
            const exists = state.selectedByDay[dayKey].activities.some(
              (a) => a.id === activityId || a.activity_id === activityId
            );

            if (!exists && activityId) {
              state.selectedByDay[dayKey].activities.push({
                id: activityId,
                activity_id: activityId,
                title: activity.title,
                name: activity.title,
                image: activity.image?.split("//CAMP//")[0] || activity.image,
                price: parseFloat(
                  activity.price_current || activity.price || 0
                ),
                price_current: parseFloat(
                  activity.price_current || activity.price || 0
                ),
                duration: activity.duration,
                difficulty: activity.difficulty,
                isDefault: true,
              });
            }
          });
        }
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
        state.selectedByDay[dayKey] = {};
      }
      state.selectedByDay[dayKey].hotel = hotel;
    },

    selectCar: (state, action) => {
      const { day, car } = action.payload;
      const dayKey = String(day);

      if (!state.selectedByDay[dayKey]) {
        state.selectedByDay[dayKey] = {};
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
        (a) => a.id === activity.id
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
        state.selectedByDay[dayKey] = {};
      }
      state.selectedByDay[dayKey].tour_guide = value;
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
      let total = 0;

      if (state.tourData) {
        total += parseFloat(state.tourData.per_adult || 0) * state.numAdults;
        total += parseFloat(state.tourData.per_child || 0) * state.numChildren;
      }

      Object.values(state.selectedByDay).forEach((day) => {
        if (day.hotel) {
          total += parseFloat(
            day.hotel.adult_price || day.hotel.price_per_night || 0
          );
        }
        if (day.car) {
          total += parseFloat(day.car.price_current || day.car.price || 0);
        }
        if (day.activities) {
          day.activities.forEach((activity) => {
            total += parseFloat(activity.price_current || activity.price || 0);
          });
        }
      });

      state.totalAmount = Math.round(total * 100) / 100;
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
  removeHotel,
  removeCar,
  removeActivity,
  calculateTotal,
  setTotalAmount,
  resetReservation,
  initializeActivitiesFromDays, // ✅ Export new action
} = tourReservationSlice.actions;

// Format for API
export const formatReservationForAPI = (state) => {
  const formatDayData = (key) => {
    return Object.entries(state.selectedByDay)
      .sort(([a], [b]) => parseInt(a) - parseInt(b)) // ✅ Sort by day number
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

  // ✅ Fixed: Ensure all activities from all days are included
  const formatActivities = () => {
    const allActivities = [];

    // Sort days numerically
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

    console.log("📋 Formatted activities:", allActivities); // Debug log
    return allActivities.join("**day**");
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
    start_date: state.startDate,
    end_date: state.endDate,
  };

  console.log("📤 API Request Data:", result); // Debug log
  return result;
};
export default tourReservationSlice.reducer;
