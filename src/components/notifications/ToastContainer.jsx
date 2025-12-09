"use client";
import { useSelector } from "react-redux";
import Toast from "./Toast";

export default function ToastContainer() {
  const toasts = useSelector((state) => state.notification.toasts);

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}
