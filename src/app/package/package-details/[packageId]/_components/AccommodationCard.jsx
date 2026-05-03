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

const selectedGlowStyle = `
  @keyframes ww-selected-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(41, 85, 87, 0.4), 0 0 20px rgba(41, 85, 87, 0.15); }
    50% { box-shadow: 0 0 0 6px rgba(41, 85, 87, 0.0), 0 0 30px rgba(41, 85, 87, 0.3); }
  }
  .ww-accommodation-card--selected {
    border: 2px solid #295557 !important;
    animation: ww-selected-pulse 2s ease-in-out infinite;
    position: relative;
  }
  .ww-accommodation-card--selected::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(41,85,87,0.08) 0%, rgba(232,163,85,0.05) 100%);
    pointer-events: none;
    z-index: 0;
  }
  .ww-rooms-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #f0fdf4;
    color: #16a34a;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid #bbf7d0;
    margin-top: 4px;
  }
`;

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
  maxRooms,
  hasRoomsConfigured,
  savedRoomsCount,
}) => {
  const locale = useLocale();
  const t = useTranslations("packageDetails");

  if (!item) return null;

  const priceDifference = calculatePriceDifference(
    activeAccommodations[index]?.price_per_night,
    item?.price_per_night
  );

  const totalAdults = Number(people?.adults || 1);
  const totalChildren = Number(people?.children || 0);
  const totalInfants = Number(people?.infants || 0);
  const totalTravelers = totalAdults + totalChildren;

  const isSelected = activeAccommodations[index]?.id === item.id;

  const amenities = item.amenities || item.originalData?.amenities || [];
  const thisPerRoom =
    parseInt(item.originalData?.per_room || item.per_room) || perRoomMax || 6;
  const effectiveMaxRooms = maxRooms ?? Math.max(totalAdults, 1);

  const hasStaleChildrenInRooms = Array.isArray(rooms)
    ? rooms.some((room) => Number(room?.children || 0) > 0)
    : false;
  const hasStaleInfantsInRooms = Array.isArray(rooms)
    ? rooms.some((room) => Number(room?.babies || 0) > 0)
    : false;
  const shouldShowChildrenControls =
    totalChildren > 0 || hasStaleChildrenInRooms;
  const shouldShowInfantsControls = totalInfants > 0 || hasStaleInfantsInRooms;

  const showRoomsBadge =
    isSelected && hasRoomsConfigured && savedRoomsCount > 0;

  // ✅ Handle card click
  const onCardClick = () => {
    if (isSelected) {
      // ✅ لو الكارت ده already selected و totalTravelers > 2 → flip
      if (totalTravelers > 2) {
        handleFlip();
      }
      // لو ≤ 2 → مش محتاج يعمل حاجة (الكارت مختار أصلاً)
      return;
    }

    // ✅ لو كارت مختلف → بنادي handleAccommodationClick
    handleAccommodationClick(item);
  };

  return (
    <>
      <style>{selectedGlowStyle}</style>

      <div
        key={item.id}
        className={`card ${isSelected ? "selected ww-accommodation-card--selected" : ""} ${
          isFlipped && selectedAccommodation?.id === item.id ? "flipped" : ""
        }`}
        onClick={onCardClick}
      >
        <div className="card-inner">
          {/* Front */}
          <div className="card-front">
            {isSelected && totalTravelers > 2 && (
              <button
                className="cards-container-learnmore"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip();
                }}
              >
                {showRoomsBadge
                  ? `✓ ${savedRoomsCount} Room${savedRoomsCount > 1 ? "s" : ""} Set`
                  : t("viewRooms")}
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
                  {totalChildren > 0
                    ? `, ${totalChildren} ${t("children")}`
                    : ""}
                  {totalInfants > 0 ? `, ${totalInfants} ${t("infants")}` : ""})
                </span>
              </p>

              <div className="rooms-container">
                {rooms.map((room, roomIdx) => {
                  const roomOccupancy =
                    Number(room.adults || 0) + Number(room.children || 0);
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
                                assignedCounts.adults >= totalAdults ||
                                isRoomFull
                              }
                            >
                              <FaPlus />
                            </button>
                          </div>
                        </div>

                        {/* Children */}
                        {shouldShowChildrenControls && (
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
                                  totalChildren <= 0 ||
                                  assignedCounts.children >= totalChildren ||
                                  isRoomFull
                                }
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

              {rooms.length < effectiveMaxRooms && (
                <button
                  className="add-room-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    addRoom();
                  }}
                >
                  <FaPlus /> {t("addRoom")} ({rooms.length}/{effectiveMaxRooms})
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
    </>
  );
};

export default AccommodationCard;
