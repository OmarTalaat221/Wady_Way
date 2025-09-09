"use client";
import React, { useState } from "react";
import { Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import PhoneInput, { parsePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import axios from "axios";
import Link from "../../components/link";
import { base_url } from "../../uitils/base_url";
import "../login/_components/style.css";

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
      message.success(`${fileType} uploaded successfully`);
    } else if (status === "error") {
      message.error(`${fileType} upload failed`);
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
      message.error(`Please upload a valid ${fileType} file`);
      onError("Invalid file type");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error("File size must be less than 5MB");
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

    if (!files.image) {
      newErrors.image = "Profile image is required";
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      message.error("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);

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
        message.success("Account created successfully!");
        // Redirect to login or dashboard
        window.location.href = "/login";
      } else {
        message.error(response.data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      message.error(
        error.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        /* Body Background */
        body {
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          min-height: 100vh;
        }

        /* Phone Input Styling */
        .phone-input-container .PhoneInputInput {
          border: 2px solid #295557;
          border-radius: 12px;
          padding: 16px 20px;
          font-size: 16px;
          width: 100%;
          height: 60px;
          background: white;
          outline: none;
          transition: all 0.3s ease;
          color: #295557;
          font-weight: 500;
        }

        .phone-input-container .PhoneInputInput:focus {
          border-color: #e8a355;
          box-shadow: 0 0 0 4px rgba(232, 163, 85, 0.15);
          transform: translateY(-2px);
        }

        .phone-input-container .PhoneInputCountrySelect {
          border: 2px solid #295557;
          border-radius: 12px;
          padding: 16px;
          margin-right: 12px;
          height: 60px;
          background: white;
          outline: none;
          transition: all 0.3s ease;
        }

        .phone-input-container .PhoneInputCountrySelect:focus {
          border-color: #e8a355;
          box-shadow: 0 0 0 4px rgba(232, 163, 85, 0.15);
        }

        /* Upload Sections */
        .upload-section {
          margin-bottom: 24px;
        }

        .upload-label {
          display: block;
          margin-bottom: 12px;
          font-weight: 700;
          color: #295557;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .error-message {
          color: #ef4444;
          font-size: 14px;
          margin-top: 8px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .error-message::before {
          content: "⚠";
          color: #ef4444;
        }

        /* Custom Dragger */
        .custom-dragger {
          border: 3px dashed #295557 !important;
          border-radius: 16px !important;
          background: linear-gradient(
            135deg,
            #f8f9fa 0%,
            #ffffff 100%
          ) !important;
          transition: all 0.3s ease !important;
          padding: 24px !important;
        }

        .custom-dragger:hover {
          border-color: #e8a355 !important;
          background: linear-gradient(
            135deg,
            #fff7e6 0%,
            #ffffff 100%
          ) !important;
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(232, 163, 85, 0.2);
        }

        .custom-dragger.ant-upload-drag-hover {
          border-color: #e8a355 !important;
        }

        .custom-dragger .ant-upload-drag-icon {
          color: #295557 !important;
          font-size: 48px !important;
          margin-bottom: 16px !important;
        }

        .custom-dragger .ant-upload-text {
          color: #295557 !important;
          font-weight: 600 !important;
          font-size: 16px !important;
          margin-bottom: 8px !important;
        }

        .custom-dragger .ant-upload-hint {
          color: #6b7280 !important;
          font-size: 14px !important;
        }

        /* Form Inputs */
        .modern-input {
          height: 60px;
          border: 2px solid #295557;
          border-radius: 12px;
          padding: 0 20px;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.3s ease;
          background: white;
          color: #295557;
          width: 100%;
        }

        .modern-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .modern-input:focus {
          border-color: #e8a355;
          outline: none;
          box-shadow: 0 0 0 4px rgba(232, 163, 85, 0.15);
          transform: translateY(-2px);
        }

        .modern-input.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
        }

        /* Login Button */
        .modern-btn {
          background: linear-gradient(135deg, #e8a355 0%, #d4941f 100%);
          border: none;
          padding: 18px 32px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 18px;
          text-decoration: none;
          display: block;
          text-align: center;
          transition: all 0.3s ease;
          color: white;
          text-transform: uppercase;
          letter-spacing: 1px;
          width: 100%;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .modern-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
        }

        .modern-btn:hover::before {
          left: 100%;
        }

        .modern-btn:hover {
          background: linear-gradient(135deg, #d4941f 0%, #e8a355 100%);
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(232, 163, 85, 0.4);
        }

        .modern-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .modern-btn:disabled::before {
          display: none;
        }

        /* Modal Styling */
        .modern-modal {
          background: rgba(26, 26, 26, 0.95);
          backdrop-filter: blur(20px);
        }

        .modern-modal-content {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 24px;
          border: 3px solid #295557;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        /* Form Title */
        .modern-title {
          background: linear-gradient(135deg, #295557 0%, #1e3a3c 100%);
          color: white;
          padding: 32px;
          margin: -32px -32px 32px -32px;
          text-align: center;
        }

        .modern-title h2 {
          color: white !important;
          font-weight: 800;
          font-size: 32px;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .modern-title p {
          color: rgba(255, 255, 255, 0.8) !important;
          font-size: 16px;
          margin: 0;
        }

        /* Link Styling */
        .modern-link {
          color: #e8a355;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.3s ease;
          position: relative;
        }

        .modern-link::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: #e8a355;
          transition: width 0.3s ease;
        }

        .modern-link:hover::after {
          width: 100%;
        }

        .modern-link:hover {
          color: #d4941f;
          transform: translateY(-1px);
        }

        /* Success States */
        .file-uploaded {
          border-color: #10b981 !important;
          background: linear-gradient(
            135deg,
            #ecfdf5 0%,
            #f0fdf4 100%
          ) !important;
        }

        .file-uploaded .ant-upload-drag-icon {
          color: #10b981 !important;
        }

        .file-uploaded .ant-upload-text {
          color: #10b981 !important;
        }

        /* Loading Spinner */
        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid #ffffff;
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 1s ease-in-out infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-600 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="modern-modal-content p-8">
            <div className="modern-title">
              <h2>Create Your Account</h2>
              <p>Join us and start your journey today</p>
            </div>

            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              onSubmit={handleSubmit}
            >
              {/* Full Name */}
              <div className="space-y-2">
                <label className="upload-label">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className={`modern-input ${errors.full_name ? "error" : ""}`}
                />
                {errors.full_name && (
                  <div className="error-message">{errors.full_name}</div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
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
              </div>

              {/* Phone Number */}
              <div className="col-span-1 md:col-span-2 space-y-2">
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
              </div>

              {/* National ID */}
              <div className="space-y-2">
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
              </div>

              {/* Age */}
              <div className="space-y-2">
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
              </div>

              {/* Password */}
              <div className="space-y-2">
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
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
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
                  <div className="error-message">{errors.confirmPassword}</div>
                )}
              </div>

              {/* File Uploads */}
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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
              </div>

              {/* Submit Button */}
              <div className="col-span-1 md:col-span-2 mt-8">
                <button type="submit" className="modern-btn" disabled={loading}>
                  {loading && <span className="loading-spinner"></span>}
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </div>

              {/* Login Link */}
              <div className="col-span-1 md:col-span-2 text-center mt-6">
                <span style={{ color: "#295557", fontWeight: "600" }}>
                  Already have an account?{" "}
                </span>
                <Link href="/login" className="modern-link">
                  Sign In Here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
