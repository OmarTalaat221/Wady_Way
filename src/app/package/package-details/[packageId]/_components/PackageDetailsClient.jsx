"use client";
import React, { useEffect, useState, Suspense, useRef } from "react";
import dynamic from "next/dynamic";
import { FaCalendar, FaHotel, FaCar, FaMapMarkerAlt } from "react-icons/fa";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useDispatch, useSelector } from "react-redux";
import {
  setTourData,
  setTourInfo,
  setPeopleCount,
  selectHotel,
  calculateTotal,
  refreshUserId,
  initializeTourGuide,
  initializeActivities,
  restoreSavedSelections,
  setDayCars,
} from "@/lib/redux/slices/tourReservationSlice";
import useTourDetails from "../../../../../hooks/useTourDetails";
import LoadingSpinner from "../../../../../components/common/LoadingSpinner";
import Breadcrumb from "@/components/common/Breadcrumb";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import PackageInfo from "./PackageInfo";
import IncludedExcluded from "./IncludedExcluded";
import TourHighlights from "./TourHighlights";
import ItineraryDay from "./ItineraryDay";
import TourMapWrapper from "./TourMapWrapper";
import useInviteCode, { INVITE_CODE_TYPES } from "@/hooks/useInviteCode";
import "./style.css";

const formatDateLocal = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const GallerySection = dynamic(() => import("./GallerySection"), {
  loading: () => (
    <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
  ),
  ssr: false,
});
const Reviews = dynamic(() => import("./Reviews"), {
  loading: () => (
    <div className="h-40 bg-gray-200 animate-pulse rounded-lg"></div>
  ),
});
const BookingSidebar = dynamic(() => import("./BookingSidebar"), {
  loading: () => (
    <div className="bg-gray-100 p-6 rounded-lg animate-pulse">...</div>
  ),
});
const Modals = dynamic(() => import("./Modals"), { ssr: false });

const PackageDetailsClient = () => {
  const { packageId } = useParams();
  const t = useTranslations("packageDetails");
  const locale = useLocale();
  const dispatch = useDispatch();
  const { tourData, loading, error } = useTourDetails(packageId);

  const selectedByDay = useSelector(
    (state) => state.tourReservation?.selectedByDay || {}
  );

  const restoredAdults = useSelector(
    (state) => state.tourReservation?.numAdults || 1
  );
  const restoredChildren = useSelector(
    (state) => state.tourReservation?.numChildren || 0
  );
  const restoredInfants = useSelector(
    (state) => state.tourReservation?.numInfants || 0
  );

  const [isOpen, setOpen] = useState(false);
  const [mapModal, setMapModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [people, setPeople] = useState({ adults: 1, children: 0, infants: 0 });
  const [isOpenimg, setOpenimg] = useState({
    openingState: false,
    openingIndex: 0,
  });

  const [activeAccommodations, setActiveAccommodations] = useState({});
  const [activeTransfers, setActiveTransfers] = useState({});
  const [selectedTours, setSelectedTours] = useState({
    title: "",
    hotels: [],
    transfers: [],
    activities: [],
  });
  const [hasRestored, setHasRestored] = useState(false);

  const peopleHydratedRef = useRef(false);
  const initRef = useRef(false);

  const { inviteCode, hasStoredCode } = useInviteCode(
    INVITE_CODE_TYPES.TOUR,
    packageId
  );

  useEffect(() => {
    initRef.current = false;
    peopleHydratedRef.current = false;
  }, [packageId]);

  const today = new Date();
  const oneDayLater = new Date(today);
  oneDayLater.setDate(today.getDate() + 1);

  const calculateEndDate = (startDate, days) => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (days || 3) - 1);
    return endDate;
  };

  const [dateValue, setDateValue] = useState([
    oneDayLater,
    calculateEndDate(oneDayLater, tourData?.itinerary?.length),
  ]);

  const formatDate = (date) =>
    date.toLocaleString("en-US", {
      timeZone: "Africa/Cairo",
      month: "short",
      day: "numeric",
    });

  const formattedDate = (date) =>
    date instanceof Date && !isNaN(date)
      ? date.toLocaleDateString("en-US", {
          timeZone: "Africa/Cairo",
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      : "Invalid Date";

  useEffect(() => {
    initRef.current = false;
  }, [packageId]);

  useEffect(() => {
    dispatch(refreshUserId());
    if (packageId) {
      dispatch(restoreSavedSelections(packageId));
      setHasRestored(true);
    }

    return () => {
      import("@/lib/redux/slices/tourReservationSlice").then((module) => {
        dispatch(module.clearCurrentTourData());
      });
    };
  }, [dispatch, packageId]);

  useEffect(() => {
    if (!hasRestored) return;
    if (peopleHydratedRef.current) return;

    const nextPeople = {
      adults: restoredAdults || 1,
      children: restoredChildren || 0,
      infants: restoredInfants || 0,
    };

    setPeople((prev) => {
      const isSame =
        prev.adults === nextPeople.adults &&
        prev.children === nextPeople.children &&
        prev.infants === nextPeople.infants;

      return isSame ? prev : nextPeople;
    });

    peopleHydratedRef.current = true;
  }, [hasRestored, restoredAdults, restoredChildren, restoredInfants]);

  const transformedData = React.useMemo(() => {
    if (!tourData) return null;

    const getYouTubeVideoId = (videoInput) => {
      if (!videoInput) return null;

      if (
        videoInput.length === 11 &&
        !videoInput.includes("/") &&
        !videoInput.includes(".")
      ) {
        return videoInput;
      }

      const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
        /(?:youtube\.com\/embed\/)([^?\s]+)/,
        /(?:youtu\.be\/)([^?\s]+)/,
        /(?:youtube\.com\/v\/)([^?\s]+)/,
        /(?:youtube\.com\/shorts\/)([^?\s]+)/,
      ];

      for (const pattern of patterns) {
        const match = videoInput.match(pattern);
        if (match && match[1]) return match[1];
      }

      return videoInput;
    };

    const images =
      tourData.gallery?.map((img, index) => ({
        id: index + 1,
        imageBig: img.image,
      })) || [];

    const days =
      tourData.itinerary?.map((day, index) => {
        const dayDate = new Date(dateValue[0]);
        dayDate.setDate(dayDate.getDate() + index);

        return {
          day: day.day,
          isTourguide: day.isTourguide,
          guide_price: day.guide_price,
          date: formattedDate(dayDate),
          location: { en: day.title, ar: day.title },
          description: { en: day.description, ar: day.description },
          accommodation:
            day.hotel_options?.map((hotel) => ({
              id: parseInt(hotel.hotel_id),
              image: hotel.image?.split("//CAMP//")[0] || hotel.image,
              name: { en: hotel.title, ar: hotel.title },
              category: { en: "Hotel", ar: "فندق" },
              check_in_out: "15:00 / 11:00",
              location: { en: "City center", ar: "مركز المدينة" },
              parking: { en: "Available", ar: "متوفر" },
              price_per_night: parseFloat(hotel.adult_price || 0),
              per_room: parseInt(hotel.per_room || 6),

              rating: 4.5,
              reviews: 100,
              amenities: hotel.amenities || [],
              originalData: hotel,
            })) || [],
          transfers:
            day.cars_options?.map((car) => ({
              id: parseInt(car.car_id),
              image: car.image?.split("//CAMP//")[0] || car.image,
              name: { en: car.title, ar: car.title },
              category: { en: "Car", ar: "سيارة" },
              price: parseFloat(car.price_current || 0),
              price_current: parseFloat(car.price_current || 0),
              capacity: car.max_people,
              features: car.features || [],
              originalData: car,
            })) || [],
          activities:
            day.activities_options?.map((activity) => ({
              id: parseInt(activity.activity_id),
              activity_id: parseInt(activity.activity_id),
              title: { en: activity.title, ar: activity.title },
              duration: { en: "2 hours", ar: "ساعتان" },
              difficulty: { en: "Moderate", ar: "متوسط" },
              image: activity.image?.split("//CAMP//")[0] || activity.image,
              price: parseFloat(activity.price_current || 0),
              price_current: parseFloat(activity.price_current || 0),
              features: activity.features || [],
              originalData: activity,
            })) || [],
        };
      }) || [];

    return {
      ...tourData,
      images,
      days,
      videoId: getYouTubeVideoId(tourData.video_link),
    };
  }, [tourData, dateValue]);

  const mapHotelForRedux = React.useCallback((accommodation) => {
    return {
      id: accommodation.id,
      hotel_id: accommodation.id,
      title: accommodation.name?.en || accommodation.name,
      name: accommodation.name,
      image: accommodation.image,
      adult_price: accommodation.price_per_night,
      price_per_night: accommodation.price_per_night,
      rating: accommodation.rating,
      category: accommodation.category,
      location: accommodation.location,
      check_in_out: accommodation.check_in_out,
      ...accommodation.originalData,
    };
  }, []);

  const mapCarForRedux = React.useCallback((transfer, withDriver = false) => {
    return {
      id: transfer.id,
      car_id: transfer.id,
      title: transfer.name?.en || transfer.name,
      name: transfer.name,
      image: transfer.image,
      price_current: transfer.price,
      price: transfer.price,
      capacity: transfer.capacity,
      category: transfer.category,
      withDriver,
      ...transfer.originalData,
    };
  }, []);

  const calculatePriceDifference = (selectedPrice, defaultPrice) =>
    defaultPrice - (selectedPrice || defaultPrice);

  const handleAccommodationClick = (accommodation, dayIndex) => {
    if (activeAccommodations[dayIndex]?.id === accommodation.id) return;

    const dayNumber = dayIndex + 1;

    setActiveAccommodations((prev) => ({
      ...prev,
      [dayIndex]: accommodation,
    }));

    setSelectedTours((prevState) => ({
      ...prevState,
      hotels: [
        ...prevState.hotels.filter((h) => h.day !== dayNumber),
        {
          day: dayNumber,
          name: accommodation.name,
          id: accommodation.id,
          price: accommodation.price_per_night,
          location: accommodation.location,
        },
      ],
    }));

    dispatch(
      selectHotel({
        day: dayNumber,
        hotel: mapHotelForRedux(accommodation),
      })
    );

    dispatch(calculateTotal());

    const totalTravelers = people.adults + people.children;
    if (totalTravelers >= 3 || people.infants > 0) {
      setSelectedAccommodation({ ...accommodation, dayIndex });
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
      setSelectedAccommodation(null);
    }
  };

  const handleTransferClick = (transfer, dayIndex) => {
    const dayNumber = dayIndex + 1;

    setActiveTransfers((prev) => ({ ...prev, [dayIndex]: transfer }));

    setSelectedTours((prevState) => ({
      ...prevState,
      transfers: [
        ...prevState.transfers.filter((t) => t.day !== dayNumber),
        {
          day: dayNumber,
          name: transfer.name,
          id: transfer.id,
          price: transfer.price,
        },
      ],
    }));
  };

  const handleDateChange = (newValue) => {
    const [start] = newValue;
    const duration = transformedData?.days?.length || 3;
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);

    setDateValue([start, end]);

    dispatch(
      setTourInfo({
        startDate: formatDateLocal(start),
        endDate: formatDateLocal(end),
      })
    );
  };

  const scrollToDiv = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (!hasRestored) return;

    const reduxMatchesLocal =
      people.adults === restoredAdults &&
      people.children === restoredChildren &&
      people.infants === restoredInfants;

    if (!reduxMatchesLocal) {
      dispatch(
        setPeopleCount({
          adults: people.adults,
          children: people.children,
          infants: people.infants,
        })
      );
    }

    dispatch(calculateTotal());
    setIsFlipped(false);
    setSelectedAccommodation(null);
  }, [
    people,
    dispatch,
    hasRestored,
    restoredAdults,
    restoredChildren,
    restoredInfants,
  ]);

  useEffect(() => {
    if (!hasRestored || !tourData?.itinerary?.length || !transformedData)
      return;
    if (initRef.current) return;

    console.log("🚀 Starting initialization for tour:", packageId);
    initRef.current = true;

    // setTourData will:
    // 1. Reset selectedByDay/tourGuideByDay if switching tours
    // 2. Sanitize stale day entries immediately
    dispatch(setTourData(transformedData));

    // These will also call sanitizeDaysToItinerary internally
    dispatch(initializeTourGuide(tourData.itinerary));
    dispatch(initializeActivities(tourData.itinerary));

    const restoredHotels = [];
    const restoredTransfers = [];
    const restoredActiveAcc = {};
    const restoredActiveTransfers = {};

    transformedData.days.forEach((day, index) => {
      const dayNumber = index + 1;
      const dayKey = String(dayNumber);
      const savedDay = selectedByDay?.[dayKey] || {};

      // ── HOTEL ─────────────────────────────────────────────────────────
      const savedHotel = savedDay?.hotel;
      const savedHotelId = parseInt(savedHotel?.id || savedHotel?.hotel_id);
      const matchedHotel = savedHotelId
        ? day.accommodation?.find((a) => a.id === savedHotelId)
        : null;
      const finalHotel = matchedHotel || day.accommodation?.[0] || null;

      if (finalHotel) {
        restoredActiveAcc[index] = finalHotel;
        restoredHotels.push({
          day: dayNumber,
          name: finalHotel.name,
          id: finalHotel.id,
          price: finalHotel.price_per_night,
          location: finalHotel.location,
        });

        if (!savedHotel || !matchedHotel) {
          dispatch(
            selectHotel({ day: dayNumber, hotel: mapHotelForRedux(finalHotel) })
          );
        }
      }

      // ── CARS ──────────────────────────────────────────────────────────
      const savedCars = Array.isArray(savedDay?.cars)
        ? savedDay.cars
        : savedDay?.car
          ? [savedDay.car]
          : [];
      const firstSavedCarId = parseInt(
        savedCars[0]?.id || savedCars[0]?.car_id
      );
      const matchedTransfer = firstSavedCarId
        ? day.transfers?.find((t) => t.id === firstSavedCarId)
        : null;
      const finalTransfer = matchedTransfer || day.transfers?.[0] || null;

      if (finalTransfer) {
        restoredActiveTransfers[index] = finalTransfer;
        restoredTransfers.push({
          day: dayNumber,
          name: finalTransfer.name,
          id: finalTransfer.id,
          price: finalTransfer.price,
        });

        if (!savedCars.length || !matchedTransfer) {
          dispatch(
            setDayCars({
              day: dayNumber,
              cars: [mapCarForRedux(finalTransfer, false)],
            })
          );
        }
      }
    });

    setActiveAccommodations(restoredActiveAcc);
    setActiveTransfers(restoredActiveTransfers);
    setSelectedTours((prev) => ({
      ...prev,
      title: transformedData.title,
      hotels: restoredHotels,
      transfers: restoredTransfers,
    }));

    setTimeout(() => dispatch(calculateTotal()), 100);
  }, [
    hasRestored,
    transformedData,
    tourData,
    selectedByDay,
    dispatch,
    mapHotelForRedux,
    mapCarForRedux,
  ]);

  useEffect(() => {
    if (tourData?.itinerary?.length) {
      const newEndDate = calculateEndDate(
        dateValue[0],
        tourData.itinerary.length
      );
      setDateValue([dateValue[0], newEndDate]);

      dispatch(
        setTourInfo({
          startDate: formatDateLocal(dateValue[0]),
          endDate: formatDateLocal(newEndDate),
        })
      );
    }
  }, [tourData?.itinerary?.length]); // eslint-disable-line

  const items = React.useMemo(() => {
    if (!transformedData) return [];

    return [
      {
        key: "3",
        label: { en: "Hotels", ar: "الفنادق" },
        children: transformedData.days
          .map((day, index) => {
            const dayNumber = index + 1;
            const savedDay = selectedByDay?.[String(dayNumber)] || {};
            const hotelId = parseInt(
              savedDay?.hotel?.id || savedDay?.hotel?.hotel_id
            );
            const hotel = hotelId
              ? day.accommodation?.find((h) => h.id === hotelId)
              : null;

            return {
              title: { en: `Day ${dayNumber}`, ar: `اليوم ${dayNumber}` },
              icon: <FaCalendar />,
              children: [
                { title: day.location, icon: <FaMapMarkerAlt /> },
                hotel
                  ? {
                      title: {
                        en: hotel.name?.en,
                        ar: hotel.name?.ar,
                      },
                      icon: <FaHotel />,
                    }
                  : null,
              ].filter(Boolean),
            };
          })
          .filter((d) => d.children.length > 0),
      },
      {
        key: "4",
        label: { en: "Transfers", ar: "المواصلات" },
        children: transformedData.days
          .map((day, index) => {
            const dayNumber = index + 1;
            const savedDay = selectedByDay?.[String(dayNumber)] || {};
            const cars = Array.isArray(savedDay.cars)
              ? savedDay.cars
              : savedDay.car
                ? [savedDay.car]
                : [];

            return {
              title: { en: `Day ${dayNumber}`, ar: `اليوم ${dayNumber}` },
              icon: <FaCalendar />,
              children: cars.map((car, carIndex) => {
                const matched = day.transfers?.find(
                  (t) => t.id === parseInt(car.id || car.car_id)
                );

                const carNameEn =
                  matched?.name?.en ||
                  car?.name?.en ||
                  car?.title ||
                  `Car ${carIndex + 1}`;

                const carNameAr =
                  matched?.name?.ar ||
                  car?.name?.ar ||
                  car?.title ||
                  `سيارة ${carIndex + 1}`;

                return {
                  title: {
                    en: `${carNameEn}${car.withDriver ? " + Driver" : ""}`,
                    ar: `${carNameAr}${car.withDriver ? " + سائق" : ""}`,
                  },
                  icon: <FaCar />,
                };
              }),
            };
          })
          .filter((d) => d.children.length > 0),
      },
    ];
  }, [transformedData, selectedByDay]);

  if (loading)
    return (
      <div className="min-h-screen">
        <LoadingSpinner />
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto text-center py-8">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p>{error}</p>
      </div>
    );

  if (!transformedData)
    return (
      <div className="container mx-auto text-center py-8">
        <h2 className="text-2xl font-bold">No Data</h2>
      </div>
    );

  const formattedRange = `${formatDate(dateValue[0])} - ${formatDate(
    dateValue[1]
  )}`;

  return (
    <>
      <Breadcrumb
        pagename={transformedData.title}
        pagetitle={transformedData.title}
      />

      <div className="package-details-area pt-120 mb-120 position-relative">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <Suspense
                fallback={
                  <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
                }
              >
                <GallerySection
                  images={transformedData.images}
                  videoId={transformedData.videoId}
                  setOpenimg={setOpenimg}
                  isOpenimg={isOpenimg}
                  isOpen={isOpen}
                  setOpen={setOpen}
                />
              </Suspense>
            </div>
          </div>

          <div className="row g-xl-4 gy-5">
            <div className="col-xl-8">
              <PackageInfo tourData={transformedData} />
              <IncludedExcluded
                includes={transformedData.includes}
                excludes={transformedData.excludes}
              />
              <TourHighlights highlights={transformedData.highlights} />

              <div className="itinerary-container">
                {transformedData.days.map((dayData, index) => (
                  <ItineraryDay
                    key={index}
                    hotel={dayData}
                    index={index}
                    days={transformedData.days}
                    locale={locale}
                    selectedTours={selectedTours}
                    setSelectedTours={setSelectedTours}
                    activeAccommodations={activeAccommodations}
                    activeTransfers={activeTransfers}
                    isFlipped={isFlipped}
                    setIsFlipped={setIsFlipped}
                    selectedAccommodation={selectedAccommodation}
                    setSelectedAccommodation={setSelectedAccommodation}
                    handleAccommodationClick={handleAccommodationClick}
                    handleTransferClick={handleTransferClick}
                    setMapModal={setMapModal}
                    people={people}
                    calculatePriceDifference={calculatePriceDifference}
                  />
                ))}
              </div>

              <div className="tour-location">
                <h4
                  className="mb-4"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#333",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="#295557"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {t("locationMap")}
                </h4>

                <TourMapWrapper
                  itinerary={tourData?.itinerary || []}
                  height="450px"
                  className="mb-30"
                />
              </div>

              <Suspense
                fallback={
                  <div className="h-40 bg-gray-200 animate-pulse rounded-lg"></div>
                }
              >
                <Reviews
                  data={{
                    reviews: tourData?.reviews || [],
                    num_of_reviews: tourData?.num_of_reviews || 0,
                    avg_rate: tourData?.avg_rate || 0,
                  }}
                />
              </Suspense>
            </div>

            <div
              className="col-xl-4"
              style={{ position: "sticky", top: "90px", height: "100vh" }}
            >
              <Suspense
                fallback={
                  <div className="bg-gray-100 p-6 rounded-lg animate-pulse">
                    ...
                  </div>
                }
              >
                <BookingSidebar
                  dateValue={dateValue}
                  handleDateChange={handleDateChange}
                  formattedRange={formattedRange}
                  people={people}
                  setPeople={setPeople}
                  items={items}
                  scrollToDiv={scrollToDiv}
                  packageId={packageId}
                  tourData={transformedData}
                  selectedTours={selectedTours}
                  inviteCode={inviteCode}
                  hasInviteCode={hasStoredCode}
                />
              </Suspense>
            </div>
          </div>
        </div>

        <Suspense fallback={null}>
          <Modals mapModal={mapModal} setMapModal={setMapModal} />
        </Suspense>
      </div>

      <Newslatter />
      <Footer />
    </>
  );
};

export default PackageDetailsClient;
