"use client";
import React from "react";
import {
  FaHotel,
  FaClock,
  FaLocationDot,
  FaSquareParking,
  FaPlus,
  FaMinus,
} from "react-icons/fa6";
import { IoLocationSharp } from "react-icons/io5";
import { useLocale, useTranslations } from "next-intl";

const AccommodationCard = ({
  item,
  index,
  activeAccommodations,

  isFlipped,

  selectedAccommodation,
  selectedTours,
  setSelectedTours,
  handleAccommodationClick,
  handleFlip,
  setMapModal,
  people,
  calculatePriceDifference,
  rooms,
  handleRoomChange,
  addRoom,
  removeRoom,
  confirmRoomSelection,
  cancelRoomSelection,
}) => {
  const priceDifference = calculatePriceDifference(
    activeAccommodations[index]?.price_per_night,
    item?.price_per_night
  );

  const locale = useLocale();
  const t = useTranslations("packageDetails");

  const totalTravelers = people.adults + people.children + people.infants;
  const shouldFlip = totalTravelers >= 3;

  return (
    <div
      key={item.id}
      className={`card ${
        activeAccommodations[index]?.id === item.id ? "selected" : ""
      } ${isFlipped && selectedAccommodation?.id === item.id ? "flipped" : ""}`}
      onClick={() => {
        if (isFlipped && selectedAccommodation?.id === item.id) return;
        handleAccommodationClick(item, index);
      }}
    >
      <div className="card-inner">
        <div className="card-front">
          {activeAccommodations[index]?.id === item.id &&
            people.adults + people.children + people.infants >= 3 && (
              <button
                className="cards-container-learnmore"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip(index);
                }}
              >
                {t("viewRooms")}
              </button>
            )}

          <div
            onClick={(e) => {
              e.stopPropagation();
              setMapModal(true);
            }}
            className="cards-container-location-icon"
          >
            <IoLocationSharp />
          </div>

          <img
            src={item.image}
            alt={item.name[locale] || item.name.en}
            className="card-image"
          />
          <div className="card-content">
            <h3 className="text-[20px] mb-2">
              {item.name[locale] || item.name.en}
            </h3>

            <div className="gap-3 mb-3 transfer_feat_cont">
              <div className="d-flex align-items-center gap-2 transfer_in">
                <FaHotel />
                <div className="d-flex flex-column transfer_cont">
                  <div className="fw-bold">{t("category")}</div>
                  <div
                    className="transfer_info"
                    title={item?.category[locale] || item?.category.en}
                  >
                    {item?.category[locale] || item?.category.en}
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 transfer_in">
                <FaClock />
                <div className="d-flex flex-column transfer_cont">
                  <div className="fw-bold">{t("checkIn")}</div>
                  <div className="transfer_info" title={item?.check_in_out}>
                    {item?.check_in_out}
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 transfer_in">
                <FaLocationDot />
                <div className="d-flex flex-column transfer_cont">
                  <div className="fw-bold">{t("location")}</div>
                  <div
                    className="transfer_info"
                    title={item?.location[locale] || item?.location.en}
                  >
                    {item.location[locale] || item.location.en}
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 transfer_in">
                <FaSquareParking />
                <div className="d-flex flex-column transfer_cont">
                  <div className="fw-bold">{t("parking")}</div>
                  <div
                    className="transfer_info"
                    title={item?.parking[locale] || item?.parking.en}
                  >
                    {item.parking[locale] ||
                      item.parking.en ||
                      t("notAvailable")}
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <span className="price">
                {activeAccommodations[index]?.id === item.id
                  ? t("selected")
                  : priceDifference !== 0
                  ? `${priceDifference > 0 ? "+" : ""}${priceDifference} USD`
                  : priceDifference == 0
                  ? t("samePrice")
                  : `+${item.price_per_night} USD`}
              </span>
              <div
                className={`custom-radio ${
                  activeAccommodations[index]?.id === item.id ? "selected" : ""
                }`}
              >
                <div className="radio-circle"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-back">
          <div className="room-selection-container">
            <h4>{t("selectRooms")}</h4>
            <p className="mb-3">
              {t("totalTravelers")}: {totalTravelers}
            </p>

            <div className="rooms-container">
              {rooms.map((room) => (
                <div key={room.id} className="room-item">
                  <div className="room-header">
                    <h5>
                      {t("room")} {room.id}
                    </h5>
                    {rooms.length > 1 && (
                      <button
                        className="remove-room-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRoom(room.id);
                        }}
                      >
                        &times;
                      </button>
                    )}
                  </div>

                  <div className="room-occupants">
                    <div className="occupant-type">
                      <span>{t("adults")}</span>
                      <div className="counter">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoomChange("decrease", room.id, "adults");
                          }}
                          disabled={room.adults <= 1}
                        >
                          <FaMinus />
                        </button>
                        <span>{room.adults}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoomChange("increase", room.id, "adults");
                          }}
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>

                    {people.children > 0 && (
                      <div className="occupant-type">
                        <span>{t("children")}</span>
                        <div className="counter">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRoomChange("decrease", room.id, "children");
                            }}
                            disabled={room.children <= 0}
                          >
                            <FaMinus />
                          </button>
                          <span>{room.children}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRoomChange("increase", room.id, "children");
                            }}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                    )}

                    {people.infants > 0 && (
                      <div className="occupant-type">
                        <span>{t("infants")}</span>
                        <div className="counter">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRoomChange("decrease", room.id, "infants");
                            }}
                            disabled={room.infants <= 0}
                          >
                            <FaMinus />
                          </button>
                          <span>{room.infants}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRoomChange("increase", room.id, "infants");
                            }}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {rooms.length < 5 && (
              <button
                className="add-room-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addRoom();
                }}
              >
                <FaPlus /> {t("addRoom")}
              </button>
            )}

            <div className="room-actions">
              <button
                className="cancel-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  cancelRoomSelection();
                }}
              >
                {t("cancel")}
              </button>
              <button
                className="confirm-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmRoomSelection();
                }}
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationCard;
