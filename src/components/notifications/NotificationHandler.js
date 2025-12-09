"use client";
import { useEffect } from "react";
import { useNotification } from "../../hooks/useNotification";

export default function NotificationHandler({ children }) {
  const { requestPermission, permission } = useNotification();

  useEffect(() => {
    // Auto request permission on mount (optional)
    requestPermission();
  }, []);

  return <>{children}</>;
}
