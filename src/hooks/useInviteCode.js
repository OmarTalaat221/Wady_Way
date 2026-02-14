// hooks/useInviteCode.js
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

const INVITE_CODE_STORAGE_KEY = "wady_invite_codes";
const INVITE_CODE_EXPIRY_DAYS = 30;

export const INVITE_CODE_TYPES = {
  TRANSPORT: "transport",
  HOTEL: "hotel",
  ACTIVITY: "activity",
  TOUR: "tour",
};

const URL_PARAM_NAMES = {
  [INVITE_CODE_TYPES.TRANSPORT]: "transport-invite-code",
  [INVITE_CODE_TYPES.HOTEL]: "hotel-invite-code",
  [INVITE_CODE_TYPES.ACTIVITY]: "activity-invite-code",
  [INVITE_CODE_TYPES.TOUR]: "tour-invite-code",
};

export const useInviteCode = (itemType, itemId) => {
  const searchParams = useSearchParams();
  const [inviteCode, setInviteCode] = useState("");
  const [hasStoredCode, setHasStoredCode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getStoredCodes = useCallback(() => {
    try {
      if (typeof window === "undefined") return {};
      const stored = localStorage.getItem(INVITE_CODE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  const storeInviteCode = useCallback(
    (type, id, code) => {
      if (!code || !code.trim()) return;

      try {
        const storedCodes = getStoredCodes();
        const key = `${type}_${id}`;

        storedCodes[key] = {
          code: code.trim(),
          type,
          itemId: id,
          storedAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + INVITE_CODE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
          ).toISOString(),
        };

        localStorage.setItem(
          INVITE_CODE_STORAGE_KEY,
          JSON.stringify(storedCodes)
        );
        console.log(`✅ Invite code stored for ${type} #${id}: ${code}`);
      } catch (error) {
        console.error("Error storing invite code:", error);
      }
    },
    [getStoredCodes]
  );

  const getStoredInviteCode = useCallback(
    (type, id) => {
      try {
        const storedCodes = getStoredCodes();
        const key = `${type}_${id}`;
        const stored = storedCodes[key];

        if (!stored) return null;

        if (new Date(stored.expiresAt) < new Date()) {
          delete storedCodes[key];
          localStorage.setItem(
            INVITE_CODE_STORAGE_KEY,
            JSON.stringify(storedCodes)
          );
          return null;
        }

        return stored.code;
      } catch {
        return null;
      }
    },
    [getStoredCodes]
  );

  // ✅ دالة حذف الكود - محدثة
  const removeInviteCode = useCallback(
    (type, id) => {
      try {
        const storedCodes = getStoredCodes();
        const key = `${type}_${id}`;

        if (storedCodes[key]) {
          delete storedCodes[key];
          localStorage.setItem(
            INVITE_CODE_STORAGE_KEY,
            JSON.stringify(storedCodes)
          );
          console.log(`🗑️ Invite code removed for ${type} #${id}`);
        }

        // Reset state
        setInviteCode("");
        setHasStoredCode(false);
      } catch (error) {
        console.error("Error removing invite code:", error);
      }
    },
    [getStoredCodes]
  );

  // ✅ دالة جديدة: حذف الكود الحالي (للاستخدام بعد الحجز الناجح)
  const clearCurrentInviteCode = useCallback(() => {
    if (itemType && itemId) {
      removeInviteCode(itemType, itemId);
    }
  }, [itemType, itemId, removeInviteCode]);

  const cleanExpiredCodes = useCallback(() => {
    try {
      const storedCodes = getStoredCodes();
      const now = new Date();
      let hasChanges = false;

      Object.keys(storedCodes).forEach((key) => {
        if (new Date(storedCodes[key].expiresAt) < now) {
          delete storedCodes[key];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        localStorage.setItem(
          INVITE_CODE_STORAGE_KEY,
          JSON.stringify(storedCodes)
        );
      }
    } catch (error) {
      console.error("Error cleaning expired codes:", error);
    }
  }, [getStoredCodes]);

  useEffect(() => {
    if (!itemType || !itemId) {
      setIsLoading(false);
      return;
    }

    cleanExpiredCodes();

    const paramName = URL_PARAM_NAMES[itemType];
    const urlInviteCode = searchParams.get(paramName);

    if (urlInviteCode && urlInviteCode.trim()) {
      storeInviteCode(itemType, itemId, urlInviteCode);
      setInviteCode(urlInviteCode.trim());
      setHasStoredCode(true);
      console.log(`📥 Invite code from URL: ${urlInviteCode}`);
    } else {
      const storedCode = getStoredInviteCode(itemType, itemId);
      if (storedCode) {
        setInviteCode(storedCode);
        setHasStoredCode(true);
        console.log(`📦 Invite code from storage: ${storedCode}`);
      } else {
        setHasStoredCode(false);
        console.log(`❌ No invite code found for ${itemType} #${itemId}`);
      }
    }

    setIsLoading(false);
  }, [
    itemType,
    itemId,
    searchParams,
    storeInviteCode,
    getStoredInviteCode,
    cleanExpiredCodes,
  ]);

  const setManualInviteCode = useCallback(
    (code) => {
      if (!itemType || !itemId) return;

      if (code && code.trim()) {
        storeInviteCode(itemType, itemId, code);
        setInviteCode(code.trim());
        setHasStoredCode(true);
      }
    },
    [itemType, itemId, storeInviteCode]
  );

  return {
    inviteCode,
    hasStoredCode,
    isLoading,
    setManualInviteCode,
    clearCurrentInviteCode, // ✅ دالة جديدة للحذف بعد الحجز
    removeInviteCode: () => removeInviteCode(itemType, itemId),
    storeInviteCode,
    getStoredInviteCode,
  };
};

export default useInviteCode;
