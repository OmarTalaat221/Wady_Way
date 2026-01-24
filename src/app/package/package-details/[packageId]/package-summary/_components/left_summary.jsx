import { Collapse, Tooltip, message } from "antd";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { customExpandIcon } from "./customExpandIcon";
import { IoStarSharp } from "react-icons/io5";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { useTranslations } from "next-intl";
import { toggleTourGuide } from "@/lib/redux/slices/tourReservationSlice";

const LeftSummary = ({ days, setDays, lang }) => {
  const t = useTranslations("packageSummary");
  const dispatch = useDispatch();

  // Get tour guide state from Redux
  const selectedByDay = useSelector(
    (state) => state.tourReservation.selectedByDay
  );

  const [modal, setModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // 'enable' or 'disable'

  const toggleModal = () => setModal(!modal);

  // Get tour guide value for a specific day from Redux
  const getTourGuideForDay = (dayNumber) => {
    const dayKey = String(dayNumber);
    return selectedByDay[dayKey]?.tour_guide !== false;
  };

  // Handle checkbox change - show confirmation for both enable and disable
  const handleCheckboxChange = (dayNumber) => {
    const isTourGuideActive = getTourGuideForDay(dayNumber);

    setSelectedDay(dayNumber);
    setPendingAction(isTourGuideActive ? "disable" : "enable");
    setModal(true);
  };

  // Confirm toggle - just update Redux locally
  const confirmToggle = () => {
    if (!selectedDay) return;

    // Update Redux state locally
    dispatch(toggleTourGuide(selectedDay));

    // Show success message
    message.success(
      pendingAction === "enable"
        ? t("tour_guide_enabled") || "Tour guide enabled for this day"
        : t("tour_guide_disabled") || "Tour guide removed for this day"
    );

    // Close modal and reset
    setModal(false);
    setSelectedDay(null);
    setPendingAction(null);
  };

  const { Panel } = Collapse;

  return (
    <div className="flex flex-col gap-4">
      {days?.map((day) => (
        <div
          className="bg-white rounded-lg shadow-md overflow-hidden"
          key={day.day}
        >
          <Collapse
            defaultActiveKey={1}
            expandIcon={customExpandIcon("12px")}
            ghost
            size="large"
          >
            <Panel
              key={day.day}
              header={
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">
                      {t("day")} {day.day}
                    </h2>
                  </div>
                  <div className="text-gray-500">{day.date}</div>
                </div>
              }
              style={{ padding: "0px" }}
            >
              <div className="px-4 pb-4">
                {/* Accommodation Section */}
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {t("accommodation")}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {day.accommodation.map((accommodation) => (
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
                            {accommodation.name}
                          </h3>
                          <span className="text-sm text-gray-600">
                            {accommodation.location[lang]}
                          </span>
                        </div>

                        <div className="flex items-center bg-[#295557] text-white px-2 py-1 rounded">
                          {accommodation.rating}
                          <IoStarSharp className="mx-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transportation Section */}
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {t("transportation")}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {day.transfers.map((transfer) => (
                      <div
                        className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg"
                        key={transfer.id}
                      >
                        <div className="w-32 h-28 !rounded-md overflow-hidden">
                          <img
                            src={transfer.image}
                            alt={transfer.name[lang]}
                            className="w-full h-full !rounded-md object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {transfer.name[lang]}
                          </h3>
                          <span className="text-sm text-gray-600 flex items-center">
                            {transfer.category[lang]} ({transfer?.capacity})
                            <Tooltip title={t("car_capacity_tooltip")}>
                              <div className="text-blue-500 cursor-pointer mx-1">
                                <IoIosInformationCircleOutline size={17} />
                              </div>
                            </Tooltip>
                          </span>
                        </div>

                        <div className="flex items-center bg-[#295557] text-white px-2 py-1 rounded">
                          {transfer.rating}
                          <IoStarSharp className="mx-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tour Guide Toggle */}
                <div className="flex justify-between items-center w-full border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <svg
                        className={`w-5 h-5 ${getTourGuideForDay(day.day) ? "text-[#295557]" : "text-gray-400"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium text-gray-700">
                        {t("needing_guide")}
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        onChange={() => handleCheckboxChange(day.day)}
                        checked={getTourGuideForDay(day.day)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#295557]"></div>
                    </label>
                  </div>

                  {/* Status indicator */}
                  <div
                    className={`text-sm ${getTourGuideForDay(day.day) ? "text-green-600" : "text-gray-500"}`}
                  >
                    {getTourGuideForDay(day.day)
                      ? t("guide_active") || "Guide Active"
                      : t("guide_inactive") || "No Guide"}
                  </div>
                </div>
              </div>
            </Panel>
          </Collapse>
        </div>
      ))}

      {/* Confirmation Modal */}
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
            <svg
              className={`w-5 h-5 ${pendingAction === "enable" ? "text-green-600" : "text-orange-500"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            {t("tour_guide") || "Tour Guide"} - {t("day")} {selectedDay}
          </div>
        </ModalHeader>

        <ModalBody className="p-4">
          <div className="text-center py-4">
            {/* Message */}
            <p className="text-lg font-medium text-gray-800 mb-2">
              {pendingAction === "enable"
                ? t("confirm_enable_guide") || "Enable Tour Guide?"
                : t("confirm_disable_guide") || "Remove Tour Guide?"}
            </p>

            <p className="text-gray-600">
              {pendingAction === "enable"
                ? t("enable_guide_message") ||
                  `Are you sure you want to add a tour guide for Day ${selectedDay}?`
                : t("disable_guide_message") ||
                  `Are you sure you want to remove the tour guide for Day ${selectedDay}?`}
            </p>

            {/* Info Box */}
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                pendingAction === "enable"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-orange-50 text-orange-700 border border-orange-200"
              }`}
            >
              {pendingAction === "enable"
                ? t("guide_benefit") ||
                  "A professional guide will accompany you throughout the day."
                : t("no_guide_info") ||
                  "You will explore this day on your own without a guide."}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-between border-t border-gray-200 bg-gray-50">
          <button
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            onClick={toggleModal}
          >
            {t("cancel") || "Cancel"}
          </button>

          <button
            className={`px-5 py-2 text-white rounded-lg transition font-medium flex items-center gap-2 ${
              pendingAction === "enable"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-[#295557] hover:bg-[#1e3e3a]"
            }`}
            onClick={confirmToggle}
          >
            {t("confirm") || "Confirm"}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default LeftSummary;
