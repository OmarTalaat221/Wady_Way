import { Collapse, Tooltip } from "antd";
import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { customExpandIcon } from "./customExpandIcon";
import { IoStarSharp } from "react-icons/io5";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { FaUserTie, FaBed, FaCarSide, FaUsers } from "react-icons/fa";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { useTranslations } from "next-intl";
import {
  toggleTourGuide,
  calculateTotal,
} from "@/lib/redux/slices/tourReservationSlice";
import toast from "react-hot-toast";

const BRAND = "#295557";

const LeftSummary = ({ days, lang }) => {
  const t = useTranslations("packageSummary");
  const dispatch = useDispatch();

  const tourGuideByDay = useSelector(
    (state) => state.tourReservation.tourGuideByDay || {}
  );

  const selectedByDay = useSelector(
    (state) => state.tourReservation.selectedByDay || {}
  );

  const [modal, setModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const [roomsModal, setRoomsModal] = useState(false);
  const [roomsModalData, setRoomsModalData] = useState(null);

  const toggleModal = () => setModal((prev) => !prev);
  const toggleRoomsModal = () => setRoomsModal((prev) => !prev);

  const getLocalizedValue = (value) => {
    if (!value) return "-";
    if (typeof value === "object") return value[lang] || value.en || "-";
    return value;
  };

  const getSelectedHotelForDay = (day) => {
    const dayKey = String(day.day);
    const daySelection = selectedByDay?.[dayKey] || {};
    const selectedHotelId = parseInt(
      daySelection?.hotel?.id || daySelection?.hotel?.hotel_id || 0
    );

    if (!selectedHotelId) return null;

    return (
      day.accommodation?.find(
        (hotelItem) => hotelItem.id === selectedHotelId
      ) ||
      daySelection?.hotel ||
      null
    );
  };

  const getSelectedCarsForDay = (day) => {
    const dayKey = String(day.day);
    const daySelection = selectedByDay?.[dayKey] || {};

    const savedCars = Array.isArray(daySelection?.cars)
      ? daySelection.cars
      : daySelection?.car
        ? [daySelection.car]
        : [];

    if (!savedCars.length) return [];

    return savedCars.map((savedCar, index) => {
      const savedCarId = parseInt(savedCar?.id || savedCar?.car_id || 0);

      const matchedTransfer =
        day.transfers?.find((transferItem) => transferItem.id === savedCarId) ||
        null;

      return {
        ...(matchedTransfer || {}),
        ...(savedCar || {}),
        id: savedCar?.instanceId || `${day.day}-${savedCarId}-${index}`,
        originalId: savedCarId,
        withDriver: !!savedCar?.withDriver,
        image:
          matchedTransfer?.image ||
          savedCar?.image ||
          "https://via.placeholder.com/300x200",
        name: matchedTransfer?.name || savedCar?.name || savedCar?.title,
        category: matchedTransfer?.category ||
          savedCar?.category || { en: "Car", ar: "سيارة" },
        capacity:
          parseInt(
            matchedTransfer?.capacity ||
              savedCar?.capacity ||
              savedCar?.max_people ||
              4
          ) || 4,
        price:
          parseFloat(
            matchedTransfer?.price ||
              matchedTransfer?.price_current ||
              savedCar?.price ||
              savedCar?.price_current ||
              0
          ) || 0,
      };
    });
  };

  const getSelectedRoomsForDay = (dayNumber) => {
    const dayKey = String(dayNumber);
    return Array.isArray(selectedByDay?.[dayKey]?.rooms)
      ? selectedByDay[dayKey].rooms
      : [];
  };

  const handleCheckboxChange = (dayNumber) => {
    const tourGuide = tourGuideByDay?.[String(dayNumber)];

    if (!tourGuide?.isAvailable) return;

    setSelectedDay(dayNumber);
    setPendingAction(tourGuide.isSelected ? "disable" : "enable");
    setModal(true);
  };

  const confirmToggle = () => {
    if (!selectedDay) return;

    dispatch(toggleTourGuide(selectedDay));
    dispatch(calculateTotal());

    toast.success(
      pendingAction === "enable"
        ? "Tour guide enabled for this day"
        : "Tour guide removed for this day"
    );

    setModal(false);
    setSelectedDay(null);
    setPendingAction(null);
  };

  const openRoomsModal = (day, selectedHotel, rooms) => {
    const totalAdults = rooms.reduce(
      (sum, room) => sum + Number(room.adults || 0),
      0
    );
    const totalKids = rooms.reduce(
      (sum, room) => sum + Number(room.kids ?? room.children ?? 0),
      0
    );
    const totalBabies = rooms.reduce(
      (sum, room) => sum + Number(room.babies ?? room.infants ?? 0),
      0
    );

    setRoomsModalData({
      dayNumber: day.day,
      date: day.date,
      hotel: selectedHotel,
      rooms,
      totals: {
        adults: totalAdults,
        kids: totalKids,
        babies: totalBabies,
      },
    });

    setRoomsModal(true);
  };

  const preparedDays = useMemo(() => {
    return (days || []).map((day) => {
      const selectedHotel = getSelectedHotelForDay(day);
      const selectedCars = getSelectedCarsForDay(day);
      const selectedRooms = getSelectedRoomsForDay(day.day);

      return {
        ...day,
        selectedHotel,
        selectedCars,
        selectedRooms,
      };
    });
  }, [days, selectedByDay, lang]);

  const { Panel } = Collapse;

  return (
    <div className="flex flex-col gap-4">
      {preparedDays?.map((day) => {
        const dayNumber = day.day;
        const tourGuide = tourGuideByDay?.[String(dayNumber)] || {};
        const isAvailable = !!tourGuide.isAvailable;
        const isSelected = !!tourGuide.isSelected;

        const selectedHotel = day.selectedHotel;
        const selectedCars = day.selectedCars || [];
        const selectedRooms = day.selectedRooms || [];

        return (
          <div
            className="bg-white rounded-lg shadow-md overflow-hidden"
            key={dayNumber}
          >
            <Collapse
              defaultActiveKey={["1"]}
              expandIcon={customExpandIcon("12px")}
              ghost
              size="large"
            >
              <Panel
                key="1"
                header={
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold">
                        {t("day")} {dayNumber}
                      </h2>

                      {isAvailable && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                            isSelected
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100"
                          }`}
                          style={!isSelected ? { color: BRAND } : {}}
                        >
                          <FaUserTie size={10} />
                          {isSelected ? "Guide ✓" : "No Guide"}
                        </span>
                      )}
                    </div>

                    <div className="text-gray-500">{day.date}</div>
                  </div>
                }
                style={{ padding: "0px" }}
              >
                <div className="px-4 pb-4">
                  {/* Accommodation */}
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      {t("accommodation")}
                    </h3>

                    {selectedHotel ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                          <div className="w-32 h-28 !rounded-md overflow-hidden">
                            <img
                              src={selectedHotel.image}
                              alt={getLocalizedValue(selectedHotel.name)}
                              className="w-full h-full !rounded-md object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/300x200";
                              }}
                            />
                          </div>

                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {getLocalizedValue(selectedHotel.name)}
                            </h3>

                            <span className="text-sm text-gray-600 block">
                              {getLocalizedValue(selectedHotel.location)}
                            </span>

                            {selectedRooms.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span
                                  className="text-[11px] px-2 py-1 rounded-full"
                                  style={{
                                    background: `${BRAND}14`,
                                    color: BRAND,
                                  }}
                                >
                                  {selectedRooms.length} room
                                  {selectedRooms.length > 1 ? "s" : ""}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openRoomsModal(
                                      day,
                                      selectedHotel,
                                      selectedRooms
                                    )
                                  }
                                  className="text-[11px] px-3 py-1 rounded-full text-white transition"
                                  style={{ background: BRAND }}
                                >
                                  View Rooms
                                </button>
                              </div>
                            )}
                          </div>

                          <div
                            className="flex items-center text-white px-2 py-1 rounded"
                            style={{ background: BRAND }}
                          >
                            {selectedHotel.rating || 4.5}
                            <IoStarSharp className="mx-1" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-500">
                        No hotel selected
                      </div>
                    )}
                  </div>

                  {/* Transportation */}
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      {t("transportation")}
                    </h3>

                    {selectedCars.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {selectedCars.map((transfer, idx) => (
                          <div
                            className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg"
                            key={transfer.id || `${transfer.originalId}-${idx}`}
                          >
                            <div className="w-32 h-28 !rounded-md overflow-hidden">
                              <img
                                src={transfer.image}
                                alt={getLocalizedValue(transfer.name)}
                                className="w-full h-full !rounded-md object-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/300x200";
                                }}
                              />
                            </div>

                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">
                                {getLocalizedValue(transfer.name)}
                              </h3>

                              <span className="text-sm text-gray-600 flex items-center flex-wrap gap-1">
                                <span>
                                  {getLocalizedValue(transfer.category)} (
                                  {transfer?.capacity})
                                </span>

                                <Tooltip title={t("car_capacity_tooltip")}>
                                  <div className="text-blue-500 cursor-pointer mx-1">
                                    <IoIosInformationCircleOutline size={17} />
                                  </div>
                                </Tooltip>
                              </span>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {transfer.withDriver && (
                                  <span className="text-[11px] px-2 py-1 rounded-full bg-green-100 text-green-700">
                                    With Driver
                                  </span>
                                )}
                              </div>
                            </div>

                            <div
                              className="flex items-center text-white px-2 py-1 rounded"
                              style={{ background: BRAND }}
                            >
                              {transfer.rating || 4.5}
                              <IoStarSharp className="mx-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-500">
                        No transfer selected
                      </div>
                    )}
                  </div>

                  {/* Tour Guide */}
                  {isAvailable ? (
                    <div className="border-t border-gray-200 pt-3">
                      <div
                        className="flex justify-between items-center w-full p-4 rounded-lg"
                        style={{
                          background: `linear-gradient(to right, ${BRAND}15, transparent)`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-full transition-colors"
                            style={{
                              background: isSelected ? BRAND : "#e5e7eb",
                              color: isSelected ? "#fff" : "#6b7280",
                            }}
                          >
                            <FaUserTie size={18} />
                          </div>

                          <div>
                            <span className="font-medium text-gray-700 block">
                              Tour Guide
                            </span>
                            <span className="text-xs text-gray-500">
                              {isSelected
                                ? "Guide will accompany you"
                                : "Click to add a guide"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              onChange={() => handleCheckboxChange(dayNumber)}
                              checked={isSelected}
                            />
                            <div
                              className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer rtl:peer-checked:after:-translate-x-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all"
                              style={{
                                background: isSelected ? BRAND : "#e5e7eb",
                                boxShadow: `0 0 0 2px ${BRAND}20`,
                              }}
                            ></div>
                          </label>

                          <span
                            className="text-sm font-medium"
                            style={{ color: isSelected ? BRAND : "#6b7280" }}
                          >
                            {isSelected ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      {!isSelected && (
                        <div
                          className="mt-2 p-2 rounded-md"
                          style={{
                            background: `${BRAND}10`,
                            border: `1px solid ${BRAND}30`,
                          }}
                        >
                          <p className="text-xs mb-0" style={{ color: BRAND }}>
                            Removing the guide is at your own responsibility
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex items-center gap-3 bg-gray-100 p-4 rounded-lg opacity-60">
                        <div className="p-2 rounded-full bg-gray-300 text-gray-500">
                          <FaUserTie size={18} />
                        </div>
                        <div>
                          <span className="font-medium text-gray-500 block">
                            Tour Guide
                          </span>
                          <span className="text-xs text-gray-400">
                            Not available for this day
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Panel>
            </Collapse>
          </div>
        );
      })}

      {/* Tour Guide Modal */}
      <Modal
        centered
        className="rounded-lg overflow-hidden"
        isOpen={modal}
        toggle={toggleModal}
      >
        <ModalHeader
          toggle={toggleModal}
          className="bg-gray-50 border-b border-gray-200"
        >
          <div className="flex items-center gap-2">
            <FaUserTie style={{ color: BRAND }} />
            Tour Guide - Day {selectedDay}
          </div>
        </ModalHeader>

        <ModalBody className="p-4">
          <div className="text-center py-4">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: `${BRAND}15` }}
            >
              <FaUserTie size={32} style={{ color: BRAND }} />
            </div>

            <p className="text-lg font-medium text-gray-800 mb-2">
              {pendingAction === "enable"
                ? "Enable Tour Guide?"
                : "Remove Tour Guide?"}
            </p>

            <p className="text-gray-600">
              {pendingAction === "enable"
                ? `Add a professional tour guide for Day ${selectedDay}?`
                : `Remove the tour guide for Day ${selectedDay}?`}
            </p>

            <div
              className="mt-4 p-3 rounded-lg text-sm"
              style={{
                background: `${BRAND}10`,
                color: BRAND,
                border: `1px solid ${BRAND}30`,
              }}
            >
              {pendingAction === "enable"
                ? "A professional guide will accompany you throughout the day."
                : "Removing the tour guide is at your own responsibility."}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-between border-t border-gray-200 bg-gray-50">
          <button
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            onClick={toggleModal}
          >
            Cancel
          </button>

          <button
            className="px-5 py-2 text-white rounded-lg transition font-medium flex items-center gap-2"
            style={{ background: BRAND }}
            onClick={confirmToggle}
          >
            <FaUserTie size={14} />
            Confirm
          </button>
        </ModalFooter>
      </Modal>

      {/* Rooms Modal */}
      <Modal
        centered
        className="rounded-lg overflow-hidden"
        isOpen={roomsModal}
        toggle={toggleRoomsModal}
      >
        <ModalHeader
          toggle={toggleRoomsModal}
          className="bg-gray-50 border-b border-gray-200"
        >
          <div className="flex items-center gap-2">
            <FaBed style={{ color: BRAND }} />
            Rooms Details - Day {roomsModalData?.dayNumber}
          </div>
        </ModalHeader>

        <ModalBody className="p-4">
          {roomsModalData && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <img
                  src={
                    roomsModalData?.hotel?.image ||
                    "https://via.placeholder.com/120x90"
                  }
                  alt={getLocalizedValue(roomsModalData?.hotel?.name)}
                  className="w-24 h-20 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/120x90";
                  }}
                />

                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {getLocalizedValue(roomsModalData?.hotel?.name)}
                  </h4>
                  <p className="text-sm text-gray-500 mb-0">
                    {roomsModalData?.date}
                  </p>
                </div>
              </div>

              <div
                className="rounded-xl p-3"
                style={{
                  background: `${BRAND}10`,
                  border: `1px solid ${BRAND}25`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FaUsers style={{ color: BRAND }} />
                  <span className="font-semibold" style={{ color: BRAND }}>
                    Total Distribution
                  </span>
                </div>

                <div className="text-sm text-gray-700 flex flex-wrap gap-3">
                  <span>Adults: {roomsModalData.totals.adults}</span>
                  <span>Kids: {roomsModalData.totals.kids}</span>
                  <span>Babies: {roomsModalData.totals.babies}</span>
                </div>
              </div>

              <div className="space-y-3">
                {roomsModalData.rooms.map((room, index) => (
                  <div
                    key={index}
                    className="bg-white border rounded-xl p-3 shadow-sm"
                    style={{ borderColor: `${BRAND}20` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5
                        className="font-semibold mb-0"
                        style={{ color: BRAND }}
                      >
                        Room {index + 1}
                      </h5>

                      <span
                        className="text-[11px] px-2 py-1 rounded-full"
                        style={{
                          background: `${BRAND}12`,
                          color: BRAND,
                        }}
                      >
                        {Number(room.adults || 0) +
                          Number(room.kids ?? room.children ?? 0) || 0}{" "}
                        Guests
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-gray-500 text-xs mb-1">Adults</div>
                        <div className="font-semibold text-gray-800">
                          {Number(room.adults || 0)}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-gray-500 text-xs mb-1">Kids</div>
                        <div className="font-semibold text-gray-800">
                          {Number(room.kids ?? room.children ?? 0)}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-gray-500 text-xs mb-1">Babies</div>
                        <div className="font-semibold text-gray-800">
                          {Number(room.babies ?? room.infants ?? 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter className="border-t border-gray-200 bg-gray-50">
          <button
            className="px-5 py-2 text-white rounded-lg transition font-medium"
            style={{ background: BRAND }}
            onClick={toggleRoomsModal}
          >
            Close
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default LeftSummary;
