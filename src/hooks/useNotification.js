"use client";

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getToken, onMessage } from "firebase/messaging";
import { messaging, VAPID_KEY } from "../firebase/config";
import {
  setToken,
  setPermission,
  addNotification,
  addToast,
  setError,
} from "../lib/redux/slices/notificationSlice";

export const useNotification = () => {
  const dispatch = useDispatch();
  const { token, permission, notifications, toasts } = useSelector(
    (state) => state.notification
  );

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("fcm_token");
    if (savedToken) {
      dispatch(setToken(savedToken));
    }
  }, [dispatch]);

  const requestPermission = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission();
      dispatch(setPermission(permission));

      if (permission === "granted") {
        const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });

        if (fcmToken) {
          dispatch(setToken(fcmToken));
          console.log("FCM Token:", fcmToken);

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
  }, [dispatch]);

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
  }, [dispatch]);

  return {
    token,
    permission,
    notifications,
    toasts,
    requestPermission,
  };
};
