"use client";

import React, { useState } from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Divider,
  Space,
  Collapse,
  Timeline,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  CarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  RightOutlined,
  SyncOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import "./modals.css";
import { FiMapPin, FiClock, FiCheck, FiX } from "react-icons/fi";
import { MdLocalActivity } from "react-icons/md";

const { Panel } = Collapse;

const TourDetailsModal = ({ open, onClose, data }) => {
  const [activeDay, setActiveDay] = useState(["1"]);

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

  const parseTourGuideData = () => {
    const tourGuideData = {};

    if (data.dayTourGuide) {
      const entries = data.dayTourGuide.split("**day**");

      entries.forEach((entry) => {
        const trimmedEntry = entry.trim();
        if (trimmedEntry) {
          const parts = trimmedEntry.split("**");
          if (parts.length >= 2) {
            const dayNumber = parts[0].trim();
            const hasGuide = parts[1].trim();
            tourGuideData[dayNumber] = hasGuide === "1";
          }
        }
      });
    } else if (data.itinerary) {
      data.itinerary.forEach((dayData) => {
        const hasGuide =
          dayData.tour_guide === "1" ||
          dayData.tour_guide === 1 ||
          dayData.tour_guide === true;
        tourGuideData[dayData.day] = hasGuide;
      });
    }

    return tourGuideData;
  };

  const tourGuideInfo = parseTourGuideData();

  const renderDayDetails = (dayData, dayNumber) => {
    const hasTourGuide = tourGuideInfo[dayData.day] || false;

    return (
      <div className="space-y-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-700">{dayData.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {dayData.hotel_reserved && (
            <div className="bg-white border border-purple-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={dayData.hotel_reserved.image}
                    alt={dayData.hotel_reserved.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/80?text=Hotel";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-semibold text-sm text-gray-800 truncate">
                      {dayData.hotel_reserved.title}
                    </h5>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      Adult: {formatPrice(dayData.hotel_reserved.adult_price)}
                    </span>
                    {dayData.hotel_reserved.child_price && (
                      <span className="flex items-center gap-1">
                        Child: {formatPrice(dayData.hotel_reserved.child_price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {dayData.car_reserved && (
            <div className="bg-white border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={dayData.car_reserved.image}
                    alt={dayData.car_reserved.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/80?text=Car";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-semibold text-sm text-gray-800 truncate">
                      {dayData.car_reserved.title}
                    </h5>
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      {formatPrice(dayData.car_reserved.price_current)} / day
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {dayData.activity_reserved && (
            <div className="bg-white border border-orange-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={dayData.activity_reserved.image?.split("//CAMP//")[0]}
                    alt={dayData.activity_reserved.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/80?text=Activity";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-semibold text-sm text-gray-800 truncate">
                      {dayData.activity_reserved.title}
                    </h5>
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      {formatPrice(dayData.activity_reserved.price_current)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TeamOutlined className="text-teal-600 text-lg" />
                <span className="font-semibold text-sm text-gray-800">
                  Tour Guide
                </span>
              </div>
              {hasTourGuide ? (
                <Tag color="success">
                  <div className="flex items-center gap-1">
                    <FiCheck className="inline w-3 h-3" />
                    Included
                  </div>
                </Tag>
              ) : (
                <Tag color="default">
                  <div className="flex items-center gap-1">
                    <FiX className="inline w-3 h-3" />
                    Not Included
                  </div>
                </Tag>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-[#295557]" />
          <span className="text-lg font-semibold">Tour Booking Details</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      className="tour-details-modal"
    >
      <div className="space-y-4">
        <div className="relative h-48 rounded-lg overflow-hidden">
          <img
            src={data.backgroundImage || data.image}
            alt={data.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/800x200?text=Tour+Image";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-xl font-bold mb-1 !text-white">{data.title}</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <FiClock className="w-4 h-4" />
                {data.duration}
              </span>
              {data.mainLocations?.[0] && (
                <span className="flex items-center gap-1">
                  <FiMapPin className="w-4 h-4" />
                  {data.mainLocations[0]}
                </span>
              )}
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

          <Descriptions.Item label="Start Date">
            {formatDate(data.startDate)}
          </Descriptions.Item>

          <Descriptions.Item label="End Date">
            {formatDate(data.endDate)}
          </Descriptions.Item>

          <Descriptions.Item label="Duration" span={2}>
            <Space>
              <CalendarOutlined className="text-[#295557]" />
              <span>
                {calculateNights()}{" "}
                {calculateNights() === 1 ? "Night" : "Nights"} /{" "}
                {calculateNights() + 1}{" "}
                {calculateNights() + 1 === 1 ? "Day" : "Days"}
              </span>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Adults">
            <Space>
              <UserOutlined className="text-[#295557]" />
              <span>
                {data.numAdults || 0} Adult{data.numAdults !== 1 ? "s" : ""}
              </span>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Children">
            <Space>
              <UserOutlined className="text-[#295557]" />
              <span>
                {data.numChildren || 0} Child
                {data.numChildren !== 1 ? "ren" : ""}
              </span>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Total Amount" span={2}>
            <Space className="text-lg font-bold text-[#295557]">
              {formatPrice(data.price, data.priceCurrency)}
            </Space>
          </Descriptions.Item>
        </Descriptions>

        {(data.status === "started" || data.status === "in_progress") && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-emerald-700">
                Trip Progress
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

        {data.itinerary && data.itinerary.length > 0 && (
          <>
            <Divider orientation="left" className="text-sm font-semibold">
              <CalendarOutlined className="mr-2" />
              Daily Itinerary
            </Divider>

            <Collapse
              activeKey={activeDay}
              onChange={setActiveDay}
              expandIcon={({ isActive }) => (
                <RightOutlined rotate={isActive ? 90 : 0} />
              )}
              className="tour-itinerary-collapse"
            >
              {data.itinerary.map((dayData, index) => (
                <Panel
                  header={
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#295557] text-white flex items-center justify-center font-bold text-sm">
                          {dayData.day}
                        </div>
                        <div>
                          <h4 className="font-semibold text-base text-gray-800 !mb-0">
                            {dayData.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5 !mb-0">
                            Day {dayData.day} of the trip
                          </p>
                        </div>
                      </div>
                    </div>
                  }
                  key={index.toString()}
                  className="mb-2"
                >
                  {renderDayDetails(dayData, index + 1)}
                </Panel>
              ))}
            </Collapse>
          </>
        )}
      </div>
    </Modal>
  );
};

export default TourDetailsModal;
