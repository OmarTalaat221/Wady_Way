"use client";

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getToken, onMessage } from "firebase/messaging";
import { messaging, VAPID_KEY } from "../firebase/config";
import axios from "axios";
import {
  setToken,
  setPermission,
  addNotification,
  addToast,
  setError,
  setNotificationsEnabled,
} from "../lib/redux/slices/notificationSlice";

const base_url = "https://camp-coding.tech/wady-way";

export const useNotification = () => {
  const dispatch = useDispatch();
  const { token, permission, notifications, toasts, notificationsEnabled } =
    useSelector((state) => state.notification);

  // Load token and notification preference from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("fcm_token");
    if (savedToken) {
      dispatch(setToken(savedToken));
    }

    const savedPreference = localStorage.getItem("notifications_enabled");
    if (savedPreference !== null) {
      dispatch(setNotificationsEnabled(JSON.parse(savedPreference)));
    }
  }, [dispatch]);

  // Function to save FCM token to backend
  const saveFCMToken = useCallback(async (fcmToken) => {
    try {
      const user = localStorage.getItem("user");
      if (!user) {
        console.error("No user found in localStorage");
        return;
      }

      const userData = JSON.parse(user);
      const userId = userData.user_id || userData.id;

      const response = await axios.post(
        `${base_url}/user/auth/save_fcmtoken.php`,
        {
          user_id: userId,
          fcm_token: fcmToken,
        }
      );

      if (response.data.status === "success") {
        console.log("FCM token saved to backend successfully");
      } else {
        console.error("Failed to save FCM token:", response.data.message);
      }
    } catch (error) {
      console.error("Error saving FCM token to backend:", error);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    // Check if notifications are enabled by user preference
    if (!notificationsEnabled) {
      console.log("Notifications are disabled by user preference");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      dispatch(setPermission(permission));

      if (permission === "granted") {
        const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });

        if (fcmToken) {
          dispatch(setToken(fcmToken));
          console.log("FCM Token:", fcmToken);

          // Save token to backend
          await saveFCMToken(fcmToken);

          // // Show success toast
          // dispatch(
          //   addToast({
          //     type: "success",
          //     title: "Notifications Enabled",
          //     message: "You will now receive notifications",
          //   })
          // );

          // Send this token to your server
          return fcmToken;
        } else {
          console.log("No registration token available.");
          dispatch(
            addToast({
              type: "error",
              title: "Token Error",
              message: "Could not generate notification token",
            })
          );
        }
      } else {
        dispatch(
          addToast({
            type: "warning",
            title: "Permission Denied",
            message: "Notifications have been blocked",
          })
        );
      }
    } catch (error) {
      console.error("Error getting notification permission:", error);
      dispatch(setError(error.message));
      dispatch(
        addToast({
          type: "error",
          title: "Error",
          message: error.message,
        })
      );
    }
  }, [dispatch, notificationsEnabled, saveFCMToken]);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received in foreground:", payload);

      // Check if notifications are enabled by user preference
      if (!notificationsEnabled) {
        console.log("Notification blocked: User has disabled notifications");
        return; // Don't show notification if disabled
      }

      const notification = {
        id: Date.now(),
        title: payload.notification?.title || "New Notification",
        body: payload.notification?.body || "",
        data: payload.data || {},
        timestamp: new Date().toISOString(),
      };

      dispatch(addNotification(notification));

      // Show toast notification
      dispatch(
        addToast({
          type: "info",
          title: notification.title,
          message: notification.body,
          duration: 5000,
        })
      );
    });

    return () => unsubscribe();
  }, [dispatch, notificationsEnabled]);

  return {
    token,
    permission,
    notifications,
    toasts,
    requestPermission,
    notificationsEnabled,
  };
};
