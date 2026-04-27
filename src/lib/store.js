import { configureStore } from "@reduxjs/toolkit";
import tourReservationReducer from "./redux/slices/tourReservationSlice";
import notificationReducer from "./redux/slices/notificationSlice";

// ✅ الـ store نظيف تماماً
// ❌ تم حذف loadState  — كانت بتقرأ من "tourReservation" (deprecated)
// ❌ تم حذف saveState  — كانت بتكتب في "tourReservation" (deprecated)
// ❌ تم حذف store.subscribe — كان بيعمل double write
// ✅ كل الـ localStorage بيتهندل داخل tourReservationSlice فقط
// ✅ عبر "tourReservations" (plural) فقط

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      tourReservation: tourReservationReducer,
      notification: notificationReducer,
    },
  });

  return store;
};
