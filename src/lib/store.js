import { configureStore } from "@reduxjs/toolkit";
import tourReservationReducer from "./redux/slices/tourReservationSlice";
import notificationReducer from "./redux/slices/notificationSlice";

const loadState = () => {
  if (typeof window === "undefined") return undefined;

  try {
    const serializedState = localStorage.getItem("tourReservation");
    if (serializedState === null) return undefined;
    return { tourReservation: JSON.parse(serializedState) };
  } catch (err) {
    console.error("Error loading state:", err);
    return undefined;
  }
};

const saveState = (state) => {
  if (typeof window === "undefined") return;

  try {
    const serializedState = JSON.stringify(state.tourReservation);
    localStorage.setItem("tourReservation", serializedState);
  } catch (err) {
    console.error("Error saving state:", err);
  }
};

export const makeStore = () => {
  const preloadedState = loadState();

  const store = configureStore({
    reducer: {
      tourReservation: tourReservationReducer,
      notification: notificationReducer,
    },
    preloadedState,
  });

  store.subscribe(() => {
    saveState(store.getState());
  });

  return store;
};
