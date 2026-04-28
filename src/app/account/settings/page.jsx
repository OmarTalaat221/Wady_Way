"use client";
import { Button, Modal, Spin, Progress, Switch } from "antd";
import { useState, useEffect, useCallback, memo } from "react";
import axios from "axios";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaEye,
  FaEyeSlash,
  FaBirthdayCake,
  FaIdCard,
  FaPassport,
  FaCar,
  FaUpload,
  FaBell,
} from "react-icons/fa";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import "./style.css";
import { useDispatch } from "react-redux";
import { setNotificationsEnabled } from "../../../lib/redux/slices/notificationSlice";
import { useNotification } from "../../../hooks/useNotification";
import toast from "react-hot-toast";
import Image from "next/image";

const base_url = "https://camp-coding.tech/wady-way";
const API_BASE_URL = `${base_url}/user/auth`;

// ─── Password Eye Toggle Button ───
const EyeToggle = memo(({ show, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 bg-white hover:text-gray-600 focus:outline-none"
    aria-label={show ? "Hide password" : "Show password"}
  >
    {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
  </button>
));
EyeToggle.displayName = "EyeToggle";

// ─── Password Input Field ───
const PasswordField = memo(({ label, value, onChange, show, onToggle }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete="off"
        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 pr-10
                   focus:outline-none focus:ring-2 focus:ring-[#295557] focus:ring-opacity-50
                   transition-all duration-200"
      />
      <EyeToggle show={show} onToggle={onToggle} />
    </div>
  </div>
));
PasswordField.displayName = "PasswordField";

// ─── Info Card Wrapper ───
const InfoCard = memo(({ accentColor = "#295557", children }) => (
  <div className="relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow-lg">
    <div
      className="absolute top-0 left-0 w-full h-1 rounded-t-2xl sm:rounded-t-3xl"
      style={{ backgroundColor: accentColor }}
    />
    <div className="p-4 sm:p-6 lg:p-8">{children}</div>
  </div>
));
InfoCard.displayName = "InfoCard";

// ─── Info Card Icon ───
const CardIcon = memo(({ color, icon: Icon }) => (
  <div
    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
    style={{ backgroundColor: color }}
  >
    <Icon className="text-white text-base sm:text-lg lg:text-xl" />
  </div>
));
CardIcon.displayName = "CardIcon";

// ─── Loading Screen ───
const LoadingScreen = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
    <div className="text-center">
      <Spin size="large" />
      <p className="mt-4 text-gray-600 text-sm sm:text-base">
        Loading profile...
      </p>
    </div>
  </div>
));
LoadingScreen.displayName = "LoadingScreen";

// ─── Section Title ───
const SectionTitle = memo(({ children }) => (
  <div className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 sm:gap-3">
    <div
      className="w-1 h-6 sm:h-8 rounded-full flex-shrink-0"
      style={{ backgroundColor: "#295557" }}
    />
    {children}
  </div>
));
SectionTitle.displayName = "SectionTitle";

// ═══════════════════════════════════════════
// ─── Main Profile Page ───
// ═══════════════════════════════════════════
export default function ProfilePage() {
  const dispatch = useDispatch();
  const { notificationsEnabled, requestPermission } = useNotification();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);

  const [profileData, setProfileData] = useState({
    user_id: "",
    name: "",
    email: "",
    phone: "",
    country: "",
    age: "",
    avatar: "",
    national_id: "",
    driving_license: "",
    passport: "",
  });

  const [editData, setEditData] = useState(profileData);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ─── Fetch user data ───
  useEffect(() => {
    let cancelled = false;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const user = localStorage.getItem("user");
        if (!user) {
          toast.error("Please login first");
          return;
        }

        const userData = JSON.parse(user);
        const userId = userData.user_id || userData.id;

        const response = await axios.post(`${API_BASE_URL}/user_info.php`, {
          user_id: userId,
        });

        if (cancelled) return;

        if (response.data.status === "success") {
          const data = response.data.message;
          const formattedData = {
            user_id: data.user_id,
            name: data.full_name,
            email: data.email,
            phone: data.phone,
            country: data.country,
            age: data.age,
            avatar: data.image,
            national_id: data.national_id,
            driving_license: data.driving_license,
            passport: data.passport,
          };
          setProfileData(formattedData);
          setEditData(formattedData);
        } else {
          toast.error("Failed to load profile data");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching user data:", error);
          toast.error("Error loading profile. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUserData();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Upload file ───
  const uploadFile = useCallback(async (file, fileType) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(
      `${base_url}/user/item_img_uploader.php`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress((prev) => ({ ...prev, [fileType]: progress }));
        },
      }
    );

    if (response.status === 200) {
      return response.data || response.data.message;
    }
    throw new Error(response.data.message || "Upload failed");
  }, []);

  // ─── Handlers ───
  const openPasswordModal = useCallback(() => setShowPasswordModal(true), []);

  const closePasswordModal = useCallback(() => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const handleEditToggle = useCallback(() => {
    setIsEditing((prev) => {
      if (prev) setEditData(profileData);
      return !prev;
    });
  }, [profileData]);

  const handleSave = useCallback(async () => {
    try {
      setUpdating(true);

      const updatePayload = {
        user_id: profileData.user_id,
        full_name: editData.name,
        email: editData.email,
        phone: editData.phone,
        image: editData.avatar,
        driving_license: editData.driving_license,
        passport: editData.passport,
      };

      const response = await axios.post(
        `${API_BASE_URL}/update_user_info.php`,
        updatePayload
      );

      if (response.data.status === "success") {
        setProfileData(editData);
        setIsEditing(false);
        toast.success("Profile updated successfully!");

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            full_name: editData.name,
            email: editData.email,
            phone: editData.phone,
            image: editData.avatar,
            driving_license: editData.driving_license,
            passport: editData.passport,
          })
        );
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  }, [profileData.user_id, editData]);

  const handlePasswordChange = useCallback(async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/change_password.php`, {
        user_id: profileData.user_id,
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      if (response.data.status === "success") {
        toast.success("Password changed successfully!");
        closePasswordModal();
      } else {
        toast.error(response.data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Error changing password. Please try again.");
    }
  }, [passwordData, profileData.user_id, closePasswordModal]);

  const handleNotificationToggle = useCallback(
    async (checked) => {
      dispatch(setNotificationsEnabled(checked));
      if (checked) {
        await requestPermission();
      } else {
        toast.error("Notifications disabled");
      }
    },
    [dispatch, requestPermission]
  );

  const handleImageUpload = useCallback(
    async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      try {
        setUploadingImage(true);
        toast.loading("Uploading image...");
        const imageUrl = await uploadFile(file, "avatar");
        setEditData((prev) => ({ ...prev, avatar: imageUrl }));
        toast.success("Image uploaded successfully!");
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image");
      } finally {
        setUploadingImage(false);
        setUploadProgress((prev) => ({ ...prev, avatar: 0 }));
      }
    },
    [uploadFile]
  );

  const handleDocumentUpload = useCallback(
    async (e, documentType) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      try {
        toast.loading(`Uploading ${documentType}...`);
        const documentUrl = await uploadFile(file, documentType);
        setEditData((prev) => ({ ...prev, [documentType]: documentUrl }));
        toast.success(`${documentType} uploaded successfully!`);
      } catch (error) {
        console.error(`Error uploading ${documentType}:`, error);
        toast.error(`Failed to upload ${documentType}`);
      } finally {
        setUploadProgress((prev) => ({ ...prev, [documentType]: 0 }));
      }
    },
    [uploadFile]
  );

  if (loading) return <LoadingScreen />;

  const currentAvatar = isEditing ? editData.avatar : profileData.avatar;
  const currentDrivingLicense = isEditing
    ? editData.driving_license
    : profileData.driving_license;
  const currentPassport = isEditing ? editData.passport : profileData.passport;
  const hasDocuments = profileData.driving_license || profileData.passport;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-6 px-3 sm:px-4">
      <div className="mx-auto max-w-4xl">
        {/* ── Page Header ── */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Manage your account information and settings
          </p>
        </div>

        {/* ── Main Card ── */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            {/* ── Avatar + Name Row ── */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4 my-4 sm:my-6">
              {/* Avatar */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                <img
                  src={
                    currentAvatar || "https://via.placeholder.com/150?text=User"
                  }
                  alt="Profile avatar"
                  className="w-full h-full rounded-full border-4 border-white shadow-lg object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150?text=User";
                  }}
                />
                {isEditing && (
                  <label
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 sm:p-2 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                    aria-label="Upload profile photo"
                  >
                    <FaCamera
                      size={13}
                      style={{ color: "#295557" }}
                      aria-hidden="true"
                    />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Spin />
                  </div>
                )}
              </div>

              {/* Name + Upload Progress */}
              <div className="flex-1 w-full text-center sm:text-left">
                {!isEditing ? (
                  <div className="text-xl sm:text-2xl font-bold text-gray-800">
                    {profileData.name}
                  </div>
                ) : (
                  <div className="relative inline-block w-full sm:w-auto">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="text-xl sm:text-2xl font-bold text-gray-800 bg-transparent border-b-2
                                 border-gray-300 focus:border-[#295557] outline-none transition-all
                                 duration-300 px-2 pb-1 w-full sm:min-w-[200px]"
                      aria-label="Full name"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#295557] via-[#e8a355] to-[#295557]" />
                  </div>
                )}

                {uploadingImage && uploadProgress.avatar > 0 && (
                  <div className="mt-2 max-w-xs mx-auto sm:mx-0">
                    <Progress
                      percent={uploadProgress.avatar}
                      size="small"
                      strokeColor="#295557"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── Content Area ── */}
            <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                {/* ── Contact Section Header + Action Buttons ── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <SectionTitle>Contact Details</SectionTitle>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {!isEditing ? (
                      <>
                        <button
                          onClick={handleEditToggle}
                          className="group flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2
                                     bg-white border-2 border-slate-200 rounded-full hover:border-slate-300
                                     transition-all shadow-sm hover:shadow-md text-xs sm:text-sm font-medium
                                     text-slate-700 whitespace-nowrap"
                        >
                          <FaEdit
                            className="text-slate-600 group-hover:text-slate-800 transition-colors"
                            aria-hidden="true"
                          />
                          Edit Info
                        </button>
                        <button
                          onClick={openPasswordModal}
                          className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2
                                     bg-white border-2 border-slate-200 rounded-full hover:border-slate-300
                                     transition-all shadow-sm hover:shadow-md text-xs sm:text-sm font-medium
                                     text-slate-700 whitespace-nowrap"
                        >
                          <FaLock aria-hidden="true" />
                          Change Password
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={updating || uploadingImage}
                          className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2
                                     text-white rounded-full hover:scale-105 transition-transform shadow-lg
                                     disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm
                                     font-medium whitespace-nowrap"
                          style={{ backgroundColor: "#295557" }}
                        >
                          {updating ? (
                            <Spin size="small" />
                          ) : (
                            <FaSave aria-hidden="true" />
                          )}
                          {updating ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleEditToggle}
                          disabled={updating || uploadingImage}
                          className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2
                                     bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200
                                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                     text-xs sm:text-sm font-medium whitespace-nowrap"
                        >
                          <FaTimes aria-hidden="true" />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* ── Email Card ── */}
                <InfoCard accentColor="#295557">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <CardIcon color="#295557" icon={FaEnvelope} />
                    <div className="flex-1 w-full">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 mb-0.5">
                        Email Address
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm mb-3">
                        Your primary communication channel
                      </p>
                      {!isEditing ? (
                        <p className="text-sm sm:text-base lg:text-lg font-medium text-slate-700 bg-slate-50 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl break-all">
                          {profileData.email}
                        </p>
                      ) : (
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) =>
                            setEditData({ ...editData, email: e.target.value })
                          }
                          autoComplete="email"
                          aria-label="Email address"
                          className="w-full text-sm sm:text-base lg:text-lg border-2 border-slate-200 rounded-lg sm:rounded-xl
                                     px-3 sm:px-4 py-2 focus:outline-none focus:border-[#295557] transition-colors
                                     bg-slate-50 focus:bg-white"
                        />
                      )}
                    </div>
                  </div>
                </InfoCard>

                {/* ── Phone Card ── */}
                <InfoCard accentColor="#e8a355">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <CardIcon color="#e8a355" icon={FaPhone} />
                    <div className="flex-1 w-full">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 mb-0.5">
                        Phone Number
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm mb-3">
                        Mobile contact for urgent matters
                      </p>
                      {!isEditing ? (
                        <p className="text-sm sm:text-base lg:text-lg font-medium text-slate-700 bg-slate-50 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl">
                          {profileData.phone}
                        </p>
                      ) : (
                        <div className="phone-input-wrapper">
                          <PhoneInput
                            defaultCountry="eg"
                            value={editData.phone}
                            onChange={(phone) =>
                              setEditData({ ...editData, phone })
                            }
                            inputStyle={{
                              width: "100%",
                              height: "42px",
                              fontSize: "14px",
                              border: "2px solid #e2e8f0",
                              paddingLeft: "8px",
                              backgroundColor: "#f8fafc",
                              transition: "all 0.3s ease",
                            }}
                            countrySelectorStyleProps={{
                              buttonStyle: {
                                borderRadius: "12px 0 0 12px",
                                border: "2px solid #e2e8f0",
                                borderRight: "none",
                                backgroundColor: "#f8fafc",
                                height: "42px",
                                padding: "0 8px",
                              },
                              dropdownStyleProps: {
                                style: {
                                  borderRadius: "12px",
                                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                  marginTop: "4px",
                                  zIndex: 9999,
                                },
                              },
                            }}
                            inputClassName="phone-input-custom"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </InfoCard>

                {/* ── Notifications Card ── */}
                <InfoCard accentColor="#295557">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <CardIcon color="#295557" icon={FaBell} />
                    <div className="flex-1 w-full">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 mb-0.5">
                        Push Notifications
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm mb-3">
                        Receive updates and alerts on your device
                      </p>
                      {!isEditing ? (
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div
                            className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                              notificationsEnabled
                                ? "bg-[#295557]"
                                : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${
                                notificationsEnabled
                                  ? "translate-x-5"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-slate-700">
                            {notificationsEnabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Switch
                            checked={notificationsEnabled}
                            onChange={handleNotificationToggle}
                            style={{
                              backgroundColor: notificationsEnabled
                                ? "#295557"
                                : undefined,
                            }}
                          />
                          <span className="text-xs sm:text-sm font-medium text-slate-700">
                            {notificationsEnabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </InfoCard>

                {/* ── Documents Section ── */}
                {hasDocuments && (
                  <div className="space-y-4 sm:space-y-6">
                    <SectionTitle>Documents</SectionTitle>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Driving License */}
                      {(profileData.driving_license || isEditing) && (
                        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <FaCar
                                className="text-xl sm:text-2xl flex-shrink-0"
                                style={{ color: "#295557" }}
                                aria-hidden="true"
                              />
                              <h4 className="font-semibold text-slate-800 text-sm sm:text-base">
                                Driving License
                              </h4>
                            </div>
                            {isEditing && (
                              <label
                                className="cursor-pointer p-1.5 sm:p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                aria-label="Upload driving license"
                              >
                                <FaUpload
                                  size={14}
                                  style={{ color: "#295557" }}
                                  aria-hidden="true"
                                />
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={(e) =>
                                    handleDocumentUpload(e, "driving_license")
                                  }
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                          {uploadProgress.driving_license > 0 && (
                            <Progress
                              percent={uploadProgress.driving_license}
                              size="small"
                              strokeColor="#295557"
                              className="mb-3"
                            />
                          )}
                          <img
                            src={
                              currentDrivingLicense ||
                              "https://via.placeholder.com/400x200?text=Driving+License"
                            }
                            alt="Driving License"
                            className="w-full h-36 sm:h-48 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/400x200?text=Driving+License";
                            }}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      )}

                      {/* Passport */}
                      {(profileData.passport || isEditing) && (
                        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <FaPassport
                                className="text-xl sm:text-2xl flex-shrink-0"
                                style={{ color: "#e8a355" }}
                                aria-hidden="true"
                              />
                              <h4 className="font-semibold text-slate-800 text-sm sm:text-base">
                                Passport
                              </h4>
                            </div>
                            {isEditing && (
                              <label
                                className="cursor-pointer p-1.5 sm:p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                aria-label="Upload passport"
                              >
                                <FaUpload
                                  size={14}
                                  style={{ color: "#e8a355" }}
                                  aria-hidden="true"
                                />
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={(e) =>
                                    handleDocumentUpload(e, "passport")
                                  }
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                          {uploadProgress.passport > 0 && (
                            <Progress
                              percent={uploadProgress.passport}
                              size="small"
                              strokeColor="#e8a355"
                              className="mb-3"
                            />
                          )}
                          <img
                            src={
                              currentPassport ||
                              "https://via.placeholder.com/400x200?text=Passport"
                            }
                            alt="Passport"
                            className="w-full h-36 sm:h-48 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/400x200?text=Passport";
                            }}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Password Modal ── */}
        <Modal
          open={showPasswordModal}
          onCancel={closePasswordModal}
          footer={null}
          closable
          closeIcon={<FaTimes size={16} aria-hidden="true" />}
          width="min(400px, 95vw)"
          centered
          destroyOnClose
          title={
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 m-0">
              Change Password
            </h3>
          }
        >
          <div className="space-y-4 mt-4">
            <PasswordField
              label="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              show={showCurrentPassword}
              onToggle={() => setShowCurrentPassword((p) => !p)}
            />
            <PasswordField
              label="New Password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              show={showNewPassword}
              onToggle={() => setShowNewPassword((p) => !p)}
            />
            <PasswordField
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((p) => !p)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
            <Button
              onClick={closePasswordModal}
              className="flex-1 h-9 sm:h-10 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handlePasswordChange}
              className="flex-1 h-9 sm:h-10 text-sm"
              style={{ backgroundColor: "#295557", borderColor: "#295557" }}
            >
              Update Password
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
