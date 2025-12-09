"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { removeToast } from "../../lib/redux/slices/notificationSlice";

export default function Toast({ id, type, title, message, duration = 4000 }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(id));
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, dispatch]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
      default:
        return "ℹ";
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "info":
      default:
        return "#295570"; // Your custom color
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        backgroundColor: getBackgroundColor(),
        color: "white",
        padding: "16px",
        borderRadius: "8px",
        boxShadow:
          "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
        minWidth: "300px",
        maxWidth: "400px",
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <div
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          lineHeight: "1",
        }}
      >
        {getIcon()}
      </div>

      <div style={{ flex: 1 }}>
        <h4
          style={{ margin: "0 0 4px 0", fontWeight: "600", fontSize: "16px" }}
          className="text-white"
        >
          {title}
        </h4>
        <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>{message}</p>
      </div>

      <button
        onClick={() => dispatch(removeToast(id))}
        style={{
          background: "none",
          border: "none",
          color: "white",
          fontSize: "20px",
          cursor: "pointer",
          padding: "0",
          lineHeight: "1",
          opacity: 0.8,
        }}
      >
        ✕
      </button>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
