importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyD_HjLoBWO0A4cqJjYcnhAq_kaXOu1OpaA",
  authDomain: "wadiway-1b3dc.firebaseapp.com",
  databaseURL:
    "https://wadiway-1b3dc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wadiway-1b3dc",
  storageBucket: "wadiway-1b3dc.firebasestorage.app",
  messagingSenderId: "109343723044",
  appId: "1:109343723044:web:c4f1b2e801290278ae92b1",
  measurementId: "G-NYZJF88E5K",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ✅ Strip HTML
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
  return text.replace(/\s+/g, " ").trim();
};

// ✅ Let Firebase handle background via onBackgroundMessage ONLY
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  // ✅ Close any existing notifications with same tag to prevent duplicates
  self.registration
    .getNotifications({ tag: "fcm-notification" })
    .then((notifications) => {
      notifications.forEach((n) => n.close());
    });

  const rawTitle =
    payload.notification?.title ||
    payload.data?.notification_title ||
    payload.data?.title ||
    "New Notification";

  const rawBody =
    payload.notification?.body ||
    payload.data?.notification_body ||
    payload.data?.body ||
    "";

  const cleanTitle = stripHtml(rawTitle);
  const cleanBody = stripHtml(rawBody);

  console.log("[SW] Showing notification:", cleanTitle, cleanBody);

  return self.registration.showNotification(cleanTitle, {
    body: cleanBody,
    icon: "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742474177/logo_qvee2o.png",
    badge: "/logo.png",
    data: payload.data || {},
    // ✅ Same tag = replace duplicate
    tag: "fcm-notification",
    renotify: true,
  });
});

// ✅ Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked");
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
  );
});

// ✅ Force activate immediately
self.addEventListener("install", () => {
  console.log("[SW] Installing...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");
  event.waitUntil(clients.claim());
});
