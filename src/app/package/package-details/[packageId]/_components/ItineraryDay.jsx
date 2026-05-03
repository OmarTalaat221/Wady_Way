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
  setHotelRoomDraft,
  trimCarsToAdults,
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

  const numAdults = useSelector(
    (state) => state.tourReservation.numAdults || 1
  );

  const numChildren = useSelector(
    (state) => state.tourReservation.numChildren || 0
  );

  const dayRoomDrafts = useSelector(
    (state) => state.tourReservation.roomDraftsByDay?.[String(dayNumber)] || {}
  );

  const hasRestoredSelections = useSelector(
    (state) => state.tourReservation.hasRestoredSelections
  );

  const isGuideAvailable = tourGuideData?.isAvailable || false;
  const isGuideSelected = tourGuideData?.isSelected || false;

  const totalAdults = people.adults;
  const totalChildren = people.children;
  const totalInfants = people.infants || 0;
  const totalTravelers = totalAdults + totalChildren;
  const maxRooms = Math.max(totalAdults, 1);

  const activeHotelId = useMemo(() => {
    const selectedHotel = savedDayData?.hotel;
    if (selectedHotel) {
      return String(selectedHotel.id || selectedHotel.hotel_id || "");
    }
    const activeHotel = activeAccommodations?.[index];
    if (activeHotel) {
      return String(activeHotel.id || activeHotel.hotel_id || "");
    }
    const firstHotel = hotel?.accommodation?.[0];
    return String(firstHotel?.id || firstHotel?.hotel_id || "");
  }, [savedDayData?.hotel, activeAccommodations, index, hotel?.accommodation]);

  const [localRooms, setLocalRooms] = useState([
    { id: 1, adults: 1, children: 0, babies: 0 },
  ]);

  const [selectedCars, setSelectedCars] = useState([]);

  const carsHydratedRef = useRef(false);
  const lastSyncedCarsRef = useRef("");
  const draftsRef = useRef({});
  const peopleSyncReadyRef = useRef(false);
  const prevAdultsRef = useRef(numAdults);
  const prevChildrenRef = useRef(numChildren);
  // ✅ ref لمتابعة آخر activeHotelId هيدرت منه
  const lastHydratedHotelRef = useRef("");
  // ✅ ref لـ dayRoomDrafts علشان نستخدمه في useEffect بدون ما يسبب re-render loop
  const dayRoomDraftsRef = useRef(dayRoomDrafts);

  // ✅ نحدث الـ ref دايماً لما dayRoomDrafts يتغير
  useEffect(() => {
    dayRoomDraftsRef.current = dayRoomDrafts;
  }, [dayRoomDrafts]);

  const isDayFlipped = isFlipped && selectedAccommodation?.dayIndex === index;

  const perRoomMax = useMemo(() => {
    const selectedHotelForRoomConfig =
      hotel?.accommodation?.find(
        (item) => String(item.id || item.hotel_id || "") === activeHotelId
      ) || hotel?.accommodation?.[0];

    const perRoom =
      selectedHotelForRoomConfig?.originalData?.per_room ||
      selectedHotelForRoomConfig?.per_room ||
      hotel?.accommodation?.[0]?.originalData?.per_room;

    return perRoom ? parseInt(perRoom) : 6;
  }, [hotel?.accommodation, activeHotelId]);

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

  const mapReduxRoomsToLocal = useCallback((rooms = []) => {
    return rooms.map((room, idx) => ({
      id: idx + 1,
      adults: Number(room.adults || 0),
      children: Number(room.kids ?? room.children ?? 0),
      babies: Number(room.babies ?? room.infants ?? 0),
    }));
  }, []);

  // ✅ getDraftForHotel بتستخدم الـ ref مش الـ state
  // وده بيمنع إنها تتغير كل render
  const getDraftForHotel = useCallback(
    (hotelId) => {
      if (!hotelId) return [];
      const hotelKey = String(hotelId);

      // أول حاجة: local draftsRef
      if (Array.isArray(draftsRef.current[hotelKey])) {
        return draftsRef.current[hotelKey];
      }

      // تاني حاجة: dayRoomDraftsRef (مش dayRoomDrafts مباشرة)
      const reduxDraft = dayRoomDraftsRef.current?.[hotelKey];
      if (Array.isArray(reduxDraft) && reduxDraft.length > 0) {
        const mapped = mapReduxRoomsToLocal(reduxDraft);
        draftsRef.current[hotelKey] = mapped;
        return mapped;
      }

      return [];
    },
    [mapReduxRoomsToLocal]
    // ✅ مفيش dayRoomDrafts هنا — ده كان بيسبب الـ loop
  );

  const getStoredRoomsCountForHotel = useCallback(
    (hotelId) => {
      if (!hotelId) return 0;
      const hotelKey = String(hotelId);
      const reduxDraft = dayRoomDrafts?.[hotelKey];
      return Array.isArray(reduxDraft) ? reduxDraft.length : 0;
    },
    [dayRoomDrafts]
  );

  // ✅ Hydrate localRooms لما activeHotelId يتغير
  // بنستخدم lastHydratedHotelRef علشان نتأكد إننا مش بنعمل hydrate لنفس الفندق أكتر من مرة
  useEffect(() => {
    if (!hasRestoredSelections) return;
    if (!activeHotelId) return;
    if (lastHydratedHotelRef.current === activeHotelId) return;

    lastHydratedHotelRef.current = activeHotelId;

    const existingDraft = getDraftForHotel(activeHotelId);
    if (existingDraft.length > 0) {
      setLocalRooms(existingDraft);
    } else {
      setLocalRooms([{ id: 1, adults: 1, children: 0, babies: 0 }]);
    }
    // ✅ getDraftForHotel مش بتتغير دلوقتي لأنها مش بتعتمد على dayRoomDrafts
  }, [hasRestoredSelections, activeHotelId, getDraftForHotel]);

  // ✅ Reset rooms لما عدد الأشخاص يتغير
  useEffect(() => {
    if (!hasRestoredSelections) return;

    if (!peopleSyncReadyRef.current) {
      prevAdultsRef.current = numAdults;
      prevChildrenRef.current = numChildren;
      peopleSyncReadyRef.current = true;
      return;
    }

    const adultsChanged = prevAdultsRef.current !== numAdults;
    const childrenChanged = prevChildrenRef.current !== numChildren;

    if (adultsChanged || childrenChanged) {
      const hadAnyDrafts =
        Object.keys(draftsRef.current).length > 0 ||
        Object.keys(dayRoomDraftsRef.current || {}).length > 0;

      draftsRef.current = {};
      lastHydratedHotelRef.current = "";
      setLocalRooms([{ id: 1, adults: 1, children: 0, babies: 0 }]);

      if (hadAnyDrafts) {
        toast.error("Traveler count changed. Please redistribute your rooms.", {
          icon: "",
          duration: 10000,
        });
      }

      prevAdultsRef.current = numAdults;
      prevChildrenRef.current = numChildren;
    }
  }, [hasRestoredSelections, numAdults, numChildren]);
  // ✅ مفيش dayRoomDrafts هنا — الـ ref بيغني عنه

  // ✅ Hydrate cars من Redux
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
  }, [dayNumber, savedDayData]);

  // ✅ Trim cars لما adults يقل
  useEffect(() => {
    if (selectedCars.length > numAdults) {
      const trimmed = selectedCars.slice(0, numAdults);
      setSelectedCars(trimmed);
      toast.error(`Cars reduced to ${numAdults} to match adult count`, {
        icon: "🚗",
      });
      dispatch(trimCarsToAdults({ day: dayNumber, maxCars: numAdults }));
    }
  }, [numAdults, selectedCars, dispatch, dayNumber]);

  // ✅ Sync cars للـ Redux
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
    const timer = setTimeout(() => dispatch(calculateTotal()), 50);
    return () => clearTimeout(timer);
  }, [selectedCars, dayNumber, dispatch]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const onHotelCardClick = useCallback(
    (item) => {
      const newHotelId = String(item.id || item.hotel_id || "");

      if (activeHotelId && activeHotelId !== newHotelId) {
        draftsRef.current[activeHotelId] = localRooms;
      }

      if (activeHotelId !== newHotelId) {
        // ✅ نحدث الـ ref علشان getDraftForHotel يشوف أحدث بيانات
        lastHydratedHotelRef.current = newHotelId;

        const newHotelDraft = getDraftForHotel(newHotelId);
        if (newHotelDraft.length > 0) {
          setLocalRooms(newHotelDraft);
        } else {
          setLocalRooms([{ id: 1, adults: 1, children: 0, babies: 0 }]);
        }
      }

      handleAccommodationClick(item, index);
    },
    [
      activeHotelId,
      localRooms,
      getDraftForHotel,
      handleAccommodationClick,
      index,
    ]
  );

  const getRoomOccupancy = useCallback(
    (room) => room.adults + room.children,
    []
  );

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
              toast.error(`All ${type} are already assigned`);
              return room;
            }

            if (type === "adults" || type === "children") {
              const currentOccupancy = getRoomOccupancy(room);
              if (currentOccupancy >= perRoomMax) {
                toast.error(`Maximum ${perRoomMax} persons per room`);
                return room;
              }

              const totalAssigned = prev.reduce(
                (sum, r) => sum + r.adults + r.children,
                0
              );

              if (totalAssigned >= totalTravelers) {
                toast.error("All travelers are already assigned");
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
    if (localRooms.length >= maxRooms) {
      toast.error(`Maximum ${maxRooms} rooms allowed`);
      return;
    }

    const assignedAdults = localRooms.reduce((sum, r) => sum + r.adults, 0);
    if (totalAdults - assignedAdults <= 0) {
      toast.error("No remaining adults to assign");
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
  }, [localRooms, totalAdults, maxRooms]);

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
        `Please assign all ${totalTravelers} travelers. Currently: ${assignedTravelers}`
      );
      return;
    }

    if (assignedCounts.adults !== totalAdults) {
      toast.error(
        `${totalAdults - assignedCounts.adults} adult(s) not assigned`
      );
      return;
    }

    if (totalChildren > 0 && assignedCounts.children !== totalChildren) {
      toast.error(
        `${totalChildren - assignedCounts.children} child(ren) not assigned`
      );
      return;
    }

    const roomsPayload = localRooms.map((room) => ({
      adults: room.adults,
      kids: room.children,
      babies: room.babies,
    }));

    dispatch(
      setHotelRoomDraft({
        dayNumber,
        hotelId: activeHotelId,
        rooms: roomsPayload,
      })
    );

    draftsRef.current[activeHotelId] = localRooms;

    setTimeout(() => dispatch(calculateTotal()), 50);
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
    activeHotelId,
    dayNumber,
    setIsFlipped,
    setSelectedAccommodation,
  ]);

  const cancelRoomSelection = useCallback(() => {
    setIsFlipped(false);
    setSelectedAccommodation(null);

    const savedDraft = getDraftForHotel(activeHotelId);
    if (savedDraft.length > 0) {
      setLocalRooms(savedDraft);
    } else {
      setLocalRooms([{ id: 1, adults: 1, children: 0, babies: 0 }]);
    }
  }, [activeHotelId, getDraftForHotel, setIsFlipped, setSelectedAccommodation]);

  // ─── Cars ──────────────────────────────────────────────────────────────────

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
      if (selectedCars.length >= numAdults) {
        toast.error(`Maximum ${numAdults} cars allowed`);
        return;
      }

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
    [handleTransferClick, index, selectedCars.length, numAdults]
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
    setTimeout(() => dispatch(calculateTotal()), 50);
  };

  const selectedHotelData =
    hotel.accommodation?.find(
      (h) => String(h.id || h.hotel_id || "") === activeHotelId
    ) ||
    activeAccommodations?.[index] ||
    null;

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

    return carsSource.length === 1
      ? `${firstName}${firstCar.withDriver ? " + Driver" : ""}`
      : `${firstName} + ${carsSource.length - 1} more`;
  })();

  const isMaxCarsReached = selectedCars.length >= numAdults;
  const savedRoomsCount = getStoredRoomsCountForHotel(activeHotelId);
  const hasRoomsConfigured = activeHotelId && savedRoomsCount > 0;

  // ─── Render ────────────────────────────────────────────────────────────────

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
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${
                  isGuideSelected
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
                onClick={handleTourGuideToggle}
              >
                <FaUserTie size={10} />
                {isGuideSelected ? "Guide ✓" : "Guide Available"}
              </span>
            )}
          </div>

          <h3>{hotel.date}</h3>

          <div className="day-details-div">
            <p className="feat_tour">
              <span className="icon"></span>
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
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/600x400")
                  }
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
                        handleAccommodationClick={onHotelCardClick}
                        handleFlip={() => {
                          setSelectedAccommodation({
                            ...item,
                            dayIndex: index,
                          });
                          setIsFlipped(true);
                        }}
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
                        maxRooms={maxRooms}
                        hasRoomsConfigured={
                          String(item.id || item.hotel_id || "") ===
                            activeHotelId && hasRoomsConfigured
                        }
                        savedRoomsCount={getStoredRoomsCountForHotel(
                          String(item.id || item.hotel_id || "")
                        )}
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

            <div className="day-section-bg" data-cars={`day-${dayNumber}`}>
              <p className="section-title !text-[22px]">
                <MdEmojiTransportation /> {t("cars")}
              </p>

              <div className="flex items-center gap-2 px-4 py-2 rounded-lg mb-3 bg-gray-50 border border-gray-200">
                <span className="text-gray-500 text-sm">🚗</span>
                <span className="text-xs text-gray-600">
                  {selectedCars.length}/{numAdults} cars selected (max 1 per
                  adult)
                </span>
              </div>

              {selectedCars.length > 0 && (
                <div
                  className={`flex items-center justify-between px-4 py-3 rounded-xl mb-4 border ${
                    isCapacitySufficient
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="text-sm">
                    <span className="font-semibold">
                      {selectedCars.length}{" "}
                      {selectedCars.length === 1 ? "car" : "cars"}
                    </span>
                    <span className="text-gray-500 mx-1">•</span>
                    <span>Capacity: {totalCarCapacity} seats</span>
                  </div>
                  <div className="text-sm">
                    <span
                      className={`font-semibold ${
                        isCapacitySufficient ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {totalPassengers} people
                    </span>
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
                          src={car.carData?.image}
                          alt=""
                          className="w-[60px] h-[40px] object-cover rounded-lg"
                          onError={(e) =>
                            (e.target.src = "https://via.placeholder.com/60x40")
                          }
                        />
                        <div>
                          <p className="text-sm font-semibold mb-0">
                            {car.carData?.name?.en || `Car ${carIdx + 1}`}
                          </p>
                          <p className="text-xs text-gray-500 mb-0">
                            Capacity: {parseInt(car.carData?.capacity || 0)}{" "}
                            seats
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
                              ? "bg-[#295557] text-white"
                              : "bg-white text-gray-600"
                          }`}
                        >
                          <FaUserTie size={10} /> Driver
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCar(car.id);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"
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
                  {hotel.transfers?.map((item) => (
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
                        disabled={isMaxCarsReached}
                        className={`absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full shadow-lg ${
                          isMaxCarsReached
                            ? "bg-gray-300 text-gray-500"
                            : "bg-[#295557] text-white"
                        }`}
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

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
