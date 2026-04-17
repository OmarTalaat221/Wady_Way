"use client";
import React, { useState } from "react";
import { Modal } from "reactstrap";
import { IoClose } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { base_url } from "../../../../../../uitils/base_url";
import { useDispatch } from "react-redux";
import { setUserId } from "@/lib/redux/slices/tourReservationSlice";
import Link from "next/link";
import "./style.css";

const LoginRequiredModal = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSwitchToSignup,
}) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);
    try {
      const fcm_token =
        typeof window !== "undefined"
          ? localStorage.getItem("fcm_token")
          : null;

      const response = await axios.post(
        `${base_url}/user/auth/login.php`,
        { email, password, fcm_token },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === "success") {
        const userData = response.data.data ||
          response.data.user || {
            email,
            isLoggedIn: true,
            ...response.data.message,
          };
        const userId = userData?.id || userData?.user_id;

        localStorage.setItem("user", JSON.stringify(userData));
        if (userId) localStorage.setItem("user_id", String(userId));

        dispatch(setUserId(userId));

        toast.success("Login successful!");
        setEmail("");
        setPassword("");
        setErrors({});
        onLoginSuccess?.(userId);
        onClose();
      } else {
        toast.error(response.data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        toggle={onClose}
        centered
        size="md"
        className="login-required-modal"
      >
        <div
          style={{
            // background:
            // "linear-gradient(135deg, #1a2027 0%, #295557 25%, #1e3a3c 50%, #295557 75%, #2a2a2a 100%)",
            borderRadius: "24px",
            padding: "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Floating Particles */}
          <div
            style={{
              position: "absolute",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "linear-gradient(45deg, #e8a355, #295557)",
              opacity: 0.1,
              top: "5%",
              left: "5%",
              animation: "float 15s infinite ease-in-out",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(45deg, #e8a355, #295557)",
              opacity: 0.1,
              top: "15%",
              right: "10%",
              animation: "float 15s infinite ease-in-out 2s",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "linear-gradient(45deg, #e8a355, #295557)",
              opacity: 0.1,
              bottom: "10%",
              left: "15%",
              animation: "float 15s infinite ease-in-out 4s",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              background: "linear-gradient(45deg, #e8a355, #295557)",
              opacity: 0.1,
              bottom: "20%",
              right: "5%",
              animation: "float 15s infinite ease-in-out 6s",
            }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              zIndex: 20,
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "white",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.3)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
            }
          >
            <IoClose size={18} />
          </button>

          {/* Modal Content Card */}
          <div className="modern-modal-content">
            {/* Header */}
            <div className="modern-title">
              <Link
                href="/"
                className="flex justify-center m-auto pointer"
                style={{ width: "70px", height: "70px" }}
                onClick={onClose}
              >
                <img
                  className="!w-full !h-full !object-cover"
                  src="https://res.cloudinary.com/dbvh5i83q/image/upload/v1775980904/W_ppfn8j.png"
                  alt="Logo"
                />
              </Link>
              <p>Sign in to continue your journey</p>
            </div>

            {/* Form Body */}
            <div className="p-8">
              {/* Info Banner */}
              <div
                style={{
                  background: "rgba(232, 163, 85, 0.1)",
                  border: "1px solid rgba(232, 163, 85, 0.4)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "18px", marginTop: "-2px" }}>💡</span>
                <p
                  style={{
                    color: "#e8a355",
                    fontSize: "13px",
                    fontWeight: "600",
                    margin: 0,
                  }}
                >
                  Your selections are saved! Login and continue your booking
                  without losing anything.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    className={`modern-input ${errors.email ? "error" : ""}`}
                  />
                  {errors.email && (
                    <div className="error-message">{errors.email}</div>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="form-label">Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password)
                          setErrors({ ...errors, password: "" });
                      }}
                      className={`modern-input ${errors.password ? "error" : ""}`}
                      style={{ paddingRight: "50px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "16px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#295557",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0.7,
                        transition: "opacity 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "0.7")
                      }
                    >
                      {showPassword ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="error-message">{errors.password}</div>
                  )}
                </div>

                {/* Forgot Password */}
                <div style={{ textAlign: "right" }}>
                  <Link
                    href="/forgot-password"
                    className="modern-link"
                    onClick={onClose}
                    style={{ fontSize: "14px" }}
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button type="submit" className="modern-btn" disabled={loading}>
                  {loading && <span className="loading-spinner"></span>}
                  {loading ? "Signing In..." : "Sign In & Continue Booking"}
                </button>

                {/* Divider */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    margin: "8px 0",
                  }}
                >
                  <div
                    style={{ flex: 1, height: "1px", background: "#e5e7eb" }}
                  />
                  <span style={{ color: "#9ca3af", fontSize: "14px" }}>or</span>
                  <div
                    style={{ flex: 1, height: "1px", background: "#e5e7eb" }}
                  />
                </div>

                {/* Register Link */}
                <div style={{ textAlign: "center" }}>
                  <span style={{ color: "#295557", fontWeight: "600" }}>
                    Don't have an account?{" "}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSwitchToSignup?.();
                    }}
                    className="modern-link"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Register here
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .login-required-modal .modal-content {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 24px !important;
          overflow: hidden !important;
        }

        .login-required-modal .modal-dialog {
          max-width: 500px !important;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
            opacity: 0.1;
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(90deg);
            opacity: 0.2;
          }
          50% {
            transform: translateY(15px) translateX(-15px) rotate(180deg);
            opacity: 0.15;
          }
          75% {
            transform: translateY(-10px) translateX(20px) rotate(270deg);
            opacity: 0.25;
          }
        }
      `}</style>
    </>
  );
};

export default LoginRequiredModal;
