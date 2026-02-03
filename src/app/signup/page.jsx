"use client";
import React, { useState, useRef } from "react";
import { Upload, message, Modal } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import PhoneInput, { parsePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import axios from "axios";
import Link from "../../components/link";
import { base_url } from "../../uitils/base_url";
import { motion } from "framer-motion";
import "../signup/_components/style.css";
import toast from "react-hot-toast";

const { Dragger } = Upload;

const Signup = () => {
  // Form state
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

  // File states
  const [files, setFiles] = useState({
    image: null,
    driving_license: null,
    passport: null,
  });

  // Upload states
  const [uploadProgress, setUploadProgress] = useState({
    image: 0,
    driving_license: 0,
    passport: 0,
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // OTP Modal states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle phone number change
  const handlePhoneChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      phone: value || "",
    }));

    // Extract country from phone number
    if (value) {
      try {
        const phoneNumber = parsePhoneNumber(value);
        if (phoneNumber) {
          setFormData((prev) => ({
            ...prev,
            country: phoneNumber.country || "",
          }));
        }
      } catch (error) {
        console.log("Phone parsing error:", error);
      }
    }

    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: "",
      }));
    }
  };

  // Generate 6-digit OTP code
  const generateOtpCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send OTP code
  const sendOtpCode = async (email, code) => {
    try {
      const response = await axios.post(
        `${base_url}/user/auth/send_code.php`,
        {
          email: email,
          code: code,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        return true;
      } else {
        throw new Error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("OTP send error:", error);
      throw error;
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpInputs = [...otpInputs];
      newOtpInputs[index] = value;
      setOtpInputs(newOtpInputs);

      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }

      // Update combined OTP code
      setOtpCode(newOtpInputs.join(""));
    }
  };

  // Handle OTP input key down
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Upload file to server
  const uploadFile = async (file, fileType) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        `${base_url}/user/item_img_uploader.php`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress((prev) => ({
              ...prev,
              [fileType]: progress,
            }));
          },
        }
      );

      if (response.status == 200) {
        return response.data || response.data.message;
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  // Custom upload handler
  const handleFileUpload = (info, fileType) => {
    const { status, originFileObj } = info.file;

    if (status === "uploading") {
      setFiles((prev) => ({
        ...prev,
        [fileType]: originFileObj,
      }));
      return;
    }

    if (status === "done") {
      toast.success(`${fileType} uploaded successfully`);
    } else if (status === "error") {
      toast.error(`${fileType} upload failed`);
      setFiles((prev) => ({
        ...prev,
        [fileType]: null,
      }));
    }
  };

  // Custom upload request
  const customUploadRequest = (options, fileType) => {
    const { file, onSuccess, onError, onProgress } = options;

    // Validate file type
    const validTypes = {
      image: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
      driving_license: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ],
      passport: ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
    };

    if (!validTypes[fileType].includes(file.type)) {
      toast.error(`Please upload a valid ${fileType} file`);
      onError("Invalid file type");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      onError("File too large");
      return;
    }

    setFiles((prev) => ({
      ...prev,
      [fileType]: file,
    }));

    onSuccess("ok");
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.national_id.trim()) {
      newErrors.national_id = "National ID is required";
    }

    if (!formData.age) {
      newErrors.age = "Age is required";
    }

    if (!files.driving_license) {
      newErrors.driving_license = "Driving license is required";
    }

    if (!files.passport) {
      newErrors.passport = "Passport is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle initial form submission (send OTP)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);

    try {
      // Generate OTP code
      const code = generateOtpCode();
      setGeneratedCode(code);

      // Send OTP to email
      await sendOtpCode(formData.email, code);

      toast.success("Verification code sent to your email!");
      setShowOtpModal(true);
    } catch (error) {
      console.error("OTP send error:", error);
      toast.error(
        error.response?.data?.message || "Failed to send verification code"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification and complete signup
  const handleOtpVerification = async (e) => {
    e.preventDefault();

    //     if (otpCode !== generatedCode) {
    //   toast.error("Invalid verification code");
    //   return;
    // }

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setOtpLoading(true);

    try {
      // Upload files first
      const [imageUrl, drivingLicenseUrl, passportUrl] = await Promise.all([
        uploadFile(files.image, "image"),
        uploadFile(files.driving_license, "driving_license"),
        uploadFile(files.passport, "passport"),
      ]);

      // Prepare signup data
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

      // Submit signup
      const response = await axios.post(
        `${base_url}/user/auth/signUp.php`,
        signupData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Account created successfully!");
        setShowOtpModal(false);
        // Redirect to login
        router.push("/login");
      } else {
        toast.error(response.data.message || "Signup failed");
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

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      const code = generateOtpCode();
      setGeneratedCode(code);
      await sendOtpCode(formData.email, code);

      // Reset OTP inputs
      setOtpInputs(["", "", "", "", "", ""]);
      setOtpCode("");

      toast.success("New verification code sent!");
    } catch (error) {
      toast.error("Failed to resend verification code");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <>
      <style jsx>{``}</style>

      <div className="signup-container">
        {/* Floating Particles */}
        <div className="floating-particle particle-1"></div>
        <div className="floating-particle particle-2"></div>
        <div className="floating-particle particle-3"></div>
        <div className="floating-particle particle-4"></div>
        <div className="floating-particle particle-5"></div>
        <div className="floating-particle particle-6"></div>

        <div className="form-container">
          <motion.div
            className="modern-modal-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="modern-title" variants={titleVariants}>
              <h2>Create Your Account</h2>
              <p>Join us and start your journey today</p>
            </motion.div>

            <div className="p-8">
              <motion.form
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                onSubmit={handleOtpVerification}
                variants={containerVariants}
              >
                {/* Full Name */}
                <motion.div className="space-y-2" variants={itemVariants}>
                  <label className="upload-label">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className={`modern-input ${
                      errors.full_name ? "error" : ""
                    }`}
                  />
                  {errors.full_name && (
                    <div className="error-message">{errors.full_name}</div>
                  )}
                </motion.div>

                {/* Email */}
                <motion.div className="space-y-2" variants={itemVariants}>
                  <label className="upload-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`modern-input ${errors.email ? "error" : ""}`}
                  />
                  {errors.email && (
                    <div className="error-message">{errors.email}</div>
                  )}
                </motion.div>

                {/* Phone Number */}
                <motion.div
                  className="col-span-1 md:col-span-2 space-y-2"
                  variants={itemVariants}
                >
                  <label className="upload-label">Phone Number</label>
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
                    <div className="error-message">{errors.phone}</div>
                  )}
                </motion.div>

                {/* National ID */}
                <motion.div className="space-y-2" variants={itemVariants}>
                  <label className="upload-label">National ID</label>
                  <input
                    type="text"
                    name="national_id"
                    placeholder="Enter your national ID"
                    value={formData.national_id}
                    onChange={handleInputChange}
                    className={`modern-input ${
                      errors.national_id ? "error" : ""
                    }`}
                  />
                  {errors.national_id && (
                    <div className="error-message">{errors.national_id}</div>
                  )}
                </motion.div>

                {/* Age */}
                <motion.div className="space-y-2" variants={itemVariants}>
                  <label className="upload-label">Age</label>
                  <input
                    type="number"
                    name="age"
                    placeholder="Enter your age"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={handleInputChange}
                    className={`modern-input ${errors.age ? "error" : ""}`}
                  />
                  {errors.age && (
                    <div className="error-message">{errors.age}</div>
                  )}
                </motion.div>

                {/* Password */}
                <motion.div className="space-y-2" variants={itemVariants}>
                  <label className="upload-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`modern-input ${errors.password ? "error" : ""}`}
                  />
                  {errors.password && (
                    <div className="error-message">{errors.password}</div>
                  )}
                </motion.div>

                {/* Confirm Password */}
                <motion.div className="space-y-2" variants={itemVariants}>
                  <label className="upload-label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`modern-input ${
                      errors.confirmPassword ? "error" : ""
                    }`}
                  />
                  {errors.confirmPassword && (
                    <div className="error-message">
                      {errors.confirmPassword}
                    </div>
                  )}
                </motion.div>

                {/* File Uploads */}
                <motion.div
                  className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 mt-6"
                  variants={itemVariants}
                >
                  {/* Profile Image Upload */}
                  <div className="upload-section">
                    <label className="upload-label">Profile Image</label>
                    <Dragger
                      name="image"
                      multiple={false}
                      customRequest={(options) =>
                        customUploadRequest(options, "image")
                      }
                      onChange={(info) => handleFileUpload(info, "image")}
                      className={`custom-dragger ${
                        files.image ? "file-uploaded" : ""
                      }`}
                      accept="image/*"
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">
                        {files.image ? "Image Selected!" : "Upload Image"}
                      </p>
                      <p className="ant-upload-hint">JPG, PNG, GIF (Max 5MB)</p>
                    </Dragger>
                    {errors.image && (
                      <div className="error-message">{errors.image}</div>
                    )}
                  </div>

                  {/* Driving License Upload */}
                  <div className="upload-section">
                    <label className="upload-label">Driving License</label>
                    <Dragger
                      name="driving_license"
                      multiple={false}
                      customRequest={(options) =>
                        customUploadRequest(options, "driving_license")
                      }
                      onChange={(info) =>
                        handleFileUpload(info, "driving_license")
                      }
                      className={`custom-dragger ${
                        files.driving_license ? "file-uploaded" : ""
                      }`}
                      accept="image/*,.pdf"
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">
                        {files.driving_license
                          ? "License Selected!"
                          : "Upload License"}
                      </p>
                      <p className="ant-upload-hint">JPG, PNG, PDF (Max 5MB)</p>
                    </Dragger>
                    {errors.driving_license && (
                      <div className="error-message">
                        {errors.driving_license}
                      </div>
                    )}
                  </div>

                  {/* Passport Upload */}
                  <div className="upload-section">
                    <label className="upload-label">Passport</label>
                    <Dragger
                      name="passport"
                      multiple={false}
                      customRequest={(options) =>
                        customUploadRequest(options, "passport")
                      }
                      onChange={(info) => handleFileUpload(info, "passport")}
                      className={`custom-dragger ${
                        files.passport ? "file-uploaded" : ""
                      }`}
                      accept="image/*,.pdf"
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">
                        {files.passport
                          ? "Passport Selected!"
                          : "Upload Passport"}
                      </p>
                      <p className="ant-upload-hint">JPG, PNG, PDF (Max 5MB)</p>
                    </Dragger>
                    {errors.passport && (
                      <div className="error-message">{errors.passport}</div>
                    )}
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  className="col-span-1  md:col-span-2 !mt-[35px]"
                  variants={itemVariants}
                >
                  <button
                    type="submit"
                    className="modern-btn"
                    disabled={loading}
                  >
                    {loading && <span className="loading-spinner"></span>}
                    {loading
                      ? "Sending Verification Code..."
                      : "Create Account"}
                  </button>
                </motion.div>

                {/* Login Link */}
                <motion.div
                  className="col-span-1 md:col-span-2 text-center mt-6"
                  variants={itemVariants}
                >
                  <span style={{ color: "#295557", fontWeight: "600" }}>
                    Already have an account?{" "}
                  </span>
                  <Link href="/login" className="modern-link">
                    Sign In Here
                  </Link>
                </motion.div>
              </motion.form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <Modal
        title="Email Verification"
        open={showOtpModal}
        onCancel={() => setShowOtpModal(false)}
        footer={null}
        centered
        maskClosable={false}
        className="otp-modal"
        width={500}
      >
        <div className="otp-description">
          We've sent a 6-digit verification code to{" "}
          <strong>{formData.email}</strong>
          <br />
          Please enter the code below to verify your email address.
        </div>

        <div className="otp-container">
          {otpInputs.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (otpRefs.current[index] = el)}
              type="text"
              maxLength={1}
              className="otp-input"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onPaste={(e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData("text").slice(0, 6);
                if (/^\d+$/.test(pastedData)) {
                  const newOtpInputs = [...otpInputs];
                  pastedData.split("").forEach((char, i) => {
                    if (i < 6) newOtpInputs[i] = char;
                  });
                  setOtpInputs(newOtpInputs);
                  setOtpCode(newOtpInputs.join(""));
                }
              }}
            />
          ))}
        </div>

        <button
          className="otp-verify-btn"
          onClick={handleOtpVerification}
          disabled={otpLoading || otpCode.length !== 6}
        >
          {otpLoading && <span className="loading-spinner"></span>}
          {otpLoading ? "Verifying & Creating Account..." : "Verify & Continue"}
        </button>

        <button
          className="otp-cancel-btn"
          onClick={() => setShowOtpModal(false)}
          disabled={otpLoading}
        >
          Cancel
        </button>

        <div className="resend-container">
          <span className="resend-link" onClick={handleResendOtp}>
            Didn't receive the code? Resend
          </span>
        </div>
      </Modal>
    </>
  );
};

export default Signup;
