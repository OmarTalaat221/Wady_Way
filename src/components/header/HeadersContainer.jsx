"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import { base_url } from "../../uitils/base_url";
import Header from "./Header";
import MobileHeader from "../mobileHeader/MobileHeader";

const initialSeenState = {
  tour: "0",
  hotel: "0",
  car: "0",
  activity: "0",
};

export default function HeadersContainer({ currentLocale }) {
  const pathname = usePathname();
  const [seenData, setSeenData] = useState(initialSeenState);

  const initializedRef = useRef(false);
  const initializingRef = useRef(false);
  const lastHandledPathRef = useRef("");

  const getStoredUserId = useCallback(() => {
    try {
      const rawUser =
        localStorage.getItem("user") || localStorage.getItem("user_data");

      if (!rawUser) return null;

      const parsedUser = JSON.parse(rawUser);

      return (
        parsedUser?.user_id ||
        parsedUser?.id ||
        parsedUser?.user?.user_id ||
        null
      );
    } catch (error) {
      console.error("Failed to parse stored user:", error);
      return null;
    }
  }, []);

  const getTypeFromPathname = useCallback((path = "") => {
    if (path.startsWith("/package")) return "tour";
    if (path.startsWith("/hotel-suits")) return "hotel";
    if (path.startsWith("/transport")) return "car";
    if (path.startsWith("/activities")) return "activity";
    return null;
  }, []);

  const fetchSeen = useCallback(async (userId) => {
    try {
      const res = await axios.post(`${base_url}/user/seen/select_seen.php`, {
        user_id: userId,
      });

      if (res.data?.status === "success" && res.data?.message?.length > 0) {
        const seen = res.data.message[0];

        setSeenData({
          tour: seen.tour ?? "0",
          hotel: seen.hotel ?? "0",
          car: seen.car ?? "0",
          activity: seen.activity ?? "0",
        });
      } else {
        setSeenData(initialSeenState);
      }
    } catch (error) {
      console.error("Fetch seen failed:", error);
      setSeenData(initialSeenState);
    }
  }, []);

  const updateSeen = useCallback(async (userId, type) => {
    try {
      const res = await axios.post(`${base_url}/user/seen/update_seen.php`, {
        user_id: userId,
        type,
      });

      if (res.data?.status === "success") {
        // 1 = فيه تحديث جديد
        // 0 = مفيش تحديث
        setSeenData((prev) => ({
          ...prev,
          [type]: "0",
        }));
      }
    } catch (error) {
      console.error("Seen update failed:", error);
    }
  }, []);

  // أول تحميل فقط: هات seen data مرة واحدة
  useEffect(() => {
    let ignore = false;

    const initHeaders = async () => {
      const userId = getStoredUserId();
      if (!userId || initializedRef.current || initializingRef.current) return;

      initializingRef.current = true;

      try {
        await fetchSeen(userId);

        const currentType = getTypeFromPathname(pathname);
        if (!ignore && currentType) {
          await updateSeen(userId, currentType);
        }

        lastHandledPathRef.current = pathname;
        initializedRef.current = true;
      } finally {
        initializingRef.current = false;
      }
    };

    initHeaders();

    return () => {
      ignore = true;
    };
  }, [pathname, getStoredUserId, getTypeFromPathname, fetchSeen, updateSeen]);

  // بعد كده في كل تنقل بين الصفحات: update فقط لو الصفحة من الأنواع دي
  useEffect(() => {
    if (!initializedRef.current) return;

    const userId = getStoredUserId();
    if (!userId) return;

    if (lastHandledPathRef.current === pathname) return;
    lastHandledPathRef.current = pathname;

    const type = getTypeFromPathname(pathname);
    if (!type) return;

    updateSeen(userId, type);
  }, [pathname, getStoredUserId, getTypeFromPathname, updateSeen]);

  return (
    <>
      <Header currentLocale={currentLocale} seenData={seenData} />
      <MobileHeader currentLocale={currentLocale} seenData={seenData} />
    </>
  );
}
