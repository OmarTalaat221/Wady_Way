"use client";

import React from "react";
import { Modal, Descriptions, Tag, Divider, Space } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  SyncOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { FiMapPin } from "react-icons/fi";

const HotelDetailsModal = ({ open, onClose, data }) => {
  if (!data) return null;

  const getStatusTag = (status) => {
    const statusMap = {
      // API statuses
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
      // Date-based statuses
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
      // Legacy statuses
      noStarted: {
        color: "blue",
        icon: <CalendarOutlined />,
        label: "Upcoming",
      },
      started: {
        color: "processing",
        icon: <PlayCircleOutlined />,
        label: "Checked In",
      },
      finished: {
        color: "success",
        icon: <CheckCircleOutlined />,
        label: "Checked Out",
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
    });
  };

  const formatPrice = (price, currency = "$") => {
    if (!price) return "N/A";
    return `${currency}${parseFloat(price).toLocaleString()}`;
  };

  const calculateNights = () => {
    if (!data.startDate || !data.endDate) return 0;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <HomeOutlined className="text-[#295557]" />
          <span className="text-lg font-semibold">Hotel Booking Details</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      className="hotel-details-modal"
    >
      <div className="space-y-4">
        <div className="relative h-48 rounded-lg overflow-hidden">
          <img
            src={data.backgroundImage || data.image}
            alt={data.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/700x200?text=Hotel+Image";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-xl font-bold mb-1 !text-white">{data.title}</h3>
            {data.subtitle && (
              <p className="text-sm opacity-90">{data.subtitle}</p>
            )}
            {data.location && (
              <div className="flex items-center gap-1 text-sm mt-1">
                <FiMapPin className="w-4 h-4" />
                {data.location}
              </div>
            )}
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

          <Descriptions.Item label="Check-in">
            {formatDate(data.startDate)}
          </Descriptions.Item>

          <Descriptions.Item label="Check-out">
            {formatDate(data.endDate)}
          </Descriptions.Item>

          <Descriptions.Item label="Duration" span={2}>
            <Space>
              <CalendarOutlined className="text-[#295557]" />
              <span>{calculateNights()} Night(s)</span>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Guests" span={2}>
            <Space>
              <UserOutlined className="text-[#295557]" />
              <span>{data.numAdults || 0} Adult(s)</span>
              {data.numChildren > 0 && (
                <span>, {data.numChildren} Child(ren)</span>
              )}
            </Space>
          </Descriptions.Item>

          {data.pricePerNight && (
            <Descriptions.Item label="Price per Night" span={2}>
              <Space className="text-base font-semibold text-gray-700">
                <DollarOutlined />
                {formatPrice(data.pricePerNight, data.priceCurrency)}
              </Space>
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Total Amount" span={2}>
            <Space className="text-lg font-bold text-[#295557]">
              <DollarOutlined />
              {formatPrice(data.price, data.priceCurrency)}
            </Space>
          </Descriptions.Item>

          {data.category && (
            <Descriptions.Item label="Category" span={2}>
              <Tag color="purple">{data.category}</Tag>
            </Descriptions.Item>
          )}
        </Descriptions>

        {(data.status === "started" || data.status === "in_progress") && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-emerald-700">
                Current Stay Progress
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
              <CheckCircleOutlined className="mr-2" />
              Your reservation is confirmed. Check-in starts on{" "}
              {formatDate(data.startDate)}.
            </p>
          </div>
        )}

        {(data.status === "finished" || data.status === "completed") && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <p className="text-sm text-purple-700">
              <CheckCircleOutlined className="mr-2" />
              Thank you for your stay. We hope to see you again!
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default HotelDetailsModal;
