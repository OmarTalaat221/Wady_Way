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

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742474177/logo_qvee2o.png",
    badge: "/badge-icon.png",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
