"use client";
import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
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
import {
  toggleTourGuide,
  setDayCars,
  setDayRooms,
  calculateTotal,
} from "@/lib/redux/slices/tourReservationSlice";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";

const { Panel } = Collapse;

const ItineraryDay = ({
  hotel,
  index,
  locale: propLocale,
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

  const savedDayData = useSelector(
    (state) => state.tourReservation.selectedByDay?.[String(dayNumber)] || {}
  );

  const tourGuideData = useSelector(
    (state) => state.tourReservation.tourGuideByDay?.[String(dayNumber)]
  );

  const isGuideAvailable = tourGuideData?.isAvailable || false;
  const isGuideSelected = tourGuideData?.isSelected || false;

  const [localRooms, setLocalRooms] = useState([
    { id: 1, adults: 1, children: 0, babies: 0 },
  ]);

  const [selectedCars, setSelectedCars] = useState([]);

  const carsHydratedRef = useRef(false);
  const roomsHydratedRef = useRef(false);
  const lastSyncedCarsRef = useRef("");

  const isDayFlipped = isFlipped && selectedAccommodation?.dayIndex === index;

  const totalAdults = people.adults;
  const totalChildren = people.children;
  const totalInfants = people.infants || 0;
  const totalTravelers = totalAdults + totalChildren;

  const perRoomMax = useMemo(() => {
    const activeHotel = activeAccommodations?.[index];
    const perRoom =
      activeHotel?.originalData?.per_room ||
      activeHotel?.per_room ||
      hotel?.accommodation?.[0]?.originalData?.per_room;
    return perRoom ? parseInt(perRoom) : 6;
  }, [activeAccommodations, index, hotel]);

  const assignedCounts = useMemo(() => {
    return localRooms.reduce(
      (acc, room) => ({
        adults: acc.adults + Number(room.adults || 0),
        children: acc.children + Number(room.children || 0),
        babies: acc.babies + Number(room.babies || 0),
      }),
      { adults: 0, children: 0, babies: 0 }
    );
  }, [localRooms]);

  // Hydrate rooms from Redux (one-time)
  useEffect(() => {
    if (roomsHydratedRef.current) return;
    const savedRooms = Array.isArray(savedDayData?.rooms)
      ? savedDayData.rooms
      : [];
    if (savedRooms.length > 0) {
      roomsHydratedRef.current = true;
      setLocalRooms(
        savedRooms.map((room, idx) => ({
          id: idx + 1,
          adults: Number(room.adults || 0),
          children: Number(room.kids ?? room.children ?? 0),
          babies: Number(room.babies ?? room.infants ?? 0),
        }))
      );
    }
  }, []); // eslint-disable-line

  // Hydrate cars from Redux (one-time)
  useEffect(() => {
    if (carsHydratedRef.current) return;
    const savedCars = Array.isArray(savedDayData?.cars)
      ? savedDayData.cars
      : savedDayData?.car
        ? [savedDayData.car]
        : [];
    if (savedCars.length > 0) {
      carsHydratedRef.current = true;
      setSelectedCars(
        savedCars.map((car, idx) => ({
          id:
            car.instanceId ||
            `hydrated-${dayNumber}-${car.id || car.car_id || "car"}-${idx}`,
          carData: {
            ...car,
            capacity: car.capacity || car.max_people || "4",
          },
          withDriver: !!car.withDriver,
        }))
      );
    }
  }, []); // eslint-disable-line

  // Sync selected cars TO Redux
  useEffect(() => {
    const carsPayload = selectedCars.map((car) => ({
      id: car.carData?.id || car.carData?.car_id,
      car_id: car.carData?.car_id || car.carData?.id,
      title: car.carData?.title || car.carData?.name?.en || car.carData?.name,
      name: car.carData?.name,
      image: car.carData?.image,
      price_current: car.carData?.price_current || car.carData?.price,
      price: car.carData?.price || car.carData?.price_current,
      capacity: car.carData?.capacity || car.carData?.max_people || "4",
      category: car.carData?.category,
      instanceId: String(car.id),
      withDriver: !!car.withDriver,
    }));

    const carsKey = JSON.stringify(
      carsPayload.map((c) => `${c.id}-${c.withDriver}-${c.instanceId}`)
    );

    if (carsKey === lastSyncedCarsRef.current) return;
    lastSyncedCarsRef.current = carsKey;

    dispatch(setDayCars({ day: dayNumber, cars: carsPayload }));

    const timer = setTimeout(() => {
      dispatch(calculateTotal());
    }, 50);

    return () => clearTimeout(timer);
  }, [selectedCars, dayNumber, dispatch]);

  // Room management
  const getRoomOccupancy = useCallback((room) => {
    return room.adults + room.children;
  }, []);

  const handleRoomChange = useCallback(
    (action, roomId, type) => {
      setLocalRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;

          if (action === "increase") {
            const currentTotalOfType = prev.reduce(
              (sum, r) =>
                sum +
                (type === "adults"
                  ? r.adults
                  : type === "children"
                    ? r.children
                    : r.babies),
              0
            );

            const maxAllowed =
              type === "adults"
                ? totalAdults
                : type === "children"
                  ? totalChildren
                  : totalInfants;

            if (currentTotalOfType >= maxAllowed) {
              toast.error(
                `All ${type} are already assigned (${maxAllowed} total)`
              );
              return room;
            }

            if (type === "adults" || type === "children") {
              const currentOccupancy = getRoomOccupancy(room);
              if (currentOccupancy >= perRoomMax) {
                toast.error(
                  `Maximum ${perRoomMax} persons per room (adults + children)`
                );
                return room;
              }

              const totalAssigned = prev.reduce(
                (sum, r) => sum + r.adults + r.children,
                0
              );
              if (totalAssigned >= totalTravelers) {
                toast.error("All travelers are already assigned to rooms");
                return room;
              }
            }

            return { ...room, [type]: room[type] + 1 };
          }

          if (action === "decrease") {
            if (type === "adults" && room.adults <= 1) {
              toast.error("Each room must have at least 1 adult");
              return room;
            }
            if (type === "children" && room.children <= 0) return room;
            if (type === "babies" && room.babies <= 0) return room;
            return { ...room, [type]: room[type] - 1 };
          }

          return room;
        })
      );
    },
    [
      totalAdults,
      totalChildren,
      totalInfants,
      totalTravelers,
      perRoomMax,
      getRoomOccupancy,
    ]
  );

  const addRoom = useCallback(() => {
    if (localRooms.length >= 5) {
      toast.error("Maximum 5 rooms allowed");
      return;
    }
    const assignedAdults = localRooms.reduce((sum, r) => sum + r.adults, 0);
    if (totalAdults - assignedAdults <= 0) {
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
        babies: 0,
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
    const assignedTravelers = localRooms.reduce(
      (sum, r) => sum + r.adults + r.children,
      0
    );
    if (assignedTravelers !== totalTravelers) {
      toast.error(
        `Please assign all ${totalTravelers} travelers. Currently assigned: ${assignedTravelers}`
      );
      return;
    }
    const roomWithOnlyChildren = localRooms.find(
      (room) => room.adults === 0 && room.children > 0
    );
    if (roomWithOnlyChildren) {
      toast.error(
        "Children cannot stay alone in a room. Each room must have at least 1 adult."
      );
      return;
    }
    if (assignedCounts.adults !== totalAdults) {
      toast.error(
        `${totalAdults - assignedCounts.adults} adult(s) not assigned to any room`
      );
      return;
    }
    if (totalChildren > 0 && assignedCounts.children !== totalChildren) {
      toast.error(
        `${totalChildren - assignedCounts.children} child(ren) not assigned to any room`
      );
      return;
    }
    for (let i = 0; i < localRooms.length; i++) {
      const room = localRooms[i];
      const occupancy = getRoomOccupancy(room);
      if (occupancy > perRoomMax) {
        toast.error(
          `Room ${i + 1} has ${occupancy} persons but max is ${perRoomMax} per room`
        );
        return;
      }
    }

    dispatch(
      setDayRooms({
        day: dayNumber,
        rooms: localRooms.map((room) => ({
          adults: room.adults,
          kids: room.children,
          babies: room.babies,
        })),
      })
    );
    setTimeout(() => {
      dispatch(calculateTotal());
    }, 50);

    setIsFlipped(false);
    setSelectedAccommodation(null);
    toast.success("Room selection confirmed!");
  }, [
    localRooms,
    totalTravelers,
    totalAdults,
    totalChildren,
    assignedCounts,
    dispatch,
    dayNumber,
    setIsFlipped,
    setSelectedAccommodation,
    perRoomMax,
    getRoomOccupancy,
  ]);

  const cancelRoomSelection = useCallback(() => {
    setIsFlipped(false);
    setSelectedAccommodation(null);
    setLocalRooms([{ id: 1, adults: 1, children: 0, babies: 0 }]);
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

  // Car management
  const totalPassengers = useMemo(() => {
    const drivers = selectedCars.filter((c) => c.withDriver).length;
    return totalAdults + totalChildren + drivers;
  }, [selectedCars, totalAdults, totalChildren]);

  const totalCarCapacity = useMemo(() => {
    return selectedCars.reduce(
      (sum, c) =>
        sum + (parseInt(c.carData?.capacity || c.carData?.max_people) || 4),
      0
    );
  }, [selectedCars]);

  const isCapacitySufficient = totalCarCapacity >= totalPassengers;

  const addCar = useCallback(
    (carItem) => {
      const newCar = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        carData: {
          ...carItem,
          capacity: carItem.capacity || carItem.max_people || "4",
        },
        withDriver: false,
      };
      setSelectedCars((prev) => [...prev, newCar]);
      handleTransferClick(carItem, index);
    },
    [handleTransferClick, index]
  );

  const removeCar = useCallback((carId) => {
    setSelectedCars((prev) => prev.filter((c) => c.id !== carId));
  }, []);

  const toggleDriver = useCallback((carId) => {
    setSelectedCars((prev) =>
      prev.map((c) =>
        c.id === carId ? { ...c, withDriver: !c.withDriver } : c
      )
    );
  }, []);

  if (!hotel) return null;

  const handleTourGuideToggle = () => {
    dispatch(toggleTourGuide(dayNumber));
    setTimeout(() => {
      dispatch(calculateTotal());
    }, 50);
  };

  const selectedHotelData =
    activeAccommodations?.[index] ||
    hotel.accommodation?.find(
      (h) =>
        h.id ===
        parseInt(savedDayData?.hotel?.id || savedDayData?.hotel?.hotel_id || 0)
    );

  const savedCarsForDay = Array.isArray(savedDayData?.cars)
    ? savedDayData.cars
    : savedDayData?.car
      ? [savedDayData.car]
      : [];

  const selectedTransferData =
    activeTransfers?.[index] ||
    hotel.transfers?.find(
      (t) =>
        t.id ===
        parseInt(savedCarsForDay?.[0]?.id || savedCarsForDay?.[0]?.car_id || 0)
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

  const selectedCarName = (() => {
    if (!selectedCars.length && !savedCarsForDay.length) return null;
    const carsSource = selectedCars.length
      ? selectedCars.map((c) => ({ ...c.carData, withDriver: c.withDriver }))
      : savedCarsForDay;
    const firstCar = carsSource[0];
    const firstName =
      firstCar?.name?.[locale] ||
      firstCar?.name?.en ||
      firstCar?.title ||
      t("noTransferSelected");
    if (carsSource.length === 1) {
      return `${firstName}${firstCar.withDriver ? " + Driver" : ""}`;
    }
    return `${firstName} + ${carsSource.length - 1} more`;
  })();

  return (
    <div className="day-section" data-day={index}>
      <div className="itinerary-grid">
        <div className="itinerary-text">
          <div className="personalize">{t("personalizeItinerary")}</div>

          <div className="day-badge flex items-center gap-2 w-fit">
            <span>
              {t("day")} {dayNumber}
            </span>
            {isGuideAvailable && (
              <span
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                  isGuideSelected
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                <FaUserTie size={10} />
                {isGuideSelected ? "Guide ✓" : "Guide Available"}
              </span>
            )}
          </div>

          <h3>{hotel.date}</h3>

          <div className="day-details-div">
            <p className="feat_tour">
              <span className="icon">🏨</span>
              {selectedHotelData?.name?.[locale] ||
                selectedHotelData?.name?.en ||
                t("noHotelSelected")}
            </p>
            <p className="feat_tour">
              <span className="icon">📍</span>
              {selectedHotelData?.location?.[locale] ||
                selectedHotelData?.location?.en ||
                hotel.location?.[locale] ||
                hotel.location?.en}
            </p>
            <p className="feat_tour">
              <span className="icon">🚗</span>
              {selectedCarName || t("noTransferSelected")}
            </p>
            <div className="description">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    hotel.description?.[locale] ||
                    hotel.description?.en ||
                    t("noDescription"),
                }}
              />
            </div>
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
            {/* ═══ Accommodation ═══ */}
            <div
              className="day-section-bg"
              data-accommodation={`day-${dayNumber}`}
            >
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
                        perRoomMax={perRoomMax}
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

            {/* ═══ Transfers / Cars ═══ */}
            <div className="day-section-bg">
              <p className="section-title !text-[22px]">
                <MdEmojiTransportation /> {t("cars")}
              </p>

              {totalInfants > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg mb-3 bg-blue-50 border border-blue-200">
                  <span className="text-blue-500 text-sm">👶</span>
                  <span className="text-xs text-blue-700">
                    {totalInfants} infant{totalInfants > 1 ? "s" : ""} — not
                    counted for car seats
                  </span>
                </div>
              )}

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
                        ` (incl. ${selectedCars.filter((c) => c.withDriver).length} driver${selectedCars.filter((c) => c.withDriver).length > 1 ? "s" : ""})`}
                    </span>
                    {!isCapacitySufficient && (
                      <span className="text-red-600 text-xs block">
                        Need {totalPassengers - totalCarCapacity} more seat(s)
                      </span>
                    )}
                  </div>
                </div>
              )}

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
                            Capacity:{" "}
                            {parseInt(
                              car.carData?.capacity ||
                                car.carData?.max_people ||
                                0
                            )}{" "}
                            seats
                            {car.withDriver && " (1 seat for driver)"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
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

              <div className="cards-container-parent">
                <div className="cards-container">
                  {hotel.transfers?.length > 0 ? (
                    hotel.transfers.map((item) => (
                      <div key={item.id} className="relative">
                        <TransferCard
                          item={item}
                          index={index}
                          activeTransfers={activeTransfers}
                          handleTransferClick={() => addCar(item)}
                          calculatePriceDifference={calculatePriceDifference}
                        />
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

            {/* ═══ Activities ═══ */}
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

            {/* ═══ Tour Guide ═══ */}
            {/* {isGuideAvailable && (
              <div className="day-section-bg">
                <p className="section-title !text-[22px]">
                  <FaUserTie /> Tour Guide
                </p>
                <div className="flex items-center justify-between bg-white border rounded-xl px-4 py-3">
                  <div>
                    <p className="mb-0 font-semibold">
                      {isGuideSelected ? "Guide Selected" : "Guide Optional"}
                    </p>
                    <p className="mb-0 text-sm text-gray-500">
                      Price: ${parseFloat(tourGuideData?.guidePrice || 0)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTourGuideToggle}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isGuideSelected
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                    }`}
                  >
                    {isGuideSelected ? "Remove Guide" : "Add Guide"}
                  </button>
                </div>
              </div>
            )} */}
          </Panel>
        </Collapse>
      </div>
    </div>
  );
};

export default ItineraryDay;
