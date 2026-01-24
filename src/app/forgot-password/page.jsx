"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "antd";
import axios from "axios";
import Link from "../../components/link";
import "./_components/style.css";
import "../login/_components/style.css";
import toast from "react-hot-toast";
import { base_url } from "../../uitils/base_url";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Timer for resend countdown
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // ============================================
  // Step 1: Send Code
  // ============================================
  const handleSendCode = async (e) => {
    e.preventDefault();

    if (!email) {
      setErrors({ email: "Email is required" });
      toast.error("Please enter your email");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "Email is invalid" });
      toast.error("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        `${base_url}/user/auth/send_forget_code.php`,
        { email: email }
      );

      if (response.data.status === "success") {
        toast.success("Verification code sent to your email!");
        setIsModalOpen(true);
        setResendTimer(60);
        setStep(2);
      } else {
        toast.error(response.data.message || "Failed to send code");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // OTP Handling
  // ============================================
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pastedData) return;
    const newOtp = ["", "", "", "", "", ""];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    const lastIndex = Math.min(pastedData.length - 1, 5);
    otpRefs[lastIndex].current?.focus();
  };

  // ============================================
  // Step 2: Verify Code
  // ============================================
  const handleVerifyCode = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${base_url}/user/auth/verify_code.php`,
        { email: email, code: code }
      );

      if (response.data.status === "success") {
        toast.success("Code verified successfully!");
        setIsModalOpen(false);
        setStep(3);
      } else {
        toast.error(response.data.message || "Invalid code");
        setOtp(["", "", "", "", "", ""]);
        otpRefs[0].current?.focus();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Verification failed. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs[0].current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // Resend Code
  // ============================================
  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${base_url}/user/auth/send_forget_code.php`,
        { email: email }
      );

      if (response.data.status === "success") {
        toast.success("New verification code sent!");
        setResendTimer(60);
        setOtp(["", "", "", "", "", ""]);
        otpRefs[0].current?.focus();
      } else {
        toast.error(response.data.message || "Failed to resend code");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // Step 3: Reset Password
  // ============================================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!passwords.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        `${base_url}/user/auth/create_new_password.php`,
        {
          email: email,
          new_password: passwords.newPassword,
        }
      );

      if (response.data.status === "success") {
        toast.success("Password updated successfully!");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        toast.error(response.data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // Password Strength Calculator
  // ============================================
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const passwordStrength = getPasswordStrength(passwords.newPassword);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#ef4444", "#f59e0b", "#10b981", "#059669"];

  // ============================================
  // Animation Variants
  // ============================================
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.2 },
    },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <>
      <div className="login-container forgot-password-container">
        {/* Floating Particles */}
        <div className="floating-particle particle-1"></div>
        <div className="floating-particle particle-2"></div>
        <div className="floating-particle particle-3"></div>
        <div className="floating-particle particle-4"></div>
        <div className="floating-particle particle-5"></div>
        <div className="floating-particle particle-6"></div>

        <div className="form-container forgot-form-container">
          <motion.div
            className="modern-modal-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="modern-title forgot-title"
              variants={titleVariants}
            >
              <h2 className="forgot-heading">
                {step === 1 && "Forgot Password?"}
                {step === 3 && "Create New Password"}
              </h2>

              {/* Step Indicator */}
              <div className="step-indicator">
                <div
                  className={`step ${step >= 1 ? "active" : ""} ${
                    step > 1 ? "completed" : ""
                  }`}
                >
                  <span>{step > 1 ? "✓" : "1"}</span>
                  <div className="step-label">Email</div>
                </div>
                <div className={`step-line ${step > 1 ? "active" : ""}`}></div>
                <div
                  className={`step ${step >= 2 ? "active" : ""} ${
                    step > 2 ? "completed" : ""
                  }`}
                >
                  <span>{step > 2 ? "✓" : "2"}</span>
                  <div className="step-label">Verify</div>
                </div>
                <div className={`step-line ${step > 2 ? "active" : ""}`}></div>
                <div className={`step ${step >= 3 ? "active" : ""}`}>
                  <span>3</span>
                  <div className="step-label">Reset</div>
                </div>
              </div>
            </motion.div>

            <div className="forgot-form-body">
              <AnimatePresence mode="wait">
                {/* ============================================ */}
                {/* Step 1: Email Form */}
                {/* ============================================ */}
                {step === 1 && (
                  <motion.form
                    key="step1"
                    onSubmit={handleSendCode}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="forgot-form"
                  >
                    <motion.div className="form-group" variants={itemVariants}>
                      <label className="form-label">Email Address</label>
                      <div className="input-with-icon">
                        <input
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({});
                          }}
                          className={`modern-input with-icon ${
                            errors.email ? "error" : ""
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <div className="error-message">{errors.email}</div>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <button
                        type="submit"
                        className="modern-btn forgot-btn"
                        disabled={isLoading}
                      >
                        {isLoading && <span className="loading-spinner"></span>}
                        <span className="btn-text">
                          {isLoading
                            ? "Sending Code..."
                            : "Send Verification Code"}
                        </span>
                      </button>
                    </motion.div>

                    <motion.div
                      className="back-link-container"
                      variants={itemVariants}
                    >
                      <span className="back-text">
                        Remember your password?{" "}
                      </span>
                      <Link href="/login" className="modern-link">
                        Back to Sign In
                      </Link>
                    </motion.div>
                  </motion.form>
                )}

                {/* ============================================ */}
                {/* Step 3: New Password Form */}
                {/* ============================================ */}
                {step === 3 && (
                  <motion.form
                    key="step3"
                    onSubmit={handleResetPassword}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="forgot-form"
                  >
                    {/* New Password Field */}
                    <motion.div className="form-group" variants={itemVariants}>
                      <label className="form-label">New Password</label>
                      <div className="input-with-icon">
                        <input
                          type={showPassword.new ? "text" : "password"}
                          placeholder="Enter new password"
                          value={passwords.newPassword}
                          onChange={(e) => {
                            setPasswords({
                              ...passwords,
                              newPassword: e.target.value,
                            });
                            if (errors.newPassword) {
                              setErrors({ ...errors, newPassword: "" });
                            }
                          }}
                          className={`modern-input with-icon has-toggle ${
                            errors.newPassword ? "error" : ""
                          }`}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() =>
                            setShowPassword({
                              ...showPassword,
                              new: !showPassword.new,
                            })
                          }
                        >
                          {showPassword.new ? (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3 3L21 21M10.5 10.677C9.83939 11.055 9.39954 11.7146 9.39954 12.5C9.39954 13.7426 10.3422 14.5 11.5 14.5C12.3085 14.5 12.9963 14.0601 13.3743 13.3995"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M9.76404 5.29519C10.4664 5.10724 11.2123 5 12 5C15.7574 5 18.5641 7.1748 20.2313 8.88633C21.0175 9.69667 21.4106 10.1018 21.6649 10.7823C21.8203 11.1959 21.9 11.8131 21.9 12.5C21.9 13.1869 21.8203 13.8041 21.6649 14.2177C21.5518 14.5193 21.3842 14.7833 21.1514 15.0802"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M5.84365 6.49835C4.1083 7.91455 2.95069 9.73395 2.33509 10.7823C2.17969 11.0459 2.1 11.2131 2.1 12.5C2.1 13.7869 2.17969 13.9541 2.33509 14.2177C2.58938 14.8982 2.98249 15.3033 3.76873 16.1137C5.43588 17.8252 8.24264 20 12 20C13.4319 20 14.7121 19.6891 15.8435 19.2015"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 5C15.7574 5 18.5641 7.1748 20.2313 8.88633C21.0175 9.69667 21.4106 10.1018 21.6649 10.7823C21.8203 11.1959 21.9 11.8131 21.9 12.5C21.9 13.1869 21.8203 13.8041 21.6649 14.2177C21.4106 14.8982 21.0175 15.3033 20.2313 16.1137C18.5641 17.8252 15.7574 20 12 20C8.24264 20 5.43588 17.8252 3.76873 16.1137C2.98249 15.3033 2.58938 14.8982 2.33509 14.2177C2.17969 13.8041 2.1 13.1869 2.1 12.5C2.1 11.8131 2.17969 11.1959 2.33509 10.7823C2.58938 10.1018 2.98249 9.69667 3.76873 8.88633C5.43588 7.1748 8.24264 5 12 5Z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <circle
                                cx="12"
                                cy="12.5"
                                r="3"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <div className="error-message">
                          {errors.newPassword}
                        </div>
                      )}

                      {/* Password Strength Indicator */}
                      {passwords.newPassword && (
                        <div className="password-strength">
                          <div className="strength-bars">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className={`strength-bar ${
                                  passwordStrength >= level ? "active" : ""
                                }`}
                                style={{
                                  backgroundColor:
                                    passwordStrength >= level
                                      ? strengthColors[passwordStrength]
                                      : "#e5e7eb",
                                }}
                              ></div>
                            ))}
                          </div>
                          <span
                            className="strength-text"
                            style={{ color: strengthColors[passwordStrength] }}
                          >
                            {strengthLabels[passwordStrength]}
                          </span>
                        </div>
                      )}
                    </motion.div>

                    {/* Confirm Password Field */}
                    <motion.div className="form-group" variants={itemVariants}>
                      <label className="form-label">Confirm Password</label>
                      <div className="input-with-icon">
                        <input
                          type={showPassword.confirm ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={passwords.confirmPassword}
                          onChange={(e) => {
                            setPasswords({
                              ...passwords,
                              confirmPassword: e.target.value,
                            });
                            if (errors.confirmPassword) {
                              setErrors({ ...errors, confirmPassword: "" });
                            }
                          }}
                          className={`modern-input with-icon has-toggle ${
                            errors.confirmPassword ? "error" : ""
                          }`}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() =>
                            setShowPassword({
                              ...showPassword,
                              confirm: !showPassword.confirm,
                            })
                          }
                        >
                          {showPassword.confirm ? (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3 3L21 21M10.5 10.677C9.83939 11.055 9.39954 11.7146 9.39954 12.5C9.39954 13.7426 10.3422 14.5 11.5 14.5C12.3085 14.5 12.9963 14.0601 13.3743 13.3995"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M9.76404 5.29519C10.4664 5.10724 11.2123 5 12 5C15.7574 5 18.5641 7.1748 20.2313 8.88633C21.0175 9.69667 21.4106 10.1018 21.6649 10.7823C21.8203 11.1959 21.9 11.8131 21.9 12.5C21.9 13.1869 21.8203 13.8041 21.6649 14.2177C21.5518 14.5193 21.3842 14.7833 21.1514 15.0802"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M5.84365 6.49835C4.1083 7.91455 2.95069 9.73395 2.33509 10.7823C2.17969 11.0459 2.1 11.2131 2.1 12.5C2.1 13.7869 2.17969 13.9541 2.33509 14.2177C2.58938 14.8982 2.98249 15.3033 3.76873 16.1137C5.43588 17.8252 8.24264 20 12 20C13.4319 20 14.7121 19.6891 15.8435 19.2015"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 5C15.7574 5 18.5641 7.1748 20.2313 8.88633C21.0175 9.69667 21.4106 10.1018 21.6649 10.7823C21.8203 11.1959 21.9 11.8131 21.9 12.5C21.9 13.1869 21.8203 13.8041 21.6649 14.2177C21.4106 14.8982 21.0175 15.3033 20.2313 16.1137C18.5641 17.8252 15.7574 20 12 20C8.24264 20 5.43588 17.8252 3.76873 16.1137C2.98249 15.3033 2.58938 14.8982 2.33509 14.2177C2.17969 13.8041 2.1 13.1869 2.1 12.5C2.1 11.8131 2.17969 11.1959 2.33509 10.7823C2.58938 10.1018 2.98249 9.69667 3.76873 8.88633C5.43588 7.1748 8.24264 5 12 5Z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <circle
                                cx="12"
                                cy="12.5"
                                r="3"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <div className="error-message">
                          {errors.confirmPassword}
                        </div>
                      )}

                      {/* Password Match Indicator */}
                      {passwords.confirmPassword && (
                        <div
                          className={`password-match ${
                            passwords.newPassword === passwords.confirmPassword
                              ? "match"
                              : "no-match"
                          }`}
                        >
                          {passwords.newPassword ===
                          passwords.confirmPassword ? (
                            <>
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span>Passwords match</span>
                            </>
                          ) : (
                            <>
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M15 9L9 15M9 9L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span>Passwords don't match</span>
                            </>
                          )}
                        </div>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <button
                        type="submit"
                        className="modern-btn forgot-btn"
                        disabled={isLoading}
                      >
                        {isLoading && <span className="loading-spinner"></span>}
                        <span className="btn-text">
                          {isLoading
                            ? "Resetting Password..."
                            : "Reset Password"}
                        </span>
                      </button>
                    </motion.div>

                    <motion.div
                      className="back-link-container"
                      variants={itemVariants}
                    >
                      <span className="back-text">
                        Remember your password?{" "}
                      </span>
                      <Link href="/login" className="modern-link">
                        Back to Sign In
                      </Link>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ============================================ */}
      {/* OTP Verification Modal */}
      {/* ============================================ */}
      <Modal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setStep(1);
          setOtp(["", "", "", "", "", ""]);
        }}
        footer={null}
        centered
        className="otp-modal"
        maskClosable={false}
        closable={true}
        width="auto"
      >
        <motion.div
          className="otp-modal-content"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="otp-icon">
            <div className="otp-icon-inner">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 6L12 13L2 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="otp-icon-pulse"></div>
          </div>

          <h3 className="otp-title">Check Your Email</h3>
          <p className="otp-description">
            We've sent a 6-digit verification code to
            <br />
            <strong>{email}</strong>
          </p>

          <div className="otp-inputs" onPaste={handleOtpPaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={otpRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className={`otp-input ${digit ? "filled" : ""}`}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            onClick={handleVerifyCode}
            className="modern-btn verify-btn"
            disabled={isLoading || otp.join("").length !== 6}
          >
            {isLoading && <span className="loading-spinner"></span>}
            <span className="btn-text">
              {isLoading ? "Verifying..." : "Verify Code"}
            </span>
          </button>

          <div className="resend-section">
            <span>Didn't receive the code? </span>
            {resendTimer > 0 ? (
              <span className="resend-timer">
                Resend in <strong>{resendTimer}s</strong>
              </span>
            ) : (
              <button
                onClick={handleResendCode}
                className="resend-btn"
                disabled={isLoading}
              >
                Resend Code
              </button>
            )}
          </div>

          <div className="modal-footer-note">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Check your spam folder if you don't see the email</span>
          </div>
        </motion.div>
      </Modal>
    </>
  );
};

export default ForgotPassword;
