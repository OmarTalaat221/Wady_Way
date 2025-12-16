"use client";

import React, { useState, useEffect } from "react";
import { Modal, Rate, message } from "antd";
import axios from "axios";
import { base_url } from "@/uitils/base_url";
import toast from "react-hot-toast";
import "./style.css";

const ReviewModal = ({
  open,
  onClose,
  itemId,
  itemType = "hotel",
  itemName = "",
  apiEndpoint = "/user/rating/hotel_rating.php",
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    score: 0,
    comment: "",
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setTimeout(() => {
        setFormData({
          score: 0,
          comment: "",
        });
      }, 300); // Wait for close animation
    }
  }, [open]);

  // Get user from localStorage
  const getUserId = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return user.user_id || user.id;
      }
    } catch (error) {
      console.error("Error getting user:", error);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    // Validation
    if (formData.score === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!formData.comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    if (formData.comment.trim().length < 10) {
      toast.error("Review must be at least 10 characters long");
      return;
    }

    const userId = getUserId();
    if (!userId) {
      toast.error("Please login to submit a review");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
      return;
    }

    setLoading(true);

    try {
      const reviewData = {
        user_id: userId,
        [`${itemType}_id`]: itemId,
        comment: formData.comment.trim(),
        score: formData.score,
      };

      const response = await axios.post(
        `${base_url}${apiEndpoint}`,
        reviewData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success === "success" || response.status === 200) {
        toast.success("Thank you! Your review has been submitted successfully");

        if (onSuccess) {
          onSuccess(reviewData);
        }

        onClose();
      } else {
        toast.error(response.data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to submit review. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      centered
      width="95%"
      className="review-modal"
      maskClosable={!loading}
      closable={!loading}
      keyboard={!loading} // ESC key to close
      styles={{
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
          padding: 0,
        },
      }}
      style={{
        maxWidth: "900px",
      }}
      afterClose={() => {
        // Reset form after modal is completely closed
        setFormData({
          score: 0,
          comment: "",
        });
        setLoading(false);
      }}
    >
      <div className="p-6 sm:p-8 md:p-10">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[--title-color] leading-tight">
                Rate Your Experience
              </h3>
            </div>
          </div>
          {itemName && (
            <p className="text-sm sm:text-base text-gray-600">
              How was your experience with{" "}
              <strong className="text-[--title-color]">{itemName}</strong>?
            </p>
          )}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 md:space-y-8"
          noValidate
        >
          {/* Rating Section */}
          <div className="form-group">
            <label className="block text-base sm:text-lg font-semibold text-[--title-color] mb-3 sm:mb-4">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Rate
                  allowHalf
                  value={formData.score}
                  onChange={(value) =>
                    setFormData({ ...formData, score: value })
                  }
                  className="custom-rate text-3xl sm:text-4xl"
                  disabled={loading}
                />
                {formData.score > 0 && (
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                    <span className="text-xl sm:text-2xl font-bold text-[--primary-color1]">
                      {formData.score}
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="text-lg sm:text-xl text-gray-600">5</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <div className="form-group">
            <label className="block text-base sm:text-lg font-semibold text-[--title-color] mb-3 sm:mb-4">
              Your Review <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                placeholder="Share your experience... Tell us what you liked or what could be improved."
                rows={6}
                disabled={loading}
                maxLength={500}
                className="w-full px-4 py-3 sm:px-5 sm:py-4 border-2 border-gray-200 rounded-xl
                         focus:outline-none focus:border-[--primary-color1] 
                         focus:ring-4 focus:ring-[--primary-color1]/10
                         resize-none text-sm sm:text-base text-gray-700
                         disabled:bg-gray-100 disabled:cursor-not-allowed
                         transition-all duration-300 placeholder:text-gray-400"
              />
              {/* Character Counter */}
              <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 mt-2 px-1">
                <small className="text-xs sm:text-sm text-gray-500">
                  {formData.comment.length < 10 ? (
                    <span className="text-orange-500 font-medium">
                      Minimum 10 characters ({10 - formData.comment.length} more
                      needed)
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">
                      ✓ Minimum length reached
                    </span>
                  )}
                </small>
                <small className="text-xs sm:text-sm font-medium text-gray-600">
                  {formData.comment.length}/500
                </small>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-6 py-3.5 sm:py-4 border-2 border-gray-300 
                       text-gray-700 font-semibold rounded-xl text-sm sm:text-base
                       hover:bg-gray-50 hover:border-gray-400
                       active:scale-[0.98]
                       transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                formData.score === 0 ||
                !formData.comment.trim() ||
                formData.comment.trim().length < 10
              }
              className="flex-1 px-6 py-3.5 sm:py-4 bg-[--primary-color1]
                       text-white font-semibold rounded-xl text-sm sm:text-base
                       hover:bg-[#214546]
                       active:scale-[0.98]
                       transition-all duration-300 shadow-lg hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed
                       disabled:bg-gray-400 disabled:shadow-none
                       flex items-center justify-center gap-2 sm:gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ReviewModal;
