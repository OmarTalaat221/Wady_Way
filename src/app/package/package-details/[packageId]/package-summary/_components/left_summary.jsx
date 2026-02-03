import { Collapse, Tooltip, message } from "antd";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { customExpandIcon } from "./customExpandIcon";
import { IoStarSharp } from "react-icons/io5";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { FaUserTie } from "react-icons/fa";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { useTranslations } from "next-intl";
import { toggleTourGuide } from "@/lib/redux/slices/tourReservationSlice";

const LeftSummary = ({ days, setDays, lang }) => {
  const t = useTranslations("packageSummary");
  const dispatch = useDispatch();

  // ✅ جلب tourGuideByDay كاملة
  const tourGuideByDay = useSelector(
    (state) => state.tourReservation.tourGuideByDay
  );

  const [modal, setModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const toggleModal = () => setModal(!modal);

  const handleCheckboxChange = (dayNumber) => {
    const tourGuide = tourGuideByDay[dayNumber];

    if (!tourGuide?.isAvailable) {
      return;
    }

    setSelectedDay(dayNumber);
    setPendingAction(tourGuide.isSelected ? "disable" : "enable");
    setModal(true);
  };

  const confirmToggle = () => {
    if (!selectedDay) return;

    dispatch(toggleTourGuide(selectedDay));

    message.success(
      pendingAction === "enable"
        ? "Tour guide enabled for this day"
        : "Tour guide removed for this day"
    );

    setModal(false);
    setSelectedDay(null);
    setPendingAction(null);
  };

  const { Panel } = Collapse;

  return (
    <div className="flex flex-col gap-4">
      {days?.map((day) => {
        const dayNumber = day.day;
        const tourGuide = tourGuideByDay[dayNumber] || {};
        const isAvailable = tourGuide.isAvailable || false;
        const isSelected = tourGuide.isSelected || false;

        console.log(
          `LeftSummary Day ${dayNumber}: available=${isAvailable}, selected=${isSelected}`
        );

        return (
          <div
            className="bg-white rounded-lg shadow-md overflow-hidden"
            key={dayNumber}
          >
            <Collapse
              defaultActiveKey={1}
              expandIcon={customExpandIcon("12px")}
              ghost
              size="large"
            >
              <Panel
                key={dayNumber}
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
                              : "bg-yellow-100 text-yellow-700"
                          }`}
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
                    <div className="flex flex-col gap-2">
                      {day.accommodation?.map((accommodation) => (
                        <div
                          className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg"
                          key={accommodation.id}
                        >
                          <div className="w-32 h-28 !rounded-md overflow-hidden">
                            <img
                              src={accommodation.image}
                              alt={accommodation.name}
                              className="w-full h-full !rounded-md object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {typeof accommodation.name === "object"
                                ? accommodation.name[lang] ||
                                  accommodation.name.en
                                : accommodation.name}
                            </h3>
                            <span className="text-sm text-gray-600">
                              {typeof accommodation.location === "object"
                                ? accommodation.location[lang] ||
                                  accommodation.location.en
                                : accommodation.location}
                            </span>
                          </div>
                          <div className="flex items-center bg-[#295557] text-white px-2 py-1 rounded">
                            {accommodation.rating || 4.5}
                            <IoStarSharp className="mx-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transportation */}
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      {t("transportation")}
                    </h3>
                    <div className="flex flex-col gap-2">
                      {day.transfers?.map((transfer) => (
                        <div
                          className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg"
                          key={transfer.id}
                        >
                          <div className="w-32 h-28 !rounded-md overflow-hidden">
                            <img
                              src={transfer.image}
                              alt={
                                typeof transfer.name === "object"
                                  ? transfer.name[lang]
                                  : transfer.name
                              }
                              className="w-full h-full !rounded-md object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {typeof transfer.name === "object"
                                ? transfer.name[lang] || transfer.name.en
                                : transfer.name}
                            </h3>
                            <span className="text-sm text-gray-600 flex items-center">
                              {typeof transfer.category === "object"
                                ? transfer.category[lang] ||
                                  transfer.category.en
                                : transfer.category}{" "}
                              ({transfer?.capacity})
                              <Tooltip title={t("car_capacity_tooltip")}>
                                <div className="text-blue-500 cursor-pointer mx-1">
                                  <IoIosInformationCircleOutline size={17} />
                                </div>
                              </Tooltip>
                            </span>
                          </div>
                          <div className="flex items-center bg-[#295557] text-white px-2 py-1 rounded">
                            {transfer.rating || 4.5}
                            <IoStarSharp className="mx-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ✅ Tour Guide */}
                  {isAvailable ? (
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center w-full bg-gradient-to-r from-[#295557]/10 to-transparent p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full transition-colors ${
                              isSelected
                                ? "bg-[#295557] text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
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
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#295557]/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#295557]"></div>
                          </label>
                          <span
                            className={`text-sm font-medium ${isSelected ? "text-green-600" : "text-gray-500"}`}
                          >
                            {isSelected ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      {!isSelected && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-xs text-yellow-700">
                            ⚠️ Removing the guide is at your own responsibility
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

      {/* Modal */}
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
            <FaUserTie
              className={
                pendingAction === "enable"
                  ? "text-green-600"
                  : "text-orange-500"
              }
            />
            Tour Guide - Day {selectedDay}
          </div>
        </ModalHeader>

        <ModalBody className="p-4">
          <div className="text-center py-4">
            <div
              className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                pendingAction === "enable" ? "bg-green-100" : "bg-orange-100"
              }`}
            >
              <FaUserTie
                size={32}
                className={
                  pendingAction === "enable"
                    ? "text-green-600"
                    : "text-orange-500"
                }
              />
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

            {pendingAction === "disable" && (
              <div className="mt-4 p-3 rounded-lg text-sm bg-orange-50 text-orange-700 border border-orange-200">
                ⚠️ Removing the tour guide is at your own responsibility.
              </div>
            )}

            {pendingAction === "enable" && (
              <div className="mt-4 p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
                ✓ A professional guide will accompany you throughout the day.
              </div>
            )}
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
            className={`px-5 py-2 text-white rounded-lg transition font-medium flex items-center gap-2 ${
              pendingAction === "enable"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
            onClick={confirmToggle}
          >
            <FaUserTie size={14} />
            Confirm
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default LeftSummary;
