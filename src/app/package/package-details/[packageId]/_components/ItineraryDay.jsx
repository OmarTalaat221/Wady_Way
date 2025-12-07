"use client";
import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectFade, Autoplay } from "swiper/modules";
import { Collapse } from "antd";
import { FaBed, FaHiking } from "react-icons/fa";
import { MdEmojiTransportation } from "react-icons/md";
import AccommodationCard from "./AccommodationCard";
import TransferCard from "./TransferCard";
import ActivityCard from "./ActivityCard";
import { customExpandIcon } from "./CustomExpandIcon";
import { useLocale, useTranslations } from "next-intl";

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

  if (!hotel) {
    return null;
  }

  // Get selected hotel and transfer for display
  const selectedHotelData =
    activeAccommodations?.[index] ||
    hotel.accommodation?.find(
      (h) =>
        h.id === selectedTours?.hotels?.find((sh) => sh.day === index + 1)?.id
    );

  const selectedTransferData =
    activeTransfers?.[index] ||
    hotel.transfers?.find(
      (t) =>
        t.id ===
        selectedTours?.transfers?.find((st) => st.day === index + 1)?.id
    );

  // Build swiper images
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
    (h) => h.day === index + 1
  );
  const selectedTransferForDisplay = selectedTours?.transfers?.find(
    (t) => t.day === index + 1
  );

  return (
    <div className="day-section" data-day={index}>
      <div className="itinerary-grid">
        <div className="itinerary-text">
          <div className="personalize">{t("personalizeItinerary")}</div>
          <div className="day-badge">
            {t("day")} {index + 1}
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
                {t("day")} {index + 1} {t("options")}
              </div>
            }
          >
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
