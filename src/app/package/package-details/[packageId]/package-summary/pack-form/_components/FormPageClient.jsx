"use client";
import React, { useState } from "react";
import { Upload, Modal, Rate, message } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { FaEye, FaHeart } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { base_url } from "../../../../../../../uitils/base_url";
import axios from "axios";

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const TourRatingForm = ({
  userId,
  tourId,
  tourName = "Amazing Egypt Tour",
}) => {
  const [imageList, setImageList] = useState([]);
  const [video, setVideo] = useState(null); // Single video
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewVideo, setPreviewVideo] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Success state

  // Form State
  const [formData, setFormData] = useState({
    comment: "",
    overall: 0,
    transport: 0,
    hotel: 0,
    activity: 0,
  });

  // Uploaded file URLs (returned from server)
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedVideo, setUploadedVideo] = useState(null); // Single video URL

  // Handle Rating Change
  const handleRatingChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle Comment Change
  const handleCommentChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      comment: e.target.value,
    }));
  };

  // Upload Single Image to Server
  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        `${base_url}/user/item_img_uploader.php`,
        formData
      );

      if (response.status === 200) {
        return response.data || response.data || response.data;
      } else {
        throw new Error(response.data?.message || "Image upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };

  // Upload Single Video to Server
  const uploadVideoToServer = async (file) => {
    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await axios.post(
        `${base_url}/user/video_uploader.php`,
        formData
      );

      if (response.data?.status === "success") {
        return response.data.message || response.data.url || response.data.path;
      } else {
        throw new Error(response.data?.message || "Video upload failed");
      }
    } catch (error) {
      console.error("Video upload error:", error);
      throw error;
    }
  };

  // Handle Image Upload
  const handleImageUpload = async ({ file, fileList }) => {
    setImageList(fileList);

    if (file.status === "uploading" || file.originFileObj) {
      const isNewFile = !imageList.find((img) => img.uid === file.uid);

      if (isNewFile && file.originFileObj) {
        try {
          const uploadedUrl = await uploadImageToServer(file.originFileObj);

          setUploadedImages((prev) => [
            ...prev,
            { uid: file.uid, url: uploadedUrl },
          ]);

          message.success("Image uploaded successfully");
        } catch (error) {
          message.error("Failed to upload image");
          setImageList((prev) => prev.filter((img) => img.uid !== file.uid));
        }
      }
    }

    if (file.status === "removed") {
      setUploadedImages((prev) => prev.filter((img) => img.uid !== file.uid));
    }
  };

  // Handle Single Video Upload
  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingVideo(true);

    const localUrl = URL.createObjectURL(file);

    // Set video with loading state
    setVideo({
      file: file,
      url: localUrl,
      name: file.name,
      uploading: true,
      serverUrl: null,
    });

    try {
      const uploadedUrl = await uploadVideoToServer(file);

      setVideo((prev) => ({
        ...prev,
        uploading: false,
        serverUrl: uploadedUrl,
      }));

      setUploadedVideo(uploadedUrl);

      message.success("Video uploaded successfully");
    } catch (error) {
      message.error("Failed to upload video");
      URL.revokeObjectURL(localUrl);
      setVideo(null);
      setUploadedVideo(null);
    }

    setUploadingVideo(false);
    event.target.value = "";
  };

  // Delete Video
  const handleVideoDelete = (e) => {
    e.stopPropagation();

    if (video?.url) {
      URL.revokeObjectURL(video.url);
    }

    setVideo(null);
    setUploadedVideo(null);
  };

  // Open Modal with Video Preview
  const handleVideoPreview = (e) => {
    e.stopPropagation();
    if (video?.url) {
      setPreviewVideo(video.url);
      setPreviewVisible(true);
    }
  };

  // Open Image Preview
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  // Submit Form
  const handleSubmit = async () => {
    if (formData.overall === 0) {
      message.warning("Please provide an overall rating");
      return;
    }

    if (video?.uploading) {
      message.warning("Please wait for video to finish uploading");
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        user_id: userId || "6",
        tour_id: tourId || "14",
        comment: formData.comment,
        overall: formData.overall,
        transport: formData.transport,
        hotel: formData.hotel,
        activity: formData.activity,
        images: uploadedImages.map((img) => img.url),
        video: uploadedVideo || "",
      };

      const response = await axios.post(
        `${base_url}/user/rating/tour_rating.php`,
        submitData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.status === "success") {
        setIsSuccess(true);
      } else {
        message.error(response.data?.message || "Something went wrong");
      }
    } catch (error) {
      message.error("Failed to submit rating. Please try again.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Success Screen
  if (isSuccess) {
    return (
      <div className={`rating-container ${isSuccess ? "!items-center" : ""}`}>
        <div className="rating-card">
          <div className="rating-gradient-bg success-bg"></div>
          <div className="rating-content success-content">
            {/* Confetti Animation */}
            <div className="confetti-container">
              {[...Array(50)].map((_, i) => (
                <div key={i} className={`confetti confetti-${i % 6}`}></div>
              ))}
            </div>

            {/* Success Icon */}
            <div className="success-icon-wrapper">
              <div className="success-icon">
                <img
                  src="https://res.cloudinary.com/dkc5klynm/image/upload/v1769242456/W_eaaxsn.png"
                  alt="Wady Way"
                />
              </div>
              <div className="success-ripple"></div>
              <div className="success-ripple delay-1"></div>
              <div className="success-ripple delay-2"></div>
            </div>

            {/* Success Message */}
            <div className="success-message">
              <h1>Thank You!</h1>
              <p className="success-subtitle">
                Your review has been submitted successfully
              </p>
            </div>

            {/* Appreciation Message */}
            <div className="appreciation-box">
              <p>
                We truly appreciate you taking the time to share your experience
                with us. Your feedback helps us serve you and other travelers
                better!
              </p>
            </div>

            {/* Footer Message */}
            <div className="success-footer">
              <p>We hope to see you on another adventure soon!</p>
              <div className="wady-team">
                <span>With love,</span>
                <strong>The Wady Way Team</strong>
              </div>
            </div>

            {/* Optional: Button to go back or explore */}
            {/* <button
              className="explore-btn"
              onClick={() => (window.location.href = "/")}
            >
              Explore More Tours
            </button> */}
          </div>
        </div>
      </div>
    );
  }

  // Main Form
  return (
    <div className="rating-container">
      <div className="rating-card">
        <div className="rating-gradient-bg"></div>
        <div className="rating-content">
          {/* Logo */}
          <div className="rating-logo">
            <img
              src="https://res.cloudinary.com/dkc5klynm/image/upload/v1769242456/W_eaaxsn.png"
              alt="Wady Way"
            />
          </div>

          {/* Header */}
          <div className="rating-header">
            <h1 className="rating-title">How Was Your Experience?</h1>
            <p className="rating-subtitle">
              We hope you enjoyed <strong>{tourName}</strong>. Your feedback
              helps us improve and serve you better.
            </p>
          </div>

          <div className="rating-form">
            {/* Rating Grid */}
            <div className="rating-grid">
              {/* Overall Rating */}
              <div className="rating-section overall-rating">
                <div className="rating-section-header">
                  <div className="rating-info">
                    <h3>Overall Experience</h3>
                    <p>How would you rate your overall trip?</p>
                  </div>
                </div>
                <div className="rating-stars-container">
                  <Rate
                    value={formData.overall}
                    onChange={(value) => handleRatingChange("overall", value)}
                    className="custom-rate overall-rate"
                  />
                </div>
              </div>

              {/* Transport */}
              <div className="rating-section category">
                <div className="rating-section-header">
                  <div className="rating-info">
                    <h3>Transport</h3>
                    <p>Vehicles, drivers & comfort</p>
                  </div>
                </div>
                <div className="rating-stars-container">
                  <Rate
                    value={formData.transport}
                    onChange={(value) => handleRatingChange("transport", value)}
                    className="custom-rate"
                  />
                </div>
              </div>

              {/* Hotel */}
              <div className="rating-section category">
                <div className="rating-section-header">
                  <div className="rating-info">
                    <h3>Accommodation</h3>
                    <p>Hotels, rooms & service</p>
                  </div>
                </div>
                <div className="rating-stars-container">
                  <Rate
                    value={formData.hotel}
                    onChange={(value) => handleRatingChange("hotel", value)}
                    className="custom-rate"
                  />
                </div>
              </div>

              {/* Activities */}
              <div className="rating-section category">
                <div className="rating-section-header">
                  <div className="rating-info">
                    <h3>Activities</h3>
                    <p>Tours, guides & experiences</p>
                  </div>
                </div>
                <div className="rating-stars-container">
                  <Rate
                    value={formData.activity}
                    onChange={(value) => handleRatingChange("activity", value)}
                    className="custom-rate"
                  />
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className="input-group">
              <label className="input-label">Share Your Story</label>
              <textarea
                value={formData.comment}
                onChange={handleCommentChange}
                placeholder="Tell us about your favorite moments, what you loved, and any suggestions for improvement..."
                rows="4"
              ></textarea>
            </div>

            {/* Image Upload */}
            <div className="input-group">
              <label className="input-label">Share Photos</label>
              <p className="input-hint">Add photos from your trip</p>
              <Upload
                listType="picture-card"
                fileList={imageList}
                onChange={handleImageUpload}
                accept="image/*"
                onPreview={handlePreview}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                }}
                className="custom-upload"
                multiple
                customRequest={({ onSuccess }) => {
                  setTimeout(() => onSuccess("ok"), 0);
                }}
              >
                {imageList.length < 10 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </div>

            <Modal
              open={previewOpen}
              footer={null}
              onCancel={() => setPreviewOpen(false)}
              centered
            >
              <img src={previewImage} alt="Preview" style={{ width: "100%" }} />
            </Modal>

            {/* Single Video Upload */}
            <div className="input-group">
              <label className="input-label">Share Video</label>
              <p className="input-hint">Add a video from your experience</p>
              <div className="video-upload-wrapper">
                {!video && (
                  <label
                    htmlFor="video-upload"
                    className={`video-upload-label ${uploadingVideo ? "uploading" : ""}`}
                  >
                    {uploadingVideo ? (
                      <>
                        <LoadingOutlined />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <PlusOutlined />
                        <span>Add Video</span>
                      </>
                    )}
                  </label>
                )}
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="video-upload-input"
                  disabled={uploadingVideo || video}
                />

                {video && (
                  <div
                    className={`video-thumbnail zoomIn ${video.uploading ? "uploading" : ""}`}
                  >
                    <div className="video_cont">
                      <video src={video.url} muted />
                      {video.uploading && (
                        <div className="video-loading-overlay">
                          <LoadingOutlined />
                        </div>
                      )}
                      {!video.uploading && (
                        <div className="video_preview">
                          <span
                            className="preview-icon"
                            onClick={handleVideoPreview}
                          >
                            <FaEye />
                          </span>
                          <span
                            className="delete-icon"
                            onClick={handleVideoDelete}
                          >
                            <MdDelete />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Video Preview Modal */}
            {previewVisible && (
              <Modal
                open={previewVisible}
                footer={null}
                onCancel={() => {
                  setPreviewVisible(false);
                  setPreviewVideo("");
                }}
                destroyOnClose
                centered
              >
                {previewVideo && (
                  <video controls autoPlay style={{ width: "100%" }}>
                    <source src={previewVideo} type="video/mp4" />
                  </video>
                )}
              </Modal>
            )}

            {/* Submit Button */}
            <button
              className={`submit-btn ${submitting ? "loading" : ""}`}
              onClick={handleSubmit}
              disabled={submitting || uploadingVideo}
            >
              {submitting ? (
                <>
                  <LoadingOutlined />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Review</span>
              )}
            </button>

            <p className="privacy-note">
              Your feedback will be shared publicly to help other travelers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourRatingForm;
