import { Button, Collapse, Tooltip } from "antd";
import React, { useState } from "react";
import { IoStarSharp } from "react-icons/io5";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { useTranslations } from "next-intl";
import "./style.css";
import { customExpandIcon } from "../../../package/package-details/[packageId]/package-summary/_components/customExpandIcon";
import SelfDeriveModal from "./SelfDriveModal/SelfDeriveModal";
import Link from "next/link";
const DayDetails = ({
  days,
  setDays,
  lang,
  day,
  selfDriveModal,
  setSelfDriveModal,
}) => {
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
    <div className="d-flex flex-column gap-4">
      {/* {days?.map((day) => (
        <div className="summary-card" key={day.day}>
          <Collapse
            defaultActiveKey={1}
            expandIcon={customExpandIcon("12px")}
            ghost
            size="large"
          >
            <Panel
              key={day.day}
              header={
                <div className=" summary-header">
                  <div className="">
                    <h2>
                      {t("day")} {day.day}
                    </h2>
                  </div>
                  <div className="date">{day.date}</div>
                </div>
              }
              style={{ padding: "0px" }}
            >
              
            </Panel>
          </Collapse>
        </div>
      ))} */}

      <>
        {/* <div className="d-flex  justify-content-between align-items-center">
          <p className="summary-description">{day.description[lang]}</p>
        </div> */}

        <div className="d-flex flex-column gap-2">
          {day.accommodation.map((accommodation) => (
            <div className="summary-details" key={accommodation.id}>
              <Link
                href={`/package/package-details/${1}`}
                className="product-image"
              >
                <img src={accommodation.image} alt={accommodation.name} />
              </Link>

              <div className="product-info">
                <h3 className="product-title">{accommodation.name}</h3>
                <span className="product-category">
                  {accommodation.location[lang]}
                </span>
              </div>

              {/* Rating */}
              <div className="status-badge">
                {accommodation.rating}
                <IoStarSharp />
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex flex-column gap-2">
          {day.transfers.map((transfer) => (
            <div className="summary-details" key={transfer.id}>
              <div className="product-image">
                <img src={transfer.image} alt={transfer.name[lang]} />
              </div>

              <div className="product-info">
                <h3 className="product-title">{transfer.name[lang]}</h3>
                <span className="product-category">
                  {transfer.category[lang]} ({transfer?.capacity})
                  <Tooltip title={<>Car Capacity</>}>
                    <div
                      className="text-primary"
                      style={{
                        cursor: "pointer",
                        fontSize: "17px",
                      }}
                    >
                      <IoIosInformationCircleOutline />
                    </div>
                  </Tooltip>
                </span>
              </div>

              {/* Rating */}
              <div className="status-badge">
                {transfer.rating}
                <IoStarSharp />
              </div>
            </div>
          ))}
        </div>
      </>
      <Modal
        centered
        className="tour_guide_modal"
        isOpen={modal}
        toggle={toggleModal}
      >
        <ModalHeader toggle={toggleModal}>{t("Tour Guide")}</ModalHeader>
        <ModalBody>
          <div>{t("confirmation")}</div>
        </ModalBody>
        <ModalFooter>
          <button className="confirm_tour_guide" onClick={confirmToggle}>
            Confirm
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DayDetails;
