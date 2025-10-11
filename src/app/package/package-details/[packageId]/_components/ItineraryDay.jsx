"use client";
import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectFade, Autoplay } from "swiper/modules";
import { Collapse } from "antd";
import { BsFillCaretRightFill } from "react-icons/bs";
import { FaBed } from "react-icons/fa6";
import { MdEmojiTransportation } from "react-icons/md";
import AccommodationCard from "./AccommodationCard";
import TransferCard from "./TransferCard";
import { customExpandIcon } from "./CustomExpandIcon";
import { useLocale, useTranslations } from "next-intl";

const { Panel } = Collapse;

const ItineraryDay = ({
  hotel,
  index,
  days,
  selectedTours,
  setSelectedTours,
  activeAccommodations,
  setActiveAccommodations,
  isFlipped,
  setIsFlipped,
  selectedAccommodation,
  setSelectedAccommodation,
  handleAccommodationClick,
  handleFlip,
  setMapModal,
  people,
  calculatePriceDifference,
  rooms,
  setRooms,
  handleRoomChange,
  addRoom,
  removeRoom,
  confirmRoomSelection,
  cancelRoomSelection,
}) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const locale = useLocale();
  const t = useTranslations("packageDetails");

  return (
    <div className="day-section" data-day={index}>
      <div className="itinerary-grid">
        <div key={index} className="itinerary-text">
          <div className="personalize">{t("personalizeItinerary")}</div>
          <div className="day-badge">
            {t("day")} {index + 1}
          </div>{" "}
          <h3>{days[index]?.date}</h3>
          <div className="day-details-div">
            <p className="feat_tour">
              <span className="icon">🏨</span>{" "}
              {selectedTours?.hotels?.find((e) => e.day == hotel?.day)?.name[
                locale
              ] ||
                selectedTours?.hotels?.find((e) => e.day == hotel?.day)?.name
                  .en}
            </p>
            <p className="feat_tour">
              <span className="icon">📍</span>{" "}
              {selectedTours?.hotels?.find((e) => e.day == hotel?.day)
                ?.location[locale] ||
                selectedTours?.hotels?.find((e) => e.day == hotel?.day)
                  ?.location.en}
            </p>
            <p className="feat_tour">
              <span className="icon">🚗</span>{" "}
              {selectedTours?.transfers?.find((e) => e.day == hotel?.day)?.name[
                locale
              ] ||
                selectedTours?.transfers?.find((e) => e.day == hotel?.day)?.name
                  .en}
            </p>
            <p className="description">
              {days[index]?.description[locale] || days[index]?.description.en}
            </p>{" "}
            <a href="#" className="read-more">
              {t("readMore")}
            </a>
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
            spaceBetween={30}
            onInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            loop={true}
            autoplay={{ delay: 5000 }}
            effect={"fade"}
            navigation={{
              nextEl: ".custom-next",
              prevEl: ".custom-prev",
            }}
            pagination={{ clickable: true }}
            modules={[Navigation, EffectFade, Autoplay]}
            className="mySwiper"
          >
            <SwiperSlide>
              <img
                src="https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729863/Accommodation_3_k7ycha.png"
                alt="Slide 1"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src="https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742730347/stay_apartment_bolhlt_ibcnlr.png"
                alt="Slide 3"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src="https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742729917/Scenic_Bus_Ride_gyyuz3.png"
                alt="Slide 2"
              />
            </SwiperSlide>
          </Swiper>
        </div>
      </div>

      <div className="days_cont" style={{ color: "#295557" }}>
        <div className="d-flex flex-column gap-2">
          <Collapse
            ghost
            expandIcon={customExpandIcon("16px")}
            size="large"
            style={{ color: "#295557" }}
          >
            <Panel
              header={
                <h2 style={{ color: "#295557", fontSize: "20px" }}>
                  {t("day")} {index + 1} {t("options")}
                </h2>
              }
              style={{ padding: "0px" }}
            >
              <div className="day-section day-section-bg">
                <h2
                  style={{
                    color: "#295557",
                    fontSize: "22px",
                    padding: "15px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <FaBed />
                  {t("accommodation")}
                </h2>
                <div className="cards-container-parent">
                  <div className="cards-container">
                    {hotel?.accommodation?.map((item) => (
                      <AccommodationCard
                        selectedTours={selectedTours}
                        setSelectedTours={setSelectedTours}
                        key={item.id}
                        item={item}
                        index={index}
                        activeAccommodations={activeAccommodations}
                        isFlipped={isFlipped}
                        selectedAccommodation={selectedAccommodation}
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
                        locale={locale}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="day-section day-section-bg">
                <h2
                  style={{
                    color: "#295557",
                    fontSize: "22px",
                    padding: "15px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <MdEmojiTransportation />
                  {t("cars")}
                </h2>
                <div className="cards-container-parent">
                  <div className="cards-container">
                    {hotel?.transfers?.map((item) => (
                      <TransferCard
                        key={item.id}
                        item={item}
                        index={index}
                        selectedTours={selectedTours}
                        setSelectedTours={setSelectedTours}
                        calculatePriceDifference={calculatePriceDifference}
                        locale={locale}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Panel>
          </Collapse>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDay;
