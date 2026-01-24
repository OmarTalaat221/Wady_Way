"use client";

import React from "react";
import { Modal, Descriptions, Tag, Space } from "antd";
import {
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  CarOutlined,
  SyncOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { IoCarSport } from "react-icons/io5";

const TransportationDetailsModal = ({ open, onClose, data }) => {
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
        label: "Reserved",
      },
      started: {
        color: "processing",
        icon: <PlayCircleOutlined />,
        label: "Active Rental",
      },
      finished: {
        color: "success",
        icon: <CheckCircleOutlined />,
        label: "Returned",
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

  const calculateDays = () => {
    if (!data.startDate || !data.endDate) return 0;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const getRentalType = () => {
    if (data.type === "self_riding") {
      return { label: "Self Drive", color: "blue" };
    } else if (data.type === "with_driver" || data.driverId) {
      return { label: "With Driver", color: "green" };
    }
    return { label: "Standard Rental", color: "default" };
  };

  const rentalType = getRentalType();

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CarOutlined className="text-[#295557]" />
          <span className="text-lg font-semibold">Car Rental Details</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      className="transportation-details-modal"
    >
      <div className="space-y-4">
        <div className="relative h-48 rounded-lg overflow-hidden">
          <img
            src={data.backgroundImage || data.image}
            alt={data.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/700x200?text=Car+Image";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-xl font-bold mb-1 !text-white">{data.title}</h3>
            <div className="flex items-center gap-2">
              <Tag color={rentalType.color} className="border-0">
                <IoCarSport className="inline w-3 h-3 mr-1" />
                {rentalType.label}
              </Tag>
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

          <Descriptions.Item label="Rental Type" span={2}>
            <Tag
              color={rentalType.color}
              icon={<CarOutlined />}
              className="py-1 px-3"
            >
              {rentalType.label}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Pick-up Date">
            {formatDate(data.startDate)}
          </Descriptions.Item>

          <Descriptions.Item label="Return Date">
            {formatDate(data.endDate)}
          </Descriptions.Item>

          <Descriptions.Item label="Rental Duration" span={2}>
            <Space>
              <CalendarOutlined className="text-[#295557]" />
              <span>{calculateDays()} Day(s)</span>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Total Amount" span={2}>
            <Space className="text-lg font-bold text-[#295557]">
              <DollarOutlined />
              {formatPrice(data.price, data.priceCurrency)}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Price Breakdown" span={2}>
            <div className="text-sm text-gray-600">
              {formatPrice(data.price / calculateDays(), data.priceCurrency)}{" "}
              per day × {calculateDays()} day(s)
            </div>
          </Descriptions.Item>
        </Descriptions>

        {(data.status === "started" || data.status === "in_progress") && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-emerald-700">
                Rental Progress
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
            <p className="text-xs text-emerald-600 mt-2">
              Vehicle is currently in your possession
            </p>
          </div>
        )}

        {(data.status === "noStarted" || data.status === "upcoming") && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <CheckCircleOutlined className="mr-2" />
              Your vehicle is reserved and will be ready for pickup on{" "}
              {formatDate(data.startDate)}
            </p>
          </div>
        )}

        {(data.status === "finished" || data.status === "completed") && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-700">
              <CheckCircleOutlined className="mr-2" />
              Vehicle has been successfully returned. Thank you for choosing our
              service!
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TransportationDetailsModal;
