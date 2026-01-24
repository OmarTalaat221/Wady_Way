"use client";

import React from "react";
import { Modal, Descriptions, Tag, Space } from "antd";
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
import { FiClock } from "react-icons/fi";

const ActivityDetailsModal = ({ open, onClose, data }) => {
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
        label: "In Progress",
      },
      finished: {
        color: "success",
        icon: <CheckCircleOutlined />,
        label: "Completed",
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

  return (
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
      onCancel={onClose}
      footer={null}
      width={700}
      className="activity-details-modal"
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
            <h3 className="text-xl font-bold mb-1 !text-white">{data.title}</h3>
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
              <span className="font-medium">{formatDate(data.startDate)}</span>
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
  );
};

export default ActivityDetailsModal;
