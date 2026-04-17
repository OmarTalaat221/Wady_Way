"use client";

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setToken,
  setPermission,
  addNotification,
  addToast,
  setError,
  setNotificationsEnabled,
} from "../lib/redux/slices/notificationSlice";

const base_url = "https://camp-coding.tech/wady-way";

let firebaseGetToken = null;
let firebaseOnMessage = null;
let firebaseMessaging = null;
let firebaseVapidKey = null;
let firebaseLoaded = false;

const loadFirebase = async () => {
  if (firebaseLoaded) return true;

  try {
    const messagingModule = await import("firebase/messaging");
    const configModule = await import("../firebase/config");

    firebaseGetToken = messagingModule.getToken;
    firebaseOnMessage = messagingModule.onMessage;
    firebaseMessaging = configModule.messaging;
    firebaseVapidKey = configModule.VAPID_KEY;

    if (!firebaseMessaging) {
      console.warn("Firebase messaging is null");
      return false;
    }

    firebaseLoaded = true;
    console.log("✅ Firebase loaded dynamically");
    return true;
  } catch (error) {
    console.warn("⚠️ Firebase could not be loaded:", error);
    return false;
  }
};

const isPushSupported = () => {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  if (!("serviceWorker" in navigator)) return false;
  if (!("PushManager" in window)) return false;
  return true;
};

const isBraveBrowser = async () => {
  try {
    if (typeof navigator !== "undefined" && navigator.brave) {
      return await navigator.brave.isBrave();
    }
    return false;
  } catch {
    return false;
  }
};

const stripHtml = (html) => {
  if (!html) return "";
  let text = html.replace(/<[^>]*>/g, "");
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text;
};

export const useNotification = () => {
  const dispatch = useDispatch();
  const { token, permission, notifications, toasts, notificationsEnabled } =
    useSelector((state) => state.notification);

  // ✅ Load saved data on mount
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

  // ✅ Save FCM token to backend
  const saveFCMToken = useCallback(async (fcmToken) => {
    try {
      const user = localStorage.getItem("user");
      if (!user) {
        console.error("No user found in localStorage");
        return;
      }

      const userData = JSON.parse(user);
      const userId = userData.user_id || userData.id;

      const response = await fetch(`${base_url}/user/auth/save_fcmtoken.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          fcm_token: fcmToken,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        console.log("✅ FCM token saved to backend");
      } else {
        console.error("❌ Failed to save FCM token:", data.message);
      }
    } catch (error) {
      console.error("❌ Error saving FCM token:", error);
    }
  }, []);

  // ✅ Request permission and get token
  const requestPermission = useCallback(async () => {
    if (!notificationsEnabled) {
      console.log("Notifications disabled by user preference");
      return;
    }

    if (!isPushSupported()) {
      console.warn("Push not supported");
      dispatch(
        addToast({
          type: "warning",
          title: "Not Supported",
          message: "Push notifications are not supported in your browser",
        })
      );
      return;
    }

    const brave = await isBraveBrowser();
    if (brave) {
      console.warn("Brave detected");
      dispatch(
        addToast({
          type: "warning",
          title: "Brave Browser",
          message:
            "Disable Brave Shields for this site to enable notifications",
        })
      );
    }

    try {
      const notifPermission = await Notification.requestPermission();
      dispatch(setPermission(notifPermission));

      if (notifPermission !== "granted") {
        dispatch(
          addToast({
            type: "warning",
            title: "Permission Denied",
            message: "Notifications have been blocked",
          })
        );
        return;
      }

      // ✅ Wait for SW to be ready
      const swRegistration = await navigator.serviceWorker.ready;
      console.log("✅ SW ready:", swRegistration);

      // ✅ Load Firebase
      const loaded = await loadFirebase();
      if (!loaded || !firebaseMessaging || !firebaseGetToken) {
        console.warn("Firebase not available");
        dispatch(
          addToast({
            type: "warning",
            title: "Limited",
            message: "Push blocked by browser. Try disabling ad-blocker",
          })
        );
        return;
      }

      try {
        // ✅ Get token with SW registration
        const fcmToken = await firebaseGetToken(firebaseMessaging, {
          vapidKey: firebaseVapidKey,
          serviceWorkerRegistration: swRegistration,
        });

        if (fcmToken) {
          dispatch(setToken(fcmToken));
          localStorage.setItem("fcm_token", fcmToken);
          console.log("✅ FCM Token:", fcmToken);
          await saveFCMToken(fcmToken);
          return fcmToken;
        } else {
          console.log("No token available");
          dispatch(
            addToast({
              type: "error",
              title: "Token Error",
              message: "Could not generate notification token",
            })
          );
        }
      } catch (tokenError) {
        console.error("❌ FCM token error:", tokenError);
        dispatch(
          addToast({
            type: "warning",
            title: "Blocked",
            message: "Firebase blocked. Disable shields and try again",
          })
        );
        dispatch(setError(tokenError.message));
      }
    } catch (error) {
      console.error("❌ Permission error:", error);
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

  // ✅ Register Service Worker
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator))
      return;

    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log("✅ SW registered:", registration);
        registration.update();
      })
      .catch((error) => {
        console.error("❌ SW registration failed:", error);
      });
  }, []);

  // ✅ Foreground message listener
  useEffect(() => {
    let unsubscribe = null;

    const setup = async () => {
      const loaded = await loadFirebase();
      if (!loaded || !firebaseMessaging || !firebaseOnMessage) {
        console.warn("Firebase not available — no foreground listener");
        return;
      }

      unsubscribe = firebaseOnMessage(firebaseMessaging, (payload) => {
        console.log("📩 Foreground message:", payload);

        if (!notificationsEnabled) {
          console.log("Blocked by user preference");
          return;
        }

        const rawTitle =
          payload.notification?.title ||
          payload.data?.notification_title ||
          "New Notification";

        const rawBody =
          payload.notification?.body || payload.data?.notification_body || "";

        const notification = {
          id: Date.now(),
          title: stripHtml(rawTitle),
          body: stripHtml(rawBody),
          data: payload.data || {},
          timestamp: new Date().toISOString(),
        };

        dispatch(addNotification(notification));
        dispatch(
          addToast({
            type: "info",
            title: notification.title,
            message: notification.body,
            duration: 5000,
          })
        );
      });
    };

    setup();

    return () => {
      if (unsubscribe) unsubscribe();
    };
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
