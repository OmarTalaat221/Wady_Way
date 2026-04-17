"use client";
import React, { useRef, useState, useCallback, useMemo } from "react";
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
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";

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
  setIsFlipped,
  selectedAccommodation,
  setSelectedAccommodation,
  handleAccommodationClick,
  handleTransferClick,
  setMapModal,
  people,
  calculatePriceDifference,
}) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const t = useTranslations("packageDetails");
  const hookLocale = useLocale();
  const locale = propLocale || hookLocale;
  const dispatch = useDispatch();

  const dayNumber = index + 1;

  // ✅ Tour Guide
  const tourGuideData = useSelector(
    (state) => state.tourReservation.tourGuideByDay?.[dayNumber]
  );
  const isAvailable = tourGuideData?.isAvailable || false;
  const isSelected = tourGuideData?.isSelected || false;

  // ✅ Per-day room state - كل يوم عنده rooms مستقلة
  const [localRooms, setLocalRooms] = useState([
    { id: 1, adults: 1, children: 0 },
  ]);

  const [selectedCars, setSelectedCars] = useState([]);

  // ✅ Check if THIS day's card is flipped
  const isDayFlipped = isFlipped && selectedAccommodation?.dayIndex === index;

  // ✅ Computed: total travelers (without infants)
  const totalAdults = people.adults;
  const totalChildren = people.children;
  const totalTravelers = totalAdults + totalChildren;

  // ✅ Computed: assigned counts across all rooms
  const assignedCounts = useMemo(() => {
    return localRooms.reduce(
      (acc, room) => ({
        adults: acc.adults + room.adults,
        children: acc.children + room.children,
      }),
      { adults: 0, children: 0 }
    );
  }, [localRooms]);

  // ════════════════════════════════════════
  // ROOM MANAGEMENT - Per Day
  // ════════════════════════════════════════

  const handleRoomChange = useCallback(
    (action, roomId, type) => {
      setLocalRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;

          if (action === "increase") {
            // ✅ Check max per type
            const currentTotalOfType = prev.reduce(
              (sum, r) => sum + r[type],
              0
            );
            const maxAllowed = type === "adults" ? totalAdults : totalChildren;

            if (currentTotalOfType >= maxAllowed) {
              toast.error(
                `All ${type} are already assigned (${maxAllowed} total)`
              );
              return room;
            }

            // ✅ Check total doesn't exceed travelers
            const totalAssigned = prev.reduce(
              (sum, r) => sum + r.adults + r.children,
              0
            );
            if (totalAssigned >= totalTravelers) {
              toast.error("All travelers are already assigned to rooms");
              return room;
            }

            return { ...room, [type]: room[type] + 1 };
          } else if (action === "decrease") {
            // ✅ Adults can't go below 1 (each room needs at least 1 adult)
            if (type === "adults" && room.adults <= 1) {
              toast.error("Each room must have at least 1 adult");
              return room;
            }
            if (type === "children" && room.children <= 0) return room;

            return { ...room, [type]: room[type] - 1 };
          }

          return room;
        })
      );
    },
    [totalAdults, totalChildren, totalTravelers]
  );

  const addRoom = useCallback(() => {
    if (localRooms.length >= 5) {
      toast.error("Maximum 5 rooms allowed");
      return;
    }

    // ✅ Check if there are unassigned adults
    const assignedAdults = localRooms.reduce((sum, r) => sum + r.adults, 0);
    const remainingAdults = totalAdults - assignedAdults;

    if (remainingAdults <= 0) {
      toast.error(
        "No remaining adults to assign. Each room needs at least 1 adult."
      );
      return;
    }

    setLocalRooms((prev) => [
      ...prev,
      {
        id: Math.max(...prev.map((r) => r.id)) + 1,
        adults: 1,
        children: 0,
      },
    ]);
  }, [localRooms, totalAdults]);

  const removeRoom = useCallback(
    (roomId) => {
      if (localRooms.length <= 1) {
        toast.error("At least 1 room is required");
        return;
      }
      setLocalRooms((prev) => prev.filter((r) => r.id !== roomId));
    },
    [localRooms.length]
  );

  const confirmRoomSelection = useCallback(() => {
    // ✅ Validate: all travelers assigned
    const assigned = localRooms.reduce(
      (sum, r) => sum + r.adults + r.children,
      0
    );

    if (assigned !== totalTravelers) {
      toast.error(
        `Please assign all ${totalTravelers} travelers. Currently assigned: ${assigned}`
      );
      return;
    }

    // ✅ Validate: no room with only children
    const roomWithOnlyChildren = localRooms.find(
      (room) => room.adults === 0 && room.children > 0
    );
    if (roomWithOnlyChildren) {
      toast.error(
        "Children cannot stay alone in a room. Each room must have at least 1 adult."
      );
      return;
    }

    // ✅ Validate: all adults assigned
    if (assignedCounts.adults !== totalAdults) {
      toast.error(
        `${totalAdults - assignedCounts.adults} adult(s) not assigned to any room`
      );
      return;
    }

    // ✅ Validate: all children assigned (if any)
    if (totalChildren > 0 && assignedCounts.children !== totalChildren) {
      toast.error(
        `${totalChildren - assignedCounts.children} child(ren) not assigned to any room`
      );
      return;
    }

    setIsFlipped(false);
    setSelectedAccommodation(null);
    toast.success("Room selection confirmed!");
  }, [
    localRooms,
    totalTravelers,
    totalAdults,
    totalChildren,
    assignedCounts,
    setIsFlipped,
    setSelectedAccommodation,
  ]);

  const cancelRoomSelection = useCallback(() => {
    setIsFlipped(false);
    setSelectedAccommodation(null);
    // Reset to default
    setLocalRooms([{ id: 1, adults: 1, children: 0 }]);
  }, [setIsFlipped, setSelectedAccommodation]);

  const handleFlip = useCallback(
    (dayIdx) => {
      if (activeAccommodations[dayIdx]) {
        setSelectedAccommodation({
          ...activeAccommodations[dayIdx],
          dayIndex: dayIdx,
        });
        setIsFlipped(true);
      }
    },
    [activeAccommodations, setSelectedAccommodation, setIsFlipped]
  );

  // ════════════════════════════════════════
  // CAR MANAGEMENT - Per Day
  // ════════════════════════════════════════

  const totalPassengers = useMemo(() => {
    const drivers = selectedCars.filter((c) => c.withDriver).length;
    return totalAdults + totalChildren + drivers;
  }, [selectedCars, totalAdults, totalChildren]);

  const totalCarCapacity = useMemo(() => {
    return selectedCars.reduce(
      (sum, c) => sum + (parseInt(c.carData?.capacity) || 4),
      0
    );
  }, [selectedCars]);

  const isCapacitySufficient = totalCarCapacity >= totalPassengers;

  const addCar = useCallback(
    (carItem) => {
      setSelectedCars((prev) => [
        ...prev,
        {
          id: Date.now(),
          carData: carItem,
          withDriver: false,
        },
      ]);
      // Also update the parent selection for the first car
      if (selectedCars.length === 0) {
        handleTransferClick(carItem, index);
      }
    },
    [selectedCars.length, handleTransferClick, index]
  );

  const removeCar = useCallback((carId) => {
    setSelectedCars((prev) => {
      const updated = prev.filter((c) => c.id !== carId);
      // If we removed all, reset parent selection
      if (updated.length === 0) {
        // Optionally reset activeTransfer
      }
      return updated;
    });
  }, []);

  const toggleDriver = useCallback((carId) => {
    setSelectedCars((prev) =>
      prev.map((c) =>
        c.id === carId ? { ...c, withDriver: !c.withDriver } : c
      )
    );
  }, []);

  // ════════════════════════════════════════
  // REST OF COMPONENT
  // ════════════════════════════════════════

  if (!hotel) return null;

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
            {/* Accommodation */}
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
                        isFlipped={isDayFlipped}
                        selectedAccommodation={selectedAccommodation}
                        selectedTours={selectedTours}
                        setSelectedTours={setSelectedTours}
                        handleAccommodationClick={handleAccommodationClick}
                        handleFlip={handleFlip}
                        setMapModal={setMapModal}
                        people={people}
                        calculatePriceDifference={calculatePriceDifference}
                        rooms={localRooms}
                        handleRoomChange={handleRoomChange}
                        addRoom={addRoom}
                        removeRoom={removeRoom}
                        confirmRoomSelection={confirmRoomSelection}
                        cancelRoomSelection={cancelRoomSelection}
                        assignedCounts={assignedCounts}
                        totalTravelers={totalTravelers}
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

            {/* Transfers */}
            {/* Transfers / Cars */}
            <div className="day-section-bg">
              <p className="section-title !text-[22px]">
                <MdEmojiTransportation /> {t("cars")}
              </p>

              {/* Capacity Status Bar */}
              {selectedCars.length > 0 && (
                <div
                  className={`flex items-center justify-between px-4 py-3 rounded-xl mb-4 border ${
                    isCapacitySufficient
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <span className="font-semibold">
                        {selectedCars.length}{" "}
                        {selectedCars.length === 1 ? "car" : "cars"}
                      </span>
                      <span className="text-gray-500 mx-1">•</span>
                      <span>Capacity: {totalCarCapacity} seats</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span
                      className={`font-semibold ${
                        isCapacitySufficient ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {totalPassengers} people
                      {selectedCars.filter((c) => c.withDriver).length > 0 &&
                        ` (incl. ${
                          selectedCars.filter((c) => c.withDriver).length
                        } driver${
                          selectedCars.filter((c) => c.withDriver).length > 1
                            ? "s"
                            : ""
                        })`}
                    </span>
                    {!isCapacitySufficient && (
                      <span className="text-red-600 text-xs block">
                        Need {totalPassengers - totalCarCapacity} more seat(s)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Cars List */}
              {selectedCars.length > 0 && (
                <div className="space-y-3 mb-4">
                  {selectedCars.map((car, carIdx) => (
                    <div
                      key={car.id}
                      className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            car.carData?.image ||
                            "https://via.placeholder.com/60x40"
                          }
                          alt={
                            car.carData?.name?.[locale] ||
                            car.carData?.name?.en ||
                            car.carData?.title
                          }
                          className="w-[60px] h-[40px] object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/60x40";
                          }}
                        />
                        <div>
                          <p className="text-sm font-semibold mb-0">
                            {car.carData?.name?.[locale] ||
                              car.carData?.name?.en ||
                              car.carData?.title ||
                              `Car ${carIdx + 1}`}
                          </p>
                          <p className="text-xs text-gray-500 mb-0">
                            Capacity: {parseInt(car.carData?.capacity)} seats
                            {car.withDriver && " (1 seat for driver)"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Driver Toggle */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDriver(car.id);
                          }}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                            car.withDriver
                              ? "bg-[#295557] text-white border-[#295557]"
                              : "bg-white text-gray-600 border-gray-300 hover:border-[#295557]"
                          }`}
                        >
                          <FaUserTie size={10} />
                          Driver
                        </button>

                        {/* Remove */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCar(car.id);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-sm"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Cars to Add */}
              <div className="cards-container-parent">
                <div className="cards-container">
                  {hotel.transfers?.length > 0 ? (
                    hotel.transfers.map((item) => (
                      <div key={item.id} className="relative">
                        <TransferCard
                          item={item}
                          index={index}
                          activeTransfers={activeTransfers}
                          selectedTours={selectedTours}
                          setSelectedTours={setSelectedTours}
                          handleTransferClick={() => addCar(item)}
                          calculatePriceDifference={calculatePriceDifference}
                        />
                        {/* Add Car Button Overlay */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addCar(item);
                          }}
                          className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-[#295557] text-white shadow-lg hover:bg-[#1e3e40] transition-colors"
                          title="Add this car"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="no-options-msg">{t("noTransferOptions")}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Activities */}
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
