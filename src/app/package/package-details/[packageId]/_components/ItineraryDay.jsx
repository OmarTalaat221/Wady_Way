"use client";
import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectFade, Autoplay } from "swiper/modules";
import { Collapse } from "antd";
import { FaBed, FaHiking, FaUserTie } from "react-icons/fa";
import { MdEmojiTransportation } from "react-icons/md";
import AccommodationCard from "./AccommodationCard";
import TransferCard from "./TransferCard";
import ActivityCard from "./ActivityCard";
import { customExpandIcon } from "./CustomExpandIcon";
import { useLocale, useTranslations } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import { toggleTourGuide } from "@/lib/redux/slices/tourReservationSlice";

const { Panel } = Collapse;

const ItineraryDay = ({
  hotel,
  index,
  days,
  locale: propLocale,
  selectedTours,
  setSelectedTours,
  activeAccommodations,
  activeTransfers,
  isFlipped,
  selectedAccommodation,
  handleAccommodationClick,
  handleTransferClick,
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
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const t = useTranslations("packageDetails");
  const hookLocale = useLocale();
  const locale = propLocale || hookLocale;
  const dispatch = useDispatch();

  const dayNumber = index + 1;

  // ✅ جلب Tour Guide من المكان الجديد
  const tourGuideData = useSelector(
    (state) => state.tourReservation.tourGuideByDay[dayNumber]
  );

  const isAvailable = tourGuideData?.isAvailable || false;
  const isSelected = tourGuideData?.isSelected || false;

  // ✅ Debug log
  console.log(
    `Day ${dayNumber}: isAvailable=${isAvailable}, isSelected=${isSelected}`
  );

  if (!hotel) {
    return null;
  }

  const handleTourGuideToggle = () => {
    dispatch(toggleTourGuide(dayNumber));
  };

  const selectedHotelData =
    activeAccommodations?.[index] ||
    hotel.accommodation?.find(
      (h) =>
        h.id === selectedTours?.hotels?.find((sh) => sh.day === dayNumber)?.id
    );

  const selectedTransferData =
    activeTransfers?.[index] ||
    hotel.transfers?.find(
      (t) =>
        t.id ===
        selectedTours?.transfers?.find((st) => st.day === dayNumber)?.id
    );

  let swiperImages = [];
  if (selectedHotelData?.image) swiperImages.push(selectedHotelData.image);
  if (selectedTransferData?.image)
    swiperImages.push(selectedTransferData.image);

  if (swiperImages.length === 0) {
    swiperImages = [
      "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729863/Accommodation_3_k7ycha.png",
      "https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729917/Scenic_Bus_Ride_gyyuz3.png",
    ];
  }

  const selectedHotelForDisplay = selectedTours?.hotels?.find(
    (h) => h.day === dayNumber
  );
  const selectedTransferForDisplay = selectedTours?.transfers?.find(
    (t) => t.day === dayNumber
  );

  return (
    <div className="day-section" data-day={index}>
      <div className="itinerary-grid">
        <div className="itinerary-text">
          <div className="personalize">{t("personalizeItinerary")}</div>
          <div className="day-badge flex items-center gap-2 w-fit">
            <span>
              {t("day")} {dayNumber}
            </span>
            {/* ✅ Badge فقط لو متاح */}
            {isAvailable && (
              <span
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                  isSelected
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                <FaUserTie size={10} />
                {isSelected ? "Guide ✓" : "Guide Available"}
              </span>
            )}
          </div>
          <h3>{hotel.date}</h3>
          <div className="day-details-div">
            <p className="feat_tour">
              <span className="icon">🏨</span>
              {selectedHotelForDisplay?.name?.[locale] ||
                selectedHotelForDisplay?.name?.en ||
                selectedHotelData?.name?.[locale] ||
                selectedHotelData?.name?.en ||
                t("noHotelSelected")}
            </p>
            <p className="feat_tour">
              <span className="icon">📍</span>
              {selectedHotelForDisplay?.location?.[locale] ||
                selectedHotelForDisplay?.location?.en ||
                selectedHotelData?.location?.[locale] ||
                selectedHotelData?.location?.en ||
                hotel.location?.[locale] ||
                hotel.location?.en}
            </p>
            <p className="feat_tour">
              <span className="icon">🚗</span>
              {selectedTransferForDisplay?.name?.[locale] ||
                selectedTransferForDisplay?.name?.en ||
                selectedTransferData?.name?.[locale] ||
                selectedTransferData?.name?.en ||
                t("noTransferSelected")}
            </p>
            <p className="description">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    hotel.description?.[locale] ||
                    hotel.description?.en ||
                    t("noDescription"),
                }}
              />
            </p>
          </div>
        </div>

        <div className="itinerary-image">
          <button ref={prevRef} className="custom-prev">
            &#8249;
          </button>
          <button ref={nextRef} className="custom-next">
            &#8250;
          </button>
          <Swiper
            modules={[Navigation, EffectFade, Autoplay]}
            onInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            loop={true}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            effect={"fade"}
            className="mySwiper"
          >
            {swiperImages.map((image, imgIndex) => (
              <SwiperSlide key={imgIndex}>
                <img
                  src={image}
                  alt={`Slide ${imgIndex + 1}`}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/600x400";
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <div className="days_cont">
        <Collapse
          ghost
          expandIcon={customExpandIcon("16px")}
          size="large"
          defaultActiveKey={["1"]}
        >
          <Panel
            key="1"
            header={
              <div className="panel-header">
                {t("day")} {dayNumber} {t("options")}
              </div>
            }
          >
            {/* ✅ Tour Guide Section - يظهر فقط لو isAvailable === true */}
            {/* {isAvailable && (
              <div className="day-section-bg mb-4">
                <p className="section-title !text-[22px]">
                  <FaUserTie /> {t("tourGuide") || "Tour Guide"}
                </p>
                <div className="bg-gradient-to-r from-[#295557]/10 to-[#295557]/5 p-4 rounded-lg border border-[#295557]/20">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-full transition-colors ${
                          isSelected
                            ? "bg-[#295557] text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <FaUserTie size={24} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {t("professionalGuide") || "Professional Tour Guide"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {t("guideDescription") ||
                            "Expert local guide to enhance your experience"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isSelected}
                          onChange={handleTourGuideToggle}
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#295557]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#295557]"></div>
                      </label>
                      <span
                        className={`text-sm font-medium min-w-[80px] ${isSelected ? "text-[#295557]" : "text-gray-500"}`}
                      >
                        {isSelected ? "Included" : "Not Included"}
                      </span>
                    </div>
                  </div>

                  {!isSelected && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-700 flex items-center gap-2">
                        <span>⚠️</span>
                        Removing the tour guide is at your own responsibility.
                      </p>
                    </div>
                  )}

                  {isSelected && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700 flex items-center gap-2">
                        <span>✓</span>A professional guide will accompany you on
                        this day
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )} */}

            {/* Accommodation Section */}
            <div className="day-section-bg">
              <p className="section-title !text-[22px]">
                <FaBed /> {t("accommodation")}
              </p>
              <div className="cards-container-parent">
                <div className="cards-container">
                  {hotel.accommodation?.length > 0 ? (
                    hotel.accommodation.map((item) => (
                      <AccommodationCard
                        key={item.id}
                        item={item}
                        index={index}
                        activeAccommodations={activeAccommodations}
                        isFlipped={isFlipped}
                        selectedAccommodation={selectedAccommodation}
                        selectedTours={selectedTours}
                        setSelectedTours={setSelectedTours}
                        handleAccommodationClick={handleAccommodationClick}
                        handleFlip={handleFlip}
                        setMapModal={setMapModal}
                        people={people}
                        calculatePriceDifference={calculatePriceDifference}
                        rooms={rooms}
                        handleRoomChange={handleRoomChange}
                        addRoom={addRoom}
                        removeRoom={removeRoom}
                        confirmRoomSelection={confirmRoomSelection}
                        cancelRoomSelection={cancelRoomSelection}
                      />
                    ))
                  ) : (
                    <p className="no-options-msg">
                      {t("noAccommodationOptions")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Transfers Section */}
            <div className="day-section-bg">
              <p className="section-title !text-[22px]">
                <MdEmojiTransportation /> {t("cars")}
              </p>
              <div className="cards-container-parent">
                <div className="cards-container">
                  {hotel.transfers?.length > 0 ? (
                    hotel.transfers.map((item) => (
                      <TransferCard
                        key={item.id}
                        item={item}
                        index={index}
                        activeTransfers={activeTransfers}
                        selectedTours={selectedTours}
                        setSelectedTours={setSelectedTours}
                        handleTransferClick={handleTransferClick}
                        calculatePriceDifference={calculatePriceDifference}
                      />
                    ))
                  ) : (
                    <p className="no-options-msg">{t("noTransferOptions")}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Activities Section */}
            {hotel.activities?.length > 0 && (
              <div className="day-section-bg">
                <p className="section-title !text-[22px]">
                  <FaHiking /> {t("includedActivities")}
                </p>
                <div className="cards-container-parent">
                  <div className="cards-container">
                    {hotel.activities.map((item) => (
                      <ActivityCard
                        key={item.id}
                        item={item}
                        dayIndex={index}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Panel>
        </Collapse>
      </div>
    </div>
  );
};

export default ItineraryDay;
