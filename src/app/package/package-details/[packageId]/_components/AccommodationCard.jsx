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
  assignedCounts,
  perRoomMax,
}) => {
  const locale = useLocale();
  const t = useTranslations("packageDetails");

  if (!item) return null;

  const priceDifference = calculatePriceDifference(
    activeAccommodations[index]?.price_per_night,
    item?.price_per_night
  );

  const totalAdults = people.adults;
  const totalChildren = people.children;
  const totalInfants = people.infants || 0;
  const totalTravelers = totalAdults + totalChildren;

  const isSelected = activeAccommodations[index]?.id === item.id;
  const canFlip = isSelected && (totalTravelers >= 3 || totalInfants > 0);

  const amenities = item.amenities || item.originalData?.amenities || [];

  // ✅ per_room from this specific hotel
  const thisPerRoom =
    parseInt(item.originalData?.per_room || item.per_room) || perRoomMax || 6;

  return (
    <div
      key={item.id}
      className={`card ${isSelected ? "selected" : ""} ${
        isFlipped && selectedAccommodation?.id === item.id ? "flipped" : ""
      }`}
      onClick={() => {
        if (isFlipped && selectedAccommodation?.id === item.id) return;
        handleAccommodationClick(item, index);
      }}
    >
      <div className="card-inner">
        {/* Front */}
        <div className="card-front">
          {canFlip && (
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
            src={item.image || "https://via.placeholder.com/300x200"}
            alt={item.name?.[locale] || item.name?.en || "Accommodation"}
            className="card-image"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x200";
            }}
          />

          <div className="card-content">
            <h3 className="text-[20px] mb-2">
              {item.name?.[locale] || item.name?.en || "Accommodation"}
            </h3>

            <div className="gap-3 mb-3 transfer_feat_cont">
              {amenities.length > 0 ? (
                amenities.slice(0, 4).map((amenity, idx) => (
                  <div
                    key={amenity.amenity_id || idx}
                    className="d-flex align-items-center gap-2 transfer_in"
                  >
                    <div
                      className="amenity-icon"
                      dangerouslySetInnerHTML={{ __html: amenity.icon }}
                    />
                    <div className="d-flex flex-column transfer_cont">
                      <div className="fw-bold">{amenity.label}</div>
                      <div className="transfer_info" title={amenity.name}>
                        {amenity.name}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="d-flex align-items-center gap-2 transfer_in">
                    <FaHotel />
                    <div className="d-flex flex-column transfer_cont">
                      <div className="fw-bold">{t("category")}</div>
                      <div className="transfer_info">
                        {item.category?.[locale] ||
                          item.category?.en ||
                          "Hotel"}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 transfer_in">
                    <FaClock />
                    <div className="d-flex flex-column transfer_cont">
                      <div className="fw-bold">{t("checkIn")}</div>
                      <div className="transfer_info">
                        {item.check_in_out || "15:00 / 11:00"}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 transfer_in">
                    <FaLocationDot />
                    <div className="d-flex flex-column transfer_cont">
                      <div className="fw-bold">{t("location")}</div>
                      <div className="transfer_info">
                        {item.location?.[locale] ||
                          item.location?.en ||
                          "City center"}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 transfer_in">
                    <FaSquareParking />
                    <div className="d-flex flex-column transfer_cont">
                      <div className="fw-bold">{t("parking")}</div>
                      <div className="transfer_info">
                        {item.parking?.[locale] ||
                          item.parking?.en ||
                          t("notAvailable")}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="card-footer">
              <span className="price">
                {isSelected
                  ? t("selected")
                  : priceDifference !== 0
                    ? `${priceDifference > 0 ? "+" : ""}${priceDifference} USD`
                    : t("samePrice")}
              </span>

              <div className={`custom-radio ${isSelected ? "selected" : ""}`}>
                <div className="radio-circle"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Back - Room Selection */}
        <div className="card-back">
          <div className="room-selection-container">
            <h4>{t("selectRooms")}</h4>

            <p className="mb-2">
              {t("totalTravelers")}: {totalTravelers}
              <span
                style={{ fontSize: "11px", color: "#888", display: "block" }}
              >
                ({totalAdults} {t("adults")}
                {totalChildren > 0 ? `, ${totalChildren} ${t("children")}` : ""}
                {totalInfants > 0 ? `, ${totalInfants} ${t("infants")}` : ""})
              </span>
            </p>

            {/* ✅ per_room info */}
            <div
              style={{
                fontSize: "11px",
                color: "#295557",
                marginBottom: "8px",
                background: "#f0f7f7",
                padding: "6px 10px",
                borderRadius: "8px",
                fontWeight: "600",
              }}
            >
              Max {thisPerRoom} persons per room (adults + children)
            </div>

            {/* Status bar */}
            {/* <div
              style={{
                fontSize: "11px",
                color: "#666",
                marginBottom: "10px",
                background: "#f7f7f7",
                padding: "8px 10px",
                borderRadius: "8px",
              }}
            >
              Assigned: {assignedCounts.adults}/{totalAdults} adults,{" "}
              {assignedCounts.children}/{totalChildren} children
              {totalInfants > 0 && (
                <>, {assignedCounts.babies}/{totalInfants} infants</>
              )}
            </div> */}

            <div className="rooms-container">
              {rooms.map((room, roomIdx) => {
                // ✅ per_room occupancy (infants NOT counted)
                const roomOccupancy = room.adults + room.children;
                const isRoomFull = roomOccupancy >= thisPerRoom;

                return (
                  <div key={room.id} className="room-item">
                    <div className="room-header">
                      <h5>
                        {t("room")} {roomIdx + 1}
                        <span
                          style={{
                            fontSize: "10px",
                            color: isRoomFull ? "#dc3545" : "#888",
                            marginLeft: "8px",
                          }}
                        >
                          ({roomOccupancy}/{thisPerRoom})
                        </span>
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

                    {room.adults === 0 && room.children > 0 && (
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#dc3545",
                          background: "#fff0f0",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          margin: "0 0 8px 0",
                        }}
                      >
                        ⚠️ Children can&apos;t stay alone in a room
                      </p>
                    )}

                    {isRoomFull && (
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#856404",
                          background: "#fff3cd",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          margin: "0 0 8px 0",
                        }}
                      >
                        ⚠️ Room is full ({thisPerRoom} max)
                      </p>
                    )}

                    <div className="room-occupants">
                      {/* Adults */}
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
                            disabled={
                              assignedCounts.adults >= totalAdults || isRoomFull
                            }
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      {totalChildren > 0 && (
                        <div className="occupant-type">
                          <span>{t("children")}</span>
                          <div className="counter">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRoomChange(
                                  "decrease",
                                  room.id,
                                  "children"
                                );
                              }}
                              disabled={room.children <= 0}
                            >
                              <FaMinus />
                            </button>
                            <span>{room.children}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRoomChange(
                                  "increase",
                                  room.id,
                                  "children"
                                );
                              }}
                              disabled={
                                assignedCounts.children >= totalChildren ||
                                isRoomFull
                              }
                            >
                              <FaPlus />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ✅ Babies / Infants - NOT counted in per_room */}
                      {totalInfants > 0 && (
                        <div className="occupant-type">
                          <span>
                            {t("infants")}{" "}
                            <span
                              style={{
                                fontSize: "9px",
                                color: "#10b981",
                                fontWeight: "bold",
                              }}
                            >
                              (no seat)
                            </span>
                          </span>
                          <div className="counter">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRoomChange("decrease", room.id, "babies");
                              }}
                              disabled={room.babies <= 0}
                            >
                              <FaMinus />
                            </button>
                            <span>{room.babies}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRoomChange("increase", room.id, "babies");
                              }}
                              disabled={assignedCounts.babies >= totalInfants}
                            >
                              <FaPlus />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
