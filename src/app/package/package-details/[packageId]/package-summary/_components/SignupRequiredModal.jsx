// SignupRequiredModal.jsx
"use client";
import React, { useState, useRef } from "react";
import { Modal } from "reactstrap";
import { IoClose } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import PhoneInput, { parsePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import axios from "axios";
import toast from "react-hot-toast";
import { base_url } from "../../../../../../uitils/base_url";
import { useDispatch } from "react-redux";
import { setUserId } from "@/lib/redux/slices/tourReservationSlice";
import "./style.css";

const { Dragger } = Upload;

const SignupRequiredModal = ({
  isOpen,
  onClose,
  onSignupSuccess,
  onSwitchToLogin,
}) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    national_id: "",
    age: "",
    country: "",
  });

  const [files, setFiles] = useState({
    image: null,
    driving_license: null,
    passport: null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const [otpCode, setOtpCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const otpRefs = useRef([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phone: value || "" }));
    if (value) {
      try {
        const phoneNumber = parsePhoneNumber(value);
        if (phoneNumber)
          setFormData((prev) => ({
            ...prev,
            country: phoneNumber.country || "",
          }));
      } catch (error) {}
    }
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
  };

  const customUploadRequest = (options, fileType) => {
    const { file, onSuccess, onError } = options;
    const validTypes = {
      image: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ],
      driving_license: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf",
      ],
      passport: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf",
      ],
    };

    if (!validTypes[fileType]?.includes(file.type)) {
      toast.error(`Please upload a valid ${fileType} file`);
      onError("Invalid file type");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      onError("File too large");
      return;
    }
    setFiles((prev) => ({ ...prev, [fileType]: file }));
    onSuccess("ok");
  };

  const uploadFile = async (file) => {
    if (!file) return "";
    const fd = new FormData();
    fd.append("image", file);
    const response = await axios.post(
      `${base_url}/user/item_img_uploader.php`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    if (response.status === 200) return response.data || response.data.message;
    throw new Error("Upload failed");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim())
      newErrors.full_name = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Min 6 characters";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords don't match";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.national_id.trim())
      newErrors.national_id = "National ID is required";
    if (!formData.age) newErrors.age = "Age is required";
    if (!files.driving_license)
      newErrors.driving_license = "Driving license is required";
    if (!files.passport) newErrors.passport = "Passport is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);

      await axios.post(
        `${base_url}/user/auth/send_code.php`,
        { email: formData.email, code },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success("Verification code sent to your email!");
      setCurrentStep(2);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send verification code"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpInputs = [...otpInputs];
      newOtpInputs[index] = value;
      setOtpInputs(newOtpInputs);
      if (value && index < 5) otpRefs.current[index + 1]?.focus();
      setOtpCode(newOtpInputs.join(""));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyAndSignup = async () => {
    if (otpCode.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setOtpLoading(true);
    try {
      const [imageUrl, drivingLicenseUrl, passportUrl] = await Promise.all([
        uploadFile(files.image),
        uploadFile(files.driving_license),
        uploadFile(files.passport),
      ]);

      const signupData = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        driving_license: drivingLicenseUrl,
        passport: passportUrl,
        national_id: formData.national_id,
        country: formData.country,
        age: parseInt(formData.age),
        image: imageUrl,
      };

      const signupResponse = await axios.post(
        `${base_url}/user/auth/signUp.php`,
        signupData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (signupResponse.data.status !== "success") {
        toast.error(signupResponse.data.message || "Signup failed");
        return;
      }

      // ✅ Auto Login
      const fcm_token =
        typeof window !== "undefined"
          ? localStorage.getItem("fcm_token")
          : null;

      const loginResponse = await axios.post(
        `${base_url}/user/auth/login.php`,
        { email: formData.email, password: formData.password, fcm_token },
        { headers: { "Content-Type": "application/json" } }
      );

      if (loginResponse.data.status === "success") {
        const userData = loginResponse.data.data ||
          loginResponse.data.user || {
            email: formData.email,
            isLoggedIn: true,
          };
        const userId = userData?.id || userData?.user_id;

        localStorage.setItem("user", JSON.stringify(userData));
        if (userId) localStorage.setItem("user_id", String(userId));
        dispatch(setUserId(userId));

        toast.success("Account created & logged in successfully! 🎉");
        resetForm();
        onSignupSuccess?.(userId);
        onClose();
      } else {
        toast.success("Account created! Please login to continue.");
        resetForm();
        onClose();
        onSwitchToLogin?.();
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(
        error.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      await axios.post(
        `${base_url}/user/auth/send_code.php`,
        { email: formData.email, code },
        { headers: { "Content-Type": "application/json" } }
      );
      setOtpInputs(["", "", "", "", "", ""]);
      setOtpCode("");
      toast.success("New verification code sent!");
    } catch {
      toast.error("Failed to resend verification code");
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      national_id: "",
      age: "",
      country: "",
    });
    setFiles({ image: null, driving_license: null, passport: null });
    setErrors({});
    setCurrentStep(1);
    setOtpInputs(["", "", "", "", "", ""]);
    setOtpCode("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      centered
      size="lg"
      className="signup-required-modal"
    >
      <div
        style={{
          borderRadius: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
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

        <div className="modern-modal-content">
          {/* Header */}
          <div className="modern-title">
            <img
              src="https://res.cloudinary.com/dbvh5i83q/image/upload/v1775980904/W_ppfn8j.png"
              alt="Logo"
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                margin: "0 auto 10px",
              }}
            />
            {currentStep === 1 ? (
              <>
                <h2 style={{ fontSize: "24px" }}>Create Account</h2>
                <p>Sign up to continue your booking</p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: "24px" }}>Verify Email</h2>
                <p>Enter the code sent to {formData.email}</p>
              </>
            )}

            {/* Step Indicator */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                marginTop: "16px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "4px",
                  borderRadius: "2px",
                  background:
                    currentStep >= 1 ? "#e8a355" : "rgba(255,255,255,0.3)",
                  transition: "all 0.3s ease",
                }}
              />
              <div
                style={{
                  width: "40px",
                  height: "4px",
                  borderRadius: "2px",
                  background:
                    currentStep >= 2 ? "#e8a355" : "rgba(255,255,255,0.3)",
                  transition: "all 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Body */}
          <div className="p-6" style={{ maxHeight: "60vh", overflowY: "auto" }}>
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
              <span style={{ fontSize: "18px", marginTop: "-2px" }}>🔒</span>
              <p
                style={{
                  color: "#e8a355",
                  fontSize: "13px",
                  fontWeight: "600",
                  margin: 0,
                }}
              >
                Your booking selections are saved! Create an account and
                complete your booking without losing anything.
              </p>
            </div>

            {/* ========== STEP 1: Registration Form ========== */}
            {currentStep === 1 && (
              <form onSubmit={handleSendOtp}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label
                      className="upload-label"
                      style={{ fontSize: "13px" }}
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      placeholder="Enter your full name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className={`modern-input ${errors.full_name ? "error" : ""}`}
                      style={{ height: "48px", fontSize: "14px" }}
                    />
                    {errors.full_name && (
                      <div
                        className="error-message"
                        style={{ fontSize: "12px" }}
                      >
                        {errors.full_name}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label
                      className="upload-label"
                      style={{ fontSize: "13px" }}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`modern-input ${errors.email ? "error" : ""}`}
                      style={{ height: "48px", fontSize: "14px" }}
                    />
                    {errors.email && (
                      <div
                        className="error-message"
                        style={{ fontSize: "12px" }}
                      >
                        {errors.email}
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="col-span-1 md:col-span-2 space-y-1">
                    <label
                      className="upload-label"
                      style={{ fontSize: "13px" }}
                    >
                      Phone Number *
                    </label>
                    <div className="phone-input-container">
                      <PhoneInput
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        defaultCountry="EG"
                        international
                        countryCallingCodeEditable={false}
                      />
                    </div>
                    {errors.phone && (
                      <div
                        className="error-message"
                        style={{ fontSize: "12px" }}
                      >
                        {errors.phone}
                      </div>
                    )}
                  </div>

                  {/* National ID */}
                  <div className="space-y-1">
                    <label
                      className="upload-label"
                      style={{ fontSize: "13px" }}
                    >
                      National ID *
                    </label>
                    <input
                      type="text"
                      name="national_id"
                      placeholder="Enter national ID"
                      value={formData.national_id}
                      onChange={handleInputChange}
                      className={`modern-input ${errors.national_id ? "error" : ""}`}
                      style={{ height: "48px", fontSize: "14px" }}
                    />
                    {errors.national_id && (
                      <div
                        className="error-message"
                        style={{ fontSize: "12px" }}
                      >
                        {errors.national_id}
                      </div>
                    )}
                  </div>

                  {/* Age */}
                  <div className="space-y-1">
                    <label
                      className="upload-label"
                      style={{ fontSize: "13px" }}
                    >
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      placeholder="Your age"
                      min="18"
                      max="100"
                      value={formData.age}
                      onChange={handleInputChange}
                      className={`modern-input ${errors.age ? "error" : ""}`}
                      style={{ height: "48px", fontSize: "14px" }}
                      onWheel={(e) => e.target.blur()}
                    />
                    {errors.age && (
                      <div
                        className="error-message"
                        style={{ fontSize: "12px" }}
                      >
                        {errors.age}
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label
                      className="upload-label"
                      style={{ fontSize: "13px" }}
                    >
                      Password *
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Create password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`modern-input ${errors.password ? "error" : ""}`}
                        style={{
                          height: "48px",
                          fontSize: "14px",
                          paddingRight: "45px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: "#295557",
                          cursor: "pointer",
                          opacity: 0.7,
                        }}
                      >
                        {showPassword ? (
                          <FaEyeSlash size={16} />
                        ) : (
                          <FaEye size={16} />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <div
                        className="error-message"
                        style={{ fontSize: "12px" }}
                      >
                        {errors.password}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label
                      className="upload-label"
                      style={{ fontSize: "13px" }}
                    >
                      Confirm Password *
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`modern-input ${errors.confirmPassword ? "error" : ""}`}
                        style={{
                          height: "48px",
                          fontSize: "14px",
                          paddingRight: "45px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        style={{
                          position: "absolute",
                          right: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: "#295557",
                          cursor: "pointer",
                          opacity: 0.7,
                        }}
                      >
                        {showConfirmPassword ? (
                          <FaEyeSlash size={16} />
                        ) : (
                          <FaEye size={16} />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div
                        className="error-message"
                        style={{ fontSize: "12px" }}
                      >
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>

                  {/* File Uploads */}
                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    {[
                      {
                        key: "image",
                        label: "Profile Image",
                        required: false,
                        accept: "image/*",
                      },
                      {
                        key: "driving_license",
                        label: "Driving License *",
                        required: true,
                        accept: "image/*,.pdf",
                      },
                      {
                        key: "passport",
                        label: "Passport *",
                        required: true,
                        accept: "image/*,.pdf",
                      },
                    ].map((upload) => (
                      <div key={upload.key}>
                        <label
                          className="upload-label"
                          style={{ fontSize: "13px" }}
                        >
                          {upload.label}
                        </label>
                        <Dragger
                          name={upload.key}
                          multiple={false}
                          customRequest={(opts) =>
                            customUploadRequest(opts, upload.key)
                          }
                          className={`custom-dragger ${files[upload.key] ? "file-uploaded" : ""}`}
                          accept={upload.accept}
                          showUploadList={false}
                          style={{ padding: "12px" }}
                        >
                          <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                          </p>
                          <p
                            className="ant-upload-text"
                            style={{ fontSize: "13px" }}
                          >
                            {files[upload.key]
                              ? "✓ Selected"
                              : `Upload ${upload.key.replace("_", " ")}`}
                          </p>
                        </Dragger>
                        {errors[upload.key] && (
                          <div
                            className="error-message"
                            style={{ fontSize: "12px" }}
                          >
                            {errors[upload.key]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Submit */}
                  <div className="col-span-1 md:col-span-2 mt-4">
                    <button
                      type="submit"
                      className="modern-btn"
                      disabled={loading}
                      style={{ padding: "14px 32px", fontSize: "16px" }}
                    >
                      {loading && <span className="loading-spinner"></span>}
                      {loading
                        ? "Sending Code..."
                        : "Create Account & Continue"}
                    </button>
                  </div>

                  {/* Switch to Login */}
                  <div className="col-span-1 md:col-span-2 text-center mt-2 mb-2">
                    <span style={{ color: "#295557", fontWeight: "600" }}>
                      Already have an account?{" "}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        setTimeout(() => {
                          onSwitchToLogin?.();
                        }, 300);
                      }}
                      className="modern-link"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Sign In Here
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ========== STEP 2: OTP Verification ========== */}
            {currentStep === 2 && (
              <div>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #295557, #1e3a3c)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      fontSize: "36px",
                    }}
                  >
                    📧
                  </div>
                  <p style={{ color: "#6b7280", fontSize: "14px" }}>
                    We sent a 6-digit code to{" "}
                    <strong style={{ color: "#295557" }}>
                      {formData.email}
                    </strong>
                  </p>
                </div>

                {/* OTP Inputs */}
                <div className="otp-container">
                  {otpInputs.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      className="otp-input"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pasted = e.clipboardData
                          .getData("text")
                          .slice(0, 6);
                        if (/^\d+$/.test(pasted)) {
                          const newInputs = [...otpInputs];
                          pasted.split("").forEach((char, i) => {
                            if (i < 6) newInputs[i] = char;
                          });
                          setOtpInputs(newInputs);
                          setOtpCode(newInputs.join(""));
                        }
                      }}
                    />
                  ))}
                </div>

                {/* Verify Button */}
                <button
                  className="modern-btn"
                  onClick={handleVerifyAndSignup}
                  disabled={otpLoading || otpCode.length !== 6}
                  style={{
                    padding: "14px 32px",
                    fontSize: "16px",
                    marginTop: "16px",
                  }}
                >
                  {otpLoading && <span className="loading-spinner"></span>}
                  {otpLoading
                    ? "Creating Account..."
                    : "Verify & Complete Signup"}
                </button>

                {/* Back & Resend */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "16px",
                    marginBottom: "8px",
                  }}
                >
                  <button
                    onClick={() => setCurrentStep(1)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#295557",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    ← Back to form
                  </button>
                  <button
                    onClick={handleResendOtp}
                    className="modern-link"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .signup-required-modal .modal-content {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 24px !important;
          overflow: hidden !important;
        }
        .signup-required-modal .modal-dialog {
          max-width: 700px !important;
        }
      `}</style>
    </Modal>
  );
};

export default SignupRequiredModal;
