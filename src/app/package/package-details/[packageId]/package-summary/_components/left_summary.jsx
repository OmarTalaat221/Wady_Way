import { Collapse, Tooltip } from "antd";
import React, { useState } from "react";
import { customExpandIcon } from "./customExpandIcon";
import { IoCloseOutline, IoStarSharp } from "react-icons/io5";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { useTranslations } from "next-intl";

const LeftSummary = ({ days, setDays, lang }) => {
  const t = useTranslations("packageSummary");

  const [modal, setModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const toggleModal = () => setModal(!modal);

  const handleCheckboxChange = (dayNumber) => {
    const day = days.find((d) => d.day === dayNumber);

    if (day.tour_gide) {
      setSelectedDay(dayNumber);
      toggleModal();
    } else {
      setDays((prevDays) =>
        prevDays.map((day) =>
          day.day === dayNumber ? { ...day, tour_gide: !day.tour_gide } : day
        )
      );
    }
  };

  const confirmToggle = () => {
    setDays((prevDays) =>
      prevDays.map((day) =>
        day.day === selectedDay ? { ...day, tour_gide: false } : day
      )
    );
    toggleModal();
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
                  <div>
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
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-700">{day.description[lang]}</p>
                </div>

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

                <div className="flex justify-between items-center w-full border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="font-medium text-gray-700">
                      {t("needing_guide")}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        onChange={() => handleCheckboxChange(day.day)}
                        checked={day.tour_gide}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#295557]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </Panel>
          </Collapse>
        </div>
      ))}

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
          {t("Tour Guide")}
        </ModalHeader>
        <ModalBody className="p-4">
          <div className="text-center py-2">{t("confirmation")}</div>
        </ModalBody>
        <ModalFooter className="flex justify-between border-t border-gray-200">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            onClick={toggleModal}
          >
            {t("cancel")}
          </button>
          <button
            className="px-4 py-2 !bg-[#295557] text-white rounded hover:bg-[#1e3e3a] transition"
            onClick={confirmToggle}
          >
            {t("Confirm")}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default LeftSummary;
