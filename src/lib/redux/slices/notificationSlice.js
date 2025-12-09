import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  notifications: [],
  toasts: [],
  permission: "default",
  error: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("fcm_token", action.payload);
      }
    },
    setPermission: (state, action) => {
      state.permission = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    addToast: (state, action) => {
      state.toasts.push({
        id: Date.now() + Math.random(),
        ...action.payload,
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload
      );
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("fcm_token");
      }
    },
  },
});

export const {
  setToken,
  setPermission,
  addNotification,
  removeNotification,
  clearNotifications,
  addToast,
  removeToast,
  setError,
  clearToken,
} = notificationSlice.actions;

export default notificationSlice.reducer;
