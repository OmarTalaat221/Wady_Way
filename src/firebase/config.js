import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

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

// ✅ Initialize Firebase app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// ✅ VAPID_KEY
export const VAPID_KEY =
  "BJAYCaJsWng8F02q8IyQSeqO7yrA3_inqTHPaJJtBNDlwSQjli47_xByDY8llZZyLaC8B9L1rnaN07-GgpBcH1g";

let analytics = null;
let messaging = null;

// ✅ Safe initialization — only on client side
if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
    console.log("✅ Firebase Messaging initialized successfully");
  } catch (error) {
    console.warn("⚠️ Firebase Messaging could not be initialized:", error);
    messaging = null;
  }

  isSupported()
    .then((yes) => {
      if (yes) {
        analytics = getAnalytics(app);
        console.log("✅ Firebase Analytics initialized");
      }
    })
    .catch(() => {
      console.warn("⚠️ Firebase Analytics not supported");
    });
}

export { app, analytics, messaging };
