"use client";

import React, { useState } from "react";
import { Modal, Descriptions, Tag, Space, Button, Divider } from "antd";
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
import { FaBed, FaChild, FaBaby } from "react-icons/fa";
import axios from "axios";
import { baseUrl } from "../../Constants/Const";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";

const HotelDetailsModal = ({ open, onClose, data, refetchBookings }) => {
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
        label: "Checked In",
      },
      finished: {
        color: "success",
        icon: <CheckCircleOutlined />,
        label: "Checked Out",
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

  const getUserId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      return userData.id || userData.user_id || null;
    } catch {
      return null;
    }
  };

  const getRooms = () => {
    if (Array.isArray(data.rooms) && data.rooms.length > 0) return data.rooms;
    if (
      Array.isArray(data._rawApiItem?.rooms) &&
      data._rawApiItem.rooms.length > 0
    ) {
      return data._rawApiItem.rooms;
    }
    if (
      Array.isArray(data._rawApiItem?.hotel_reserved?.rooms) &&
      data._rawApiItem.hotel_reserved.rooms.length > 0
    ) {
      return data._rawApiItem.hotel_reserved.rooms;
    }
    return [];
  };

  const rooms = getRooms();

  const handleCancelReservation = async () => {
    const userId = getUserId();

    if (!userId) {
      toast.error("User not found. Please log in again.");
      return;
    }

    try {
      setCancelLoading(true);

      const response = await axios.post(
        `${baseUrl}/hotels/cancel_reservation.php`,
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
            <HomeOutlined className="text-[#295557]" />
            <span className="text-lg font-semibold">Hotel Booking Details</span>
          </div>
        }
        open={open}
        onCancel={handleMainClose}
        width={700}
        className="hotel-details-modal"
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
                  "https://via.placeholder.com/700x200?text=Hotel+Image";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-xl font-bold mb-1 !text-white">
                {data.title}
              </h3>
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

          {rooms.length > 0 && (
            <div>
              <Divider className="!my-3">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FaBed className="text-[#295557]" />
                  Rooms
                </span>
              </Divider>

              <div className="space-y-3">
                {rooms.map((room, index) => {
                  const adultsCount = Number(room.adults || 0);
                  const childrenCount = Number(room.kids ?? room.children ?? 0);
                  const babiesCount = Number(room.babies ?? room.infants ?? 0);

                  return (
                    <div
                      key={room.id || index}
                      className="border border-gray-200 rounded-xl p-3 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">
                          Room {index + 1}
                        </span>
                        <Tag color="geekblue">
                          {adultsCount + childrenCount + babiesCount} Guest(s)
                        </Tag>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Tag color="blue" className="!m-0">
                          <UserOutlined /> {adultsCount} Adult(s)
                        </Tag>

                        {childrenCount > 0 && (
                          <Tag color="orange" className="!m-0">
                            <FaChild className="inline mr-1" />
                            {childrenCount} Child(ren)
                          </Tag>
                        )}

                        {babiesCount > 0 && (
                          <Tag color="magenta" className="!m-0">
                            <FaBaby className="inline mr-1" />
                            {babiesCount} Infant(s)
                          </Tag>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
            Are you sure you want to cancel this hotel reservation?
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-red-700 mb-1">
              {data.title}
            </p>
            <p className="text-xs text-red-600 mb-1">
              Check-in: {formatDate(data.startDate)}
            </p>
            <p className="text-xs text-red-600 mb-1">
              Check-out: {formatDate(data.endDate)}
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

export default HotelDetailsModal;
