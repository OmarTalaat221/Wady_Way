"use client";
import { Button, Input, Modal } from "antd";
import { useState } from "react";
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
} from "react-icons/fa";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  });

  // Temporary editing state
  const [editData, setEditData] = useState(profileData);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    // Simulate password change
    alert("Password changed successfully!");
    closePasswordModal();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditData({ ...editData, avatar: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4">
      <div className=" mx-auto">
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
            <div className="flex  items-center gap-3 my-6">
              <div className="relative">
                <img
                  src={isEditing ? editData.avatar : profileData.avatar}
                  alt="Profile"
                  className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                    <FaCamera size={14} style={{ color: "#295557" }} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {!isEditing ? (
                <div className="text-2xl font-bold text-gray-800 mt-3 mb-2">
                  {profileData.name}
                </div>
              ) : (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="text-2xl font-bold text-gray-800 mt-3 mb-2 text-center bg-transparent border-b-2 border-gray-300 focus:border-opacity-100 outline-none"
                  style={{ borderBottomColor: "#295557" }}
                />
              )}
            </div>

            {/* Information Grid */}
            <div className=" bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
              <div className="max-w-4xl mx-auto">
                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 gap-8">
                  {/* Contact Info Section */}
                  <div className=" space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-lg font-bold text-slate-800 flex items-center gap-3">
                        <div
                          className="w-1 h-8 rounded-full"
                          style={{ backgroundColor: "#295557" }}
                        ></div>
                        Contact Details
                      </div>
                      {!isEditing ? (
                        <button
                          onClick={handleEditToggle}
                          className="group flex items-center gap-2 px-6 py-1 bg-white border-2 border-slate-200 rounded-full hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
                        >
                          <FaEdit className="text-slate-600 group-hover:text-slate-800 transition-colors" />
                          <span className="font-medium text-slate-700">
                            Edit Info
                          </span>
                        </button>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-1 text-white rounded-full hover:scale-105 transition-transform shadow-lg"
                            style={{ backgroundColor: "#295557" }}
                          >
                            <FaSave />
                            <span className="font-medium">Save</span>
                          </button>
                          <button
                            onClick={handleEditToggle}
                            className="flex items-center gap-2 px-6 py-1 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
                          >
                            <FaTimes />
                            <span className="font-medium">Cancel</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Email Card - Horizontal Layout */}
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
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
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
                              <input
                                type="email"
                                value={editData.email}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    email: e.target.value,
                                  })
                                }
                                className="w-full text-lg border-2 border-slate-200 rounded-xl px-4 py-1 focus:outline-none focus:border-opacity-70 transition-colors bg-slate-50 focus:bg-white"
                                style={{ "--tw-border-opacity": "0.7" }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Phone Card - Horizontal Layout */}
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
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-3 border-white flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
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
                              <p className="text-lg font-medium text-slate-700 bg-slate-50 px-4 py-2 rounded-xl">
                                {profileData.phone}
                              </p>
                            ) : (
                              <input
                                type="tel"
                                value={editData.phone}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    phone: e.target.value,
                                  })
                                }
                                className="w-full text-lg border-2 border-slate-200 rounded-xl px-4 py-1 focus:outline-none focus:border-opacity-70 transition-colors bg-slate-50 focus:bg-white"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
    </div>
  );
}
