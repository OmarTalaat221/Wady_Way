// TourDetailsModal.jsx
"use client";

import React, { useState } from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Divider,
  Space,
  Collapse,
  Button,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
  SyncOutlined,
  PlayCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import "./modals.css";
import { FiMapPin, FiClock, FiCheck, FiX } from "react-icons/fi";
import axios from "axios";
import { baseUrl } from "../../Constants/Const";
import toast from "react-hot-toast";

const { Panel } = Collapse;

const CAMP_SEPARATOR = "//CAMP//";

const getFirstCampImage = (value) => {
  if (!value || typeof value !== "string") return value || "";
  return value.split(CAMP_SEPARATOR)[0]?.trim() || "";
};

const TourDetailsModal = ({ open, onClose, data, refetchBookings }) => {
  const [activeDay, setActiveDay] = useState(["0"]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  if (!data) return null;

  const isPending = data.apiStatus === "pending" || data.status === "pending";
  const isCancelledByUser =
    data.apiStatus === "cancelled_by_user" ||
    data.status === "cancelled_by_user";

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
      cancelled_by_user: {
        color: "default",
        icon: <CloseCircleOutlined />,
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

  const parseTourGuideData = () => {
    const tourGuideData = {};

    if (data.dayTourGuide || data.day_tour_guide) {
      const raw = data.dayTourGuide || data.day_tour_guide;
      const entries = raw.split("**day**");
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

  const handleCancelReservation = async () => {
    const userId = getUserId();
    if (!userId) {
      toast.error("User not found. Please log in again.");
      return;
    }

    const reservationId = data.reservation_id || data.id;

    try {
      setCancelLoading(true);
      const response = await axios.post(
        `${baseUrl}/tours/cancel_reservation.php`,
        {
          user_id: userId,
          reserving_id: parseInt(reservationId),
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

  // ─── Normalize car_reserved to always be an array ─────────────────────────
  const normalizeCarsArray = (carReserved) => {
    if (!carReserved) return [];
    if (Array.isArray(carReserved)) return carReserved;
    if (typeof carReserved === "object") return [carReserved];
    return [];
  };

  // ─── Normalize activity_reserved to always be an array ───────────────────
  const normalizeActivitiesArray = (actReserved) => {
    if (!actReserved) return [];
    if (Array.isArray(actReserved)) return actReserved;
    if (typeof actReserved === "object") return [actReserved];
    return [];
  };

  // ─── Render rooms ─────────────────────────────────────────────────────────
  const renderRooms = (rooms) => {
    if (!Array.isArray(rooms) || rooms.length === 0) return null;

    return (
      <div className="mt-2 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Room Distribution ({rooms.length}{" "}
          {rooms.length === 1 ? "Room" : "Rooms"})
        </p>
        {rooms.map((room, idx) => {
          const adultsCount = Number(room.adults || 0);
          const childrenCount = Number(room.kids ?? room.children ?? 0);
          const babiesCount = Number(room.babies ?? room.infants ?? 0);

          return (
            <div
              key={room.id || idx}
              className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100"
            >
              <div className="w-6 h-6 bg-[#295557] text-white rounded-md flex items-center justify-center text-[10px] font-bold">
                {idx + 1}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Tag color="blue" className="!m-0 !text-xs">
                  {adultsCount} Adult{adultsCount !== 1 ? "s" : ""}
                </Tag>
                {childrenCount > 0 && (
                  <Tag color="orange" className="!m-0 !text-xs">
                    {childrenCount} Child{childrenCount !== 1 ? "ren" : ""}
                  </Tag>
                )}
                {babiesCount > 0 && (
                  <Tag color="magenta" className="!m-0 !text-xs">
                    {babiesCount} Infant{babiesCount !== 1 ? "s" : ""}
                  </Tag>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Render cars for a day (supports array) ───────────────────────────────
  const renderDayCars = (dayData) => {
    const cars = normalizeCarsArray(dayData.car_reserved);
    if (cars.length === 0) return null;

    return (
      <div className="space-y-2">
        {cars.length > 1 && (
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Cars ({cars.length})
          </p>
        )}
        {cars.map((car, idx) => {
          const carImage = getFirstCampImage(car.image) || car.image;
          const withDriver =
            car.driver === "1" || car.driver === 1 || car.driver === true;

          return (
            <div
              key={`${car.id}-${idx}`}
              className="bg-white border border-blue-200 rounded-lg p-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={carImage}
                    alt={car.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/80?text=Car";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-sm text-gray-800 truncate mb-1">
                    {car.title}
                  </h5>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span>{formatPrice(car.price_current)} / day</span>
                    {withDriver && (
                      <Tag color="geekblue" className="!m-0 !text-[10px]">
                        With Driver
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Render activities for a day (supports array) ─────────────────────────
  const renderDayActivities = (dayData) => {
    const activities = normalizeActivitiesArray(dayData.activity_reserved);
    if (activities.length === 0) return null;

    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
          Activities ({activities.length})
        </p>
        {activities.map((act, idx) => {
          const actImage = getFirstCampImage(act.image) || act.image;
          const numAdults = parseInt(
            act.adults || act.numAdults || data.numAdults || 1
          );
          const numChildren = parseInt(
            act.children || act.numChildren || data.numChildren || 0
          );

          return (
            <div
              key={`${act.id}-${idx}`}
              className="bg-white border border-orange-200 rounded-lg p-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={actImage}
                    alt={act.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/80?text=Activity";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-sm text-gray-800 truncate mb-1">
                    {act.title}
                  </h5>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span>{formatPrice(act.price_current)}</span>
                    <Tag color="blue" className="!m-0 !text-[10px]">
                      {numAdults} Adult{numAdults !== 1 ? "s" : ""}
                    </Tag>
                    {numChildren > 0 && (
                      <Tag color="orange" className="!m-0 !text-[10px]">
                        {numChildren} Child{numChildren !== 1 ? "ren" : ""}
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Render full day details ───────────────────────────────────────────────
  const renderDayDetails = (dayData) => {
    const hasTourGuide = tourGuideInfo[dayData.day] || false;
    const rooms = dayData.hotel_reserved?.rooms || [];

    return (
      <div className="space-y-3">
        {dayData.description && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div
              className="text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: dayData.description }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {/* Hotel */}
          {dayData.hotel_reserved && (
            <div className="bg-white border border-purple-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={
                      getFirstCampImage(dayData.hotel_reserved.image) ||
                      dayData.hotel_reserved.image
                    }
                    alt={dayData.hotel_reserved.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/80?text=Hotel";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-sm text-gray-800 truncate mb-1">
                    {dayData.hotel_reserved.title}
                  </h5>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span>
                      Adult: {formatPrice(dayData.hotel_reserved.adult_price)}
                    </span>
                    {dayData.hotel_reserved.child_price && (
                      <span>
                        Child: {formatPrice(dayData.hotel_reserved.child_price)}
                      </span>
                    )}
                    {dayData.hotel_reserved.per_room && (
                      <Tag color="purple" className="!m-0 !text-[10px]">
                        Max {dayData.hotel_reserved.per_room}/room
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
              {renderRooms(rooms)}
            </div>
          )}

          {/* Cars — supports array ✅ */}
          {renderDayCars(dayData)}

          {/* Activities — supports array ✅ */}
          {renderDayActivities(dayData)}

          {/* Tour Guide */}
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
    <>
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-[#295557]" />
            <span className="text-lg font-semibold">Tour Booking Details</span>
          </div>
        }
        open={open}
        onCancel={handleMainClose}
        width={800}
        className="tour-details-modal"
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
          {/* Header Image */}
          <div className="relative h-48 rounded-lg overflow-hidden">
            <img
              src={
                getFirstCampImage(data.backgroundImage || data.image) ||
                data.backgroundImage ||
                data.image
              }
              alt={data.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x200?text=Tour+Image";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-xl font-bold mb-1 !text-white">
                {data.title}
              </h3>
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

          {/* Booking Info */}
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2 }}
            size="small"
            labelStyle={{ fontWeight: 600, background: "#f9fafb" }}
          >
            <Descriptions.Item label="Booking ID" span={2}>
              <span className="font-mono text-[#295557]">
                #{data.reservation_id || data.id}
              </span>
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
                <DollarOutlined />
                {formatPrice(data.price, data.priceCurrency)}
              </Space>
            </Descriptions.Item>
          </Descriptions>

          {/* Progress */}
          {(data.status === "started" || data.status === "in_progress") && (
            <div className="bg-emerald-50 border border-[#295557] rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[#295557]">
                  Trip Progress
                </span>
                <span className="text-sm font-bold text-[#295557]">
                  {data.progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#295557] transition-all duration-300"
                  style={{ width: `${data.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cancelled notice */}
          {isCancelledByUser && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 mb-0">
                <CloseCircleOutlined className="mr-2" />
                This reservation has been cancelled.
              </p>
            </div>
          )}

          {/* Itinerary */}
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
                {data.itinerary.map((dayData, index) => {
                  const dayCars = normalizeCarsArray(dayData.car_reserved);
                  const dayActivities = normalizeActivitiesArray(
                    dayData.activity_reserved
                  );

                  return (
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

                          {/* Day summary pills */}
                          <div className="hidden sm:flex items-center gap-1.5">
                            {dayData.hotel_reserved && (
                              <Tag
                                color="purple"
                                className="!m-0 !text-[10px] !px-1.5"
                              >
                                Hotel
                              </Tag>
                            )}
                            {dayCars.length > 0 && (
                              <Tag
                                color="blue"
                                className="!m-0 !text-[10px] !px-1.5"
                              >
                                {dayCars.length > 1
                                  ? `${dayCars.length} Cars`
                                  : "Car"}
                              </Tag>
                            )}
                            {dayActivities.length > 0 && (
                              <Tag
                                color="orange"
                                className="!m-0 !text-[10px] !px-1.5"
                              >
                                {dayActivities.length} Act
                              </Tag>
                            )}
                            {tourGuideInfo[dayData.day] && (
                              <Tag
                                color="cyan"
                                className="!m-0 !text-[10px] !px-1.5"
                              >
                                <TeamOutlined /> Guide
                              </Tag>
                            )}
                          </div>
                        </div>
                      }
                      key={index.toString()}
                      className="mb-2"
                    >
                      {renderDayDetails(dayData)}
                    </Panel>
                  );
                })}
              </Collapse>
            </>
          )}
        </div>
      </Modal>

      {/* Cancel Confirmation Modal */}
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
            Are you sure you want to cancel this tour reservation?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-red-700 mb-1">
              {data.title}
            </p>
            <p className="text-xs text-red-600 mb-1">
              {formatDate(data.startDate)} → {formatDate(data.endDate)}
            </p>
            <p className="text-xs text-red-600 mb-1">
              {data.numAdults} Adult{data.numAdults !== 1 ? "s" : ""}
              {data.numChildren > 0 &&
                `, ${data.numChildren} Child${data.numChildren !== 1 ? "ren" : ""}`}
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

export default TourDetailsModal;
