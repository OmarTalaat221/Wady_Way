"use client";
import React, { useEffect, useState } from "react";
import { Upload, Modal, Progress, Image } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { FaEye } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const FormPageClient = () => {
  const [imageList, setImageList] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewVideo, setPreviewVideo] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Handle Video Upload
  const handleVideoUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const newVideos = Array.from(files).map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
      }));
      setVideoList((prev) => [...prev, ...newVideos]); // Append new videos
    }
  };

  // Open Modal with Selected Video
  const handleVideoPreview = (videoUrl) => {
    setPreviewVideo(videoUrl);
    setPreviewVisible(true);
  };

  // Handle Image Upload and Preview
  const handleImageUpload = async ({ fileList }) => {
    const newImages = await Promise.all(
      fileList.map(async (file) => ({
        uid: file.uid,
        url: file.originFileObj
          ? await getBase64(file.originFileObj)
          : file.url,
        name: file.name,
      }))
    );
    setImageList(newImages);
  };

  // Open Image Preview
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-gradient-bg"></div>
        <div className="login-content">
          <div className="login-form">
            <h1 className="login-title">Share Your Experience</h1>
            <p style={{ fontSize: "10px", color: "#787878" }} className="mb-3">
              Share your thoughts on the tour experience and let us know how we
              can improve.
            </p>

            {/* Client Story (Written) */}
            <div className="login-input-group">
              <textarea
                id="client-story-text"
                name="clientStory"
                placeholder="Client Story"
                rows="4"
              ></textarea>
              <label htmlFor="client-story-text" className="login-label">
                Client Story
              </label>
            </div>

            <div className="login-input-group">
              <Upload
                listType="picture-card"
                fileList={imageList}
                onChange={handleImageUpload}
                accept="image/*"
                onPreview={handlePreview}
                showUploadList={{ showPreviewIcon: true }}
              >
                <div>
                  {loading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
              {loading && <Progress percent={progress} />}
            </div>

            <Modal
              open={previewOpen}
              footer={null}
              onCancel={() => setPreviewOpen(false)}
            >
              <img src={previewImage} alt="Preview" style={{ width: "100%" }} />
            </Modal>

            <div className="login-input-group">
              <div className="video-upload-container">
                <label htmlFor="video-upload" className="video-upload-label">
                  <PlusOutlined />
                  Add Videos
                </label>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className="video-upload-input"
                />
              </div>

              <div className="video-preview-list mb-2">
                {videoList.map((video, index) => (
                  <div
                    key={index}
                    className="video-thumbnail zoomIn"
                    onClick={() => handleVideoPreview(video.url)}
                  >
                    <div className="video_cont">
                      <video src={video.url} />
                      <div className="video_preview ">
                        <FaEye />

                        <MdDelete />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {previewVisible && (
              <Modal
                open={previewVisible}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
              >
                {previewVideo && (
                  <video controls autoPlay style={{ width: "100%" }}>
                    <source src={previewVideo} type="video/mp4" />
                  </video>
                )}
              </Modal>
            )}

            <button className="login-submit-btn">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPageClient;
