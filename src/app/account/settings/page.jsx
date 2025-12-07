"use client";
import { Button, Input, Modal, message, Spin, Progress } from "antd";
import { useState, useEffect } from "react";
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
  FaGlobe,
  FaBirthdayCake,
  FaIdCard,
  FaPassport,
  FaCar,
  FaUpload,
} from "react-icons/fa";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import './style.css'

const base_url = "https://camp-coding.tech/wady-way";
const API_BASE_URL = `${base_url}/user/auth`;

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);

  // Profile data state
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

  // Temporary editing state
  const [editData, setEditData] = useState(profileData);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Get user_id from localStorage
      const user = localStorage.getItem("user");
      if (!user) {
        message.error("Please login first");
        return;
      }

      const userData = JSON.parse(user);
      const userId = userData.user_id || userData.id;

      // Make API call
      const response = await axios.post(`${API_BASE_URL}/user_info.php`, {
        user_id: userId,
      });

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
        message.error("Failed to load profile data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      message.error("Error loading profile. Please try again.");
    } finally {
      setLoading(false);
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

  const openPasswordModal = () => {
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditData(profileData); // Reset changes
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      setUpdating(true);

      // Prepare update data with all fields
      const updatePayload = {
        user_id: profileData.user_id,
        full_name: editData.name,
        email: editData.email,
        phone: editData.phone,
        image: editData.avatar,
        driving_license: editData.driving_license,
        passport: editData.passport,
      };

      // Call update API endpoint
      const response = await axios.post(
        `${API_BASE_URL}/update_user_info.php`,
        updatePayload
      );

      if (response.data.status === "success") {
        setProfileData(editData);
        setIsEditing(false);
        message.success("Profile updated successfully!");

        // Update localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        const updatedUser = {
          ...user,
          full_name: editData.name,
          email: editData.email,
          phone: editData.phone,
          image: editData.avatar,
          driving_license: editData.driving_license,
          passport: editData.passport,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        message.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      message.error("New passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      message.error("Password must be at least 6 characters long!");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/change_password.php`, {
        user_id: profileData.user_id,
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      if (response.data.status === "success") {
        message.success("Password changed successfully!");
        closePasswordModal();
      } else {
        message.error(response.data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      message.error("Error changing password. Please try again.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        message.error("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        message.error("Please upload an image file");
        return;
      }

      try {
        setUploadingImage(true);
        message.loading({ content: "Uploading image...", key: "upload" });

        const imageUrl = await uploadFile(file, "avatar");
        setEditData({ ...editData, avatar: imageUrl });

        message.success({
          content: "Image uploaded successfully!",
          key: "upload",
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error({ content: "Failed to upload image", key: "upload" });
      } finally {
        setUploadingImage(false);
        setUploadProgress((prev) => ({ ...prev, avatar: 0 }));
      }
    }
  };

  // Handle document upload (driving license or passport)
  const handleDocumentUpload = async (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        message.error("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        message.error("Please upload an image file");
        return;
      }

      try {
        message.loading({
          content: `Uploading ${documentType}...`,
          key: documentType,
        });

        const documentUrl = await uploadFile(file, documentType);
        setEditData({ ...editData, [documentType]: documentUrl });

        message.success({
          content: `${documentType} uploaded successfully!`,
          key: documentType,
        });
      } catch (error) {
        console.error(`Error uploading ${documentType}:`, error);
        message.error({
          content: `Failed to upload ${documentType}`,
          key: documentType,
        });
      } finally {
        setUploadProgress((prev) => ({ ...prev, [documentType]: 0 }));
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4">
      <div className="mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-sm text-gray-600">
            Manage your account information and settings
          </p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-3 my-6">
              <div className="relative w-28 h-28">
                <img
                  src={isEditing ? editData.avatar : profileData.avatar}
                  alt="Profile"
                  className="w-full h-full rounded-full border-4 border-white shadow-lg object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150?text=User";
                  }}
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                    <FaCamera size={14} style={{ color: "#295557" }} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Spin />
                  </div>
                )}
              </div>

              <div className="flex-1">
                {!isEditing ? (
                  <div className="text-2xl font-bold text-gray-800">
                    {profileData.name}
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="text-2xl font-bold text-gray-800 bg-transparent border-b-2 border-gray-300 focus:border-[#295557] outline-none transition-all duration-300 px-2 pb-1"
                      style={{
                        minWidth: "200px",
                      }}
                    />
                    {/* Animated Border */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#295557] via-[#e8a355] to-[#295557] animate-gradient-x"></div>
                  </div>
                )}
                {uploadingImage && uploadProgress.avatar > 0 && (
                  <div className="mt-2">
                    <Progress
                      percent={uploadProgress.avatar}
                      size="small"
                      strokeColor="#295557"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Information Grid */}
            <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
              <div className="max-w-4xl mx-auto">
                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 gap-8">
                  {/* Contact Info Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-lg font-bold text-slate-800 flex items-center gap-3">
                        <div
                          className="w-1 h-8 rounded-full"
                          style={{ backgroundColor: "#295557" }}
                        ></div>
                        Contact Details
                      </div>
                      <div className="flex gap-3">
                        {!isEditing ? (
                          <>
                            <button
                              onClick={handleEditToggle}
                              className="group flex items-center gap-2 px-6 py-1 bg-white border-2 border-slate-200 rounded-full hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
                            >
                              <FaEdit className="text-slate-600 group-hover:text-slate-800 transition-colors" />
                              <span className="font-medium text-slate-700">
                                Edit Info
                              </span>
                            </button>
                            <button
                              onClick={openPasswordModal}
                              className="flex items-center gap-2 px-6 py-1 bg-white border-2 border-slate-200 rounded-full hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
                            >
                              <FaLock className="text-slate-600" />
                              <span className="font-medium text-slate-700">
                                Change Password
                              </span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={handleSave}
                              disabled={updating || uploadingImage}
                              className="flex items-center gap-2 px-6 py-1 text-white rounded-full hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ backgroundColor: "#295557" }}
                            >
                              {updating ? (
                                <Spin size="small" className="text-white" />
                              ) : (
                                <FaSave />
                              )}
                              <span className="font-medium">
                                {updating ? "Saving..." : "Save"}
                              </span>
                            </button>
                            <button
                              onClick={handleEditToggle}
                              disabled={updating || uploadingImage}
                              className="flex items-center gap-2 px-6 py-1 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FaTimes />
                              <span className="font-medium">Cancel</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Email Card */}
                    <div className="relative overflow-hidden bg-white rounded-3xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow-lg">
                      <div
                        className="absolute top-0 left-0 w-full h-1"
                        style={{ backgroundColor: "#295557" }}
                      ></div>
                      <div className="p-8">
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            <div
                              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                              style={{ backgroundColor: "#295557" }}
                            >
                              <FaEnvelope className="text-white text-xl" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-800 mb-1">
                              Email Address
                            </h3>
                            <p className="text-slate-500 text-sm mb-4">
                              Your primary communication channel
                            </p>
                            {!isEditing ? (
                              <p className="text-lg font-medium text-slate-700 bg-slate-50 px-4 py-2 rounded-xl">
                                {profileData.email}
                              </p>
                            ) : (
                              <div className="relative">
                                <input
                                  type="email"
                                  value={editData.email}
                                  onChange={(e) =>
                                    setEditData({
                                      ...editData,
                                      email: e.target.value,
                                    })
                                  }
                                  className="w-full text-lg border-2 border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-[#295557] transition-colors bg-slate-50 focus:bg-white"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Phone Card with International Phone Input */}
                    <div className="relative overflow-hidden bg-white rounded-3xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow-lg">
                      <div
                        className="absolute top-0 left-0 w-full h-1"
                        style={{ backgroundColor: "#e8a355" }}
                      ></div>
                      <div className="p-8">
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            <div
                              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                              style={{ backgroundColor: "#e8a355" }}
                            >
                              <FaPhone className="text-white text-xl" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-800 mb-1">
                              Phone Number
                            </h3>
                            <p className="text-slate-500 text-sm mb-4">
                              Mobile contact for urgent matters
                            </p>
                            {!isEditing ? (
                              <div className="flex items-center gap-3">
                                <p className="text-lg font-medium text-slate-700 bg-slate-50 px-4 py-2 rounded-xl flex-1">
                                  {profileData.phone}
                                </p>
                              </div>
                            ) : (
                              <div className="phone-input-wrapper">
                                <PhoneInput
                                  defaultCountry="eg"
                                  value={editData.phone}
                                  onChange={(phone) =>
                                    setEditData({
                                      ...editData,
                                      phone: phone,
                                    })
                                  }
                                  inputStyle={{
                                    width: "100%",
                                    height: "45px",
                                    fontSize: "16px",
                                    // borderRadius: "12px",
                                    border: "2px solid #e2e8f0",
                                    paddingLeft: "30px",
                                    backgroundColor: "#f8fafc",
                                    transition: "all 0.3s ease",
                                  }}
                                  countrySelectorStyleProps={{
                                    buttonStyle: {
                                      borderRadius: "12px 0 0 12px",
                                      border: "2px solid #e2e8f0",
                                      borderRight: "none",
                                      backgroundColor: "#f8fafc",
                                      height: "45px",
                                      padding: "0 12px",
                                    },
                                    dropdownStyleProps: {
                                      style: {
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                        marginTop: "4px",
                                      },
                                    },
                                  }}
                                  inputClassName="phone-input-custom"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section - Side by Side */}
                  {(profileData.driving_license || profileData.passport) && (
                    <div className="space-y-6">
                      <div className="text-lg font-bold text-slate-800 flex items-center gap-3 mb-6">
                        <div
                          className="w-1 h-8 rounded-full"
                          style={{ backgroundColor: "#295557" }}
                        ></div>
                        Documents
                      </div>

                      {/* Documents Grid - 2 columns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Driving License */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <FaCar
                                className="text-2xl"
                                style={{ color: "#295557" }}
                              />
                              <h4 className="font-semibold text-slate-800">
                                Driving License
                              </h4>
                            </div>
                            {isEditing && (
                              <label className="cursor-pointer p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                                <FaUpload
                                  size={16}
                                  style={{ color: "#295557" }}
                                />
                                <input
                                  type="file"
                                  accept="image/*"
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
                              isEditing
                                ? editData.driving_license
                                : profileData.driving_license
                            }
                            alt="Driving License"
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/400x200?text=Driving+License";
                            }}
                          />
                        </div>

                        {/* Passport */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <FaPassport
                                className="text-2xl"
                                style={{ color: "#e8a355" }}
                              />
                              <h4 className="font-semibold text-slate-800">
                                Passport
                              </h4>
                            </div>
                            {isEditing && (
                              <label className="cursor-pointer p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                                <FaUpload
                                  size={16}
                                  style={{ color: "#e8a355" }}
                                />
                                <input
                                  type="file"
                                  accept="image/*"
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
                              isEditing
                                ? editData.passport
                                : profileData.passport
                            }
                            alt="Passport"
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/400x200?text=Passport";
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        <Modal
          open={showPasswordModal}
          onCancel={closePasswordModal}
          footer={null}
          closable
          closeIcon={<FaTimes size={16} />}
          width={400}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Change Password
          </h3>

          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#295557] focus:ring-opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2 text-gray-400 bg-white hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <FaEyeSlash size={14} />
                  ) : (
                    <FaEye size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#295557] focus:ring-opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2 text-gray-400 bg-white hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <FaEyeSlash size={14} />
                  ) : (
                    <FaEye size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#295557] focus:ring-opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2 text-gray-400 bg-white hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={14} />
                  ) : (
                    <FaEye size={14} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={closePasswordModal} className="flex-1">
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handlePasswordChange}
              className="flex-1"
              style={{ backgroundColor: "#295557", borderColor: "#295557" }}
            >
              Update Password
            </Button>
          </div>
        </Modal>
      </div>

      {/* CSS for Animated Border and Phone Input Customization */}
      <style jsx global>{`
       
      `}</style>
    </div>
  );
}