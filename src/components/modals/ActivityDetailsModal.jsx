"use client";

import React, { useState } from "react";
import { Modal, Descriptions, Tag, Space, Button } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { FiClock, FiX } from "react-icons/fi";
import axios from "axios";
import { baseUrl } from "../../Constants/Const";
import toast from "react-hot-toast";

const ActivityDetailsModal = ({ open, onClose, data, refetchBookings }) => {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  if (!data) return null;

  const isPending = data.apiStatus === "pending" || data.status === "pending";

  const getStatusTag = (status) => {
    const statusMap = {
      accepted: {
        color: "success",
        icon: <CheckCircleOutlined />,
        label: "Accepted",
      },
      pending: {
        color: "warning",
        icon: <ClockCircleOutlined />,
        label: "Pending",
      },
      rejected: {
        color: "error",
        icon: <CloseCircleOutlined />,
        label: "Rejected",
      },
      cancelled: {
        color: "default",
        icon: <ExclamationCircleOutlined />,
        label: "Cancelled",
      },
      upcoming: {
        color: "blue",
        icon: <CalendarOutlined />,
        label: "Upcoming",
      },
      in_progress: {
        color: "processing",
        icon: <SyncOutlined spin />,
        label: "In Progress",
      },
      completed: {
        color: "success",
        icon: <CheckCircleOutlined />,
        label: "Completed",
      },
      noStarted: {
        color: "blue",
        icon: <CalendarOutlined />,
        label: "Upcoming",
      },
      started: {
        color: "processing",
        icon: <PlayCircleOutlined />,
        label: "In Progress",
      },
      finished: {
        color: "success",
        icon: <CheckCircleOutlined />,
        label: "Completed",
      },

      cancelled_by_user: {
        color: "default",
        icon: <FiX />,
        label: "Cancelled",
      },
    };

    const config = statusMap[status] || statusMap.pending;
    return (
      <Tag
        color={config.color}
        icon={config.icon}
        className="text-sm py-1 px-3"
      >
        {config.label}
      </Tag>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatPrice = (price, currency = "$") => {
    if (!price) return "N/A";
    return `${currency}${parseFloat(price).toLocaleString()}`;
  };

  const getUserId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      return userData.id || userData.user_id || null;
    } catch {
      return null;
    }
  };

  const handleCancelReservation = async () => {
    const userId = getUserId();

    if (!userId) {
      toast.error("User not found. Please log in again.");
      return;
    }

    try {
      setCancelLoading(true);

      const response = await axios.post(
        `${baseUrl}/activities/cancel_reservation.php`,
        {
          user_id: userId,
          reserving_id: parseInt(data.id),
        }
      );

      if (response.data.status === "success" || response.data.success) {
        toast.success("Reservation cancelled successfully");
        setCancelModalOpen(false);
        if (refetchBookings) await refetchBookings();
        onClose();
      } else {
        throw new Error(
          response.data.message || "Failed to cancel reservation"
        );
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to cancel reservation"
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const handleMainClose = () => {
    setCancelModalOpen(false);
    onClose();
  };

  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-[#295557]" />
            <span className="text-lg font-semibold">
              Activity Booking Details
            </span>
          </div>
        }
        open={open}
        onCancel={handleMainClose}
        width={700}
        className="activity-details-modal"
        footer={[
          <Button key="close" onClick={handleMainClose}>
            Close
          </Button>,
          isPending ? (
            <Button
              key="cancel-booking"
              danger
              type="primary"
              onClick={() => setCancelModalOpen(true)}
            >
              Cancel Reservation
            </Button>
          ) : null,
        ].filter(Boolean)}
      >
        <div className="space-y-4">
          <div className="relative h-48 rounded-lg overflow-hidden">
            <img
              src={data.backgroundImage || data.image}
              alt={data.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/700x200?text=Activity+Image";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-xl font-bold mb-1 !text-white">
                {data.title}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <FiClock className="w-4 h-4" />
                {data.duration}
              </div>
            </div>
          </div>

          <Descriptions
            bordered
            column={{ xs: 1, sm: 2 }}
            size="small"
            labelStyle={{ fontWeight: 600, background: "#f9fafb" }}
          >
            <Descriptions.Item label="Booking ID" span={2}>
              <span className="font-mono text-[#295557]">#{data.id}</span>
            </Descriptions.Item>

            <Descriptions.Item label="Status" span={2}>
              {getStatusTag(data.apiStatus || data.status)}
            </Descriptions.Item>

            <Descriptions.Item label="Activity Date" span={2}>
              <Space>
                <CalendarOutlined className="text-[#295557]" />
                <span className="font-medium">
                  {formatDate(data.startDate)}
                </span>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Adults">
              <Space>
                <UserOutlined className="text-[#295557]" />
                <span>{data.numAdults || 0} Adult(s)</span>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Children">
              <Space>
                <UserOutlined className="text-[#295557]" />
                <span>{data.numChildren || 0} Child(ren)</span>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Total Participants" span={2}>
              <Space className="text-base font-semibold text-[#295557]">
                <UserOutlined />
                {(data.numAdults || 0) + (data.numChildren || 0)} Person(s)
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Total Amount" span={2}>
              <Space className="text-lg font-bold text-[#295557]">
                <DollarOutlined />
                {formatPrice(data.price, data.priceCurrency)}
              </Space>
            </Descriptions.Item>
          </Descriptions>

          {(data.status === "started" || data.status === "in_progress") && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-emerald-700">
                  Activity in Progress
                </span>
                <span className="text-sm font-bold text-emerald-700">
                  {data.progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${data.progress}%` }}
                />
              </div>
            </div>
          )}

          {(data.status === "noStarted" || data.status === "upcoming") && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-700">
                Your activity is scheduled and confirmed. We look forward to
                seeing you!
              </p>
            </div>
          )}

          {(data.status === "finished" || data.status === "completed") && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <p className="text-sm text-purple-700">
                <CheckCircleOutlined className="mr-2" />
                Activity completed successfully. Thank you for participating!
              </p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        onOk={handleCancelReservation}
        confirmLoading={cancelLoading}
        okText="Cancel Reservation"
        cancelText="Keep Booking"
        okButtonProps={{ danger: true }}
        centered
        destroyOnClose
        title="Cancel Reservation"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-0">
            Are you sure you want to cancel this activity reservation?
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-red-700 mb-1">
              {data.title}
            </p>
            <p className="text-xs text-red-600 mb-1">
              Date: {formatDate(data.startDate)}
            </p>
            <p className="text-xs text-red-600 mb-0">
              Amount: {formatPrice(data.price, data.priceCurrency)}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ActivityDetailsModal;
